export type NetworkName = "testnet" | "mainnet";

export interface SorobanNetworkConfig {
  name: NetworkName;
  rpcUrl: string;
  passphrase: string;
  horizonUrl?: string;
}

export interface ContractRegistry {
  network: NetworkName;
  contracts: {
    admin_registry: string;
    core_game: string;
    rewards: string;
    achievements: string;
  };
}

export const NETWORKS: Record<NetworkName, SorobanNetworkConfig> = {
  testnet: {
    name: "testnet",
    rpcUrl: "https://soroban-testnet.stellar.org",
    passphrase: "Test SDF Network ; September 2015",
    horizonUrl: "https://horizon-testnet.stellar.org",
  },
  mainnet: {
    name: "mainnet",
    rpcUrl: "https://mainnet.sorobanrpc.com",
    passphrase: "Public Global Stellar Network ; September 2015",
    horizonUrl: "https://horizon.stellar.org",
  },
};

export async function loadContractRegistry(
  network: NetworkName,
  loader?: () => Promise<ContractRegistry>,
): Promise<ContractRegistry> {
  if (loader) {
    return loader();
  }

  throw new Error(
    `No contract registry loader provided for ${network}. Provide a JSON loader from your host app.`,
  );
}
