import React from "react";
import { useAppSelector } from "../../hooks";
import { displayNumber } from "../../utils";

import "../../styles/table.css";
import { PairInfo } from "alphadex-sdk-js/lib/models/pair-info";

const headers = [
  { id: "id", label: "#" },
  { id: "name", label: "TOKENS" },
  { id: "lastPrice", label: "PRICE" },
  { id: "quantity24h", label: "VOLUME 24H" },
  { id: "change24h", label: "24H" },
  //{ id: "high24h", label: "HIGH 24H" },
  //{ id: "low24h", label: "LOW 24H" },
  { id: "trades24h", label: "TRADES 24H" },
  { id: "value24h", label: "VALUE 24H" },
];

export function DisplayMarketTable() {
  const marketList = useAppSelector((state) =>
    formatPairs(state.marketInfo.pairsList)
  );

  return (
    <div className="overflow-x-auto">
      <table className="table table-sm">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header.id}>{header.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>{MarketRows({ data: marketList })}</tbody>
      </table>
    </div>
  );
}

const formatPairs = (pairs: PairInfo[]) => {
  const noDigits = 4;
  const fixedDecimals = 3;
  return pairs.map((pair) => {
    return {
      name: pair.name,
      lastPrice: displayNumber(pair.lastPrice, noDigits, fixedDecimals),
      quantity24h: displayNumber(pair.quantity24h, noDigits, fixedDecimals),
      change24h: displayNumber(pair.change24h, noDigits, fixedDecimals),
      //high24h: displayNumber (pair.high24h, noDigits, fixedDecimals),
      //low24h: displayNumber (pair.low24h, noDigits, fixedDecimals),
      trades24h: pair.trades24h,
      value24h: displayNumber(pair.value24h, noDigits, fixedDecimals),
    };
  });
};

const MarketRows = ({ data }: any) => {
  return data?.length ? (
    data.map((market: any, index: any) => (
      <tr className="!border-b-2 !border-b-secondary-content" key={market.id}>
        {headers.map((header, i) => (
          <td key={header.id}>
            {" "}
            {i === 0 ? index + 1 : ""} {market[header.id]}
          </td>
        ))}
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={7}>No Market Data {data}.</td>
    </tr>
  );
};
