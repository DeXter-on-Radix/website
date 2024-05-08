import { StaticState, TokenInfo } from "alphadex-sdk-js";
import { exchangeSlice } from "./exchangeSlice";
import { RootState } from "state/store";

export const adexUpdate = (adexState: StaticState) => {
  return (dispatch: any, getState: any) => {
    const state: RootState = getState();

    let oldTokens: TokenInfo[] = state.exchange.allTokens;
    let newTokens: TokenInfo[] = adexState.tokensList;
    let tokensListChanged = false;
    if (oldTokens.length != newTokens.length) {
      tokensListChanged = true;
    } else {
      let foundDiff = oldTokens.find(
        (tokenInfo: TokenInfo, index: number) =>
          JSON.stringify(tokenInfo) == JSON.stringify(newTokens[index])
      );
      if (foundDiff) {
        tokensListChanged = true;
      }
    }
    if (tokensListChanged) {
      dispatch(exchangeSlice.actions.setTokens(adexState.tokensList));
    }
  };
};
