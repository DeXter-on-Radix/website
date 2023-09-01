import React, { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchAccountHistory,
  Tables,
  setSelectedTable,
  selectTables,
} from "../redux/accountHistorySlice";
import { DisplayTable } from "./DisplayTable";

interface ButtonProps {
  label: string;
  value: Tables;
  selectedValue: Tables;
  onClick: (value: Tables) => void;
}

const Button: React.FC<ButtonProps> = ({
  label,
  value,
  selectedValue,
  onClick,
}) => (
  <button
    onClick={() => onClick(value)}
    aria-label={label}
    className={"btn" + (selectedValue === value ? " btn-active" : "")}
  >
    {label}
  </button>
);

export function AccountHistory() {
  const dispatch = useAppDispatch();
  const account = useAppSelector(
    (state) => state.radix?.walletData.accounts[0]?.address
  );
  const pairAddress = useAppSelector((state) => state.pairSelector.address);
  const selectedTable = useAppSelector(
    (state) => state.accountHistory.selectedTable
  );
  const tables = useAppSelector(selectTables);

  useEffect(() => {
    dispatch(fetchAccountHistory());
  }, [dispatch, account, pairAddress]);

  const handleButtonClick = useCallback(
    (table: Tables) => {
      dispatch(setSelectedTable(table));
    },
    [dispatch]
  );

  return (
    <div>
      <div className="btn-group">
        {tables.map((table) => (
          <Button
            key={table}
            label={table}
            value={table}
            selectedValue={selectedTable}
            onClick={handleButtonClick}
          />
        ))}
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
      </div>
      <DisplayTable />
    </div>
  );
}
