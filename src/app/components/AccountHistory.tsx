import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  fetchAccountHistory,
  Tables,
  setSelectedTable,
} from "../redux/accountHistorySlice";
import { DisplayTable } from "./DisplayTable";

interface ButtonProps {
  label: string;
  value: Tables; // Change from string to Tables
  selectedValue: Tables; // Change from string to Tables
  onClick: (value: Tables) => void; // Change from string to Tables
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
  ); // <-- Get selectedTable from Redux store

  useEffect(() => {
    if (account && pairAddress) {
      dispatch(fetchAccountHistory());
    }
  }, [dispatch, account, pairAddress]);

  const handleButtonClick = useCallback(
    (table: Tables) => {
      dispatch(setSelectedTable(table)); // <-- Dispatch the action to update the selectedTable
    },
    [dispatch]
  );

  const buttons = useMemo(
    () =>
      Object.keys(Tables).map((key) => {
        const value = Tables[key as keyof typeof Tables]; // Getting the value of the enum
        return (
          <Button
            key={value}
            label={value}
            value={value}
            selectedValue={selectedTable}
            onClick={handleButtonClick}
          />
        );
      }),
    [selectedTable, handleButtonClick]
  );
  return (
    <div>
      <div className="btn-group">
        {buttons}
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
      <DisplayTable selectedTable={selectedTable} />
    </div>
  );
}
