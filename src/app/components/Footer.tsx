import "react";
import { useTranslations } from "hooks";
import "../styles/footer.css";
import Image from "next/image";

export function Footer() {
  // TODO(dcts): add translations
  // const t = useTranslations();
  const contentColumn1 = {
    title: "Ecosystem",
    links: [
      {
        text: "Trade",
        url: "",
      },
      {
        text: "Provide Liquidity",
        url: "",
      },
      {
        text: "Tokenomics",
        url: "",
      },
    ],
  };
  const contentColumn2 = {
    title: "Developers",
    links: [
      {
        text: "Contribute",
        url: "",
      },
      {
        text: "Github",
        url: "",
      },
    ],
  };
  const contentColumn3 = {
    title: "About",
    links: [
      {
        text: "Talk to us",
        url: "",
      },
      {
        text: "Report Translation Issue",
        url: "",
      },
      {
        text: "Terms & Conditions",
        url: "",
      },
      {
        text: "Privacy Policy",
        url: "",
      },
    ],
  };

  return (
    <footer className="p-4 bg-base-300 text-xs text-secondary-content px-12 pt-8 pb-16">
      <div className="flex justify-between">
        <div className="flex">
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

function SocialIcons() {
  const socials = [
    {
      id: "telegram",
      url: "",
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
      url: "",
    },
    {
      id: "instagram",
      url: "",
    },
    {
      id: "youtube",
      url: "",
    },
    // TODO(dcts): add gitbook
    // {
    //   id: "gitbook",
    //   url: "",
    // },
  ];
  return (
    <div className="flex">
      {socials.map(({ id, url }, indx) => (
        <a href={url} key={indx} target="_blank" className="mr-2">
          <img width="34" src={`/socials/${id}.svg`} alt={id}></img>
        </a>
      ))}
    </div>
  );
}

function FirstFooterElement() {
  const t = useTranslations();
  return (
    <div className="text-xs flex flex-col ">
      <Image
        src="/dexter-logo-and-lettering.svg"
        alt="DeXter icon"
        width="113"
        height="22"
        className="h-auto"
      />

      <div className="">
        <p className="truncate">{t("footer_3")}</p>
        <p className="truncate">{t("footer_2")}</p>
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

      <div className="">
        <a href="https://www.radixdlt.com/" target="_blank">
          <img
            width="115"
            src="runs-on-radix.png"
            alt="Runs on Radix Button"
          ></img>
        </a>
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
    <div className="px-3">
      <h3 style={{ margin: 0 }}>{title}</h3>
      {links.map((link, i) => (
        <p className="text-secondary-content truncate" key={i}>
          {link.text}
        </p>
      ))}
    </div>
  );
}
