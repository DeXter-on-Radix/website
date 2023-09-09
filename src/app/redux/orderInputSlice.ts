import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import * as adex from "alphadex-sdk-js";
import { RootState } from "./store";
import { createSelector } from "@reduxjs/toolkit";
import { getRdt, RDT } from "../subscriptions";
import { AMOUNT_MAX_DECIMALS, fetchBalances } from "./pairSelectorSlice";
// import { selectBestBuy, selectBestSell } from "./orderBookSlice";
import { SdkResult } from "alphadex-sdk-js/lib/models/sdk-result";
import * as utils from "../utils";
import { fetchAccountHistory } from "./accountHistorySlice";
import { selectBestBuy, selectBestSell } from "./orderBookSlice";
import { displayAmount } from "../utils";

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
  price: number;
  slippage: number;
  quote?: Quote;
  description?: string;
  transactionInProgress: boolean;
  transactionResult?: string;
  fromSize?: number;
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
  price: 0,
  slippage: 0.01,
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
  if (!state.orderInput.size) {
    return;
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
  //Depending on the combination of input settings, the position size
  //is set to x% of the tokens that will leave the user wallet
  const state = thunkAPI.getState();
  const dispatch = thunkAPI.dispatch;
  const side = state.orderInput.side;
  const proportion = percentage / 100;
  if (proportion < 0) {
    dispatch(orderInputSlice.actions.setSize(0));
    return;
  }
  if (percentage > 100) {
    percentage = Math.floor(percentage / 10);
    dispatch(setSizePercent(percentage));
    return;
  }
  let balance;
  // TODO: add tests for this
  if (side === OrderSide.BUY) {
    const unselectedBalance = utils.roundTo(
      proportion * (getUnselectedToken(state).balance || 0),
      AMOUNT_MAX_DECIMALS - 1,
      utils.RoundType.DOWN
    );
    if (state.orderInput.tab === OrderTab.MARKET) {
      //Market buy needs to get a quote to work out what will be returned
      const quote = await adex.getExchangeOrderQuote(
        state.pairSelector.address,
        adexOrderType(state.orderInput),
        adex.OrderSide.SELL,
        getUnselectedToken(state).address,
        unselectedBalance,
        PLATFORM_FEE,
        -1,
        state.orderInput.slippage
      );
      balance = quote.data.toAmount;
      if (quote.data.fromAmount < unselectedBalance) {
        //TODO: Display this message properly
        console.log(
          "Insufficient liquidity to execute full market order. Increase slippage or reduce position"
        );
      }
    } else {
      // for limit buy orders we can just calculate based on balance and price
      if (selectToken1Selected(state)) {
        balance = (proportion * unselectedBalance) / state.orderInput.price;
      } else {
        balance = proportion * unselectedBalance * state.orderInput.price;
      }
    }
  } else {
    //for sell orders the calculation is very simple
    balance = getSelectedToken(state).balance || 0 * proportion;
    //for market sell orders the order quote is retrieved to check liquidity.
    if (state.orderInput.tab === OrderTab.MARKET) {
      const quote = await adex.getExchangeOrderQuote(
        state.pairSelector.address,
        adexOrderType(state.orderInput),
        adex.OrderSide.SELL,
        getSelectedToken(state).address,
        balance || 0,
        PLATFORM_FEE,
        -1,
        state.orderInput.slippage
      );
      if (quote.data.fromAmount < balance) {
        balance = quote.data.fromAmount;
        //TODO: Display this message properly
        console.log(
          "Insufficient liquidity to execute full market order. Increase slippage or reduce position"
        );
      }
    }
  }
  const newSize = utils.roundTo(
    balance || 0,
    adex.AMOUNT_MAX_DECIMALS,
    utils.RoundType.DOWN
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
  //Updates account history + balances
  dispatch(fetchBalances());
  dispatch(fetchAccountHistory());

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
      setFromSize(state);
    },
    setSize(state, action: PayloadAction<number>) {
      state.size = action.payload;
      setFromSize(state);
    },
    setSide(state, action: PayloadAction<OrderSide>) {
      state.side = action.payload;
      setFromSize(state);
    },
    setPrice(state, action: PayloadAction<number>) {
      state.price = action.payload;
    },
    setSlippage(state, action: PayloadAction<number>) {
      if (action.payload <= 1) {
        state.slippage = action.payload;
      } else {
        state.slippage = 1;
      }
    },
    togglePreventImmediateExecution(state) {
      state.preventImmediateExecution = !state.preventImmediateExecution;
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
        state.fromSize = quote.fromAmount;
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

function setFromSize(state: OrderInputState) {
  //Sets the amount of token leaving the user wallet
  if (state.side === OrderSide.SELL) {
    state.fromSize = state.size;
  } else if (state.tab === OrderTab.LIMIT) {
    if (state.token1Selected) {
      state.fromSize = state.size * state.price;
    } else {
      state.fromSize = state.size / state.price;
    }
  } else {
    state.fromSize = 0; //will update when quote is requested
  }
}

function toDescription(quote: Quote, state: OrderInputState): string {
  let description = "";

  if (quote.fromAmount > 0 && quote.toAmount > 0) {
    description +=
      `Sending ${displayAmount(quote.fromAmount, 8)} ${
        quote.fromToken.symbol
      } ` +
      `to receive ${displayAmount(quote.toAmount, 8)} ${
        quote.toToken.symbol
      }.\n`;
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
  //Adex creates the transaction manifest
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
  //Then submits the order to the wallet
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
  message: string;
}

const selectSlippage = (state: RootState) => state.orderInput.slippage;
const selectPrice = (state: RootState) => state.orderInput.price;
const selectSize = (state: RootState) => state.orderInput.size;
const selectSide = (state: RootState) => state.orderInput.side;
const selectFromSize = (state: RootState) => state.orderInput.fromSize;
const selectPriceMaxDecimals = (state: RootState) => {
  return state.pairSelector.priceMaxDecimals;
};

export const validateSlippageInput = createSelector(
  [selectSlippage],
  (slippage) => {
    if (slippage < 0) {
      return { valid: false, message: "Slippage must be positive" };
    }

    if (slippage >= 0.05) {
      return { valid: true, message: "High slippage entered" };
    }

    return { valid: true, message: "" };
  }
);

export const validatePriceInput = createSelector(
  [
    selectPrice,
    selectPriceMaxDecimals,
    selectBestBuy,
    selectBestSell,
    selectSide,
    selectToken1Selected,
  ],
  (price, priceMaxDecimals, bestBuy, bestSell, side, token1Selected) => {
    if (price <= 0) {
      return { valid: false, message: "Price must be greater than 0" };
    }

    if (price.toString().split(".")[1]?.length > priceMaxDecimals) {
      return { valid: false, message: "Too many decimal places" };
    }

    if (
      ((side === OrderSide.BUY && token1Selected) ||
        (side === OrderSide.SELL && !token1Selected)) &&
      bestSell
        ? price > bestSell * 1.05
        : false
    ) {
      return {
        valid: true,
        message: "Price is significantly higher than best sell",
      };
    }

    if (
      ((side === OrderSide.SELL && token1Selected) ||
        (side === OrderSide.BUY && !token1Selected)) &&
      bestBuy
        ? price < bestBuy * 0.95
        : false
    ) {
      return {
        valid: true,
        message: "Price is significantly lower than best buy",
      };
    }
    return { valid: true, message: "" };
  }
);

export const validatePositionSize = createSelector(
  [
    selectSide,
    selectSize,
    getSelectedToken,
    getUnselectedToken,
    selectFromSize,
  ],
  (side, size, selectedToken, unSelectedToken, fromSize) => {
    if (size.toString().split(".")[1]?.length > adex.AMOUNT_MAX_DECIMALS) {
      return { valid: false, message: "Too many decimal places" };
    }

    if (size <= 0) {
      return { valid: false, message: "Order size must be greater than 0" };
    }
    if (
      (side === OrderSide.SELL &&
        selectedToken.balance &&
        size > selectedToken.balance) ||
      (side === OrderSide.BUY &&
        unSelectedToken.balance &&
        fromSize &&
        fromSize > unSelectedToken.balance)
    ) {
      return { valid: false, message: "Insufficient funds" };
    }

    //Checks user isn't using all their xrd. maybe excessive
    const MIN_XRD_BALANCE = 25;
    if (
      (side === OrderSide.SELL &&
        selectedToken.symbol === "XRD" &&
        selectedToken.balance &&
        size > selectedToken.balance - MIN_XRD_BALANCE) ||
      (side === OrderSide.BUY &&
        unSelectedToken.balance &&
        unSelectedToken.symbol === "XRD" &&
        fromSize &&
        fromSize > unSelectedToken.balance - MIN_XRD_BALANCE)
    ) {
      return {
        valid: true,
        message: "WARNING: Leaves XRD balance dangerously low",
      };
    }

    return { valid: true, message: "" };
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
