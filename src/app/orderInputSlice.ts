import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as adex from "alphadex-sdk-js";
import { RootState } from "./store";
import { SdkResult } from "alphadex-sdk-js/lib/models/sdk-result";

export enum OrderTab {
  MARKET,
  LIMIT,
}

export interface OrderInputState {
  tab: OrderTab;
  preventImmediateExecution: boolean;
  side: adex.OrderSide;
  tokenFrom: adex.TokenInfo;
  tokenTo: adex.TokenInfo;
  size: number;
  price: number;
  slippage: number;
}

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

const adexInitialState = new adex.StaticState(adex.clientState.internalState);
const initialState: OrderInputState = {
  tab: OrderTab.MARKET,
  preventImmediateExecution: false,
  side: adex.OrderSide.BUY,
  // converting to avoid error: A non-serializable value was detected in the state
  tokenFrom: { ...adexInitialState.currentPairInfo.token1 },
  tokenTo: { ...adexInitialState.currentPairInfo.token2 },
  size: 0,
  price: -1,
  slippage: -1,
};

// function swapInfo(
//   fromName: string,
//   fromAmount: number,
//   toName: string,
//   toAmount: number,
//   extraText?: string
// ) {
//   let text: string = `Sending ${fromAmount} ${fromName} to receive ${toAmount} ${toName}`;
//   if (
//     (orderSide === adex.OrderSide.SELL && fromAmount < positionSize * 0.99) ||
//     (orderSide === adex.OrderSide.BUY && toAmount < positionSize * 0.99)
//   ) {
//     text =
//       text +
//       ". !!! Order size greater than available liquidity. Reduce order or increase slippage !!!";
//   }

//   return text + extraText;
// }

const fetchQuote = createAsyncThunk(
  "orderInput/fetchQuote",
  async (thunkAPI: { getState: () => RootState }) => {
    const state = thunkAPI.getState();
    // TODO: test and re-implement this logic with less state
    // const minPosition = token1Selected
    //   ? adexState.currentPairInfo.minOrderToken1
    //   : adexState.currentPairInfo.minOrderToken2;

    // if (
    //   orderSide !== adex.OrderSide.BUY &&
    //   (positionSize < minPosition || !positionSize)
    // ) {
    //   return null;
    // }

    const platformFee = 0.001; //TODO: Get this data from the platform badge and set it as a global variable
    // const orderPrice =
    //   state.orderType === adex.OrderType.MARKET ? -1 : state.orderPrice;
    // const orderSlippage =
    //   state.orderType === adex.OrderType.MARKET
    //     ? state.slippagePercent / 100
    //     : -1;

    const response = await adex.getExchangeOrderQuote(
      state.pairInfo.address,
      adexOrderType(state.orderInput),
      state.orderInput.side,
      state.orderInput.tokenTo.address,
      state.orderInput.size,
      platformFee,
      state.orderInput.price,
      state.orderInput.slippage
    );
    return response.data;
  }
);

export const orderInputSlice = createSlice({
  name: "orderInput",
  initialState,

  // synchronous reducers
  reducers: {
    setOrderType(state, action: PayloadAction<OrderTab>) {
      state.tab = action.payload;
    },
    setOrderSide(state, action: PayloadAction<adex.OrderSide>) {
      state.side = action.payload;
    },
    updateAdex: (
      state: OrderInputState,
      action: PayloadAction<adex.StaticState>
    ) => {
      const adexState = action.payload;

      // TODO:
    },
  },

  // asynchronous reducers
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(
      fetchQuote.fulfilled,
      (state, action: PayloadAction<SdkResult>) => {
        console.log("TODO: fetchQuote.fulfilled");
        console.log("action:", action);
        console.log("state:", state);
      }
    );
  },
});

export default orderInputSlice.reducer;
