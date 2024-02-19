//Figma
//https://www.figma.com/file/Zjff03BX35fREatqzcWDS7/DexTer-pages?type=design&node-id=0-1&mode=design&t=dCWa65gdycsJnFZw-0
import Image from "next/image";

export default function Landing() {
  return (
    <div className="flex flex-col">
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
          <img className="flex" src="/landing/mascot.png" alt="Mascot" />
        </div>
      </div>
      <div className="flex px-24 py-12">
        <div className="flex justify-center text-center uppercase">
          <div className="flex flex-col items-center">
            <div className="flex w-24 bg-primary-content rounded-full p-2">
              <img
                className="flex"
                src="/landing/icons/decentralised.gif"
                alt="Global community"
              />
            </div>
            <h2 className="card-title !text-sm text-accent">DECENTRALISED order book!</h2>
            <p className="text-xs">
              instant transactions without 3rd parties powered by AlphaDex
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex w-24 bg-primary-content rounded-full p-2">
              <img
                className="flex w-24 bg-primary-content rounded-full"
                src="/landing/icons/safe-fast-free.gif"
                alt="Global community"
              />
            </div>
            <h2 className="!text-sm text-accent">SAFE, fast, easy</h2>
            <p className="text-xs">
              Keep your assets while trade them fast and easily!
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex w-24 bg-primary-content rounded-full p-2">
              <img
                className="flex w-24 bg-primary-content rounded-full"
                src="/landing/icons/pay-low-fees.gif"
                alt="Global community"
              />
            </div>
            <h2 className="!text-sm text-accent">pay low fees, earn rewards</h2>
            <p className="text-xs">
              Trade with low fees and provide liquidity to earn fees from
              trades.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex w-24 bg-primary-content rounded-full p-2">
              <img
                className="flex w-24 bg-primary-content rounded-full"
                src="/landing/icons/global-community.gif"
                alt="Global community"
              />
            </div>
            <h2 className="!text-sm text-accent">BUILT BY A GLOBAL COMMUNITY</h2>
            <p className="text-xs">
              DEXTER doesn't have any headquarters or one central point of
              failure.
            </p>
          </div>
        </div>
      </div>
      <div className="flex bg-neutral px-24 py-12">
        <div className="flex-auto justify-center items-center">
          <div className="flex uppercase items-center gap-x-8">
            <div className="flex flex-1 flex-col uppercase gap-y-8">
              <h3 className="flex text-lg">Earn rewards by trading</h3>
              <p className="flex text-xl">
                Maximize your earnings by receiving rewards for every order you
                execute, plus enjoy additional liquidity incentives for orders
                placed near the market price.
              </p>
              <a className="flex btn btn-lg btn-accent text-primary" href="/">
                START TRADING NOW!
              </a>
            </div>
            <div className="flex-1 mx-auto">
              <img className="mx-auto" src="/landing/earn.png" alt="Coins" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row bg-primary px-24 py-12 justify-center items-center gap-x-8">
        <div className="flex items-center">
          <img src="/landing/mascot.png" alt="Mascot" />
        </div>
        <div className="flex uppercase items-center">
          <div className="flex-col items-center text-sm gap-x-8">
            <h2 className="flex-none uppercase">$dextr</h2>
            <div className="flex flex-row items-center gap-x-8">
              <Image
                src="/landing/icons/tokenomics.svg"
                alt="Tokenomics icon"
                width={80}
                height={80}
                className="!my-0"
              />
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

            <div className="flex flex-row items-center gap-x-8">
              <Image
                src="/landing/icons/supply.svg"
                alt="Supply Icon"
                width={80}
                height={80}
                className="!my-0"
              />
              <div className="flex flex-col text-primary-content">
                <p className="text-primary-content">supply</p>
                <ul>
                  <li>Started with 0, now 1,700,000 in circulation.</li>
                  <li>No max supply, but ~26M in 10 years at current rate.</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-row items-center gap-x-8">
              <Image
                src="/landing/icons/distribution.svg"
                alt="Distribution icon"
                width={80}
                height={80}
                className="!my-0"
              />
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
      <div className="flex flex-row bg-neutral px-24 py-12 justify-center items-center gap-x-8">
        <div className="flex flex-1 flex-col uppercase gap-y-8">
          <h3 className="flex text-lg">Earn $DEXTR by contributing</h3>
          <p className="flex text-xl">
            Whether you're a developer, designer, community manager or marketing
            enthusiast, your contributions are vital and give you the
            possibility to get rewarded in $DEXTR tokens. We are 100% community
            build with no formal team.
          </p>
          <a
            className="flex btn btn-lg btn-accent text-primary uppercase"
            href="/"
          >
            Learn More
          </a>
        </div>
        <div className="flex-none items-center">
          <img src="/landing/hands.png" alt="Hands" />
        </div>
      </div>
      <div className="flex bg-neutral px-24 py-12">
        <div className="flex flex-auto flex-row justify-center items-center ">
          <div className="flex uppercase items-center">
            <div className="flex flex-row items-center gap-x-8">
              <p className="flex text-3xl">Join DeXter community:</p>

              <Image
                src="/landing/icons/twitter.svg"
                alt="Dexter Logo"
                width={40}
                height={40}
                className="!my-0"
              />

              <Image
                src="/landing/icons/tg.svg"
                alt="Dexter Logo"
                width={40}
                height={40}
                className="!my-0"
              />

              <Image
                src="/landing/icons/discord.svg"
                alt="Dexter Logo"
                width={40}
                height={40}
                className="!my-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
