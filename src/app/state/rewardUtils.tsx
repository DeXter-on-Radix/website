import { TokenInfo } from "alphadex-sdk-js";
import { getGatewayApiClientOrThrow } from "../subscriptions";
import { StateKeyValueStoreDataRequestKeyItem } from "@radixdlt/babylon-gateway-api-sdk";

export class ClaimComponent {
  address: string = "";
  dextrTokenAddress: string = "";
  adminTokenAddress: string = "";
  accountRewardsNftAddress: string = "";
  orderRewardsKvsAddress: string = "";
}

export class AccountRewards {
  accountAddress: string = "";
  rewards: TypeRewards[] = [];
}

export class OrderRewards {
  orderReceiptAddress: string = "";
  orderId: number = -1;
  orderIndex: string = "";
  rewards: TypeRewards[] = [];
}

export class TypeRewards {
  rewardType: string = "";
  tokenRewards: TokenReward[] = [];
}

export class TokenReward extends TokenInfo {
  amount: number = 0;
}

export type OrdersByTypeRewards = Map<string, Map<string, OrderTokenReward[]>>; // Map< rewardType, Map< tokenAddress , OrderTokenReward>>
export interface OrderTokenReward {
  orderReceiptAddress: string;
  orderId: number;
  orderIndex: string;
  amount: number;
}

export function getTypeRewards(
  accountsRewards: AccountRewards[],
  ordersRewards: OrderRewards[],
  tokensList: TokenInfo[]
): TypeRewards[] {
  let tokensMap: Map<string, TokenInfo> = new Map();
  tokensList.forEach((tokenInfo) =>
    tokensMap.set(tokenInfo.address, tokenInfo)
  );
  let typeRewardsMap: Map<string, Map<string, TokenReward>> = new Map();
  accountsRewards.forEach((accountReward) => {
    accountReward.rewards.forEach((typeReward) => {
      let existingTypeRewardTokens = typeRewardsMap.get(typeReward.rewardType);
      if (!existingTypeRewardTokens) {
        existingTypeRewardTokens = new Map<string, TokenReward>();
      } else {
        existingTypeRewardTokens = new Map(existingTypeRewardTokens);
      }
      typeReward.tokenRewards.forEach((tokenReward) => {
        let existingTokenReward = existingTypeRewardTokens!.get(
          tokenReward.address
        );
        if (!existingTokenReward) {
          let tokenInfo = tokensMap.get(tokenReward.address);
          if (!tokenInfo) {
            tokenInfo = new TokenInfo(
              tokenReward.address,
              "?",
              "Unknown Token",
              "/unknown-token-icon.svg"
            );
          }
          existingTokenReward = { ...tokenInfo, amount: tokenReward.amount };
        } else {
          existingTokenReward = { ...existingTokenReward };
          existingTokenReward.amount += tokenReward.amount;
        }
        existingTypeRewardTokens!.set(
          existingTokenReward.address,
          existingTokenReward
        );
      });
      typeRewardsMap.set(typeReward.rewardType, existingTypeRewardTokens);
    });
  });
  ordersRewards.forEach((orderRewards) => {
    orderRewards.rewards.forEach((typeReward) => {
      let existingTypeRewardTokens = typeRewardsMap.get(typeReward.rewardType);
      if (!existingTypeRewardTokens) {
        existingTypeRewardTokens = new Map<string, TokenReward>();
      } else {
        existingTypeRewardTokens = new Map(existingTypeRewardTokens);
      }
      typeReward.tokenRewards.forEach((tokenReward) => {
        let existingTokenReward = existingTypeRewardTokens!.get(
          tokenReward.address
        );
        if (!existingTokenReward) {
          let tokenInfo = tokensMap.get(tokenReward.address);
          if (!tokenInfo) {
            tokenInfo = new TokenInfo(
              tokenReward.address,
              "?",
              "Unknown Token",
              "/unknown-token-icon.svg"
            );
          }
          existingTokenReward = { ...tokenInfo, amount: tokenReward.amount };
        } else {
          existingTokenReward = { ...existingTokenReward };
          existingTokenReward.amount += tokenReward.amount;
        }
        existingTypeRewardTokens!.set(
          existingTokenReward.address,
          existingTokenReward
        );
      });
      typeRewardsMap.set(typeReward.rewardType, existingTypeRewardTokens);
    });
  });
  let result: TypeRewards[] = [];
  typeRewardsMap.forEach((tokenRewardsMap, rewardType) => {
    result.push({
      rewardType,
      tokenRewards: Array.from(tokenRewardsMap.values()),
    });
  });
  return result;
}

