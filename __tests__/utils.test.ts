import { displayNumber } from "../src/app/utils";

describe("displayNumber", () => {
  it("formats all numbers to fixed decimal places", () => {
    const inputs = [
      1002, 1248, 99.95, 88, 77.7, 1000000.1, 0.03, 0.000004, 0.1,
    ];
    const expected = [
      "1K",
      "1.25K",
      "99.95000",
      "88.00000",
      "77.70000",
      "1M",
      "0.03000",
      "0.00000",
      "0.10000",
    ];

    inputs.forEach((input, index) => {
      expect(displayNumber(input, 5)).toBe(expected[index]);
    });
  });

  it("rounds decimals correctly", () => {
    const inputs = [0.233, 0.235];
    const expected = ["0.23", "0.24"];

    inputs.forEach((input, index) => {
      expect(displayNumber(input, 2)).toBe(expected[index]);
    });
  });
});
