import type { PayloadAction } from "@reduxjs/toolkit";
import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import * as adex from "alphadex-sdk-js";
import { RootState } from "./store";
import { SdkResult } from "alphadex-sdk-js/lib/models/sdk-result";
import { getTransactionDetail } from "alphadex-sdk-js/lib/radix-api";
import { RDT, getRdtOrThrow } from "../subscriptions";
import { fetchAccountHistory } from "./accountHistorySlice";
import { fetchBalances } from "./pairSelectorSlice";
import {
  getPrecision,
  toFixedRoundDown,
  truncateWithPrecision,
  updateIconIfNeeded,
} from "../utils";
import { Calculator } from "../services/Calculator";

export enum OrderType {
  MARKET = "MARKET",
  LIMIT = "LIMIT",
}

// List of user actions for CurrencyInputGroup
export enum UserAction {
  UPDATE_PRICE = "UPDATE_PRICE",
  SET_TOKEN_1 = "SET_TOKEN_1",
  SET_TOKEN_2 = "SET_TOKEN_2",
}

// Tracks the token the user specified
export enum SpecifiedToken {
  UNSPECIFIED = "UNSPECIFIED",
  TOKEN_1 = "TOKEN_1", // Quantity
  TOKEN_2 = "TOKEN_2", // Total
}

export enum ErrorMessage {
  NONZERO_PRICE = "NONZERO_PRICE",
  INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
  COULD_NOT_GET_QUOTE = "COULD_NOT_GET_QUOTE",
  INSUFFICIENT_LIQUDITIY = "INSUFFICIENT_LIQUDITIY",
  NO_ORDERS = "NO_ORDERS",
}

export const PLATFORM_BADGE_ID = 4; //TODO: Get this data from the platform badge

export const OrderSide = adex.OrderSide;
export type OrderSide = adex.OrderSide;
export type Quote = adex.Quote;

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
  amount: number;
  decimals: number;
}

export interface OrderInputState {
  token1: TokenInput;
  token2: TokenInput;
  price: number;
  validationToken1: ValidationResult;
  validationToken2: ValidationResult;
  validationPrice: ValidationResult;
  specifiedToken: SpecifiedToken;
  side: OrderSide;
  type: OrderType;
  postOnly: boolean;
  quote?: Quote;
  quoteError?: ErrorMessage;
  quoteDescription?: string;
  transactionInProgress: boolean;
  transactionResult?: string;
}

interface SetPricePayload {
  price: number;
  balanceToken1?: number;
  balanceToken2?: number;
}

export const initialTokenInput: TokenInput = {
  address: "",
  symbol: "",
  iconUrl: "",
  amount: -1,
  decimals: 0,
};

const initialValidationResult: ValidationResult = {
  valid: true,
  message: "",
};

export const initialState: OrderInputState = {
  token1: { ...initialTokenInput },
  token2: { ...initialTokenInput },
  price: -1,
  validationToken1: { ...initialValidationResult },
  validationToken2: { ...initialValidationResult },
  validationPrice: { ...initialValidationResult },
  specifiedToken: SpecifiedToken.UNSPECIFIED,
  side: OrderSide.BUY,
  type: OrderType.MARKET,
  postOnly: false,
  transactionInProgress: false,
};

export function validatePrice(price: number): ValidationResult {
  const priceIsZero = price === 0;
  if (priceIsZero) {
    return { valid: false, message: ErrorMessage.NONZERO_PRICE };
  }
  return { valid: true, message: "" };
}

export function toAdexOrderType(
  dexterOrderType: OrderType,
  postOnly: boolean
): adex.OrderType {
  return {
    MARKET: adex.OrderType.MARKET,
    LIMIT: postOnly ? adex.OrderType.POSTONLY : adex.OrderType.LIMIT,
  }[dexterOrderType];
}

export function toDexterOrderType(adexOrderType: adex.OrderType): OrderType {
  if (adexOrderType === adex.OrderType.MARKETPARTIAL) {
    throw new Error("Unimplemented");
  }
  return {
    MARKET: OrderType.MARKET,
    LIMIT: OrderType.LIMIT,
    POSTONLY: OrderType.LIMIT,
  }[adexOrderType];
}

