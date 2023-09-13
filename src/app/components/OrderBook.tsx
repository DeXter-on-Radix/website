import { CSSProperties } from "react";
import "../styles/orderbook.css";
import * as utils from "../utils";
import { OrderBookRowProps } from "../redux/orderBookSlice";
import { useAppSelector } from "../hooks";

function OrderBookRow(props: OrderBookRowProps) {
  const { barColor, orderCount, price, size, total, maxTotal } = props;
  if (
    typeof barColor !== "undefined" &&
    typeof orderCount !== "undefined" &&
    typeof price !== "undefined" &&
    typeof size !== "undefined" &&
    typeof total !== "undefined" &&
    typeof maxTotal !== "undefined"
  ) {
    const charactersToDisplay = 6;
    const priceString = utils.displayAmount(price, charactersToDisplay);
    const sizeString = utils.displayAmount(size, charactersToDisplay);
    const totalString = utils.displayAmount(total, charactersToDisplay);
    const barWidth = `${(total / maxTotal) * 100}%`;

    const barStyle = {
      width: barWidth,
      backgroundColor: barColor,
      position: "absolute",
      right: 0,
      top: 0,
      bottom: 0,
      zIndex: -1,
    } as CSSProperties;

    return (
      <div className="relative col-span-4 sized-columns text-xs">
        <div style={barStyle}></div>
        <div className="order-cell">{orderCount}</div>
        <div className="order-cell text-end">{priceString}</div>
        <div className="order-cell text-end">{sizeString}</div>
        <div className="order-cell text-end">{totalString}</div>
      </div>
    );
  }

  // otherwise we don't have data to display
  return <div className="text-center col-span-4">{props.absentOrders}</div>;
}

function MiddleRows() {
  const trades = useAppSelector((state) => state.accountHistory.trades);
  const orderBook = useAppSelector((state) => state.orderBook);
  const priceMaxDecimals = useAppSelector(
    (state) => state.pairSelector.priceMaxDecimals
  );

  let spreadString = "";

  // checking for past trades here because adexState.currentPairInfo.lastPrice
  // is never null, and is = -1 if there were no trades
  let lastPrice = "";
  if (trades.length > 0) {
    lastPrice = orderBook.lastPrice?.toLocaleString() || "";
  } else {
    lastPrice = "No trades have occurred yet";
  }
  const bestSell = orderBook.bestSell;
  const bestBuy = orderBook.bestBuy;

  if (bestBuy !== null && bestSell !== null) {
    if (orderBook.spreadPercent !== null && orderBook.spread !== null) {
      const spread = utils.displayPositiveNumber(
        orderBook.spread,
        priceMaxDecimals
      );
      const spreadPercent = utils.displayPositiveNumber(
        orderBook.spreadPercent,
        2
      );

      spreadString = `${spread} (${spreadPercent}%)`;
    }

    return (
      <>
        <div className="text-2xl col-span-2 my-1 py-1 border-t border-b border-accent-content">
          {lastPrice}
        </div>

        <div className="flex justify-end col-span-2 text-xl my-1 py-1 border-t border-b border-accent-content whitespace-nowrap ">
          <span className="text-sm my-auto">Spread</span>{" "}
          <span className="my-auto pl-2">{spreadString}</span>
        </div>
      </>
    );
  } else {
    return (
      <div className="text-2xl col-span-4 border-t border-b border-accent-content">
        {lastPrice}
      </div>
    );
  }
}

export function OrderBook() {
  const token1Symbol = useAppSelector(
    (state) => state.pairSelector.token1.symbol
  );
  const token2Symbol = useAppSelector(
    (state) => state.pairSelector.token2.symbol
  );
  const sells = useAppSelector((state) => state.orderBook.sells);
  const buys = useAppSelector((state) => state.orderBook.buys);

  return (
    <div className="p-2 text-sx">
      <div className="sized-columns max-w-sm">
        <div className="sized-columns col-span-4 text-sm text-secondary-content">
          <div className="">
            Order
            <br />
            Count
          </div>
          <div className="text-end">
            Price
            <br />({token2Symbol})
          </div>
          <div className="text-end">
            Size
            <br />({token1Symbol})
          </div>
          <div className="text-end">
            Total
            <br />({token1Symbol})
          </div>
        </div>

        {sells.map((props, index) => (
          <OrderBookRow key={"sell-" + index} {...props} />
        ))}

        <MiddleRows />

        {buys.map((props, index) => (
          <OrderBookRow key={"buy-" + index} {...props} />
        ))}
      </div>
    </div>
  );
}
