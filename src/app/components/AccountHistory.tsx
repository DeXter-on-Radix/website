import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchAccountHistory } from "../redux/accountHistorySlice";
import { DisplayTable } from "./DisplayTable";

const TABLES = {
  OPEN_ORDERS: "OpenOrders",
  ORDER_HISTORY: "OrderHistory",
  TRADE_HISTORY: "TradeHistory",
};

interface ButtonProps {
  label: string;
  value: string;
  selectedValue: string;
  onClick: (value: string) => void;
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
    className={`btn btn-ghost normal-case text-xl ${
      selectedValue === value ? "bg-yellow-600 text-white" : ""
    }`}
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

  const [selectedTable, setSelectedTable] = useState<string>(
    TABLES.OPEN_ORDERS
  );

  useEffect(() => {
    if (account && pairAddress) {
      dispatch(fetchAccountHistory()); // Assuming this action creator might take arguments like { account, pairAddress }
    }
  }, [dispatch, account, pairAddress]);

  const handleButtonClick = useCallback((selectedTable: string) => {
    setSelectedTable(selectedTable);
  }, []);

  const buttons = useMemo(
    () =>
      Object.entries(TABLES).map(([key, value]) => (
        <Button
          key={value}
          label={key.replace("_", " ")}
          value={value}
          selectedValue={selectedTable}
          onClick={handleButtonClick}
        />
      )),
    [selectedTable, handleButtonClick]
  );

  return (
    <div>
      <div>
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
