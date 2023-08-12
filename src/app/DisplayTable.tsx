import { SdkResult } from "alphadex-sdk-js/lib/models/sdk-result";
import { displayTime, displayOrderSide } from "./utils";

//TODO:
//1. Add datafield for executed price when available from Adex
//2. onClick Cancel Order function
//3. onClick Change pair when pair on the table is clicked
//4. Display "Connect Wallet to see History" if no wallet is connected
//5. Display "No Orders" if Wallet is connected but no History

interface DisplayTableProps {
  orderReceiptData: SdkResult | null;
  selectedTable: string | null;
}

function getFilteredData(
  orderReceiptData: SdkResult | null,
  selectedTable: string | null
): any[] {
  const data = orderReceiptData ? orderReceiptData.data.orders : [];

  switch (selectedTable) {
    case "OpenOrders":
      return filterOrdersByStatus(data, "PENDING");
    case "TradeHistory":
      return filterOrdersByStatus(data, "COMPLETED");
    default:
      return data;
  }
}

function filterOrdersByStatus(data: any[], status: string) {
  return data.filter((order) => order.status === status);
}

function renderActionButton(order: any) {
  if (order.status === "PENDING") {
    return (
      <button className="text-lime-400 px-4 py-2 rounded hover:bg-lime-400 hover:text-black transition">
        Cancel
      </button>
    );
  }
  return "-";
}

// OpenOrdersTable ====================================================================================
function OpenOrdersTable({ data }: { data: any[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Pair</th>
          <th>Order Type</th>
          <th>Direction</th>
          <th>Time Ordered</th>
          <th>Amount</th>
          <th>Order Price</th>
          <th>Filled Qty</th>
          <th>Completed %</th>
          {/* <th>Unclaimed Token Amount</th> */}
          {/* <th>Time Submitted</th> */}
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {data.map((order: any) => (
          <tr key={order.id}>
            <td>{order.pairName}</td>
            <td>{order.orderType}</td>
            <td className={displayOrderSide(order.side).className}>
              {displayOrderSide(order.side).text}
            </td>
            <td>{displayTime(order.timeSubmitted, "full")}</td>
            <td>
              {order.amount} {order.specifiedToken.symbol}
            </td>
            <td>PlaceHolder {order.specifiedToken.symbol}</td>
            <td>
              {order.amountFilled} {order.specifiedToken.symbol}
            </td>
            <td>{order.completedPerc}%</td>
            <td>{renderActionButton(order)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
//OrderHistory Table ====================================================================================
function OrderHistoryTable({ data }: { data: any[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Pair</th>
          <th>Order Type</th>
          <th>Direction</th>
          <th>Status</th>
          <th>Filled Qty</th>
          <th>Order Qty</th>
          <th>Avg Filled Price</th>
          <th>Order Price</th>
          <th>Order Fee</th>
          <th>Time Ordered</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {data.map((order: any) => (
          <tr key={order.id}>
            <td>{order.pairName}</td>
            <td>{order.orderType}</td>
            <td className={displayOrderSide(order.side).className}>
              {displayOrderSide(order.side).text}
            </td>
            <td>{order.status}</td>
            <td>
              {order.amountFilled} {order.specifiedToken.symbol}
            </td>
            <td>
              {order.amount} {order.specifiedToken.symbol}
            </td>
            <td>
              {order.price} {order.specifiedToken.symbol}
            </td>
            <td>PlaceHolder {order.specifiedToken.symbol}</td>
            <td>PlaceHolder SYMBOL</td>
            <td>{displayTime(order.timeSubmitted, "full")}</td>
            <td>{renderActionButton(order)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
//TradeHistory Table ====================================================================================
function TradeHistoryTable({ data }: { data: any[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Pair</th>
          <th>Direction</th>
          <th>Order Price</th>
          <th>Avg Filled Price</th>
          <th>Filled Qty</th>
          <th>Order Fee</th>
          <th>Time Completed</th>
        </tr>
      </thead>
      <tbody>
        {data.map((order: any) => (
          <tr key={order.id}>
            <td>{order.pairName}</td>
            <td className={displayOrderSide(order.side).className}>
              {displayOrderSide(order.side).text}
            </td>
            <td>PlaceHolder {order.specifiedToken.symbol}</td>

            <td>
              {order.price} {order.specifiedToken.symbol}
            </td>
            <td>
              {order.amountFilled} {order.specifiedToken.symbol}
            </td>
            <td>PlaceHolder SYMBOL</td>
            <td>{displayTime(order.timeCompleted, "full")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
export function DisplayTable({
  orderReceiptData,
  selectedTable,
}: DisplayTableProps) {
  const data = getFilteredData(orderReceiptData, selectedTable);

  if (!selectedTable) return <div>Please connect wallet to show</div>;

  switch (selectedTable) {
    case "OpenOrders":
      return <OpenOrdersTable data={data} />;
    case "OrderHistory":
      return <OrderHistoryTable data={data} />;
    case "TradeHistory":
      return <TradeHistoryTable data={data} />;
    default:
      return null;
  }
}
// export function DisplayTable({
//   orderReceiptData,
//   selectedTable,
// }: DisplayTableProps) {
//   const data = getFilteredData(orderReceiptData, selectedTable);

//   return (
//     <div>
//       {selectedTable ? (
//         <table>
//           <thead>
//             <tr>
//               <th>Pair</th>
//               <th>Order Type</th>
//               <th>Direction</th>
//               {selectedTable === "OpenOrders" && <th>Inserted Time</th>}
//               {selectedTable !== "TradeHistory" && <th>Order Qty</th>}
//               <th>Order Price</th>
//               {selectedTable === "OpenOrders" && <th>Status</th>}
//               {selectedTable !== "TradeHistory" && <th>Completed %</th>}
//               {selectedTable !== "TradeHistory" && (
//                 <th>Unclaimed Token Amount</th>
//               )}
//               <th>Time Submitted</th>
//               {selectedTable !== "OpenOrders" && <th>Time Completed</th>}
//               {selectedTable === "TradeHistory" && <th>Avg. Executed Price</th>}
//               <th>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {data.map((order: any) => (
//               <tr key={order.id}>
//                 <td>{order.pairName}</td>
//                 <td>{order.orderType}</td>
//                 <td className={displayOrderSide(order.side).className}>
//                   {displayOrderSide(order.side).text}
//                 </td>
//                 {selectedTable === "OpenOrders" && (
//                   <td>{displayTime(order.timeSubmitted, "full")}</td>
//                 )}
//                 {selectedTable !== "TradeHistory" && <td>{order.amount}</td>}
//                 <td>{order.price}</td>
//                 {selectedTable === "OpenOrders" && <td>{order.status}</td>}
//                 {selectedTable !== "TradeHistory" && (
//                   <td>{order.completedPerc}</td>
//                 )}
//                 {selectedTable !== "TradeHistory" && (
//                   <td>{order.unclaimedTokenAmount}</td>
//                 )}
//                 <td>{displayTime(order.timeSubmitted, "full")}</td>
//                 {selectedTable !== "OpenOrders" && (
//                   <td>{displayTime(order.timeCompleted, "full")}</td>
//                 )}
//                 {selectedTable === "TradeHistory" && (
//                   <td>{order.avgExecutedPrice || "-"}</td>
//                 )}
//                 <td>
//                   {selectedTable === "OpenOrders" &&
//                   order.status === "PENDING" ? (
//                     <button>Cancel Order</button>
//                   ) : (
//                     "-"
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       ) : (
//         <div>Please connect wallet to show</div>
//       )}
//     </div>
//   );
// }
