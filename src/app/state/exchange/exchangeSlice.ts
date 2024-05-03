import { createSlice } from "@reduxjs/toolkit";
import {
  Candle,
  OrderbookLine,
  PairInfo,
  TokenInfo,
  Trade,
} from "alphadex-sdk-js";

export type CandlePeriodsType =
  | "5m"
  | "30m"
  | "1h"
  | "6h"
  | "12h"
  | "1D"
  | "1W"
  | "1M";
export interface OrderbookState {
  buyOrders: OrderbookLine[];
  sellOrders: OrderbookLine[];
  lastPrice: number | undefined;
  bestSellPrice: number | undefined;
  bestBuyPrice: number | undefined;
  spread: number | undefined;
  spreadPerc: number | undefined;
  grouping: number;
}

export interface ExchangeState {
  allTokens: TokenInfo[];
  allPairs: PairInfo[];
  selectedPair: PairInfo | undefined;
  selectedPairTrades: Trade[];
  selectedPairOrderbook: OrderbookState;
  selectedPairCandles: Candle[];
  candlePeriod: CandlePeriodsType;
}

const initialState: ExchangeState = {
  allTokens: [],
  allPairs: [],
  selectedPair: undefined,
  selectedPairTrades: [],
  selectedPairOrderbook: {
    buyOrders: [],
    sellOrders: [],
    lastPrice: undefined,
    bestSellPrice: undefined,
    bestBuyPrice: undefined,
    spread: undefined,
    spreadPerc: undefined,
    grouping: 0,
  },
  selectedPairCandles: [],
  candlePeriod: "1D",
};

export const exchangeSlice = createSlice({
  name: "exchange",
  initialState,
  reducers: {},
});
