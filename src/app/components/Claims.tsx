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
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body items-center uppercase">
          <div className="w-full relative h-[418.7px] text-center text-base text-colors-primary-10 font-title-large">
            <div className="top-[366.7px] left-[2px] rounded-sm bg-colors-primary-50 w-[506px] overflow-hidden flex flex-col items-center justify-center py-4 px-8 box-border">
              <b className="relative tracking-[0.1px] leading-[20px] uppercase">
                CLAIM REWARDS
              </b>
              <ClaimButton />
            </div>
            <div className=" top-[0px] left-[147px] text-13xl leading-[40px] text-colors-primary-50 inline-block w-[216px] h-[44.3px]">
              Claim rewards
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
