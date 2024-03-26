"use client";

import { Claims } from "components/Claims";
import { useEffect } from "react";
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
    <div className="container mx-auto md:px-16 sm:px-0 h-full">
      <div className="flex flex-col justify-center">
        <div className="flex flex-1 xs:flex-col md:flex-row justify-around items-center">
          <h1 className="flex-initial uppercase">Rewards</h1>
          <div className="flex-initial justify-center">
            <img
              className="mx-auto"
              src="/claims/chest.png"
              alt="chest"
              width="240"
            ></img>
          </div>
        </div>
        <div className="flex flex-1 xs:flex-col md:flex-row items-center justify-around">
          <div className="flex flex-1 flex-col flex-inital">
            <p className="text-xl">
              Earn rewards by adding liquidity or trading on DeXter
            </p>
            <p className="text-xl">How does it work?</p>
            <p className="text-sm">
              When you set a buy/sell order on DeXter, you provide liquidity.
            </p>
            <p className="text-sm">
              Liquidity incentives are distributed every two weeks based on
              provided liquidity since the last reward cycle.
            </p>
            <p className="text-sm">
              Rewards are earned for placing orders close to market price, even
              if they&apos;re unlikely to be filled. Higher rewards are given
              for &quot;active liquidity&quot; closer to the mid price to
              encourage trading and reduce price slippage.
            </p>
            <div className="flex xs:flex-col md:flex-row justify-between items-center">
              <p className="flex flex-1 text-xl">Want to earn more?</p>
              <a className="flex -1 btn btn-accent text-primary" href="/">
                PROVIDE LIQUIDITY
              </a>
            </div>
          </div>
          <div className="flex flex-1 xs:order-first md:order-last flex-col items-center">
            <Claims />
          </div>
        </div>
        <div className="flex-1 justify-center my-8 py-8">
          <p className="text-sm">Rewards details:</p>
          <ul className="text-sm">
            <li>
              The DeXter community voted to introduce liquidity rewards
              alongside the existing token distribution process.
            </li>
            <li>
              Tokenomics Proposal: 20,000 DEXTR out of the 100,000 tokens minted
              fortnightly will be allocated to liquidity providers and traders.
            </li>
            <li>
              Categories of Rewards: Executed orders (market and limit) will
              receive 80% of the reward, while active liquidity (unfilled limit
              orders between the 10th and 90th percentile of the price range
              during the period) will receive 20%.
            </li>
            <li>
              Distribution: Snapshots of activity will be taken every two weeks,
              coinciding with contributor nomination phases. Rewards will be
              calculated for orders placed in the preceding two weeks.
            </li>
          </ul>
          <button className="btn btn-accent text-primary">
            LEARN MORE ABOUT REWARDS
          </button>
        </div>
      </div>
    </div>
  );
}