function swapSideIfToken2Specified(
  side: OrderSide,
  specifiedToken: SpecifiedToken
): OrderSide {
  if (specifiedToken === SpecifiedToken.UNSPECIFIED) {
    throw new Error("Token must be specified");
  }
  const swapSide = (side: OrderSide) => {
    return side === OrderSide.BUY ? OrderSide.SELL : OrderSide.BUY;
  };
  return specifiedToken === SpecifiedToken.TOKEN_2 ? swapSide(side) : side;
}

// Map the user-facing side to the Alphadex convention. Alphadex defines
// "side" relative to the specifiedToken, while DeXter sets it based on
// token order of the pairAddress. The general rule is, whenever TOKEN_2
// is specified, the side needs to be swapped.
// |------------|----------------|----------|
// | DexterSide | specifiedToken | AdexSide |
// |------------|----------------|----------|
// | buy        | token1         | buy      |
// | buy        | token2         | sell     | <- swap
// | sell       | token1         | sell     |
// | sell       | token2         | buy      | <- swap
// |------------|----------------|----------|
export function toAdexOrderSide(
  dexterSide: OrderSide,
  specifiedToken: SpecifiedToken
): adex.OrderSide {
  return swapSideIfToken2Specified(dexterSide, specifiedToken);
}

// Convert Alphadex side to user-facing side in DeXter. DeXter defines
// "side" based on token order in pairAddress, while Alphadex sets it based
// on the specifiedToken.
export function toDexterOrderSide(
  adexSide: adex.OrderSide,
  specifiedToken: SpecifiedToken
): OrderSide {
  // same logic to convert back, so we can reuse the same logic
  return swapSideIfToken2Specified(adexSide, specifiedToken);
}

export function noValidationErrors(
  validationPrice: ValidationResult,
  validationToken1: ValidationResult,
  validationToken2: ValidationResult
): boolean {
  return (
    validationPrice.valid && validationToken1.valid && validationToken2.valid
  );
}

export function pairAddressIsSet(pairAddress: string): boolean {
  return pairAddress !== "";
}

export function priceIsValid(price: number, type: OrderType): boolean {
  const isMarketOrder = type === OrderType.MARKET;
  const isValidLimitOrder = type === OrderType.LIMIT && price > 0;
  return isMarketOrder || isValidLimitOrder;
}

export function tokenIsSpecified(specifiedToken: SpecifiedToken): boolean {
  return specifiedToken !== SpecifiedToken.UNSPECIFIED;
}

// for getting balances out of pairSelector slice
// TODO(dcts): ask @chaotic whether this can live inside pairSelector now that
// the orderInputState seems not to be needed anymore.
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

/*
 * FETCH QUOTE
 */
export const fetchQuote = createAsyncThunk<
  Quote,
  undefined, // set to undefined if the thunk doesn't expect any arguments
  { state: RootState }
>("orderInput/fetchQuote", async (_arg, thunkAPI) => {
  const state = thunkAPI.getState();
  if (!state.orderInput.validationPrice.valid) {
    throw new Error("Validation errors found");
  }
  if (!pairAddressIsSet(state.pairSelector.address)) {
    throw new Error("Pair address is not initilized yet.");
  }
  if (!priceIsValid(state.orderInput.price, state.orderInput.type)) {
    throw new Error("Price must be set on LIMIT orders");
  }
  let priceToSend =
    state.orderInput.type === OrderType.MARKET
      ? undefined
      : state.orderInput.price;

  if (state.orderInput.specifiedToken === SpecifiedToken.UNSPECIFIED) {
    throw new Error("No token was specified");
  }
  const targetToken = {
    TOKEN_1: () => state.orderInput.token1,
    TOKEN_2: () => state.orderInput.token2,
  }[state.orderInput.specifiedToken]();

  const response = await adex.getExchangeOrderQuote(
    state.pairSelector.address,
    toAdexOrderType(state.orderInput.type, state.orderInput.postOnly),
    toAdexOrderSide(state.orderInput.side, state.orderInput.specifiedToken),
    targetToken.address,
    targetToken.amount,
    PLATFORM_BADGE_ID,
    priceToSend,
    undefined // slippage to sent
  );
  const quote: Quote = JSON.parse(JSON.stringify(response.data));
  return quote;
});

/*
 * SUBMIT ORDER
 */
export const submitOrder = createAsyncThunk<
  SdkResult,
  undefined,
  { state: RootState }
