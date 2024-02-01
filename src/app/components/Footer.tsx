import "react";
import "../styles/footer.css";
import Image from "next/image";
import { AccentLink } from "./AccentLink";

import { FaXTwitter } from "react-icons/fa6";
import { FaTelegram } from "react-icons/fa6";
import { FaDiscord } from "react-icons/fa6";
import { FaGithub } from "react-icons/fa6";
import { SiGitbook } from "react-icons/si";

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

        <div className="col-span-11 col-start-2">
          <a
            href="https://www.radixdlt.com/"
            target="_blank"
          >
            <img width="150" src="runs-on-radix.png" ></img>
          </a>
        </div>
      </div>

      <div className="flex flex-col space-y-4 px-16 lg:row-span-2">
        <div className="">
          <AccentLink href="/">TRADE</AccentLink>
        </div>

        <div className="flex justify-between">
          <a
            href="https://twitter.com/DexterOnRadix"
            target="_blank"
            className="text-secondary-content hover:text-primary-content"
          >
            <FaXTwitter size="1rem" />
          </a>

          <a
            href="https://t.me/dexter_discussion"
            target="_blank"
            className="text-secondary-content hover:text-primary-content"
          >
            <FaTelegram size="1rem" />
          </a>

          <a
            href="https://discord.gg/Y44jqe2q2W"
            target="_blank"
            className="text-secondary-content hover:text-primary-content"
          >
            <FaDiscord size="1rem" />
          </a>

          <a
            href="https://github.com/DeXter-on-Radix"
            target="_blank"
            className="text-secondary-content hover:text-primary-content"
          >
            <FaGithub size="1rem" />
          </a>

          <a
            href="https://dexter-on-radix.gitbook.io"
            target="_blank"
            className="text-secondary-content hover:text-primary-content"
          >
            <SiGitbook size="1rem" />
          </a>
        </div>
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
