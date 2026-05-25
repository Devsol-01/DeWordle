import { nativeToScVal } from "@stellar/stellar-sdk";
import { Server } from "@stellar/stellar-sdk/rpc";
import type { ContractRegistry, SorobanNetworkConfig } from "./network";
import { resolveContractId } from "./registry";
import { buildContractTx, simulateAndAssemble } from "./tx-builder";

export class RewardsClient {
  private readonly server: Server;

  constructor(
    private readonly contractId: string,
    private readonly network: SorobanNetworkConfig,
  ) {
    this.server = new Server(network.rpcUrl);
  }

  static fromRegistry(network: SorobanNetworkConfig, registry: ContractRegistry) {
    return new RewardsClient(resolveContractId(registry, "rewards"), network);
  }

  async buildClaimTx(sourcePublicKey: string) {
    const account = await this.server.getAccount(sourcePublicKey);
    const tx = await buildContractTx({
      server: this.server,
      source: account,
      network: this.network,
      contractId: this.contractId,
      method: "claim",
      args: [nativeToScVal(sourcePublicKey)],
    });

    return simulateAndAssemble({ server: this.server, tx });
  }
}
