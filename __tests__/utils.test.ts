import { displayNumber } from "../src/app/utils";

describe("displayNumber", () => {
  it("formats all numbers to fixed decimal places", () => {
    const inputs = [99.95, 88, 77.7, 1000000.1, 0.03, 0.000004, 0.1];
    const expected = [
      "99.950",
      "88.000",
      "77.700",
      "1.00M",
      "0.030",
      "0.000",
      "0.100",
    ];

    inputs.forEach((input, index) => {
      expect(displayNumber(input, 3, true)).toBe(expected[index]);
    });
  });
});
