"use client";

import { useAppSelector } from "hooks";
import {
  useProvideLiquidityContext,
  ProvideLiquidityProvider,
  Distribution,
} from "./ProvideLiquidityContext";
import { Time, createChart } from "lightweight-charts";
import { useEffect, useRef, useState, ChangeEvent } from "react";
import {
  OrderSide,
  generateBatchOrderManifest,
  getBatchOrderItems,
} from "./provide-liquidity-utils";
import { BatchOrderItem } from "./provide-liquidity-utils";
import { PairSelector } from "components/PairSelector";
import { Calculator } from "services/Calculator";
import { getRdtOrThrow } from "subscriptions";
import { DexterToast } from "components/DexterToaster";
import { formatNumericString } from "../utils";

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
  const { token1, token2, address } = useAppSelector(
    (state) => state.pairSelector
  );
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
    token1address: token1.address,
    token2address: token2.address,
    pairAddress: address,
  });

  return (
    <div>
      <h4>Batch Order Summary</h4>
      <BarChart
        prices={batchOrderItems.map((o) => o.price)}
        amounts={batchOrderItems.map((o) => o.token1amount || 0)}
      />
      <BatchOrderSummaryTables batchOrderItems={batchOrderItems} />
    </div>
  );
}

function BatchOrderSummaryTables({
  batchOrderItems,
}: {
  batchOrderItems: BatchOrderItem[];
}) {
  return (
    <div className="flex">
      <div className="w-1/2 mx-1">
        <BatchOrderSummaryTable
          side={OrderSide.BUY}
          batchOrderItems={batchOrderItems.filter((i) => i.side === "BUY")}
        />
      </div>
      <div className="w-1/2 mx-1">
        <BatchOrderSummaryTable
          side={OrderSide.SELL}
          batchOrderItems={batchOrderItems.filter((i) => i.side === "SELL")}
        />
      </div>
    </div>
  );
}

function BatchOrderSummaryTable({
  batchOrderItems,
  side,
}: {
  batchOrderItems: BatchOrderItem[];
  side: OrderSide;
}) {
  const { token1, token2 } = useAppSelector((state) => state.pairSelector);
  return (
    <div>
      <p
        className={`font-bold text-center
          ${side === OrderSide.BUY ? "text-dexter-green" : "text-dexter-red"}
        `}
      >
        {side === OrderSide.BUY ? "Buy" : "Sell"} {token1.symbol.toUpperCase()}
      </p>
      <table className="text-sm my-2 text-center">
        <thead>
          <tr>
            <td className="text-sm">Qty ({token1.symbol.toUpperCase()})</td>
            <td className="text-sm">Price ({token2.symbol.toUpperCase()})</td>
          </tr>
        </thead>
        {batchOrderItems.map((batchOrderItem, indx) => {
          return (
            <tr
              className={`text-sm ${
                indx % 2 === 0 ? "bg-dexter-grey-dark" : ""
              }`}
              key={indx}
            >
              <td>{batchOrderItem.token1amount?.toFixed(4)}</td>
              <td>{batchOrderItem.price?.toFixed(4)}</td>
            </tr>
          );
        })}
      </table>
    </div>
  );
}

