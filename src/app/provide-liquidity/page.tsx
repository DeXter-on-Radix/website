"use client";

import { useAppSelector } from "hooks";
import {
  useProvideLiquidityContext,
  ProvideLiquidityProvider,
  Distribution,
} from "./ProvideLiquidityContext";
import { Time, createChart } from "lightweight-charts";
import { useEffect, useRef } from "react";
import { Calculator } from "services/Calculator";

// Hardcoded stokenet addresses
// const dextrResource =
//   "resource_tdx_2_1tkutsk75mpp8ngyzuf0t29zvtdr8empwvswmmcefelmwxzw45haeuv";
// const dextrXrdPair =
//   "component_tdx_2_1cqee79vy0dkv34jrqe8zs6czdqjnx5jq5tpeyum54ewxtthvwz3t0c";

export default function ProvideLiquidity() {
  return (
    <ProvideLiquidityProvider>
      <div className="bg-[#141414] grow pb-20">
        <div className="max-w-[1200px] m-auto">
          <HeaderComponent />
          <WalletStatus />
          <div className="flex flex-row">
            <div className="w-1/2 px-10">
              <CreateBatchOrderForm />
            </div>
            <div className="w-1/2 px-10">
              <BatchOrderSummary />
            </div>
          </div>
        </div>
      </div>
    </ProvideLiquidityProvider>
  );
}

function WalletStatus() {
  const { isConnected, walletData } = useAppSelector((state) => state.radix);
  return (
    <>
      {!isConnected && (
        <div className="p-6 bg-slate-700 font-bold">PLEASE CONNECT WALLET</div>
      )}
      {isConnected && (
        <div className="p-6 bg-slate-700 text-base">
          <p className="font-bold text-base">Connected Address</p>
          <p>{walletData.accounts[0].address}</p>
        </div>
      )}
    </>
  );
}

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
    batchOrderItems[index].token2amount = amount / batchOrderItems[index].price;
  });
  return batchOrderItems;
}

