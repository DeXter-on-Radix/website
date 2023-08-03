import { useContext, CSSProperties } from "react";
import { OrderbookLine } from "alphadex-sdk-js";
import { AdexStateContext } from "./contexts";
import "./orderbook.css";
import * as utils from "./utils";

// TODO: test the table updates automatically when orders get bought

export interface OrderBookRowProps {
  barColor?: string;
  orderCount?: number;
  price?: number;
  size?: number;
  total?: number;
  maxTotal?: number;
  absentOrders?: string;
}

function OrderBookRow(props: OrderBookRowProps) {
  const adexState = useContext(AdexStateContext);

  const { barColor, orderCount, price, size, total, maxTotal } = props;
  if (
    typeof barColor !== "undefined" &&
    typeof orderCount !== "undefined" &&
    typeof price !== "undefined" &&
    typeof size !== "undefined" &&
    typeof total !== "undefined" &&
    typeof maxTotal !== "undefined"
  ) {
    const { maxDigitsToken1, maxDigitsToken2 } = adexState.currentPairInfo;
    const priceString = utils.displayNumber(price, maxDigitsToken1);
    const sizeString = utils.displayNumber(size, maxDigitsToken2);
    const totalString = utils.displayNumber(total, maxDigitsToken1);
    const barWidth = `${(total / maxTotal) * 100}%`;

    const barStyle: React.CSSProperties = {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      width: barWidth,
      backgroundColor:
        barColor === "text-red-700"
          ? "rgba(239, 68, 68, 0.5)"
          : "rgba(52, 211, 153, 0.5)",
      zIndex: -1,
    };

    return (
      <tr
        className="border-none order-book-bars"
        style={{ position: "relative" }}
      >
        <td className="text-start">
          <div>
            <div className="bar" style={barStyle}></div>
            {orderCount}
          </div>
        </td>
        <td className="text-end">{priceString}</td>
        <td className="text-end">{sizeString}</td>
        <td className="text-end">{totalString}</td>
      </tr>
    );
  }

  // otherwise we don't have data to display
  return (
    <tr className="border-none">
      <td className="text-center" colSpan={4}>
        {props.absentOrders}
      </td>
    </tr>
  );
}

interface MiddleRowsProps {
  bestSell: number | null;
  bestBuy: number | null;
}

function MiddleRows(props: MiddleRowsProps) {
  const { bestSell, bestBuy } = props;
  const adexState = useContext(AdexStateContext);

  let spreadString = "";

  // checking for past trades here because adexState.currentPairInfo.lastPrice
  // is never null, and is = -1 if there were no trades
  let lastPrice = "";
  if (adexState.currentPairTrades.length > 0) {
    lastPrice = adexState.currentPairInfo.lastPrice.toLocaleString();
  } else {
    lastPrice = "No trades have occurred yet";
  }

  if (bestBuy && bestSell) {
    if (bestBuy + bestSell !== 0) {
      const spread = bestSell - bestBuy;
      const spreadPercent = utils.displayNumber(
        (2 * spread) / (bestBuy + bestSell),
        2
      );

      const maxDigits = Math.max(
        adexState.currentPairInfo.maxDigitsToken1,
        adexState.currentPairInfo.maxDigitsToken2
      );

      spreadString = `${utils.displayNumber(
        spread,
        maxDigits
      )} (${spreadPercent}%)`;
    }

    return (
      <>
        <tr className="border-none orderbook-middle-row-top">
          <td className="align-middle text-2xl" colSpan={2} rowSpan={2}>
            {lastPrice}
          </td>
          <td className="text-sm text-end" colSpan={2}>
            Spread
          </td>
        </tr>

        <tr className="border-none orderbook-middle-row-bottom">
          <td className="text-xl text-end" colSpan={2}>
            {spreadString}
          </td>
        </tr>
      </>
    );
  } else {
    return (
      <>
        <tr className="border-none orderbook-middle-row-top orderbook-middle-row-bottom">
          <td className="text-2xl" colSpan={4}>
            {lastPrice}
          </td>
        </tr>
      </>
    );
  }
}

export function toOrderBookRowProps(
  adexOrderbookLines: OrderbookLine[],
  side: "sell" | "buy"
): OrderBookRowProps[] {
  // this will drop the rows that do not fit into 8 buys/sells
  // TODO: implement pagination or scrolling

  const props: OrderBookRowProps[] = [];
  let adexRows = [...adexOrderbookLines]; // copy the array so we can mutate it

  // TODO: daisyui variable bar color
  let barColor = "text-green-700";
  if (side === "sell") {
    adexRows.reverse();
    barColor = "text-red-700";
  }
  adexRows = adexRows.slice(0, 8); // Limit to 8 rows

  let total = 0;
  let maxTotal = 0;
  for (let adexRow of adexRows) {
    total += adexRow.quantityRemaining;
    const currentProps = {
      barColor,
      orderCount: adexRow.noOrders,
      price: adexRow.price,
      size: adexRow.valueRemaining,
      total: total,
    };
    maxTotal = Math.max(maxTotal, total);

    props.push(currentProps);
  }
  // update maxTotal
  for (let i = 0; i < props.length; i++) {
    props[i].maxTotal = maxTotal;
  }

  // If there are fewer than 8 orders, fill the remaining rows with empty values
  while (props.length < 8) {
    props.push({ absentOrders: "\u00A0" });
  }

  if (adexOrderbookLines.length === 0) {
    props[2].absentOrders = `No open ${side} orders`;
  }

  if (side === "sell") {
    props.reverse();
  }

  return props;
}

export function OrderBook() {
  const adexState = useContext(AdexStateContext);
  const { buys, sells } = adexState.currentPairOrderbook;

  let bestSell = null;
  let bestBuy = null;

  if (sells.length > 0 && buys.length > 0) {
    bestSell = sells[sells.length - 1]?.price;
    bestBuy = buys[0]?.price;
  }

  return (
    <div className="p-2">
      <table className="table-xs max-w-md">
        <thead>
          <tr>
            <th>Order Count</th>
            <th className="text-end">
              Price ({adexState.currentPairInfo.token1.symbol})
            </th>
            <th className="text-end">
              Size ({adexState.currentPairInfo.token2.symbol})
            </th>
            <th className="text-end">
              Total ({adexState.currentPairInfo.token1.symbol})
            </th>
          </tr>
        </thead>
        <tbody>
          {toOrderBookRowProps(sells, "sell").map((props, index) => (
            <OrderBookRow key={"sell-" + index} {...props} />
          ))}

          <MiddleRows bestSell={bestSell} bestBuy={bestBuy} />

          {toOrderBookRowProps(buys, "buy").map((props, index) => (
            <OrderBookRow key={"buy-" + index} {...props} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
