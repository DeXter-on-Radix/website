import { useEffect, useRef } from "react";
import { rewardSlice, fetchReciepts, fetchRewards } from "../state/rewardSlice";
import { useAppDispatch } from "../hooks";

function ClaimButton() {
  const dispatch = useAppDispatch();
  const handleClaim = async () => {
    await dispatch(fetchReciepts());
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

function TotalEarned() {
  const dispatch = useAppDispatch();
  let totalEarnedRef = useRef(0);

  useEffect(() => {
    async function fetchData() {
      console.log("data...");
      await dispatch(fetchReciepts());
      const response = await dispatch(fetchRewards());
      const rewards = response.payload as number;
      totalEarnedRef.current = rewards;
      //console.log(totalEarned);
      //dispatch(claimSlice.actions.getEarnedRewards());
      console.log(totalEarnedRef.current);
    }
    fetchData();
  }, [totalEarnedRef]); // Or [] if effect doesn't need props or state
  return (
    <p>
      Total Earned: <span>{totalEarnedRef.current}</span>
    </p>
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
              <ClaimButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
