"use client";

import { AccountHistory } from "./components/AccountHistory";
import { PairInfo } from "./components/PairInfo";

export default function Home() {
  return (
    <main className="mx-6">
      <PairInfo />
      <AccountHistory />
    </main>
  );
}
