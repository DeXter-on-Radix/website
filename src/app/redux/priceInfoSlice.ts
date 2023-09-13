import * as adex from "alphadex-sdk-js";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";

// Define the state type
export interface PriceInfoState {
  lastPrice: number;
  open24h: number;
  change24h: number;
  high24h: number;
  low24h: number;
  value24h: number;
}

// Define the initial state with type
const initialState: PriceInfoState = {
  lastPrice: adex.clientState.currentPairInfo.lastPrice,
  open24h: adex.clientState.currentPairInfo.open24h,
  change24h: adex.clientState.currentPairInfo.change24h,
  high24h: adex.clientState.currentPairInfo.high24h,
  low24h: adex.clientState.currentPairInfo.low24h,
  value24h: adex.clientState.currentPairInfo.value24h,
};

// Create the slice with reducers and actions
export const priceInfoSlice = createSlice({
  name: "priceInfo",
  initialState,
  reducers: {
    updatePriceInfo: (state, action: PayloadAction<adex.StaticState>) => {
      state.lastPrice = action.payload.currentPairInfo.lastPrice;
      state.open24h = action.payload.currentPairInfo.open24h;
      state.change24h = action.payload.currentPairInfo.change24h;
      state.high24h = action.payload.currentPairInfo.high24h;
      state.low24h = action.payload.currentPairInfo.low24h;
      state.value24h = action.payload.currentPairInfo.value24h;
    },
  },
});

// Export the actions and reducer
export const { updatePriceInfo } = priceInfoSlice.actions;
export default priceInfoSlice.reducer;
