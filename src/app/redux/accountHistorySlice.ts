import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import * as adex from "alphadex-sdk-js";

export interface AccountHistoryState {
  trades: adex.Trade[];
}

const initialState: AccountHistoryState = {
  trades: [],
};

export const accountHistorySlice = createSlice({
  name: "accountHistory",
  initialState,
  reducers: {
    updateAdex: (state, action: PayloadAction<adex.StaticState>) => {
      const adexState = action.payload;
      state.trades = adexState.currentPairTrades;
    },
  },
});
