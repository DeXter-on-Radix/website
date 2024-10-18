import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import {
  WalletDataState,
  WalletDataStateAccount,
} from "@radixdlt/radix-dapp-toolkit";

export type WalletData = WalletDataState;

export interface RadixState {
  walletData: WalletData;
  isConnected: boolean;
  selectedAccount: WalletDataStateAccount;
  isHydrated: boolean;
}

const initialState: RadixState = {
  walletData: {
    accounts: [],
    personaData: [],
    proofs: [],
  },
  isConnected: false,
  selectedAccount: {} as WalletDataStateAccount,
  isHydrated: false,
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
          ? action.payload.accounts[0]
          : ({} as WalletDataStateAccount);
    },
    selectAccount: (
      state: RadixState,
      action: PayloadAction<WalletDataStateAccount>
    ) => {
      state.selectedAccount = action.payload;
    },
    setIsHydrated: (state: RadixState, action: PayloadAction<boolean>) => {
      state.isHydrated = action.payload;
    },
  },
});

export const selectAccounts = (state: RadixState) => state.walletData.accounts;
