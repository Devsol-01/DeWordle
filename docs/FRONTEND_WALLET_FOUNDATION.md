# Frontend Wallet Foundation

## Purpose
Provide reusable wallet and transaction primitives for Soroban interactions.

## Added Foundation
- `StellarWalletProvider`
- `useStellarWallet` hook
- Freighter detection and connect/disconnect
- Network config and switching primitives
- Transaction lifecycle status model

## Core Paths
- `frontend/src/providers/stellar-wallet-provider.tsx`
- `frontend/src/hooks/useStellarWallet.ts`
- `frontend/src/lib/stellar/network.ts`
- `frontend/src/lib/stellar/soroban.ts`

## Next Steps
- add transaction signer flow integration with SDK-built tx
- add wallet/network UI controls
- add optimistic and confirmed state reconciliation for game actions
