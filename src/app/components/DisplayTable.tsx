import React, { useMemo } from "react";
import { useAppSelector, useAppDispatch, useTranslations } from "../hooks";
import {
  displayTime,
  calculateTotalFees,
  calculateAvgFilled,
  getPriceSymbol,
  displayOrderSide,
} from "../utils";
import {
  cancelOrder,
  selectOpenOrders,
  selectOrderHistory,
} from "../state/accountHistorySlice";
import { AccountHistoryState, Tables } from "../state/accountHistorySlice";
interface TableProps {
  data: AccountHistoryState["orderHistory"];
}

import "../styles/table.css";
import { DexterToast } from "./DexterToaster";

// The headers refer to keys specified in
// src/app/state/locales/{languagecode}/trade.json
const headers = {
  [Tables.OPEN_ORDERS]: [
    "pair",
    "order_type",
    "direction",
    "time_ordered",
    "amount",
    "order_price",
    "filled_qty",
    "completed_perc",
    "action",
  ],
  [Tables.ORDER_HISTORY]: [
    "pair",
    "order_type",
    "direction",
    "status",
    "filled_qty",
    "order_qty",
    "avg_filled_price",
    "order_price",
    "order_fee",
    "time_ordered",
    "time_completed",
  ],
};

function ActionButton({
  order,
}: {
  order: AccountHistoryState["orderHistory"][0];
}) {
  const t = useTranslations();
  const dispatch = useAppDispatch();

  if (order.status === "PENDING") {
    return (
      <button
        onClick={async (e) => {
          e.stopPropagation();
          DexterToast.promise(
            // Function input, with following state-to-toast mapping
            // -> pending: loading toast
            // -> rejceted: error toast
            // -> resolved: success toast
            async () => {
              const action = await dispatch(
                cancelOrder({
                  orderId: order.id,
                  pairAddress: order.pairAddress,
                })
              );
              if (!action.type.endsWith("fulfilled")) {
                // Transaction was not fulfilled (e.g. userRejected or userCanceled)
                throw new Error("Transaction failed due to user action.");
              } else if ((action.payload as any)?.status === "ERROR") {
                // Transaction was fulfilled but failed (e.g. submitted onchain failure)
                throw new Error("Transaction failed onledger");
              }
            },
            t("cancelling_order"), // Loading message
            t("order_cancelled"), // success message
            t("failed_to_cancel_order") // error message
          );
        }}
        className="text-error hover:underline transition"
      >
        {t("cancel")}
      </button>
    );
  }
  return <span>-</span>;
}

export function DisplayTable() {
  const t = useTranslations();
  const selectedTable = useAppSelector(
    (state) => state.accountHistory.selectedTable
  );
  const openOrders = useAppSelector(selectOpenOrders);
  const orderHistory = useAppSelector(selectOrderHistory);

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

      default:
        return {
          headers: [],
          rows: <></>,
        };
    }
  }, [openOrders, orderHistory, selectedTable]);

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra table-xs !mt-0 mb-16">
        <thead>
          <tr>
            {tableToShow.headers.map((header, i) => (
              <th className="text-secondary-content uppercase" key={i}>
                {t(header)}
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
  const t = useTranslations();
  return data.length ? (
    data.map((order) => (
      <tr key={order.id} className="">
        <td>{order.pairName}</td>
        <td className="uppercase">{t(order.orderType)}</td>
        <td className={displayOrderSide(order.side).className}>
          {t(displayOrderSide(order.side).text)}
        </td>
        <td>{displayTime(order.timeSubmitted, "full")}</td>
        <td>
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
      <td colSpan={7}>{t("no_active_orders")}</td>
    </tr>
  );
};

const OrderHistoryRows = ({ data }: TableProps) => {
  const t = useTranslations();
  return data.length ? (
    data.map((order) => (
      <tr
        key={order.id}
        className={
          order.status === "CANCELLED" && order.completedPerc === 0
            ? "opacity-30"
            : ""
        }
      >
        <td>{order.pairName}</td>
        <td className="uppercase">{t(order.orderType)}</td>
        <td className={displayOrderSide(order.side).className}>
          {t(displayOrderSide(order.side).text)}
        </td>
        <td className="uppercase">{t(order.status)}</td>
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
          {order.orderType === "MARKET"
            ? "-"
            : `${order.price} ${getPriceSymbol(order)}`}
        </td>
        <td>
          {calculateTotalFees(order)} {order.unclaimedToken.symbol}
        </td>
        <td>{displayTime(order.timeSubmitted, "full")}</td>
        <td>{displayTime(order.timeCompleted, "full")}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={7}>{t("no_order_history")}</td>
    </tr>
  );
};
