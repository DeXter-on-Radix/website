import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as adex from "alphadex-sdk-js";
import { RootState } from "./store";
import { createSelector } from "@reduxjs/toolkit";

export enum OrderTab {
  MARKET,
  LIMIT,
}

export const OrderSide = adex.OrderSide;
export type OrderSide = adex.OrderSide;
export type Quote = adex.Quote;

export interface OrderInputState {
  token1Selected: boolean;
  tab: OrderTab;
  preventImmediateExecution: boolean;
  side: OrderSide;
  size: number;
  minSize: number;
  price: number;
  toAmountEstimate: number;
  slippage: number;
  quote?: Quote;
  description?: string;
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
  token1Selected: true,
  tab: OrderTab.MARKET,
  preventImmediateExecution: false,
  side: adex.OrderSide.BUY,
  size: 0,
  minSize: 0,
  price: 0,
  slippage: 0.01,
  toAmountEstimate: 0,
};

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

const selectSlippage = (state: RootState) => state.orderInput.slippage;
const selectPrice = (state: RootState) => state.orderInput.price;
const selectSize = (state: RootState) => state.orderInput.size;
const selectMinSize = (state: RootState) => state.orderInput.minSize;

export const validateSlippageInput = createSelector(
  [selectSlippage],
  (slippage) => {
    if (slippage <= 0) {
      return { valid: false, message: "Slippage must be positive" };
    }

    return { valid: true };
  }
);

export const validatePriceInput = createSelector([selectPrice], (price) => {
  if (price <= 0) {
    return { valid: false, message: "Price must be greater than 0" };
  }

  return { valid: true };
});

export const validatePositionSize = createSelector(
  [selectSize, selectMinSize],
  (size, minSize) => {
    if (size < minSize) {
      return { valid: false, message: "Position size is too small" };
    }

    return { valid: true };
  }
);

const selectTab = (state: RootState) => state.orderInput.tab;
export const validateOrderInput = createSelector(
  [validatePositionSize, validatePriceInput, validateSlippageInput, selectTab],
  (
    sizeValidationResult,
    priceValidationResult,
    slippageValidationResult,
    tab
  ) => {
    //TODO: Check user has funds for tx
    //TODO: Check for crazy slippage
    //TODO: Fat finger checks
    if (!sizeValidationResult.valid) {
      return sizeValidationResult;
    }

    if (tab === OrderTab.LIMIT && !priceValidationResult.valid) {
      return priceValidationResult;
    }

    if (tab === OrderTab.MARKET && !slippageValidationResult.valid) {
      return slippageValidationResult;
    }

    return { valid: true };
  }
);
export const fetchQuote = createAsyncThunk<
  Quote, // Return type of the payload creator
  undefined, // set to undefined if the thunk doesn't expect any arguments
  {
    state: RootState;
  }
>("orderInput/fetchQuote", async (_arg, thunkAPI) => {
  const state = thunkAPI.getState();

  if (state.pairSelector.address === "") {
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
    getSelectedToken(state).address,
    state.orderInput.size,
    platformFee,
    price,
    slippage
  );

  const serializabledQuote = JSON.parse(JSON.stringify(response.data));
  return { ...serializabledQuote };
});

const selectToken1 = (state: RootState) => state.pairSelector.token1;
const selectToken2 = (state: RootState) => state.pairSelector.token2;
const selectToken1Selected = (state: RootState) =>
  state.orderInput.token1Selected;

export const getSelectedToken = createSelector(
  [selectToken1, selectToken2, selectToken1Selected],
  (token1, token2, token1Selected) => {
    if (token1Selected) {
      return token1;
    } else {
      return token2;
    }
  }
);

export const getUnselectedToken = createSelector(
  [selectToken1, selectToken2, selectToken1Selected],
  (token1, token2, token1Selected) => {
    if (token1Selected) {
      return token2;
    } else {
      return token1;
    }
  }
);

export const orderInputSlice = createSlice({
  name: "orderInput",
  initialState,

  // synchronous reducers
  reducers: {
    setActiveTab(state, action: PayloadAction<OrderTab>) {
      state.tab = action.payload;
    },
    setToken1Selected(state, action: PayloadAction<boolean>) {
      state.token1Selected = action.payload;
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
    togglePreventImmediateExecution(state) {
      state.preventImmediateExecution = !state.preventImmediateExecution;
    },
    updateAdex: (
      state: OrderInputState,
      action: PayloadAction<adex.StaticState>
    ) => {
      const adexState = action.payload;

      if (state.token1Selected) {
        state.minSize = adexState.currentPairInfo.minOrderToken1;
      } else {
        state.minSize = adexState.currentPairInfo.minOrderToken2;
      }
    },
  },

  // asynchronous reducers
  extraReducers: (builder) => {
    builder.addCase(
      fetchQuote.fulfilled,
      (state, action: PayloadAction<Quote>) => {
        const quote = action.payload;

        if (!quote) {
          throw new Error("Invalid quote");
        }

        state.quote = quote;
        state.description = toDescription(quote, state);
      }
    );

    builder.addCase(fetchQuote.rejected, (state, action) => {
      console.error("fetchQuote rejected:", action.error.message);
    });
  },
});

export default orderInputSlice.reducer;

function toDescription(quote: Quote, state: OrderInputState): string {
  let description = "";

  if (quote.fromAmount > 0 && quote.toAmount > 0) {
    description +=
      `Sending ${quote.fromAmount} ${quote.fromToken.symbol} ` +
      `to receive ${quote.toAmount} ${quote.toToken.symbol}.\n`;
  } else {
    description += "Order will not immediately execute.\n";
  }

  return description;
}
