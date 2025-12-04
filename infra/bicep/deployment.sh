#!/usr/bin/env bash
set -euo pipefail

RG="SchoolAI"
VAULT_NAME="novedu-vault"
BICEP_FILE="main.bicep"
PARAM_FILE="parameters.json"

echo "==> Sammle zu schützende Ressourcen (Key Vault + Azure OpenAI):"
VAULT_ID="$(az keyvault show -g "$RG" -n "$VAULT_NAME" --query id -o tsv 2>/dev/null || true)"
readarray -t OPENAI_IDS < <(az resource list -g "$RG" --resource-type "Microsoft.CognitiveServices/accounts" --query "[?kind=='OpenAI'].id" -o tsv)

echo
echo "==> Geschützte Ressourcen:"
printf "   - Vault: %s\n" "${VAULT_NAME}"
if ((${#OPENAI_IDS[@]})); then
  for oid in "${OPENAI_IDS[@]}"; do
    ONAME=$(az resource show --ids "$oid" --query name -o tsv 2>/dev/null || echo "(unbekannt)")
    printf "   - OpenAI: %s\n" "$ONAME"
  done
else
  echo "   - OpenAI: (keine gefunden)"
fi
echo

is_excluded() {
  local id="$1"
  [[ -z "${id}" ]] && return 1
  [[ -n "${VAULT_ID:-}" && "$id" == "$VAULT_ID" ]] && return 0
  for oid in "${OPENAI_IDS[@]:-}"; do
    [[ "$id" == "$oid" ]] && return 0
  done
  return 1
}

echo "==> Anzeigen, was gelöscht wird (alles außer Vault + OpenAI):"
TO_DELETE_QUERY="[?!(name=='${VAULT_NAME}') && !(kind=='OpenAI')].{name:name,type:type,id:id}"
az resource list -g "$RG" --query "$TO_DELETE_QUERY" -o table || true

echo
read -p "Fortfahren und ALLES außer Vault + OpenAI löschen? (ja/nein) " CONFIRM_DELETE

if [[ "$CONFIRM_DELETE" == "ja" ]]; then
  echo "==> Alte Deployments beenden & entfernen (robust):"
    readarray -t DEPS < <(az deployment group list -g "$RG" --query "[].name" -o tsv)
    for dep in "${DEPS[@]:-}"; do
    state=$(az deployment group show -g "$RG" -n "$dep" --query "properties.provisioningState" -o tsv 2>/dev/null || echo "")
    if [[ "$state" == "Running" || "$state" == "Accepted" || "$state" == "Creating" || "$state" == "InProgress" ]]; then
        echo "   -> Cancel $dep (state: $state)"
        az deployment group cancel -g "$RG" -n "$dep" || true
        for i in {1..18}; do
        newstate=$(az deployment group show -g "$RG" -n "$dep" --query "properties.provisioningState" -o tsv 2>/dev/null || echo "")
        [[ "$newstate" == "Canceled" || "$newstate" == "Failed" || -z "$newstate" ]] && break
        sleep 5
        done
    fi
    echo "   -> Delete $dep"
    az deployment group delete -g "$RG" -n "$dep" || true
    done

  echo "==> Lösche Container Apps, Environments, Private Endpoints/DNS zuerst:"
  WAVE1_TYPES=(
    "Microsoft.App/containerApps"
    "Microsoft.App/managedEnvironments"
    "Microsoft.Network/privateEndpoints"
    "Microsoft.Network/privateDnsZones"
  )
  for t in "${WAVE1_TYPES[@]}"; do
    readarray -t IDS < <(az resource list -g "$RG" --resource-type "$t" --query "[].id" -o tsv)
    if ((${#IDS[@]})); then
      for id in "${IDS[@]}"; do
        if ! is_excluded "$id"; then
          echo "   -> Lösche $id"
          az resource delete --ids "$id" || true
        fi
      done
    else
      echo "   -> Keine Ressourcen vom Typ $t gefunden."
    fi
  done

  echo "==> Warte, bis Managed Environments entfernt sind (falls vorhanden):"
  readarray -t ENV_IDS < <(az resource list -g "$RG" --resource-type "Microsoft.App/managedEnvironments" --query "[].id" -o tsv)
  for env_id in "${ENV_IDS[@]:-}"; do
    echo "   -> Warten auf: $env_id"
    for i in {1..18}; do
      if ! az resource show --ids "$env_id" &>/dev/null; then
        echo "      OK: entfernt"
        break
      fi
      sleep 10
    done
  done

  echo "==> Lösche virtuelle Netzwerke explizit:"
  readarray -t VNETS < <(az network vnet list -g "$RG" --query "[].name" -o tsv)
  if ((${#VNETS[@]})); then
    for vnet in "${VNETS[@]}"; do
      VNET_ID=$(az network vnet show -g "$RG" -n "$vnet" --query id -o tsv)
      if ! is_excluded "$VNET_ID"; then
        echo "   -> Lösche VNet $vnet"
        az network vnet delete -g "$RG" -n "$vnet" || true
      fi
    done
  else
    echo "   -> Keine VNets gefunden."
  fi

  echo "==> Lösche restliche Ressourcen (außer Vault + OpenAI):"
  readarray -t ALL_IDS < <(az resource list -g "$RG" --query "[].id" -o tsv)
  if ((${#ALL_IDS[@]})); then
    for id in "${ALL_IDS[@]}"; do
      if ! is_excluded "$id"; then
        echo "   -> Lösche $id"
        az resource delete --ids "$id" || true
      fi
    done
  else
    echo "   -> Keine weiteren Ressourcen gefunden."
  fi
else
  echo "==> Löschen übersprungen (Antwort war 'nein')."
fi

echo
echo "==> Übrig in der Resource Group (nach möglichem Löschen):"
az resource list -g "$RG" -o table

echo
read -p "Jetzt Deployment ausführen? (ja/nein) " CONFIRM_DEPLOY
if [[ "$CONFIRM_DEPLOY" == "ja" ]]; then
  echo "==> Neu-Deployment starten:"
  az deployment group create \
    --resource-group "$RG" \
    --template-file "$BICEP_FILE" \
    --parameters @"$PARAM_FILE"
else
  echo "==> Deployment übersprungen (Antwort war 'nein')."
fi
