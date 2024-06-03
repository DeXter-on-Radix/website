import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector, useTranslations } from "hooks";
import {
  Tables,
  fetchAccountHistory,
  selectOpenOrders,
  setSelectedTable,
  cancelOrder,
  selectOrderHistory,
  AccountHistoryState,
} from "../state/accountHistorySlice";
import {
  displayTime,
  calculateTotalFees,
  calculateAvgFilled,
  getPriceSymbol,
  displayOrderSide,
} from "../utils";

import { PairInfo } from "alphadex-sdk-js/lib/models/pair-info";

function createOrderReceiptAddressLookup(
  pairsList: PairInfo[]
): Record<string, string> {
  const orderReceiptAddressLookup: Record<string, string> = {};
  pairsList.forEach((pairInfo) => {
    orderReceiptAddressLookup[pairInfo.address] = pairInfo.orderReceiptAddress;
  });
  return orderReceiptAddressLookup;
}

function getNftReceiptUrl(orderReceiptAddress: string, id: number) {
  return `https://${
    process.env.NEXT_PUBLIC_NETWORK === "stokenet" ? "stokenet-" : ""
  }dashboard.radixdlt.com/nft/${orderReceiptAddress}%3A%23${id}%23`;
}

function OrdersTabs() {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { selectedTable, tables } = useAppSelector(
    (state) => state.accountHistory
  );
  const openOrders = useAppSelector(selectOpenOrders);

  function tabClass(isActive: boolean) {
    return (
      "tab w-max no-underline h-full py-3 tab-border-1 font-bold text-sm uppercase leading-4" +
      (isActive
        ? " tab-active tab-bordered text-accent-focus !border-accent"
        : "")
    );
  }

  return (
    <div className="m-4">
      <div className="flex space-x-4">
        {tables.map((tableName) => (
          <div
            key={tableName}
            className={tabClass(selectedTable === tableName)}
            onClick={() => dispatch(setSelectedTable(tableName))}
          >
            {t(tableName)}{" "}
            {tableName === Tables.OPEN_ORDERS && openOrders.length ? (
              <span className="badge badge-xs font-bold badge-accent ml-2 p-0.5 rounded-none">
                {openOrders.length}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AccountHistory() {
  const dispatch = useAppDispatch();
  const account = useAppSelector(
    (state) => state.radix?.walletData.accounts[0]?.address
  );
  const pairAddress = useAppSelector((state) => state.pairSelector.address);

  useEffect(() => {
    dispatch(fetchAccountHistory());
  }, [dispatch, account, pairAddress]);

  return (
    <div className="">
      <OrdersTabs />
      <div className="">
        <DisplayTable />
      </div>
    </div>
  );
}

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
    "id",
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
    "id",
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

function DisplayTable() {
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
    <div className="overflow-x-auto scrollbar-none">
      <table className="table table-zebra table-xs !mt-0 mb-16 w-full max-w-[100%]">
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
  // Needed to create order NFT urls
  const { pairsList } = useAppSelector((state) => state.rewardSlice);
  const orderReceiptAddressLookup = createOrderReceiptAddressLookup(pairsList);
  return data.length ? (
    data.map((order) => (
      <tr key={order.id} className="">
        <td>{order.pairName}</td>
        <td>
          <a
            href={getNftReceiptUrl(
              orderReceiptAddressLookup[order.pairAddress],
              order.id
            )}
            target="_blank"
          >
            #{order.id}
          </a>
        </td>
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
  // Needed to create order NFT urls
  const { pairsList } = useAppSelector((state) => state.rewardSlice);
  const orderReceiptAddressLookup = createOrderReceiptAddressLookup(pairsList);
  // Sort by timeCompleted
  data = data.sort((a, b) => b.timeCompleted.localeCompare(a.timeCompleted));
  return data.length ? (
    data.map((order) => (
      <tr
        key={order.id}
        className={
          order.status === "CANCELLED" && order.completedPerc === 0
            ? "opacity-40"
            : ""
        }
      >
        <td>{order.pairName}</td>
        <td>
          <a
            href={getNftReceiptUrl(
              orderReceiptAddressLookup[order.pairAddress],
              order.id
            )}
            target="_blank"
          >
            #{order.id}
          </a>
        </td>
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
