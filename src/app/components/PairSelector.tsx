import { OrderTab, orderInputSlice } from "redux/orderInputSlice";
import { useAppSelector, useAppDispatch } from "../hooks";
import { selectPairAddress } from "../redux/pairSelectorSlice";

function OrderTypeTabs() {
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

export function PairSelector() {
  const pairSelector = useAppSelector((state) => state.pairSelector);
  const dispatch = useAppDispatch();
  const selectPair = (pairAddress: string) => {
    dispatch(selectPairAddress(pairAddress));
  };
  return (
    <>
      <div className="dropdown" id="pair-selector">
        <label tabIndex={0} className="btn m-1">
          {pairSelector.name}
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
        >
          {pairSelector.pairsList.map((pair, index) => (
            <li key={index}>
              <button onClick={() => selectPair(pair.address)}>
                {pair.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <OrderTypeTabs />
    </>
  );
}
