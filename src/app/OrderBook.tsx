import { useContext } from "react";
import { OrderbookLine } from "alphadex-sdk-js";
import { AdexStateContext } from "./contexts";
import "./orderbook.css";
import * as utils from "./utils";

interface OrderBookRowProps {
  barColor: string;
  orderCount: number;
  price: string;
  size: string;
  total: string;
}

function OrderBookRow(props: OrderBookRowProps) {
  // TODO: daisyui variable bar color

  return (
    <tr className="border-none">
      <td>{props.orderCount}</td>
      <td className={props.barColor + " text-end"}>{props.price}</td>
      <td className="text-end">{props.size}</td>
      <td className="text-end">{props.total}</td>
    </tr>
  );
}

interface MiddleRowsProps {
  lastPrice: string;
  bestSell: number | null;
  bestBuy: number | null;
}

function UsdQuestionLink() {
  return (
    <a href="https://www.figma.com/file/P7pfzKwJ4G6ClapXfl61D3?node-id=18:3324&mode=design#505524313">
      TODO: should we use USD estimate?
    </a>
  );
}

function MiddleRows(props: MiddleRowsProps) {
  const { lastPrice, bestSell, bestBuy } = props;

  const tdStyle = {
    padding: "0",
  };

  if (bestBuy && bestSell && bestBuy !== 0) {
    const spread = bestSell - bestBuy;
    const spreadPercent = (spread / bestBuy) * 100;

    return (
      <>
        <tr className="border-none orderbook-middle-row-top">
          <td className="text-2xl" colSpan={2} style={tdStyle}>
            {lastPrice}
          </td>
          <td className="text-sm text-end" colSpan={2}>
            Spread
          </td>
        </tr>

        <tr className="border-none orderbook-middle-row-bottom">
          <td className="text-sm" colSpan={2}>
            <UsdQuestionLink />
          </td>
          <td className="text-xl text-end" colSpan={2}>
            {spread}({spreadPercent}%)
          </td>
        </tr>
      </>
    );
  } else {
    return (
      <>
        <tr className="border-none orderbook-middle-row-top">
          <td className="text-2xl" colSpan={4} style={tdStyle}>
            {lastPrice}
          </td>
        </tr>
        <tr className="border-none orderbook-middle-row-bottom">
          <td className="text-sm" colSpan={4}>
            <UsdQuestionLink />
          </td>
        </tr>
      </>
    );
  }
}

function toOrderBookRowProps(
  adexOrderbookLines: OrderbookLine[],
  side: "sell" | "buy"
): OrderBookRowProps[] {
  let adexRows = adexOrderbookLines;
  let total = 0;

  const props = [];

  if (side === "sell") {
    // TODO: implement a solution without mutating the original array
    adexRows.reverse();
  }

  for (let i = 0; i < adexRows.length; i++) {
    const adexRow = adexRows[i];
    // https://www.npmjs.com/package/alphadex-sdk-js
    // quantityRemaining - The amount of token1 that remains available at this price.
    total += adexRow.quantityRemaining;
    props.push({
      barColor: side === "sell" ? "text-red-700" : "text-green-700",
      orderCount: adexRow.noOrders,
      price: utils.displayNumber(adexRow.price, 2, true),
      size: utils.displayNumber(adexRow.valueRemaining, 2, true),
      total: utils.displayNumber(total, 2, true),
    });
  }

  if (side === "sell") {
    props.reverse();
    adexRows.reverse();
  }

  return props;
}

export function OrderBook() {
  const adexState = useContext(AdexStateContext);
  const { buys, sells } = adexState.currentPairOrderbook;

  let lastPrice = "";
  // checking for past trades here because adexState.currentPairInfo.lastPrice
  // is never null, and is = -1 if there were no trades
  if (adexState.currentPairTrades.length > 0) {
    lastPrice = adexState.currentPairInfo.lastPrice.toLocaleString();
  }
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
          {toOrderBookRowProps(sells, "sell").map((props, index) => (
            <OrderBookRow key={"sell-" + index} {...props} />
          ))}

          <MiddleRows
            lastPrice={lastPrice}
            bestSell={bestSell}
            bestBuy={bestBuy}
          />

          {toOrderBookRowProps(buys, "buy").map((props, index) => (
            <OrderBookRow key={"buy-" + index} {...props} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
