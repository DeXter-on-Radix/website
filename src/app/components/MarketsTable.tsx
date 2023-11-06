import React, { useMemo } from "react";
import { useAppSelector, useAppDispatch } from "../hooks";
import { updateMarketInfo } from "../redux/marketSlice";
interface TableProps {
  data: AccountHistoryState["orderHistory"];
}

import "../styles/table.css";

const headers = [
  { id: "pairName", label: "TOKENS" },
  { id: "price", label: "PRICE" },
  { id: "volume24h", label: "VOLUME 24H" },
  { id: "change24h", label: "24H" },
  { id: "change7d", label: "7D" },
  { id: "marketCap", label: "MARKET CAP" },
  { id: "circulatingSupply", label: "CIRCULATING SUPPLY" },
];

const data = [
  {
    id: 1,
    pairName: "XRD/USDT",
    price: 0.52,
    volume24h: 123456789,
    change24h: 2.5,
    change7d: 10.3,
    marketCap: 520000000,
    circulatingSupply: 1000000000,
  },
  {
    id: 2,
    pairName: "XRD/BTC",
    price: 0.000011,
    volume24h: 987654321,
    change24h: -1.2,
    change7d: 5.6,
    marketCap: 11000000,
    circulatingSupply: 1000000000,
  },
  {
    id: 3,
    pairName: "XRD/ETH",
    price: 0.00032,
    volume24h: 456789123,
    change24h: 0.8,
    change7d: -3.4,
    marketCap: 32000000,
    circulatingSupply: 1000000000,
  },
];

export function DisplayMarketTable() {
    console.log("DisplayMarketTable");
    //Load all pair data
    console.log(updateMarketInfo());
    
  /*
  const selectedTable = useAppSelector(
    (state) => state.accountHistory.selectedTable
  );*/
  //const openOrders = useAppSelector(updateMarketInfo);
  /*
  const tableToShow = {
      headers: headers,
      rows: <OpenOrdersRows data={openOrders} />,
    }
*/
  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra table-xs !mt-0">
        <thead>
          <tr>
            {/* Map the headers array to render the table header cells */}
            {headers.map((header) => (
              <th key={header.id}>{header.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>{MarketRows({data})}</tbody>
      </table>
    </div>
  );
}

const MarketRows = ({ data }) => {
  return data.length ? (
    data.map((order) => (
      <tr key={order.id}>
        {/* Map the headers array again to render the table body cells */}
        {headers.map((header) => (
          <td key={header.id}>{order[header.id]}</td>
        ))}
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={7}>No Active Orders</td>
    </tr>
  );
};
