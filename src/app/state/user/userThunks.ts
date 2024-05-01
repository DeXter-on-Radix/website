import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { AccountData, OrderData, TokenBalance, userSlice } from "./userSlice";
import { OrderStatus } from "alphadex-sdk-js";
import {
  fetchAccountBalances,
  fetchAccountOrdersVaultsAndIds,
  fetchAccountOrderIdsByVault,
  fetchOrdersDetails,
} from "./userUtils";

export const setConnectedAccountsAndUpdate = (accounts: AccountData[]) => {
  return (dispatch: any, getState: any) => {
    const oldState = getState();
    console.debug(
      "Connected accounts received: ",
      accounts,
      oldState.user.connectedAccounts
    );
    // update state with new connectedAccounts
    dispatch(userSlice.actions.setConnectedAccounts(accounts));
    // check if accountData is different to current state
    let accountsChanged = false;
    if (accounts.length != oldState.user.connectedAccounts.length) {
      accountsChanged = true;
    }
    if (!accountsChanged && accounts.length > 0) {
      accounts.forEach((account, index) => {
        if (account.address != oldState.user.connectedAccounts[index].address) {
          accountsChanged = true;
        }
      });
    }
    console.debug("Accounts Changed: " + accountsChanged);
    if (accountsChanged) {
      // check if old selectedAccount address is in the new accounts list
      let newSelectedAccount = accounts.find(
        (accountData) =>
          accountData.address == oldState.user.selectedAccount?.address
      );
      if (!newSelectedAccount) {
        // if current selected account is not in the new accounts list, then set selectedAccount to the first account in the list or undefined if list is empty
        newSelectedAccount = accounts.length > 0 ? accounts[0] : undefined;
      }
      dispatch(setSelectedAccountAndUpdate(newSelectedAccount));
    }
  };
};

export const setSelectedAccountAndUpdate = (
  account: AccountData | undefined
) => {
  return (dispatch: any, getState: any) => {
    const oldState = getState();
    console.debug(
      "New selcted Account:  ",
      account,
      oldState.user.selectedAccount
    );
    // check if selectedAccount address has changed
    if (
      (!account && oldState.user.selectedAccount) ||
      (account && !oldState.user.selectedAccount) ||
      (account && account.address != oldState.user.selectedAccount.address)
    ) {
      dispatch(userSlice.actions.setSelectedAccount(account));
      dispatch(fetchSelectedAccountBalances());
      dispatch(fetchSelectedAccountNewOrders());
    }
  };
};

export const fetchSelectedAccountBalances = createAsyncThunk<
  TokenBalance[], // Return type of the payload creator
  undefined, // argument type of the paymoad creator
  { state: RootState }
>("user/fetchSelectedAccountBalances", async (_, thunkAPI) => {
  const state: RootState = thunkAPI.getState();
  let tokenBalances: TokenBalance[] = [];
  if (state.user.selectedAccount && state.user.selectedAccount.address) {
    tokenBalances = await fetchAccountBalances(
      state.user.selectedAccount.address
    );
  }
  console.debug("Token balances fetched: ", tokenBalances);
  return tokenBalances;
});

export const fetchSelectedAccountNewOrders = createAsyncThunk<
  OrderData[],
  undefined,
  { state: RootState }
>("user/fetchSelectedAccountOrders", async (_, thunkApi) => {
  let updatedOrderData: OrderData[] = []; // these orders will be added to the existing orders in state.user.selectedAccountOrders
  const state: RootState = thunkApi.getState();
  if (state.user.selectedAccount) {
    let pairAddressReceiptMap: Map<string, string> = new Map();
    let pairsReceiptAddresses: string[] = [];
    console.debug(
      "Fetch orders pairsList: ",
      state.pairSelector.pairsList.length
    );
    state.pairSelector.pairsList.forEach((pairInfo) => {
      pairAddressReceiptMap.set(pairInfo.address, pairInfo.orderReceiptAddress);
      pairsReceiptAddresses.push(pairInfo.orderReceiptAddress);
    });
    let orderIdsToUpdate: Set<string> = new Set();
    if (pairsReceiptAddresses.length > 0) {
      state.user.selectedAccountOrders.forEach((orderData) => {
        if (orderData.status == OrderStatus.PENDING) {
          orderIdsToUpdate.add(orderData.uniqueId);
        }
      });
      let initialOrderVaultsAndIds = await fetchAccountOrdersVaultsAndIds(
        state.user.selectedAccount.address,
        pairsReceiptAddresses
      );
      for (const orderVaultData of initialOrderVaultsAndIds) {
        let existingOrderFound = false;
        for (const orderIdString of orderVaultData.orderIds) {
          let uniqueId = orderVaultData.receiptAddress + orderIdString;
          let existingOrder = state.user.selectedAccountOrders.find(
            (orderData) => orderData.uniqueId == uniqueId
          );
          if (!existingOrder) {
            orderIdsToUpdate.add(uniqueId);
          } else {
            existingOrderFound = true;
            console.log("Found existing order " + existingOrder.uniqueId);
            if (existingOrder.status != OrderStatus.PENDING) {
              break; // once an id is already in the existing orders, all remaining ids in the vault should also be in existing orders.
            }
          }
        }
        if (!existingOrderFound && orderVaultData.cursor) {
          console.debug(
            "Loading overflow orders for orderReceipt: " +
              orderVaultData.receiptAddress
          );
          let additionalOrderIds = await fetchAccountOrderIdsByVault(
            state.user.selectedAccount.address,
            orderVaultData.vaultAddress,
            orderVaultData.receiptAddress,
            orderVaultData.cursor,
            orderVaultData.stateVersion
          );
          for (const uniqueId of additionalOrderIds) {
            let existingOrder = state.user.selectedAccountOrders.find(
              (orderData) => orderData.uniqueId == uniqueId
            );
            if (!existingOrder) {
              orderIdsToUpdate.add(uniqueId);
            } else {
              existingOrderFound = true;
              if (existingOrder.status != OrderStatus.PENDING) {
                break; // once an id is already in the existing orders, all remaining ids in the vault should also be in existing orders.
              }
            }
          }
        }
      }
      console.debug("Order Ids to update: ", orderIdsToUpdate);
      updatedOrderData = await fetchOrdersDetails(
        Array.from(orderIdsToUpdate),
        pairAddressReceiptMap
      );
    }
  }
  console.debug("Updated orders fetched: ", updatedOrderData);
  return updatedOrderData;
});
