import React from "react";
import { claimSlice, fetchReciepts } from "../state/claimSlice";
import { useAppDispatch } from "../hooks";

function ClaimButton() {
  const dispatch = useAppDispatch();
  const handleClaim = async () => {
    const reciepts = await dispatch(fetchReciepts());
    dispatch(claimSlice.actions.claimRewards(reciepts.payload as String[]));
  };

  return (
    <button
      className="btn btn-primary-content"
      onClick={() => {
        handleClaim();
      }}
    >
      Claims
    </button>
  );
}

export function Claims() {
  return (
    <div>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body items-center uppercase">
          <div className="w-full relative text-center text-base text-colors-primary-10 font-title-large">
            <div className=" rounded-sm bg-colors-primary-50  overflow-hidden flex flex-col items-center justify-center py-4 px-8 box-border">
              <b className="uppercase">CLAIM REWARDS</b>
              <ClaimButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
