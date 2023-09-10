import React from "react";
import { useAppSelector, useAppDispatch } from "../hooks";
import { displayTime, displayOrderSide, calculateTotalFees } from "../utils";
import {
  cancelOrder,
  selectOpenOrders,
  selectTradeHistory,
  selectOrderHistory,
} from "../redux/accountHistorySlice";
import { AccountHistoryState, Tables } from "../redux/accountHistorySlice";
interface TableProps {
  data: AccountHistoryState["orderHistory"];
}

function ActionButton({
  order,
}: {
  order: AccountHistoryState["orderHistory"][0];
}) {
  const dispatch = useAppDispatch();

  if (order.status === "PENDING") {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          dispatch(
            cancelOrder({ orderId: order.id, pairAddress: order.pairAddress })
          );
        }}
        className="text-lime-400 px-4 py-2 rounded hover:bg-lime-400 hover:text-black transition"
      >
        Cancel
      </button>
    );
  }
  return <span>-</span>;
}

export function DisplayTable() {
  const dispatch = useAppDispatch();
  const selectedTable = useAppSelector(
    (state) => state.accountHistory.selectedTable
  );
  const openOrders = useAppSelector(selectOpenOrders);
  const orderHistory = useAppSelector(selectOrderHistory);
  const tradeHistory = useAppSelector(selectTradeHistory);

  switch (selectedTable) {
    case Tables.OPEN_ORDERS:
      return <OpenOrdersTable data={openOrders} />;
    case Tables.ORDER_HISTORY:
      return <OrderHistoryTable data={orderHistory} />;
    case Tables.TRADE_HISTORY:
      return <TradeHistoryTable data={tradeHistory} />;
    default:
      return null;
  }
}

//TABLE FUNCTIONS
function OpenOrdersTable({ data }: TableProps) {
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
        {data.length === 0 ? (
          <tr>
            <td colSpan={9}>No Active Orders</td>
          </tr>
        ) : (
          data.map((order) => (
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
              <td>
                <ActionButton order={order} />
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function OrderHistoryTable({ data }: TableProps) {
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
        {data.length === 0 ? (
          <tr>
            <td colSpan={11}>No Order History to display</td>
          </tr>
        ) : (
          data.map((order) => (
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
              <td>
                <ActionButton order={order} />
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function TradeHistoryTable({ data }: TableProps) {
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
        {data.length === 0 ? (
          <tr>
            <td colSpan={7}>No Trade History to display</td>
          </tr>
        ) : (
          data.map((order) => (
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
          ))
        )}
      </tbody>
    </table>
  );
}
