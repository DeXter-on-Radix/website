import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "hooks";
import {
  Tables,
  fetchAccountHistory,
  selectOpenOrders,
  setSelectedTable,
} from "redux/accountHistorySlice";
import { DisplayTable } from "./DisplayTable";

function OrdersTabs() {
  const dispatch = useAppDispatch();
  const { selectedTable, tables } = useAppSelector(
    (state) => state.accountHistory
  );
  const openOrders = useAppSelector(selectOpenOrders);

  function tabClass(isActive: boolean) {
    return (
      "flex-1 tab no-underline h-full text-base font-bold py-3 tab-border-1" +
      (isActive ? " tab-active tab-bordered" : "")
    );
  }

  return (
    <div className="border-b-2 border-base-300">
      <div className="tabs w-[30%] ">
        {tables.map((tableName) => (
          <div
            key={tableName}
            className={tabClass(selectedTable === tableName)}
            onClick={() => dispatch(setSelectedTable(tableName))}
          >
            {tableName}{" "}
            {tableName === Tables.OPEN_ORDERS && openOrders.length ? (
              <span className="badge badge-accent badge-sm ml-2">
                {openOrders.length}
              </span>
            ) : null}
          </div>
        ))}
        {/* <div
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
      </div> */}
      </div>
    </div>
  );
}

export function AccountHistory() {
  const dispatch = useAppDispatch();
  const account = useAppSelector(
    (state) => state.radix?.walletData.accounts[0]?.address
  );
  const pairAddress = useAppSelector((state) => state.pairSelector.address);

  useEffect(() => {
    dispatch(fetchAccountHistory());
  }, [dispatch, account, pairAddress]);

  return (
    <div>
      <OrdersTabs />
      {/* //---COMMENTED OUT BUTTONS FOR SHOW ALL ORDERS AND EXPORT
        //TO NOT CONFUSE THE TESTERS----------------------------- */}
      {/* <button
        <button
          className="btn btn-ghost normal-case text-xl"
          aria-label="Show all orders"
        >
          Show all orders
        </button>
        
          className="btn btn-ghost normal-case text-xl"
          aria-label="Export as CSV"
        >
          Export as CSV
        </button> */}
      {/* </div> */}
      <div className="px-4">
        <DisplayTable />
      </div>
    </div>
  );
}
