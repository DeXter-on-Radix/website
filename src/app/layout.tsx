"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { useEffect } from "react";
import * as adex from "alphadex-sdk-js";
import { Subscription } from "rxjs";

import { Footer } from "./Footer";
import { Navbar } from "./NavBar";
import { store } from "./store";
import { Provider } from "react-redux";
import { pairSelectorSlice } from "./pairSelectorSlice";
import { orderBookSlice } from "./orderBookSlice";
import { orderInputSlice } from "./orderInputSlice";
import { updateCandles } from "./priceChartSlice";
import { accountHistorySlice } from "./accountHistorySlice";
import { initilizeRdt } from "./radixSlice";

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
  useEffect(() => {
    let subs: Subscription[] = [];
    subs = initilizeRdt(subs);

    adex.init();
    subs.push(
      adex.clientState.stateChanged$.subscribe((newState) => {
        // we cannot directly store adexState in redux because it is not serializable
        // TODO: find out if there is a better way to do this
        const serializedState: adex.StaticState = JSON.parse(
          JSON.stringify(newState)
        );

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
      <Provider store={store}>
        <body className={inter.className}>
          <div className="flex flex-col prose md:prose-lg lg:prose-xl max-w-none">
            <Navbar />

            <div className="h-full">{children}</div>

            <Footer />
          </div>
        </body>
      </Provider>
    </html>
  );
}
