"use client";

import { useContext, useEffect, useState } from "react";
import { Subscription } from "rxjs";
import { AdexStateContext, RadixContext } from "./contexts";
import { State } from "@radixdlt/radix-dapp-toolkit";
import * as adex from "alphadex-sdk-js";
import { PairsList } from "./PairsList";
import { PairInfo } from "./PairInfo";

export default function Home() {
  const adexState = useContext(AdexStateContext);

  function getAdexConnectionStatus() {
    return adexState.status != "LOADING" ? adexState.status : null;
  }

  function getPairs() {
    //Gets list of pairs from adex
    return adexState.status != "LOADING" ? <PairsList /> : null;
  }

  function getPairInfo() {
    //gets info of currently selected pair from adex
    return adexState.status != "LOADING" && adexState.currentPairInfo ? (
      <PairInfo />
    ) : null;
  }

  return (
    <main className="mx-6">
      <dd>AlphaDEX: {getAdexConnectionStatus()}</dd>
      {getPairs()}
      {getPairInfo()}
    </main>
  );
}
