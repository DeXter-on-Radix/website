import { store } from "./store"; // Import the configured store that includes your slice
import {
  ErrorMessage,
  SpecifiedToken,
  orderInputSlice,
} from "./orderInputSlice";

describe("OrderInputSlice", () => {
  describe("Setting tokens work", () => {
    it(`setToken1 works`, () => {
      store.dispatch(
        orderInputSlice.actions.setTokenAmount({
          amount: 12,
          specifiedToken: SpecifiedToken.TOKEN_1,
          bestBuy: 0,
          bestSell: 0,
          balanceToken1: 0,
          balanceToken2: 0,
        })
      );
    });
    it(`setToken2 works`, () => {
      store.dispatch(
        orderInputSlice.actions.setTokenAmount({
          amount: 120,
          specifiedToken: SpecifiedToken.TOKEN_2,
          bestBuy: 0,
          bestSell: 0,
          balanceToken1: 0,
          balanceToken2: 0,
        })
      );
      expect(store.getState().orderInput.token2.amount).toBe(120);
      // the unspecified token should be resettet
      expect(store.getState().orderInput.token1.amount).toBe(-1);
    });
  });

  describe("Validation implemented", () => {
    it("for zero price", () => {
      store.dispatch(
        orderInputSlice.actions.setPrice({
          price: 0,
          balanceToken1: 0,
          balanceToken2: 0,
        })
      );
      expect(store.getState().orderInput.validationPrice.valid).toBe(false);
      expect(store.getState().orderInput.validationPrice.message).toBe(
        ErrorMessage.NONZERO_PRICE
      );
    });
    it("for zero amounts (token 1 and token2)", () => {});
    it("insufficient balance for token1 on sell order ", () => {});
    it("insufficient balance for token1 on sell order when token2 is specified", () => {});
    it("insufficient balance for token2 on buy order ", () => {});
    it("insufficient balance for token2 on buy order when token1 is specified", () => {});
    it("insufficient balance for unspecifiedToken triggers on buy orders when price is adapted", () => {});
    it("insufficient balance for unspecifiedToken triggers on sell orders when price is adapted", () => {});
  });
});
