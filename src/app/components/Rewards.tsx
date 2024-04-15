import {
  rewardSlice,
  fetchReciepts,
  fetchAccountRewards,
  fetchOrderRewards,
  fetchAddresses,
} from "../state/rewardSlice";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { useSelector } from "react-redux";
import type { RootState } from "../state/store";
import { getRewardsByToken } from "state/rewardUtils";

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
      await dispatch(fetchAddresses());
      await dispatch(fetchReciepts());
      await dispatch(fetchAccountRewards());
      await dispatch(fetchOrderRewards());
    }
    fetchData();
  }, [dispatch]);

  const rewardsByToken = getRewardsByToken(
    rewardData.accountsRewards,
    rewardData.ordersRewards,
    {}
  );
  // );
  return (
    <div className="text-xs">
      <table>
        <tbody>
          {rewardsByToken.map((tokenReward) => (
            <tr key={tokenReward.address}>
              <td>{tokenReward.address}</td>
              <td>{tokenReward.amount}</td>
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
