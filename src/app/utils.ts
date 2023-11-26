export function displayPositiveNumber(
  x: number,
  noDigits: number = 6,
  fixedDecimals: number = -1
): string {
  // the same as with displayNumber, but if the number is negative, it will return empty string
  if (x < 0) {
    return "";
  } else {
    return displayNumber(x, noDigits, fixedDecimals);
  }
}

export function getLocaleSeparators(): {
  decimalSeparator: string;
  thousandsSeparator: string;
} {
  // we don't want users locale settings but
  // the actual settings for number formatting
  // (which may be different from the default than their locale default
  // and can be edited manually by users in OS settings) =>
  // not toLocaleString but toString
  let decimalSeparator = Number(1.1).toString().substring(1, 2);
  let thousandsSeparator = Number(10000).toString().substring(2, 3);

  // we always have a thousands separator
  // if the platform doesn't have one we add space
  if (thousandsSeparator == "0") {
    thousandsSeparator = " ";
  }
  if (thousandsSeparator == "") {
    thousandsSeparator = " ";
  }

  return {
    decimalSeparator,
    thousandsSeparator,
  };
}

export function displayNumber(
  x: number,
  noDigits: number = 6,
  fixedDecimals: number = -1
): string {
  if (noDigits < 4) {
    return "ERROR: displayAmount cannot work with noDigits less than 4";
  }

  const { decimalSeparator, thousandsSeparator } = getLocaleSeparators();

  if (x < 1) {
    let roundedNumber = roundTo(x, noDigits - 2, RoundType.DOWN);
    if (fixedDecimals >= 0 && fixedDecimals <= noDigits - 2) {
      return roundedNumber.toFixed(fixedDecimals);
    } else {
      return roundedNumber.toString();
    }
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

      let decimalsStr = numberStr.split(decimalSeparator)[1];
      decimalsStr = decimalsStr
        ? decimalsStr.substring(0, noDecimals - 1).replace(/0+$/, "")
        : "";
      if (fixedDecimals >= 0) {
        if (decimalsStr.length > fixedDecimals) {
          decimalsStr = decimalsStr.substring(0, fixedDecimals);
        } else {
          decimalsStr =
            decimalsStr +
            "0".repeat(
              Math.min(fixedDecimals, noDecimals - 1) - decimalsStr.length
            );
        }
      }
      if (decimalsStr) {
        decimalsStr = decimalSeparator + decimalsStr;
      }
      return wholeNumberStr + decimalsStr;
    } else {
      let excessLength = wholeNumberStr.length - noDigits + 1;
      let excessRemainder = excessLength % 4;
      let excessMultiple = Math.trunc(excessLength / 4);
      let displayStr = wholeNumberStr.slice(0, noDigits - 1);
      switch (excessRemainder) {
        case 0:
          if (excessMultiple > 0) {
            excessMultiple = excessMultiple - 1;
          }
          break;
        case 1:
          displayStr =
            displayStr.slice(0, -3) + decimalSeparator + displayStr.slice(-2);
          break;
        case 2:
          displayStr =
            displayStr.slice(0, -2) + decimalSeparator + displayStr.slice(-1);
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
export function displayOrderSide(side: string): {
  text: string;
  className: string;
} {
  if (side === "BUY") {
    return { text: "Buy", className: "text-success" };
  } else if (side === "SELL") {
    return { text: "Sell", className: "text-error" };
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

//Calculate the Avg Filled from recieved token amounts
export function calculateAvgFilled(tokenOne: number, tokenTwo: number): number {
  if (tokenOne == 0 || tokenTwo == 0) return 0;
  const avgFilled = tokenTwo / tokenOne;
  const decimalPart = (avgFilled % 1).toString().split(".")[1];
  return decimalPart && decimalPart.length > 8
    ? roundTo(avgFilled, 8, RoundType.NEAREST)
    : avgFilled;
}

//Chart Helper Functions
export const formatPercentageChange = (percChange: number | null): string => {
  if (percChange !== null) {
    return `(${percChange.toFixed(2)}%)`;
  }
  return "(0.00%)";
};

export function numberOrEmptyInput(event: string) {
  let amount: number | "";

  if (event === "") {
    amount = "";
  } else {
    amount = Number(event);
  }
  return amount;
}
