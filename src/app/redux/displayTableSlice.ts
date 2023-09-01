import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./store"; // Ensure this is the right import path

// Selector to get selectedTable from AccountHistoryState
export const selectSelectedTable = (state: RootState) =>
  state.accountHistory.selectedTable;

// Selector that performs the filtering based on the selectedTable
export const selectFilteredData = createSelector(
  selectSelectedTable,
  (state: RootState) => state.accountHistory.orderHistory,
  (selectedTable, data) => {
    switch (selectedTable) {
      case "Open Orders":
        return data.filter((order) => order.status === "PENDING");
      case "Order History":
        return data;
      case "Trade History":
        return data.filter((order) => order.status === "COMPLETED");
      default:
        return data;
    }
  }
);
