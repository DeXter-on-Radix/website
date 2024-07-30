/**
 * Formats a number into a compact representation with optional decimal places.
 *
 * The function uses compact notation to represent large numbers in a more readable format,
 * such as converting 1,000 to "1K" or 1,000,000 to "1M". It also supports customizing the
 * number of decimal places displayed.
 * The decimal point is replaced with a comma in the output.
 *
 * @param {number} num - The number to format.
 * @param {number} [maxDigit=1] - The maximum number of decimal places to display. Defaults to 1.
 * @returns {string} The formatted number as a string.
 */
export function simpleFormatNumber(num: number, maxDigit: number = 1): string {
  const formatter = new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: maxDigit,
  });
  return formatter.format(num).replaceAll(".", ",");
}