>("orderInput/submitOrder", async (_arg, thunkAPI) => {
  const state = thunkAPI.getState();
  const dispatch = thunkAPI.dispatch;
  const rdt = getRdtOrThrow();
  const result = await createTx(state, rdt);
  // Asynchronously update balances + account history
  await Promise.all([
    dispatch(fetchBalances()),
    dispatch(fetchAccountHistory()),
  ]);
  // Deep copying is needed to prevent "non-serializable value" error
  return JSON.parse(JSON.stringify(result));
});

interface SetTokenAmountPayload {
  amount: number;
  specifiedToken: SpecifiedToken;
  bestBuy?: number; // Best buy price
  bestSell?: number; // Best sell price
  balanceToken1?: number;
  balanceToken2?: number;
}

export const orderInputSlice = createSlice({
  name: "orderInput",
  initialState,

  // synchronous reducers
  reducers: {
    updateAdex(state, action: PayloadAction<adex.StaticState>) {
      const serializedState: adex.StaticState = JSON.parse(
        JSON.stringify(action.payload)
      );
      const adexToken1 = updateIconIfNeeded(
        serializedState.currentPairInfo.token1
      );
      const adexToken2 = updateIconIfNeeded(
        serializedState.currentPairInfo.token2
      );
      if (state.token1.address !== adexToken1.address) {
        state.token1 = {
          address: adexToken1.address,
          symbol: adexToken1.symbol,
          iconUrl: adexToken1.iconUrl,
          amount: -1,
          decimals: serializedState.currentPairInfo.token1MaxDecimals,
        };
      }
      if (state.token2.address !== adexToken2.address) {
        state.token2 = {
          address: adexToken2.address,
          symbol: adexToken2.symbol,
          iconUrl: adexToken2.iconUrl,
          amount: -1,
          decimals: serializedState.currentPairInfo.token2MaxDecimals,
        };
      }
    },
    setSide(state, action: PayloadAction<OrderSide>) {
      state.side = action.payload;
    },
    setType(state, action: PayloadAction<OrderType>) {
      state.type = action.payload;
    },
    togglePostOnly(state) {
      state.postOnly = !state.postOnly;
    },
    setTokenAmount(state, action: PayloadAction<SetTokenAmountPayload>) {
      // Deconstruct inputs
      const {
        amount,
        specifiedToken,
        bestBuy,
        bestSell,
        balanceToken1,
        balanceToken2,
      } = action.payload;

      // ignore if no token is specified
      if (specifiedToken === SpecifiedToken.UNSPECIFIED) {
        return;
      }

      // Reset Validation
      state.validationToken1 = initialValidationResult;
      state.validationToken2 = initialValidationResult;

      // Reset if amount is -1
      if (amount === -1) {
        state.specifiedToken = SpecifiedToken.UNSPECIFIED;
        state.token1.amount = -1;
        state.token2.amount = -1;
        state.quote = undefined;
        state.quoteDescription = undefined;
        state.quoteError = undefined;
        return;
      }

      // Set specified Token
      state.specifiedToken = specifiedToken;

      // Set token amount
      const setTokenAmount = {
        TOKEN_1: (amount: number) => {
          state.token1.amount = amount;
          state.token2.amount = -1;
        },
        TOKEN_2: (amount: number) => {
          state.token2.amount = amount;
          state.token1.amount = -1;
        },
      }[specifiedToken];
      setTokenAmount(amount);

      // Set price for limit orders if empty
      const bestPrice = {
        BUY: bestBuy,
        SELL: bestSell,
      }[state.side];
      const priceIsUnset = state.price === -1;
      const isLimitOrder = state.type === OrderType.LIMIT;
      const amountIsPositive = amount > 0;
      if (
        priceIsUnset &&
        isLimitOrder &&
        amountIsPositive &&
        bestPrice !== undefined
      ) {
        state.price = bestPrice;
      }

      // Set insufficient balance for specifiedToken
      if (
        specifiedToken === SpecifiedToken.TOKEN_1 &&
        state.side === "SELL" &&
        balanceToken1 !== undefined &&
        balanceToken1 > 0 &&
        balanceToken1 < amount
      ) {
        state.validationToken1 = {
          valid: false,
          message: ErrorMessage.INSUFFICIENT_FUNDS,
        };
      }
      if (
        specifiedToken === SpecifiedToken.TOKEN_2 &&
        state.side === "BUY" &&
        balanceToken2 !== undefined &&
        balanceToken2 > 0 &&
        balanceToken2 < amount
      ) {
        state.validationToken2 = {
          valid: false,
          message: ErrorMessage.INSUFFICIENT_FUNDS,
        };
      }

      // Set insufficient balance for unspecifiedToken
      if (specifiedToken === SpecifiedToken.TOKEN_1 && state.side === "BUY") {
        // calculate Token2 amount
        const amountToken2 = Calculator.multiply(amount, state.price);
        if (balanceToken2 !== undefined && amountToken2 > balanceToken2) {
          state.validationToken2 = {
            valid: false,
            message: ErrorMessage.INSUFFICIENT_FUNDS,
          };
        }
      }
      if (specifiedToken === SpecifiedToken.TOKEN_2 && state.side === "SELL") {
        // calculate Token1 amount
        const amountToken1 = Calculator.divide(amount, state.price);
        if (balanceToken1 !== undefined && amountToken1 > balanceToken1) {
          state.validationToken1 = {
            valid: false,
            message: ErrorMessage.INSUFFICIENT_FUNDS,
          };
        }
      }
    },
    setPrice(state, action: PayloadAction<SetPricePayload>) {
      // ignore price for MARKET OrDERS
      if (state.type === OrderType.MARKET) {
        return;
      }
      // Reset Validation
      state.validationToken1 = { ...initialValidationResult };
      state.validationToken2 = { ...initialValidationResult };

      const { price, balanceToken1, balanceToken2 } = action.payload;

      // reset tokens if price is 0 or unset (-1)
      if (price <= 0) {
        state.token1.amount = -1;
        state.token2.amount = -1;
        state.specifiedToken = SpecifiedToken.UNSPECIFIED;
      }
      state.price = price;

      // validate price input
      state.validationPrice = validatePrice(price);

      // Check for insufficient balances
      // Scenario 1: BUY side -> specifiedToken1
      if (
        state.specifiedToken === SpecifiedToken.TOKEN_1 &&
        state.side === "BUY"
      ) {
        // calculate Token2 amount
        const amountToken2 = Calculator.multiply(
          state.token1.amount,
          state.price
        );
        if (balanceToken2 && amountToken2 > balanceToken2) {
          state.validationToken2 = {
            valid: false,
            message: ErrorMessage.INSUFFICIENT_FUNDS,
          };
        }
      }
      // Scenario 2: SELL side -> specifiedToken2
      if (
        state.specifiedToken === SpecifiedToken.TOKEN_2 &&
        state.side === "SELL"
      ) {
        // calculate Token1 amount
        const amountToken1 = Calculator.divide(
          state.token2.amount,
          state.price
        );
        if (balanceToken1 && amountToken1 > balanceToken1) {
          state.validationToken1 = {
            valid: false,
            message: ErrorMessage.INSUFFICIENT_FUNDS,
          };
        }
      }
    },
    resetNumbersInput(state) {
      state.token1 = { ...initialTokenInput };
      state.token2 = { ...initialTokenInput };
      state.validationToken1 = { ...initialValidationResult };
      state.validationToken2 = { ...initialValidationResult };
      state.price = -1;
      state.transactionInProgress = false;
      state.transactionResult = undefined;
      state.quote = undefined;
      state.quoteError = undefined;
      state.quoteDescription = undefined;
    },
    resetUserInput(state) {
      state.price = -1;
      state.token1.amount = -1;
      state.token2.amount = -1;
      state.postOnly = false;
      state.validationToken1 = { ...initialValidationResult };
      state.validationToken2 = { ...initialValidationResult };
      state.validationPrice = { ...initialValidationResult };
      state.quote = undefined;
      state.quoteError = undefined;
      state.quoteDescription = undefined;
      state.specifiedToken = SpecifiedToken.UNSPECIFIED;
    },
    resetState(state) {
      Object.assign(state, initialState);
    },
  },

  // asynchronous reducers
  extraReducers: (builder) => {
    // fetchQuote
    builder.addCase(fetchQuote.pending, (state) => {
      state.quote = undefined;
      state.quoteError = undefined;
      state.quoteDescription = undefined;
    });
    builder.addCase(
      fetchQuote.fulfilled,
      (state, action: PayloadAction<Quote>) => {
        const quote = action.payload;
        state.quote = quote;
        state.quoteError = {
          100: undefined, // success
          101: undefined, // success
          103: undefined, // success
          102: ErrorMessage.INSUFFICIENT_LIQUDITIY,
          5: ErrorMessage.INSUFFICIENT_LIQUDITIY,
          2: ErrorMessage.NO_ORDERS,
        }[quote.resultCode];
        state.quoteDescription = toDescription(quote);
      }
    );
    builder.addCase(fetchQuote.rejected, (state, action) => {
      state.quote = undefined;
      state.quoteError = undefined;
      state.quoteDescription = undefined;
      console.error(action.error);
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
      console.error(action.error);
    });
  },
});

