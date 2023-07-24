"use client";

import { PairsList } from "./PairsList";
import { createContext, useEffect, useState } from "react";
import * as adex from "alphadex-sdk-js";
import { PairInfo } from "./PairInfo";
import { OrderBook } from "./OrderBook"; //added

adex.init(); //Connect to alphadex websocket

let initialStaticState = new adex.StaticState(adex.clientState.internalState);

export const AdexStateContext = createContext(initialStaticState);

// more components here: https://daisyui.com/components/

export default function Home() {
  const [adexState, setAdexState] = useState(initialStaticState);
  const [hydrated, setHydrated] = useState(false);

  const { buys, sells } = adexState.currentPairOrderbook; //added call orderbook

  useEffect(() => {
    let sub = adex.clientState.stateChanged$.subscribe((newState) => {
      setAdexState(newState);
      setHydrated(true);
    });
    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, []);

  function getAdexConnectionStatus() {
    return hydrated ? adex.clientState.status : null;
  }

  function getPairs() {
    //Gets list of pairs from adex
    return hydrated ? <PairsList /> : null;
  }

  function getPairInfo() {
    //gets info of currently selected pair from adex
    return hydrated && adexState.currentPairInfo ? <PairInfo /> : null;
  }

  return (
    <AdexStateContext.Provider value={adexState}>
      <main className="h-full grid grid-cols-5 gap-4">
        <dd>
          AlphaDEX: {getAdexConnectionStatus()}
          {getPairs()}
        </dd>
        {getPairInfo()}
        <div className="col-span-1 order-2">
          <OrderBook orders={buys} />
          <OrderBook orders={sells} />
        </div>
      </main>
    </AdexStateContext.Provider>
  );
}
