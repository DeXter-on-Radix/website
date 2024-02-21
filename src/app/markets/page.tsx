"use client";

import { useEffect } from "react";

import { DisplayMarketTable } from "components/markets/MarketsTable";
import { MarketsInfo } from "components/markets/MarketsInfo";

import { initializeSubscriptions, unsubscribeAll } from "../subscriptions";

import { store } from "../state/store";

export default function Markets() {
  useEffect(() => {
    initializeSubscriptions(store);
    return () => {
      unsubscribeAll();
    };
  }, []);

  return (
    <div className="flex flex-grow flex-col items-center gap-y-8 py-8 border-t-4 border-t-primary">
      <div className="flex flex-grow uppercase border-b-2 border-b-secondary-content">
        <div className="flex flex-grow">
          <MarketsInfo />
        </div>
      </div>
      <div className="flex !my-0 uppercase">
        <DisplayMarketTable />
      </div>
      <div className="flex uppercase">
        <a className="btn btn-lg btn-accent text-primary uppercase" href="/">
          Trade Now
        </a>
      </div>
    </div>
  );
}
