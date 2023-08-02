import { OrderbookLine } from "alphadex-sdk-js";
import { OrderBookRowProps, toOrderBookRowProps } from "../src/app/OrderBook";

const MOCK_SELLS = [
  new OrderbookLine(20, 1, 1, 1, 1, false),
  new OrderbookLine(19, 1, 1, 1, 1, false),
  new OrderbookLine(18, 1, 1, 1, 1, false),
  new OrderbookLine(17, 1, 1, 1, 1, false),
  new OrderbookLine(16, 1, 1, 1, 1, false),
  new OrderbookLine(15, 1, 1, 1, 1, false),
  new OrderbookLine(14, 1, 1, 1, 1, false),
  new OrderbookLine(13, 1, 1, 1, 1, false),
  new OrderbookLine(12, 1, 1, 1, 1, false),
  new OrderbookLine(11, 1, 1, 1, 1, false),
];

const MOCK_BUYS = [
  new OrderbookLine(10, 1, 1, 1, 1, false),
  new OrderbookLine(9, 1, 1, 1, 1, false),
  new OrderbookLine(8, 1, 1, 1, 1, false),
  new OrderbookLine(7, 1, 1, 1, 1, false),
  new OrderbookLine(6, 1, 1, 1, 1, false),
  new OrderbookLine(5, 1, 1, 1, 1, false),
  new OrderbookLine(4, 1, 1, 1, 1, false),
  new OrderbookLine(3, 1, 1, 1, 1, false),
  new OrderbookLine(2, 1, 1, 1, 1, false),
  new OrderbookLine(1, 1, 1, 1, 1, false),
];

describe("toOrderBookRowProps", () => {
  it("returns 8 rows if the input is smaller", () => {
    const input: OrderbookLine[] = [];

    expect(toOrderBookRowProps(input, "sell", 1, 1).length).toBe(8);
  });

  it("returns 8 rows if the input is larger", () => {
    const input: OrderbookLine[] = [];
    for (let i = 0; i < 100; i++) {
      input.push(new OrderbookLine(i, i, i, i, i, false));
    }

    expect(toOrderBookRowProps(input, "sell", 1, 1).length).toBe(8);
  });

  it("drops the correct farther away rows for sells", () => {
    const expectedSellPrices = ["18", "17", "16", "15", "14", "13", "12", "11"];

    const sellRowProps = toOrderBookRowProps(MOCK_SELLS, "sell", 0, 0);

    sellRowProps.forEach((row: OrderBookRowProps, index: number) => {
      expect(row.price).toBe(expectedSellPrices[index]);
    });
  });

  it("drops the correct farther away rows for buys", () => {
    const expectedBuyPrices = ["10", "9", "8", "7", "6", "5", "4", "3"];

    const buyRowProps = toOrderBookRowProps(MOCK_BUYS, "buy", 0, 0);

    buyRowProps.forEach((row: OrderBookRowProps, index: number) => {
      expect(row.price).toBe(expectedBuyPrices[index]);
    });
  });

  it("calculates correct totals", () => {
    const expectedSellTotals = ["8", "7", "6", "5", "4", "3", "2", "1"];
    const expectedBuyTotals = ["1", "2", "3", "4", "5", "6", "7", "8"];

    const sellRowProps = toOrderBookRowProps(MOCK_SELLS, "sell", 0, 0);
    const buyRowProps = toOrderBookRowProps(MOCK_BUYS, "buy", 0, 0);

    sellRowProps.forEach((row: OrderBookRowProps, index: number) => {
      expect(row.total).toBe(expectedSellTotals[index]);
    });

    buyRowProps.forEach((row: OrderBookRowProps, index: number) => {
      expect(row.total).toBe(expectedBuyTotals[index]);
    });
  });
});
