import { store } from "./store"; // Import the configured store that includes your slice
import * as adex from "alphadex-sdk-js";
import {
  ErrorMessage,
  OrderSide,
  OrderType,
  SpecifiedToken,
  toAdexOrderType,
  orderInputSlice,
} from "./orderInputSlice";

describe("OrderInputSlice", () => {
  beforeEach(() => {
    store.dispatch(orderInputSlice.actions.resetState());
  });

  it(`setTokenAmount works as expected for Token1: (1) sets amount (2) sets specifiedToken (3) resets unspecified token`, () => {
    store.dispatch(
      orderInputSlice.actions.setTokenAmount({
        amount: 12,
        specifiedToken: SpecifiedToken.TOKEN_1,
      })
    );
    // amount should be set
    expect(store.getState().orderInput.token1.amount).toBe(12);
    // specified token should be set
    expect(store.getState().orderInput.specifiedToken).toBe(
      SpecifiedToken.TOKEN_1
    );
    // the unspecified token should be resettet
    expect(store.getState().orderInput.token2.amount).toBe(-1);
  });

  it(`setTokenAmount works as expected for Token2: (1) sets amount (2) sets specifiedToken (3) resets unspecified token`, () => {
    store.dispatch(
      orderInputSlice.actions.setTokenAmount({
        amount: 120,
        specifiedToken: SpecifiedToken.TOKEN_2,
      })
    );
    // amount should be set
    expect(store.getState().orderInput.token2.amount).toBe(120);
    // specified token should be set
    expect(store.getState().orderInput.specifiedToken).toBe(
      SpecifiedToken.TOKEN_2
    );
    // the unspecified token should be resettet
    expect(store.getState().orderInput.token1.amount).toBe(-1);
  });

  it("Price cannot be set on Market orders", () => {
    store.dispatch(orderInputSlice.actions.setType(OrderType.MARKET));
    store.dispatch(orderInputSlice.actions.setPrice({ price: 12 }));
    expect(store.getState().orderInput.price).toBe(-1);
  });

  it("Validation works for zero price", () => {
    store.dispatch(orderInputSlice.actions.setType(OrderType.LIMIT));
    store.dispatch(orderInputSlice.actions.setPrice({ price: 0 }));
    expect(store.getState().orderInput.validationPrice.valid).toBe(false);
    expect(store.getState().orderInput.validationPrice.message).toBe(
      ErrorMessage.NONZERO_PRICE
    );
  });

  it("Validation works for zero token1 amount", () => {
    store.dispatch(
      orderInputSlice.actions.setTokenAmount({
        amount: 0,
        specifiedToken: SpecifiedToken.TOKEN_1,
      })
    );
    expect(store.getState().orderInput.validationToken1.valid).toBe(false);
    expect(store.getState().orderInput.validationToken1.message).toBe(
      ErrorMessage.NONZERO_AMOUNT
    );
  });

  it("Validation works for zero token2 amount", () => {
    store.dispatch(
      orderInputSlice.actions.setTokenAmount({
        amount: 0,
        specifiedToken: SpecifiedToken.TOKEN_2,
      })
    );
    expect(store.getState().orderInput.validationToken2.valid).toBe(false);
    expect(store.getState().orderInput.validationToken2.message).toBe(
      ErrorMessage.NONZERO_AMOUNT
    );
  });

  it("Validation works for insufficient balance for token1 on sell order ", () => {
    store.dispatch(orderInputSlice.actions.setSide(OrderSide.SELL));
    store.dispatch(
      orderInputSlice.actions.setTokenAmount({
        amount: 1000,
        specifiedToken: SpecifiedToken.TOKEN_1,
        balanceToken1: 500,
      })
    );
    expect(store.getState().orderInput.validationToken1.valid).toBe(false);
    expect(store.getState().orderInput.validationToken1.message).toBe(
      ErrorMessage.INSUFFICIENT_FUNDS
    );
  });

  it("Validation works for insufficient balance for token1 on sell order when token2 is specified", () => {
    store.dispatch(orderInputSlice.actions.setType(OrderType.LIMIT));
    store.dispatch(orderInputSlice.actions.setSide(OrderSide.SELL));
    store.dispatch(orderInputSlice.actions.setPrice({ price: 1 })); // price has to be set
    store.dispatch(
      orderInputSlice.actions.setTokenAmount({
        amount: 1000,
        specifiedToken: SpecifiedToken.TOKEN_2,
        balanceToken1: 999,
      })
    );
    expect(store.getState().orderInput.validationToken1.valid).toBe(false);
    expect(store.getState().orderInput.validationToken1.message).toBe(
      ErrorMessage.INSUFFICIENT_FUNDS
    );
  });

  it("Validation works for insufficient balance for token2 on buy order", () => {
    expect(store.getState().orderInput.side).toBe(OrderSide.BUY);
    store.dispatch(
      orderInputSlice.actions.setTokenAmount({
        amount: 1000,
        specifiedToken: SpecifiedToken.TOKEN_2,
        balanceToken2: 500,
      })
    );
    expect(store.getState().orderInput.validationToken2.valid).toBe(false);
    expect(store.getState().orderInput.validationToken2.message).toBe(
      ErrorMessage.INSUFFICIENT_FUNDS
    );
  });

  it("Validation works for insufficient balance for token2 on buy order when token1 is specified", () => {
    store.dispatch(orderInputSlice.actions.setType(OrderType.LIMIT));
    store.dispatch(orderInputSlice.actions.setPrice({ price: 1 })); // price has to be set
    store.dispatch(
      orderInputSlice.actions.setTokenAmount({
        amount: 1000,
        specifiedToken: SpecifiedToken.TOKEN_1,
        balanceToken2: 999,
      })
    );
    expect(store.getState().orderInput.validationToken2.valid).toBe(false);
    expect(store.getState().orderInput.validationToken2.message).toBe(
      ErrorMessage.INSUFFICIENT_FUNDS
    );
  });

  it("Validation triggers for insufficient balance for unspecifiedToken on buy orders when price is adapted", () => {
    const balanceToken2 = 1500;
    store.dispatch(orderInputSlice.actions.setType(OrderType.LIMIT));
    store.dispatch(orderInputSlice.actions.setSide(OrderSide.BUY));
    store.dispatch(orderInputSlice.actions.setPrice({ price: 1 }));
    // Token1 amount of 1000 leads to an implicit token2 amount of 1000
    // which is within balance of 1500
    store.dispatch(
      orderInputSlice.actions.setTokenAmount({
        amount: 1000,
        specifiedToken: SpecifiedToken.TOKEN_1,
        balanceToken2,
      })
    );
    expect(store.getState().orderInput.validationToken2.valid).toBe(true);
    // Adapting price to 2 leads to implicit token2 amount of 2000
    // which is above balance of 1500
    store.dispatch(
      orderInputSlice.actions.setPrice({ price: 2, balanceToken2 })
    );
    expect(store.getState().orderInput.validationToken2.valid).toBe(false);
    expect(store.getState().orderInput.validationToken2.message).toBe(
      ErrorMessage.INSUFFICIENT_FUNDS
    );
  });

  it("Validation triggers for insufficient balance for unspecifiedToken on sell orders when price is adapted", () => {
    const balanceToken1 = 1500;
    store.dispatch(orderInputSlice.actions.setType(OrderType.LIMIT));
    store.dispatch(orderInputSlice.actions.setSide(OrderSide.SELL));
    store.dispatch(orderInputSlice.actions.setPrice({ price: 2 }));
    // Token2 amount of 2000 leads to an implicit token1 amount of 1000,
    // which is within balance of 1500
    store.dispatch(
      orderInputSlice.actions.setTokenAmount({
        amount: 2000,
        specifiedToken: SpecifiedToken.TOKEN_2,
        balanceToken1,
      })
    );
    expect(store.getState().orderInput.validationToken1.valid).toBe(true);
    // Adapting price to 1 leads to implicit token1 amount of 2000
    // which is above balance of 1500
    store.dispatch(
      orderInputSlice.actions.setPrice({ price: 1, balanceToken1 })
    );
    expect(store.getState().orderInput.validationToken1.valid).toBe(false);
    expect(store.getState().orderInput.validationToken1.message).toBe(
      ErrorMessage.INSUFFICIENT_FUNDS
    );
  });

  it("toAdexOrderType converts frontend ordertype correctly to adex order type", () => {
    // MARKET -> MARKET
    store.dispatch(orderInputSlice.actions.resetState());
    store.dispatch(orderInputSlice.actions.setType(OrderType.MARKET));
    expect(toAdexOrderType(store.getState().orderInput)).toBe(
      adex.OrderType.MARKET
    );
    // postonly should be ignored in market order
    store.dispatch(orderInputSlice.actions.togglePostOnly()); // now true
    expect(toAdexOrderType(store.getState().orderInput)).toBe(
      adex.OrderType.MARKET
    );
    // LIMIT -> LIMIT
    store.dispatch(orderInputSlice.actions.resetState());
    store.dispatch(orderInputSlice.actions.setType(OrderType.LIMIT));
    expect(toAdexOrderType(store.getState().orderInput)).toBe(
      adex.OrderType.LIMIT
    );
    // LIMIT, POSTONLY -> POSTONLY
    store.dispatch(orderInputSlice.actions.togglePostOnly()); // now true
    expect(toAdexOrderType(store.getState().orderInput)).toBe(
      adex.OrderType.POSTONLY
    );
  });
});
