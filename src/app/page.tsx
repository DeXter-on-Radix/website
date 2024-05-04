"use client";

const containerWidthAndPadding = "w-[1200px] max-w-[100vw] m-auto p-4 ";

export default function Landing() {
  return (
    <div className="bg-[#191B1D]">
      <AnimatedLight />
      <HeaderSection />
      <Tokenomics />
      <EarnByTrading />
      <StakeToEarnDextr />
      <EarnByContributing />
    </div>
  );
}

function HeaderSection() {
  return (
    <div
      className={`bg-[url('/landing/background-nolights.png')] bg-contain bg-no-repeat`}
    >
      <div className={`${containerWidthAndPadding} h-[1100px]`}>
        {/* Hero Section */}
        <div className="flex mt-28">
          <div className="flex flex-col items-start justify-center max-w-[60%]">
            <h1 className="!m-0">Decentralized Order Book Exchange on Radix</h1>
            <DexterButton title="TRADE NOW" />
          </div>
          <img
            src="/landing/dexter-mascotte.png"
            alt="Dexter Mascotte"
            className="w-[300px]"
          />
        </div>
        {/* Icons */}
      </div>
    </div>
  );
}
function Tokenomics() {
  return (
    <div className={`bg-[#141414]`}>
      <div className={`${containerWidthAndPadding} `}>Tokenomics</div>
    </div>
  );
}
function EarnByTrading() {
  return <div className={`${containerWidthAndPadding} `}>EarnByTrading</div>;
}
function StakeToEarnDextr() {
  return (
    <div className={`bg-[#141414]`}>
      <div className={`${containerWidthAndPadding} `}>StakeToEarnDextr</div>
    </div>
  );
}
function EarnByContributing() {
  return (
    <div className={`${containerWidthAndPadding} `}>EarnByContributing</div>
  );
}

interface DexterButtonProps {
  title: string;
}

function DexterButton({ title }: DexterButtonProps) {
  return (
    <button
      className={`max-w-[220px] min-h-[44px] uppercase w-full px-4 my-6 mt-8 rounded bg-dexter-green-OG text-black opacity-100`}
      onClick={() => alert("Not implemented yet!")}
    >
      <span className="font-bold text-sm tracking-[.1px] ">{title}</span>
    </button>
  );
}

function AnimatedLight() {
  return (
    <div className="light-container">
      <div className="animated-light"></div>
    </div>
  );
}
