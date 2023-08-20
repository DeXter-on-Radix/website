import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { WalletDataState } from "@radixdlt/radix-dapp-toolkit";

export type WalletData = WalletDataState;

export interface RadixState {
  walletData: WalletData;
  isConnected: boolean;
}

const initialState: RadixState = {
  walletData: {
    accounts: [],
    personaData: [],
    proofs: [],
  },
  // TODO: handle connection status
  isConnected: false,
};

export const radixSlice = createSlice({
  name: "radix",
  initialState,

  // synchronous reducers
  reducers: {
    setWalletData: (state: RadixState, action: PayloadAction<WalletData>) => {
      state.walletData = action.payload;
    },
  },

  // asynchronous reducers
  extraReducers: (builder) => {},
});
