import type { PayloadAction } from "@reduxjs/toolkit";
import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import * as adex from "alphadex-sdk-js";
import { SdkResult } from "alphadex-sdk-js/lib/models/sdk-result";
import { RDT, getRdt } from "../subscriptions";
import { displayAmount } from "../utils";
import { fetchAccountHistory } from "./accountHistorySlice";
import { selectBestBuy, selectBestSell } from "./orderBookSlice";
import { fetchBalances } from "./pairSelectorSlice";
import { RootState } from "./store";

export enum OrderTab {
  MARKET = "MARKET",
  LIMIT = "LIMIT",
}

export const PLATFORM_BADGE_ID = 1; //TODO: Get this data from the platform badge
export const PLATFORM_FEE = 0.001; //TODO: Get this data from the platform badge

export const OrderSide = adex.OrderSide;
export type OrderSide = adex.OrderSide;
export type Quote = adex.Quote;

export interface ValidationResult {
  valid: boolean;
  message: string;
}

export interface TokenInput {
  address: string;
  symbol: string;
  iconUrl: string;
  valid: boolean;
  message: string;
  amount: number | "";
}

export interface OrderInputState {
  token1: TokenInput;
  token2: TokenInput;
  tab: OrderTab;
  postOnly: boolean;
  side: OrderSide;
  price: number;
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
    if (state.postOnly) {
      return adex.OrderType.POSTONLY;
    } else {
      return adex.OrderType.LIMIT;
    }
  }

  throw new Error("Invalid order type");
}

const initialTokenInput = {
  address: "",
  symbol: "",
  iconUrl: "",
  amount: 0,
  valid: true,
  message: "",
};

const initialState: OrderInputState = {
  token1: initialTokenInput,
  token2: initialTokenInput,
  tab: OrderTab.MARKET,
  postOnly: true,
  side: adex.OrderSide.BUY,
  price: 0,
  slippage: 0.01,
  transactionInProgress: false,
};

export const fetchQuote = createAsyncThunk<
  Quote | undefined, // Return type of the payload creator
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
  const targetToken = selectTargetToken(state);

  if (!targetToken?.amount) {
    throw new Error("No amount specified when fetching quote.");
  }

  const response = await adex.getExchangeOrderQuote(
    state.pairSelector.address,
    adexOrderType(state.orderInput),
    state.orderInput.side,
    targetToken.address,
    targetToken.amount,
    PLATFORM_FEE,
    priceToSend,
    slippageToSend
  );
  const quote = JSON.parse(JSON.stringify(response.data));

  return { ...quote };
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

export const selectTargetToken = (state: RootState) => {
  if (state.orderInput.tab === OrderTab.MARKET) {
    if (state.orderInput.side === OrderSide.SELL) {
      return state.orderInput.token1;
    } else {
      return state.orderInput.token2;
    }
  } else {
    return state.orderInput.token1;
  }
};
const selectSlippage = (state: RootState) => state.orderInput.slippage;
const selectPrice = (state: RootState) => state.orderInput.price;
const selectSide = (state: RootState) => state.orderInput.side;
const selectPriceMaxDecimals = (state: RootState) => {
  return state.pairSelector.priceMaxDecimals;
};
const selectToken1 = (state: RootState) => state.orderInput.token1;
const selectToken2 = (state: RootState) => state.orderInput.token2;

