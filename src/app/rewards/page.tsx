"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector, useTranslations } from "hooks";
import {
  fetchAddresses,
  fetchReciepts,
  fetchAccountRewards,
  fetchOrderRewards,
  claimRewards,
  rewardSlice,
  getUserHasRewards,
} from "../state/rewardSlice";

// import { useSelector } from "react-redux";
import { getTokenRewards, getTypeRewards } from "../state/rewardUtils";

// import * as adex from "alphadex-sdk-js";
import { DexterToast } from "../components/DexterToaster";

export default function Rewards() {
  const { showSuccessUi } = useAppSelector((state) => state.rewardSlice);
  return (
    <div className="bg-[#141414] h-screen flex flex-col items-center justify-center">
      <div>
        <HeaderComponent />
        {showSuccessUi ? <SuccessUi /> : <RewardsCard />}
      </div>
    </div>
  );
}

function SuccessUi() {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  return (
    <div className="max-w-[400px] sm:max-w-[600px] rounded-2xl w-full px-4 py-4 sm:px-12 sm:py-8 m-auto mt-2 sm:mt-14 mb-28 bg-[#191B1D]">
      <div className="flex flex-col items-center pb-6">
        {/* Title */}
        <h4 className="font-bold text-center text-3xl !m-0 !my-5">
          {t("rewards_claimed")} 🎉
        </h4>

        {/* Subtitle */}
        <p className="text-base text-center px-2">
          {t("continue_trading_to_earn_more")}
        </p>

        {/* "Go Back" button */}
        <button
          className={`max-w-[220px] min-h-[44px] uppercase w-full px-4 my-6 mt-8 rounded bg-dexter-green text-black opacity-100`}
          onClick={() => dispatch(rewardSlice.actions.resetRewardState())}
        >
          <span className="font-bold text-sm tracking-[.1px] ">
            {t("go_back")}
          </span>
        </button>

        {/* Send feedback secondary action */}
        <SecondaryAction
          textIdentifier="how_did_everything_go"
          targetUrl="https://t.me/dexter_discussion"
        />
      </div>
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

function RewardsCard() {
  const dispatch = useAppDispatch();
  const { isConnected, walletData } = useAppSelector((state) => state.radix);
  const account = walletData.accounts[0]?.address;
  const t = useTranslations();
  const { rewardData, pairsList } = useAppSelector(
    (state) => state.rewardSlice
  );
  const userHasRewards = getUserHasRewards(rewardData);

  useEffect(() => {
    async function loadRewards() {
      await dispatch(fetchAddresses());
      let fetchReceiptsAction = await dispatch(fetchReciepts(pairsList));
      // console.log("fetchReceiptsAction: ", fetchReceiptsAction);
      await dispatch(fetchAccountRewards());
      await dispatch(
        fetchOrderRewards(fetchReceiptsAction.payload as string[])
      );
    }
    if (isConnected) {
      loadRewards();
    }
  }, [dispatch, isConnected, account, pairsList]);
  return (
    <div className="max-w-[400px] sm:max-w-[600px] w-full px-4 py-4 sm:px-12 sm:py-8 m-auto mt-2 sm:mt-14 mb-28 bg-[#191B1D]">
      <div className="flex flex-col">
        <div>
          <h4
            style={{ margin: 0, marginBottom: 12 }}
            className={
              !isConnected || !userHasRewards ? "opacity-50 text-center" : ""
            }
          >
            {!isConnected
              ? t("connect_wallet_to_claim_rewards")
              : userHasRewards
                ? t("total_rewards")
                : t("no_rewards_to_claim")}
          </h4>
        </div>
        <RewardsOverview />
        <ClaimButton />
        <SecondaryAction
          textIdentifier="learn_more_about_rewards"
          targetUrl="https://dexter-on-radix.gitbook.io/dexter/overview/how-are-contributors-rewarded/liquidity-incentives"
        />
        <RewardsDetails />
      </div>
    </div>
  );
}

interface SecondaryActionProps {
  textIdentifier: string;
  targetUrl: string;
}
function SecondaryAction({ textIdentifier, targetUrl }: SecondaryActionProps) {
  const t = useTranslations();
  return (
    <a target="_blank" href={targetUrl}>
      <p className="text-xs opacity-60 text-center">{t(textIdentifier)}</p>
    </a>
  );
}

function RewardsOverview() {
  const { rewardData, tokensList } = useAppSelector(
    (state) => state.rewardSlice
  );

  const tokenRewards = getTokenRewards(
    rewardData.accountsRewards,
    rewardData.ordersRewards,
    tokensList
  );

  return (
    <div>
      {tokenRewards.map((rewardToken, indx) => (
        <div
          className="flex justify-between items-center w-full text-base p-3 my-2 bg-[#232629] rounded"
          key={indx}
        >
          <img
            src={rewardToken.iconUrl}
            alt={rewardToken.name}
            className="w-7 h-7 rounded-full mr-3"
          ></img>
          <span className="flex-1 truncate">{rewardToken.name}</span>
          <span className="uppercase">
            {rewardToken.amount} {rewardToken.symbol}
          </span>
        </div>
      ))}
    </div>
  );
}

function ClaimButton() {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { isConnected } = useAppSelector((state) => state.radix);
  const { rewardData } = useAppSelector((state) => state.rewardSlice);
  const userHasRewards = getUserHasRewards(rewardData);
  const disabled = !isConnected || !userHasRewards;

  return (
    <button
      className={`w-full max-w-[220px] m-auto font-bold text-sm tracking-[.1px] min-h-[44px] p-3 my-6 uppercase rounded ${!disabled
          ? "bg-dexter-gradient-green text-black"
          : "bg-[#232629] text-[#474D52] opacity-50"
        }`}
      onClick={async (e) => {
        e.stopPropagation();
        DexterToast.promise(
          async () => {
            const action = await dispatch(claimRewards());
            if (!action.type.endsWith("fulfilled")) {
              // Transaction was not fulfilled (e.g. userRejected or userCanceled)
              throw new Error("Transaction failed due to user action.");
            } else if ((action.payload as any)?.status === "ERROR") {
              // Transaction was fulfilled but failed (e.g. submitted onchain failure)
              throw new Error("Transaction failed onledger");
            }
          },
          t("claiming_rewards_loading"),
          t("claiming_rewards_success"),
          t("claiming_rewards_fail")
        );
      }}
    >
      {t("claim_all_rewards")}
    </button>
  );
}

function RewardsDetails() {
  const [isOpen, setIsOpen] = useState(true);
  const { isConnected } = useAppSelector((state) => state.radix);
  const { rewardData, tokensList } = useAppSelector(
    (state) => state.rewardSlice
  );
  const userHasRewards = getUserHasRewards(rewardData);

  useEffect(() => {
    if (!isConnected) {
      setIsOpen(false);
    }
  }, [isConnected]);

  if (!isConnected || !userHasRewards) {
    return <></>;
  }

  const typeRewards = getTypeRewards(
    rewardData.accountsRewards,
    rewardData.ordersRewards,
    tokensList
  );

  return (
    <div className="mt-10">
      <div
        className="border-b-2 border-b-[#232629] flex align-center pb-1 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img
          src="/triangle.svg"
          alt="triangle icon"
          className={"mr-2 cursor-pointer " + (!isOpen ? "rotate-180" : "")}
        />
        <p className="text-base select-none">Details</p>
      </div>
      {isOpen && (
        <>
          {typeRewards.map((typeReward, indx) => (
            <div key={indx}>
              <h6 className={"!m-0 !my-3  text-white text-sm"}>
                {typeReward.rewardType}
              </h6>
              {typeReward.tokenRewards.map((tokenReward, indx2) => (
                <div
                  className="flex justify-between items-center w-full text-xs px-3 my-1 bg-[#232629] rounded h-[33px]"
                  key={indx2}
                >
                  <img
                    src={tokenReward.iconUrl}
                    alt={tokenReward.name}
                    className="w-4 h-4 rounded-full mr-2"
                  ></img>
                  <span className="flex-1 truncate">{tokenReward.name}</span>
                  <span className="uppercase">
                    {tokenReward.amount} {tokenReward.symbol}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
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
