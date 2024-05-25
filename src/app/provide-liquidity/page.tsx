"use client";

import { useAppSelector } from "hooks";
import {
  useProvideLiquidity,
  ProvideLiquidityProvider,
  Distribution,
} from "./ProvideLiquidityContext";

// Hardcoded stokenet addresses
// const dextrResource =
//   "resource_tdx_2_1tkutsk75mpp8ngyzuf0t29zvtdr8empwvswmmcefelmwxzw45haeuv";
// const dextrXrdPair =
//   "component_tdx_2_1cqee79vy0dkv34jrqe8zs6czdqjnx5jq5tpeyum54ewxtthvwz3t0c";

export default function ProvideLiquidity() {
  // const { isConnected, walletData } = useAppSelector((state) => state.radix);

  return (
    <ProvideLiquidityProvider>
      <div className="bg-[#141414] h-full">
        <div className="max-w-[800px] m-auto">
          <HeaderComponent />
          <WalletStatus />
          <div className="flex">
            <div className="w-1/2 px-4">
              <CreateBatchOrderForm />
            </div>
            <div className="w-1/2 px-4">
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

function BatchOrderSummary() {
  const {
    ["buySideLiq"]: [buySideLiq],
    ["sellSideLiq"]: [sellSideLiq],
    ["distribution"]: [distribution],
    ["midPrice"]: [midPrice],
  } = useProvideLiquidity();

  return (
    <div>
      <h4>Summary</h4>
      <p className="text-base">Buy side liquidity is set to {buySideLiq} XRD</p>
      <p className="text-base">
        Sell side liquidity is set to {sellSideLiq} XRD
      </p>
      <p className="text-base">Selected distribution: {distribution}</p>
      <p className="text-base">Mid Price: {midPrice}</p>
    </div>
  );
}

function CreateBatchOrderForm() {
  const {
    ["buySideLiq"]: [buySideLiq, setBuySideLiq],
    ["sellSideLiq"]: [sellSideLiq, setSellSideLiq],
    ["distribution"]: [distribution, setDistribution],
    ["midPrice"]: [midPrice, setMidPrice],
    ["bins"]: [bins],
  } = useProvideLiquidity();

  return (
    <div className="pb-20">
      <h4>Create Batch Order DEXTR/XRD</h4>

      <div className="flex items-center justify-between h-10">
        <p className="text-base font-bold">Pair: </p>
        <select name="pair" id="pair">
          <option value="dextr/xrd">DEXTR/XRD</option>
        </select>
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
          className="text-right w-40 cursor-not-allowed"
          type="text"
          value="2%"
          disabled
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
          className="text-right w-40 cursor-not-allowed"
          type="text"
          value={bins}
          disabled
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