// for getting balances out of pairSelector slice
const selectInfoToken1 = (state: RootState) => state.pairSelector.token1;
const selectInfoToken2 = (state: RootState) => state.pairSelector.token2;
export const selectBalanceByAddress = createSelector(
  [
    selectInfoToken1,
    selectInfoToken2,
    (state: RootState, address: string) => address,
  ],

  (infoToken1, infoToken2, address) => {
    if (infoToken1.address === address) {
      return infoToken1.balance;
    } else if (infoToken2.address === address) {
      return infoToken2.balance;
    } else {
      return 0;
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
    updateAdex(state, action: PayloadAction<adex.StaticState>) {
      const serializedState: adex.StaticState = JSON.parse(
        JSON.stringify(action.payload)
      );
      const adexToken1 = serializedState.currentPairInfo.token1;
      const adexToken2 = serializedState.currentPairInfo.token2;
      if (state.token1.address !== adexToken1.address) {
        state.token1 = {
          address: adexToken1.address,
          symbol: adexToken1.symbol,
          iconUrl: adexToken1.iconUrl,
          amount: "",
          valid: true,
          message: "",
        };
      }
      if (state.token2.address !== adexToken2.address) {
        state.token2 = {
          address: adexToken2.address,
          symbol: adexToken2.symbol,
          iconUrl: adexToken2.iconUrl,
          amount: "",
          valid: true,
          message: "",
        };
      }

      // set up a valid default price
      if (state.price === 0) {
        state.price =
          serializedState.currentPairOrderbook.buys?.[0]?.price || 0;
      }
    },
    setAmountToken1(
      state,
      action: PayloadAction<{ amount: number | ""; balance: number }>
    ) {
      const { amount, balance } = action.payload;
      let token = {
        ...state.token1,
        amount,
      };
      token = validateAmountWithBalance({ token, balance });
      state.token1 = token;

      if (amount === "") {
        state.token2.amount = "";
      }
    },
    setAmountToken2(state, action: PayloadAction<number | "">) {
      const amount = action.payload;
      let token2 = {
        ...state.token2,
        amount,
      };

      token2 = validateAmount(token2);
      state.token2 = token2;

      if (amount === "") {
        state.token1.amount = "";
      }
    },
    swapTokens(state) {
      const temp = state.token1;
      state.token1 = state.token2;
      state.token2 = temp;
    },
    setSide(state, action: PayloadAction<OrderSide>) {
      state.side = action.payload;
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
    togglePostOnly(state) {
      state.postOnly = !state.postOnly;
    },
  },

  // asynchronous reducers
  extraReducers: (builder) => {
    // fetchQuote
    builder.addCase(fetchQuote.pending, (state) => {
      state.quote = undefined;
      state.description = undefined;
    });

    builder.addCase(
      fetchQuote.fulfilled,
      (state, action: PayloadAction<Quote | undefined>) => {
        const quote = action.payload;

        if (!quote) {
          throw new Error("Invalid quote");
        }

        state.quote = quote;
        state.description = toDescription(quote);
        if (state.tab === OrderTab.MARKET) {
          if (state.side === OrderSide.SELL) {
            state.token2.amount = quote.toAmount;
          } else {
            state.token1.amount = quote.fromAmount;
          }

          if (quote.message.startsWith("Not enough liquidity")) {
            if (state.tab === OrderTab.MARKET) {
              if (state.side === OrderSide.SELL) {
                state.token1.amount = quote.fromAmount;
                state.token1.message = "Not enough liquidity.";
              } else {
                state.token2.amount = quote.toAmount;
                state.token2.message = "Not enough liquidity.";
              }
            }
          }
        } else {
          // limit order
          // always changing the second token here because it's always the non-target token
          if (state.side === OrderSide.SELL) {
            state.token2.amount = Number(state.token1.amount) * state.price;
          } else {
            state.token2.amount = Number(state.token2.amount) / state.price;
          }
        }
      }
    );

    builder.addCase(fetchQuote.rejected, (state, action) => {
      if (state.side === OrderSide.SELL) {
        state.token2.amount = "";
        state.token2.valid = false;
        state.token2.message = "Could not get quote";
      } else {
        state.token1.amount = "";
        state.token1.valid = false;
        state.token1.message = "Could not get quote";
      }
      console.error("fetchQuote rejected:", action.error.message);
    });

    // submitOrder
    builder.addCase(submitOrder.pending, (state) => {
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

function toDescription(quote: Quote): string {
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
  const targetToken = selectTargetToken(state);

  if (!targetToken?.amount) {
    throw new Error("No amount specified when creating transaction.");
  }
  const createOrderResponse = await adex.createExchangeOrderTx(
    state.pairSelector.address,
    adexOrderType(state.orderInput),
    state.orderInput.side,
    targetToken.address,
    targetToken.amount,
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
  ],
  (price, priceMaxDecimals, bestBuy, bestSell, side) => {
    if (price <= 0) {
      return { valid: false, message: "Price must be greater than 0" };
    }

    if (price.toString().split(".")[1]?.length > priceMaxDecimals) {
      return { valid: false, message: "Too many decimal places" };
    }

    if (bestSell) {
      if (side === OrderSide.BUY && price > bestSell * 1.05) {
        return {
          valid: true,
          message: "Price is significantly higher than best sell",
        };
      }
    }

    if (bestBuy) {
      if (side === OrderSide.SELL && price < bestBuy * 0.95) {
        return {
          valid: true,
          message: "Price is significantly lower than best buy",
        };
      }
    }
    return { valid: true, message: "" };
  }
);

function validateAmount(token: TokenInput): TokenInput {
  const amount = token.amount;
  let valid = true;
  let message = "";
  if (amount.toString().split(".")[1]?.length > adex.AMOUNT_MAX_DECIMALS) {
    valid = false;
    message = "Too many decimal places";
  }

  if (amount !== "" && amount <= 0) {
    valid = false;
    message = "Amount must be greater than 0";
  }

  return { ...token, valid, message };
}

function validateAmountWithBalance({
  token,
  balance,
}: {
  token: TokenInput;
  balance: number;
}): TokenInput {
  if ((balance || 0) < (token.amount || 0)) {
    return { ...token, valid: false, message: "Insufficient funds" };
  } else {
    return validateAmount(token);
  }
}

const selectTab = (state: RootState) => state.orderInput.tab;
export const isValidQuoteInput = createSelector(
  [
    selectToken1,
    selectToken2,
    validatePriceInput,
    validateSlippageInput,
    selectTab,
  ],
  (token1, token2, priceValidationResult, slippageValidationResult, tab) => {
    if (!token1.valid || token1.amount === undefined) {
      return { valid: false, message: token1.message };
    }

    if (!token2.valid || token2.amount === undefined) {
      return { valid: false, message: token2.message };
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

export const isValidTransaction = createSelector(
  [isValidQuoteInput, selectToken1, selectToken2],
  (quoteInputValid, token1, token2) => {
    if (!quoteInputValid.valid) {
      return quoteInputValid;
    }
    if (token1.amount === "" || token2.amount === "") {
      return { valid: false };
    }

    return { valid: true };
  }
);
