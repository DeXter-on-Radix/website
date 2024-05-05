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
    // className={`bg-[url('/landing/background-nolights.png')] bg-contain bg-no-repeat`}
    >
      <div
        className={`${containerWidthAndPadding} min-h-[800px] h-[calc(100vh-74px)]`}
      >
        {/* Hero Section */}
        <div className="flex justify-center mt-28 relative">
          <img
            src="/landing/blue-light.png"
            alt="blue light"
            className="absolute top-[-218px] right-[-411px] z-20"
          />
          <img
            src="/landing/green-light.png"
            alt="green light"
            className="absolute top-[-485px] right-[-112px] z-20"
          />
          <img
            src="/landing/background-structures.png"
            alt="background structures"
            className="absolute w-[700px] opacity-10 z-10 top-[-213px] right-[-112px]"
          />
          <div className="flex flex-col items-start justify-center max-w-[60%]">
            <h1 className="!m-0 z-30">
              Decentralized Order Book Exchange on Radix
            </h1>
            <DexterButton title="TRADE NOW" targetUrl="/trade" />
          </div>
          <img
            src="/landing/dexter-mascotte.png"
            alt="Dexter Mascotte"
            className="w-[300px] z-30"
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
  targetUrl?: string;
}

function DexterButton({ title, targetUrl }: DexterButtonProps) {
  return (
    <a href={targetUrl} className="z-50 w-full max-w-[220px]">
      <button
        className={`max-w-[220px] min-h-[44px] uppercase w-full px-4 my-6 mt-8 rounded bg-dexter-green-OG text-black opacity-100 cursor-pointer`}
      >
        <span className="font-bold text-sm tracking-[.1px] ">{title}</span>
      </button>
    </a>
  );
}

function AnimatedLight() {
  return (
    <div className="light-container">
      <div className="animated-light"></div>
    </div>
  );
}
