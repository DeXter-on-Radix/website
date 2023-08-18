import * as adex from "alphadex-sdk-js";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { CandlestickData, UTCTimestamp } from "lightweight-charts";
export interface OHLCVData extends CandlestickData {
  value: number;
}

export const CANDLE_PERIODS = adex.CandlePeriods;

export interface PriceChartState {
  candlePeriod: string;
  ohlcv: OHLCVData[];
}

const initialState: PriceChartState = {
  candlePeriod: adex.CandlePeriods[0],
  ohlcv: [],
};

function cleanData(data: OHLCVData[]): OHLCVData[] {
  // avoid lightweight-charts Error: Assertion failed: data must be asc ordered by time
  // without this step, the chart does not work in firefox (but works in chrome)
  const dataMap = new Map<number, OHLCVData>();

  // Iterate over the data in reverse order
  for (let i = data.length - 1; i >= 0; i--) {
    const row = data[i];
    // If the map doesn't already contain this timestamp, add the row to the map
    if (!dataMap.has(row.time as number)) {
      dataMap.set(row.time as number, row);
    }
  }

  // Convert the map values back to an array and sort it by time
  const cleanedData = Array.from(dataMap.values()).sort(
    (a, b) => (a.time as number) - (b.time as number)
  );

  return cleanedData;
}

function convertAlphaDEXData(data: adex.Candle[]): OHLCVData[] {
  let tradingViewData = data.map((row): OHLCVData => {
    const time = (new Date(row.startTime).getTime() / 1000) as UTCTimestamp;
    const open = row.priceOpen;
    const high = row.priceHigh;
    const low = row.priceLow;
    const close = row.priceClose;
    const value = row.tradesValue;
    return { time, open, high, low, close, value };
  });

  tradingViewData = cleanData(tradingViewData);
  return tradingViewData;
}

export const priceChartSlice = createSlice({
  name: "priceChart",
  initialState,
  reducers: {
    setCandlePeriod: (state, action: PayloadAction<string>) => {
      adex.clientState.currentCandlePeriod = action.payload;
      state.candlePeriod = action.payload;
    },
    updateCandles: (state, action: PayloadAction<adex.Candle[]>) => {
      state.ohlcv = convertAlphaDEXData(action.payload);
    },
  },
});

export const { setCandlePeriod, updateCandles } = priceChartSlice.actions;

export default priceChartSlice.reducer;
