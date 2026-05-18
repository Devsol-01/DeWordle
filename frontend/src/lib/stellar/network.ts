export type StellarNetwork = "testnet" | "mainnet";

export interface StellarNetworkConfig {
  network: StellarNetwork;
  rpcUrl: string;
  horizonUrl: string;
  passphrase: string;
}

export const STELLAR_NETWORKS: Record<StellarNetwork, StellarNetworkConfig> = {
  testnet: {
    network: "testnet",
    rpcUrl: "https://soroban-testnet.stellar.org",
    horizonUrl: "https://horizon-testnet.stellar.org",
    passphrase: "Test SDF Network ; September 2015",
  },
  mainnet: {
    network: "mainnet",
    rpcUrl: "https://mainnet.sorobanrpc.com",
    horizonUrl: "https://horizon.stellar.org",
    passphrase: "Public Global Stellar Network ; September 2015",
  },
};

export function getDefaultNetwork(): StellarNetwork {
  const env = process.env.NEXT_PUBLIC_STELLAR_NETWORK;
  if (env === "mainnet") return "mainnet";
  return "testnet";
}
