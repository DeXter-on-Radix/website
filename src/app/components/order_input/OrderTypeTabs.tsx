// import { useAppDispatch, useAppSelector, useTranslations } from "hooks";
// import { OrderTab, orderInputSlice } from "state/orderInputSlice";

// export function OrderTypeTabs() {
//   const t = useTranslations();
//   const activeTab = useAppSelector((state) => state.orderInput.tab);
//   const actions = orderInputSlice.actions;
//   const dispatch = useAppDispatch();

//   function tabClass(isActive: boolean) {
//     return (
//       "flex-1 tab no-underline h-full py-3 mx-8 text-sm font-medium uppercase" +
//       (isActive ? " tab-active tab-bordered !border-accent text-accent" : "")
//     );
//   }
//   return (
//     <div className="tabs uppercase">
//       <div
//         className={tabClass(activeTab === OrderTab.MARKET)}
//         onClick={() => dispatch(actions.setActiveTab(OrderTab.MARKET))}
//       >
//         {t("market")}
//       </div>
//       <div
//         className={tabClass(activeTab === OrderTab.LIMIT)}
//         onClick={() => dispatch(actions.setActiveTab(OrderTab.LIMIT))}
//       >
//         {t("limit")}
//       </div>
//     </div>
//   );
// }
