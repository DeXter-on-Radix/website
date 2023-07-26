// utiluty function to display numbers in a fixed format
export function displayNumber(
  x: number, // the number to display
  maxDecimals: number, // the maximum number of decimals to display
  fixedDecimals: boolean = false // if true, will always display the number to maxDecimals (fill with zeroes if required)
): string {
  if (x < 1) {
    if (fixedDecimals) {
      return x.toFixed(maxDecimals);
    } else {
      return roundTo(x, maxDecimals).toString();
    }
  } else if (x < 1000) {
    if (maxDecimals < 3) {
      if (fixedDecimals) {
        return x.toFixed(maxDecimals);
      } else {
        return roundTo(x, maxDecimals).toString();
      }
    } else {
      if (fixedDecimals) {
        return x.toFixed(3);
      } else {
        return roundTo(x, 3).toString();
      }
    }
  } else if (x < 1000000) {
    return (x / 1000).toFixed(2) + "K";
  } else {
    return (x / 1000000).toFixed(2) + "M";
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
  if (!period) {
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
