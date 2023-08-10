import { SdkResult } from "alphadex-sdk-js/lib/models/sdk-result";
import { useContext } from "react";
import { AdexStateContext } from "./contexts";

interface RenderTableProps {
  response: SdkResult | null;
  selectedTable: string | null;
}

//TODO Cancel Order Function
//TODO Show all orders function to merge all json data
//TODO need to refactor pair name if AccountHistory can show name
//otherwise refactor to put function call outside

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

export function RenderTable({ response, selectedTable }: RenderTableProps) {
  //pair info
  const adexState = useContext(AdexStateContext);
  const pairlist = adexState.pairsList;
  let orders = response ? response.data.orders : [];

  //logic to handle different table filters
  if (selectedTable === "OpenOrders") {
    orders = orders.filter((order: any) => order.status === "PENDING");
  } else if (selectedTable === "TradeHistory") {
    orders = orders.filter((order: any) => order.status === "COMPLETED");
  }

  // console.log(pairlist);
  // TODO consider adding check if pair exists just incase pair is delisted

  //Logic block for Open Orders
  return (
    <div>
      {selectedTable === "OpenOrders" ? (
        <table>
          <thead>
            <tr>
              <th>Pair</th>
              <th>ID</th>
              <th>Order Type</th>
              <th>Direction</th>
              <th>Order Qty</th>
              <th>Order Price</th>
              <th>Completed %</th>
              <th>Unclaimed Token Amount</th>
              <th>Time Submitted</th>
              <th>Time Completed</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order: any) => (
              <tr key={order.id}>
                <td>{order.pairName}</td> <td>{order.id}</td>
                <td>{order.orderType}</td>
                <td>{order.side}</td>
                <td>{order.amount}</td>
                <td>{order.price}</td>
                <td>{order.completedPerc}</td>
                <td>{order.unclaimedTokenAmount}</td>
                <td>{formatDate(order.timeSubmitted)}</td>
                <td>{formatDate(order.timeCompleted)}</td>
                <td>
                  <button>Cancel Order</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : selectedTable === "OrderHistory" ? (
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
            </tr>
          </thead>
          <tbody>
            {orders.map((order: any) => (
              <tr key={order.id}>
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
              </tr>
            ))}
          </tbody>
        </table>
      ) : selectedTable === "TradeHistory" ? (
        <table>
          <thead>
            <tr>
              <th>Pair</th>
              <th>ID</th>
              <th>Order Type</th>
              <th>Direction</th>
              <th>Order Qty</th>
              <th>Price</th>
              <th>Status</th>
              <th>Completed %</th>
              <th>Unclaimed Token Amount</th>
              <th>Time Submitted</th>
              <th>Time Completed</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order: any) => (
              <tr key={order.id}>
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