export function getTokenRewards(
  accountsRewards: AccountRewards[],
  ordersRewards: OrderRewards[],
  tokensList: TokenInfo[]
): TokenReward[] {
  let tokensMap: Map<string, TokenInfo> = new Map();
  tokensList.forEach((tokenInfo) =>
    tokensMap.set(tokenInfo.address, tokenInfo)
  );
  let tokenRewardsMap: Map<string, TokenReward> = new Map();
  accountsRewards.forEach((accountReward) => {
    accountReward.rewards.forEach((typeReward) => {
      typeReward.tokenRewards.forEach((tokenReward) => {
        let existingTokenReward = tokenRewardsMap.get(tokenReward.address);
        if (!existingTokenReward) {
          let tokenInfo = tokensMap.get(tokenReward.address);
          if (!tokenInfo) {
            tokenInfo = new TokenInfo(
              tokenReward.address,
              "?",
              "Unknown Token",
              "/unknown-token-icon.svg"
            );
          }
          existingTokenReward = { ...tokenInfo, amount: tokenReward.amount };
        } else {
          existingTokenReward = { ...existingTokenReward };
          existingTokenReward.amount += tokenReward.amount;
        }
        tokenRewardsMap.set(existingTokenReward!.address, existingTokenReward!);
      });
    });
  });
  ordersRewards.forEach((orderRewards) => {
    orderRewards.rewards.forEach((typeRewards) => {
      typeRewards.tokenRewards.forEach((tokenReward) => {
        let existingTokenReward = tokenRewardsMap.get(tokenReward.address);
        if (!existingTokenReward) {
          let tokenInfo = tokensMap.get(tokenReward.address);
          if (!tokenInfo) {
            tokenInfo = new TokenInfo(
              tokenReward.address,
              "?",
              "Unknown Token",
              "/unknown-token-icon.svg"
            );
          }
          existingTokenReward = { ...tokenInfo, amount: tokenReward.amount };
        } else {
          existingTokenReward = { ...existingTokenReward };
          existingTokenReward.amount += tokenReward.amount;
        }
        tokenRewardsMap.set(existingTokenReward!.address, existingTokenReward!);
      });
    });
  });
  return Array.from(tokenRewardsMap.values());
}

export async function getAccountRewards(
  accountAddresses: string[],
  claimNFTResourceAddress: string
): Promise<AccountRewards[]> {
  const gatewayApiClient = getGatewayApiClientOrThrow();
  let accountNftIds = accountAddresses.map((accountAddress) =>
    createAccountNftId(accountAddress)
  );
  let accountRewardsNftResult;
  try {
    accountRewardsNftResult = await gatewayApiClient.state.getNonFungibleData(
      claimNFTResourceAddress,
      accountNftIds
    );
    let accountsRewards: AccountRewards[] = [];
    if (accountRewardsNftResult && accountRewardsNftResult.length > 0) {
      accountsRewards = getAccountsRewardsFromApiData(
        accountRewardsNftResult[0]
      );
    }
    // Deep copying is needed to prevent "A non-serializable value was detected" error
    return JSON.parse(JSON.stringify(accountsRewards));
  } catch (error) {
    console.error(
      "Problem loading Rewards NFT data for accounts: ",
      accountAddresses,
      accountRewardsNftResult
    );
    throw new Error(
      "Problem loading Rewards NFT data for accounts: " +
        accountAddresses.join(",")
    );
  }
}

export function createAccountNftId(
  accountAddress: string,
  clean: boolean = false
): string {
  let result = "";
  let splitAddress = accountAddress.split("1");
  if (splitAddress.length > 1) {
    if (clean) {
      result = splitAddress[1];
    } else {
      result = "<" + splitAddress[1] + ">";
    }
  }
  return result;
}

function getAccountsRewardsFromApiData(apiData: any): AccountRewards[] {
  // init account rewards
  let accountsRewards: AccountRewards[] = [];
  // extract nftDatas from apiData
  const nonFungibleIds = apiData.non_fungible_ids;
  const nonFungibleId = apiData.non_fungible_id;
  const nftDatas =
    nonFungibleIds && nonFungibleIds.length > 0 // usecase1: multiple nftDatas
      ? nonFungibleIds
      : nonFungibleId // usecase2: apiData returns single nftData
      ? [apiData]
      : []; // usecase3: account has no rewards
  // Iterate over nftDatas and extract accountRewards
  for (const nftData of nftDatas) {
    accountsRewards.push(getAccountRewardsFromNftData(nftData));
  }
  return accountsRewards;
}

