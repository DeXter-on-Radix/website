"use client";
// import { TokenInfo } from "./state/pairSelectorSlice";
// import { useAppDispatch, useAppSelector } from "hooks";
import { useState } from "react";

interface StakeSideTabProps {
  stakeSide: StakeSide;
  //DEXTR or XRD;
}
export enum StakeSide {
  DEXTR = "DEXTR STAKING",
  XRD = "XRD STAKING",
}
interface StakeTypeTabProps {
  stakeType: StakeType;
  //Stake or Unstake
}

export enum StakeType {
  STAKE = "STAKE",
  UNSTAKE = "UNSTAKE",
}

export default function Stake() {
  return (
    <div className="bg-dexter-grey-dark">
      <div className="max-w-screen-md mx-auto py-12">
        <div className="flex flex-row mb-8 justify-between">
          <div className="flex flex-col my-auto">
            <h1
              className="!m-0 !mb-8 text-5xl text-md bg-gradient-to-r
      from-dexter-gradient-blue to-dexter-gradient-green to-45% bg-clip-text
      text-transparent font-normal text-left justify-left"
            >
              Stake
            </h1>
            <p className="text-sm flex-wrap">
              Delegate your XRD to our Validator to earn
              <span className="block"></span>DEXTR Stake DEXTR tokens to earn
              trading fees.
            </p>
          </div>
          <img
            src="/landing/sections/staking-safe.png"
            alt="staking safe"
            className="w-[300px] h-[300px] transform"
            style={{ transform: "scaleX(-1)" }}
          />
        </div>
        <div className="h-full w-full flex flex-col text-base">
          <div className="bg-dexter-grey-dark">
            <StakeSideTabs />
            <div className="border-[1px] border-dexter-grey-light">
              <div className="flex flex-row justify-between px-16 mt-10">
                <div className="flex flex-col">
                  <p className="text-xxs text-[#768089]">APY</p>
                  <p className="text-lg">99.99%</p>
                </div>
                <div className="flex flex-col">
                  <p className="text-xxs text-[#768089]">
                    Total value locked(XRD)
                  </p>
                  <p className="text-lg">999,999,999.99</p>
                </div>
                <div className="flex flex-col">
                  <p className="text-xxs text-[#768089]">Your position(XRD)</p>
                  <p className="text-lg">999,999,999.99</p>
                </div>
              </div>
              <div className="h-[570px]  bg-dexter-grey-light mx-8 my-8">
                <StakeTypeTabs />
                {/* <UserInputContainer /> */}
                {/* <SubmitButton /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StakeSideTabs() {
  const [currentSide, setCurrentSide] = useState(StakeSide.DEXTR);

  return (
    <div className="w-full">
      <div className="flex flex-row border-[1px] border-dexter-grey-light rounded-sm">
        {[StakeSide.DEXTR, StakeSide.XRD].map((stakeSide, indx) => {
          const isActive = stakeSide === currentSide;
          return (
            <div
              key={indx}
              className={`text-base py-3 w-[500px] flex justify-center mx-auto ${
                isActive
                  ? "text-base-content bg-dexter-grey-light"
                  : "text-dexter-grey-inactive"
              } cursor-pointer`}
              onClick={() => setCurrentSide(stakeSide)}
            >
              <StakeSideTab stakeSide={stakeSide} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StakeSideTab({ stakeSide }: StakeSideTabProps): JSX.Element | null {
  // const dispatch = useAppDispatch();
  // const pairAddress = useAppSelector((state) => state.pairSelector.address);
  // const { walletData } = useAppSelector((state) => state.radix);
  // const { type, side, token1, token2, price, specifiedToken } = useAppSelector(
  //   (state) => state.orderInput
  // );

  return (
    <div
      className="flex justify-center items-center cursor-pointer uppercase font-light"
      onClick={() => {
        // dispatch(orderInputSlice.actions.resetUserInput());
        // dispatch(orderInputSlice.actions.setSide(orderSide));
      }}
    >
      <p className="text-xl tracking-[.1px] select-none uppercase">
        {stakeSide}
      </p>
    </div>
  );
}

function StakeTypeTabs() {
  const [currentType, setCurrentType] = useState(StakeType.STAKE);

  return (
    <>
      <div className="flex flex-row justify-evenly">
        {[StakeType.STAKE, StakeType.UNSTAKE].map((stakeType, indx) => {
          const isActive = stakeType === currentType;
          return (
            <div
              key={indx}
              className={`text-base py-3 w-[500px] flex justify-center mx-auto ${
                isActive
                  ? "text-base-content"
                  : "text-dexter-grey-inactive bg-[#17181a]"
              } cursor-pointer`}
              onClick={() => setCurrentType(stakeType)}
            >
              <StakeTypeTab stakeType={stakeType} />
            </div>
          );
        })}
      </div>
    </>
  );
}

function StakeTypeTab({ stakeType }: StakeTypeTabProps): JSX.Element | null {
  // const type = useAppSelector((state) => state.orderInput.type);
  // const dispatch = useAppDispatch();

  return (
    <div
      className="w-[50%] cursor-pointer hover:opacity-100 flex justify-center items-center"
      // onClick={() => {
      //   dispatch(orderInputSlice.actions.setType(orderType));
      // }}
    >
      <p className="uppercase font-bold text-sm tracking-[.1px] select-none">
        {stakeType}
      </p>
    </div>
  );
}

// export function displayStakeSide(side: string): {
//   text: string;
// } {
//   if (side === "DEXTR STAKING") {
//     return { text: "stake DEXTR" };
//   } else if (side === "XRD STAKING") {
//     return { text: "stake XRD" };
//   } else {
//     return { text: "-" };
//   }
// }

//TODO: CurrencyInputGroupConfig
// interface CurrencyInputGroupConfig {
//   label: string;
//   currency: string;
//   value: number;
//   updateValue: (value: number) => void;
//   inputValidation: ValidationResult;
//   secondaryLabelProps: SecondaryLabelProps;
// }
