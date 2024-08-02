"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { OrderBook } from "../components/OrderBook";
import { OrderInput } from "../components/OrderInput";
import { PairSelector } from "../components/PairSelector";
import { PriceChart } from "../components/PriceChart";
import { AccountHistory } from "../components/AccountHistory";
import { PriceInfo } from "../components/PriceInfo";
import { fetchBalances, selectPair } from "state/pairSelectorSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchAccountHistory,
  fetchAccountHistoryAllPairs,
} from "../state/accountHistorySlice";

import { PromoBannerCarousel } from "../components/PromoBannerCarousel";

export default function Trade() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const pairSelector = useAppSelector((state) => state.pairSelector);
  const pairName = pairSelector.name;
  const pairsList = pairSelector.pairsList;

  const hideOtherPairs = useAppSelector(
    (state) => state.accountHistory.hideOtherPairs
  );

  // Detect changes in selected pair and adjust pagetitle
  useEffect(() => {
    document.title = pairName ? `DeXter • ${pairName.toUpperCase()}` : "DeXter";
  }, [pairName]);

  // Set pair that was specified in query param
  useEffect(() => {
    if (pairsList.length > 0) {
      const pairToInit = searchParams.get("pair")?.split("-").join("/");
      const pair = pairsList.find(
        (pair) => pair.name.toUpperCase() === pairToInit?.toUpperCase()
      );
      if (pair) {
        dispatch(
          selectPair({ pairAddress: pair.address, pairName: pair.name })
        );
      }
    }
  }, [pairsList, dispatch, searchParams]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch(fetchBalances());
      dispatch(fetchAccountHistory());
      // console.log("5 seconds");
    }, 5000); // Dispatch every 5000 milliseconds (5 second)

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [dispatch]);

  useEffect(() => {
    const showAllPairs = !hideOtherPairs;
    if (showAllPairs) {
      dispatch(fetchAccountHistoryAllPairs());
    }

    const intervalId = setInterval(() => {
      if (showAllPairs) {
        dispatch(fetchAccountHistoryAllPairs());
      }
      // console.log("120 seconds");
    }, 120000); // Dispatch every 2 mins (120 seconds)

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [dispatch, hideOtherPairs]);

  return (
    <div className="grow">
      <PromoBannerCarousel
        items={[
          // mox liquidity incentive banner
          {
            imageUrl: "/promo-banners/mox-desktop.png",
            imageUrlMobile: "/promo-banners/mox-mobile.png",
            redirectUrl: "https://dexteronradix.com/trade?pair=mox-xrd",
            backgroundColor: "bg-[#FF5634]",
            redirectOpensInSameTab: true,
          },
          // tokentrek banner
          {
            imageUrl: "/promo-banners/tokentrek-desktop.svg",
            imageUrlMobile: "/promo-banners/tokentrek-mobile.svg",
            redirectUrl:
              "https://tokentrek.io/dashboard/projects?p=1716380462347x668376794882113500",
            backgroundColor: "bg-[#062b28]",
          },
          // Validator node banner
          {
            imageUrl: "/promo-banners/validatornode-desktop.svg",
            imageUrlMobile: "/promo-banners/validatornode-mobile.svg",
            redirectUrl:
              "https://dashboard.radixdlt.com/network-staking/validator_rdx1s0sr7xsr286jwffkkcwz8ffnkjlhc7h594xk5gvamtr8xqxr23a99a",
          },
        ]}
        interval={10000}
      />
      <div className="max-w-[1521px] m-auto border-x border-[#d0d0d01a]">
        <div className="grid-container">
          <div className="pairSelector">
            <PairSelector />
          </div>
          <div className="priceInfo">
            <PriceInfo />
          </div>
          <div className="orderBook max-[850px]:p-5 max-[700px]:p-0 ">
            <OrderBook />
          </div>
          <div className="orderInput max-[850px]:p-5 max-[700px]:p-0 ">
            <OrderInput />
          </div>
          <div className="priceChart pl-4 pr-2 pt-2">
            <PriceChart />
          </div>
          <div className="tradeHistory max-w-[100%] w-full overflow-x-auto scrollbar-thin">
            <AccountHistory />
          </div>
        </div>
      </div>
    </div>
  );
}
