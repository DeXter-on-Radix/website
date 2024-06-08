"use client";

import { useAppSelector } from "hooks";
import {
  useProvideLiquidityContext,
  ProvideLiquidityProvider,
  Distribution,
} from "./ProvideLiquidityContext";
import { Time, createChart } from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import { getBatchOrderItems, roundDownToEven } from "./provide-liquidity-utils";
import { PairSelector } from "components/PairSelector";
import { Calculator } from "services/Calculator";

export default function ProvideLiquidity() {
  return (
    <ProvideLiquidityProvider>
      <div className="bg-[#1a1c1e] grow pb-20">
        <div className=" max-w-[800px] m-auto">
          <HeaderComponent />
          <WalletStatus />
          <div className="flex max-[800px]:flex-col">
            <div className="w-1/2 max-[800px]:w-full px-5">
              <BatchOrderForm />
            </div>
            <div className="w-1/2 max-[800px]:w-full px-5">
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

  // Prevent hydration error
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  if (!isClient) {
    return <></>;
  }

  return (
    <>
      {!isConnected && (
        <div className="p-6 bg-slate-700 font-bold">
          <p>PLEASE CONNECT WALLET</p>
        </div>
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

function BatchOrderSummary() {
  const {
    ["buySideLiq"]: [buySideLiq],
    ["sellSideLiq"]: [sellSideLiq],
    ["midPrice"]: [midPrice],
    ["nbrOfOrders"]: [nbrOfOrders],
    ["percSteps"]: [percSteps],
    ["distribution"]: [distribution],
  } = useProvideLiquidityContext();

  // Output the results
  const batchOrderItems = getBatchOrderItems({
    midPrice,
    nbrOfOrders,
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
            <div className="text-sm" key={id}>
              <p>
                <span className="font-bold">{id}: </span>
                <span
                  className={
                    (side === "BUY" ? "text-dexter-green" : "text-dexter-red") +
                    " font-bold"
                  }
                >
                  {side}
                </span>{" "}
                {token1amount} DEXTR for {token2amount} XRD at price{" "}
                {price.toFixed(4)}
              </p>
            </div>
          );
        }
      )}
    </div>
  );
}

function BatchOrderForm() {
  const { lastPrice } = useAppSelector((state) => state.priceInfo);
  const {
    ["buySideLiq"]: [buySideLiq, setBuySideLiq],
    ["sellSideLiq"]: [sellSideLiq, setSellSideLiq],
    ["maintainLiqRatio"]: [maintainLiqRatio, setMaintainLiqRatio],
    ["distribution"]: [distribution, setDistribution],
    ["midPrice"]: [midPrice, setMidPrice],
    ["nbrOfOrders"]: [nbrOfOrders, setNbrOfOrders],
  } = useProvideLiquidityContext();

  useEffect(() => {
    setMidPrice(lastPrice);
  });

  return (
    <div className="pb-10">
      <h4>Create Batch Order DEXTR/XRD</h4>
      <div className="bg-[#232629] my-4">
        <PairSelector />
      </div>

      <div className="">
        <p className="text-base font-bold">Select Liquidity Shape: </p>
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
        <p className="text-base font-bold">Number of Orders: </p>
        <input
          className="text-right w-40"
          type="text"
          value={nbrOfOrders}
          onChange={(e) =>
            setNbrOfOrders(roundDownToEven(Number(e.target.value) || 0))
          }
        />
      </div>

      <div className="flex items-center justify-between h-10">
        <p className="text-base font-bold">Buy Side Liqudity: </p>
        <input
          id="buy-side-liquidity"
          className="text-right w-40"
          type="text"
          value={buySideLiq}
          onChange={(e) => {
            const newBuySideLiq = parseFloat(e.target.value) || 0;
            if (maintainLiqRatio && buySideLiq > 0) {
              if (sellSideLiq > 0) {
                const multiplier = Calculator.divide(newBuySideLiq, buySideLiq);
                setSellSideLiq(Calculator.multiply(sellSideLiq, multiplier));
              } else if (sellSideLiq === 0) {
                setSellSideLiq(newBuySideLiq);
              }
            }
            setBuySideLiq(newBuySideLiq);
          }}
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
          onChange={(e) => {
            const newSellSideLiq = parseFloat(e.target.value) || 0;
            if (maintainLiqRatio && sellSideLiq > 0) {
              if (buySideLiq > 0) {
                const multiplier = Calculator.divide(
                  newSellSideLiq,
                  sellSideLiq
                );
                setBuySideLiq(Calculator.multiply(buySideLiq, multiplier));
              } else if (buySideLiq === 0) {
                setBuySideLiq(newSellSideLiq);
              }
            }
            setSellSideLiq(newSellSideLiq);
          }}
          autoComplete="off"
        />
      </div>

      <div
        className="flex items-center justify-between h-10 cursor-pointer"
        onClick={() => setMaintainLiqRatio(!maintainLiqRatio)}
      >
        <p className="text-base font-bold ">Maintain Liq Ratio:</p>
        <p className=""> {maintainLiqRatio ? "YES" : "NO"}</p>
      </div>

      <div>
        <p className="text-base font-bold"></p>
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
//   account: string,
//   token1res: string,
//   token2res: string,
//   token1amount: string,
//   token2amount: string,
//   row24: string[]
// ) {
//   const address1 = `Address("${account}")`;
//   const address3 = `Address("${token1res}")`;
//   const address7 = `Address("${token2res}")`;
//   const decimal8 = `Decimal("${token1amount}")`;
//   const decimal9 = `Decimal("${token2amount}")`;
//   const row24Concat = row24.join("");

//   const part1 = `CALL_METHOD ${address1} "withdraw" ${address3} ${decimal8}; `;
//   const part2 = `CALL_METHOD ${address1} "withdraw" ${address7} ${decimal9}; `;
//   const part3 = `CALL_METHOD ${address1} "deposit_batch" Expression("ENTIRE_WORKTOP");`;

//   const command = `${part1}${part2}${row24Concat} ${part3}`;

//   return command;
// }

// // Example usage:
// const account = "account_tdx_2_128t0tnge6cvufl8rc2nj6ushlamuk4fcl4ll889v4fhv57algulas9";
// const token1res = "resource_tdx_2_1tkutsk75mpp8ngyzuf0t29zvtdr8empwvswmmcefelmwxzw45haeuv"; // Dexter Resource
// const token2res = "resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc"; // Radix resource
// const token1amount = "2000"; // token 1 quantity
// const token2amount = "4000"; // token 2 quantity
// const row24 = ["value24A", "value24B", "value24C"]; // C24:M24 values as an array

// const result = generateCommand(account, token1res, token2res, token1amount, token2amount, row24);
// console.log(result);

/**
 * MANIFEST GENERATION: Single Orders
 */
interface GenerateOrderManifestInputs {
  userAccountAddress: string;
  token1resourceAddress: string;
  token2resourceAddress: string;
  adexTradePairComponent: string;
  bucketId: string;
  orderPrice: number;
  orderAmount: number;
  side: OrderSide;
  newResourceAmount: number;
}

function generateOrderManifest({
  userAccountAddress,
  token1resourceAddress,
  token2resourceAddress,
  adexTradePairComponent,
  bucketId,
  orderPrice,
  orderAmount,
  side,
  newResourceAmount,
}: GenerateOrderManifestInputs): string {
  if (newResourceAmount === 0) {
    return "";
  }
  return (
    `TAKE_FROM_WORKTOP Address("${token2resourceAddress}") Decimal("${newResourceAmount}") Bucket("bucket${bucketId}"); ` +
    `\nCALL_METHOD Address("${adexTradePairComponent}") "new_limit_order" "POSTONLY" "${side}" Address("${token1resourceAddress}") ` +
    `Decimal("${orderAmount}") Decimal("${orderPrice}") Bucket("bucket${bucketId}") 4u32 Address("${userAccountAddress}");`
  );
}

// Example usage:
// const userAccountAddress =
//   "account_tdx_2_128t0tnge6cvufl8rc2nj6ushlamuk4fcl4ll889v4fhv57algulas9";
// const token1resourceAddress =
//   "resource_tdx_2_1tkutsk75mpp8ngyzuf0t29zvtdr8empwvswmmcefelmwxzw45haeuv";
// const token2resourceAddress =
//   "resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc";
// const adexTradePairComponent =
//   "component_tdx_2_1cqee79vy0dkv34jrqe8zs6czdqjnx5jq5tpeyum54ewxtthvwz3t0c";
// const side = OrderSide.BUY;
// const bucketId = "j"; // Change this to your value
// const orderAmount = 966.666666666667; // Change this to your value
// const orderPrice = 1.89; // Change this to your value
// const newResourceAmount = 1827; // Change this to your value
// const result = generateOrderManifest({
//   userAccountAddress,
//   token1resourceAddress,
//   adexTradePairComponent,
//   token2resourceAddress,
//   bucketId,
//   orderAmount,
//   orderPrice,
//   side,
//   newResourceAmount,
// });
// console.log(result);
