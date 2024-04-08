import { useEffect, useState } from "react";
import { rewardSlice, fetchReciepts, fetchRewards } from "../state/rewardSlice";
import { radixSlice } from "../state/radixSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
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
    const a = await dispatch(fetchReciepts());
    const response = await dispatch(fetchRewards());
    console.log(response.payload);
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
  const dispatch = useAppDispatch();
  const rewardsTotal = useSelector(
    (state: RootState) => state.rewardSlice.rewardsTotal
  );
  const [loadingRewards, setLoadingRewards] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoadingRewards(true);
      await dispatch(fetchReciepts());
      await dispatch(fetchRewards());
      setLoadingRewards(false);
    }
    fetchData();
  }, []); // Or [] if effect doesn't need props or state
  return (
    <p>
      Total Rewards:{" "}
      <span>
        {loadingRewards ? "loading rewards..." : `${rewardsTotal} DEXTR`}
      </span>
    </p>
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
