import { Calculator } from "../services/Calculator";
import { Distribution } from "./ProvideLiquidityContext";
import { roundTo, RoundType } from "utils";

export enum OrderSide {
  BUY = "BUY",
  SELL = "SELL",
}

export interface BatchOrderItem {
  side: OrderSide;
  id: string;
  index: number;
  price: number;
  token1address: string;
  token2address: string;
  pairAddress: string;
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
  token1address: string;
  token2address: string;
  pairAddress: string;
}

export function getBatchOrderItems({
  midPrice,
  nbrOfOrders,
  percSteps = 0.02,
  distribution,
  buySideLiq,
  sellSideLiq,
  token1address,
  token2address,
  pairAddress,
}: GetBatchOrderItemsInputs) {
  const batchOrderItems = getInitializedBatchOrderItems(
    midPrice,
    nbrOfOrders,
    percSteps,
    token1address,
    token2address,
    pairAddress
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
      roundTo(batchOrderItem.token1amount, 8, RoundType.NEAREST),
      roundTo(batchOrderItem.price, 4, RoundType.NEAREST)
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
    batchOrderItems[index].token1amount = roundTo(amount, 8, RoundType.NEAREST);
    batchOrderItems[index].token2amount = roundTo(
      Calculator.multiply(amount, batchOrderItems[index].price),
      8,
      RoundType.NEAREST
    );
  });
  return batchOrderItems;
}

function getInitializedBatchOrderItems(
  midPrice: number,
  nbrOfOrders: number,
  percSteps: number,
  token1address: string,
  token2address: string,
  pairAddress: string
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
      price: roundTo(
        Calculator.add(
          midPrice,
          Calculator.multiply(Calculator.multiply(midPrice, i), percSteps)
        ),
        4,
        RoundType.NEAREST
      ),
      token1address,
      token2address,
      pairAddress,
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

// Get BatchOrder Manifest
export function generateBatchOrderManifest({
  batchOrderItems,
  userAddress,
}: {
  batchOrderItems: BatchOrderItem[];
  userAddress: string;
}): string {
  const { token1address, token2address } = batchOrderItems[0];
  const token1total = batchOrderItems
    .filter((o) => o.side === "SELL")
    .map((o) => roundTo(o.token1amount || 0, 8, RoundType.NEAREST))
    .reduce((a, b) => Calculator.add(a, b));
  const token2total = batchOrderItems
    .filter((o) => o.side === "BUY")
    .map((o) =>
      Calculator.multiply(
        roundTo(o.token1amount || 0, 8, RoundType.NEAREST),
        o.price
      )
    )
    .reduce((a, b) => Calculator.add(a, b));

  const individualOrderManifests = batchOrderItems
    .map((i) => generateOrderManifest(i, userAddress))
    .join("\n\n");

  const batchOrderManifest = `
    CALL_METHOD
      Address("${userAddress}")
      "withdraw"
      Address("${token1address}")
      Decimal("${token1total}");
    CALL_METHOD
      Address("${userAddress}")
      "withdraw"
      Address("${token2address}")
      Decimal("${token2total}");

    ${individualOrderManifests}
    
    CALL_METHOD 
      Address("${userAddress}") 
      "deposit_batch" 
      Expression("ENTIRE_WORKTOP");`;
  console.log(batchOrderManifest);
  return batchOrderManifest;
}

/**
 * MANIFEST GENERATION: Single Orders
 */
export function generateOrderManifest(
  batchOrderItem: BatchOrderItem,
  userAddress: string
): string {
  const {
    id,
    price,
    side,
    token1amount,
    //token2amount,
    token1address,
    token2address,
    pairAddress,
  } = batchOrderItem;

  //Adjust for rounding

  const adjustedAmount =
    (side === "BUY"
      ? Calculator.multiply(token1amount || 0, price)
      : token1amount) || 0;
  return `
      TAKE_FROM_WORKTOP 
        Address("${side === "BUY" ? token2address : token1address}") 
        Decimal("${adjustedAmount}") 
        Bucket("${id}");
      CALL_METHOD
        Address("${pairAddress}")
        "new_limit_order"
        "POSTONLY"
        "${side}"
        Address("${token1address}")
        Decimal("${token1amount}")
        Decimal("${price}")
        Bucket("${id}")
        4u32 Address("${userAddress}");
    `;
}
