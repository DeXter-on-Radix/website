import { useAppDispatch, useAppSelector } from "hooks";
import { OrderTab, orderInputSlice } from "redux/orderInputSlice";

export function OrderTypeTabs() {
  const activeTab = useAppSelector((state) => state.orderInput.tab);
  const actions = orderInputSlice.actions;
  const dispatch = useAppDispatch();

  function tabClass(isActive: boolean) {
    return (
      "flex-1 tab no-underline h-full text-base font-semibold py-3 tab-border-2" +
      (isActive ? " tab-active tab-bordered" : "")
    );
  }
  return (
    <div className="tabs">
      <div
        className={tabClass(activeTab === OrderTab.MARKET)}
        onClick={() => dispatch(actions.setActiveTab(OrderTab.MARKET))}
      >
        Market
      </div>
      <div
        className={tabClass(activeTab === OrderTab.LIMIT)}
        onClick={() => dispatch(actions.setActiveTab(OrderTab.LIMIT))}
      >
        Limit
      </div>
    </div>
  );
}
