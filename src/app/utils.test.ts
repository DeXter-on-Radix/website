import { displayNumber, truncateWithPrecision } from "./utils";

// the separators are set to "." and " " for testing purposes
// inside jest.setup.js
describe("displayAmount", () => {
  it("sends error message if noDigits is less than 4", () => {
    let digits = 3;
    const inputs: [number, string][] = [
      [1234, "ERROR: displayAmount cannot work with noDigits less than 4"],
    ];

    inputs.forEach(([input, expected]) => {
      expect(displayNumber(input, digits)).toBe(expected);
    });
    digits = 0;
    inputs.forEach(([input, expected]) => {
      expect(displayNumber(input, digits)).toBe(expected);
    });
    digits = -3;
    inputs.forEach(([input, expected]) => {
      expect(displayNumber(input, digits)).toBe(expected);
    });
    digits = -10;
    inputs.forEach(([input, expected]) => {
      expect(displayNumber(input, digits)).toBe(expected);
    });
  });

  it("displays amounts in 4 digits", () => {
    const digits = 4;
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
      expect(displayNumber(input, digits)).toBe(expected);
    });
  });

  it("displays amounts in 6 digits", () => {
    const digits = 6;
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
      [50.3, "50.3"],
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
      expect(displayNumber(input, digits, -1)).toBe(expected);
    });
  });

  it("displays amounts in 10 digits", () => {
    const digits = 10;
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
      expect(displayNumber(input, digits, -1)).toBe(expected);
    });
  });

  it("displays amounts in 6 digits with fixed decimals = 3", () => {
    const digits = 6;
    const inputs: [number, string][] = [
      [0, "0.000"],
      [0.1, "0.100"],
      [0.12, "0.120"],
      [0.123, "0.123"],
      [0.1234, "0.123"],
      [0.123456, "0.123"],
      [0.1234567, "0.123"],
      [0.12345678, "0.123"],
      [0.123456789, "0.123"],
      [1.1234567, "1.123"],
      [1.12345678, "1.123"],
      [1.123456789, "1.123"],
      [1.100000001, "1.100"],
      [12.123456789, "12.123"],
      [123.123456789, "123.12"],
      [1234.123456789, "1 234"],
      [1, "1.000"],
      [12, "12.000"],
      [123, "123.00"],
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
      expect(displayNumber(input, digits, 3)).toBe(expected);
    });
  });

  it("displays amounts in 10 digits with fixed decimals = 3", () => {
    const digits = 10;
    const inputs: [number, string][] = [
      [0, "0.000"],
      [0.1, "0.100"],
      [0.12, "0.120"],
      [0.123, "0.123"],
      [0.1234, "0.123"],
      [0.123456, "0.123"],
      [0.1234567, "0.123"],
      [0.12345678, "0.123"],
      [0.123456789, "0.123"],
      [1.1234567, "1.123"],
      [1.12345678, "1.123"],
      [1.123456789, "1.123"],
      [1.100000001, "1.100"],
      [12.123456789, "12.123"],
      [123.123456789, "123.123"],
      [1234.123456789, "1 234.123"],
      [1, "1.000"],
      [12, "12.000"],
      [123, "123.000"],
      [1234, "1 234.000"],
      [1356, "1 356.000"],
      [34567, "34 567.000"],
      [123456, "123 456.00"],
      [1234567, "1 234 567"],
      [12345678, "12 345 678"],
      [123456789, "123 456.7K"],
      [1234567890, "1 234 567K"],
      [12345678901, "12 345.67M"],
    ];

    inputs.forEach(([input, expected]) => {
      expect(displayNumber(input, digits, 3)).toBe(expected);
    });
  });
});

describe("truncateWithPrecision", () => {
  it("ignores integer values", () => {
    expect(truncateWithPrecision(1, 12)).toBe(1);
    expect(truncateWithPrecision(-121, 0)).toBe(-121);
  });
  it("works for positive and negative numbers", () => {
    expect(truncateWithPrecision(1.12345, 2)).toBe(1.12);
    expect(truncateWithPrecision(-121.12345, 3)).toBe(-121.123);
  });
  it("doesnt round", () => {
    expect(truncateWithPrecision(1.1216, 3)).toBe(1.121);
    expect(truncateWithPrecision(1.1211, 3)).toBe(1.121);
  });
});
