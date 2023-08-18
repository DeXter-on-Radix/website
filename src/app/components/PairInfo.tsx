import { OrderBook } from "./OrderBook";
import { PriceChart } from "./PriceChart";
import { OrderInput } from "./OrderInput";
import { PairSelector } from "./PairSelector";

export function PairInfo() {
  // Main section of the page all the details about the selected pair

  return (
    <div>
      <PairSelector />
      <OrderInput />
      <PriceChart />
      <OrderBook />
    </div>
  );
}
