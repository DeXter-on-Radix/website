import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import * as adex from "alphadex-sdk-js";

export interface MarketState {
  pairsList: adex.PairInfo[];
}

const initialState: MarketState = {
  pairsList: [],
};

export const marketSlice = createSlice({
  name: "marketData",
  initialState,
  reducers: {
    updateAdex: (state, action: PayloadAction<adex.StaticState>) => {
      const adexState = action.payload;
      state.pairsList = adexState.pairsList;
    },
  },
});
