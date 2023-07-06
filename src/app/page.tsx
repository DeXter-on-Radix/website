"use client";

import { PairsList } from "./PairsList";
import { createContext, useEffect, useState } from "react";
import * as adex from "alphadex-sdk-js";
import { PairInfo } from "./PairInfo";

adex.init(); //Connect to alphadex websocket

let initial_staticState = new adex.StaticState(adex.clientState.internalState);

export const AdexStateContext = createContext(initial_staticState);

// more components here: https://daisyui.com/components/

export default function Home() {
  const [adexState, setAdexState] = useState(initial_staticState);
  const [hydrated, setHydrated] = useState(false);

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
      <main className="mx-6">
        <dd>AlphaDEX: {getAdexConnectionStatus()}</dd>
        {getPairs()}
        {getPairInfo()}
      </main>
    </AdexStateContext.Provider>
  );
}
