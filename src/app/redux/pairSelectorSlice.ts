import * as adex from "alphadex-sdk-js";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface TokenInfo extends adex.TokenInfo {
  maxDigits: number;
  balance?: number;
}

export interface PairSelectorState {
  name: string;
  address: string;
  token1: TokenInfo;
  token2: TokenInfo;
  pairsList: adex.PairInfo[];
}

export const initalTokenInfo: TokenInfo = {
  address: "",
  symbol: "",
  name: "",
  iconUrl: "",
  maxDigits: 0,
};

const initialState: PairSelectorState = {
  name: "",
  address: "",
  token1: { ...initalTokenInfo },
  token2: { ...initalTokenInfo },
  pairsList: [],
};

export const pairSelectorSlice = createSlice({
  name: "pairSelector",
  initialState,

  // synchronous reducers
  reducers: {
    updateAdex: (
      state: PairSelectorState,
      action: PayloadAction<adex.StaticState>
    ) => {
      const adexState = action.payload;

      state.token1 = {
        ...state.token1,
        ...adexState.currentPairInfo.token1,
        maxDigits: adexState.currentPairInfo.maxDigitsToken1,
      };
      state.token2 = {
        ...state.token2,
        ...adexState.currentPairInfo.token2,
        maxDigits: adexState.currentPairInfo.maxDigitsToken2,
      };

      state.address = adexState.currentPairAddress;
      state.name = adexState.currentPairInfo.name;
      state.pairsList = adexState.pairsList;
    },

    selectPairAddress: (
      state: PairSelectorState,
      action: PayloadAction<string>
    ) => {
      const pairAddress = action.payload;
      adex.clientState.currentPairAddress = pairAddress;
    },

    setBalance: (
      state: PairSelectorState,
      action: PayloadAction<{ token: TokenInfo; balance: number }>
    ) => {
      const { token, balance } = action.payload;
      if (token.address === state.token1.address) {
        state.token1 = { ...state.token1, balance };
      } else if (token.address === state.token2.address) {
        state.token2 = { ...state.token2, balance };
      }
    },
  },
});

export const { updateAdex, selectPairAddress } = pairSelectorSlice.actions;

export default pairSelectorSlice.reducer;
