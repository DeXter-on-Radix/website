import type { PayloadAction } from "@reduxjs/toolkit";
import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import * as adex from "alphadex-sdk-js";
import { SdkResult } from "alphadex-sdk-js/lib/models/sdk-result";
import { RDT, getRdt } from "../subscriptions";
import { RoundType, displayNumber, roundTo } from "../utils";
import { fetchAccountHistory } from "./accountHistorySlice";
import { selectBestBuy, selectBestSell } from "./orderBookSlice";
import { fetchBalances } from "./pairSelectorSlice";
import { RootState } from "./store";

export enum OrderTab {
  MARKET = "MARKET",
  LIMIT = "LIMIT",
}

export enum ErrorMessage {
  UNSPECIFIED_PRICE = "Price must be specified",
  NONZERO_PRICE = "Price must be greater than 0",
  NONZERO_AMOUNT = "Amount must be greater than 0",
  HIGH_PRICE = "Price is significantly higher than best sell",
  LOW_PRICE = "Price is significantly lower than best buy",
  EXCESSIVE_DECIMALS = "Too many decimal places",
  INSUFFICIENT_FUNDS = "Insufficient funds",
  //Slippage
  UNSPECIFIED_SLIPPAGE = "Slippage must be specified",
  NEGATIVE_SLIPPAGE = "Slippage must be positive",
  HIGH_SLIPPAGE = "High slippage entered",
}

export const PLATFORM_BADGE_ID = 4; //TODO: Get this data from the platform badge
export const PLATFORM_FEE = 0.001; //TODO: Get this data from the platform badge

export const OrderSide = adex.OrderSide;
export type OrderSide = adex.OrderSide;
export type Quote = adex.Quote;
interface QuoteWithPriceTokenAddress extends Quote {
  priceTokenAddress: string;
}

export interface TokenInfo extends adex.TokenInfo {
  decimals?: number;
}

export interface ValidationResult {
  valid: boolean;
  message: string;
}

export interface TokenInput {
  address: string;
  symbol: string;
  iconUrl: string;
  amount: number | "";
  decimals: number;
}

