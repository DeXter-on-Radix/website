import "react";
import { useTranslations } from "hooks";
import "../styles/footer.css";
import Image from "next/image";

const marginBottom = "mb-8";

export function Footer() {
  // TODO(dcts): add translations
  // const t = useTranslations();
  const contentColumn1 = {
    title: "Ecosystem",
    links: [
      {
        text: "Trade",
        url: "https://dexter-on-radix.gitbook.io/dexter/using-dexter/start-trading",
      },
      {
        text: "Provide Liquidity",
        url: "https://dexter-on-radix.gitbook.io/dexter/overview/how-are-contributors-rewarded/liquidity-incentives",
      },
      {
        text: "Tokenomics",
        url: "https://dexter-on-radix.gitbook.io/dexter/overview/how-are-contributors-rewarded/tokenomics",
      },
    ],
  };
  const contentColumn2 = {
    title: "Developers",
    links: [
      {
        text: "Contribute",
        url: "https://dexter-on-radix.gitbook.io/dexter/overview/how-do-i-contribute",
      },
      {
        text: "Github",
        url: "https://github.com/DeXter-on-Radix",
      },
    ],
  };
  const contentColumn3 = {
    title: "Support",
    links: [
      {
        text: "Talk to us",
        url: "https://t.me/dexter_discussion",
      },
      {
        text: "Report Bug",
        url: "https://t.me/dexter_discussion",
      },
      {
        text: "Report Translation Issue",
        url: "https://docs.google.com/document/d/11I9c3XjKPmXgc9V6puznD_mSXA5QCqNKAG1QCcClkRw/edit?usp=sharing",
      },
      {
        text: "Terms & Conditions",
        url: "/terms",
      },
    ],
  };

  return (
    <footer className="bg-base-300 text-xs text-secondary-content px-12 pt-8 pb-16">
      <div className="flex flex-wrap justify-between">
        <div className="flex flex-wrap">
          <FirstFooterElement />
          <FooterContentColumn {...contentColumn1} />
          <FooterContentColumn {...contentColumn2} />
          <FooterContentColumn {...contentColumn3} />
        </div>
        <div className="">
          <h3>Our Community</h3>
          <SocialIcons />
        </div>
      </div>
    </footer>
  );
}

function FirstFooterElement() {
  const t = useTranslations();
  return (
    <div className={`text-xs flex flex-col pr-10 ${marginBottom}`}>
      <Image
        src="/dexter-logo-and-lettering.svg"
        alt="DeXter icon"
        width="113"
        height="22"
        className="h-auto"
      />

      <div className="">
        <p className="truncate pt-4">{t("footer_3")}</p>
        <p className="truncate pt-2">{t("footer_2")}</p>
        <p className="truncate">
          {t("runs_on")}{" "}
          <a href="https://www.radixdlt.com/" target="_blank">
            RADIX
          </a>{" "}
          &{" "}
          <a href="https://alphadex.net/" target="_blank">
            ALPHA DEX
          </a>
          .
        </p>
      </div>
    </div>
  );
}

interface FooterContentColumnProps {
  title: string;
  links: { text: string; url: string }[];
}

function FooterContentColumn({
  title = "",
  links = [],
}: FooterContentColumnProps) {
  return (
    <div className={`pr-8 ${marginBottom}`}>
      <h3
        style={{ margin: 0, fontSize: "14px" }}
        className="py-2 text-secondary-content font-medium"
      >
        {title}
      </h3>
      {links.map((link, i) => (
        <p
          className="truncate  text-xs py-[2px] cursor-pointer text-white hover:underline"
          key={i}
        >
          {link.text}
        </p>
      ))}
    </div>
  );
}

function SocialIcons() {
  const socials = [
    {
      id: "telegram",
      url: "https://t.me/dexter_discussion",
    },
    {
      id: "discord",
      url: "",
    },
    {
      id: "github",
      url: "",
    },
    {
      id: "x",
      url: "https://twitter.com/DexterOnRadix",
    },
    {
      id: "instagram",
      url: "",
    },
    {
      id: "youtube",
      url: "",
    },
    {
      id: "gitbook",
      url: "",
    },
  ];
  return (
    <div className={`flex flex-wrap ${marginBottom}`}>
      {socials.map(({ id, url }, indx) => (
        <a href={url} key={indx} target="_blank" className="mr-2 mt-2">
          <img className="w-6 sm:w-7" src={`/socials/${id}.svg`} alt={id}></img>
        </a>
      ))}
    </div>
  );
}
