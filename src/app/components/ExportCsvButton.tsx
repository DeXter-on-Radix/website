"use client";

import React from "react";
import { useAppSelector } from "hooks";
import Papa from "papaparse";

const ExportCsvButton = () => {
  const { orderHistory } = useAppSelector((state) => state.accountHistory);

  const handleExport = () => {
    try {
      const formatedOrderHistory = orderHistory.map((order) => {
        return {
          ...order,
          specifiedToken: order.specifiedToken.symbol,
          unclaimedToken: order.unclaimedToken.symbol,
        };
      });

      // Convert orderHistory array to CSV format
      const csv = Papa.unparse(formatedOrderHistory);

      // Create a blob from the CSV data
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

      // Create a link element and trigger the download
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        const filename = `dexter-order-history-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      // TODO: add toast notification ?
      console.error("Error exporting CSV:", error);
    }
  };

  // do not display the button if orderHistory is empty
  if (!orderHistory || orderHistory.length === 0) {
    return null;
  }

  return (
    <button
      onClick={handleExport}
      className="text-sm ml-auto hover:text-dexter-gradient-green"
    >
      export as csv
    </button>
  );
};

export default ExportCsvButton;
