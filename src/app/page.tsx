"use client";

enum Device {
  MOBILE = "MOBILE",
  DESKTOP = "DESKTOP",
}

const containerWidthAndPadding = "w-[1200px] max-w-[100vw] m-auto p-8 ";

export default function Landing() {
  return (
    <div className="bg-[#191B1D]">
      <HeroSection />
      <Tokenomics />
      <EarnByTrading />
      <StakeToEarnDextr />
      <EarnByContributing />
    </div>
  );
}

function HeroSection() {
  return (
    <div>
      <div className={`${containerWidthAndPadding} h-[calc(100vh-74px)]`}>
        {/* Header Section */}
        <div className="flex justify-center mt-28 relative">
          <div
            className={
              `flex flex-col items-start justify-center ` +
              `min-[820px]:max-w-[60%] max-[820px]:items-center max-[820px]:text-center z-50 `
            }
          >
            <img
              src="/dexter-logo-and-lettering.svg"
              alt="dexter logo and lettering"
              className="pb-4 min-[420px]:hidden"
            />
            <h1 className={`!m-0 z-100 max-[820px]:max-w-[600px]`}>
              Decentralized Order Book Exchange on Radix
            </h1>
            <div className="relative">
              <BackgroundLights type={Device.MOBILE} />
              <DexterButton title="TRADE NOW" targetUrl="/trade" />
            </div>
          </div>
          <div className="relative">
            <BackgroundLights type={Device.DESKTOP} />
            <img
              src="/landing/dexter-mascotte.png"
              alt="Dexter Mascotte"
              className={`w-[300px] z-[100] max-[820px]:hidden relative `}
            />
          </div>
        </div>
        {/* Icons */}
      </div>
    </div>
  );
}

function BackgroundLights({ type }: { type: Device }) {
  if (type === Device.DESKTOP) {
    return (
      <>
        <img
          src="/landing/blue-light.png"
          alt="blue light"
          className="absolute opacity-60 z-10 scale-[4] top-[200px] right-[-239px] "
        />
        <img
          src="/landing/green-light.png"
          alt="green light"
          className="absolute z-10 scale-[4] top-[-147px] right-[122px] "
        />
        <img
          src="/landing/background-structures.png"
          alt="background structures"
          className="absolute opacity-10 z-20 scale-[2.5] top-[0px]"
        />
      </>
    );
  }
  if (type === Device.MOBILE) {
    return (
      <div className="min-[820px]:hidden">
        <img
          src="/landing/blue-light.png"
          alt="blue light"
          className="absolute opacity-40 scale-[3] top-[-300%] left-[-50%] z-[-30] "
        />
        <img
          src="/landing/green-light.png"
          alt="green light"
          className="absolute opacity-100 scale-[3] top-[-200%] right-[-80%] z-[-30] "
        />
        <img
          src="/landing/background-structures.png"
          alt="background structures"
          className="absolute opacity-5 scale-[3] top-[-200%] right-[-50%] z-[-20] "
        />
      </div>
    );
  }
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
    <a href={targetUrl} className="z-100 min-w-[220px] max-w-[220px]">
      <button
        className={`min-h-[44px] w-[220px] uppercase px-4 my-6 mt-8 rounded bg-dexter-green-OG text-black opacity-100 cursor-pointer`}
      >
        <span className="font-bold text-sm tracking-[.1px] ">{title}</span>
      </button>
    </a>
  );
}
