import { createSlice } from "@reduxjs/toolkit";
import * as adex from "alphadex-sdk-js";
import { RootState } from "./store";
import { OrderBookRowProps } from "./OrderBook";

export interface OrderBookState {
  buys: OrderBookRowProps[];
  sells: OrderBookRowProps[];
}

const initialState: OrderBookState = {
  buys: [],
  sells: [],
};

export const orderInputSlice = createSlice({
  name: "orderBook",
  initialState,

  // synchronous reducers
  reducers: {},

  // asynchronous reducers
  extraReducers: (builder) => {},
});

export default orderInputSlice.reducer;
