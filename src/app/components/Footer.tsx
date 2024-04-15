import "react";
import { useTranslations } from "hooks";
import "../styles/footer.css";
import Image from "next/image";

const marginBottom = "mb-8";

export function Footer() {
  const t = useTranslations();
  const contentColumn1 = {
    title: t("ecosystem"),
    links: [
      {
        text: t("trade"),
        url: "https://dexter-on-radix.gitbook.io/dexter/using-dexter/start-trading",
      },
      {
        text: t("provide_liquidity"),
        url: "https://dexter-on-radix.gitbook.io/dexter/overview/how-are-contributors-rewarded/liquidity-incentives",
      },
      {
        text: t("tokenomics"),
        url: "https://dexter-on-radix.gitbook.io/dexter/overview/how-are-contributors-rewarded/tokenomics",
      },
    ],
  };
  const contentColumn2 = {
    title: t("developers"),
    links: [
      {
        text: t("contribute"),
        url: "https://dexter-on-radix.gitbook.io/dexter/overview/how-do-i-contribute",
      },
      {
        text: "Github",
        url: "https://github.com/DeXter-on-Radix",
      },
    ],
  };
  const contentColumn3 = {
    title: t("support"),
    links: [
      {
        text: t("talk_to_us"),
        url: "https://t.me/dexter_discussion",
      },
      {
        text: t("report_bug"),
        url: "https://t.me/dexter_discussion",
      },
      {
        text: t("report_translation_issue"),
        url: "https://docs.google.com/document/d/11I9c3XjKPmXgc9V6puznD_mSXA5QCqNKAG1QCcClkRw/edit?usp=sharing",
      },
      {
        text: t("terms_and_conditions"),
        url: "/terms",
      },
    ],
  };

  return (
    <footer className="bg-base-300 text-xs text-secondary-content px-12 pt-8 pb-16">
      <div className="flex flex-wrap justify-between">
        <div className="flex flex-wrap">
          <FirstFooterElement />
          <div className="flex flex-wrap sm:flex-nowrap">
            <FooterContentColumn {...contentColumn1} />
            <FooterContentColumn {...contentColumn2} />
            <FooterContentColumn {...contentColumn3} />
          </div>
        </div>
        <div className="">
          <h3 className="py-2 text-white font-medium !my-0 !text-sm">
            {t("our_community")}
          </h3>
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
        <p className="truncate pt-4">
          {t("safe_accurate_intuitive_decentralized")}
        </p>
        <p className="truncate pt-2">{t("built_with_passion_by_community")}</p>
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
      <h3 className="py-2 text-secondary-content font-medium !my-0 !text-sm">
        {title}
      </h3>
      {links.map((link, i) => (
        <a href={link.url} key={i} target="_blank">
          <p className="truncate pl-[1px] text-xs py-[2px] cursor-pointer text-white font-normal hover:underline">
            {link.text}
          </p>
        </a>
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
      url: "https://discord.gg/Y44jqe2q2W",
    },
    {
      id: "github",
      url: "https://github.com/DeXter-on-Radix",
    },
    {
      id: "x",
      url: "https://twitter.com/DexterOnRadix",
    },
    {
      id: "instagram",
      url: "https://www.instagram.com/dexter_on_radix/",
    },
    {
      id: "youtube",
      url: "https://www.youtube.com/@Dexter_Official_Dex/videos",
    },
    {
      id: "gitbook",
      url: "https://dexter-on-radix.gitbook.io/dexter",
    },
  ];
  return (
    <div className={`flex flex-wrap ${marginBottom}`}>
      {socials.map(({ id, url }, indx) => (
        <a href={url} key={indx} target="_blank" className="mr-2 mt-2">
          <img className="w-8 sm:w-7" src={`/socials/${id}.svg`} alt={id}></img>
        </a>
      ))}
    </div>
  );
}
