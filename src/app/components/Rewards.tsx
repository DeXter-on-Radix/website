import { useEffect, useRef } from "react";
import { rewardSlice, fetchReciepts, fetchRewards } from "../state/rewardSlice";
import { useAppDispatch } from "../hooks";
import { useSelector } from "react-redux";

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
  const rewardsTotal = useSelector((state) => state.rewardSlice.rewardsTotal);

  useEffect(() => {
    async function fetchData() {
      console.log("data...");
      await dispatch(fetchReciepts());
      await dispatch(fetchRewards());
    }
    fetchData();
  }, []); // Or [] if effect doesn't need props or state
  return (
    <p>
      Total Earned: <span>{rewardsTotal}</span>
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
              <ClaimButton2 />
              <ClaimButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
