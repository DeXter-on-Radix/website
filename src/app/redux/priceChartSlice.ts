import * as adex from "alphadex-sdk-js";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { CandlestickData, IChartApi, UTCTimestamp } from "lightweight-charts";
import { computePercentageChange } from "../utils";

export interface OHLCVData extends CandlestickData {
  value: number;
}

export const CANDLE_PERIODS = adex.CandlePeriods;

export interface PriceChartState {
  candlePeriod: string;
  ohlcv: OHLCVData[];
  legendCandlePrice: OHLCVData | null;
  legendPercChange: number | null;
  legendCurrentVolume: number;
}

const initialState: PriceChartState = {
  candlePeriod: adex.CandlePeriods[0],
  ohlcv: [],
  legendCandlePrice: null,
  legendPercChange: null,
  legendCurrentVolume: 0,
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

//Chart Crosshair
export function handleCrosshairMove(
  chart: IChartApi,
  data: OHLCVData[],
  volumeSeries: any
) {
  return (dispatch: any) => {
    // Your logic here
    chart.subscribeCrosshairMove((param) => {
      if (param.time) {
        const currentIndex = data.findIndex(
          (candle) => candle.time === param.time
        );

        if (currentIndex > 0 && currentIndex < data.length) {
          const currentData = data[currentIndex];
          const prevCandle = data[currentIndex - 1];

          const volumeData = param.seriesData.get(volumeSeries) as OHLCVData;
          const percentageDifference = computePercentageChange(
            currentData.close,
            prevCandle.close
          );
          dispatch(setLegendPercChange(percentageDifference));
          dispatch(setLegendCandlePrice(currentData));
          dispatch(setLegendCurrentVolume(volumeData ? volumeData.value : 0));
        }
      }
    });
  };
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
    setLegendCandlePrice: (state, action: PayloadAction<OHLCVData | null>) => {
      state.legendCandlePrice = action.payload;
    },
    setLegendPercChange: (state, action: PayloadAction<number | null>) => {
      state.legendPercChange = action.payload;
    },
    setLegendCurrentVolume: (state, action: PayloadAction<number>) => {
      state.legendCurrentVolume = action.payload;
    },
  },
});

export const {
  setCandlePeriod,
  updateCandles,
  setLegendCandlePrice,
  setLegendPercChange,
  setLegendCurrentVolume,
} = priceChartSlice.actions;
