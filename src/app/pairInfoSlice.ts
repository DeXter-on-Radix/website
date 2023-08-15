import * as adex from "alphadex-sdk-js";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface TokenInfo extends adex.TokenInfo {
  maxDigits: number;
}
export interface PairInfoState {
  address: string;
  token1Info: TokenInfo;
  token2Info: TokenInfo;
  lastPrice: number | null;
  trades: adex.Trade[];
}

const initalTokenInfo: TokenInfo = {
  address: "",
  symbol: "",
  name: "",
  iconUrl: "",
  maxDigits: 0,
};

const initialState: PairInfoState = {
  address: "",
  token1Info: { ...initalTokenInfo },
  token2Info: { ...initalTokenInfo },
  lastPrice: null,
  trades: [],
};

export const pairInfoSlice = createSlice({
  name: "pairInfo",
  initialState,

  // synchronous reducers
  reducers: {
    updateAdex: (
      state: PairInfoState,
      action: PayloadAction<adex.StaticState>
    ) => {
      const adexState = action.payload;

      // TODO: should we remove the if? are USDC/XRD and XRD/USDC different pairs?
      if (state.address !== adexState.currentPairAddress) {
        state.token1Info = {
          ...adexState.currentPairInfo.token1,
          maxDigits: adexState.currentPairInfo.maxDigitsToken1,
        };
        state.token2Info = {
          ...adexState.currentPairInfo.token2,
          maxDigits: adexState.currentPairInfo.maxDigitsToken2,
        };
      }
      state.address = adexState.currentPairAddress;
      state.lastPrice = adexState.currentPairInfo.lastPrice;
      state.trades = adexState.currentPairTrades.map((trade) => ({ ...trade }));
    },
  },

  // asynchronous reducers
  extraReducers: (builder) => {},
});

export default pairInfoSlice.reducer;
