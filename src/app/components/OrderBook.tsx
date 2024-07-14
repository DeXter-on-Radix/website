import { CSSProperties, useState } from "react";

import "../styles/orderbook.css";
import * as utils from "../utils";
import { OrderBookRowProps, orderBookSlice } from "../state/orderBookSlice";
import { useAppDispatch, useAppSelector, useTranslations } from "../hooks";
import { Calculator } from "services/Calculator";

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
      zIndex: 0,
    } as CSSProperties;

    return (
      <div className="relative col-span-4 sized-columns text-xs pb-1 py-0.5 ">
        <div style={barStyle}></div>
        <div className="order-cell text-start z-10 ml-2 truncate">
          {orderCount}
        </div>
        <div className="order-cell text-end z-10 truncate">{priceString}</div>
        <div className="order-cell text-end z-10 truncate">{sizeString}</div>
        <div className="order-cell text-end z-10 truncate mr-2">
          {totalString}
        </div>
      </div>
    );
  }

  // otherwise we don't have data to display
  return <div className="text-center col-span-4">{props.absentOrders}</div>;
}

function CurrentPriceRow() {
  const t = useTranslations();
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
    lastPrice = t("no_trades_have_occured_yet");
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
        <div className="text-sm text-accent font-bold text-left col-span-2 my-1 py-1 ml-2">
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

enum OrderBookTabOptions {
  ORDER_BOOK = "ORDER_BOOK",
  RECENT_TRADES = "RECENT_TRADES",
}

export function OrderBook() {
  const t = useTranslations();
  const [currentTab, setCurrentTab] = useState(OrderBookTabOptions.ORDER_BOOK);

  return (
    <div className="h-[700px]">
      <div className="flex space-x-5 p-4">
        {[
          [t("order_book"), OrderBookTabOptions.ORDER_BOOK],
          [t("recent_trades"), OrderBookTabOptions.RECENT_TRADES],
        ].map(([title, tab], indx) => {
          const isActive = tab === currentTab;
          return (
            <div
              key={indx}
              className={`text-base p-2 ${
                isActive
                  ? "text-dexter-green-OG border-b border-[#cafc40]"
                  : "text-[#768089]"
              } cursor-pointer`}
              onClick={() => setCurrentTab(tab as OrderBookTabOptions)}
            >
              {title}
            </div>
          );
        })}
      </div>
      <div>
        {currentTab === OrderBookTabOptions.ORDER_BOOK && <OrderBookTab />}
        {currentTab === OrderBookTabOptions.RECENT_TRADES && (
          <RecentTradesTab />
        )}
      </div>
    </div>
  );
}

export function OrderBookTab() {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const token1Symbol = useAppSelector(
    (state) => state.pairSelector.token1.symbol
  );
  const token2Symbol = useAppSelector(
    (state) => state.pairSelector.token2.symbol
  );
  const sells = useAppSelector((state) => state.orderBook.sells);
  const buys = useAppSelector((state) => state.orderBook.buys);

  return (
    <div className="p-2 !pt-0 text-sx text-primary-content">
      <div className="grid grid-cols-2 m-1 text-secondary-content text-sm">
        <div className="justify-self-start"></div>
        <div className="flex justify-end join">
          <span className="join-item mr-2">{t("grouping")} </span>
          <input
            className="input-xs w-16 join-item !bg-[#222629] !rounded"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const grouping = Number(event.target.value);
              dispatch(orderBookSlice.actions.setGrouping(grouping));
            }}
          ></input>
        </div>
      </div>
      <div className="sized-columns">
        <div className="sized-columns mx-2 col-span-4 text-sm font-bold text-secondary-content uppercase">
          <div className="text-start uppercase text-xs font-medium">
            {t("order_count")}
          </div>
          <div className="text-end uppercase text-xs font-medium">
            {t("price")}
            <br />({token2Symbol})
          </div>
          <div className="text-end uppercase text-xs font-medium">
            {t("size")}
            <br />({token1Symbol})
          </div>
          <div className="text-end uppercase text-xs font-medium">
            {t("total")}
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

function RecentTradesTab() {
  const t = useTranslations();
  const { recentTrades } = useAppSelector((state) => state.orderBook);
  const lastTrades = recentTrades.slice(0, 34);
  const { token1, token2 } = useAppSelector((state) => state.pairSelector);
  return (
    <div>
      <table className="table-auto mb-4 !mt-2">
        <thead className="border-b-0 text-secondary-content uppercase align-top">
          <tr className="text-xs">
            <td className="pl-4">
              {t("price")}
              <br />({token2.symbol})
            </td>
            <td className="text-right">
              {t("amount")} <br />({token1.symbol})
            </td>
            <td className="pl-8">{t("time")}</td>
          </tr>
        </thead>

        {lastTrades.map((trade, indx) => {
          const price = Calculator.divide(
            trade.token2Amount,
            trade.token1Amount
          );
          const time = trade.timestamp.split("T").join(" ").split(":00.")[0];
          const amount = Math.round(trade.token1Amount);
          return (
            <RecentTradeRow
              key={indx}
              price={price}
              side={trade.side}
              time={time}
              amount={amount}
            />
          );
        })}
      </table>
    </div>
  );
}

function RecentTradeRow({
  price,
  side,
  time,
  amount,
}: {
  price: number;
  side: string;
  time: string;
  amount: number;
}) {
  return (
    <tr className="text-xs">
      <td
        className={`${
          side === "BUY" ? "text-dexter-green" : "text-dexter-red"
        } pl-4`}
      >
        {price.toFixed(4)}
      </td>
      <td className="text-right">{amount.toLocaleString("en")}</td>
      <td className="pl-8">{time}</td>
    </tr>
  );
}
