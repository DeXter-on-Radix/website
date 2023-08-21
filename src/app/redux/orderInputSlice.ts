import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as adex from "alphadex-sdk-js";
import { RootState } from "./store";
import { createSelector } from "@reduxjs/toolkit";
import { getRdt, RDT } from "../subscriptions";
import { fetchBalances } from "./pairSelectorSlice";
import { SdkResult } from "alphadex-sdk-js/lib/models/sdk-result";

export enum OrderTab {
  MARKET,
  LIMIT,
}

export const PLATFORM_BADGE_ID = 1; //TODO: Get this data from the platform badge
export const PLATFORM_FEE = 0.001; //TODO: Get this data from the platform badge

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
  transactionInProgress: boolean;
  transactionResult?: string;
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
  transactionInProgress: false,
};

export const fetchQuote = createAsyncThunk<
  Quote, // Return type of the payload creator
  undefined, // set to undefined if the thunk doesn't expect any arguments
  { state: RootState }
>("orderInput/fetchQuote", async (_arg, thunkAPI) => {
  const state = thunkAPI.getState();
  if (state.pairSelector.address === "") {
    throw new Error("Pair address is not initilized yet.");
  }

  let priceToSend = undefined;
  let slippageToSend = undefined;

  if (state.orderInput.tab === OrderTab.LIMIT) {
    priceToSend = state.orderInput.price;
  } else {
    slippageToSend = state.orderInput.slippage;
  }

  const response = await adex.getExchangeOrderQuote(
    state.pairSelector.address,
    adexOrderType(state.orderInput),
    state.orderInput.side,
    getSelectedToken(state).address,
    state.orderInput.size,
    PLATFORM_FEE,
    priceToSend,
    slippageToSend
  );
  const quote = JSON.parse(JSON.stringify(response.data));
  return { ...quote };
});

export const setSizePercent = createAsyncThunk<
  undefined,
  number,
  { state: RootState }
>("orderInput/setSizePercent", async (percentage, thunkAPI) => {
  const state = thunkAPI.getState();
  const dispatch = thunkAPI.dispatch;
  const side = state.orderInput.side;
  const proportion = percentage / 100;

  let balance;
  // TODO: check if this is correct compare to non-redux version
  // https://github.com/DeXter-on-Radix/website/blob/b553c1d3dabf691961f1243d166ac71395dc3d4d/src/app/OrderButton.tsx#L314-L367
  // TODO: add tests for this
  if (side === OrderSide.BUY) {
    // TODO: check what to do with the slippage here
    if (state.orderInput.tab === OrderTab.MARKET) {
      const quote = await adex.getExchangeOrderQuote(
        state.pairSelector.address,
        adexOrderType(state.orderInput),
        adex.OrderSide.SELL,
        getUnselectedToken(state).address,
        (getUnselectedToken(state).balance || 0) * proportion,
        PLATFORM_FEE,
        undefined,
        10
      );
      balance = quote.data.toAmount;
    } else {
      // for limit orders we can just calculate based on balance and price
      balance =
        (getUnselectedToken(state).balance || 0) * state.orderInput.price;
    }
  } else {
    balance = getSelectedToken(state).balance;
  }

  let newSize = proportion * (balance || 0);
  // Round to maxDigits
  const maxDigits = getSelectedToken(state).maxDigits;
  newSize = Number(
    (
      Math.floor(newSize * Math.pow(10, maxDigits)) / Math.pow(10, maxDigits)
    ).toFixed(maxDigits)
  );

  dispatch(orderInputSlice.actions.setSize(newSize));

  return undefined;
});

export const submitOrder = createAsyncThunk<
  SdkResult,
  undefined,
  { state: RootState }
>("orderInput/submitOrder", async (_arg, thunkAPI) => {
  const state = thunkAPI.getState();
  const dispatch = thunkAPI.dispatch;
  const rdt = getRdt();

  if (!rdt) {
    throw new Error("RDT is not initialized yet.");
  }

  const result = await createTx(state, rdt);
  dispatch(fetchBalances());

  return result;
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
    // fetchQuote
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

    // submitOrder
    builder.addCase(submitOrder.pending, (state, action) => {
      state.transactionInProgress = true;
      state.transactionResult = undefined;
    });
    builder.addCase(submitOrder.fulfilled, (state, action) => {
      state.transactionInProgress = false;
      state.transactionResult = action.payload.message;
    });
    builder.addCase(submitOrder.rejected, (state, action) => {
      state.transactionInProgress = false;
      state.transactionResult = action.error.message;
    });
  },
});

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

async function createTx(state: RootState, rdt: RDT) {
  const tab = state.orderInput.tab;
  const price = state.orderInput.price;
  const slippage = state.orderInput.slippage;
  const orderPrice = tab === OrderTab.LIMIT ? price : -1;
  const orderSlippage = tab === OrderTab.MARKET ? slippage : -1;
  const createOrderResponse = await adex.createExchangeOrderTx(
    state.pairSelector.address,
    adexOrderType(state.orderInput),
    state.orderInput.side,
    getSelectedToken(state).address,
    state.orderInput.size,
    orderPrice,
    orderSlippage,
    PLATFORM_BADGE_ID,
    state.radix?.walletData.accounts[0]?.address || "",
    state.radix?.walletData.accounts[0]?.address || ""
  );

  let submitTransactionResponse = await adex.submitTransaction(
    createOrderResponse.data,
    rdt
  );

  submitTransactionResponse = JSON.parse(
    JSON.stringify(submitTransactionResponse)
  );

  return submitTransactionResponse;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

const selectSlippage = (state: RootState) => state.orderInput.slippage;
const selectPrice = (state: RootState) => state.orderInput.price;
const selectSize = (state: RootState) => state.orderInput.size;
const selectMinSize = (state: RootState) => state.orderInput.minSize;
const selectSide = (state: RootState) => state.orderInput.side;

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
  [selectSide, selectSize, selectMinSize, getSelectedToken, getUnselectedToken],
  (side, size, minSize, selectedToken, unselectedToken) => {
    if (size < minSize) {
      return { valid: false, message: "Position size is too small" };
    }

    if (side === OrderSide.SELL && size > (selectedToken.balance || 0)) {
      return { valid: false, message: "Insufficient funds" };
    }

    if (size.toString().split(".")[1]?.length > selectedToken.maxDigits) {
      return { valid: false, message: "Too many decimal places" };
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
    //TODO: Check user has funds for tx (done for SELL orders)
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
