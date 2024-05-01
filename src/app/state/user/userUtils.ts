import {
  StateEntityFungiblesPageRequest,
  StateEntityNonFungibleIdsPageRequest,
  StateEntityNonFungiblesPageRequest,
} from "@radixdlt/radix-dapp-toolkit";
import { OrderData, OrderVaultsAndIdsResult, TokenBalance } from "./userSlice";
import { getPairOrders, OrderReceipt } from "alphadex-sdk-js";
import { rdt } from "subscriptions";

export async function fetchAccountBalances(
  accountAddress: string
): Promise<TokenBalance[]> {
  let result: TokenBalance[] = [];
  let cursor = "";
  let stateVersion = 0;
  try {
    do {
      let requestObject: StateEntityFungiblesPageRequest = {
        address: accountAddress,
        // eslint-disable-next-line camelcase
        aggregation_level: "Global",
      };
      if (cursor) {
        // eslint-disable-next-line camelcase
        requestObject.at_ledger_state = {
          // eslint-disable-next-line camelcase
          state_version: stateVersion,
        };
        requestObject.cursor = cursor;
      }
      let apiResult =
        await rdt.gatewayApi.state.innerClient.entityFungiblesPage({
          stateEntityFungiblesPageRequest: requestObject,
        });
      if (apiResult.next_cursor) {
        cursor = apiResult.next_cursor;
        stateVersion = apiResult.ledger_state.state_version;
      } else {
        cursor = "";
      }
      if (apiResult.items && apiResult.items.length > 0) {
        apiResult.items.forEach((tokenBalanceItem) => {
          let newTokenBalance: TokenBalance = {
            tokenAddress: tokenBalanceItem.resource_address,
            // @ts-ignore
            tokenAmount: tokenBalanceItem.amount,
          };
          result.push(newTokenBalance);
        });
      }
    } while (cursor);
  } catch (error) {
    throw new Error(
      "Error fetching account balances for account: " + accountAddress
    );
  }
  return result;
}

export async function fetchAccountOrdersVaultsAndIds(
  accountAddress: string,
  pairReceiptAddresses: string[]
): Promise<OrderVaultsAndIdsResult[]> {
  let result: OrderVaultsAndIdsResult[] = [];
  let cursor = "";
  let stateVersion = 0;
  try {
    do {
      let requestObject: StateEntityNonFungiblesPageRequest = {
        address: accountAddress,
        // eslint-disable-next-line camelcase
        aggregation_level: "Vault",
        // eslint-disable-next-line camelcase
        opt_ins: {
          // eslint-disable-next-line camelcase
          non_fungible_include_nfids: true,
        },
      };
      if (cursor) {
        // eslint-disable-next-line camelcase
        requestObject.at_ledger_state = {
          // eslint-disable-next-line camelcase
          state_version: stateVersion,
        };
        requestObject.cursor = cursor;
      }
      let apiResult =
        await rdt.gatewayApi.state.innerClient.entityNonFungiblesPage({
          stateEntityNonFungiblesPageRequest: requestObject,
        });
      if (apiResult.next_cursor) {
        cursor = apiResult.next_cursor;
        stateVersion = apiResult.ledger_state.state_version;
      } else {
        cursor = "";
      }
      if (apiResult.items && apiResult.items.length > 0) {
        apiResult.items.forEach((resourceVaultsItem) => {
          if (
            pairReceiptAddresses.includes(resourceVaultsItem.resource_address)
          ) {
            // @ts-ignore - there should be a vaults field
            resourceVaultsItem.vaults.items.forEach((vaultData) => {
              let newOrderVaultsAndIdsResult: OrderVaultsAndIdsResult = {
                vaultAddress: vaultData.vault_address,
                receiptAddress: resourceVaultsItem.resource_address,
                orderIds: vaultData.items,
              };
              if (vaultData.cursor) {
                newOrderVaultsAndIdsResult.cursor = vaultData.cursor;
                newOrderVaultsAndIdsResult.stateVersion =
                  apiResult.ledger_state.state_version;
              }
              result.push(newOrderVaultsAndIdsResult);
            });
          }
        });
      }
    } while (cursor);
  } catch (error) {
    throw new Error("Error fetching NFT Ids for account: " + accountAddress);
  }
  return result;
}

