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
    <footer className="p-4 bg-base-300 text-xs text-secondary-content px-12 pt-8 pb-16">
      <div className="flex">
        <div>
          <FirstFooterElement />
          <FooterContentColumn {...contentColumn1} />
          <FooterContentColumn {...contentColumn2} />
          <FooterContentColumn {...contentColumn3} />
        </div>
        <div className="">
          <h3>Our Community</h3>
          {socials.map(({ id, url }, indx) => (
            <a href={url} key={indx} target="_blank">
              <img width="28" src={`/socials/${id}.svg`} alt={id}></img>
            </a>
          ))}
        </div>
      </div>
    </footer>
    /* <footer className="col-span-12 p-4 grid grid-cols-1 grid-rows-5 gap-4 bg-base-300 text-xs text-secondary-content lg:grid-cols-3 lg:grid-rows-3 lg:p-12 lg:gap-8">
      <div className="flex flex-col space-y-4 px-16 lg:row-span-2">
        <div className="uppercase">{t("social_media")}</div>

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

      <div className="flex justify-end items-center space-x-4 lg:row-start-3 lg:col-start-3 lg:pr-8 uppercase">
        <AccentLink
          href="/terms"
          originalClassName="whitespace-nowrap text-secondary-content"
        >
          {t("terms_and_conditions")}
        </AccentLink>
      </div>
    </footer> */
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
        {t("footer_3")} <br /> {t("footer_2")} <br />
        {t("runs_on")}{" "}
        <a href="https://www.radixdlt.com/" target="_blank">
          RADIX
        </a>{" "}
        &{" "}
        <a href="https://alphadex.net/" target="_blank">
          ALPHA DEX
        </a>
        .
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
  console.log({ title, links });
  return (
    <>
      <h3>{title}</h3>
      {links.map((link, i) => (
        <p className="text-secondary-content" key={i}>
          {link.text}
        </p>
      ))}
    </>
  );
}
