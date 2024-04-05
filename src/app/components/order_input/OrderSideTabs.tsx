// import { useAppDispatch, useAppSelector } from "hooks";
// import { OrderSide, orderInputSlice } from "state/orderInputSlice";
// import { useTranslations } from "hooks";

// export function OrderSideTabs() {
//   const dispatch = useAppDispatch();
//   const t = useTranslations();

//   function tabClass(isActive: boolean) {
//     return (
//       "flex-1 font-semibold py-3" +
//       (isActive ? " text-primary-content bg-neutral" : "")
//     );
//   }
//   return (
//     <div className="flex flex-nowrap">
//       <button
//         className={
//           tabClass(
//             useAppSelector((state) => state.orderInput.side) === OrderSide.BUY
//           ) + " uppercase"
//         }
//         onClick={() => {
//           dispatch(orderInputSlice.actions.setSide(OrderSide.BUY));
//         }}
//       >
//         {t("buy")}
//       </button>
//       <button
//         className={
//           tabClass(
//             useAppSelector((state) => state.orderInput.side) === OrderSide.SELL
//           ) + " uppercase"
//         }
//         onClick={() => {
//           dispatch(orderInputSlice.actions.setSide(OrderSide.SELL));
//         }}
//       >
//         {t("sell")}
//       </button>
//     </div>
//   );
// }
