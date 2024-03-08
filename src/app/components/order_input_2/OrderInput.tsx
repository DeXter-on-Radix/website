import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "hooks";
// import {
//   selectTargetToken,
//   submitOrder,
//   validatePriceInput,
//   validateSlippageInput,
// } from "state/orderInputSlice";
import { fetchBalances } from "state/pairSelectorSlice";

import { OrderSide, OrderTab, orderInputSlice } from "state/orderInputSlice";

// function SubmitButton() {
//   const symbol = useAppSelector(selectTargetToken).symbol;
//   const tartgetToken = useAppSelector(selectTargetToken);

//   const {
//     tab,
//     side,
//     validationToken1,
//     validationToken2,
//     transactionInProgress,
//     transactionResult,
//   } = useAppSelector((state) => state.orderInput);

//   const dispatch = useAppDispatch();
//   const submitString = tab.toString() + " " + side.toString() + " " + symbol;

//   const isPriceValid = useAppSelector(validatePriceInput).valid;
//   const isSlippageValid = useAppSelector(validateSlippageInput).valid;
//   const isValidTransaction =
//     tartgetToken.amount !== "" &&
//     validationToken1.valid &&
//     validationToken2.valid &&
//     isPriceValid &&
//     isSlippageValid;

//   return (
//     <div className="flex flex-col w-full">
//       <button
//         className="flex-1 btn btn-accent"
//         disabled={!isValidTransaction || transactionInProgress}
//         onClick={() => dispatch(submitOrder())}
//       >
//         {transactionInProgress ? "Transaction in progress..." : submitString}
//       </button>
//       <div className="text-sm">{transactionResult}</div>
//     </div>
//   );
// }

interface OrderInputProps {
  label: string;
  currency?: string;
  secondaryLabel?: string;
  secondaryLabelValue?: number | string;
  available?: number;
  disabled?: boolean;
}

export function OrderInput() {
  const dispatch = useAppDispatch();

  const pairAddress = useAppSelector((state) => state.pairSelector.address);

  useEffect(() => {
    dispatch(fetchBalances());
  }, [dispatch, pairAddress]);

  return (
    <div className="h-full flex flex-col text-base max-w-[500px] m-auto">
      <OrderSideTabs />
      <div className="p-[24px]">
        <div>
          <OrderTypeTabs />
          <UserInputContainer />
          <p>Total: ~ 1'000'000 XRD</p>
          <SubmitButton />
        </div>
      </div>
    </div>
  );
}

function SubmitButton() {
  const side = useAppSelector((state) => state.orderInput.side);
  const type = useAppSelector((state) => state.orderInput.tab);

  return (
    <button
      className={`w-full font-bold text-base tracking-[.1px] p-3 ${
        side === "BUY"
          ? "bg-dexter-green  text-black "
          : "bg-dexter-red text-white "
      }`}
    >{`${type} ${side} DEXTR`}</button>
  );
}

function UserInputContainer() {
  const side = useAppSelector((state) => state.orderInput.side);
  const type = useAppSelector((state) => state.orderInput.tab);

  if (type === "MARKET") {
    return (
      <div className="bg-base-100 px-3 rounded-md">
        <OrderInputElement label={"Price"} disabled={true} /> {/*market price*/}
        <OrderInputElement
          label={side === "BUY" ? "Total" : "Quantity"}
          secondaryLabel={"Available"}
          secondaryLabelValue={side === "BUY" ? 2000 : 0}
          currency={side === "BUY" ? "XRD" : "DEXTR"}
        />
        <PercentageSlider />
      </div>
    );
  }
  if (type === "LIMIT") {
    return (
      <div className="bg-base-100 px-3 rounded-md">
        <OrderInputElement
          label={"Price"}
          currency={"XRD"}
          secondaryLabel={`Best ${side.toLowerCase()}`}
          secondaryLabelValue={side === "BUY" ? 2.35 : 2.24}
        />
        <OrderInputElement
          label={"Quantity"}
          currency={"DEXTR"}
          secondaryLabel={`${side === "BUY" ? "" : "Available"}`}
          secondaryLabelValue={`${side === "BUY" ? undefined : 100000}`}
        />
        <PercentageSlider />
        <OrderInputElement
          label={"Total"}
          currency={"XRD"}
          secondaryLabel={`${side === "SELL" ? "" : "Available"}`}
          secondaryLabelValue={`${side === "SELL" ? undefined : 100000}`}
        />
      </div>
    );
  }
  return <></>;
}