export async function fetchAccountOrderIdsByVault(
  accountAddress: string,
  vaultAddress: string,
  receiptAddress: string,
  cursor: string = "",
  stateVersion: number = 0
): Promise<string[]> {
  let result: string[] = [];
  try {
    do {
      let requestObject: StateEntityNonFungibleIdsPageRequest = {
        address: accountAddress,
        // eslint-disable-next-line camelcase
        vault_address: vaultAddress,
        // eslint-disable-next-line camelcase
        resource_address: receiptAddress,
      };
      if (cursor) {
        // eslint-disable-next-line camelcase
        requestObject.at_ledger_state = {
          // eslint-disable-next-line camelcase
          state_version: stateVersion,
        };
        requestObject.cursor = cursor;
      }
      let apiResult =
        await rdt.gatewayApi.state.innerClient.entityNonFungibleIdsPage({
          stateEntityNonFungibleIdsPageRequest: requestObject,
        });
      if (apiResult.next_cursor) {
        cursor = apiResult.next_cursor;
        stateVersion = apiResult.ledger_state.state_version;
      } else {
        cursor = "";
      }
      if (apiResult.items && apiResult.items.length > 0) {
        apiResult.items.forEach((nftId) => {
          result.push(receiptAddress + nftId);
        });
      }
    } while (cursor);
  } catch (error) {
    throw new Error(
      "Error fetching NFT Ids for account: " +
        accountAddress +
        " vault: " +
        vaultAddress
    );
  }

  return result;
}

export async function fetchOrdersDetails(
  uniqueIds: string[],
  pairAddressReceiptMap: Map<string, string>
): Promise<OrderData[]> {
  let result: OrderData[] = [];
  // create map of receipt address => pair address
  let receiptAddressPairMap: Map<string, string> = new Map();
  Array.from(pairAddressReceiptMap.entries()).forEach(
    ([pairAddress, receiptAddress]) => {
      receiptAddressPairMap.set(receiptAddress, pairAddress);
    }
  );
  // create a map of orders grouped per pair address
  let receiptOrdersMap: Map<string, number[]> = new Map();
  uniqueIds.forEach((uniqueId) => {
    let { receiptAddress, orderIdString } = splitOrderUniqueId(uniqueId);
    let existingReceiptOrdersList = receiptOrdersMap.get(receiptAddress);
    if (!existingReceiptOrdersList) {
      existingReceiptOrdersList = [];
    }
    existingReceiptOrdersList.push(createOrderIdNumber(orderIdString));
    receiptOrdersMap.set(receiptAddress, existingReceiptOrdersList);
  });
  for (const [receiptAddress, orderIds] of receiptOrdersMap.entries()) {
    const pairAddress = receiptAddressPairMap.get(receiptAddress);
    if (!pairAddress) {
      throw new Error(
        "Could not find pair address for receipt: " + receiptAddress
      );
    }
    let batchSize = 100;
    let batchStart = 0;
    while (batchStart < orderIds.length) {
      let batchIds = orderIds.slice(batchStart, batchStart + batchSize);
      let sdkResult = await getPairOrders(pairAddress, orderIds);
      if (sdkResult.status != "SUCCESS") {
        throw new Error(
          "Problem fetching order data for pair: " +
            pairAddress +
            " ids: " +
            batchIds.toString()
        );
      }
      sdkResult.data.forEach((orderReceiptData: OrderReceipt) => {
        let newOrderData = orderDataFromReceipt(
          orderReceiptData,
          receiptAddress
        );
        result.push(newOrderData);
      });
      batchStart += batchSize;
    }
  }
  return result;
}

function orderDataFromReceipt(
  orderReceipt: OrderReceipt,
  receiptAddress: string
): OrderData {
  let newOrderData: any = { ...orderReceipt };
  (newOrderData.uniqueId = createOrderUniqueId(
    receiptAddress,
    orderReceipt.id
  )),
    (newOrderData.specifiedToken = orderReceipt.specifiedToken.address);
  newOrderData.unclaimedToken = orderReceipt.unclaimedToken.address;
  return newOrderData;
}

export function createOrderUniqueId(
  orderReceiptAddress: string,
  orderId: number
): string {
  let result = orderReceiptAddress + createOrderIdString(orderId);
  return result;
}

export function splitOrderUniqueId(orderUniqueId: string): {
  orderIdString: string;
  receiptAddress: string;
} {
  let orderIdStart = orderUniqueId.indexOf("#");
  return {
    orderIdString: orderUniqueId.slice(orderIdStart),
    receiptAddress: orderUniqueId.slice(0, orderIdStart),
  };
}

export function createOrderIdString(orderId: number): string {
  return "#" + orderId + "#";
}

export function createOrderIdNumber(orderIdString: string): number {
  return Number(orderIdString.slice(1, -1));
}
