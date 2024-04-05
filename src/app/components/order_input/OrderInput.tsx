// import { useEffect } from "react";

// import { useAppDispatch, useAppSelector, useTranslations } from "hooks";
// import {
//   OrderTab,
//   selectTargetToken,
//   submitOrder,
//   validatePriceInput,
//   validateSlippageInput,
// } from "state/orderInputSlice";
// import { fetchBalances } from "state/pairSelectorSlice";
// import { LimitOrderInput } from "./LimitOrderInput";
// import { MarketOrderInput } from "./MarketOrderInput";
// import { OrderSideTabs } from "./OrderSideTabs";
// import { OrderTypeTabs } from "./OrderTypeTabs";
// import { DexterToast } from "components/DexterToaster";

// function SubmitButton() {
//   const symbol = useAppSelector(selectTargetToken).symbol;
//   const tartgetToken = useAppSelector(selectTargetToken);
//   const t = useTranslations();

//   const {
//     tab,
//     side,
//     validationToken1,
//     validationToken2,
//     transactionInProgress,
//     transactionResult,
//   } = useAppSelector((state) => state.orderInput);

//   const dispatch = useAppDispatch();
//   const submitString = t("market_action_token")
//     .replace("<$ORDER_TYPE>", t(tab.toString()))
//     .replace("<$SIDE>", t(side.toString()))
//     .replace("<$TOKEN_SYMBOL>", symbol);

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
//         className="flex-1 btn btn-accent uppercase"
//         disabled={!isValidTransaction || transactionInProgress}
//         onClick={async (e) => {
//           e.stopPropagation();
//           DexterToast.promise(
//             // Function input, with following state-to-toast mapping
//             // -> pending: loading toast
//             // -> rejceted: error toast
//             // -> resolved: success toast
//             async () => {
//               const action = await dispatch(submitOrder());
//               if (!action.type.endsWith("fulfilled")) {
//                 // Transaction was not fulfilled (e.g. userRejected or userCanceled)
//                 throw new Error("Transaction failed due to user action.");
//               } else if ((action.payload as any)?.status === "ERROR") {
//                 // Transaction was fulfilled but failed (e.g. submitted onchain failure)
//                 throw new Error("Transaction failed onledger");
//               }
//             },
//             t("submitting_order"), // Loading message
//             t("order_submitted"), // success message
//             t("failed_to_submit_order") // error message
//           );
//         }}
//       >
//         {transactionInProgress ? t("transaction_in_progress") : submitString}
//       </button>
//       <div className="text-sm">{transactionResult}</div>
//     </div>
//   );
// }

// export function OrderInput() {
//   const dispatch = useAppDispatch();
//   const t = useTranslations();

//   const pairAddress = useAppSelector((state) => state.pairSelector.address);
//   const { tab, quote, description } = useAppSelector(
//     (state) => state.orderInput
//   );

//   useEffect(() => {
//     dispatch(fetchBalances());
//   }, [dispatch, pairAddress]);

//   return (
//     <div className="h-full flex flex-col text-base">
//       <OrderTypeTabs />
//       {tab === OrderTab.LIMIT && <OrderSideTabs />}
//       <div className="form-control justify-start flex-grow items-start bg-neutral p-4 w-full">
//         {tab === OrderTab.MARKET ? <MarketOrderInput /> : <LimitOrderInput />}
//         <SubmitButton />
//         <div className="collapse collapse-arrow text-left">
//           <input type="checkbox" />
//           <div className="collapse-title font-medium text-sm pl-0">
//             {t("total_fee")}: {quote?.totalFees ?? 0} {quote?.toToken?.symbol}
//           </div>
//           <div className="collapse-content text-sm pl-0">
//             <div className="flex items-center justify-between">
//               <div>{t("exchange_fee")}: </div>
//               <div>
//                 {quote?.exchangeFees} {quote?.toToken?.symbol}
//               </div>
//             </div>
//             <div className="flex items-center justify-between">
//               <div>{t("platform_fee")}: </div>
//               <div>
//                 {quote?.platformFees} {quote?.toToken?.symbol}
//               </div>
//             </div>
//             <div className="flex items-center justify-between">
//               <div>{t("liquidity_fee")}: </div>
//               <div>
//                 {quote?.liquidityFees} {quote?.toToken?.symbol}
//               </div>
//             </div>
//             <div>
//               <div>{description}</div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
