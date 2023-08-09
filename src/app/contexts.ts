import { createContext } from "react";
import { StaticState, clientState } from "alphadex-sdk-js";
import { RadixDappToolkit, WalletData } from "@radixdlt/radix-dapp-toolkit";
import { GatewayApiClient } from "@radixdlt/babylon-gateway-api-sdk";

export const WalletContext = createContext<WalletData | null>(null);

export const RdtContext = createContext<RadixDappToolkit | null>(null);

export const GatewayContext = createContext<GatewayApiClient | null>(null);

export const initialStaticState = new StaticState(clientState.internalState);

export const AdexStateContext = createContext<StaticState>(initialStaticState);
