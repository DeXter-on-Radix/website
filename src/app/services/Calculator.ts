import Big from "big.js";

/**
 * Converts a Big object to a native JavaScript number.
 * @param {Big} big - The Big.js object to convert.
 * @return {number} - The numeric representation of the Big.js object.
 */
function big2num(big: Big): number {
  return Number(big.toString());
}

/**
 * A Calculator class for performing arithmetic operations with high precision,
 * leveraging the Big.js library to avoid floating-point errors.
 */
export class Calculator {
  /**
   * Accurately divides one number by another.
   * @param {number} dividend - The number to be divided.
   * @param {number} divisor - The number by which to divide.
   * @return {number} - The division result.
   * @throws {Error} When attempting to divide by zero.
   */
  static divide(dividend: number, divisor: number): number {
    if (divisor === 0) throw new Error("Cannot divide by zero.");
    return big2num(new Big(dividend).div(divisor));
  }

  /**
   * Accurately multiplies two numbers.
   * @param {number} multiplicand - The first number in the multiplication.
   * @param {number} multiplier - The second number in the multiplication.
   * @return {number} - The product of the multiplication.
   */
  static multiply(multiplicand: number, multiplier: number): number {
    return big2num(new Big(multiplicand).mul(multiplier));
  }

  /**
   * Accurately adds two numbers.
   * @param {number} addend1 - The first number to add.
   * @param {number} addend2 - The second number to add.
   * @return {number} - The sum of the addition.
   */
  static add(addend1: number, addend2: number): number {
    return big2num(new Big(addend1).plus(addend2));
  }

  /**
   * Accurately subtracts one number from another.
   * @param {number} minuend - The number from which to subtract.
   * @param {number} subtrahend - The number to be subtracted.
   * @return {number} - The difference resulting from the subtraction.
   */
  static subtract(minuend: number, subtrahend: number): number {
    return big2num(new Big(minuend).minus(subtrahend));
  }
}
