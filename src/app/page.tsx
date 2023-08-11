"use client";

import { useContext } from "react";
import { AdexStateContext, WalletContext } from "./contexts"; //added WalletContext
import { PairsList } from "./PairsList";
import { PairInfo } from "./PairInfo";
import { AccountHistory } from "./AccountHistory";

export default function Home() {
  const adexState = useContext(AdexStateContext);
  const wallet = useContext(WalletContext);

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
    //TODO:
    //Rerender this component when wallet is disconnected
    //Rerender when a transaction has been made
    const account = wallet ? wallet.accounts[0]?.address : "";
    return adexState.status != "LOADING" ? (
      <AccountHistory account={account} />
    ) : null;
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
