param openWebUIName string
param liteLLMName string
param openWebUIImage string
param liteLLMImage string
param envId string // Resource ID der Container Apps Environment
param userIdentityResourceId string // Resource ID der User-Assigned Managed Identity
param keyVaultName string
param azureOpenAIBaseUrl string
param azureOpenAIApiVersion string
param location string

// DB-Parameter
param pgHost string
param pgPort int = 5432

// Open WebUI Container App (öffentlich erreichbar)
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
    managedEnvironmentId: envId
    configuration: {
      ingress: {
        external: true          // öffentlich zugänglich
        targetPort: 8080        // Open WebUI hört auf Port 8080
        transport: 'auto'
      }
      secrets: [
        {
          name: 'azure-openai-key'
          // Verweis auf Key Vault Secret (neueste Version)
          keyVaultUrl: 'https://${keyVaultName}.vault.azure.net/secrets/AzureOpenAIKey'
          identity: userIdentityResourceId
        }
        {
          name: 'openid-client-id'
          keyVaultUrl: 'https://${keyVaultName}.vault.azure.net/secrets/OpenIDClientId'
          identity: userIdentityResourceId
        }
        {
          name: 'openid-client-secret'
          keyVaultUrl: 'https://${keyVaultName}.vault.azure.net/secrets/OpenIDClientSecret'
          identity: userIdentityResourceId
        }
        {
          name: 'webui-secret-key'
          keyVaultUrl: 'https://${keyVaultName}.vault.azure.net/secrets/WebUISecretKey'
          identity: userIdentityResourceId
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'openwebui'
          image: openWebUIImage
          resources: {
            cpu: 1
            memory: '2.0Gi'
          }
          env: [
            // Configure Open WebUI to use LiteLLM via the proxy URL and forward user info
            { name: 'OPENAI_API_BASE_URL', value: 'http://${liteLLMName}:4000' }
            { name: 'OPENAI_API_KEY', secretRef: 'azure-openai-key' }
            { name: 'OPENAI_API_VERSION', value: azureOpenAIApiVersion }
            { name: 'ENABLE_FORWARD_USER_INFO_HEADERS', value: 'true' }
            { name: 'ENABLE_GROUPS', value: 'true' }
            { name: 'ENABLE_ADVANCED_PERMISSIONS', value: 'true' }
            { name: 'ENABLE_OAUTH_SIGNUP', value: 'true' }
            { name: 'ENABLE_MICROSOFT_GROUP_MANAGEMENT', value: 'true' }
            { name: 'MICROSOFT_EMAIL_CLAIM', value: 'email' }
            { name: 'MICROSOFT_GROUPS_CLAIM', value: 'groups' }
            { name: 'OAUTH_USERNAME_CLAIM', value: 'name' }
            { name: 'ENABLE_SIGNUP', value: 'false' }
            { name: 'ENABLE_OAUTH_ROLE_MANAGEMENT', value: 'true' }
            { name: 'OAUTH_ROLES_CLAIM', value: 'roles' }
            { name: 'OAUTH_GROUP_CLAIM', value: 'groups' }
            { name: 'ENABLE_OAUTH_GROUP_CREATION', value: 'true' }
            { name: 'OPENID_PROVIDER_URL', value: 'https://login.microsoftonline.com/91fc072c-edef-4f97-bdc5-cfb67718ae3a/v2.0/.well-known/openid-configuration'}
            { name: 'MICROSOFT_CLIENT_ID', secretRef: 'openid-client-id' }
            { name: 'MICROSOFT_CLIENT_SECRET', secretRef: 'openid-client-secret' }
            { name: 'MICROSOFT_CLIENT_TENANT_ID', value: '91fc072c-edef-4f97-bdc5-cfb67718ae3a'}
            { name: 'MICROSOFT_OAUTH_SCOPES', value: 'openid email profile User.Read GroupMember.Read.All'}
            { name: 'MICROSOFT_REDIRECT_URI', value: 'https://openwebui-app.gentleisland-b1776130.swedencentral.azurecontainerapps.io/oauth/microsoft/callback'}
            { name: 'OPENID_REDIRECT_URI', value: 'https://openwebui-app.gentleisland-b1776130.swedencentral.azurecontainerapps.io/oauth/microsoft/callback'}
            { name: 'WEBUI_SECRET_KEY', secretRef:'webui-secret-key'}
            { name: 'ENABLE_OAUTH_PERSISTENT_CONFIG', value: 'false' }
            { name: 'WEBUI_URL', value: 'https://openwebui-app.gentleisland-b1776130.swedencentral.azurecontainerapps.io' }
            { name: 'ENABLE_LOGIN_FORM', value: 'true'}
            { name: 'OAUTH_MERGE_ACCOUNTS_BY_EMAIL', value: 'true'}
            { name: 'WEBUI_SESSION_COOKIE_SAME_SITE', value: 'lax'}
            { name: 'WEBUI_AUTH_COOKIE_SAME_SITE', value: 'lax'}
            { name: 'WEBUI_SESSION_COOKIE_SECURE', value: 'true'}
            { name: 'WEBUI_AUTH_COOKIE_SECURE', value: 'true'}
            { name: 'GLOBAL_LOG_LEVEL', value: 'DEBUG'}
            { name: 'DEFAULT_USER_ROLE', value: 'user'}
            { name: 'ENABLE_USER_AUTO_VERIFY', value: 'true' }
          ]
          volumeMounts: [
            {
              volumeName: 'openwebui-files'
              mountPath: '/app/backend/data'
            }
          ]
        }
      ]
      volumes: [
        {
          name: 'openwebui-files'
          storageType: 'AzureFile'
          storageName: 'openwebui-files'  // entspricht dem envStorage-Namen in containerEnv.bicep
          mountOptions: 'nobrl'           // empfohlen für Azure Files bei SQLite
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 1
      }
    }
  }
}

