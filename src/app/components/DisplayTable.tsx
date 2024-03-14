import React, { useMemo } from "react";
import { useAppSelector, useAppDispatch } from "../hooks";
import {
  displayTime,
  displayOrderSide,
  calculateTotalFees,
  calculateAvgFilled,
  getPriceSymbol,
} from "../utils";
import {
  cancelOrder,
  selectOpenOrders,
  selectTradeHistory,
} from "../state/accountHistorySlice";
import { AccountHistoryState, Tables } from "../state/accountHistorySlice";
interface TableProps {
  data: AccountHistoryState["orderHistory"];
}

import "../styles/table.css";

const headers = {
  [Tables.OPEN_ORDERS]: [
    "Pair",
    "Order Type",
    "Direction",
    "Time Ordered",
    "Amount",
    "Order Price",
    "Filled Qty",
    "Completed %",
    "Action",
  ],
  [Tables.ORDER_HISTORY]: [
    "Pair",
    "Order Type",
    "Direction",
    "Status",
    "Filled Qty",
    "Order Qty",
    "Avg Filled Price",
    "Order Price",
    "Order Fee",
    "Time Ordered",
    "Action",
  ],
  [Tables.TRADE_HISTORY]: [
    "Pair",
    "Direction",
    "Order Price",
    "Avg Filled Price",
    "Filled Qty",
    "Order Fee",
    "Time Completed",
  ],
};

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
        className="text-error hover:underline transition"
      >
        Cancel
      </button>
    );
  }
  return <span>-</span>;
}

export function DisplayTable() {
  const selectedTable = useAppSelector(
    (state) => state.accountHistory.selectedTable
  );
  const openOrders = useAppSelector(selectOpenOrders);
  const orderHistory = useAppSelector(
    (state) => state.accountHistory.orderHistory
  );
  const tradeHistory = useAppSelector(selectTradeHistory);

  const tableToShow = useMemo(() => {
    switch (selectedTable) {
      case Tables.OPEN_ORDERS:
        return {
          headers: headers[Tables.OPEN_ORDERS],
          rows: <OpenOrdersRows data={openOrders} />,
        };

      case Tables.ORDER_HISTORY:
        return {
          headers: headers[Tables.ORDER_HISTORY],
          rows: <OrderHistoryRows data={orderHistory} />,
        };

      case Tables.TRADE_HISTORY:
        return {
          headers: headers[Tables.TRADE_HISTORY],
          rows: <TradeHistoryTable data={tradeHistory} />,
        };

      default:
        return {
          headers: [],
          rows: <></>,
        };
    }
  }, [openOrders, orderHistory, selectedTable, tradeHistory]);

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra table-xs !mt-0">
        <thead>
          <tr>
            {tableToShow.headers.map((header, i) => (
              <th className="text-secondary-content uppercase" key={i}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{tableToShow.rows}</tbody>
      </table>
    </div>
  );
}

const OpenOrdersRows = ({ data }: TableProps) => {
  return data.length ? (
    data.map((order) => (
      <tr key={order.id} className="">
        <td>{order.pairName}</td>
        <td>{order.orderType}</td>
        <td className={displayOrderSide(order.side).className}>
          {displayOrderSide(order.side).text}
        </td>
        <td>{displayTime(order.timeSubmitted, "full")}</td>
        <td>
          {/* Amount */}
          {order.amount} {order.specifiedToken.symbol}
        </td>
        <td>
          {order.price} {getPriceSymbol(order)}
        </td>
        <td>
          {/* Filled Qty (compute with completedPerc to avoid using amountFilled) */}
          {order.status === "COMPLETED"
            ? order.amount
            : (order.amount * order.completedPerc) / 100}{" "}
          {order.specifiedToken.symbol}
        </td>
        <td>{order.completedPerc}%</td>
        <td>
          <ActionButton order={order} />
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={7}>No Active Orders</td>
    </tr>
  );
};

const OrderHistoryRows = ({ data }: TableProps) => {
  return data.length ? (
    data.map((order) => (
      <tr key={order.id} className="">
        <td>{order.pairName}</td>
        <td>{order.orderType}</td>
        <td className={displayOrderSide(order.side).className}>
          {displayOrderSide(order.side).text}
        </td>
        <td>{order.status}</td>
        <td>
          {/* Filled Qty (computed with completedPerc to avoid using amountFilled) */}
          {order.status === "COMPLETED"
            ? order.amount
            : (order.amount * order.completedPerc) / 100}{" "}
          {order.specifiedToken.symbol}
        </td>
        <td>
          {/* Order Qty */}
          {order.amount} {order.specifiedToken.symbol}
        </td>
        <td>
          {calculateAvgFilled(order.token1Filled, order.token2Filled)}{" "}
          {getPriceSymbol(order)}
        </td>
        <td>
          {order.price} {getPriceSymbol(order)}
        </td>
        <td>
          {calculateTotalFees(order)} {order.unclaimedToken.symbol}
        </td>
        <td>{displayTime(order.timeSubmitted, "full")}</td>
        <td>
          <ActionButton order={order} />
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={7}>No Order History</td>
    </tr>
  );
};

const TradeHistoryTable = ({ data }: TableProps) => {
  return data.length ? (
    data.map((order) => (
      <tr key={order.id} className="">
        <td>{order.pairName}</td>
        <td className={displayOrderSide(order.side).className}>
          {displayOrderSide(order.side).text}
        </td>
        <td>
          {order.price} {getPriceSymbol(order)}
        </td>
        <td>
          {calculateAvgFilled(order.token1Filled, order.token2Filled)}{" "}
          {getPriceSymbol(order)}
        </td>
        <td>
          {/* Filled Qty (since the order is filled, the full amount was filled) */}
          {order.amount} {order.specifiedToken.symbol}
        </td>
        <td>
          {calculateTotalFees(order)} {order.unclaimedToken.symbol}
        </td>
        <td>{displayTime(order.timeCompleted, "full")}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={7}>No Trade History</td>
    </tr>
  );
};
