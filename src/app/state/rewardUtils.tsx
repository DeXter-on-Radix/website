//import { getRadixApiValue } from "./api-functions";
import { TokenInfo } from "alphadex-sdk-js";
import { getRdt } from "../subscriptions";
import { StateKeyValueStoreDataRequestKeyItem } from "@radixdlt/radix-dapp-toolkit";

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

export function getClaimComponentFromApiData(apiData: any): ClaimComponent {
  let claimComponent = new ClaimComponent();
  if (apiData && apiData.items && apiData.items.length > 0) {
    let componentApiData = apiData.items[0];
    if (componentApiData.address && componentApiData.details?.state?.fields) {
      claimComponent.address = componentApiData.address;
      let stateFields = componentApiData.details.state.fields;
      for (const fieldData of stateFields) {
        switch (fieldData.field_name) {
          case "dextr_token_address": {
            claimComponent.dextrTokenAddress = fieldData.value;
            break;
          }
          case "admin_token_address": {
            claimComponent.adminTokenAddress = fieldData.value;
            break;
          }
          case "account_rewards_nft_manager": {
            claimComponent.accountRewardsNftAddress = fieldData.value;
            break;
          }
          case "order_rewards": {
            claimComponent.orderRewardsKvsAddress = fieldData.value;
            break;
          }
        }
      }
    }
  }
  return claimComponent;
}

