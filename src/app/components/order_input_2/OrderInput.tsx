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

export function OrderInput() {
  const dispatch = useAppDispatch();

  const pairAddress = useAppSelector((state) => state.pairSelector.address);

  useEffect(() => {
    dispatch(fetchBalances());
  }, [dispatch, pairAddress]);

  return (
    <div className="h-full flex flex-col text-base">
      <OrderSideTabs />
      <div className="bg-red-600 h-full flex justify-center">
        <div className="bg-slate-600 h-full w-full p-6"></div>
      </div>
    </div>
  );
}

function OrderSideTabs() {
  // Temporary states
  const [side, setSide] = useState("BUY");

  return (
    <>
      <div className="h-14 flex">
        <div
          className={`w-1/2 flex justify-center items-center cursor-pointer ${
            side === "BUY" ? "bg-dexter-green text-content-dark" : ""
          }`}
          onClick={() => setSide("BUY")}
        >
          <p className="font-bold tracking-[.1px]">BUY</p>
        </div>
        <div
          className={`w-1/2 flex justify-center items-center cursor-pointer ${
            side === "SELL" ? "bg-flashy-red-2 text-white" : ""
          }`}
          onClick={() => setSide("SELL")}
        >
          <p className="font-bold tracking-[.1px]">SELL</p>
        </div>
      </div>
    </>
  );
}
