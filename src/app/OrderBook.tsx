import { useContext } from "react";
import { OrderbookLine } from "alphadex-sdk-js";
import { AdexStateContext } from "./contexts";
import "./orderbook.css";
import * as utils from "./utils";

// TODO: test the table updates automatically when orders get bought

// TODO: "No open buy orders" and "No open sell orders"

export interface OrderBookRowProps {
  barColor: string;
  orderCount: number | null;
  price: string;
  size: string;
  total: string;
}

function OrderBookRow(props: OrderBookRowProps) {
  return (
    <tr className="border-none">
      <td>{props.orderCount !== null ? props.orderCount : "\u00A0"}</td>
      <td className={props.barColor + " text-end"}>{props.price}</td>
      <td className="text-end">{props.size}</td>
      <td className="text-end">{props.total}</td>
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

  const tdStyle = {
    padding: "0",
  };

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
          <td
            className="align-middle text-2xl"
            colSpan={2}
            rowSpan={2}
            style={tdStyle}
          >
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
          <td className="text-2xl" colSpan={4} style={tdStyle}>
            {lastPrice}
          </td>
        </tr>
      </>
    );
  }
}

export function toOrderBookRowProps(
  adexOrderbookLines: OrderbookLine[],
  side: "sell" | "buy",
  decimalsToken1: number,
  decimalsToken2: number
): OrderBookRowProps[] {
  // this will drop the rows that do not fit into 8 buys/sells
  // TODO: implement pagination or scrolling

  const props = [];
  let adexRows = [...adexOrderbookLines]; // copy the array so we can mutate it

  // TODO: daisyui variable bar color
  let barColor = "text-green-700";
  if (side === "sell") {
    adexRows.reverse();
    barColor = "text-red-700";
  }
  adexRows = adexRows.slice(0, 8); // Limit to 8 rows

  let total = 0;
  for (let adexRow of adexRows) {
    total += adexRow.quantityRemaining;
    const currentProps = {
      barColor,
      orderCount: adexRow.noOrders,
      price: utils.displayNumber(adexRow.price, decimalsToken1),
      size: utils.displayNumber(adexRow.valueRemaining, decimalsToken2),
      total: utils.displayNumber(total, decimalsToken1),
    };

    props.push(currentProps);
  }

  // If there are fewer than 8 orders, fill the remaining rows with empty values
  while (props.length < 8) {
    props.push({
      barColor,
      orderCount: null,
      price: "",
      size: "",
      total: "",
    });
  }

  if (side === "sell") {
    props.reverse();
  }

  return props;
}

export function OrderBook() {
  const adexState = useContext(AdexStateContext);
  const { buys, sells } = adexState.currentPairOrderbook;
  const { maxDigitsToken1, maxDigitsToken2 } = adexState.currentPairInfo;

  let bestSell = null;
  let bestBuy = null;

  if (sells.length > 0 && buys.length > 0) {
    bestSell = sells[sells.length - 1]?.price;
    bestBuy = buys[0]?.price;
  }

  return (
    <div className="p-2">
      <table className="table-sm">
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
          {toOrderBookRowProps(
            sells,
            "sell",
            maxDigitsToken1,
            maxDigitsToken2
          ).map((props, index) => (
            <OrderBookRow key={"sell-" + index} {...props} />
          ))}

          <MiddleRows bestSell={bestSell} bestBuy={bestBuy} />

          {toOrderBookRowProps(
            buys,
            "buy",
            maxDigitsToken1,
            maxDigitsToken2
          ).map((props, index) => (
            <OrderBookRow key={"buy-" + index} {...props} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
