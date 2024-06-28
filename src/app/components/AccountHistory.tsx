import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector, useTranslations } from "hooks";
import { DexterToast } from "./DexterToaster";
import { PairInfo } from "alphadex-sdk-js/lib/models/pair-info";
import "../styles/table.css";
import {
  Tables,
  fetchAccountHistory,
  selectOpenOrders,
  setSelectedTable,
  selectOrderToCancel,
  deselectOrderToCancel,
  cancelOrder,
  selectOrderHistory,
  AccountHistoryState,
  Order,
  batchCancel,
} from "../state/accountHistorySlice";
import {
  getOrderIdentifier,
  getOrderIdentifierFromAdex,
} from "./AccountHistoryUtils";
import {
  displayTime,
  getPriceSymbol,
  displayOrderSide,
  calculateAvgFilled,
  calculateTotalFees,
} from "../utils";

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
    <div className="account-history">
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
    "cancel_orders",
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

// TODO: rename "order" to "adexOrderReceipt"
function ActionButton({
  order,
  visible,
}: {
  order: AccountHistoryState["orderHistory"][0];
  visible: boolean;
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
        className={`text-error hover:underline transition ${
          !visible ? "invisible" : ""
        }`}
      >
        {t("cancel_single_order")}
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
          <tr className="h-12">
            {tableToShow.headers.map((header, i) => (
              <th className="text-secondary-content uppercase" key={i}>
                {header === "cancel_orders" ? (
                  <CancelOrdersHeaderRow />
                ) : (
                  t(header)
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{tableToShow.rows}</tbody>
      </table>
    </div>
  );
}

const CancelOrdersHeaderRow = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { isConnected } = useAppSelector((state) => state.radix);
  const { selectedOrdersToCancel } = useAppSelector(
    (state) => state.accountHistory
  );
  const nbrOfOrders: number = Object.keys(selectedOrdersToCancel).length;
  const orderSelected: boolean = nbrOfOrders > 0;

  return (
    <div className="flex items-center w-[150px]">
      {orderSelected ? (
        <div
          className="bg-dexter-red text-white font-bold p-2 rounded flex items-center cursor-pointer"
          onClick={async (e) => {
            if (!isConnected) {
              alert(t("connect_wallet_to_batch_delete"));
              return;
            }
            e.stopPropagation();
            DexterToast.promise(
              // Function input, with following state-to-toast mapping
              // -> pending: loading toast
              // -> rejceted: error toast
              // -> resolved: success toast
              async () => {
                const action = await dispatch(
                  batchCancel(Object.values(selectedOrdersToCancel))
                );
                if (!action.type.endsWith("fulfilled")) {
                  // Transaction was not fulfilled (e.g. userRejected or userCanceled)
                  throw new Error("Transaction failed due to user action.");
                }
              },
              t("submitting_batch_cancel"), // Loading message
              t("cancelled"), // success message
              t("failed_to_cancel_orders") // error message
            );
          }}
        >
          <span>
            {nbrOfOrders > 1
              ? t("cancel_n_orders").replace(
                  "<$NBR_OF_ORDERS>",
                  nbrOfOrders.toString()
                )
              : t("cancel_1_order")}
          </span>
          <img
            src="./bin-white.svg"
            className="w-3 ml-1"
            alt="trash can icon"
          />
        </div>
      ) : (
        <div className=" flex">
          <span>{t("cancel_orders")}</span>
          <img src="./bin.svg" className="w-3 ml-1" alt="trash can icon" />
        </div>
      )}
    </div>
  );
};

const CheckBox = ({ order }: { order: Order }) => {
  const dispatch = useAppDispatch();
  const { selectedOrdersToCancel } = useAppSelector(
    (state) => state.accountHistory
  );

  const selectOrDeselectCheckbox = (
    event: React.MouseEvent<HTMLInputElement>,
    n: number
  ) => {
    if (event.currentTarget.checked) {
      if (n >= 8) {
        alert("Cannot select more than 8 orders.");
        event.preventDefault();
      } else {
        dispatch(selectOrderToCancel(order));
      }
    } else {
      dispatch(deselectOrderToCancel(order));
    }
  };

  return (
    <input
      type="checkbox"
      value={getOrderIdentifier(order)}
      className="mr-2 w-4 h-4 bg-gray-100 border-gray-300 rounded cursor-pointer"
      onClick={(e) => {
        selectOrDeselectCheckbox(e, Object.keys(selectedOrdersToCancel).length);
      }}
    />
  );
};

const OpenOrdersRows = ({ data }: TableProps) => {
  const t = useTranslations();
  return data.length ? (
    data.map((adexOrderReceipt, indx) => (
      <OpenOrderRow adexOrderReceipt={adexOrderReceipt} key={indx} />
    ))
  ) : (
    <tr>
      <td colSpan={7}>{t("no_active_orders")}</td>
    </tr>
  );
};

const OpenOrderRow = ({ adexOrderReceipt }: { adexOrderReceipt: any }) => {
  const t = useTranslations();
  const { pairsList } = useAppSelector((state) => state.rewardSlice);
  const { selectedOrdersToCancel } = useAppSelector(
    (state) => state.accountHistory
  );
  const orderReceiptAddressLookup = createOrderReceiptAddressLookup(pairsList);
  const [rowIsHovered, setRowIsHovered] = useState(false);
  const rowRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    const handleMouseEnter = () => setRowIsHovered(true);
    const handleMouseLeave = () => setRowIsHovered(false);
    const rowElement = rowRef.current;
    if (rowElement) {
      rowElement.addEventListener("mouseenter", handleMouseEnter);
      rowElement.addEventListener("mouseleave", handleMouseLeave);
    }
    // Cleanup the event listeners on unmount
    return () => {
      if (rowElement) {
        rowElement.removeEventListener("mouseenter", handleMouseEnter);
        rowElement.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);
  const order: Order = {
    pairAddress: adexOrderReceipt.pairAddress,
    orderReceiptId: adexOrderReceipt.id,
    orderReceiptAddress:
      createOrderReceiptAddressLookup(pairsList)[adexOrderReceipt.pairAddress],
  };
  const notSelected =
    selectedOrdersToCancel[getOrderIdentifierFromAdex(adexOrderReceipt)] ===
    undefined;

  return (
    <tr
      key={adexOrderReceipt.id}
      className={`${rowIsHovered ? "!bg-[#3f3f3f]" : ""}`}
      ref={rowRef}
    >
      <td>{adexOrderReceipt.pairName}</td>
      <td>
        <a
          href={getNftReceiptUrl(
            orderReceiptAddressLookup[adexOrderReceipt.pairAddress],
            adexOrderReceipt.id
          )}
          target="_blank"
        >
          #{adexOrderReceipt.id}
        </a>
      </td>
      <td className="uppercase">{t(adexOrderReceipt.orderType)}</td>
      <td className={displayOrderSide(adexOrderReceipt.side).className}>
        {t(displayOrderSide(adexOrderReceipt.side).text)}
      </td>
      <td>
        {displayTime(adexOrderReceipt.timeSubmitted, "full_without_seconds")}
      </td>
      <td>
        {adexOrderReceipt.amount} {adexOrderReceipt.specifiedToken.symbol}
      </td>
      <td>
        {adexOrderReceipt.price} {getPriceSymbol(adexOrderReceipt)}
      </td>
      <td>
        {/* Filled Qty (compute with completedPerc to avoid using amountFilled) */}
        {adexOrderReceipt.status === "COMPLETED"
          ? adexOrderReceipt.amount
          : (adexOrderReceipt.amount * adexOrderReceipt.completedPerc) /
            100}{" "}
        {adexOrderReceipt.specifiedToken.symbol}
      </td>
      <td>{adexOrderReceipt.completedPerc}%</td>
      <td>
        <div className="flex items-center">
          <CheckBox order={order} />
          <ActionButton
            order={adexOrderReceipt}
            visible={rowIsHovered && notSelected}
          />
        </div>
      </td>
    </tr>
  );
};

const OrderHistoryRows = ({ data }: TableProps) => {
  const t = useTranslations();
  // Sort by timeCompleted
  data = data.sort((a, b) => b.timeCompleted.localeCompare(a.timeCompleted));
  return data.length ? (
    data.map((order, indx) => <OrderHistoryRow order={order} key={indx} />)
  ) : (
    <tr>
      <td colSpan={7}>{t("no_order_history")}</td>
    </tr>
  );
};

const OrderHistoryRow = ({ order }: { order: any }) => {
  const t = useTranslations();
  // Needed to create order NFT urls
  const { pairsList } = useAppSelector((state) => state.rewardSlice);
  const orderReceiptAddressLookup = createOrderReceiptAddressLookup(pairsList);
  const [rowIsHovered, setRowIsHovered] = useState(false);
  const rowRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    const handleMouseEnter = () => setRowIsHovered(true);
    const handleMouseLeave = () => setRowIsHovered(false);
    const rowElement = rowRef.current;
    if (rowElement) {
      rowElement.addEventListener("mouseenter", handleMouseEnter);
      rowElement.addEventListener("mouseleave", handleMouseLeave);
    }
    // Cleanup the event listeners on unmount
    return () => {
      if (rowElement) {
        rowElement.removeEventListener("mouseenter", handleMouseEnter);
        rowElement.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <tr
      key={order.id}
      className={`
        ${rowIsHovered ? "!bg-[#3f3f3f] " : ""}
        ${
          order.status === "CANCELLED" && order.completedPerc === 0
            ? "opacity-40"
            : ""
        }
      `}
      ref={rowRef}
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
      <td>{displayTime(order.timeSubmitted, "full_without_seconds")}</td>
      <td>{displayTime(order.timeCompleted, "full_without_seconds")}</td>
    </tr>
  );
};