function OrderInputElement({
  label,
  currency,
  secondaryLabel,
  secondaryLabelValue,
  disabled = false,
}: OrderInputProps): JSX.Element | null {
  return (
    <>
      <div className="pt-3">
        {secondaryLabel ? (
          <div className="w-full flex content-between">
            <p className="text-xs font-medium text-left opacity-50 grow">
              {label}:
            </p>
            <p className="text-xs font-medium text-white underline">
              {secondaryLabel}: {secondaryLabelValue} {currency}
            </p>
          </div>
        ) : (
          <p className="text-xs font-medium text-left opacity-50">{label}:</p>
        )}
        <div className="min-h-[48px] w-full content-between bg-base-200 flex">
          <input
            className="grow text-right pr-2 bg-base-200 "
            disabled={disabled}
            type="number"
            placeholder={disabled ? undefined : 0}
          />
          <div className="shrink-0 bg-base-200 content-center items-center flex px-2">
            {currency}
          </div>
          {/* <input
            className="text-right grow"
            disabled={disabled}
            type="number"
            placeholder={disabled ? undefined : 0}
          /> */}
          {/* <input
            className="text-right absolute left-0 h-12 opacity-50"
            disabled={disabled}
            type="number"
            placeholder={disabled ? undefined : 0}
          />
          {currency && (
            <div className="shrink-0 absolute right-8 top-3 h-12 ">
              {currency}
            </div>
          )} */}
        </div>
      </div>
    </>
  );
}

function PercentageSlider() {
  return <></>;
}

function OrderTypeTabs() {
  const type = useAppSelector((state) => state.orderInput.tab);
  const dispatch = useAppDispatch();

  // TODO(dcts): make single component (DRYify code) and create 2 instances to reduce duplicate code
  return (
    <>
      <div className="min-h-[48px] flex justify-center">
        <div className="w-full">
          <div className="flex min-h-[48px]">
            <div
              className={`w-[50%] cursor-pointer hover:opacity-100 flex justify-center items-center ${
                type === "MARKET"
                  ? " bg-base-100 text-dexter-green"
                  : " bg-base-200 opacity-50"
              }`}
              onClick={() => {
                dispatch(
                  orderInputSlice.actions.setActiveTab(OrderTab["MARKET"])
                );
              }}
            >
              <p className="uppercase font-bold text-base tracking-[.1px] select-none">
                Market
              </p>
            </div>
            <div
              className={`w-[50%] cursor-pointer hover:opacity-100 flex justify-center items-center ${
                type === "LIMIT"
                  ? " bg-base-100 text-dexter-green"
                  : " bg-base-200 opacity-50"
              }`}
              onClick={() => {
                dispatch(
                  orderInputSlice.actions.setActiveTab(OrderTab["LIMIT"])
                );
              }}
            >
              <p className="uppercase font-bold text-base tracking-[.1px] select-none">
                Limit
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function OrderSideTabs() {
  const side = useAppSelector((state) => state.orderInput.side);
  const dispatch = useAppDispatch();

  // TODO(dcts): make single component (DRYify code) and create 2 instances to reduce duplicate code
  return (
    <>
      <div className="min-h-[48px] flex">
        <div
          className={`w-1/2 flex justify-center items-center cursor-pointer hover:opacity-100 ${
            side === "BUY" ? "bg-dexter-green text-content-dark" : "opacity-50"
          }`}
          onClick={() => {
            dispatch(orderInputSlice.actions.setSide(OrderSide["BUY"]));
          }}
        >
          <p className="font-bold text-base tracking-[.1px] select-none">BUY</p>
        </div>
        <div
          className={`w-1/2 flex justify-center items-center cursor-pointer hover:opacity-100 ${
            side === "SELL" ? "bg-flashy-red-2 text-white" : "opacity-50"
          }`}
          onClick={() => {
            dispatch(orderInputSlice.actions.setSide(OrderSide["SELL"]));
          }}
        >
          <p className="font-bold text-base tracking-[.1px] select-none">
            SELL
          </p>
        </div>
      </div>
    </>
  );
}
