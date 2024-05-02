import { Candle, Orderbook, PairInfo, TokenInfo, Trade } from "alphadex-sdk-js";
import { OrderBookState } from "state/orderBookSlice";

export interface ExchangeState {
  allTokens: TokenInfo[];
  allPairs: PairInfo[];
  selectedPair: PairInfo | undefined;
  selectedPairTrades: Trade[];
  selectedPairOrderbook: Orderbook;
  selectedPairCandles: Candle[];
}
