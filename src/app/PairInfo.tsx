import { OrderBook } from "./OrderBook";
import { PriceChart } from "./PriceChart";
import { OrderButton } from "./OrderButton";
import { PairSelector } from "./PairSelector";

export function PairInfo() {
  // Main section of the page all the details about the selected pair

  return (
    <div>
      <PairSelector />
      <OrderButton />
      <PriceChart />
      <OrderBook />
    </div>
  );
}
