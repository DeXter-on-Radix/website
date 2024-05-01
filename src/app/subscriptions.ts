import { Subscription } from "rxjs";
import {
  DataRequestBuilder,
  RadixDappToolkit,
  RadixNetwork,
} from "@radixdlt/radix-dapp-toolkit";
import * as adex from "alphadex-sdk-js";
import { radixSlice, WalletData } from "./state/radixSlice";
import { fetchBalances } from "./state/pairSelectorSlice";
import { pairSelectorSlice } from "./state/pairSelectorSlice";
import { orderBookSlice } from "./state/orderBookSlice";
import { updateCandles } from "./state/priceChartSlice";
import { updatePriceInfo } from "./state/priceInfoSlice";
import { accountHistorySlice } from "./state/accountHistorySlice";
import { orderInputSlice } from "./state/orderInputSlice";
import { AppStore } from "./state/store";
import { userActions } from "state/user/userSlice";
import { setInterval } from "timers";

export type RDT = ReturnType<typeof RadixDappToolkit>;
export const rdt = RadixDappToolkit({
  dAppDefinitionAddress: process.env.NEXT_PUBLIC_DAPP_DEFINITION_ADDRESS || "",
  networkId:
    process.env.NEXT_PUBLIC_NETWORK == "mainnet"
      ? RadixNetwork.Mainnet
      : RadixNetwork.Stokenet,
});
// TODO: "black" on the light theme
rdt.buttonApi.setTheme("white");
export function getRdt() {
  return rdt;
}

let subs: Subscription[] = [];
let shortInterval: NodeJS.Timer;

export function initializeSubscriptions(store: AppStore) {
  rdt.walletApi.setRequestData(DataRequestBuilder.accounts().exactly(1));
  subs.push(
    rdt.walletApi.walletData$.subscribe((walletData: WalletData) => {
      const data: WalletData = JSON.parse(JSON.stringify(walletData));
      store.dispatch(radixSlice.actions.setWalletData(data));
      store.dispatch(userActions.setConnectedAccountsAndUpdate(data.accounts));
      // TODO: can we subscribe to balances from somewhere?
      store.dispatch(fetchBalances());
    })
  );

  adex.init((process.env.NEXT_PUBLIC_NETWORK || "stokenet") as adex.ApiNetwork);
  subs.push(
    adex.clientState.stateChanged$.subscribe((newState) => {
      const serializedState: adex.StaticState = JSON.parse(
        JSON.stringify(newState)
      );
      store.dispatch(pairSelectorSlice.actions.updateAdex(serializedState));
      store.dispatch(orderBookSlice.actions.updateAdex(serializedState));
      store.dispatch(updateCandles(serializedState.currentPairCandlesList));
      store.dispatch(updatePriceInfo(serializedState));
      store.dispatch(accountHistorySlice.actions.updateAdex(serializedState));
      store.dispatch(orderInputSlice.actions.updateAdex(serializedState));
    })
  );

  shortInterval = setInterval(() => {
    store.dispatch(userActions.fetchSelectedAccountBalances());
  }, 5000);
}

export function unsubscribeAll() {
  subs.forEach((sub) => {
    sub.unsubscribe();
  });
  subs = [];
  if (shortInterval) {
    clearInterval(shortInterval);
  }
}
