import { describe, it, expect } from "vitest";
import { Calculator } from "./Calculator"; // Adjust the import path as necessary

describe("Calculator", () => {
  it("should perform basic operations", () => {
    // ADDITION
    expect(Calculator.add(10, 2)).toBe(12);
    expect(Calculator.add(-5, 12)).toBe(7);
    // SUBTRACTION
    expect(Calculator.subtract(10, 1)).toBe(9);
    expect(Calculator.subtract(11230, 189022)).toBe(11230 - 189022);
    // MULTIPLICATION
    expect(Calculator.multiply(5, 4)).toBe(20);
    expect(Calculator.multiply(3, 2.5)).toBe(7.5);
    // DIVISION
    expect(Calculator.divide(300, 2.5)).toBe(120);
    expect(Calculator.divide(0.5, 10)).toBe(0.05);
  });

  it("should fix floating point error in addition", () => {
    expect(Calculator.add(0.1, 0.2)).toBe(0.3); // => 0.1 + 0.2 = 0.30000000000000004
  });

  it("should fix floating point error in subtraction", () => {
    expect(Calculator.subtract(1, 0.9)).toBe(0.1); // => 1 - 0.9 = 0.09999999999999998
  });

  it("should fix floating point error in multiplication", () => {
    expect(Calculator.multiply(0.1, 0.2)).toBe(0.02); // => 0.1 * 0.2 = 0.020000000000000004
    expect(Calculator.multiply(1.65, 12)).toBe(19.8); // => 1.65 * 12 = 19.799999999
  });

  it("should fix floating point error in division", () => {
    expect(Calculator.divide(Calculator.multiply(0.1, 0.2), 0.02)).toBe(1); // => 0.1 * 0.2 / 0.02 = 1.0000000000000002
  });
});
