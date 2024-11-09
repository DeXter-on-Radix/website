import { store } from "./store"; // Import the configured store that includes your slice
import * as adex from "alphadex-sdk-js";
import {
  ErrorMessage,
  OrderSide,
  OrderType,
  SpecifiedToken,
  orderInputSlice,
  toAdexOrderType,
  toAdexOrderSide,
  toDexterOrderType,
  toDexterOrderSide,
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

  it(`toAdexOrderSide() and toDexterOrderSide() correctly convert side`, () => {
    // Helper function to test converstion from DexterSide -> AdexSide and back
    const testSideConversions = (
      dexterSide: OrderSide,
      specifiedToken: SpecifiedToken,
      adexSide: OrderSide
    ) => {
      expect(toAdexOrderSide(dexterSide, specifiedToken)).toBe(adexSide);
      expect(toDexterOrderSide(adexSide, specifiedToken)).toBe(dexterSide);
    };
    // Cover all 4 usecases. Side note, this applies independantly of OrderType
    testSideConversions(OrderSide.BUY, SpecifiedToken.TOKEN_1, OrderSide.BUY);
    testSideConversions(OrderSide.BUY, SpecifiedToken.TOKEN_2, OrderSide.SELL); // swap when token2 is specified
    testSideConversions(OrderSide.SELL, SpecifiedToken.TOKEN_1, OrderSide.SELL);
    testSideConversions(OrderSide.SELL, SpecifiedToken.TOKEN_2, OrderSide.BUY); // swap when token2 is specified
  });

  it(`toAdexOrderType() and toDexterOrderType() correctly convert OrderTypes`, () => {
    // Helper function to test converstion from DexterSide -> AdexSide and back
    const testTypeConversions = (
      dexterType: OrderType,
      postOnly: boolean,
      adexOrderType: adex.OrderType
    ) => {
      expect(toAdexOrderType(dexterType, postOnly)).toBe(adexOrderType);
      expect(toDexterOrderType(adexOrderType)).toBe(dexterType);
    };
    // Cover all 4 usecases. Side note, this applies independantly of OrderType
    testTypeConversions(OrderType.MARKET, false, adex.OrderType.MARKET);
    testTypeConversions(OrderType.MARKET, true, adex.OrderType.MARKET); // postonly is irrelevant for market orders
    testTypeConversions(OrderType.LIMIT, false, adex.OrderType.LIMIT);
    testTypeConversions(OrderType.LIMIT, true, adex.OrderType.POSTONLY);
  });
});
