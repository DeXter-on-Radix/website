"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { OrderBook } from "../components/OrderBook";
import { OrderInput } from "../components/OrderInput";
import { PairSelector } from "../components/PairSelector";
import { TradingChartOrPairInfo } from "../components/PriceChart";
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

  // Update orders of selected pair every 5 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch(fetchBalances());
      dispatch(fetchAccountHistory());
    }, 5000); // Dispatch every 5000 milliseconds (5 second)

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [dispatch]);

  // Update orders of all pairs every 2 mins (if selected)
  useEffect(() => {
    const showAllPairs = !hideOtherPairs;
    if (showAllPairs) {
      dispatch(fetchAccountHistoryAllPairs());
    }

    const intervalId = setInterval(() => {
      if (showAllPairs) {
        dispatch(fetchAccountHistoryAllPairs());
      }
    }, 120000); // Dispatch every 2 mins (120 seconds)

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [dispatch, hideOtherPairs]);

  return (
    <div className="grow">
      <PromoBannerCarousel
        items={[
          // DAO vote banner
          {
            imageUrl: "/promo-banners/crumbsup-tokenomics-desktop2x.png",
            imageUrlMobile: "/promo-banners/crumbsup-tokenomics-mobile2x.png",
            redirectUrl:
              "https://www.crumbsup.io/#proposal?id=f7bf5bcc-dafd-4aa0-8d18-1754f2aa7b46",
            backgroundColor: "bg-[#087277]",
            expirationDate: new Date("2024-08-19"),
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
          <div className="priceChart pl-4 pr-4 pt-2">
            <TradingChartOrPairInfo />
          </div>
          <div className="tradeHistory max-w-[100%] w-full overflow-x-auto scrollbar-thin">
            <AccountHistory />
          </div>
        </div>
      </div>
    </div>
  );
}
