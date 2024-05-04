const containerWidthAndPadding = "w-[1200px] m-auto p-4 ";

export default function Landing() {
  return (
    <div className="bg-[#191B1D]">
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
    <div className={`bg-[url('/landing/background-nolights.png')]`}>
      <div className={`${containerWidthAndPadding} h-[1100px]`}>Header</div>
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
