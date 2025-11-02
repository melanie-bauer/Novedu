param openWebUIName string
param liteLLMName string
param openWebUIImage string
param liteLLMImage string
param envId string              // ID des neuen Environments (Output aus containerEnv)
param userIdentityResourceId string
param keyVaultName string
param azureOpenAIBaseUrl string
param azureOpenAIApiVersion string
param location string

// DB-Parameter
param pgHost string
param pgDatabase string
param pgPort int = 5432
@secure()
param pgUser string
@secure()
param pgPassword string

// ===== Open WebUI =====
resource openWebUIApp 'Microsoft.App/containerApps@2025-07-01' = {
  name: openWebUIName
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userIdentityResourceId}': {}
    }
  }
  properties: {
    environmentId: envId
    configuration: {
      ingress: {
        external: true
        targetPort: 8080
        transport: 'auto'
      }
      secrets: [
        {
          name: 'azure-openai-key'
          keyVaultUrl: 'https://${keyVaultName}.vault.azure.net/secrets/AzureOpenAIKey'
          identity: userIdentityResourceId
        }
      ]
      registries: []
      activeRevisionsMode: 'Single'
      env: [
        { name: 'AZURE_API_BASE', value: azureOpenAIBaseUrl }
        { name: 'AZURE_API_VERSION', value: azureOpenAIApiVersion }
      ]
      storage: [
        {
          name: 'openwebui-data'
          storageType: 'AzureFile'
          storageName: 'openwebui-data'
          // Volumemount im Container s.u.
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'openwebui'
          image: openWebUIImage
          resources: { cpu: 1, memory: '2Gi' }
          volumeMounts: [
            { volumeName: 'openwebui-data', mountPath: '/app/backend/data' }
          ]
        }
      ]
      scale: { minReplicas: 1, maxReplicas: 1 }
    }
  }
}

// ===== LiteLLM Proxy =====
resource liteLLMApp 'Microsoft.App/containerApps@2025-07-01' = {
  name: liteLLMName
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userIdentityResourceId}': {}
    }
  }
  properties: {
    environmentId: envId
    configuration: {
      ingress: {
        external: true
        targetPort: 4000
        transport: 'auto'
      }
      secrets: [
        {
          name: 'azure-openai-key'
          keyVaultUrl: 'https://${keyVaultName}.vault.azure.net/secrets/AzureOpenAIKey'
          identity: userIdentityResourceId
        }
        { name: 'PG_USER', value: pgUser }
        { name: 'PG_PASSWORD', value: pgPassword }
      ]
      env: [
        { name: 'AZURE_API_BASE', value: azureOpenAIBaseUrl }
        { name: 'AZURE_API_KEY', secretRef: 'azure-openai-key' }
        { name: 'DATABASE_URL', value: 'postgresql://${pgUser}:${pgPassword}@${pgHost}:${pgPort}/${pgDatabase}?sslmode=require' }
        { name: 'PGHOST', value: pgHost }
        { name: 'PGDATABASE', value: pgDatabase }
        { name: 'PGPORT', value: string(pgPort) }
        { name: 'PGSSLMODE', value: 'require' }
        { name: 'PGUSER', secretRef: 'PG_USER' }
        { name: 'PGPASSWORD', secretRef: 'PG_PASSWORD' }
      ]
      storage: [
        {
          name: 'litellm-config'
          storageType: 'AzureFile'
          storageName: 'litellm-config'
        }
      ]
      activeRevisionsMode: 'Single'
      registries: []
    }
    template: {
      containers: [
        {
          name: 'litellm-proxy'
          image: liteLLMImage
          resources: { cpu: 1, memory: '2Gi' }
          volumeMounts: [
            { volumeName: 'litellm-config', mountPath: '/app/config' }
          ]
        }
      ]
      scale: { minReplicas: 1, maxReplicas: 1 }
    }
  }
}
