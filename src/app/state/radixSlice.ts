import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { WalletDataState } from "@radixdlt/radix-dapp-toolkit";

export type WalletData = WalletDataState;

export interface RadixState {
  walletData: WalletData;
  isConnected: boolean;
  selectedAccount: string;
}

const initialState: RadixState = {
  walletData: {
    accounts: [],
    personaData: [],
    proofs: [],
  },
  isConnected: false,
  selectedAccount: "",
};

export const radixSlice = createSlice({
  name: "radix",
  initialState,

  // synchronous reducers
  reducers: {
    setWalletData: (state: RadixState, action: PayloadAction<WalletData>) => {
      state.isConnected = action.payload.accounts.length > 0;
      state.walletData = action.payload;
      state.selectedAccount =
        action.payload.accounts.length > 0
          ? action.payload.accounts[0].address
          : "";
    },
    selectAccount: (state: RadixState, action: PayloadAction<string>) => {
      state.selectedAccount = action.payload;
    },
  },
});

export const selectAccounts = (state: RadixState) => state.walletData.accounts;
