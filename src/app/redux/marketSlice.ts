import { PayloadAction, createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "./store";
import * as adex from "alphadex-sdk-js";
import { SdkResult } from "alphadex-sdk-js/lib/models/sdk-result";

const initialState: PriceChartState = {
  candlePeriod: adex.CandlePeriods[2],
  ohlcv: [],
  legendCandlePrice: null,
  legendPercChange: null,
  legendChange: null,
  legendCurrentVolume: 0,
  isNegativeOrZero: false,
};

export const marketSlice = createSlice({
  name: "marketData",
  initialState,
  reducers: {
    updateMarketInfo: (state, action: PayloadAction<adex.StaticState>) => {
      console.log(state);
      //const apiResponse = await adex.clientState.getAllPairsMarketData;
    },
    updateAdex: (state, action: PayloadAction<adex.StaticState>) => {
      const adexState = action.payload;
      state.trades = adexState.currentPairTrades;
      console.log("AdexState: ", adex.clientState.getAllPairsMarketData);
    },
  },
});

// ASYNC THUNKS
export const fetchMarketData = createAsyncThunk<
  SdkResult,
  undefined,
  { state: RootState }
>("marketData/fetchMarketData", async (_, thunkAPI) => {
  console.log("Fetching market data...");
  const state = thunkAPI.getState();

  const apiResponse = await adex.clientState.get;
  console.log(apiResponse);
  const plainApiResponse: SdkResult = JSON.parse(JSON.stringify(apiResponse));
  if (plainApiResponse.status === "SUCCESS") {
    return plainApiResponse;
  } else {
    throw new Error(plainApiResponse.message);
  }
});

export const { updateMarketInfo } = marketSlice.actions;
