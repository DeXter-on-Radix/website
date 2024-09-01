import {
  displayNumber,
  formatNumericString,
  truncateWithPrecision,
  toFixedRoundDown,
  shortenWalletAddress,
} from "./utils";

import { searchPairs } from "./utils";

// the separators are set to "." and " " for testing purposes
// inside jest.setup.js
describe("displayAmount", () => {
  it("sends error message if nbrOfDigits is less than 4", () => {
    let digits = 3;
    const inputs: [number, string][] = [
      [1234, "ERROR: displayAmount cannot work with nbrOfDigits less than 4"],
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

describe("formatNumericString", () => {
  it("doesnt apply any change to integers", () => {
    {
      const result = formatNumericString("1234567890", ".", 2);
      expect(result).toBe("1234567890");
    }
    {
      const result = formatNumericString("12", ",", 10);
      expect(result).toBe("12");
    }
  });

  it("allows a trailing separator (to ensure user can input comma separated values)", () => {
    expect(formatNumericString("1234.", ".", 2)).toBe("1234.");
    expect(formatNumericString("1234,", ",", 0)).toBe("1234,");
  });

  it("allows single separator as input (so the user can input '.1' to express '0.1')", () => {
    const result = formatNumericString(".", ".", 2);
    expect(result).toBe(".");
  });

  it("removes extra separators and enforces scale", () => {
    const result = formatNumericString("1234.5678.", ".", 2);
    expect(result).toBe("1234.56");
  });

  it("does NOT add trailing zeros", () => {
    const result = formatNumericString("432.23", ".", 6);
    expect(result).toBe("432.23");
  });

  it("filters out invalid characters", () => {
    const result = formatNumericString("1a2b3c4d5e", ",", 3);
    expect(result).toBe("12345");
  });

  it("enforces scale limits correctly without rounding", () => {
    expect(formatNumericString("1234.56789", ".", 3)).toBe("1234.567");
    expect(formatNumericString("1234,5678901234", ",", 1)).toBe("1234,5");
  });
});

describe("toFixedRoundDown", () => {
  it("should handle numbers without decimal part", () => {
    const result = toFixedRoundDown(1234567890, 2);
    expect(result).toBe(1234567890);
  });

  it("should handle zero decimal places", () => {
    const result = toFixedRoundDown(123.456, 0);
    expect(result).toBe(123);
  });

  it("should truncate correctly without rounding", () => {
    const result = toFixedRoundDown(123.456789, 2);
    expect(result).toBe(123.45);
  });

  it("should handle numbers with fewer decimal places than required", () => {
    const result = toFixedRoundDown(123.4, 2);
    expect(result).toBe(123.4);
  });

  it("should handle numbers with exactly the required decimal places", () => {
    const result = toFixedRoundDown(123.45, 2);
    expect(result).toBe(123.45);
  });

  it("should handle negative numbers correctly", () => {
    const result = toFixedRoundDown(-123.456789, 2);
    expect(result).toBe(-123.45);
  });

  it("should handle very small numbers correctly", () => {
    const result = toFixedRoundDown(0.000127456, 5);
    expect(result).toBe(0.00012);
  });

  it("should handle whole numbers", () => {
    const result = toFixedRoundDown(123, 2);
    expect(result).toBe(123);
  });

  it("should handle zero correctly", () => {
    const result = toFixedRoundDown(0, 2);
    expect(result).toBe(0);
  });

  it("should throw for negative precision", () => {
    expect(() => toFixedRoundDown(0, -2)).toThrow(
      "Precision cannot be negative"
    );
  });
});

describe("shortenWalletAddress", () => {
  it("should return the same address if the length is less than 35 characters", () => {
    const shortAddress = "abc123";
    const result = shortenWalletAddress(shortAddress);
    expect(result).toBe(shortAddress);
  });

  it("should shorten the address correctly", () => {
    const address =
      "account_rdx128j46ndap3fvlkdg6llzja9qteamr8ve89cjjyyekh2gggfpw34yxq";
    const expectedShortened = "account_...cjjyyekh2gggfpw34yxq";
    const result = shortenWalletAddress(address);
    expect(result).toBe(expectedShortened);
  });
});

describe("searchPairs", () => {
  const pairsList: any = [
    {
      name: "DEXTR/XRD",
      token1: {
        name: "Dexter",
        symbol: "DEXTR",
      },
      token2: {
        name: "Radix",
        symbol: "XRD",
      },
    },
    {
      name: "ADEX/XRD",
      token1: {
        name: "Adex",
        symbol: "ADEX",
      },
      token2: {
        name: "Radix",
        symbol: "XRD",
      },
    },
    {
      name: "CUPPA/XRD",
      token1: {
        name: "Cuppa",
        symbol: "CUPPA",
      },
      token2: {
        name: "Radix",
        symbol: "XRD",
      },
    },
  ];

  test("should find pairs by full name", () => {
    const result = searchPairs("DEXTR/XRD", pairsList);
    expect(result).toEqual([
      {
        name: "DEXTR/XRD",
        token1: {
          name: "Dexter",
          symbol: "DEXTR",
        },
        token2: {
          name: "Radix",
          symbol: "XRD",
        },
      },
    ]);
  });

  test("should find pairs by symbol", () => {
    const result = searchPairs("DEXTR", pairsList);
    expect(result).toEqual([
      {
        name: "DEXTR/XRD",
        token1: {
          name: "Dexter",
          symbol: "DEXTR",
        },
        token2: {
          name: "Radix",
          symbol: "XRD",
        },
      },
    ]);
  });

  test("should find pairs by symbol and full name with different case", () => {
    const result = searchPairs("cupPa", pairsList);
    expect(result).toEqual([
      {
        name: "CUPPA/XRD",
        token1: {
          name: "Cuppa",
          symbol: "CUPPA",
        },
        token2: {
          name: "Radix",
          symbol: "XRD",
        },
      },
    ]);
  });

  test("should find pairs with space as delimiter", () => {
    const result = searchPairs("DEXTR XRD", pairsList);
    expect(result).toEqual([
      {
        name: "DEXTR/XRD",
        token1: {
          name: "Dexter",
          symbol: "DEXTR",
        },
        token2: {
          name: "Radix",
          symbol: "XRD",
        },
      },
    ]);
  });

  test("should find pairs with swapped order of tokens", () => {
    const result = searchPairs("XRD DEXTR", pairsList);
    expect(result).toEqual([
      {
        name: "DEXTR/XRD",
        token1: {
          name: "Dexter",
          symbol: "DEXTR",
        },
        token2: {
          name: "Radix",
          symbol: "XRD",
        },
      },
    ]);
  });

  test("should handle minimal typos", () => {
    const result = searchPairs("D3XTR", pairsList);
    expect(result).toEqual([
      {
        name: "DEXTR/XRD",
        token1: {
          name: "Dexter",
          symbol: "DEXTR",
        },
        token2: {
          name: "Radix",
          symbol: "XRD",
        },
      },
    ]);
  });

  test("should return an empty array if no matches are found", () => {
    const result = searchPairs("XYZ", pairsList);
    expect(result).toEqual([]);
  });
});
