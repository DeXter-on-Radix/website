export default function Landing() {
  return (
    <div className="container mx-auto">
      <div className="flex flex-row px-24 justify-center bg-base-100 bg-gradient-to-r from-primary to-accent">
        <div className="flex-auto w-96">
          <h1 className="uppercase !text-sm">DeXter - The Orderbook Dex</h1>
          <h2 className="uppercase !text-xs">
            Trade SAFELY on RADIX with a Community built DEX
          </h2>
          <div className="flex  uppercase">
            <div className="card w-96">
              <div className="card-body">
                <p>48</p>
                <p>MARKET PAIRS</p>
              </div>
            </div>
            <div className="card w-96">
              <div className="card-body">
                <h2 className="card-title">157 Mil</h2>
                <p className="card-text">XRD Liquidity</p>
              </div>
            </div>
            <div className="card w-96">
              <div className="card-body">
                <h2 className="card-title">1.4 BiL</h2>
                <p className="card-text">XRD Volume</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-auto">
          <img src="https://placehold.co/600x400" alt="Shoes" />
        </div>
      </div>
      <div className="flex flex-row px-24  text-center ">
        <div className="flex-auto w-96 items-center">
          <div className="flex justify-center uppercase">
            <div className="card w-96">
              <div className="card-body">
                <div className="w-20 h-20 rounded-full bg-blue-600 "></div>
                <h2 className="card-title !text-sm">
                  DECENTRALISED order book!
                </h2>
                <p className="text-xs">
                  instant transactions without 3rd parties powered by AlphaDex
                </p>
              </div>
            </div>
            <div className="card w-96">
              <div className="card-body">
                <div className="w-20 h-20 rounded-full bg-blue-600 flex justify-center items-center"></div>
                <h2 className="card-title !text-sm">SAFE, fast, easy</h2>
                <p className="text-xs">
                  Keep your assets while trade them fast and easily!
                </p>
              </div>
            </div>
            <div className="card w-96">
              <div className="card-body">
                <div className="w-20 h-20 rounded-full bg-blue-600 flex justify-center items-center"></div>
                <h2 className="card-title !text-sm">
                  pay low fees, earn rewards
                </h2>
                <p className="text-xs">
                  Trade with low fees and provide liquidity to earn fees from
                  trades.
                </p>
              </div>
            </div>
            <div className="card w-96">
              <div className="card-body">
                <div className="w-20 h-20 rounded-full bg-blue-600 flex justify-center items-center"></div>
                <h2 className="card-title !text-sm">
                  BUILT BY A GLOBAL COMMUNITY
                </h2>
                <p className="text-xs">
                  DEXTER doesn't have any headquarters or one central point of
                  failure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row bg-primary-content px-24">
        <div className="flex-auto w-96 justify-center items-center ">
          <div className="flex uppercase items-center">
            <div className="flex-auto text-right">
              <p className="text-lg text-primary">Liquidity providers earns</p>
              <p className="text-8xl text-primary">0.35%</p>
              <p className="text-lg text-primary">per executed order</p>
            </div>
            <div className="flex-auto items-center">
              <img src="https://placehold.co/600x400" alt="Shoes" />
            </div>
            <div className="flex-auto items-center">
              <div className="flex-auto">
                <p className="text-lg text-primary">With no risks of Impermanent loss.</p>
                <p className="text-lg  text-primary">Put any order on DeXter to become a liquidity provider.</p>
                <button className="btn text-lg  text-accent">PROVIDE LIQUIDITY</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
