import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector, useTranslations } from "hooks";
import {
  Tables,
  fetchAccountHistory,
  selectOpenOrders,
  setSelectedTable,
} from "state/accountHistorySlice";
import { DisplayTable } from "./DisplayTable";

function OrdersTabs() {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { selectedTable, tables } = useAppSelector(
    (state) => state.accountHistory
  );
  const openOrders = useAppSelector(selectOpenOrders);

  function tabClass(isActive: boolean) {
    return (
      "tab w-max no-underline h-full py-3 tab-border-1 font-bold text-sm uppercase leading-4" +
      (isActive
        ? " tab-active tab-bordered text-accent-focus !border-accent"
        : "")
    );
  }

  return (
    <div className="m-4">
      <div className="flex space-x-4">
        {tables.map((tableName) => (
          <div
            key={tableName}
            className={tabClass(selectedTable === tableName)}
            onClick={() => dispatch(setSelectedTable(tableName))}
          >
            {t(tableName)}{" "}
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
      <div className="">
        <DisplayTable />
      </div>
    </div>
  );
}
