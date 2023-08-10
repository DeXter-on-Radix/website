import { useContext, useState, useEffect } from "react";
import * as adex from "alphadex-sdk-js";
import { AdexStateContext } from "./contexts";
import { RenderTable } from "./RenderTable";
import { SdkResult } from "alphadex-sdk-js/lib/models/sdk-result";

// const account =
//   "account_tdx_d_12yxeee5x6juamexwd6xg96gcrzmz29286cywpq38zzz5yemmrem9fx";
// const pairaddress =
//   "component_tdx_d_1cq95v9u4s43jz9eufd2pj5jqntv69sjl62ac9tgmjhpdyxqksrkrsq";

// export function AccountHistory() {
//   const getHistory = async (account: string, pairaddress: string) => {
//     const apiResponse = await adex.getAccountOrders(account, pairaddress, 0);
//     console.log(apiResponse);
//   };
//   getHistory(account, pairaddress);
//   return <div>SOME TEST</div>;
// }
interface AccountHistoryProps {
  account: string;
}

export function AccountHistory({ account }: AccountHistoryProps) {
  const adexState = useContext(AdexStateContext);
  const [response, setResponse] = useState<SdkResult | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const currentPairAddress = adexState.currentPairInfo?.address;

  //   const getHistory = async (pairaddress: string) => {
  //     if (!account) return; // Don't execute if no account
  //     const apiResponse = await adex.getAccountOrders(account, pairaddress, 0);
  //     setResponse(apiResponse);
  //     //TEMP CONSOLE LOG
  //     console.log(apiResponse);
  //   };

  useEffect(() => {
    const getHistory = async (pairaddress: string) => {
      if (!account) return; // Don't execute if no account
      const apiResponse = await adex.getAccountOrders(account, pairaddress, 0);
      setResponse(apiResponse);
      // TEMP CONSOLE LOG
      console.log(apiResponse);
    };

    if (currentPairAddress && account) {
      getHistory(currentPairAddress);
      setSelectedTable("OpenOrders");
    }
  }, [currentPairAddress, account]);

  const handleButtonClick = (selectedTable: string) => {
    setSelectedTable(selectedTable);
  };

  return (
    <div>
      <div>
        <button
          onClick={() => handleButtonClick("OpenOrders")}
          className={`btn btn-ghost normal-case text-xl ${
            selectedTable === "OpenOrders" ? "bg-yellow-600 text-white" : ""
          }`}
        >
          Open Orders
        </button>
        <button
          onClick={() => handleButtonClick("OrderHistory")}
          className={`btn btn-ghost normal-case text-xl ${
            selectedTable === "OrderHistory" ? "bg-yellow-600 text-white" : ""
          }`}
        >
          Order History
        </button>
        <button
          onClick={() => handleButtonClick("TradeHistory")}
          className={`btn btn-ghost normal-case text-xl ${
            selectedTable === "TradeHistory" ? "bg-yellow-600 text-white" : ""
          }`}
        >
          Trade History
        </button>
        <button className="btn btn-ghost normal-case text-xl">
          Show all orders
        </button>
        <button className="btn btn-ghost normal-case text-xl">
          export as CSV
        </button>
      </div>
      <RenderTable response={response} selectedTable={selectedTable} />
    </div>
  );
}
