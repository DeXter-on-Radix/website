"use client";

import { useContext } from "react";
import { AdexStateContext } from "./contexts";
import { PairsList } from "./PairsList";
import { PairInfo } from "./PairInfo";
import { AccountHistory } from "./AccountHistory";

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

  function getAccountHistory() {
    //gets Orderlist
    //TODO add check if wallet is connected
    return adexState.status != "LOADING" ? <AccountHistory /> : null;
  }

  return (
    <main className="mx-6">
      <dd>AlphaDEX: {getAdexConnectionStatus()}</dd>
      {getPairs()}
      {getPairInfo()}
      {getAccountHistory()}
    </main>
  );
}
