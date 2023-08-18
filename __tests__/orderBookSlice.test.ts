import { OrderbookLine } from "alphadex-sdk-js";
import {
  OrderBookRowProps,
  toOrderBookRowProps,
} from "../src/app/redux/orderBookSlice";

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
  it("returns 8 rows if the input is empty", () => {
    const input: OrderbookLine[] = [];

    expect(toOrderBookRowProps(input, "sell").length).toBe(8);
  });

  it("returns 8 rows if the input is smaller", () => {
    const input: OrderbookLine[] = MOCK_SELLS.slice(0, 5);

    expect(toOrderBookRowProps(input, "sell").length).toBe(8);
  });

  it("returns 8 rows if the input is larger", () => {
    expect(toOrderBookRowProps(MOCK_SELLS, "sell").length).toBe(8);
  });

  it("drops the correct farther away rows for sells", () => {
    const expectedSellPrices = [18, 17, 16, 15, 14, 13, 12, 11];

    const sellRowProps = toOrderBookRowProps(MOCK_SELLS, "sell");

    sellRowProps.forEach((row: OrderBookRowProps, index: number) => {
      expect(row.price).toBe(expectedSellPrices[index]);
    });
  });

  it("drops the correct farther away rows for buys", () => {
    const expectedBuyPrices = [10, 9, 8, 7, 6, 5, 4, 3];

    const buyRowProps = toOrderBookRowProps(MOCK_BUYS, "buy");

    buyRowProps.forEach((row: OrderBookRowProps, index: number) => {
      expect(row.price).toBe(expectedBuyPrices[index]);
    });
  });

  it("calculates correct totals", () => {
    const expectedSellTotals = [8, 7, 6, 5, 4, 3, 2, 1];
    const expectedBuyTotals = [1, 2, 3, 4, 5, 6, 7, 8];

    const sellRowProps = toOrderBookRowProps(MOCK_SELLS, "sell");
    const buyRowProps = toOrderBookRowProps(MOCK_BUYS, "buy");

    sellRowProps.forEach((row: OrderBookRowProps, index: number) => {
      expect(row.total).toBe(expectedSellTotals[index]);
    });

    buyRowProps.forEach((row: OrderBookRowProps, index: number) => {
      expect(row.total).toBe(expectedBuyTotals[index]);
    });
  });
});
