import { simpleFormatNumber } from "./simpleFormatNumber";

describe("simpleFormatNumber", () => {
  test("should format numbers without decimals when not needed", () => {
    expect(simpleFormatNumber(999)).toBe("999");
    expect(simpleFormatNumber(1000)).toBe("1K");
    expect(simpleFormatNumber(999999)).toBe("1M");
    expect(simpleFormatNumber(999999999)).toBe("1B");
  });

  test("should format numbers with decimal places and roundsup correctly", () => {
    expect(simpleFormatNumber(999.9)).toBe("999,9");
    expect(simpleFormatNumber(999.99)).toBe("1K");
    expect(simpleFormatNumber(1500)).toBe("1,5K");
    expect(simpleFormatNumber(999999.9)).toBe("1M");
    expect(simpleFormatNumber(999999999.9)).toBe("1B");
  });

  test("should not display decimals if they are zero", () => {
    expect(simpleFormatNumber(1000.0)).toBe("1K");
  });

  test("should handle edge cases with small numbers", () => {
    expect(simpleFormatNumber(0)).toBe("0");
  });

  test("should handle very large numbers", () => {
    expect(simpleFormatNumber(1e12)).toBe("1T");
  });

  test("should handle custom maximumFractionDigits", () => {
    expect(simpleFormatNumber(999.99, 2)).toBe("999,99");
    expect(simpleFormatNumber(999.999, 3)).toBe("999,999");
    expect(simpleFormatNumber(849.999, 3)).toBe("849,999");
  });
});
