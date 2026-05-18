import { STELLAR_NETWORKS, type StellarNetwork } from "./network";

export function createSorobanServerConfig(network: StellarNetwork) {
  return {
    rpcUrl: STELLAR_NETWORKS[network].rpcUrl,
    passphrase: STELLAR_NETWORKS[network].passphrase,
  };
}

export interface TxLifecycleStatus {
  id: string;
  state: "idle" | "simulating" | "signing" | "submitting" | "success" | "error";
  error?: string;
  txHash?: string;
}
