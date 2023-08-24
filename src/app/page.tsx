"use client";

import { PairInfo } from "./components/PairInfo";
import * as utils from "./utils";

export default function Home() {
  let decimalSeparator = ".";
  let thousandsSeparator = "";
  let digits = 4;
  console.log(
    "Digits set to " +
      digits +
      " ThousandsSeparator set to: (" +
      thousandsSeparator +
      ")"
  );
  console.log(
    "Display amount: 1234 -> " +
      utils.displayAmount(1234, digits, decimalSeparator, thousandsSeparator)
  );
  console.log(
    "Display amount: 12345 -> " +
      utils.displayAmount(12345, digits, decimalSeparator, thousandsSeparator)
  );
  console.log(
    "Display amount: 123456 -> " +
      utils.displayAmount(123456, digits, decimalSeparator, thousandsSeparator)
  );
  console.log(
    "Display amount: 1234567 -> " +
      utils.displayAmount(1234567, digits, decimalSeparator, thousandsSeparator)
  );
  console.log(
    "Display amount: 12345678 -> " +
      utils.displayAmount(
        12345678,
        digits,
        decimalSeparator,
        thousandsSeparator
      )
  );
  console.log(
    "Display amount: 123456789 -> " +
      utils.displayAmount(
        123456789,
        digits,
        decimalSeparator,
        thousandsSeparator
      )
  );
  console.log(
    "Display amount: 1234567890 -> " +
      utils.displayAmount(
        1234567890,
        digits,
        decimalSeparator,
        thousandsSeparator
      )
  );
  thousandsSeparator = " ";
  digits = 4;
  console.log(
    "Digits set to " +
      digits +
      " ThousandsSeparator set to: (" +
      thousandsSeparator +
      ")"
  );
  console.log(
    "Display amount: 1234 -> " +
      utils.displayAmount(1234, digits, decimalSeparator, thousandsSeparator)
  );
  console.log(
    "Display amount: 12345 -> " +
      utils.displayAmount(12345, digits, decimalSeparator, thousandsSeparator)
  );
  console.log(
    "Display amount: 123456 -> " +
      utils.displayAmount(123456, digits, decimalSeparator, thousandsSeparator)
  );
  console.log(
    "Display amount: 1234567 -> " +
      utils.displayAmount(1234567, digits, decimalSeparator, thousandsSeparator)
  );
  console.log(
    "Display amount: 12345678 -> " +
      utils.displayAmount(
        12345678,
        digits,
        decimalSeparator,
        thousandsSeparator
      )
  );
  console.log(
    "Display amount: 123456789 -> " +
      utils.displayAmount(
        123456789,
        digits,
        decimalSeparator,
        thousandsSeparator
      )
  );
  console.log(
    "Display amount: 1234567890 -> " +
      utils.displayAmount(
        1234567890,
        digits,
        decimalSeparator,
        thousandsSeparator
      )
  );
  digits = 8;
  console.log(
    "Digits set to " +
      digits +
      " ThousandsSeparator set to: (" +
      thousandsSeparator +
      ")"
  );
  console.log(
    "Display amount: 1234 -> " +
      utils.displayAmount(1234, digits, decimalSeparator, thousandsSeparator)
  );
  console.log(
    "Display amount: 12345 -> " +
      utils.displayAmount(12345, digits, decimalSeparator, thousandsSeparator)
  );
  console.log(
    "Display amount: 123456 -> " +
      utils.displayAmount(123456, digits, decimalSeparator, thousandsSeparator)
  );
  console.log(
    "Display amount: 1234567 -> " +
      utils.displayAmount(1234567, digits, decimalSeparator, thousandsSeparator)
  );
  console.log(
    "Display amount: 12345678 -> " +
      utils.displayAmount(
        12345678,
        digits,
        decimalSeparator,
        thousandsSeparator
      )
  );
  console.log(
    "Display amount: 123456789 -> " +
      utils.displayAmount(
        123456789,
        digits,
        decimalSeparator,
        thousandsSeparator
      )
  );
  console.log(
    "Display amount: 1234567890 -> " +
      utils.displayAmount(
        1234567890,
        digits,
        decimalSeparator,
        thousandsSeparator
      )
  );

  return (
    <main className="mx-6">
      <PairInfo />
    </main>
  );
}
