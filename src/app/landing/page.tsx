export default function Landing() {
  return (
    <div className="flex flex-col container mx-auto">
      <div className="flex flex-row px-24 justify-center bg-gradient-to-r from-neutral to-accent uppercase">
        <div className="flex flex-1 flex-col justify-center items-center">
          <h1 className="flex flex-none !text-md">DeXter - The Orderbook Dex</h1>
          <h2 className="flex flex-none !text-sm">
            Trade SAFELY on RADIX with a Community built DEX
          </h2>
          <div className="flex flex-none flex-row gap-x-3">
            <div className="flex flex-1 bg-primary text-center">
              <div className="p-4">
                <p className="text-accent">28</p>
                <p>MARKET PAIRS</p>
              </div>
            </div>
            <div className="flex flex-1 bg-primary">
              <div className="p-4">
                <p className="text-accent">157 Mil</p>
                <p>XRD Liquidity</p>
              </div>
            </div>
            <div className="flex flex-1 bg-primary">
              <div className="p-4">
                <p className="text-accent">1.4 BiL</p>
                <p>XRD Volume</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <img className="flex" src="https://placehold.co/400x600" alt="Shoes" />
        </div>
      </div>
      <div className="flex px-24">

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
      <div className="flex bg-primary-content px-24">
        <div className="flex-auto w-96 justify-center items-center ">
          <div className="flex uppercase items-center">
            <div className="flex-auto text-right">
              <p className="text-lg text-primary">Liquidity providers earns</p>
              <p className="text-8xl text-primary">0.35%</p>
              <p className="text-lg text-primary">per executed order</p>
            </div>
            <div className="flex-auto items-center">
              <img src="https://placehold.co/400x400" alt="Shoes" />
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
      <div className="flex bg-primary-content px-24">
        <div className="flex-auto w-96 justify-center items-center ">
          <div className="flex uppercase items-center">
            <div className="flex-auto items-center">
              <img src="https://placehold.co/400x400" alt="Shoes" />
            </div>
            <div className="flex-col items-center">
              <div className="flex-auto">
                <div className="card">
                  <div className="card-body">
                    <div className="w-20 h-20 rounded-full bg-blue-600 flex justify-center items-center"></div>
                    <h2 className="card-title text-lg text-primary">
                      Liquidity providers earn
                    </h2>
                    <p className="card-text">0.35%</p>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body">
                    <div className="w-20 h-20 rounded-full bg-blue-600 flex justify-center items-center"></div>
                    <h2 className="card-title text-lg text-primary">
                      Liquidity providers earn
                    </h2>
                    <p className="card-text">0.35%</p>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body">
                    <div className="w-20 h-20 rounded-full bg-blue-600 flex justify-center items-center"></div>
                    <h2 className="card-title text-lg text-primary">
                      Liquidity providers earn
                    </h2>
                    <p className="card-text">0.35%</p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
          <button className="btn text-lg  text-accent uppercase">Learn More</button>
        </div>
      </div>
      <div className="flex bg-primary-content px-24">
        <div className="flex-auto w-96 justify-center items-center ">
          <div className="flex uppercase items-center">
            
            <div className="flex-col items-center">
              <div className="flex-auto">
                <div className="card">
                  <div className="card-body">
                    <div className="w-20 h-20 rounded-full bg-blue-600 flex justify-center items-center"></div>
                    <p className="text-primary">Twitter</p>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body">
                    <div className="w-20 h-20 rounded-full bg-blue-600 flex justify-center items-center"></div>
                    <p className="text-primary">Twitter</p>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body">
                    <div className="w-20 h-20 rounded-full bg-blue-600 flex justify-center items-center"></div>
                    <p className="text-primary">Twitter</p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
          <div className="flex-auto items-center">
              <img src="https://placehold.co/400x400" alt="Shoes" />
            </div>
        </div>
      </div>
    </div>
  );
}
