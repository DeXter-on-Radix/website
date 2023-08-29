import { displayAmount, displayNumber } from "../src/app/utils";

describe("displayAmount", () => {
  it("sends error message if noDigits is less than 4", () => {
    let digits = 3;
    const decimalSeparator = ".";
    const thousandsSeparator = " ";
    const inputs: [number, string][] = [
      [1234, "ERROR: displayAmount cannot work with noDigits less than 4"],
    ];

    inputs.forEach(([input, expected]) => {
      expect(
        displayAmount(input, digits, decimalSeparator, thousandsSeparator)
      ).toBe(expected);
    });
    digits = 0;
    inputs.forEach(([input, expected]) => {
      expect(
        displayAmount(input, digits, decimalSeparator, thousandsSeparator)
      ).toBe(expected);
    });
    digits = -3;
    inputs.forEach(([input, expected]) => {
      expect(
        displayAmount(input, digits, decimalSeparator, thousandsSeparator)
      ).toBe(expected);
    });
    digits = -10;
    inputs.forEach(([input, expected]) => {
      expect(
        displayAmount(input, digits, decimalSeparator, thousandsSeparator)
      ).toBe(expected);
    });
  });

  it("displays amounts in 4 digits with thousands_separator", () => {
    const digits = 4;
    const decimalSeparator = ".";
    const thousandsSeparator = " ";
    const inputs: [number, string][] = [
      [0, "0"],
      [0.1, "0.1"],
      [0.12, "0.12"],
      [0.123, "0.12"],
      [0.1234, "0.12"],
      [0.123456, "0.12"],
      [0.1234567, "0.12"],
      [0.12345678, "0.12"],
      [0.123456789, "0.12"],
      [1.1234567, "1.12"],
      [12.1234567, "12.1"],
      [123.1234567, "123"],
      [1234.1234567, "1.2K"],
      [1, "1"],
      [12, "12"],
      [123, "123"],
      [1234, "1.2K"],
      [1356, "1.3K"],
      [34567, "34K"],
      [123456, "123K"],
      [1234567, "1.2M"],
      [12345678, "12M"],
      [123456789, "123M"],
      [1234567890, "1.2B"],
    ];

    inputs.forEach(([input, expected]) => {
      expect(
        displayAmount(input, digits, decimalSeparator, thousandsSeparator)
      ).toBe(expected);
    });
  });

  it("displays amounts in 4 digits without thousands_separator", () => {
    const digits = 4;
    const decimalSeparator = ".";
    const thousandsSeparator = "";
    const inputs: [number, string][] = [
      [0, "0"],
      [0.1, "0.1"],
      [0.101, "0.1"],
      [0.12, "0.12"],
      [0.123, "0.12"],
      [0.1234, "0.12"],
      [0.123456, "0.12"],
      [0.1234567, "0.12"],
      [0.12345678, "0.12"],
      [0.123456789, "0.12"],
      [1.101, "1.1"],
      [1.1234567, "1.12"],
      [12.1234567, "12.1"],
      [123.1234567, "123"],
      [1234.1234567, "1234"],
      [1, "1"],
      [12, "12"],
      [123, "123"],
      [1234, "1234"],
      [1356, "1356"],
      [34567, "34K"],
      [123456, "123K"],
      [1234567, "1.2M"],
      [12345678, "12M"],
      [123456789, "123M"],
      [1234567890, "1.2B"],
    ];

    inputs.forEach(([input, expected]) => {
      expect(
        displayAmount(input, digits, decimalSeparator, thousandsSeparator)
      ).toBe(expected);
    });
  });

  it("displays amounts in 6 digits with thousands_separator", () => {
    const digits = 6;
    const decimalSeparator = ".";
    const thousandsSeparator = " ";
    const inputs: [number, string][] = [
      [0, "0"],
      [0.1, "0.1"],
      [0.12, "0.12"],
      [0.123, "0.123"],
      [0.1234, "0.1234"],
      [0.123456, "0.1234"],
      [0.1234567, "0.1234"],
      [0.12345678, "0.1234"],
      [0.123456789, "0.1234"],
      [1.1234567, "1.1234"],
      [1.10001, "1.1"],
      [12.1234567, "12.123"],
      [123.1234567, "123.12"],
      [1234.1234567, "1 234"],
      [1, "1"],
      [12, "12"],
      [123, "123"],
      [1234, "1 234"],
      [1356, "1 356"],
      [34567, "34 567"],
      [123456, "123.4K"],
      [1234567, "1 234K"],
      [12345678, "12.34M"],
      [123456789, "123.4M"],
      [1234567890, "1 234M"],
      [12345678901, "12.34B"],
    ];

    inputs.forEach(([input, expected]) => {
      expect(
        displayAmount(input, digits, decimalSeparator, thousandsSeparator)
      ).toBe(expected);
    });
  });

  it("displays amounts in 10 digits with thousands_separator", () => {
    const digits = 10;
    const decimalSeparator = ".";
    const thousandsSeparator = " ";
    const inputs: [number, string][] = [
      [0, "0"],
      [0.1, "0.1"],
      [0.12, "0.12"],
      [0.123, "0.123"],
      [0.1234, "0.1234"],
      [0.123456, "0.123456"],
      [0.1234567, "0.1234567"],
      [0.12345678, "0.12345678"],
      [0.123456789, "0.12345678"],
      [1.1234567, "1.1234567"],
      [1.12345678, "1.12345678"],
      [1.123456789, "1.12345678"],
      [1.100000001, "1.1"],
      [12.123456789, "12.1234567"],
      [123.123456789, "123.123456"],
      [1234.123456789, "1 234.1234"],
      [1, "1"],
      [12, "12"],
      [123, "123"],
      [1234, "1 234"],
      [1356, "1 356"],
      [34567, "34 567"],
      [123456, "123 456"],
      [1234567, "1 234 567"],
      [12345678, "12 345 678"],
      [123456789, "123 456.7K"],
      [1234567890, "1 234 567K"],
      [12345678901, "12 345.67M"],
    ];

    inputs.forEach(([input, expected]) => {
      expect(
        displayAmount(input, digits, decimalSeparator, thousandsSeparator)
      ).toBe(expected);
    });
  });
});

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