export interface OrderInputState {
  token1: TokenInput;
  validationToken1: ValidationResult;
  token2: TokenInput;
  validationToken2: ValidationResult;
  tab: OrderTab;
  postOnly: boolean;
  side: OrderSide;
  price: number | "";
  slippage: number | "";
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

export const initialTokenInput = {
  address: "",
  symbol: "",
  iconUrl: "",
  amount: 0,
  decimals: 0,
};

const initialValidationResult = {
  valid: true,
  message: "",
  decimals: 0,
};

export const initialState: OrderInputState = {
  token1: initialTokenInput,
  validationToken1: initialValidationResult,
  token2: initialTokenInput,
  validationToken2: initialValidationResult,
  tab: OrderTab.MARKET,
  postOnly: false,
  side: adex.OrderSide.BUY,
  price: 0,
  slippage: 0.01,
  transactionInProgress: false,
};

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
const selectToken1MaxDecimals = (state: RootState) => {
  return state.pairSelector.token1.decimals;
};
const selectToken2MaxDecimals = (state: RootState) => {
  return state.pairSelector.token2.decimals;
};

// TODO: find out if it's possible to do the same with less boilerplate
const selectToken1 = (state: RootState) => state.orderInput.token1;
const selectToken2 = (state: RootState) => state.orderInput.token2;
export const selectValidationToken1 = (state: RootState) =>
  state.orderInput.validationToken1;
export const selectValidationToken2 = (state: RootState) =>
  state.orderInput.validationToken2;
export const selectValidationByAddress = createSelector(
  [
    selectToken1,
    selectToken2,
    selectValidationToken1,
    selectValidationToken2,
    (state: RootState, address: string) => address,
  ],
  (token1, token2, validationToken1, validationToken2, address) => {
    if (token1.address === address) {
      return validationToken1;
    } else {
      return validationToken2;
    }
  }
);

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

export const fetchQuote = createAsyncThunk<
  QuoteWithPriceTokenAddress | undefined, // Return type of the payload creator
  undefined, // set to undefined if the thunk doesn't expect any arguments
  { state: RootState }
>("orderInput/fetchQuote", async (_arg, thunkAPI) => {
  const state = thunkAPI.getState();
  if (state.pairSelector.address === "") {
    throw new Error("Pair address is not initilized yet.");
  }

  let priceToSend = undefined;
  let slippageToSend = undefined;

  if (
    state.orderInput.tab === OrderTab.LIMIT &&
    state.orderInput.price !== ""
  ) {
    priceToSend = state.orderInput.price;
  } else if (state.orderInput.slippage !== "") {
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
    PLATFORM_BADGE_ID,
    priceToSend,
    slippageToSend
  );
  const quote: Quote = JSON.parse(JSON.stringify(response.data));

  return { ...quote, priceTokenAddress: state.pairSelector.token2.address };
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

export const orderInputSlice = createSlice({
  name: "orderInput",
  initialState,

  // synchronous reducers
  reducers: {
    setActiveTab(state, action: PayloadAction<OrderTab>) {
      state.tab = action.payload;
    },
    updateAdex(state, action: PayloadAction<adex.StaticState>) {
      //This clears up any validation when switching pairs
      /*
      state.validationToken1 = initialValidationResult;
      state.validationToken2 = initialValidationResult;

      //Clear up any previous inputs
      state.token1 = initialTokenInput;
      state.token2 = initialTokenInput;
      */
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
          decimals: serializedState.currentPairInfo.token1MaxDecimals,
        };
      }
      if (state.token2.address !== adexToken2.address) {
        state.token2 = {
          address: adexToken2.address,
          symbol: adexToken2.symbol,
          iconUrl: adexToken2.iconUrl,
          amount: "",
          decimals: serializedState.currentPairInfo.token2MaxDecimals,
        };
      }

      // Replace DEXTR iconUrl with coingecko hosted url.
      if (state.token1.symbol === "DEXTR") {
        state.token1.iconUrl =
          "https://assets.coingecko.com/coins/images/34946/standard/DEXTRLogo.jpg";
      }
      if (state.token2.symbol === "DEXTR") {
        state.token2.iconUrl =
          "https://assets.coingecko.com/coins/images/34946/standard/DEXTRLogo.jpg";
      }

      // set up a valid default price
      if (state.price === 0) {
        state.price =
          serializedState.currentPairOrderbook.buys?.[0]?.price || 0;
      }
    },
    setAmountToken1(state, action: PayloadAction<number | "">) {
      const amount = action.payload;
      let token = {
        ...state.token1,
        amount,
      };

      state.token1 = token;

      // FIXME: when deleting the amount very quickly with backspace,
      // state.token2.amount gets overritten with lagged quote data and stays filled in
      if (amount === "") {
        state.token2.amount = "";
      }
    },
    setAmountToken2(state, action: PayloadAction<number | "">) {
      const amount = action.payload;
      state.token2 = {
        ...state.token2,
        amount,
      };

      if (amount === "") {
        state.token1.amount = "";
      }
    },
    validateAmount(
      state,
      action: PayloadAction<{ amount: number | ""; address: string }>
    ) {
      const { amount, address: tokenAddress } = action.payload;
      if (tokenAddress === state.token1.address) {
        state.validationToken1 = _validateAmount(amount);
      } else if (tokenAddress === state.token2.address) {
        state.validationToken2 = _validateAmount(amount);
      }
    },
    validateAmountWithBalance(
      state,
      action: PayloadAction<{
        amount: number | "";
        address: string;
        balance: number;
      }>
    ) {
      const { amount, address: tokenAddress, balance } = action.payload;
      const validation = _validateAmountWithBalance({
        amount,
        balance,
        decimals: state.token1.decimals,
      });
      if (tokenAddress === state.token1.address) {
        state.validationToken1 = validation;
      } else if (tokenAddress === state.token2.address) {
        state.validationToken2 = validation;
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
    setPrice(state, action: PayloadAction<number | "">) {
      state.price = action.payload;
    },
    setSlippage(state, action: PayloadAction<number | "">) {
      state.slippage = action.payload;
    },
    togglePostOnly(state) {
      state.postOnly = !state.postOnly;
    },
    resetValidation(state) {
      state.validationToken1 = initialValidationResult;
      state.validationToken2 = initialValidationResult;
    },
    resetNumbersInput(state) {
      state.token1 = initialTokenInput;
      state.token2 = initialTokenInput;
      state.validationToken1 = initialValidationResult;
      state.validationToken2 = initialValidationResult;
      state.price = 0;
      state.slippage = 0.01;
      state.transactionInProgress = false;
      state.transactionResult = undefined;
      state.quote = undefined;
      state.description = undefined;
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
      (
        state,
        action: PayloadAction<QuoteWithPriceTokenAddress | undefined>
      ) => {
        const quote = action.payload;

        if (!quote) {
          console.debug("quote not valid", quote);
          return;
        }

        function quoteResultCodeOk(quote: Quote) {
          let ok = true;
          if (quote.resultCode < 100 || quote.resultCode > 199) {
            ok = false;
          }
          if (quote.resultCode === 5 || quote.resultCode === 6) {
            ok = true;
          }
          return ok;
        }
        if (!quoteResultCodeOk(quote)) {
          console.debug("quote not valid", quote);
          return;
        }

        state.quote = quote;
        state.description = toDescription(quote);

        if (state.tab === OrderTab.MARKET) {
          // MARKET

          // https://www.npmjs.com/package/alphadex-sdk-js#quoteresultmessages
          if (quote.resultCode === 5 || quote.resultCode === 6) {
            if (state.side === OrderSide.SELL) {
              state.validationToken1.valid = false;
              state.validationToken1.message = quote.resultMessageLong;
            } else {
              state.validationToken2.valid = false;
              state.validationToken2.message = quote.resultMessageLong;
            }
          } else {
            if (state.side === OrderSide.SELL) {
              state.token2.amount = quote.toAmount;
            } else {
              state.token1.amount = quote.fromAmount;
            }
          }
        } else {
          // LIMIT order
          // always changing the second token here because it's always the non-target token
          state.token2.amount = calculateCost(
            state.token1,
            state.price,
            quote.priceTokenAddress
          );
        }
      }
    );

    builder.addCase(fetchQuote.rejected, (state, action) => {
      if (state.tab === OrderTab.MARKET) {
        if (state.side === OrderSide.SELL) {
          state.token2.amount = "";
          state.validationToken2.valid = false;
          state.validationToken2.message = "Could not get quote";
        } else {
          state.token1.amount = "";
          state.validationToken1.valid = false;
          state.validationToken1.message = "Could not get quote";
        }
      }
      state.quote = undefined;
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
      `Sending ${displayNumber(quote.fromAmount, 8)} ${
        quote.fromToken.symbol
      } ` +
      `to receive ${displayNumber(quote.toAmount, 8)} ${
        quote.toToken.symbol
      }.\n`;
  }

  if (quote.resultMessageLong) {
    description += "\n" + quote.resultMessageLong;
  }

  return description;
}

async function createTx(state: RootState, rdt: RDT) {
  const tab = state.orderInput.tab;
  const targetToken = selectTargetToken(state);

  let slippage = -1;
  let price = -1;

  if (tab === OrderTab.MARKET && state.orderInput.slippage !== "") {
    slippage = state.orderInput.slippage;
  } else if (tab === OrderTab.LIMIT && state.orderInput.price !== "") {
    price = state.orderInput.price;
  }

  if (!targetToken?.amount) {
    throw new Error("No amount specified when creating transaction.");
  }

  //Adex creates the transaction manifest
  const createOrderResponse = await adex.createExchangeOrderTx(
    state.pairSelector.address,
    adexOrderType(state.orderInput),
    state.orderInput.side,
    targetToken.address,
    targetToken.amount,
    price,
    slippage,
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
    if (slippage === "") {
      return { valid: false, message: ErrorMessage.UNSPECIFIED_SLIPPAGE };
    }

    if (slippage < 0) {
      return { valid: false, message: ErrorMessage.NEGATIVE_SLIPPAGE };
    }

    if (slippage >= 0.05) {
      return { valid: true, message: ErrorMessage.HIGH_SLIPPAGE };
    }

    return { valid: true, message: "" };
  }
);

export const validatePriceInput = createSelector(
  [
    selectPrice,
    selectToken1MaxDecimals,
    selectToken2MaxDecimals,
    selectBestBuy,
    selectBestSell,
    selectSide,
  ],
  (
    price,
    selectToken1MaxDecimals,
    selectToken2MaxDecimals,
    bestBuy,
    bestSell,
    side
  ) => {
    if (price === "") {
      return { valid: false, message: ErrorMessage.UNSPECIFIED_PRICE };
    }

    if (price <= 0) {
      return { valid: false, message: ErrorMessage.NONZERO_PRICE };
    }

    if (selectToken1MaxDecimals !== undefined)
      if (price.toString().split(".")[1]?.length > selectToken1MaxDecimals) {
        return { valid: false, message: ErrorMessage.EXCESSIVE_DECIMALS };
      }
    if (selectToken2MaxDecimals !== undefined)
      if (price.toString().split(".")[1]?.length > selectToken2MaxDecimals) {
        return { valid: false, message: ErrorMessage.EXCESSIVE_DECIMALS };
      }

    if (bestSell) {
      if (side === OrderSide.BUY && price > bestSell * 1.05) {
        return {
          valid: true,
          message: ErrorMessage.HIGH_PRICE,
        };
      }
    }

    if (bestBuy) {
      if (side === OrderSide.SELL && price < bestBuy * 0.95) {
        return {
          valid: true,
          message: ErrorMessage.LOW_PRICE,
        };
      }
    }
    return { valid: true, message: "" };
  }
);

function _validateAmount(amount: number | ""): ValidationResult {
  let valid = true;
  let message = "";
  if (amount === "" || amount === undefined) {
    return { valid, message };
  }
  /*
  if (amount.toString().split(".")[1]?.length > decimals) {
    console.log(amount.toString().split(".")[1]?.length, " vs ", decimals);
    valid = false;
    message = ErrorMessage.EXCESSIVE_DECIMALS;
  }
*/
  if (amount <= 0) {
    valid = false;
    message = ErrorMessage.NONZERO_AMOUNT;
  }

  return { valid, message };
}

function _validateAmountWithBalance({
  amount,
  balance,
}: {
  amount: number | "";
  balance: number;
  decimals: number | 0;
}): ValidationResult {
  if ((balance || 0) < (amount || 0)) {
    return { valid: false, message: ErrorMessage.INSUFFICIENT_FUNDS };
  } else {
    return _validateAmount(amount);
  }
}

export function calculateCost(
  token1: { amount: number | ""; address: string },
  price: number | "",
  priceTokenAddress: string
): number | "" {
  if (token1.amount === "" || token1.amount === 0) {
    return token1.amount;
  }
  if (price === "" || price === 0) {
    return "";
  }
  const amountToken1 = Number(token1.amount);
  if (isNaN(amountToken1)) {
    console.error("Invalid amount:", token1.amount);
    return "";
  }

  let cost;
  if (token1.address === priceTokenAddress) {
    cost = amountToken1 / price;
  } else {
    cost = amountToken1 * price;
  }

  cost = roundTo(cost, adex.AMOUNT_MAX_DECIMALS, RoundType.NEAREST);

  return cost;
}
