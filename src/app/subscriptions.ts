import { Subscription } from "rxjs";
import {
  DataRequestBuilder,
  RadixDappToolkit,
  RadixNetwork,
} from "@radixdlt/radix-dapp-toolkit";
import * as adex from "alphadex-sdk-js";
import { radixSlice, WalletData } from "./redux/radixSlice";
import { fetchBalances } from "./redux/pairSelectorSlice";
import { pairSelectorSlice } from "./redux/pairSelectorSlice";
import { orderBookSlice } from "./redux/orderBookSlice";
import { updateCandles } from "./redux/priceChartSlice";
import { updatePriceInfo } from "./redux/priceInfoSlice";
import { accountHistorySlice } from "./redux/accountHistorySlice";
import { orderInputSlice } from "redux/orderInputSlice";
import { AppStore } from "./redux/store";

export type RDT = ReturnType<typeof RadixDappToolkit>;

let rdtInstance: null | RDT = null;
export function getRdt() {
  return rdtInstance;
}
function setRdt(rdt: RDT) {
  rdtInstance = rdt;
}

let subs: Subscription[] = [];

export function initializeSubscriptions(store: AppStore) {
  rdtInstance = RadixDappToolkit({
    dAppDefinitionAddress:
      "account_tdx_2_129kev9w27tsl7qjg0dlyze70kxnlzycs8v2c85kzec40gg8mt73f7y",
    networkId: RadixNetwork.Stokenet,
  });
  rdtInstance.walletApi.setRequestData(
    DataRequestBuilder.accounts().exactly(1)
  );
  subs.push(
    rdtInstance.walletApi.walletData$.subscribe((walletData: WalletData) => {
      const data: WalletData = JSON.parse(JSON.stringify(walletData));
      store.dispatch(radixSlice.actions.setWalletData(data));

      // TODO: can we subscribe to balances from somewhere?
      store.dispatch(fetchBalances());
    })
  );
  setRdt(rdtInstance);
  // TODO: "black" on the light theme
  rdtInstance.buttonApi.setTheme("white");
  adex.init("localhost-mainnet");
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
}

export function unsubscribeAll() {
  subs.forEach((sub) => {
    sub.unsubscribe();
  });
  subs = [];
}
