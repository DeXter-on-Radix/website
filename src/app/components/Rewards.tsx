import {
  rewardSlice,
  fetchReciepts,
  fetchAccountRewards,
  fetchOrderRewards,
} from "../state/rewardSlice";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { useSelector } from "react-redux";
import type { RootState } from "../state/store";
import { getOrdersByRewardType } from "state/rewardUtils";

function ClaimButton() {
  const dispatch = useAppDispatch();
  const handleClaim = async () => {
    await dispatch(fetchReciepts()); //Get all users reciepts already exists
    dispatch(rewardSlice.actions.claimRewards());
  };

  return (
    <button
      className="btn btn-wide btn-primary-content btn-accent uppercase"
      onClick={() => {
        handleClaim();
      }}
    >
      Claims
    </button>
  );
}

function ClaimButton2() {
  const dispatch = useAppDispatch();
  const handleClaim = async () => {
    await dispatch(fetchReciepts());
    await dispatch(fetchAccountRewards());
    await dispatch(fetchOrderRewards());
  };

  return (
    <button
      className="btn btn-wide btn-primary-content btn-accent uppercase"
      onClick={() => {
        handleClaim();
      }}
    >
      Load Rewards
    </button>
  );
}

function TotalEarned() {
  const dispatch = useAppDispatch();
  const rewardData = useSelector(
    (state: RootState) => state.rewardSlice.rewardData
  );

  useEffect(() => {
    async function fetchData() {
      await dispatch(fetchReciepts());
      await dispatch(fetchAccountRewards());
      await dispatch(fetchOrderRewards());
    }
    fetchData();
  }, []);

  // const accountRewardsTable = rewardData.rewardsAccounts?.flatMap(
  //   (accountRewards) =>
  //     accountRewards.rewards.flatMap((typeRewards) =>
  //       typeRewards.tokenRewards.map((tokenReward) => tokenReward)
  //     )
  // );

  // const rewardsTable = rewardData.rewardsOrders?.flatMap((receipt) =>
  //   receipt.rewards.flatMap((reward) =>
  //     reward.tokenRewards.map((tokenReward) => tokenReward)
  //   )

  const ordersByRewardType = getOrdersByRewardType(rewardData.ordersRewards);
  const ordersRewardsTypes = Array.from(ordersByRewardType.keys());
  // );
  return (
    <div className="text-xs">
      {rewardData.accountsRewards?.map((accountRewards) => (
        <h3 key={accountRewards.accountAddress}>
          Account Rewards (Account: {accountRewards.accountAddress})
        </h3>
      ))}
      <h3>Market Order Rewards</h3>
      <table>
        <tbody>
          {ordersRewardsTypes.map((rewardType) => (
            <tr key={rewardType}>
              <td>{rewardType}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Rewards() {
  // TODO: once https://github.com/DeXter-on-Radix/website/pull/335 is merged, use state from isConnected boolean
  const { walletData } = useAppSelector((state) => state.radix);
  const isConnected = walletData.accounts.length > 0;
  return (
    <div>
      <div className="card bg-base-100">
        <div className="card-body items-center uppercase">
          <div className="w-full text-center ">
            <div className="flex flex-col items-center justify-center py-4 px-8 box-border gap-y-4">
              {isConnected ? <LoggedInClaimUi /> : <LoggedOutClaimUi />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoggedInClaimUi() {
  return (
    <>
      <b className="uppercase">CLAIM REWARDS</b>
      <TotalEarned />
      <ClaimButton2 />
      <ClaimButton />
    </>
  );
}

function LoggedOutClaimUi() {
  return (
    <>
      <b className="uppercase">Login to claim Rewards</b>
    </>
  );
}
