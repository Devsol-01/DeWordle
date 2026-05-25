import { nativeToScVal } from "@stellar/stellar-sdk";
import { Server } from "@stellar/stellar-sdk/rpc";
import type { ContractRegistry, SorobanNetworkConfig } from "./network";
import { resolveContractId } from "./registry";
import { buildContractTx, simulateAndAssemble } from "./tx-builder";

export class AdminRegistryClient {
  private readonly server: Server;

  constructor(
    private readonly contractId: string,
    private readonly network: SorobanNetworkConfig,
  ) {
    this.server = new Server(network.rpcUrl);
  }

  static fromRegistry(network: SorobanNetworkConfig, registry: ContractRegistry) {
    return new AdminRegistryClient(resolveContractId(registry, "admin_registry"), network);
  }

  async buildGetContractTx(sourcePublicKey: string, key: string) {
    const account = await this.server.getAccount(sourcePublicKey);
    const tx = await buildContractTx({
      server: this.server,
      source: account,
      network: this.network,
      contractId: this.contractId,
      method: "get_contract",
      args: [nativeToScVal(key)],
    });

    return simulateAndAssemble({ server: this.server, tx });
  }
}
