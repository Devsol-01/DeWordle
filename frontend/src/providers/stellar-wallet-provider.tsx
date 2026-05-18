"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getDefaultNetwork, STELLAR_NETWORKS, type StellarNetwork } from "@/lib/stellar/network";
import type { TxLifecycleStatus } from "@/lib/stellar/soroban";

type WalletState = {
  connected: boolean;
  address?: string;
  network: StellarNetwork;
  status: TxLifecycleStatus;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: (network: StellarNetwork) => Promise<void>;
  setTxStatus: (status: TxLifecycleStatus) => void;
};

type FreighterApiLike = {
  getAddress?: () => Promise<{ address?: string; error?: string }>;
};

type WalletKitLike = {
  openModal?: (params: {
    modalTitle?: string;
    onWalletSelected: (wallet: {
      getAddress: () => Promise<{ address: string }>;
    }) => Promise<void>;
  }) => Promise<void>;
};

declare global {
  interface Window {
    freighterApi?: FreighterApiLike;
    stellarWalletsKit?: WalletKitLike;
  }
}

const defaultStatus: TxLifecycleStatus = { id: "", state: "idle" };
const WalletContext = createContext<WalletState | undefined>(undefined);

export function StellarWalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [network, setNetwork] = useState<StellarNetwork>(getDefaultNetwork());
  const [status, setStatus] = useState<TxLifecycleStatus>(defaultStatus);

  const connect = useCallback(async () => {
    if (typeof window === "undefined") {
      throw new Error("Wallet connection is only available in browser context");
    }

    const kit = window.stellarWalletsKit;
    if (kit?.openModal) {
      await kit.openModal({
        modalTitle: "Connect Wallet",
        onWalletSelected: async (wallet) => {
          const { address: selectedAddress } = await wallet.getAddress();
          setConnected(true);
          setAddress(selectedAddress);
        },
      });
      return;
    }

    const freighter = window.freighterApi;
    if (freighter?.getAddress) {
      const response = await freighter.getAddress();
      if (response.error || !response.address) {
        throw new Error(response.error || "Failed to read Freighter address");
      }
      setConnected(true);
      setAddress(response.address);
      return;
    }

    throw new Error(
      "No wallet provider detected. Install Freighter or initialize Stellar Wallet Kit.",
    );
  }, []);

  const disconnect = useCallback(async () => {
    setConnected(false);
    setAddress(undefined);
    setStatus(defaultStatus);
  }, []);

  const switchNetwork = useCallback(async (nextNetwork: StellarNetwork) => {
    setNetwork(nextNetwork);
    setStatus({ id: crypto.randomUUID(), state: "idle" });
  }, []);

  const setTxStatus = useCallback((nextStatus: TxLifecycleStatus) => {
    setStatus(nextStatus);
  }, []);

  const value = useMemo(
    () => ({
      connected,
      address,
      network,
      status,
      connect,
      disconnect,
      switchNetwork,
      setTxStatus,
      networkConfig: STELLAR_NETWORKS[network],
    }),
    [connected, address, network, status, connect, disconnect, switchNetwork, setTxStatus],
  );

  return <WalletContext.Provider value={value as WalletState}>{children}</WalletContext.Provider>;
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used within StellarWalletProvider");
  }
  return context;
}
