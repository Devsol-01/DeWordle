import {
  Contract,
  TransactionBuilder,
  TimeoutInfinite,
  type Transaction,
  xdr,
} from "@stellar/stellar-sdk";
import type { Account, Server, SendTransactionResponse } from "@stellar/stellar-sdk/rpc";
import type { SorobanNetworkConfig } from "./network";

export async function buildContractTx(params: {
  server: Server;
  source: Account;
  network: SorobanNetworkConfig;
  contractId: string;
  method: string;
  args?: xdr.ScVal[];
  fee?: string;
}) {
  const contract = new Contract(params.contractId);
  const tx = new TransactionBuilder(params.source, {
    fee: params.fee ?? "100",
    networkPassphrase: params.network.passphrase,
  })
    .addOperation(contract.call(params.method, ...(params.args ?? [])))
    .setTimeout(TimeoutInfinite)
    .build();

  return tx;
}

export async function simulateAndAssemble(params: {
  server: Server;
  tx: Transaction;
}) {
  const simulated = await params.server.simulateTransaction(params.tx);
  if (simulated.error) {
    throw new Error(`Simulation failed: ${simulated.error}`);
  }

  const assembled = params.server.assembleTransaction(params.tx, simulated).build();
  return { simulated, assembled };
}

export async function submitTransaction(params: {
  server: Server;
  tx: Transaction;
}): Promise<SendTransactionResponse> {
  const sent = await params.server.sendTransaction(params.tx);

  if (sent.status === "ERROR") {
    throw new Error(sent.errorResultXdr || "Transaction submit failed");
  }

  return sent;
}
