import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as adex from "alphadex-sdk-js";
import { RootState } from "./store";
import { TokenInfo, initalTokenInfo } from "./pairSelectorSlice";

export enum OrderTab {
  MARKET,
  LIMIT,
}

export const OrderSide = adex.OrderSide;
export type OrderSide = adex.OrderSide;
export type Quote = adex.Quote;

export interface OrderInputState {
  pairAddress: string;
  tab: OrderTab;
  preventImmediateExecution: boolean;
  side: OrderSide;
  tokenFrom: TokenInfo;
  tokenTo: TokenInfo;
  size: number;
  minSize: number;
  price: number;
  toAmountEstimate: number;
  slippage: number;
  quote?: Quote;
}

// TODO: add unit tests for this function
function adexOrderType(state: OrderInputState): adex.OrderType {
  if (state.tab === OrderTab.MARKET) {
    return adex.OrderType.MARKET;
  }
  if (state.tab === OrderTab.LIMIT) {
    if (state.preventImmediateExecution) {
      return adex.OrderType.POSTONLY;
    } else {
      return adex.OrderType.LIMIT;
    }
  }

  throw new Error("Invalid order type");
}

const initialState: OrderInputState = {
  pairAddress: "",
  tab: OrderTab.MARKET,
  preventImmediateExecution: false,
  side: adex.OrderSide.BUY,
  tokenFrom: { ...initalTokenInfo },
  tokenTo: { ...initalTokenInfo },
  size: 0,
  minSize: 0,
  price: 0,
  slippage: 0.01,
  toAmountEstimate: 0,
};

export const fetchQuote = createAsyncThunk<
  Quote, // Return type of the payload creator
  undefined, // set to undefined if the thunk doesn't expect any arguments
  {
    state: RootState;
  }
>("orderInput/fetchQuote", async (_arg, thunkAPI) => {
  const state = thunkAPI.getState();

  if (state.orderInput.pairAddress === "") {
    throw new Error("Pair address is not initilized yet.");
  }

  if (state.orderInput.size < state.orderInput.minSize) {
    // TODO: feedback to user directly in the UI

    throw new Error(
      `Order size ${state.orderInput.size} is less than minimum size ${state.orderInput.minSize}`
    );
  }

  const platformFee = 0.001; //TODO: Get this data from the platform badge and set it as a global variable
  let price = undefined;
  let slippage = undefined;

  // TODO: validate input before fetching quote
  if (state.orderInput.tab === OrderTab.LIMIT) {
    price = state.orderInput.price;
    if (price < 0) {
      throw new Error("Invalid price");
    }
  } else if (state.orderInput.tab === OrderTab.MARKET) {
    slippage = state.orderInput.slippage;
  }

  const response = await adex.getExchangeOrderQuote(
    state.pairSelector.address,
    adexOrderType(state.orderInput),
    state.orderInput.side,
    state.orderInput.tokenTo.address,
    state.orderInput.size,
    platformFee,
    price,
    slippage
  );

  const serializabledQuote = JSON.parse(JSON.stringify(response.data));
  return { ...serializabledQuote };
});

export const orderInputSlice = createSlice({
  name: "orderInput",
  initialState,

  // synchronous reducers
  reducers: {
    setActiveTab(state, action: PayloadAction<OrderTab>) {
      state.tab = action.payload;
    },
    setSize(state, action: PayloadAction<number>) {
      state.size = action.payload;
    },
    setSide(state, action: PayloadAction<OrderSide>) {
      state.side = action.payload;
    },
    setPrice(state, action: PayloadAction<number>) {
      state.price = action.payload;
    },
    setSlippage(state, action: PayloadAction<number>) {
      state.slippage = action.payload;
    },
    toggleDirection(state) {
      const temp = state.tokenFrom;
      state.tokenFrom = state.tokenTo;
      state.tokenTo = temp;
    },
    updateAdex: (
      state: OrderInputState,
      action: PayloadAction<adex.StaticState>
    ) => {
      const adexState = action.payload;

      if (state.pairAddress !== adexState.currentPairInfo.address) {
        state.tokenFrom = {
          ...adexState.currentPairInfo.token1,
          maxDigits: adexState.currentPairInfo.maxDigitsToken1,
        };
        state.tokenTo = {
          ...adexState.currentPairInfo.token2,
          maxDigits: adexState.currentPairInfo.maxDigitsToken2,
        };
      }

      state.pairAddress = adexState.currentPairInfo.address;

      // TODO: add unit tests for this logic
      if (state.tokenTo.address == adexState.currentPairInfo.token1.address) {
        state.minSize = adexState.currentPairInfo.minOrderToken1;
      } else if (
        state.tokenTo.address == adexState.currentPairInfo.token2.address
      ) {
        state.minSize = adexState.currentPairInfo.minOrderToken2;
      }
    },

    clearQuote(state) {
      state.quote = undefined;
    },
  },

  // asynchronous reducers
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(
      fetchQuote.fulfilled,
      (state, action: PayloadAction<Quote>) => {
        const quote = action.payload;
        console.log("quote:", quote);

        if (!quote) {
          throw new Error("Invalid quote");
        }

        state.quote = quote;
      }
    );

    builder.addCase(fetchQuote.rejected, (state, action) => {
      console.log("fetchQuote rejected:", action.error.message);
    });
  },
});

export default orderInputSlice.reducer;
