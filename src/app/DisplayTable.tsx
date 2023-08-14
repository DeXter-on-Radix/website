import { SdkResult } from "alphadex-sdk-js/lib/models/sdk-result";
import { displayTime, displayOrderSide, calculateTotalFees } from "./utils";
import { useCancelOrder } from "./CancelOrder";

//TODO:
//1. Add order_price when available from Adex
//2. Add trades field when available from Adex-OrderReceipt

interface DisplayTableProps {
  orderReceiptData: SdkResult | null;
  selectedTable: string | null;
  onCancelOrder?: (
    orderId: number,
    pairAddress: string,
    account: string
  ) => void;
  account: string;
}
//Refactor
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

function renderActionButton(
  order: any,
  onCancelOrder: (
    orderId: number,
    pairAddress: string,
    account: string
  ) => void,
  account: string
) {
  if (order.status === "PENDING") {
    return (
      // TODO: custom daisyui variable button style color
      <button
        onClick={() => onCancelOrder(order.id, order.pairAddress, account)}
        className="text-lime-400 px-4 py-2 rounded hover:bg-lime-400 hover:text-black transition"
      >
        Cancel
      </button>
    );
  }
  return "-";
}

// -----OPENORDERS TABLE-----
function OpenOrdersTable({
  data,
  onCancelOrder,
  account,
}: {
  data: any[];
  onCancelOrder: (
    orderId: number,
    pairAddress: string,
    account: string
  ) => void;
  account: string;
}) {
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
            <td>{renderActionButton(order, onCancelOrder, account)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
//-----ORDERHISTORY TABLE-----
function OrderHistoryTable({
  data,
  onCancelOrder,
  account,
}: {
  data: any[];
  onCancelOrder: (
    orderId: number,
    pairAddress: string,
    account: string
  ) => void;
  account: string;
}) {
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
            <td>
              {calculateTotalFees(order)} {order.unclaimedToken.symbol}
            </td>
            <td>{displayTime(order.timeSubmitted, "full")}</td>
            <td>{renderActionButton(order, onCancelOrder, account)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
//-----TRADEHISTORY TABLE-----
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
            <td>
              {calculateTotalFees(order)} {order.unclaimedToken.symbol}
            </td>
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
  account,
}: DisplayTableProps) {
  const data = getFilteredData(orderReceiptData, selectedTable);

  const cancelOrder = useCancelOrder();

  if (!selectedTable) return <div>Please connect wallet to show</div>;

  switch (selectedTable) {
    case "OpenOrders":
      return (
        <OpenOrdersTable
          data={data}
          onCancelOrder={cancelOrder}
          account={account}
        />
      );
    case "OrderHistory":
      return (
        <OrderHistoryTable
          data={data}
          onCancelOrder={cancelOrder}
          account={account}
        />
      );
    case "TradeHistory":
      return <TradeHistoryTable data={data} />;
    default:
      return null;
  }
}
