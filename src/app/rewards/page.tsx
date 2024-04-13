/* eslint-disable camelcase */
"use client";

import { useEffect } from "react";
import { initializeSubscriptions, unsubscribeAll } from "../subscriptions";
import { RootState, store } from "../state/store";
import { useAppDispatch, useAppSelector, useTranslations } from "hooks";
import {
  fetchAccountRewards,
  fetchOrderRewards,
  fetchReciepts,
  rewardSlice,
} from "state/rewardSlice";
import tokenData from "../data/stokenetTokens.json";
import { TokenInfo } from "alphadex-sdk-js";
import { useSelector } from "react-redux";
import { getRewardsByToken } from "state/rewardUtils";
// import { DexterToast } from "components/DexterToaster";

export default function Rewards() {
  useEffect(() => {
    initializeSubscriptions(store);
    return () => {
      unsubscribeAll();
    };
  }, []);

  return (
    <div className="bg-[#141414] h-full">
      <HeaderComponent />
      <RewardsCard />
      {/* Comment back in for old UI */}
      {/* <div className="flex flex-1 flex-col items-center my-8">
        <Rewards />
      </div> */}
    </div>
  );
}

function HeaderComponent() {
  const t = useTranslations();
  return (
    <div className="max-w-[400px] sm:max-w-[600px] px-5 sm:p-0 m-auto">
      <div className="sm:flex sm:justify-center sm:items-center mt-10">
        <div className="text-white sm:w-[62%]">
          <div className="flex flex-col justify-center h-full">
            <DexterHeading title={t("rewards")} />
            <DexterParagraph text={t("earn_rewards_by")} />
          </div>
        </div>
        <div className="sm:w-[38%] max-[640px]:max-w-[200px] sm:ml-5">
          <img
            src="/rewards/chest.png"
            alt="treasury"
            className="w-full"
            width={218}
          />
        </div>
      </div>
    </div>
  );
}

function DexterParagraph({ text }: { text: string }) {
  return <p className="text-sm tracking-wide py-2">{text}</p>;
}

function DexterHeading({ title }: { title: string }) {
  return (
    <>
      <h2
        className="text-md bg-gradient-to-r from-dexter-gradient-blue to-dexter-gradient-green to-50% bg-clip-text text-transparent font-normal"
        style={{
          margin: 0,
          marginBottom: "20px",
          marginTop: "0px",
          fontSize: "45px",
        }}
      >
        {title}
      </h2>
    </>
  );
}

function RewardsCard() {
  const dispatch = useAppDispatch();
  const { isConnected } = useAppSelector((state) => state.radix);
  const t = useTranslations();

  useEffect(() => {
    async function loadRewards() {
      // TODO: ask @fredlieb whether we can fetch all things asynchronously?
      await dispatch(fetchReciepts());
      await dispatch(fetchAccountRewards());
      await dispatch(fetchOrderRewards());
    }
    if (isConnected) {
      loadRewards();
    }
  }, [dispatch, isConnected]);
  return (
    <div className="max-w-[400px] sm:max-w-[600px] w-full px-4 py-4 sm:px-12 sm:py-8 m-auto mt-2 sm:mt-14 mb-28 bg-[#191B1D]">
      <div className="flex flex-col">
        <div>
          <h4
            style={{ margin: 0, marginBottom: 12 }}
            className={isConnected ? "" : "opacity-50 text-center"}
          >
            {isConnected
              ? t("total_rewards") + ":"
              : t("connect_wallet_to_claim_rewards")}
          </h4>
        </div>
        <ClaimableCoins />
        <ClaimButton />
        <LearnMore />
      </div>
    </div>
  );
}

function LearnMore() {
  const t = useTranslations();
  return (
    <a
      target="_blank"
      href="https://dexter-on-radix.gitbook.io/dexter/overview/how-are-contributors-rewarded/liquidity-incentives"
    >
      <p className="text-xs opacity-60 text-center">
        {t("learn_more_about_rewards")}
      </p>
    </a>
  );
}

function ClaimableCoins() {
  // TODO: replace hardcoded coins with fetched coins to claim
  // const { rewardData } = useAppSelector((state) => state.rewardSlice);
  const { isConnected } = useAppSelector((state) => state.radix);
  // const dispatch = useAppDispatch();
  const rewardData = useSelector(
    (state: RootState) => state.rewardSlice.rewardData
  );

  // useEffect(() => {
  //   async function fetchData() {
  //     await dispatch(fetchReciepts());
  //     await dispatch(fetchAccountRewards());
  //     await dispatch(fetchOrderRewards());
  //   }
  //   fetchData();
  // }, [dispatch]);

  const rewardsByToken = getRewardsByToken(
    rewardData.accountsRewards,
    rewardData.ordersRewards
  );
  const claimableCoins: {
    name: string;
    symbol: string;
    iconUrl: string;
    amount: number;
  }[] = isConnected
    ? rewardsByToken.map((tokenReward) => {
        return {
          ...getTokenInfo(tokenReward.tokenAddress),
          amount: tokenReward.amount,
        };
      })
    : [];

  return (
    <div>
      {claimableCoins.map((val, indx) => (
        <div
          className="flex justify-between items-center w-full text-base p-3 my-2 bg-[#232629] rounded"
          key={indx}
        >
          <img
            src={val.iconUrl}
            alt={val.name}
            className="w-7 h-7 rounded-full mr-3"
          ></img>
          <span className="flex-1 truncate">{val.name}</span>
          <span className="uppercase">
            {val.amount} {val.symbol}
          </span>
        </div>
      ))}
    </div>
  );
}

function ClaimButton() {
  const { isConnected } = useAppSelector((state) => state.radix);
  const dispatch = useAppDispatch();
  const handleClaim = async () => {
    await dispatch(fetchReciepts()); //Get all users reciepts already exists
    await dispatch(rewardSlice.actions.claimRewards());
  };
  // const t = useTranslations();
  return (
    <button
      className={`w-full max-w-[220px] m-auto font-bold text-sm tracking-[.1px] min-h-[44px] p-3 my-6 uppercase rounded ${
        isConnected
          ? "bg-dexter-gradient-green text-black"
          : "bg-[#232629] text-[#474D52] opacity-50"
      }`}
      onClick={handleClaim}
      // // TODO: make claimRewards an async function using createAsyncThunk<>
      // // then comment the below code back in:
      // onClick={async (e) => {
      //   e.stopPropagation();
      //   DexterToast.promise(
      //     async () => {
      //       handleClaim();
      //     },
      //     t("claiming_rewards_loading"),
      //     t("claiming_rewards_success"),
      //     t("claiming_rewards_fail")
      //   );
      // }}
    >{`Claim All Rewards`}</button>
  );
}

// HARDCODED TOKEN INFO FROM RESSOURCE
// To get all token info, use the following code snippet inside
// pair selector component:
// https://gist.github.com/dcts/e92ad3302be703707592761426854dec
function getTokenInfo(tokenAddress: string): {
  address: string;
  symbol: string;
  name: string;
  iconUrl: string;
} {
  const tokenDict: Record<string, TokenInfo> = tokenData;

  return tokenDict[tokenAddress]
    ? tokenDict[tokenAddress]
    : {
        address: tokenAddress,
        name: "Unknown Token",
        symbol: "?",
        iconUrl: "/unknown-token-icon.svg",
      };
}
