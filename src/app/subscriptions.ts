import { Subscription } from "rxjs";
import {
  DataRequestBuilder,
  RadixDappToolkit,
} from "@radixdlt/radix-dapp-toolkit";
import * as adex from "alphadex-sdk-js";
import { radixSlice, WalletData } from "./redux/radixSlice";
import { fetchBalances } from "./redux/pairSelectorSlice";
import { pairSelectorSlice } from "./redux/pairSelectorSlice";
import { orderBookSlice } from "./redux/orderBookSlice";
import { updateCandles } from "./redux/priceChartSlice";
import { accountHistorySlice } from "./redux/accountHistorySlice";
import { AppStore } from "./redux/store";
import { getLocaleSeparators } from "utils";
import { uiSlice } from "redux/UiSlice";

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
      "account_tdx_d_12yhr42q497c46lr9vxkfsln9e9f3kjj8t5qexznpeq3ewxxqnhm527",
    networkId: 14,
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
  adex.init();
  subs.push(
    adex.clientState.stateChanged$.subscribe((newState) => {
      const serializedState: adex.StaticState = JSON.parse(
        JSON.stringify(newState)
      );

      store.dispatch(pairSelectorSlice.actions.updateAdex(serializedState));
      store.dispatch(orderBookSlice.actions.updateAdex(serializedState));
      store.dispatch(updateCandles(serializedState.currentPairCandlesList));
      store.dispatch(accountHistorySlice.actions.updateAdex(serializedState));
    })
  );

  // determine separators to be used when displaying numbers
  let { decimalSeparator, thousandsSeparator } = getLocaleSeparators();
  store.dispatch(uiSlice.actions.setDecimalSeparator(decimalSeparator));
  store.dispatch(uiSlice.actions.setThousandsSeparator(thousandsSeparator));
}

export function unsubscribeAll() {
  subs.forEach((sub) => {
    sub.unsubscribe();
  });
  subs = [];
}