function getInitializedBatchOrderItems(
  midPrice: number,
  bins: number,
  percSteps: number
): BatchOrderItem[] {
  // Init batchOrderItems
  let bucketCount = 1;
  const batchOrderItems: BatchOrderItem[] = [];
  // 1. Create buy batchOrderItems
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

interface GetBatchOrderItemsProps {
  midPrice: number;
  bins: number;
  percSteps: number;
  distribution: Distribution;
  buySideLiq: number;
  sellSideLiq: number;
}

function getBatchOrderItems({
  midPrice,
  bins,
  percSteps,
  distribution,
  buySideLiq,
  sellSideLiq,
}: GetBatchOrderItemsProps) {
  const batchOrderItems = getInitializedBatchOrderItems(
    midPrice,
    bins,
    percSteps
  );
  if (distribution === Distribution.LINEAR) {
    return distributeLinearLiquidity(batchOrderItems, sellSideLiq, buySideLiq);
  }
  return distributeExponentialLiqudity(
    batchOrderItems,
    buySideLiq,
    sellSideLiq,
    distribution === Distribution.MID_DISTRIBUTION
  );
}

function BatchOrderSummary() {
  const {
    ["buySideLiq"]: [buySideLiq],
    ["sellSideLiq"]: [sellSideLiq],
    ["midPrice"]: [midPrice],
    ["bins"]: [bins],
    ["percSteps"]: [percSteps],
    ["distribution"]: [distribution],
  } = useProvideLiquidityContext();

  // Output the results
  const batchOrderItems = getBatchOrderItems({
    midPrice,
    bins,
    percSteps,
    distribution,
    buySideLiq,
    sellSideLiq,
  });
  return (
    <div>
      <h4>Batch Order Summary</h4>
      <BarChart
        prices={batchOrderItems.map((o) => o.price)}
        amounts={batchOrderItems.map((o) => o.token1amount || 0)}
      />
      {batchOrderItems.map(
        ({ side, price, token1amount, token2amount, id }) => {
          return (
            <div className="text-base" key={id}>
              <p>
                <span className="font-bold">{id}: </span>
                {side} {token1amount} DEXTR for {token2amount} XRD at price{" "}
                {price.toFixed(4)}
              </p>
            </div>
          );
        }
      )}
    </div>
  );
}

function CreateBatchOrderForm() {
  const {
    ["buySideLiq"]: [buySideLiq, setBuySideLiq],
    ["sellSideLiq"]: [sellSideLiq, setSellSideLiq],
    ["distribution"]: [distribution, setDistribution],
    ["midPrice"]: [midPrice, setMidPrice],
    ["bins"]: [bins, setBins],
    ["percSteps"]: [percSteps, setPercSteps],
  } = useProvideLiquidityContext();

  return (
    <div className="pb-10">
      <h4>Create Batch Order DEXTR/XRD</h4>

      <div className="flex items-center justify-between h-10">
        <p className="text-base font-bold">Pair: </p>
        <select name="pair" id="pair">
          <option value="dextr/xrd">DEXTR/XRD</option>
        </select>
      </div>

      <div className="flex items-center justify-between h-10">
        <p className="text-base font-bold">Buy Side Liqudity: </p>
        <input
          id="buy-side-liquidity"
          className="text-right w-40"
          type="text"
          value={buySideLiq}
          onChange={(e) => setBuySideLiq(parseFloat(e.target.value) || 0)}
          autoComplete="off"
        />
      </div>

      <div className="flex items-center justify-between h-10">
        <p className="text-base font-bold">Sell Side Liqudity: </p>
        <input
          id="sell-side-liquidity"
          className="text-right w-40"
          type="text"
          value={sellSideLiq}
          onChange={(e) => setSellSideLiq(parseFloat(e.target.value) || 0)}
          autoComplete="off"
        />
      </div>

      <div className="flex items-center justify-between h-10">
        <p className="text-base font-bold">Distribution: </p>
        <select
          name="distribution"
          id="distribution"
          value={distribution}
          onChange={(e) => setDistribution(e.target.value as Distribution)}
        >
          <option value={Distribution.LINEAR}>Linear</option>
          <option value={Distribution.MID_DISTRIBUTION}>
            Mid Distribution
          </option>
          <option value={Distribution.EXTREMES}>Extremes</option>
        </select>
      </div>

      <div className="flex items-center justify-between h-10">
        <p className="text-base font-bold">Mid Price: </p>
        <input
          className="text-right w-40"
          type="text"
          value={midPrice}
          onChange={(e) => setMidPrice(parseFloat(e.target.value) || 0)}
          autoComplete="off"
        />
      </div>

      <div className="flex items-center justify-between h-10">
        <p className="text-base font-bold">% Steps: </p>
        <input
          className="text-right w-40"
          type="text"
          value={percSteps}
          onChange={(e) => setPercSteps(parseFloat(e.target.value) || 0)}
        />
      </div>

      <div className="flex items-center justify-between h-10">
        <p className="text-base font-bold">Decimals: </p>
        <input
          className="text-right w-40 cursor-not-allowed"
          type="text"
          value="8"
          disabled
        />
      </div>

      <div className="flex items-center justify-between h-10">
        <p className="text-base font-bold">Bins: </p>
        <input
          className="text-right w-40"
          type="text"
          value={bins}
          onChange={(e) => setBins(Number(e.target.value) || 0)}
        />
      </div>

      <SubmitTransactionButton />
    </div>
  );
}

function HeaderComponent() {
  return (
    <div className="flex flex-col justify-start h-full mt-20">
      <DexterHeading title={"Provide Liquidity via Batch Orders"} />
      <DexterParagraph
        text={
          "This tool allows you to set multiple orders around the market price in a single transaction."
        }
      />
    </div>
  );
}

function DexterParagraph({ text }: { text: string }) {
  return <p className="text-sm tracking-wide py-2">{text}</p>;
}

function DexterHeading({ title }: { title: string }) {
  return (
    <>
      <h2
        className="text-md bg-gradient-to-r from-dexter-gradient-blue to-dexter-gradient-green to-50% bg-clip-text text-transparent font-normal"
        style={{
          margin: 0,
          marginBottom: "20px",
          marginTop: "0px",
          fontSize: "45px",
        }}
      >
        {title}
      </h2>
    </>
  );
}

function SubmitTransactionButton() {
  const handleClick = () => {
    alert("handling batch transaction not implemented yet");
  };
  return (
    <button
      className={
        `min-h-[44px] w-[220px] px-4 my-6 mt-8 rounded ` +
        `bg-dexter-green-OG text-black uppercase ` +
        `opacity-100 cursor-pointer `
      }
      onClick={handleClick}
    >
      <span className="font-bold text-sm tracking-[.1px] ">
        SUBMIT TRANSACTION
      </span>
    </button>
  );
}

interface BarChartProps {
  prices: number[];
  amounts: number[];
}

function BarChart({ prices, amounts }: BarChartProps) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chartContainerRef.current) {
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 300,
      });

      const barSeries = chart.addHistogramSeries();

      // Generate date strings in the yyyy-mm-dd format
      const startDate = new Date(2024, 0, 1); // Arbitrary start date: January 1, 2024
      const data = prices.map((price, index) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + index); // Increment the day for each data point
        const dateString = date.toISOString().split("T")[0]; // Convert to yyyy-mm-dd format
        return {
          time: dateString as Time,
          value: amounts[index],
        };
      });
      barSeries.setData(data);

      // Fit the chart content to show all bars
      chart.timeScale().fitContent();

      return () => {
        chart.remove();
      };
    }
  }, [prices, amounts]);

  return <div ref={chartContainerRef}></div>;
}

