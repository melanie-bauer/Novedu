param envName string
param location string
param logsCustomerId string
param logsKey string
param storageAccountName string
@secure()
param storageAccountKey string
param openWebUIShareName string
param liteLLMShareName string

param vnetName string
param subnetName string
param resourceGroupName string

// Reference existing VNet
resource vnet 'Microsoft.Network/virtualNetworks@2022-09-01' existing = {
  name: vnetName
  scope: resourceGroup(resourceGroupName)
}

// Reference existing subnet
resource subnet 'Microsoft.Network/virtualNetworks/subnets@2022-09-01' existing = {
  name: subnetName
  parent: vnet
}

// Add delegation if missing
resource delegatedSubnet 'Microsoft.Network/virtualNetworks/subnets@2022-09-01' = {
  name: subnetName
  parent: vnet
  properties: {
    addressPrefix: subnet.properties.addressPrefix
    delegations: [
      {
        name: 'delegation'
        properties: {
          serviceName: 'Microsoft.Web/managedEnvironments'
        }
      }
    ]
  }
}

// Create the Container Apps Managed Environment
resource containerEnv 'Microsoft.App/managedEnvironments@2025-07-01' = {
  name: envName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logsCustomerId
        sharedKey: logsKey
      }
    }
    vnetConfiguration: {
      infrastructureSubnetId: delegatedSubnet.id
    }
  }
  dependsOn: [
    delegatedSubnet
  ]
}

// Storage for OpenWebUI
resource envStorageOpenWebUI 'Microsoft.App/managedEnvironments/storages@2025-07-01' = {
  name: 'openwebui-files'
  parent: containerEnv
  properties: {
    azureFile: {
      accountName: storageAccountName
      shareName: openWebUIShareName
      accountKey: storageAccountKey
      accessMode: 'ReadWrite'
    }
  }
}

// Storage for LiteLLM
resource envStorageLiteLLM 'Microsoft.App/managedEnvironments/storages@2025-07-01' = {
  name: 'litellm-config'
  parent: containerEnv
  properties: {
    azureFile: {
      accountName: storageAccountName
      shareName: liteLLMShareName
      accountKey: storageAccountKey
      accessMode: 'ReadWrite'
    }
  }
}

output environmentId string = containerEnv.id
