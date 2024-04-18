/* eslint-disable camelcase */
"use client";

import { useEffect } from "react";
import { initializeSubscriptions, unsubscribeAll } from "../subscriptions";
import { RootState, store } from "../state/store";
import { useAppDispatch, useAppSelector, useTranslations } from "hooks";
import {
  fetchAddresses,
  fetchReciepts,
  fetchAccountRewards,
  fetchOrderRewards,
  rewardSlice,
} from "state/rewardSlice";

// import { loadTokenDict } from "data/loadData";
import { useSelector } from "react-redux";
import {
  TokenReward,
  getRewardsByToken,
  getRewardsByTypeThenToken,
} from "state/rewardUtils";

import * as adex from "alphadex-sdk-js";
// import { DexterToast } from "components/DexterToaster";

export default function Rewards() {
  useEffect(() => {
    initializeSubscriptions(store);
    return () => {
      unsubscribeAll();
    };
  }, []);

  return (
    <div className="bg-[#141414]">
      <HeaderComponent />
      {/* <DebugStateLogger /> */}
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
      await dispatch(fetchAddresses());
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
        <div>
          <h4
            style={{ margin: 0, marginBottom: 12 }}
            className={isConnected ? "" : "opacity-50 text-center"}
          >
            {isConnected
              ? t("Reward Details") + ":"
              : t("connect_wallet_to_claim_rewards")}
          </h4>
        </div>
        <ClaimableTypes />
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
  // const tokenDict = loadTokenDict();
  // TODO: replace hardcoded coins with fetched coins to claim
  // const { rewardData } = useAppSelector((state) => state.rewardSlice);
  const tokensMap = adex.clientState.tokensMap;
  // const dispatch = useAppDispatch();
  const rewardData = useSelector(
    (state: RootState) => state.rewardSlice.rewardData
  );

  const rewardsByToken = getRewardsByToken(
    rewardData.accountsRewards,
    rewardData.ordersRewards,
    tokensMap
  );

  return <TokenList tokenRewards={rewardsByToken} />;
}

function ClaimableTypes() {
  const tokensMap = adex.clientState.tokensMap;
  // const tokenDict = loadTokenDict();
  // TODO: replace hardcoded coins with fetched coins to claim

  // const { rewardData } = useAppSelector((state) => state.rewardSlice);
  const { isConnected } = useAppSelector((state) => state.radix);
  // const dispatch = useAppDispatch();
  const rewardData = useSelector(
    (state: RootState) => state.rewardSlice.rewardData
  );

  const rewardsByTypeThenToken = getRewardsByTypeThenToken(
    rewardData.accountsRewards,
    rewardData.ordersRewards,
    tokensMap
  );

  return (
    <div>
      {rewardsByTypeThenToken.map((typeReward, indx) => (
        <div key={indx}>
          <h6
            style={{ margin: 0, marginBottom: 12 }}
            className={isConnected ? "text-white" : "opacity-50 text-center"}
          >
            {isConnected
              ? typeReward.rewardType + ":"
              : "connect_wallet_to_claim_rewards"}
          </h6>
          <TokenList tokenRewards={typeReward.tokenRewards} />
        </div>
      ))}
    </div>
  );
}

function TokenList({ tokenRewards }: { tokenRewards: TokenReward[] }) {
  return (
    <div>
      {tokenRewards.map((val, indx) => (
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

// function DebugStateLogger() {
//   const { config, recieptIds, rewardData } = useAppSelector(
//     (state) => state.rewardSlice
//   );
//   // const tartgetToken = useAppSelector(selectTargetToken);
//   let fetchAddresses = `resourcePrefix = ${config.resourcePrefix}\n`;
//   fetchAddresses += `rewardComponent = ${config.rewardComponent}\n`;
//   fetchAddresses += `rewardNFTAddress = ${config.rewardNFTAddress}\n`;
//   fetchAddresses += `rewardOrderAddress = ${config.rewardOrderAddress}\n`;
//   fetchAddresses += `rewardVaultAddress = ${config.rewardVaultAddress}\n`;
//   let fetchReciepts = `recieptIds = ${recieptIds.join("@newline@")}\n`;
//   let fetchAccountRewards = `accountRewards = ${rewardData.accountsRewards[0]?.rewards
//     .map((r) => r.rewardType)
//     .join("@newline@")}\n`;

//   console.log("rewardData.accountsRewards");
//   console.log(rewardData.accountsRewards);
//   console.log("rewardData.ordersRewards");
//   console.log(rewardData.ordersRewards);
//   const renderTable = (input: string, title: string) => {
//     return (
//       <>
//         <p>DEBUG {title}</p>
//         <table className="max-w-[500px] m-auto mb-5">
//           <tbody>
//             {input.split("\n").map((line, index) => {
//               const parts = line.split("="); // Split each line by "="
//               return (
//                 <tr key={index}>
//                   <td style={{ padding: 0 }} className="w-1/3  text-sm">
//                     {parts[0]}
//                   </td>{" "}
//                   {/* First part of the line */}
//                   <td style={{ padding: 0 }} className="w-2/3  text-sm">
//                     {parts[1]?.includes("@newline@")
//                       ? parts[1].split("@newline@").join("\n")
//                       : parts[1]}
//                   </td>{" "}
//                   {/* Second part of the line */}
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </>
//     );
//   };
//   return (
//     <div className="max-w-[800px] m-auto">
//       <strong>STATE DEBUGGER</strong>
//       {renderTable(fetchAddresses, "fetchAddresses")}
//       {renderTable(fetchReciepts, "fetchReciepts")}
//       {renderTable(fetchAccountRewards, "fetchAccountRewards")}
//     </div>
//   );
// }
