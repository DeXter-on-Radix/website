"use client";

import { PairsList } from "./PairsList";
import { createContext, useEffect, useState } from "react";
import * as adex from "alphadex-sdk-js";
import { PairInfo } from "./PairInfo";
import { AdexStateContext, initialStaticState } from "./adex-state-context";

// adex.init(); //Connect to alphadex websocket

// let initialStaticState = new adex.StaticState(adex.clientState.internalState);

// export const AdexStateContext = createContext(initialStaticState);

// more components here: https://daisyui.com/components/

export default function Home() {
  const [adexState, setAdexState] = useState(initialStaticState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    adex.init();
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
    return hydrated ? adexState.status : null;
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
      <main className="mx-6">
        <dd>AlphaDEX: {getAdexConnectionStatus()}</dd>
        {getPairs()}
        {getPairInfo()}
      </main>
    </AdexStateContext.Provider>
  );
}
