import { CSSProperties } from "react";

import "../styles/orderbook.css";
import * as utils from "../utils";
import { OrderBookRowProps, orderBookSlice } from "../state/orderBookSlice";
import { useAppDispatch, useAppSelector } from "../hooks";

// For all intents, we can round all numbers to 8 decimals for Dexter.
// Alphadex will not accept any numbers with more than 8 decimals
// and it is doubtful whether people are that interested in numbers with more decimals.
// https://discord.com/channels/1125689933735145503/1125689934251032584/1181882491464843314

// 10 = for possible 8 decimals in smaller than 1 numbers + 1 for the decimal point + 1 for the leading 0
const CHARACTERS_TO_DISPLAY = 10;

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
    const priceString = utils.displayNumber(price, CHARACTERS_TO_DISPLAY);
    const sizeString = utils.displayNumber(size, CHARACTERS_TO_DISPLAY);
    const totalString = utils.displayNumber(total, CHARACTERS_TO_DISPLAY);
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
      <div className="relative col-span-4 sized-columns text-xs mb-0.5 py-0.5 ">
        <div style={barStyle}></div>
        <div className="order-cell text-start ml-2">{orderCount}</div>
        <div className="order-cell text-end">{priceString}</div>
        <div className="order-cell text-end">{sizeString}</div>
        <div className="order-cell text-end mr-2">{totalString}</div>
      </div>
    );
  }

  // otherwise we don't have data to display
  return <div className="text-center col-span-4">{props.absentOrders}</div>;
}

function CurrentPriceRow() {
  const trades = useAppSelector((state) => state.accountHistory.trades);
  const orderBook = useAppSelector((state) => state.orderBook);
  const token2MaxDecimals = useAppSelector(
    (state) => state.pairSelector.token2.decimals
  );

  let spreadString = "";
  let spreadValue = "";

  // checking for past trades here because adexState.currentPairInfo.lastPrice
  // is never null, and is = -1 if there were no trades
  let lastPrice = "";
  if (trades.length > 0) {
    lastPrice = utils.displayNumber(
      orderBook.lastPrice || 0,
      CHARACTERS_TO_DISPLAY
    );
  } else {
    lastPrice = "No trades have occurred yet";
  }
  const bestSell = orderBook.bestSell;
  const bestBuy = orderBook.bestBuy;

  if (bestBuy !== null && bestSell !== null) {
    if (orderBook.spreadPercent !== null && orderBook.spread !== null) {
      const spread = utils.displayPositiveNumber(
        orderBook.spread,
        CHARACTERS_TO_DISPLAY,
        token2MaxDecimals
      );
      const spreadPercent = utils.displayPositiveNumber(
        orderBook.spreadPercent,
        CHARACTERS_TO_DISPLAY,
        2
      );

      spreadString = `${spreadPercent}%`;
      spreadValue = `Spread ${spread}`;
    }

    return (
      <>
        <div className="text-xl text-accent text-left col-span-2 my-1 py-1 ml-2">
          {lastPrice}
        </div>

        <div className="flex text-accent justify-end items-center col-span-2 text-sm my-1 py-1 whitespace-nowrap">
          <div className="tooltip tooltip-left" data-tip={spreadValue}>
            <span className="my-auto px-1 border-r-2 border-accent">
              {spreadString}
            </span>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <div className="text-xl text-left col-span-4  border-r-2 border-accent ml-2">
        {lastPrice}
      </div>
    );
  }
}

export function OrderBook() {
  const dispatch = useAppDispatch();
  const token1Symbol = useAppSelector(
    (state) => state.pairSelector.token1.symbol
  );
  const token2Symbol = useAppSelector(
    (state) => state.pairSelector.token2.symbol
  );
  const sells = useAppSelector((state) => state.orderBook.sells);
  const buys = useAppSelector((state) => state.orderBook.buys);
  //const grouping = useAppSelector((state) => state.orderBook.grouping);

  return (
    <div className="p-2 text-sx text-primary-content">
      <div className="grid grid-cols-2 m-1 text-secondary-content font-bold text-sm uppercase">
        <div className="justify-self-start">Order book</div>
        <div className="flex justify-end join">
          <span className="join-item mr-2">Grouping </span>
          <input
            className="input-xs w-16 join-item"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const grouping = Number(event.target.value);
              dispatch(orderBookSlice.actions.setGrouping(grouping));
            }}
          ></input>
        </div>
      </div>
      <div className="sized-columns">
        <div className="sized-columns mx-2 col-span-4 text-sm font-bold text-secondary-content">
          <div className="text-start uppercase text-xs font-medium">
            Order
            <br />
            Count
          </div>
          <div className="text-end uppercase text-xs font-medium">
            Price
            <br />({token2Symbol})
          </div>
          <div className="text-end uppercase text-xs font-medium">
            Size
            <br />({token1Symbol})
          </div>
          <div className="text-end uppercase text-xs font-medium">
            Total
            <br />({token1Symbol})
          </div>
        </div>
      </div>
      <div className="sized-columns mx-2 col-span-4 text-sm">
        {sells.map((props, index) => (
          <OrderBookRow key={"sell-" + index} {...props} />
        ))}

        <CurrentPriceRow />

        {buys.map((props, index) => (
          <OrderBookRow key={"buy-" + index} {...props} />
        ))}
      </div>
    </div>
  );
}
