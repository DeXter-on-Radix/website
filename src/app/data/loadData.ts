// load all files
import tokenDataJson from "./tokenInfo.json";
import orderReceiptNftAddressesJson from "./orderReceiptNftAddresses.json";
import claimComponentAddressJson from "./claimComponentAddress.json";

// load dependencies
import { TokenInfo } from "alphadex-sdk-js";

// define default network
const defaultNetwork = "stokenet";

export function loadTokenDict(
  network: string = defaultNetwork
): Record<string, TokenInfo> {
  const tokenData = tokenDataJson as {
    [key: string]: Record<string, TokenInfo>;
  };
  return tokenData[network];
}

export function loadOrderReceiptNftAddressDict(
  network: string = defaultNetwork
): Record<string, boolean> {
  const orderReceiptNftAddresses = orderReceiptNftAddressesJson as {
    [networkKey: string]: {
      [resourceKey: string]: boolean;
    };
  };
  return orderReceiptNftAddresses[network];
}

export function loadClaimComponentAddress(
  network: string = defaultNetwork
): string {
  const claimComponentAddressDict = claimComponentAddressJson as {
    [networkKey: string]: string;
  };
  return claimComponentAddressDict[network];
}
