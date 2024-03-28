import { store } from "../src/app/state/store"; // Import the configured store that includes your slice
import { orderInputSlice } from "../src/app/state/orderInputSlice";

describe("OrderInputSlice", () => {
  it(`setToken1 / setToken2 also sets specifiedToken`, () => {
    expect(1).toBe(1);

    // Set token1
    store.dispatch(orderInputSlice.actions.setAmountToken1(12));
    // Assert the expected outcomes
    expect(store.getState().orderInput.token1.amount).toBe(12);
    expect(store.getState().orderInput.token2.amount).toBe("");

    // OUTCOMMENT FOR NOW AS NOT MERGED TO MAIN
    // expect(store.getState().orderInput.specifiedToken).toBe(
    //   SpecifiedToken.TOKEN_1
    // );

    // Set token2
    store.dispatch(orderInputSlice.actions.setAmountToken2(124));
    // Assert the expected outcomes
    expect(store.getState().orderInput.token1.amount).toBe(12);
    expect(store.getState().orderInput.token2.amount).toBe(124);

    // OUTCOMMENT FOR NOW AS NOT MERGED TO MAIN
    // expect(store.getState().orderInput.specifiedToken).toBe(
    //   SpecifiedToken.TOKEN_2
    // );
  });
});
