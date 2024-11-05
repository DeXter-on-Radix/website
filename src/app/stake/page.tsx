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

export default function Stake() {
  return (
    <div className="bg-dexter-grey-dark">
      <div className="max-w-screen-md mx-auto py-28">
        <div className="flex flex-row">
          <div className="flex flex-col my-auto">
            <h1
              className="!m-0 !mb-8 text-5xl text-md bg-gradient-to-r
      from-dexter-gradient-blue to-dexter-gradient-green to-45% bg-clip-text
      text-transparent font-normal text-left justify-left"
            >
              Stake
            </h1>
            <p className="text-sm flex-wrap">
              Delegate your XRD to our Validator to earn DEXTR Stake DEXTR
              tokens to earn trading fees.
            </p>
          </div>
          <img
            src="/landing/sections/staking-safe.png"
            alt="staking safe"
            className="w-[300px] h-[300px] transform"
            style={{ transform: "scaleX(-1)" }}
          />
        </div>
        <div className="h-full flex flex-col text-base justify-center space-between">
          <StakeSideTabs />
          <div className="p-4 m-auto h-[570px] w-full">
            <StakeTypeTabs />
            {/* <UserInputContainer /> */}
            {/* <SubmitButton /> */}
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
      <div className="flex flex-row justify-evenly">
        {[StakeSide.DEXTR, StakeSide.XRD].map((stakeSide, indx) => {
          const isActive = stakeSide === currentSide;
          return (
            <div
              key={indx}
              className={`text-base py-3 px-[138px] bg-dexter-grey-light ${
                isActive ? "text-base-content" : "text-dexter-grey-inactive"
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
      className="flex justify-center items-center cursor-pointer uppercase font-light bg-dexter-grey-light"
      onClick={() => {
        // dispatch(orderInputSlice.actions.resetUserInput());
        // dispatch(orderInputSlice.actions.setSide(orderSide));
      }}
    >
      <p className="text-md tracking-[.1px] select-none uppercase">
        {stakeSide}
      </p>
    </div>
    // <div className="flex space-x-4 sm:space-x-5 pb-0 pt-2">
    //   {[[StakeSide.DEXTR], [StakeSide.XRD]].map(([stakeSide, side], indx) => {
    //     const isActive = side === currentSide;
    //     return (
    //       <span
    //         key={indx}
    //         className={`text-base pb-2 sm:pb-3 px-2 ${
    //           isActive
    //             ? "text-dexter-green-OG border-b border-[#cafc40]"
    //             : "text-[#768089]"
    //         } cursor-pointer`}
    //         onClick={() => setCurrentSide(side as StakeSide)}
    //       >
    //         {stakeSide}
    //       </span>
    //     );
    //   })}
    // </div>
  );
}

function StakeTypeTabs() {
  return (
    <>
      <div className="h-[40px] flex justify-center">
        <div className="w-full">
          <div className="flex h-[40px]">
            {[StakeType.STAKE, StakeType.UNSTAKE].map((type, indx) => (
              <StakeTypeTab stakeType={type} key={indx} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function StakeTypeTab({ stakeType }: StakeTypeTabProps): JSX.Element | null {
  // const type = useAppSelector((state) => state.orderInput.type);
  // const dispatch = useAppDispatch();

  return (
    <div
      className="w-[50%] cursor-pointer hover:opacity-100 flex justify-center items-center bg-dexter-grey-extralight"
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
