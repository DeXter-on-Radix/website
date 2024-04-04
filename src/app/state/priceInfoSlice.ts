import * as adex from "alphadex-sdk-js";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";

export interface PriceInfoState {
  lastPrice: number;
  open24h: number;
  change24h: number;
  high24h: number;
  low24h: number;
  value24h: number;
  isNegativeOrZero: boolean;
}

const currentPairInfo = adex.clientState.currentPairInfo;

const initialState: PriceInfoState = {
  lastPrice: currentPairInfo.lastPrice,
  open24h: currentPairInfo.open24h,
  change24h: currentPairInfo.change24h,
  high24h: currentPairInfo.high24h,
  low24h: currentPairInfo.low24h,
  value24h: currentPairInfo.value24h,
  isNegativeOrZero: currentPairInfo.lastPrice - currentPairInfo.open24h <= 0,
};

export const priceInfoSlice = createSlice({
  name: "priceInfo",
  initialState,
  reducers: {
    updatePriceInfo: (state, action: PayloadAction<adex.StaticState>) => {
      const currentPairInfo = action.payload.currentPairInfo;
      state.lastPrice = currentPairInfo.lastPrice;
      state.open24h = currentPairInfo.open24h;
      state.change24h =
        ((currentPairInfo.lastPrice - currentPairInfo.open24h) /
          currentPairInfo.open24h) *
        100;
      state.high24h = currentPairInfo.high24h;
      state.low24h = currentPairInfo.low24h;
      state.value24h = currentPairInfo.value24h;
      state.isNegativeOrZero =
        currentPairInfo.lastPrice - currentPairInfo.open24h <= 0;
    },
  },
});

// Get last price
export const selectLastPrice = (state: RootState) => state.priceInfo.lastPrice;

export const { updatePriceInfo } = priceInfoSlice.actions;
