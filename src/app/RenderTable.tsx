import { SdkResult } from "alphadex-sdk-js/lib/models/sdk-result";
import { useContext } from "react";
import { AdexStateContext } from "./contexts";

//TODO:
//1. Add datafield for executed price when available from Adex
//2. onClick Cancel Order function
//3. onClick Change pair when pair on the table is clicked
//4. Display "Connect Wallet to see History" if no wallet is connected
//5. Display "No Orders" if Wallet is connected but no History

interface RenderTableProps {
  response: SdkResult | null;
  selectedTable: string | null;
}

function formatDate(date: string) {
  return new Date(date)
    .toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(/(\d+)\/(\d+)\/(\d+), (\d+:\d+:\d+)/, "$3-$1-$2 $4");
}

function filterOrdersByStatus(orders: any[], status: string) {
  return orders.filter((order) => order.status === status);
}

export function RenderTable({ response, selectedTable }: RenderTableProps) {
  const adexState = useContext(AdexStateContext);
  let orders = response ? response.data.orders : [];

  switch (selectedTable) {
    case "OpenOrders":
      orders = filterOrdersByStatus(orders, "PENDING");
      break;
    case "TradeHistory":
      orders = filterOrdersByStatus(orders, "COMPLETED");
      break;
    default:
      break;
  }

  return (
    <div>
      {selectedTable ? (
        <table>
          <thead>
            <tr>
              <th>Pair</th>
              <th>ID</th>
              <th>Order Type</th>
              <th>Direction</th>
              <th>Order Qty</th>
              <th>Order Price</th>
              <th>Status</th>
              <th>Completed %</th>
              <th>Unclaimed Token Amount</th>
              <th>Time Submitted</th>
              <th>Time Completed</th>
              {selectedTable === "OpenOrders" && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {orders.map((order: any) => (
              <tr key={order.id}>
                {/* TODO add onclick to change pair */}
                <td>{order.pairName}</td>
                <td>{order.id}</td>
                <td>{order.orderType}</td>
                <td>{order.side}</td>
                <td>{order.amount}</td>
                <td>{order.price}</td>
                <td>{order.status}</td>
                <td>{order.completedPerc}</td>
                <td>{order.unclaimedTokenAmount}</td>
                <td>{formatDate(order.timeSubmitted)}</td>
                <td>{formatDate(order.timeCompleted)}</td>
                {selectedTable === "OpenOrders" && (
                  <td>
                    {/* TODO add onclick */}
                    <button>Cancel Order</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>Please connect wallet to show</div>
      )}
    </div>
  );
}