function getAccountRewardsFromNftData(nftData: any): AccountRewards {
  let accountRewards = new AccountRewards();
  if (!nftData.data.programmatic_json.fields) {
    throw new Error("Could not find NFT data fields in NFT apiData");
  }
  let nftDataFields = nftData.data.programmatic_json.fields;
  for (const nftDataField of nftDataFields) {
    switch (nftDataField.field_name) {
      case "account_address": {
        accountRewards.accountAddress = nftDataField.value;
        break;
      }
      case "rewards": {
        let rewardTypesData = nftDataField.entries;
        for (const rewardTypeData of rewardTypesData) {
          let typeRewards = new TypeRewards();
          typeRewards.rewardType = rewardTypeData.key.value;
          let tokensRewardData = rewardTypeData.value.entries;
          for (const tokenRewardData of tokensRewardData) {
            let tokenReward = new TokenReward();
            tokenReward.address = tokenRewardData.key.value;
            tokenReward.amount = Number(tokenRewardData.value.value);
            typeRewards.tokenRewards.push(tokenReward);
          }
          accountRewards.rewards.push(typeRewards);
        }
        break;
      }
    }
  }
  return accountRewards;
}

export async function getOrderRewards(
  orderRewardsKvsAddress: string,
  receiptIds: string[]
): Promise<OrderRewards[]> {
  let result: OrderRewards[] = [];
  const gatewayApiClient = getGatewayApiClientOrThrow();
  // console.log("Getting OrderRewards for receiptIds: ", receiptIds);
  const maxBatchSize = 90;
  let batchStart = 0;
  do {
    let batchReceiptIds = receiptIds.slice(
      batchStart,
      batchStart + maxBatchSize
    );
    let kvsKeysRequest = batchReceiptIds.map((receiptId) => {
      return {
        // eslint-disable-next-line camelcase
        key_json: {
          kind: "String",
          value: receiptId,
        },
      };
    });
    const orderRewardsApiData =
      await gatewayApiClient.state.innerClient.keyValueStoreData({
        stateKeyValueStoreDataRequest: {
          // eslint-disable-next-line camelcase
          key_value_store_address: orderRewardsKvsAddress,
          keys: kvsKeysRequest as StateKeyValueStoreDataRequestKeyItem[],
        },
      });
    let batchOrderRewards = getOrderRewardsFromApiData(orderRewardsApiData);
    result = [...result, ...batchOrderRewards];
    batchStart = batchStart + maxBatchSize;
  } while (batchStart < receiptIds.length);
  return result;
}

function fromOrderIndex(orderIndex: string): {
  orderReceiptAddress: string;
  orderId: number;
} {
  let result = {
    orderReceiptAddress: "",
    orderId: -1,
  };
  let orderIndexParts = orderIndex.split("#");
  if (orderIndexParts.length > 1) {
    result.orderReceiptAddress = orderIndexParts[0];
    result.orderId = Number(orderIndexParts[1]);
  }
  return result;
}

function getOrderRewardsFromApiData(apiData: any): OrderRewards[] {
  let ordersRewards: OrderRewards[] = [];
  // Invalid api response
  if (apiData.entries === undefined) {
    throw new Error("Entries not specified in orderRewards apiData.");
  }
  // Account has no orderRewards
  if (apiData.entries.length === 0) {
    return ordersRewards;
  }
  // Iterate over all entries and extract orderRewards
  for (const orderData of apiData.entries) {
    ordersRewards.push(extractOrderRewardsFromOrderData(orderData));
  }
  return ordersRewards;
}

function extractOrderRewardsFromOrderData(orderData: any): OrderRewards {
  let orderRewards = new OrderRewards();
  if (!orderData.value.programmatic_json.fields) {
    throw new Error("Could not find programmatic_json.fields from orderData");
  }
  let orderDataFields = orderData.value.programmatic_json.fields;
  for (const orderDataField of orderDataFields) {
    switch (orderDataField.field_name) {
      case "order_id": {
        orderRewards.orderIndex = orderDataField.value;
        let orderInfo = fromOrderIndex(orderRewards.orderIndex);
        orderRewards.orderReceiptAddress = orderInfo.orderReceiptAddress;
        orderRewards.orderId = orderInfo.orderId;
        break;
      }
      case "rewards": {
        let rewardTypesData = orderDataField.entries;
        for (const rewardTypeData of rewardTypesData) {
          let typeRewards = new TypeRewards();
          typeRewards.rewardType = rewardTypeData.key.value;
          let tokensRewardData = rewardTypeData.value.entries;
          for (const tokenRewardData of tokensRewardData) {
            let tokenReward = new TokenReward();
            tokenReward.address = tokenRewardData.key.value;
            tokenReward.amount = Number(tokenRewardData.value.value);
            typeRewards.tokenRewards.push(tokenReward);
          }
          orderRewards.rewards.push(typeRewards);
        }
        break;
      }
    }
  }
  return orderRewards;
}
