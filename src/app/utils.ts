// utiluty function to display numbers in a fixed format

export function displayPositiveNumber(x: number, decimals: number): string {
  // the same as with displayNumber, but if the number is negative, it will return empty string
  if (x < 0) {
    return "";
  } else {
    return displayNumber(x, decimals);
  }
}

export function displayAmount(
  x: number,
  noDigits: number = 6,
  decimalSeparator: string = ".",
  thousandsSeparator: string = " "
): string {
  if (noDigits < 4) {
    return "ERROR: displayAmount cannot work with noDigits less than 4";
  }
  if (decimalSeparator == "") {
    return 'ERROR: desiplayAmount decimalSeparator cannot be ""';
  }
  if (x < 1) {
    return roundTo(x, noDigits - 2, RoundType.DOWN).toString();
  }
  let numberStr = x.toString();
  let wholeNumber = Math.trunc(x);
  let wholeNumberStr = wholeNumber.toString();
  let numberOfSeparators = Math.trunc((wholeNumberStr.length - 1) / 3);
  if (thousandsSeparator != "" && numberOfSeparators > 0) {
    let firstSeparator = wholeNumberStr.length % 3;
    if (firstSeparator == 0) {
      firstSeparator = 3;
    }
    let lastSeparator = firstSeparator + 3 * (numberOfSeparators - 1);
    for (let i = lastSeparator; i > 0; i = i - 3) {
      wholeNumberStr =
        wholeNumberStr.slice(0, i) +
        thousandsSeparator +
        wholeNumberStr.slice(i);
    }
    // console.log("WholeNumberStr: " + wholeNumberStr);
  }
  if (
    wholeNumberStr.length === noDigits ||
    wholeNumberStr.length === noDigits - 1
  ) {
    return wholeNumberStr;
  } else {
    if (wholeNumberStr.length < noDigits) {
      const noDecimals = noDigits - wholeNumberStr.length;
      let decimalsStr = numberStr.split(".")[1];
      decimalsStr = decimalsStr
        ? decimalsStr.substring(0, noDecimals - 1).replace(/0+$/, "")
        : "";
      if (decimalsStr) {
        decimalsStr = decimalSeparator + decimalsStr;
      }
      return wholeNumberStr + decimalsStr;
    } else {
      let excessLength = wholeNumberStr.length - noDigits + 1;
      let excessRemainder =
        thousandsSeparator != "" ? excessLength % 4 : excessLength % 3;
      // console.log("Excess Remainder: " + excessRemainder);
      let excessMultiple =
        thousandsSeparator != ""
          ? Math.trunc(excessLength / 4)
          : Math.trunc(excessLength / 3);
      let displayStr = wholeNumberStr.slice(0, noDigits - 1);
      // console.log("DisplayStr: " + displayStr);
      switch (excessRemainder) {
        case 0:
          if (excessMultiple > 0) {
            excessMultiple = excessMultiple - 1;
          }
          break;
        case 1:
          if (thousandsSeparator != "") {
            displayStr =
              displayStr.slice(0, -3) + decimalSeparator + displayStr.slice(-2);
          } else {
            displayStr =
              displayStr.slice(0, -2) +
              decimalSeparator +
              displayStr.slice(-2, -1);
          }
          break;
        case 2:
          if (thousandsSeparator != "") {
            displayStr =
              displayStr.slice(0, -2) + decimalSeparator + displayStr.slice(-1);
          } else {
            displayStr = displayStr.slice(0, -1);
          }
          break;
        case 3:
          displayStr = displayStr.slice(0, -1);
          break;
      }
      switch (excessMultiple) {
        case 0:
          displayStr = displayStr + "K";
          break;
        case 1:
          displayStr = displayStr + "M";
          break;
        case 2:
          displayStr = displayStr + "B";
          break;
        case 3:
          displayStr = displayStr + "T";
          break;
        default:
          displayStr = displayStr + "G";
          break;
      }
      return displayStr;
    }
  }
}

export function displayNumber(
  x: number, // the number to display
  decimals: number // the number of decimal places to display, mu
): string {
  let result = "";
  if (x >= 1000000) {
    result = roundTo(x / 1000000, 2).toString() + "M";
  } else if (x >= 1000) {
    result = roundTo(x / 1000, 2).toString() + "K";
  } else {
    // toFixed() digits argument must be between 0 and 100
    if (decimals > 100) {
      decimals = 100;
    }
    if (decimals < 0) {
      decimals = 0;
    }
    result = roundTo(x, decimals).toFixed(decimals);
  }
  return result;
}

