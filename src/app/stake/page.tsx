"use client";

export default function Stake() {
  return (
    <div>
      <div className="max-w-screen-md mx-auto py-28">
        <div className="flex flex-row">
          <div className="flex flex-col my-auto">
            <h1
              className="!m-0 !mb-8 text-5xl text-md bg-gradient-to-r
      from-dexter-gradient-blue to-dexter-gradient-green to-45% bg-clip-text
      text-transparent font-normal text-left justify-left"
            >
              Stake
            </h1>
            <p className="text-sm flex-wrap">
              Delegate your XRD to our Validator to earn DEXTR Stake DEXTR
              tokens to earn trading fees.
            </p>
          </div>
          <img
            src="/landing/sections/staking-safe.png"
            alt="staking safe"
            className="w-[300px] h-[300px] transform"
            style={{ transform: "scaleX(-1)" }}
          />
        </div>
      </div>
    </div>
  );
}