function BatchOrderForm() {
  const { lastPrice } = useAppSelector((state) => state.priceInfo);
  const { token1, token2, address } = useAppSelector(
    (state) => state.pairSelector
  );
  const {
    ["buySideLiq"]: [buySideLiq, setBuySideLiq],
    ["sellSideLiq"]: [sellSideLiq, setSellSideLiq],
    ["maintainLiqRatio"]: [maintainLiqRatio, setMaintainLiqRatio],
    ["distribution"]: [distribution, setDistribution],
    ["midPrice"]: [midPrice, setMidPrice],
    ["nbrOfOrders"]: [nbrOfOrders, setNbrOfOrders],
    ["percSteps"]: [percSteps],
  } = useProvideLiquidityContext();
  // Output the results
  const batchOrderItems = getBatchOrderItems({
    midPrice,
    nbrOfOrders,
    percSteps,
    distribution,
    buySideLiq,
    sellSideLiq,
    token1address: token1.address,
    token2address: token2.address,
    pairAddress: address,
  });

  return (
    <div className="pb-10">
      <h4>Create Batch Order DEXTR/XRD</h4>
      <div className="bg-[#232629] my-4">
        <PairSelector />
      </div>

      <div className="flex items-center justify-between h-10">
        <p className="text-base font-4bold">Select Liquidity Shape: </p>
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
        <p
          className="text-base font-bold underline cursor-pointer"
          onClick={() => setMidPrice(lastPrice)}
        >
          Last Price: {lastPrice}
        </p>
        <CustomNumericIMask
          value={midPrice}
          separator={"."}
          scale={4}
          onAccept={(e) => setMidPrice(parseFloat(e.toString()) || 0)}
          className="text-right w-20 !bg-base-100"
        />
      </div>

      <div className="flex items-center justify-between h-10">
        <p className="text-base font-bold">Number of Orders: </p>
        <select
          name="nbrOfOrders"
          id="nbrOfOrders"
          value={nbrOfOrders}
          onChange={(e) => setNbrOfOrders(Number(e.target.value))}
        >
          <option value={2}>2</option>
          <option value={4}>4</option>
          <option value={6}>6</option>
          <option value={8}>8</option>
        </select>
      </div>

      <div className="flex items-center justify-between h-10">
        <p className="text-base font-bold">
          Buy Side Liqudity (in {token1.symbol}):{" "}
        </p>
        <input
          id="buy-side-liquidity"
          className="text-right w-20 !bg-base-100"
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
        <p className="text-base font-bold">
          Sell Side Liqudity (in {token1.symbol}):{" "}
        </p>
        <input
          id="sell-side-liquidity"
          className="text-right w-20 !bg-base-100"
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
        <p className="!bg-base-100 w-20 text-right">
          {" "}
          {maintainLiqRatio ? "YES" : "NO"}
        </p>
      </div>

      <div>
        <p className="text-base font-bold"></p>
      </div>

      <SubmitTransactionButton batchOrderItems={batchOrderItems} />
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

function SubmitTransactionButton({
  batchOrderItems,
}: {
  batchOrderItems: BatchOrderItem[];
}) {
  const { walletData } = useAppSelector((state) => state.radix);
  const userAddress = walletData.accounts[0]?.address || "unknown";
  const submitBatchOrder = async () => {
    DexterToast.promise(
      async () => {
        const rdt = getRdtOrThrow();
        return await rdt.walletApi.sendTransaction({
          transactionManifest: generateBatchOrderManifest({
            batchOrderItems,
            userAddress,
          }),
          version: 1,
          message: "BatchOrder Using DeXter",
        });
      },
      "Submitting Batch Order",
      "Success",
      "Failed"
    );
  };
  return (
    <button
      className={
        `min-h-[40px] w-[220px] px-4 my-6 mt-8 rounded ` +
        `bg-dexter-green-OG text-black uppercase ` +
        `opacity-100 cursor-pointer `
      }
      onClick={submitBatchOrder}
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
        height: chartContainerRef.current.clientHeight,
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

  return (
    <div
      className="barchart w-full h-72 relative"
      ref={chartContainerRef}
    ></div>
  );
}

interface CustomNumericIMaskProps {
  value: number;
  separator: string;
  scale: number;
  className: string;
  onAccept: (value: number) => void;
}

function CustomNumericIMask({
  value,
  separator,
  scale,
  onAccept,
  className,
}: CustomNumericIMaskProps): JSX.Element | null {
  const [inputValue, setInputValue] = useState(value.toString());

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let { value } = e.target;
    // Automatically convert "," to "."
    value = value.replace(/,/g, separator).replace(/-/g, "");
    if (value.startsWith(".") || value.startsWith(",")) {
      value = value.substring(1, value.length);
    }
    if (value === "") {
      // If the input is cleared, set the internal state to an empty string
      // and reset token amount state to 0
      setInputValue("");
      onAccept(-1);
      return; // Exit early as there's no further processing needed
    }
    const formattedValue = formatNumericString(value, separator, scale);
    setInputValue(formattedValue);
    // Regex that limits precision to defined "scale" and allows a single
    // dot between digits or at the very end
    const regexForAccept = new RegExp(`^\\d+(\\.\\d{1,${scale}})?$`);
    if (regexForAccept.test(formattedValue)) {
      onAccept(parseFloat(formattedValue));
    }
  };

  // Update local state when the prop value changes
  useEffect(() => {
    setInputValue(formatNumericString(value.toString(), separator, scale));
  }, [value, separator, scale]);

  return (
    <input
      type="text"
      value={inputValue === "-1" ? "" : inputValue}
      onChange={handleChange}
      className={className} // Add TailwindCSS classes here
    />
  );
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
