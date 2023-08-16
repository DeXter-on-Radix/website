"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import {
  WalletContext,
  RdtContext,
  AdexStateContext,
  initialStaticState,
  GatewayContext,
} from "./contexts";
import {
  RadixDappToolkit,
  DataRequestBuilder,
  WalletData,
} from "@radixdlt/radix-dapp-toolkit";
import {
  RadixNetworkConfigById,
  GatewayApiClientSettings,
} from "@radixdlt/babylon-gateway-api-sdk";
import * as adex from "alphadex-sdk-js";
import { Subscription } from "rxjs";
import { GatewayApiClient } from "@radixdlt/babylon-gateway-api-sdk";

import { Footer } from "./Footer";
import { Navbar } from "./NavBar";
import { store } from "./store";
import { Provider } from "react-redux";
import { pairSelectorSlice } from "./pairSelectorSlice";
import { orderBookSlice } from "./orderBookSlice";
import { orderInputSlice } from "./orderInputSlice";
import { updateCandles } from "./priceChartSlice";
import { accountHistorySlice } from "./accountHistorySlice";

const inter = Inter({ subsets: ["latin"] });

// declare the radix-connect-button as a global custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "radix-connect-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [walletContext, setWalletContext] = useState<WalletData | null>(null);

  const [rdtContext, setRdtContext] = useState<RadixDappToolkit | null>(null);

  const [gatewayApiContext, setGatewayApiContext] =
    useState<GatewayApiClient | null>(null);

  const [adexState, setAdexState] = useState(initialStaticState);

  useEffect(() => {
    let subs: Subscription[] = [];
    const rdt = RadixDappToolkit({
      dAppDefinitionAddress:
        "account_tdx_d_16996e320lnez82q6430eunaz9l3n5fnwk6eh9avrmtmj22e7m9lvl2",
      // Update with adex dapp address,
      networkId: 13,
    });
    rdt.walletApi.setRequestData(DataRequestBuilder.accounts().exactly(1));
    subs.push(
      rdt.walletApi.walletData$.subscribe((walletData: WalletData) => {
        setWalletContext(walletData);
      })
    );
    setRdtContext(rdt);

    setGatewayApiContext(
      GatewayApiClient.initialize({
        basePath: RadixNetworkConfigById[13].gatewayUrl,
      })
    );

    adex.init();
    subs.push(
      adex.clientState.stateChanged$.subscribe((newState) => {
        // setAdexState(newState);

        // serialize adexState
        // we cannot directly store adexState in redux because it is not serializable
        // TODO: find out if there is a better way to do this
        const serializedState: adex.StaticState = JSON.parse(
          JSON.stringify(newState)
        );

        // TODO: remove context providers and dispatch to redux
        store.dispatch(pairSelectorSlice.actions.updateAdex(serializedState));
        store.dispatch(orderInputSlice.actions.updateAdex(serializedState));
        store.dispatch(orderBookSlice.actions.updateAdex(serializedState));
        store.dispatch(updateCandles(serializedState.currentPairCandlesList));
        store.dispatch(accountHistorySlice.actions.updateAdex(serializedState));
      })
    );

    return () => {
      subs.forEach((sub) => {
        sub.unsubscribe();
      });
    };
  }, []);

  return (
    <html lang="en">
      <WalletContext.Provider value={walletContext ? walletContext : null}>
        <RdtContext.Provider value={rdtContext ? rdtContext : null}>
          <AdexStateContext.Provider value={adexState}>
            <GatewayContext.Provider value={gatewayApiContext}>
              <Provider store={store}>
                <body className={inter.className}>
                  <div className="flex flex-col prose md:prose-lg lg:prose-xl max-w-none">
                    <Navbar />

                    <div className="h-full">{children}</div>

                    <Footer />
                  </div>
                </body>
              </Provider>
            </GatewayContext.Provider>
          </AdexStateContext.Provider>
        </RdtContext.Provider>
      </WalletContext.Provider>
    </html>
  );
}
