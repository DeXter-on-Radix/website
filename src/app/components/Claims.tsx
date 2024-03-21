import React from "react";
import { claimSlice, fetchReciepts } from "../state/claimSlice";
import { useAppSelector, useAppDispatch } from "../hooks";


function ClaimButton() {
  const dispatch = useAppDispatch();
  const handleClaim = async () => {
    console.log("claiming");
    const reciepts = await dispatch(fetchReciepts());
    dispatch(claimSlice.actions.claimRewards("156"));
    //dispatch(claimSlice.actions.getReciepts());
    //dispatch(fetchReciepts());
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

function FetchRecieptsButton() {
  const dispatch = useAppDispatch();
  const handleClaim = () => {
    console.log("claiming");
    //dispatch(claimSlice.actions.getClaimNFT("156"));
    //dispatch(claimSlice.actions.getReciepts());
    dispatch(fetchReciepts());
  };

  return (
    <button
      className="btn btn-primary-content"
      onClick={() => {
        handleClaim();
      }}
    >
      Fetch REciepts
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
              <FetchRecieptsButton />
              <ClaimButton />
            </div>
            <div className=" top-[0px] left-[147px] text-13xl leading-[40px] text-colors-primary-50 inline-block w-[216px] h-[44.3px]">
              Claim rewards
            </div>
            <div className=" top-[110.8px] left-[0px] w-[508px] h-[189.5px] text-left text-3xl text-colors-tertiary-50">
              <div className=" top-[0px] left-[0px] leading-[28px] inline-block w-[137px] h-[31px]">
                Total earned:
              </div>
              <div className=" top-[0px] left-[344px] leading-[28px] text-colors-primary-50 text-right inline-block w-[162px] h-[31px]">
                10.000 $DEXTR
              </div>
              <div className="h-[69.55%] w-full top-[30.4%] right-[0%] bottom-[0.05%] left-[0%] text-center text-2xs text-colors-tertiary-100">
                <div className="h-[29.44%] w-[99.61%] top-[70.64%] right-[0%] bottom-[-0.08%] left-[0.39%]">
                  <div className="h-[54.38%] w-full top-[45.62%] right-[0%] bottom-[0%] left-[0%]">
                    <div className="h-[83.89%] w-[5.18%] top-[10.43%] left-[0%] tracking-[0.5px] leading-[16px] font-medium text-left inline-block">
                      0%
                    </div>
                    <div className="h-[83.89%] w-[7.31%] top-[10.43%] left-[21.96%] tracking-[0.5px] leading-[16px] font-medium inline-block">
                      25%
                    </div>
                    <div className="h-[83.89%] w-[7.63%] top-[10.43%] left-[46.34%] tracking-[0.5px] leading-[16px] font-medium inline-block">
                      50%
                    </div>
                    <div className="h-[83.89%] w-[7.31%] top-[10.43%] left-[71.03%] tracking-[0.5px] leading-[16px] font-medium inline-block">
                      75%
                    </div>
                    <div className="h-full w-[10.16%] top-[0%] right-[9.86%] bottom-[0%] left-[79.98%] rounded-sm"></div>
                    <div className="h-[83.89%] w-[9.45%] top-[10.43%] left-[90.55%] tracking-[0.5px] leading-[16px] font-medium text-right inline-block">
                      100%
                    </div>
                    <div className="h-[83.89%] w-[30.79%] top-[136.49%] left-[0%] tracking-[0.5px] leading-[16px] font-medium text-colors-error-60 text-left hidden">
                      Message of error!
                    </div>
                  </div>
                  <div className="h-[20.62%] w-full top-[0%] right-[0%] bottom-[79.38%] left-[0%]">
                    <img
                      className="w-[97.57%] top-[55%] right-[1.21%] left-[1.23%] max-w-full overflow-hidden h-0"
                      alt=""
                      src="/public/group-493.svg"
                    />

                    <div className="top-[0px] left-[0px] w-[506px] flex flex-row items-center justify-between">
                      <div className="w-2 relative rounded-[50%] bg-colors-primary-50 h-2"></div>
                      <div className="w-2 relative rounded-[50%] bg-colors-primary-50 h-2"></div>
                      <div className="w-3.5 relative rounded-[50%] bg-colors-primary-20 box-border h-3.5 border-[3px] border-solid border-colors-primary-50"></div>
                      <div className="w-2 relative rounded-[50%] bg-colors-tertiary-100 h-2"></div>
                      <div className="w-2 relative rounded-[50%] bg-colors-tertiary-100 h-2"></div>
                    </div>
                  </div>
                </div>
                <div className="top-[0px] left-[180px] w-[328px] h-[53.2px] text-right text-base">
                  <div className="top-[0px] left-[0px] rounded bg-colors-tertiary-10 w-[328px] h-[53.2px] overflow-hidden flex flex-row items-center justify-end p-3 box-border">
                    <div className="relative tracking-[0.15px] leading-[24px] font-medium opacity-[0.8]">
                      0.00 DEXTR
                    </div>
                  </div>
                  <div className="h-[33.27%] w-[30.79%] top-[185.34%] left-[0%] text-2xs tracking-[0.5px] leading-[16px] font-medium text-colors-error-60 text-left hidden">
                    Message of error!
                  </div>
                </div>
                <div className="top-[11.1px] left-[0px] text-3xl leading-[28px] text-colors-tertiary-50 text-left inline-block w-[149px] h-[31px]">
                  Claim amount:
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