export enum RoundType {
  UP = "UP", // rounds away from zero
  DOWN = "DOWN", // rounds towards zero
  NEAREST = "NEAREST", // rounds to the nearest
}

// utility function to round a number to a specified number of decimals
export function roundTo(
  x: number, // the number to be rounded
  decimals: number, // the number of decimals to be rounded to
  roundType: RoundType = RoundType.NEAREST // the method of rounding
): number {
  let result = x;
  if (decimals > 10) {
    decimals = 10;
  }
  switch (roundType) {
    case RoundType.NEAREST: {
      result = Math.round(x * 10 ** decimals) / 10 ** decimals;
      break;
    }
    case RoundType.UP: {
      if (x > 0) {
        result = Math.ceil(x * 10 ** decimals) / 10 ** decimals;
      } else {
        result = Math.floor(x * 10 ** decimals) / 10 ** decimals;
      }
      break;
    }
    case RoundType.DOWN: {
      if (x > 0) {
        result = Math.floor(x * 10 ** decimals) / 10 ** decimals;
      } else {
        result = Math.ceil(x * 10 ** decimals) / 10 ** decimals;
      }
      break;
    }
  }
  return result;
}

// utility function to shorten any string to an abbreviated version
// useful for showing long strings like on-ledger addresses and tx hashes
// e.g. default settings will shorten the string "uweriugcwieywegwe864r8dt864g3g487t5rgd34df384t" to "uwer...394t"
export function shortenString(
  fullStr: string, // the string you want to shorten
  showStart: number = 4, // how many chars of the string to show at the start of the abbreviation
  showEnd: number = showStart, // how many chars to show at the end of the abbreviation
  seperator: string = "..." // the chars to show in the middle of the abbreviation
): string {
  if (!fullStr || fullStr.length <= showStart + showEnd + 2) {
    return fullStr;
  } else {
    return (
      fullStr.slice(0, showStart) +
      (showEnd > 0 ? seperator + fullStr.slice(-showEnd) : "")
    );
  }
}

// utility function to display dates and times
// can be adjusted for DeXter
export function displayTime(
  date: Date | string, // date/time to display
  period: string = "" // the period that you want to display date/time for
): string {
  if (typeof date == "string") {
    date = new Date(date);
  }

  if (period === "full") {
    return date
      .toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(/(\d+)\/(\d+)\/(\d+), (\d+:\d+:\d+)/, "$3-$1-$2 $4");
  } else if (!period) {
    return date.toLocaleString([], {
      month: "2-digit",
      day: "2-digit",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (["1D", "1W", "1M"].includes(period)) {
    return date.toLocaleDateString([], {
      month: "2-digit",
      day: "2-digit",
    });
  } else {
    return date.toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

// Styling changes for Direction(side) in table
// I think this would be unaffected by dark/light mode
export function displayOrderSide(side: string): {
  text: string;
  className: string;
} {
  if (side === "BUY") {
    return { text: "Buy", className: "text-green-500" };
  } else if (side === "SELL") {
    return { text: "Sell", className: "text-red-500" };
  } else {
    return { text: "-", className: "" };
  }
}

//Compute Total fees from OrderReceipts
//This rounds to 4 decimal places if applicable. Otherwise keep original
export function calculateTotalFees(order: any): number {
  const {
    exchange_fee: exchangeFee,
    liquidity_fee: liquidityFee,
    platform_fee: platformFee,
  } = order;
  const totalFees = exchangeFee + liquidityFee + platformFee;
  const decimalPart = (totalFees % 1).toString().split(".")[1];
  return decimalPart && decimalPart.length > 4
    ? roundTo(totalFees, 4, RoundType.NEAREST)
    : totalFees;
}

//Chart Helper Functions
export const formatPercentageChange = (percChange: number | null): string => {
  if (percChange !== null) {
    return `(${percChange.toFixed(2)}%)`;
  }
  return "(0.00%)";
};

export const computePercentageChange = (
  currentClose: number | null,
  prevClose: number | null
): number | null => {
  if (currentClose !== null && prevClose !== null) {
    const difference = currentClose - prevClose;
    return (difference / prevClose) * 100;
  }
  return null;
};

export const getVolumeBarColor = (
  currentClose: number,
  prevClose: number
): string => {
  const percChange = ((currentClose - prevClose) / prevClose) * 100;
  return percChange < 0 ? "#f44336" : "#4caf50";
};
