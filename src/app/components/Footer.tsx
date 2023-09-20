import "react";
import "../styles/footer.css";
import Image from "next/image";
import { AccentLink } from "./AccentLink";

export function Footer() {
  return (
    <footer className="col-span-12 p-4 grid grid-cols-1 grid-rows-5 gap-4 bg-base-300 text-xs text-secondary-content lg:grid-cols-3 lg:grid-rows-3 lg:p-12 lg:gap-8">
      <div className="row-start-2 row-span-3 grid grid-cols-6 gap-4 text-xs lg:row-start-1">
        <Image
          src="/dexter_icon.svg"
          alt="DeXter icon"
          width="0"
          height="0"
          sizes="100vw"
          className="w-8 h-auto !my-auto col-start-1 place-self-end"
        />
        <Image
          src="/dexter_name.svg"
          alt="DeXter"
          width="0"
          height="0"
          sizes="100vw"
          className="w-24 h-auto !my-auto col-start-2 col-span-5 place-self-start"
        />

        <div className="col-start-2 col-span-5">
          Trade and leave the algorithms do the rest! <br /> Safe, Accurate,
          Intuitive, Decentralised. <br />
          Runs on{" "}
          <a href="https://www.radixdlt.com/" target="_blank">
            RADIX
          </a>{" "}
          &{" "}
          <a href="https://alphadex.net/" target="_blank">
            ALPHA DEX
          </a>
          .
        </div>

        <div className="col-span-11 col-start-2">
          Built with passion by a global community.
        </div>
      </div>

      <div className="grid grid-rows-2 grid-cols-4 gap-4 lg:row-span-2">
        <div className="">
          <AccentLink href="/">TRADE</AccentLink>
        </div>

        <a
          href="https://twitter.com/DexterOnRadix"
          target="_blank"
          className="col-start-1 my-auto whitespace-nowrap text-secondary-content"
        >
          X (Twitter)
        </a>

        <a
          href="https://t.me/dexter_discussion"
          target="_blank"
          className="col-start-2 my-auto whitespace-nowrap text-secondary-content"
        >
          Telegram
        </a>

        <a
          href="https://github.com/DeXter-on-Radix"
          target="_blank"
          className="col-start-3 my-auto whitespace-nowrap text-secondary-content"
        >
          GitHub
        </a>
      </div>

      <div className="flex justify-end items-center space-x-4 lg:row-start-3 lg:col-start-3 lg:pr-8">
        <AccentLink
          href="/terms"
          originalClassName="whitespace-nowrap text-secondary-content"
        >
          TERMS & CONDITIONS
        </AccentLink>
      </div>
    </footer>
  );
}
