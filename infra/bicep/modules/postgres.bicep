param location string
param serverName string
param administratorLogin string
@secure()
param administratorLoginPassword string

@description('Ob öffentlicher Zugriff erlaubt ist (Enabled/Disabled).')
@allowed([
  'Enabled'
  'Disabled'
])
param publicNetworkAccess string = 'Enabled'

@description('Array der freizugebenden öffentlichen ACA-Egress-IPs (vom ACA-Environment Output).')
param allowedClientIps array

param serverEdition string = 'GeneralPurpose'
param skuSizeGB int = 128
param dbInstanceType string = 'Standard_D4ds_v4'
param version string = '14'

resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2024-08-01' = {
  name: serverName
  location: location
  sku: {
    name: dbInstanceType
    tier: serverEdition
  }
  properties: {
    version: version
    administratorLogin: administratorLogin
    administratorLoginPassword: administratorLoginPassword
    network: {
      publicNetworkAccess: publicNetworkAccess
    }
    storage: {
      storageSizeGB: skuSizeGB
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    availabilityZone: '1'
  }
}

output postgresHost string = '${serverName}.postgres.database.azure.com'

// Firewall-Rule je IP
@batchSize(1)
resource fwRules 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2024-08-01' = [for (ip, i) in allowedClientIps: {
  parent: postgresServer
  name: 'allow-aca-egress-${i}'
  properties: {
    startIpAddress: string(ip)
    endIpAddress: string(ip)
  }
}]
