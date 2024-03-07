import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "hooks";
// import {
//   selectTargetToken,
//   submitOrder,
//   validatePriceInput,
//   validateSlippageInput,
// } from "state/orderInputSlice";
import { fetchBalances } from "state/pairSelectorSlice";

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

interface SubmitButtonProps {
  orderSide: string;
  orderType: string;
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
        <OrderTypeTabs />
        <UserInputContainer />
        <p>Total: ~ 1'000'000 XRD</p>
        <SubmitButton orderSide={"BUY"} orderType={"MARKET"} />
      </div>
    </div>
  );
}

function SubmitButton({ orderSide, orderType }: SubmitButtonProps) {
  return (
    <button
      className={`w-full font-bold text-base tracking-[.1px] p-3${
        orderSide === "BUY"
          ? " bg-dexter-green  text-black"
          : " bg-dexter-red text-white "
      }`}
    >{`${orderType} ${orderSide} DEXTR`}</button>
  );
}

function UserInputContainer() {
  return <></>;
}

function OrderTypeTabs() {
  const [orderType, setOrderType] = useState("MARKET");

  return (
    <>
      <div className="min-h-[48px] flex justify-center">
        <div className="w-full">
          <div className="flex min-h-[48px]">
            <div
              className={`w-[50%] cursor-pointer hover:opacity-100 flex justify-center items-center ${
                orderType === "MARKET"
                  ? " bg-base-100 text-dexter-green"
                  : " bg-base-200 opacity-50"
              }`}
              onClick={() => setOrderType("MARKET")}
            >
              <p className="uppercase font-bold text-base tracking-[.1px]">
                Market
              </p>
            </div>
            <div
              className={`w-[50%] cursor-pointer hover:opacity-100 flex justify-center items-center ${
                orderType === "LIMIT"
                  ? " bg-base-100 text-dexter-green"
                  : " bg-base-200 opacity-50"
              }`}
              onClick={() => setOrderType("LIMIT")}
            >
              <p className="uppercase font-bold text-base tracking-[.1px]">
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
  // Temporary states
  const [side, setSide] = useState("BUY");

  return (
    <>
      <div className="min-h-[48px] flex">
        <div
          className={`w-1/2 flex justify-center items-center cursor-pointer hover:opacity-100 ${
            side === "BUY" ? "bg-dexter-green text-content-dark" : "opacity-50"
          }`}
          onClick={() => setSide("BUY")}
        >
          <p className="font-bold text-base tracking-[.1px]">BUY</p>
        </div>
        <div
          className={`w-1/2 flex justify-center items-center cursor-pointer hover:opacity-100 ${
            side === "SELL" ? "bg-flashy-red-2 text-white" : "opacity-50"
          }`}
          onClick={() => setSide("SELL")}
        >
          <p className="font-bold text-base tracking-[.1px]">SELL</p>
        </div>
      </div>
    </>
  );
}
