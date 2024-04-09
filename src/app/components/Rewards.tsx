import {
  rewardSlice,
  fetchReciepts,
  fetchAccountRewards,
  fetchOrderRewards,
} from "../state/rewardSlice";
import { useAppDispatch } from "../hooks";
import { useSelector } from "react-redux";
import type { RootState } from "../state/store";

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
  const rewardData = useSelector(
    (state: RootState) => state.rewardSlice.rewardData
  );
  const accountRewardsTable = rewardData.rewardsAccounts?.flatMap((rewards) =>
    rewards.rewards.flatMap((typeReward) =>
      typeReward.tokenRewards.map((tokenReward) => tokenReward)
    )
  );

  const rewardsTable = rewardData.rewardsOrders?.flatMap((receipt) =>
    receipt.rewards.flatMap((reward) =>
      reward.tokenRewards.map((tokenReward) => tokenReward)
    )
  );
  return (
    <div className="text-xs">
      <table>
        <thead>
          <tr>
            <th>Account Rewards</th>
          </tr>
        </thead>
        <tbody>
          {accountRewardsTable?.map((account, index) => (
            <tr key={`account-${index}`}>
              <td>{account.tokenAddress}</td>
              <td>{account.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <table>
        <thead>
          <tr>
            <th>Order Rewards</th>
          </tr>
        </thead>
        <tbody>
          {rewardsTable?.map((order, index) => (
            <tr key={`order-${index}`}>
              <td>{order.tokenAddress}</td>
              <td>{order.amount}</td>
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
