import { OrderbookLine } from "alphadex-sdk-js";
import {
  OrderBookRowProps,
  toOrderBookRowProps,
  MAX_ROWS,
} from "./orderBookSlice";
function mockOrderBookLine(price: number): OrderbookLine {
  return new OrderbookLine(price, 1, 1, 1);
}

const MOCK_SELLS = [
  mockOrderBookLine(25),
  mockOrderBookLine(24),
  mockOrderBookLine(23),
  mockOrderBookLine(22),
  mockOrderBookLine(21),
  mockOrderBookLine(20),
  mockOrderBookLine(19),
  mockOrderBookLine(18),
  mockOrderBookLine(17),
  mockOrderBookLine(16),
  mockOrderBookLine(15),
  mockOrderBookLine(14),
];

const MOCK_BUYS = [
  mockOrderBookLine(13),
  mockOrderBookLine(12),
  mockOrderBookLine(11),
  mockOrderBookLine(10),
  mockOrderBookLine(9),
  mockOrderBookLine(8),
  mockOrderBookLine(7),
  mockOrderBookLine(6),
  mockOrderBookLine(5),
  mockOrderBookLine(4),
  mockOrderBookLine(3),
  mockOrderBookLine(2),
  mockOrderBookLine(1),
];

describe("toOrderBookRowProps", () => {
  it(`returns 11 rows if the input is empty`, () => {
    const input: OrderbookLine[] = [];

    expect(toOrderBookRowProps(input, "sell", 0).length).toBe(MAX_ROWS);
  });

  it(`returns 11 rows if the input is smaller`, () => {
    const input: OrderbookLine[] = MOCK_SELLS.slice(0, 5);

    expect(toOrderBookRowProps(input, "sell", 0).length).toBe(MAX_ROWS);
  });

  it(`"returns 11 rows if the input is larger"`, () => {
    expect(toOrderBookRowProps(MOCK_SELLS, "sell", 0).length).toBe(MAX_ROWS);
  });

  it("drops the correct farther away rows for sells", () => {
    const expectedSellPrices = [24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14];

    const sellRowProps = toOrderBookRowProps(MOCK_SELLS, "sell", 0);

    sellRowProps.forEach((row: OrderBookRowProps, index: number) => {
      expect(row.price).toBe(expectedSellPrices[index]);
    });
  });

  it("drops the correct farther away rows for buys", () => {
    const expectedBuyPrices = [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3];

    const buyRowProps = toOrderBookRowProps(MOCK_BUYS, "buy", 0);

    buyRowProps.forEach((row: OrderBookRowProps, index: number) => {
      expect(row.price).toBe(expectedBuyPrices[index]);
    });
  });

  it("calculates correct totals", () => {
    const expectedSellTotals = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
    const expectedBuyTotals = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    const sellRowProps = toOrderBookRowProps(MOCK_SELLS, "sell", 0);
    const buyRowProps = toOrderBookRowProps(MOCK_BUYS, "buy", 0);

    sellRowProps.forEach((row: OrderBookRowProps, index: number) => {
      expect(row.total).toBe(expectedSellTotals[index]);
    });

    buyRowProps.forEach((row: OrderBookRowProps, index: number) => {
      expect(row.total).toBe(expectedBuyTotals[index]);
    });
  });

  it("groups the sell rows correctly", () => {
    const expected = [
      { price: undefined, total: undefined },
      { price: undefined, total: undefined },
      { price: undefined, total: undefined },
      { price: undefined, total: undefined },
      { price: undefined, total: undefined },
      { price: undefined, total: undefined },
      { price: undefined, total: undefined },
      { price: 24, total: 12 },
      { price: 21, total: 9 },
      { price: 18, total: 6 },
      { price: 15, total: 3 },
    ];

    const sellRowProps = toOrderBookRowProps(MOCK_SELLS, "sell", 3);

    sellRowProps.forEach((row: OrderBookRowProps, index: number) => {
      expect(row.price).toBe(expected[index].price);
      expect(row.total).toBe(expected[index].total);
    });
  });

  it("groups the buy rows correctly", () => {
    const expected = [
      { price: 12, total: 3 },
      { price: 9, total: 6 },
      { price: 6, total: 9 },
      { price: 3, total: 12 },
      { price: undefined, total: undefined },
      { price: undefined, total: undefined },
      { price: undefined, total: undefined },
      { price: undefined, total: undefined },
      { price: undefined, total: undefined },
      { price: undefined, total: undefined },
      { price: undefined, total: undefined },
    ];

    const buyRowProps = toOrderBookRowProps(MOCK_BUYS, "buy", 3);

    buyRowProps.forEach((row: OrderBookRowProps, index: number) => {
      expect(row.price).toBe(expected[index].price);
      expect(row.total).toBe(expected[index].total);
    });
  });
});
