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
      "tab w-max no-underline h-full py-3 tab-border-1 uppercase" +
      (isActive ? " tab-active tab-bordered" : "")
    );
  }

  return (
    <div className="border-b-2 border-base-300">
      <div className="tabs min-w-[30%]">
        {tables.map((tableName) => (
          <div
            key={tableName}
            className={tabClass(selectedTable === tableName)}
            onClick={() => dispatch(setSelectedTable(tableName))}
          >
            {tableName}{" "}
            {tableName === Tables.OPEN_ORDERS && openOrders.length ? (
              <span className="badge badge-xs font-bold badge-accent ml-2 p-0.5 rounded-none">
                {openOrders.length}
              </span>
            ) : null}
          </div>
        ))}
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
      <div className="px-4">
        <DisplayTable />
      </div>
    </div>
  );
}
