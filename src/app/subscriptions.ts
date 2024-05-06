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
import { rewardSlice } from "./state/rewardSlice";

export type RDT = ReturnType<typeof RadixDappToolkit>;
export let rdt: RDT;

export function getRdt() {
  return rdt;
}

export function getRdtOrThrow() {
  const rdt = getRdt();
  if (!rdt) {
    throw new Error("RDT initialization failed");
  }
  return rdt;
}

let subs: Subscription[] = [];

export function initializeSubscriptions(store: AppStore) {
  rdt = RadixDappToolkit({
    dAppDefinitionAddress:
      process.env.NEXT_PUBLIC_DAPP_DEFINITION_ADDRESS || "",
    networkId:
      process.env.NEXT_PUBLIC_NETWORK == "mainnet"
        ? RadixNetwork.Mainnet
        : RadixNetwork.Stokenet,
  });
  // TODO: "black" on the light theme
  rdt.buttonApi.setTheme("white");
  rdt.walletApi.setRequestData(DataRequestBuilder.accounts().exactly(1));
  subs.push(
    rdt.walletApi.walletData$.subscribe((walletData: WalletData) => {
      const data: WalletData = JSON.parse(JSON.stringify(walletData));
      store.dispatch(radixSlice.actions.setWalletData(data));

      // TODO: can we subscribe to balances from somewhere?
      store.dispatch(fetchBalances());
    })
  );
  let network;
  switch (process.env.NEXT_PUBLIC_NETWORK!) {
    case "mainnet":
      network = adex.ApiNetworkOptions.indexOf("mainnet");
      break;
    case "stokenet":
      network = adex.ApiNetworkOptions.indexOf("stokenet");
      break;
    default:
      network = adex.ApiNetworkOptions.indexOf("stokenet");
  }

  adex.init(adex.ApiNetworkOptions[network]);
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
      store.dispatch(
        rewardSlice.actions.updateTokensList(serializedState.tokensList)
      );
      store.dispatch(
        rewardSlice.actions.updatePairsList(serializedState.pairsList)
      );
    })
  );
}

export function unsubscribeAll() {
  subs.forEach((sub) => {
    sub.unsubscribe();
  });
  subs = [];
}