// LiteLLM Container App (internal, not exposed publicly)
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
    managedEnvironmentId: envId
    configuration: {
      ingress: {
        external: true 
        targetPort: 4000
        transport: 'auto'
      }
      secrets: [
        {
          name: 'openai-key'
          keyVaultUrl: 'https://${keyVaultName}.vault.azure.net/secrets/OpenAIKey'
          identity: userIdentityResourceId
        }
        {
          name: 'anthropic-key'
          keyVaultUrl: 'https://${keyVaultName}.vault.azure.net/secrets/AnthropicKey'
          identity: userIdentityResourceId
        }
        {
          name: 'azure-postgres-url'
          keyVaultUrl: 'https://${keyVaultName}.vault.azure.net/secrets/PostgresConnectionString'
          identity: userIdentityResourceId
        }
        {
          name: 'litellm-master-key'
          keyVaultUrl: 'https://${keyVaultName}.vault.azure.net/secrets/LiteLLMMasterKey'
          identity: userIdentityResourceId
        }
        {
          name: 'pg-password'
          keyVaultUrl: 'https://${keyVaultName}.vault.azure.net/secrets/PostgresPassword'
          identity: userIdentityResourceId
        }
        {
          name: 'pg-username'
          keyVaultUrl: 'https://${keyVaultName}.vault.azure.net/secrets/PostgresUsername'
          identity: userIdentityResourceId
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'litellm-proxy'
          image: liteLLMImage
          resources: {
            cpu: 1
            memory: '2.0Gi'
          }
          env: [
            // LiteLLM proxy reads these to connect to Azure OpenAI
            { name: 'OPENAI_API_KEY', secretRef: 'openai-key' }
            { name: 'ANTHROPIC_API_KEY', secretRef: 'anthropic-key' }
            { name: 'DATABASE_URL', secretRef: 'azure-postgres-url'}
            { name: 'LITELLM_MASTER_KEY', secretRef: 'litellm-master-key' }
            { name: 'PGHOST', value: pgHost }
            { name: 'PGDATABASE', value: 'postgres' }
            { name: 'PGPORT', value: string(pgPort) }
            { name: 'PGSSLMODE', value: 'require' }
            { name: 'PGUSER', secretRef: 'pg-username' }
            { name: 'PGPASSWORD', secretRef: 'pg-password' }
            { name: 'LITELLM_CONFIG', value: '/app/config/litellm_config.yaml' }
            { name: 'STORE_MODEL_IN_DB', value: 'false' }

          ]
          volumeMounts: [
            {
              volumeName: 'litellm-config'
              mountPath: '/app/config'
            }
          ]
        }
      ]
      volumes: [
        {
          name: 'litellm-config'
          storageType: 'AzureFile'
          storageName: 'litellm-config'
        }
      ]
      // no volume needed for LiteLLM in this prototype
      scale: {
        minReplicas: 1
        maxReplicas: 1
      }
    }
  }
}
