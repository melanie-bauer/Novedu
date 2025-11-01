// =====================
// PARAMETERS
// =====================
param acrName string
param workspaceName string
param storageAccountName string
param userIdentityName string
param azureOpenAIName string
param keyVaultName string
param envName string
param postgresServerName string

param postgresServerAdminLogin string
@secure()
param postgresServerAdminPassword string

param location string = resourceGroup().location
param adminObjectId string 

@secure()
param litellmMasterKey string

param createOpenAIModels bool = false
param createAzureOpenAI bool = false
param azureOpenAIApiVersion string

param openWebUIName string
param litellmName string
param openWebUIImage string
param litellmImage string

// =====================
// MODULES
// =====================

// ACR
module acrModule './modules/acr.bicep' = {
  name: 'deployAcr'
  params: {
    acrName: acrName
    location: location
  }
}

// Azure OpenAI
module azureOpenAIModule './modules/azureOpenAI.bicep' = if (createOpenAIModels) {
  name: 'deployAzureOpenAI'
  params: {
    openAIName: azureOpenAIName
    openAiApiVersion: azureOpenAIApiVersion
    createAzureOpenAI: createAzureOpenAI
    location: location
  }
}

// Log Analytics
module logsModule './modules/logAnalytics.bicep' = {
  name: 'deployLogAnalytics'
  params: {
    workspaceName: workspaceName
    location: location
  }
}

// Storage
module storageModule './modules/storage.bicep' = {
  name: 'deployStorage'
  params: {
    storageAccountName: storageAccountName
    location: location
  }
}

// =====================
// MANAGED IDENTITY
// =====================
resource userIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2018-11-30' = {
  name: userIdentityName
  location: location
}

// =====================
// KEY VAULT
// =====================
var azureOpenAIResourceId = resourceId('Microsoft.CognitiveServices/accounts', azureOpenAIName)
var azureOpenAIEndpointVal = !createAzureOpenAI 
  ? reference(azureOpenAIResourceId, azureOpenAIApiVersion, 'full').properties.endpoint 
  : azureOpenAIModule.outputs.azureOpenAIEndpoint
var azureOpenAIKeyVal = !createAzureOpenAI 
  ? listKeys(azureOpenAIResourceId, azureOpenAIApiVersion).key1 
  : azureOpenAIModule.outputs.azureOpenAIKey

module keyVaultModule './modules/keyVault.bicep' = {
  name: 'deployKeyVault'
  params: {
    keyVaultName: keyVaultName
    location: location
    openAIKeySecretValue: azureOpenAIKeyVal
    adminObjectId: adminObjectId
    managedIdentityObjectId: userIdentity.properties.principalId
    postgresPasswordSecretValue: postgresServerAdminPassword
    postgresUsernameSecretValue: postgresServerAdminLogin
    postgresURLSecretValue: 'postgresql://${postgresServerAdminLogin}:${postgresServerAdminPassword}@${postgresServerName}.postgres.database.azure.com:5432/${postgresServerName}?sslmode=require'
    litellmMasterKeySecretValue: litellmMasterKey
  }
}

module containerEnvModule './modules/containerEnv.bicep' = {
  name: 'deployContainerEnv'
  params: {
    envName: envName
    location: location
    logsCustomerId: logsModule.outputs.workspaceId
    logsKey: logsModule.outputs.workspaceKey
    storageAccountName: storageModule.outputs.storageAccountName
    storageAccountKey: storageModule.outputs.storageAccountKey
    openWebUIShareName: storageModule.outputs.openWebUIShareName
    liteLLMShareName: storageModule.outputs.litellmConfigShareName
  }
}

module postgresModule './modules/postgres.bicep' = {
  name: 'deployPostgres'
  params: {
    serverName: postgresServerName
    administratorLogin: postgresServerAdminLogin
    administratorLoginPassword: postgresServerAdminPassword
    location: location
    allowedClientIps: [containerEnvModule.outputs.outboundIpAddresses]
    publicNetworkAccess: 'Enabled'
  }
}


module containerAppsModule './modules/containerApps.bicep' = {
  name: 'deployContainerApps'
  params: {
    openWebUIName: openWebUIName
    liteLLMName: litellmName
    openWebUIImage: openWebUIImage
    liteLLMImage: litellmImage
    envId: containerEnvModule.outputs.environmentId
    userIdentityResourceId: userIdentity.id
    keyVaultName: keyVaultName
    azureOpenAIBaseUrl: azureOpenAIEndpointVal
    azureOpenAIApiVersion: azureOpenAIApiVersion
    location: location
    pgHost: postgresModule.outputs.postgresHost
    pgDatabase: postgresServerName
    pgUser: postgresServerAdminLogin
    pgPassword: postgresServerAdminPassword
  }
}
