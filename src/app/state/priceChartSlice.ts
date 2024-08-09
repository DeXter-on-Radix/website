import * as adex from "alphadex-sdk-js";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  CandlestickData,
  IChartApi,
  UTCTimestamp,
  ISeriesApi,
  SeriesOptionsMap,
} from "lightweight-charts";
import { AppDispatch } from "./store";

export interface OHLCVData extends CandlestickData {
  value: number;
}

// Candle periods from alphadex:
// -> reference: https://www.npmjs.com/package/alphadex-sdk-js?activeTab=readme#candleperiods-array
// -> ['5m', '15m', '30m', '1h', '4h', '6h', '12h', '1D', '1W', '1M']
export const CANDLE_PERIODS = adex.CandlePeriods;

export interface PriceChartState {
  candlePeriod: string;
  ohlcv: OHLCVData[];
  legendCandlePrice: OHLCVData | null;
  legendChange: number | null;
  legendPercChange: number | null;
  legendCurrentVolume: number;
  copied: boolean;
}

const initialState: PriceChartState = {
  candlePeriod: adex.CandlePeriods[7], // defaults to 1D candle period
  ohlcv: [],
  legendCandlePrice: null,
  legendPercChange: null,
  legendChange: null,
  legendCurrentVolume: 0,
  copied: false,
};

export const initialPriceChartState = initialState;

export const COPY_SUCCESS = "COPY_SUCCESS";

export const copySuccess = () => ({
  type: COPY_SUCCESS,
});

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
  volumeSeries: ISeriesApi<keyof SeriesOptionsMap>
) {
  return (dispatch: AppDispatch) => {
    chart.subscribeCrosshairMove((param) => {
      if (param.time) {
        const currentIndex = data.findIndex(
          (candle) => candle.time === param.time
        );

        if (currentIndex >= 0 && currentIndex < data.length) {
          const currentData = data[currentIndex];
          const volumeData = param.seriesData.get(volumeSeries) as OHLCVData;
          dispatch(setLegendChange(currentData));
          dispatch(setLegendCandlePrice(currentData));
          dispatch(
            setLegendPercChange({
              currentOpen: currentData.open,
              currentClose: currentData.close,
            })
          );
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
    setLegendChange: (state, action: PayloadAction<OHLCVData>) => {
      if (action.payload) {
        const difference = action.payload.close - action.payload.open;
        state.legendChange = difference;
      } else {
        state.legendChange = null;
      }
    },
    setLegendPercChange: (
      state,
      action: PayloadAction<{ currentOpen: number; currentClose: number }>
    ) => {
      const { currentOpen, currentClose } = action.payload;
      if (currentOpen !== null && currentClose !== null) {
        const difference = currentClose - currentOpen;
        let percentageChange = (difference / currentOpen) * 100;

        if (Math.abs(percentageChange) < 0.01) {
          percentageChange = 0;
        }

        state.legendPercChange = parseFloat(percentageChange.toFixed(2));
      } else {
        state.legendPercChange = null;
      }
    },
    initializeLegend: (state) => {
      if (state.ohlcv && state.ohlcv.length > 0) {
        const latestOHLCVData = state.ohlcv[state.ohlcv.length - 1];
        state.legendCandlePrice = latestOHLCVData;
        state.legendChange = latestOHLCVData.close - latestOHLCVData.open;
        state.legendPercChange = parseFloat(
          (
            ((latestOHLCVData.close - latestOHLCVData.open) /
              latestOHLCVData.open) *
            100
          ).toFixed(2)
        );
        state.legendCurrentVolume = latestOHLCVData.value;
      }
    },
    setLegendCurrentVolume: (state, action: PayloadAction<number>) => {
      state.legendCurrentVolume = action.payload;
    },
    setCopied: (state, action: PayloadAction<boolean>) => {
      state.copied = action.payload;
    },
  },
});

export const {
  setCandlePeriod,
  updateCandles,
  setLegendCandlePrice,
  setLegendChange,
  setLegendPercChange,
  setLegendCurrentVolume,
  initializeLegend,
  setCopied,
} = priceChartSlice.actions;
