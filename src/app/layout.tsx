"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import { RadixContext, AdexStateContext, initialStaticState } from "./contexts";
import { State, RadixDappToolkit } from "@radixdlt/radix-dapp-toolkit";
import * as adex from "alphadex-sdk-js";
import { Subscription } from "rxjs";

import { Footer } from "./Footer";
import { Navbar } from "./NavBar";

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
  const [radixContext, setRadixContext] = useState<State | undefined>(
    undefined
  );

  const [adexState, setAdexState] = useState(initialStaticState);

  useEffect(() => {
    let subs: Subscription[] = [];

    const rdt = RadixDappToolkit(
      {
        dAppDefinitionAddress:
          "account_tdx_c_1pyc6tpqu2uy7tzy82cgm5c289x7qy6xehtkqe0j2yycsr9ukkl",
        dAppName: "DeXter",
      },
      (requestData) => {
        requestData({
          accounts: { quantifier: "atLeast", quantity: 1 },
        });
      },
      {
        networkId: 12,
        onDisconnect: () => {
          // clear your application state
        },
        onInit: ({ accounts }) => {
          // set your initial application state
        },
      }
    );
    subs.push(
      rdt.state$.subscribe((newState: State) => {
        setRadixContext(newState);
      })
    );

    adex.init();
    subs.push(
      adex.clientState.stateChanged$.subscribe((newState) => {
        setAdexState(newState);
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
      <RadixContext.Provider value={radixContext}>
        <AdexStateContext.Provider value={adexState}>
          <body className={inter.className}>
            <div className="h-screen flex flex-col prose md:prose-lg lg:prose-xl max-w-none">
              <Navbar />

              <div className="h-full">{children}</div>

              <Footer />
            </div>
          </body>
        </AdexStateContext.Provider>
      </RadixContext.Provider>
    </html>
  );
}
