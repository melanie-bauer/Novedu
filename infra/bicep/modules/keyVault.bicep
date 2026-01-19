param keyVaultName string
param location string
@secure()
param openAIKeySecretValue string // Azure OpenAI API-Schlüssel, der als Secret im Vault gespeichert wird
@secure()
param adminObjectId string // AAD Objekt-ID eines Administrators (Benutzer oder Gruppe) für Vault-Zugriff

@allowed([
  'User'
  'Group'
  'ServicePrincipal'
])
param adminPrincipalType string = 'User'

param managedIdentityObjectId string // Objekt-ID der User-Assigned Managed Identity (für Key Vault Leserechte)
@secure()
param postgresPasswordSecretValue string // Passwort für PostgreSQL-Datenbank, die als Secret im Vault gespeichert wird
@secure()
param postgresUsernameSecretValue string // Benutzername für PostgreSQL-Datenbank, die als Secret im Vault gespeichert wird
@secure()
param postgresURLSecretValue string // Verbindungs-URL für PostgreSQL-Datenbank, die als Secret im Vault gespeichert wird
@secure()
param litellmMasterKeySecretValue string
@secure() 
param openidClientIdSecretValue string
@secure()
param openidClientSecretValue string
@secure()
param webUISecretKeySecretValue string
@secure()
param openAiApiKey string
@secure()
param anthropicApiKey string

/*// Built-in role definitions (data plane) for Key Vault
resource kvSecretsOfficerRoleDef 'Microsoft.Authorization/roleDefinitions@2022-04-01' existing = {
  scope: subscription()
  // Key Vault Secrets Officer
  name: 'b86a8fe4-44ce-4948-aee5-eccb2c155cd7'
}

resource kvSecretsUserRoleDef 'Microsoft.Authorization/roleDefinitions@2022-04-01' existing = {
  scope: subscription()
  // Key Vault Secrets User
  name: '4633458b-17de-408a-b874-0445c86b69e6'
}

resource vault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    tenantId: subscription().tenantId
    sku: {
      name: 'standard'
      family: 'A'
    }

    enableRbacAuthorization: true

    // Keeping an empty array is a safe pattern for some schemas/API expectations
    accessPolicies: []

    enabledForTemplateDeployment: true
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
  }
}

// RBAC: Admin can manage secrets (get/list/set/delete, etc.)
resource adminSecretsOfficerAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(vault.id, adminObjectId, kvSecretsOfficerRoleDef.id)
  scope: vault
  properties: {
    roleDefinitionId: kvSecretsOfficerRoleDef.id
    principalId: adminObjectId
    principalType: adminPrincipalType
  }
}

// RBAC: Managed identity can read secrets (get/list)
resource miSecretsUserAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(vault.id, managedIdentityObjectId, kvSecretsUserRoleDef.id)
  scope: vault
  properties: {
    roleDefinitionId: kvSecretsUserRoleDef.id
    principalId: managedIdentityObjectId
    principalType: 'ServicePrincipal'
  }
}*/

resource vault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    tenantId: subscription().tenantId
    sku: {
      name: 'standard'
      family: 'A'
    }
    // Access Policies: Admin (voller Zugriff auf Secrets) und Managed Identity (Leserechte)
    accessPolicies: [
      {
        tenantId: subscription().tenantId
        objectId: adminObjectId
        permissions: {
          secrets: ['get', 'list', 'set', 'delete']
        }
      }
      {
        tenantId: subscription().tenantId
        objectId: managedIdentityObjectId
        permissions: {
          secrets: ['get', 'list']
        }
      }
    ]
    // ARM-Deployment darf auf den Vault zugreifen (für die Secret-Erstellung)
    enabledForTemplateDeployment: true
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
  }
}


// Speichert den OpenAI API Key als Secret im Key Vault
resource openAISecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: vault
  name: 'OpenAIKey'
  properties: {
    value: openAiApiKey
  }
}

resource azureOpenAISecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: vault
  name: 'AzureOpenAIKey'
  properties: {
    value: openAIKeySecretValue
  }
}

// Speichert den LibreChat Encryption Key als Secret im Key Vault
resource litellmMasterKeySecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: vault
  name: 'LiteLLMMasterKey'
  properties: {
    value: litellmMasterKeySecretValue
  }
}

resource postgresUsernameSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: vault
  name: 'PostgresUsername'
  properties: {
    value: postgresUsernameSecretValue
  }
}

resource postgresPasswordSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: vault
  name: 'PostgresPassword'
  properties: {
    value: postgresPasswordSecretValue
  }
}

resource postgresURLSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: vault
  name: 'PostgresConnectionString'
  properties: {
    value: postgresURLSecretValue
  }
}

resource openidClientIdSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: vault
  name: 'OpenIDClientId'
  properties: {
    value: openidClientIdSecretValue
  }
}

resource openidClientSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: vault
  name: 'OpenIDClientSecret'
  properties: {
    value: openidClientSecretValue
  }
}

resource webUISecretKeySecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: vault
  name: 'WebUISecretKey'
  properties: {
    value: webUISecretKeySecretValue
  }
}

resource anthropicSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: vault
  name: 'AnthropicKey'
  properties: {
    value: anthropicApiKey
  }
}

output vaultUri string = vault.properties.vaultUri
