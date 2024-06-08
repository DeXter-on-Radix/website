import { Calculator } from "../services/Calculator";
import { Distribution } from "./ProvideLiquidityContext";

enum OrderSide {
  BUY = "BUY",
  SELL = "SELL",
}

interface BatchOrderItem {
  side: OrderSide;
  id: string;
  index: number;
  price: number;
  token1amount?: number;
  token2amount?: number;
}

interface GetBatchOrderItemsInputs {
  midPrice: number;
  nbrOfOrders: number;
  percSteps: number;
  distribution: Distribution;
  buySideLiq: number;
  sellSideLiq: number;
}

export function getBatchOrderItems({
  midPrice,
  nbrOfOrders,
  percSteps = 0.02,
  distribution,
  buySideLiq,
  sellSideLiq,
}: GetBatchOrderItemsInputs) {
  const batchOrderItems = getInitializedBatchOrderItems(
    midPrice,
    nbrOfOrders,
    percSteps
  );
  if (distribution === Distribution.LINEAR) {
    return distributeLinearLiquidity(batchOrderItems, sellSideLiq, buySideLiq);
  }
  const reversed = distribution === Distribution.MID_DISTRIBUTION;
  return distributeExponentialLiqudity(
    batchOrderItems,
    buySideLiq,
    sellSideLiq,
    reversed
  );
}

function distributeLinearLiquidity(
  batchOrders: BatchOrderItem[],
  sellSideLiq: number,
  buySideLiq: number
): BatchOrderItem[] {
  const bins = batchOrders.length / 2;
  batchOrders.forEach((batchOrderItem) => {
    batchOrderItem.token1amount = Calculator.divide(
      batchOrderItem.side === "BUY" ? buySideLiq : sellSideLiq,
      bins
    );
    batchOrderItem.token2amount = Calculator.multiply(
      batchOrderItem.token1amount,
      batchOrderItem.price
    );
  });
  return batchOrders;
}

function distributeExponentialLiqudity(
  batchOrderItems: BatchOrderItem[],
  buySideLiq: number,
  sellSideLiq: number,
  reversed?: boolean
): BatchOrderItem[] {
  const halfBins = batchOrderItems.length / 2;
  const base = 2;
  let ratios = Array.from({ length: halfBins }, (_, i) => Math.pow(base, i));
  if (reversed) {
    ratios = ratios.reverse();
  }
  const sumOfRatios = ratios.reduce((a, b) => a + b, 0);
  const normalizedRatios = ratios.map((ratio) => ratio / sumOfRatios);

  const buyAmounts = normalizedRatios.map((ratio) => ratio * buySideLiq);
  const sellAmounts = normalizedRatios.map((ratio) => ratio * sellSideLiq);
  const fullAmounts = [buyAmounts.reverse(), sellAmounts].flat();
  fullAmounts.forEach((amount, index) => {
    batchOrderItems[index].token1amount = amount;
    batchOrderItems[index].token2amount = Calculator.multiply(
      amount,
      batchOrderItems[index].price
    );
  });
  return batchOrderItems;
}

function getInitializedBatchOrderItems(
  midPrice: number,
  nbrOfOrders: number,
  percSteps: number
): BatchOrderItem[] {
  // Init batchOrderItems
  let bucketCount = 1;
  const batchOrderItems: BatchOrderItem[] = [];
  // 1. Create buy batchOrderItems
  const bins = nbrOfOrders / 2;
  for (let i = -bins; i <= bins; i++) {
    if (i === 0) {
      continue;
    }
    batchOrderItems.push({
      side: i < 0 ? OrderSide.BUY : OrderSide.SELL,
      id: `Bucket_${bucketCount++}`,
      index: i,
      price: Calculator.add(
        midPrice,
        Calculator.multiply(Calculator.multiply(midPrice, i), percSteps)
      ),
    } as BatchOrderItem);
  }
  return batchOrderItems;
}

export function roundDownToEven(x: number): number {
  const numbers = [2, 4, 6, 8];
  // If x is less than the first number in the array
  if (x < numbers[0]) {
    return numbers[0];
  }
  // Iterate backwards to find the largest number <= x
  for (let i = numbers.length - 1; i >= 0; i--) {
    if (x >= numbers[i]) {
      return numbers[i];
    }
  }
  // Default to the smallest number (safety net, technically not needed here)
  return numbers[0];
}
