'use client'

import { PairsList } from "./PairsList";
import { createContext, useEffect, useState } from "react";
import * as adex from "alphadex-sdk-js";
import { PairInfo } from "./PairInfo";

export const AdexStateContext = createContext(null);

// more components here: https://daisyui.com/components/

adex.init();

export default function Home() {
  const [adexState, setAdexState] = useState(adex.clientState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let sub = adex.clientState.stateChanged$.subscribe(newState => {
      setAdexState(newState);
      setHydrated(true);
    });
    return () => { if (sub) { sub.unsubscribe() }; 
    }
  }, []);

  function getAdexConnectionStatus(){
    return hydrated ? adex.clientState.status : null;
  }

  function getPairs(){
    return hydrated ? <PairsList /> : null;
  }

  function getPairInfo(){
    return hydrated && adexState.currentPairInfo ? <PairInfo /> : null;
  }

  return (
    <AdexStateContext.Provider value={adexState}>
      {/* <main className="mx-6"> */}
        
        AlphaDEX: <a>{getAdexConnectionStatus()}</a>
        {getPairs()}
        {getPairInfo()}
      {/* </main> */}
    </AdexStateContext.Provider>
  );
}