// GENERATE TRANSACTION MANIFEST TEST
// GENERATE TRANSACTION MANIFEST TEST
// GENERATE TRANSACTION MANIFEST TEST
// GENERATE TRANSACTION MANIFEST TEST
// GENERATE TRANSACTION MANIFEST TEST
// function generateCommand(
//   B1: string,
//   B3: string,
//   B7: string,
//   B8: string,
//   B9: string,
//   row24: string[]
// ) {
//   const address1 = `Address("${B1}")`;
//   const address3 = `Address("${B3}")`;
//   const address7 = `Address("${B7}")`;
//   const decimal8 = `Decimal("${B8}")`;
//   const decimal9 = `Decimal("${B9}")`;
//   const row24Concat = row24.join("");

//   const part1 = `CALL_METHOD ${address1} "withdraw" ${address3} ${decimal8}; `;
//   const part2 = `CALL_METHOD ${address1} "withdraw" ${address7} ${decimal9}; `;
//   const part3 = `CALL_METHOD ${address1} "deposit_batch" Expression("ENTIRE_WORKTOP");`;

//   const command = `${part1}${part2}${row24Concat} ${part3}`;

//   return command;
// }

// // Example usage:
// const B1 = "value1"; // Account -> account_tdx_2_128t0tnge6cvufl8rc2nj6ushlamuk4fcl4ll889v4fhv57algulas9
// const B3 = "value3"; // Dexter Resource -> resource_tdx_2_1tkutsk75mpp8ngyzuf0t29zvtdr8empwvswmmcefelmwxzw45haeuv
// const B7 = "value7"; // Radix resource -> resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc
// const B8 = "value8"; // token 1 quantity
// const B9 = "value9"; // token 2 quantity
// const row24 = ["value24A", "value24B", "value24C"]; // C24:M24 values as an array

// const result = generateCommand(B1, B3, B7, B8, B9, row24);
// console.log(result);
