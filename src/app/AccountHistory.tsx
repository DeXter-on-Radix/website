import { useContext, useState, useEffect, useCallback } from "react";
import * as adex from "alphadex-sdk-js";
import { AdexStateContext } from "./contexts";
import { DisplayTable } from "./DisplayTable";
import { SdkResult } from "alphadex-sdk-js/lib/models/sdk-result";

const TABLES = {
  OPEN_ORDERS: "OpenOrders",
  ORDER_HISTORY: "OrderHistory",
  TRADE_HISTORY: "TradeHistory",
};

interface AccountHistoryProps {
  account: string;
}

export function AccountHistory({ account }: AccountHistoryProps) {
  const { currentPairInfo } = useContext(AdexStateContext);
  const [orderReceiptData, setOrderReceiptData] = useState<SdkResult | null>(
    null
  );
  const [selectedTable, setSelectedTable] = useState<string>(
    TABLES.OPEN_ORDERS
  );
  const currentPairAddress = currentPairInfo?.address;

  useEffect(() => {
    const fetchHistoryAndSetState = async (pairaddress: string) => {
      if (!account) return;

      try {
        const apiResponse = await adex.getAccountOrders(
          account,
          pairaddress,
          0
        );
        console.log(apiResponse); //TEMP ADD =================================
        setOrderReceiptData(apiResponse);
      } catch (error) {
        console.error("Error fetching account orders:", error);
      }
    };

    if (currentPairAddress && account) {
      fetchHistoryAndSetState(currentPairAddress);
    }
  }, [currentPairAddress, account]);

  const handleButtonClick = useCallback((selectedTable: string) => {
    setSelectedTable(selectedTable);
  }, []);

  const Button = ({ label, value }: { label: string; value: string }) => (
    <button
      onClick={() => handleButtonClick(value)}
      //Tempory styling for visualization
      className={`btn btn-ghost normal-case text-xl ${
        selectedTable === value ? "bg-yellow-600 text-white" : ""
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div>
        <Button label="Open Orders" value={TABLES.OPEN_ORDERS} />
        <Button label="Order History" value={TABLES.ORDER_HISTORY} />
        <Button label="Trade History" value={TABLES.TRADE_HISTORY} />
        <button className="btn btn-ghost normal-case text-xl">
          Show all orders
        </button>
        <button className="btn btn-ghost normal-case text-xl">
          Export as CSV
        </button>
      </div>
      <DisplayTable
        orderReceiptData={orderReceiptData}
        selectedTable={selectedTable}
      />
    </div>
  );
}
