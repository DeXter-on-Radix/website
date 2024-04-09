import { useEffect } from "react";
import {
  rewardSlice,
  fetchReciepts,
  fetchRewards,
  fetchAccountRewards,
  fetchOrderRewards,
} from "../state/rewardSlice";
import { useAppDispatch } from "../hooks";
import { useSelector } from "react-redux";
import type { RootState } from "../state/store";

import {
  TypeRewards,
  TokenReward,
} from "./rewardUtils";

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
  const rewardData = useSelector(
    (state: RootState) => state.rewardSlice.rewardData
  );
  const handleClaim = async () => {
    const c = await dispatch(fetchReciepts());
    //const response = await dispatch(fetchRewards());
    const a = await dispatch(fetchAccountRewards());
    const b = await dispatch(fetchOrderRewards());
    console.log(rewardData);
    //console.log(a);
    //dispatch(rewardSlice.actions.claimRewards());
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
  const rewardData = useSelector(
    (state: RootState) => state.rewardSlice.rewardData
  );
  console.log("update");
  return (
    <div className="text-xs">
      <table>
        <thead>
          <tr>
            <th>Account Address</th>
          </tr>
        </thead>
        <tbody>
          {rewardData.rewardsAccounts?.map((account, index) => (
            <tr key={`account-${index}`}>
              <td>{account.accountAddress}</td>
              <td>{account.rewards.toString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <table>
        <thead>
          <tr>
            <th>Order Details</th>
          </tr>
        </thead>
        <tbody>
          {rewardData.rewardsOrders?.map((order, index) => (
            <tr key={`order-${index}`}>
              <td>{JSON.stringify(order)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Rewards() {
  return (
    <div>
      <div className="card bg-base-100">
        <div className="card-body items-center uppercase">
          <div className="w-full text-center ">
            <div className="flex flex-col items-center justify-center py-4 px-8 box-border gap-y-4">
              <b className="uppercase">CLAIM REWARDS</b>
              <TotalEarned />
              <ClaimButton2 />
              <ClaimButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