export function getRewardsByTypeThenToken(
  accountsRewards: AccountRewards[],
  ordersRewards: OrderRewards[],
  tokensDict: Record<string, TokenInfo>
): TypeRewards[] {
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
          let tokenInfo = tokensDict[tokenReward.address]
            ? tokensDict[tokenReward.address]
            : {
                address: tokenReward.address,
                name: "Unknown Token",
                symbol: "?",
                iconUrl: "/unknown-token-icon.svg",
              };
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
          let tokenInfo = tokensDict[tokenReward.address]
            ? tokensDict[tokenReward.address]
            : {
                address: tokenReward.address,
                name: "Unknown Token",
                symbol: "?",
                iconUrl: "/unknown-token-icon.svg",
              };
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

export function getRewardsByToken(
  accountsRewards: AccountRewards[],
  ordersRewards: OrderRewards[],
  tokensDict: Record<string, TokenInfo>
): TokenReward[] {
  let tokenRewardsMap: Map<string, TokenReward> = new Map();
  accountsRewards.forEach((accountReward) => {
    accountReward.rewards.forEach((typeReward) => {
      typeReward.tokenRewards.forEach((tokenReward) => {
        let existingTokenReward = tokenRewardsMap.get(tokenReward.address);
        if (!existingTokenReward) {
          let tokenInfo = tokensDict[tokenReward.address]
            ? tokensDict[tokenReward.address]
            : {
                address: tokenReward.address,
                name: "Unknown Token",
                symbol: "?",
                iconUrl: "/unknown-token-icon.svg",
              };
          existingTokenReward = { ...tokenInfo, amount: tokenReward.amount };
        } else {
          existingTokenReward = { ...existingTokenReward };
          existingTokenReward.amount += tokenReward.amount;
        }
        tokenRewardsMap.set(existingTokenReward.address, existingTokenReward);
      });
    });
  });
  ordersRewards.forEach((orderRewards) => {
    orderRewards.rewards.forEach((typeRewards) => {
      typeRewards.tokenRewards.forEach((tokenReward) => {
        let existingTokenReward = tokenRewardsMap.get(tokenReward.address);
        if (!existingTokenReward) {
          let tokenInfo = tokensDict[tokenReward.address]
            ? tokensDict[tokenReward.address]
            : {
                address: tokenReward.address,
                name: "Unknown Token",
                symbol: "?",
                iconUrl: "/unknown-token-icon.svg",
              };
          existingTokenReward = { ...tokenInfo, amount: tokenReward.amount };
        } else {
          existingTokenReward = { ...existingTokenReward };
          existingTokenReward.amount += tokenReward.amount;
        }
        tokenRewardsMap.set(existingTokenReward.address, existingTokenReward);
      });
    });
  });
  return Array.from(tokenRewardsMap.values());
}

export function getOrdersByRewardType(
  ordersRewards: OrderRewards[] | null
): OrdersByTypeRewards {
  let result: OrdersByTypeRewards = new Map();
  if (ordersRewards) {
    ordersRewards.forEach((orderRewardData) => {
      orderRewardData.rewards.forEach((typeReward) => {
        let existingTypeRewards = result.get(typeReward.rewardType);
        if (!existingTypeRewards) {
          existingTypeRewards = new Map();
        }
        typeReward.tokenRewards.forEach((tokenReward) => {
          let orderTokenReward: OrderTokenReward = {
            orderReceiptAddress: orderRewardData.orderReceiptAddress,
            orderId: orderRewardData.orderId,
            orderIndex: orderRewardData.orderIndex,
            amount: tokenReward.amount,
          };
          let existingTokenRewards = existingTypeRewards!.get(
            tokenReward.address
          );
          if (!existingTokenRewards) {
            existingTokenRewards = [orderTokenReward];
          } else {
            existingTokenRewards.push(orderTokenReward);
          }
          existingTypeRewards!.set(tokenReward.address, existingTokenRewards);
        });
        result.set(typeReward.rewardType, existingTypeRewards!);
      });
    });
  }
  return result;
}

export async function getAccountsRewardsApiData(
  accountAddresses: string[],
  claimNFTResourceAddress: string
): Promise<any> {
  const rdt = getRdt();
  if (!rdt) {
    console.error("Problem RDT");
    return;
  }
  let accountNftIds = accountAddresses.map((accountAddress) =>
    createAccountNftId(accountAddress)
  );
  let accountRewardsNftResult;
  try {
    accountRewardsNftResult = await rdt.gatewayApi.state.getNonFungibleData(
      claimNFTResourceAddress,
      accountNftIds
    );
    return accountRewardsNftResult[0];
  } catch (error) {
    console.error(
      "Problem loading Rewards NFT data for accounts: ",
      accountAddresses,
      accountRewardsNftResult
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

export function getAccountsRewardsFromApiData(apiData: any): AccountRewards[] {
  let accountsRewards: AccountRewards[] = [];
  if (apiData.non_fungible_ids && apiData.non_fungible_ids.length > 0) {
    for (const nftData of apiData.non_fungible_ids) {
      let accountRewards = new AccountRewards();
      if (!nftData.data.programmatic_json.fields) {
        console.error("Could not find NFT data fields in NFT apiData", nftData);
        return accountsRewards;
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
      accountsRewards.push(accountRewards);
    }
  } else if (apiData.non_fungible_id) {
    const nftData = apiData;
    let accountRewards = new AccountRewards();
    if (!nftData.data.programmatic_json.fields) {
      console.error("Could not find NFT data fields in NFT apiData", nftData);
      return accountsRewards;
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
    accountsRewards.push(accountRewards);
  } else {
    console.error(
      "Could not find field non_fungible_ids in api data.",
      apiData
    );
  }
  return accountsRewards;
}

export async function getOrdersRewardsApiData(
  orderRewardsKvsAddress: string,
  orderIndices: string[]
): Promise<any> {
  let result;
  const rdt = getRdt();
  let kvsKeysRequest = orderIndices.map((orderIndex) => {
    return {
      // eslint-disable-next-line camelcase
      key_json: {
        kind: "String",
        value: orderIndex,
      },
    };
  });
  try {
    let orderRewardsResult =
      await rdt?.gatewayApi.state.innerClient.keyValueStoreData({
        stateKeyValueStoreDataRequest: {
          // eslint-disable-next-line camelcase
          key_value_store_address: orderRewardsKvsAddress,
          keys: kvsKeysRequest as StateKeyValueStoreDataRequestKeyItem[],
        },
      });
    result = orderRewardsResult;
  } catch (error) {
    console.error(
      "Problem loading Order Rewards data for orderIndices: " + orderIndices
    );
  }
  /*
  if (orderRewardsResult.status != 200) {
    console.error(
      "Problem loading Order Rewards data for orderIndices: " + orderIndices,
      orderRewardsResult
    );
  } else {
    result = orderRewardsResult.data;
  }*/
  return result;
}

export function createOrderIndex(
  orderReceiptAddress: string,
  orderId: number
): string {
  let result = orderReceiptAddress + "#" + orderId + "#";
  return result;
}

export function fromOrderIndex(orderIndex: string): {
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

export function getOrderRewardsFromApiData(apiData: any): OrderRewards[] {
  let ordersRewards: OrderRewards[] = [];
  if (apiData.entries && apiData.entries.length > 0) {
    for (const orderData of apiData.entries) {
      let orderRewards = new OrderRewards();

      if (!orderData.value.programmatic_json.fields) {
        console.error(
          "Could not find order reward data fields in apiData",
          orderData
        );
        return ordersRewards;
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
      ordersRewards.push(orderRewards);
    }
  } else {
    console.error("Could not find field entries in api data.", apiData);
  }
  return ordersRewards;
}
