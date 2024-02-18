//Figma
//https://www.figma.com/file/Zjff03BX35fREatqzcWDS7/DexTer-pages?type=design&node-id=0-1&mode=design&t=dCWa65gdycsJnFZw-0
export default function Landing() {
  return (
    <div className="flex flex-col mx-auto">
      <div className="flex flex-row px-24 justify-center bg-gradient-to-r from-neutral to-accent uppercase">
        <div className="flex flex-1 flex-col  gap-y-8 justify-center items-center text-center">
          <h1 className="flex flex-none !text-md !mb-0 h3">
            DeXter - The Orderbook Dex
          </h1>
          <h2 className="flex flex-none !text-sm !my-0">
            Trade SAFELY on RADIX with a Community built DEX
          </h2>
          <div className="flex flex-row gap-x-3">
            <div className="flex flex-auto bg-primary text-center">
              <div className="p-4 px-8">
                <p className="text-sm text-accent">28</p>
                <p className="text-sm">MARKET PAIRS</p>
              </div>
            </div>
            <div className="flex flex-auto bg-primary text-center">
              <div className="p-4 px-8">
                <p className="text-sm text-accent">157 Mil</p>
                <p className="text-sm">XRD Liquidity</p>
              </div>
            </div>
            <div className="flex flex-auto bg-primary text-center">
              <div className="p-4 px-8">
                <p className="text-sm text-accent">1.4 BiL</p>
                <p className="text-sm">XRD Volume</p>
              </div>
            </div>
          </div>
          <button className="btn btn-lg">Trade Now!</button>
        </div>
        <div className="flex justify-center items-center">
          <img
            className="flex"
            src="https://placehold.co/400x600"
            alt="Shoes"
          />
        </div>
      </div>
      <div className="flex px-24 py-12">
        <div className="flex justify-center uppercase">
          <div className="card">
            <div className="card-body">
              <div className="w-20 h-20 rounded-full bg-blue-600 "></div>
              <h2 className="card-title !text-sm">DECENTRALISED order book!</h2>
              <p className="text-xs">
                instant transactions without 3rd parties powered by AlphaDex
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex justify-center items-center"></div>
              <h2 className="card-title !text-sm">SAFE, fast, easy</h2>
              <p className="text-xs">
                Keep your assets while trade them fast and easily!
              </p>
            </div>
          </div>
          <div className="card">
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
          <div className="card">
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
      <div className="flex bg-primary px-24 py-12">
        <div className="flex-auto justify-center items-center ">
          <div className="flex-auto text-center">
            <h1 className="text-lg text-accent">OUR GROWING MARKET</h1>
          </div>
        </div>
      </div>
      <div className="flex bg-neutral px-24 py-12">
        <div className="flex-auto justify-center items-center">
          <div className="flex uppercase items-center gap-x-8">
            <div className="flex-1 text-right">
              <h3 className="text-lg">Liquidity providers earns</h3>
              <p className="text-8xl">0.35%</p>
              <p className="text-lg">per executed order</p>
            </div>
            <div className="flex-1 mx-auto">
              <img
                className="mx-auto"
                src="https://placehold.co/400x400"
                alt="Coins"
              />
            </div>
            <div className="flex-1 items-center">
              <div className="flex-auto">
                <h3 className="text-lg">With no risks of Impermanent loss.</h3>
                <p className="text-lg">
                  Put any order on DeXter to become a liquidity provider.
                </p>
              </div>
            </div>
          </div>
          <div className="flex uppercase justify-center items-center gap-x-8">
            <div className="flex-none mx-auto">
              <img
                className="mx-auto"
                src="https://placehold.co/400x400"
                alt="Coins"
              />
            </div>
            <div className="flex-1 items-center">
              <div className="flex-none w-21">
                <p className="text-lg">
                  Plus: liquidity incentives are distributed every two weeks
                  based on provided liquidity.
                </p>
                <button className="btn text-lg  text-accent">
                  PROVIDE LIQUIDITY
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex bg-neutral px-24 py-12">
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
          <button className="btn text-lg  text-accent uppercase">
            Learn More
          </button>
        </div>
      </div>
      <div className="flex flex-row bg-primary px-24 py-12 justify-center items-center gap-x-8">
        <div className="flex-none items-center">
          <img src="https://placehold.co/400x400" alt="Shoes" />
        </div>
        <div className="flex-none uppercase items-center">
          <div className="flex-col items-center text-sm">
            <h2 className="flex-none uppercase">$dextr</h2>
            <div className="flex flex-row  items-center">
              <div className="w-20 h-20 rounded-full bg-blue-600"></div>
              <div className="flex flex-col text-primary-content">
                <p className="text-primary-content">tokenomics</p>
                <ul>
                  <li>
                      $DEXTR is minted every 2 weeks and distributed through a
                      community vote.
                  </li>
                  <li>5% goes to the treasury for development.</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-row  items-center">
              <div className="w-20 h-20 rounded-full bg-blue-600"></div>
              <div className="flex flex-col text-primary-content">
                <p className="text-primary-content">supply</p>
                <ul>
                  <li>Started with 0, now 1,700,000 in circulation.</li>
                  <li>No max supply, but ~26M in 10 years at current rate.</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-row items-center">
              <div className="w-20 h-20 rounded-full bg-blue-600"></div>
              <div className="flex flex-col text-primary-content">
                <p>token distribution</p>
                <p>
                  Contributors receive their share at the end of every
                  nomination cycle, promoting active community involvement.
                </p>
              </div>
            </div>
           
          </div>
        </div>
      </div>
      <div className="flex bg-primary-content px-24 py-12">
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
