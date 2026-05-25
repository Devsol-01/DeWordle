import type { ContractRegistry, NetworkName } from "./network";

export function resolveContractId(
  registry: ContractRegistry,
  key: keyof ContractRegistry["contracts"],
): string {
  const value = registry.contracts[key];
  if (!value || !value.trim()) {
    throw new Error(`Missing contract id for ${key}`);
  }
  return value;
}

export function assertRegistryNetwork(registry: ContractRegistry, network: NetworkName) {
  if (registry.network !== network) {
    throw new Error(
      `Contract registry mismatch: expected ${network}, got ${registry.network}`,
    );
  }
}