function toDescription(quote: Quote): string {
  let quoteDescription = "";
  if (quote.fromAmount > 0 && quote.toAmount > 0) {
    const fromAmount = truncateWithPrecision(
      quote.fromAmount,
      getPrecision(quote.fromToken.symbol)
    );
    const toAmount = truncateWithPrecision(
      quote.toAmount,
      getPrecision(quote.toToken.symbol)
    );
    const toTokenSymbol = quote.toToken.symbol;
    const fromTokenSymbol = quote.fromToken.symbol;
    quoteDescription +=
      `Sending ${fromAmount} ${fromTokenSymbol} ` +
      `to receive ${toAmount} ${toTokenSymbol}.\n\n` +
      `Average price: ${quote.avgPrice}.\n` +
      `slippage: ${Math.round(quote.slippage * 100)}%.\n`;
  }
  if (quote.resultMessageLong) {
    quoteDescription += "\n" + quote.resultMessageLong;
  }
  return quoteDescription;
}

function getSlippage(type: OrderType): number {
  return type === OrderType.MARKET ? 9999 : -1; // acceppt unlimeted slippage on market orders
}

/*
 * CREATE TX
 */
async function createTx(state: RootState, rdt: RDT) {
  if (state.orderInput.specifiedToken === SpecifiedToken.UNSPECIFIED) {
    throw new Error("No token was specified");
  }
  const targetToken = {
    TOKEN_1: () => state.orderInput.token1,
    TOKEN_2: () => state.orderInput.token2,
  }[state.orderInput.specifiedToken]();
  const isMarketOrder = state.orderInput.type === OrderType.MARKET;
  const price = isMarketOrder ? -1 : state.orderInput.price;
  let targetTokenAmount = targetToken.amount;
  // Correct potential rounding precision errors
  // One example where this fix is needed is xUSDC:
  // https://github.com/DeXter-on-Radix/website/issues/486
  if (targetToken.decimals) {
    targetTokenAmount = toFixedRoundDown(
      targetTokenAmount,
      targetToken.decimals
    );
  }
  // Adex creates the transaction manifest
  const accountAddress = state.radix.selectedAccount?.address || "";
  const createOrderResponse = await adex.createExchangeOrderTx(
    state.pairSelector.address,
    toAdexOrderType(state.orderInput.type, state.orderInput.postOnly),
    toAdexOrderSide(state.orderInput.side, state.orderInput.specifiedToken),
    targetToken.address,
    targetTokenAmount,
    price,
    getSlippage(state.orderInput.type),
    PLATFORM_BADGE_ID,
    accountAddress, // submit account
    accountAddress // settle account
  );
  // Then submits the order to the wallet
  return await submitTransaction(createOrderResponse.data, rdt);
}

/*
 * Submit a transaction
 */
//This is originally from the alphadex-client.js line 779
async function submitTransaction(manifest: any, rdt: RDT) {
  const result = await rdt.walletApi.sendTransaction({
    transactionManifest: manifest,
    version: 1,
    message: "Order Using DeXter",
  });
  if (result.isErr()) {
    console.error("Problem with submitting tx.", result.error.message);
    return new SdkResult("ERROR", result.error.message, result.error);
  }
  let txDetailResult = await getTransactionDetail(
    result.value.transactionIntentHash
  );
  if (txDetailResult.status != 200) {
    return new SdkResult("ERROR", txDetailResult.message, txDetailResult.data);
  } else {
    return new SdkResult(
      "SUCCESS",
      txDetailResult.message,
      txDetailResult.data
    );
  }
}
