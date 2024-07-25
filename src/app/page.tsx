"use client";

import { useTranslations, useHydrationErrorFix } from "hooks";

enum Device {
  MOBILE = "MOBILE",
  DESKTOP = "DESKTOP",
}

enum TopicSectionEnum {
  TOKENOMICS = "TOKENOMICS",
  TRADE = "TRADE",
  STAKE = "STAKE",
  CONTRIBUTE = "CONTRIBUTE",
}

interface TopicSectionProps {
  backgroundColor: string;
  title: string;
  body?: JSX.Element;
  imageUrl: string;
  buttonText: string;
  buttonUrl: string;
  reversed: boolean;
}

interface IconTitleAndBodyProps {
  icon: string;
  title: string;
  body: string;
}

interface DexterButtonProps {
  title: string;
  targetUrl?: string;
  targetBlank?: boolean;
}

interface DexterHeadingProps {
  title: string;
}

interface DexterParagraphProps {
  text: string;
  additionalClass?: string;
}

// Define a shared variable for container dimensions and padding to ensure
// consistency across sections with full-width backgrounds.
const containerWidthAndPadding = "w-[1080px] max-w-[100vw] m-auto p-8 ";

export default function Landing() {
  const t = useTranslations();
  const tokenomicsProps = getTopicsSectionProps(TopicSectionEnum.TOKENOMICS, t);
  const tradeProps = getTopicsSectionProps(TopicSectionEnum.TRADE, t);
  const stakeProps = getTopicsSectionProps(TopicSectionEnum.STAKE, t);
  const contributeProps = getTopicsSectionProps(TopicSectionEnum.CONTRIBUTE, t);
  return (
    <div className="bg-dexter-grey-light">
      <HeroSection />
      <TopicSection {...tokenomicsProps} />
      <TopicSection {...tradeProps} />
      <TopicSection {...stakeProps} />
      <TopicSection {...contributeProps} />
    </div>
  );
}

function HeroSection() {
  const t = useTranslations();
  const isClient = useHydrationErrorFix();

  if (!isClient) return <></>;
  return (
    <div
      className={
        `${containerWidthAndPadding} ` +
        `flex flex-col justify-center items-center ` +
        `min-h-[100vh] pb-[20vh]`
      }
    >
      <div className="flex justify-center relative">
        <div
          className={
            `flex flex-col items-start justify-center z-50 ` +
            `max-[820px]:items-center max-[820px]:text-center ` +
            `min-[821px]:max-w-[60%] `
          }
        >
          <img
            src="/dexter-logo-and-lettering.svg"
            alt="dexter logo and lettering"
            className="pb-4 min-[420px]:hidden h-12"
          />
          <h1
            className={
              `!m-0 z-100 ` +
              `max-[420px]:py-4 ` +
              `max-[820px]:max-w-[600px] max-[820px]:!mb-2 `
            }
          >
            {t("decentralized_order_book_exchange_on")}
          </h1>
          <div className="relative">
            <BackgroundLights showFor={Device.MOBILE} />
            <DexterButton title={t("trade_now")} targetUrl="/trade" />
          </div>
          <KeyFeatures showFor={Device.MOBILE} />
        </div>
        <div className="relative">
          <BackgroundLights showFor={Device.DESKTOP} />
          <img
            src="/landing/dexter-mascotte.png"
            alt="Dexter Mascotte"
            className={`w-[285px] z-[100] max-[820px]:hidden relative `}
          />
        </div>
      </div>
      <KeyFeatures showFor={Device.DESKTOP} />
    </div>
  );
}

function KeyFeatures({ showFor }: { showFor: Device }) {
  const t = useTranslations();
  const content = [
    ["landing/icons/rocket.svg", "easy_and_fast"],
    ["landing/icons/decentralized.svg", "decentralized"],
    ["landing/icons/coins.svg", "earn_rewards_by_trading"],
  ];
  return (
    <div
      className={
        showFor === Device.DESKTOP
          ? `flex justify-between w-full max-w-3xl z-50 pt-10 ` +
            `relative top-10 ` +
            `min-[401px]:px-4 ` +
            `max-[820px]:hidden `
          : `flex justify-between w-full max-w-2xl z-50 pt-10 ` +
            `min-[401px]:px-4 ` +
            `min-[821px]:hidden `
      }
    >
      {content.map(([iconUrl, text], indx) => {
        return (
          <div
            key={indx}
            className={
              `flex flex-col justify-start items-center w-24 ` +
              `min-[821px]:w-32`
            }
          >
            <img
              src={iconUrl}
              alt={text}
              className={
                `w-[24px] ` +
                `min-[821px]:w-[28px] min-[821px]:opacity-100 ` +
                `min-[400px]:w-[26px]`
              }
            />
            <p
              className={
                `pt-2 text-center opacity-80 text-sm ` +
                `max-[380px]:text-xs ` +
                `min-[821px]:text-base`
              }
            >
              {t(text)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function BackgroundLights({ showFor }: { showFor: Device }) {
  if (showFor === Device.DESKTOP) {
    return (
      // Parent is not rendered on small screens so we don't need to explicitally hide it
      <>
        <img
          src="/landing/blue-light.svg"
          alt="blue light"
          className="absolute opacity-60 z-10 scale-[4] top-[200px] right-[-239px] "
        />
        <img
          src="/landing/green-light.svg"
          alt="green light"
          className="absolute z-10 scale-[4] top-[-147px] right-[122px] "
        />
        <img
          src="/landing/background-structures.png"
          alt="background structures"
          className="absolute opacity-10 z-20 scale-[2.5] top-[0px]"
        />
      </>
    );
  }
  if (showFor === Device.MOBILE) {
    return (
      // Parent is always rendered so we need to explicitally hide it
      <div className="min-[821px]:hidden">
        <img
          src="/landing/blue-light.svg"
          alt="blue light"
          className="absolute opacity-40 scale-[4] top-[-0%] right-[-80%] z-[-30]"
        />
        <img
          src="/landing/green-light.svg"
          alt="green light"
          className="absolute opacity-100 scale-[4] top-[-200%] left-[-50%] z-[-30] "
        />
      </div>
    );
  }
}

function TopicSection({
  backgroundColor,
  title,
  body,
  imageUrl,
  buttonUrl,
  buttonText,
  reversed,
}: TopicSectionProps): JSX.Element {
  const isClient = useHydrationErrorFix();
  if (!isClient) return <></>;
  return (
    <div
      className={`${backgroundColor} py-20 max-[820px]:py-10 z-[100] relative`}
    >
      <div className={`${containerWidthAndPadding} max-[820px]:w-full`}>
        <div
          className={`flex items-center justify-center ${
            reversed ? "flex-row-reverse" : ""
          } max-[820px]:flex-col-reverse max-[820px]:max-w-[480px] m-auto`}
        >
          <div className="w-full min-[821px]:max-w-[520px] max-[820px]:text-center">
            <DexterHeading title={title} />
            {body}
            <DexterButton
              title={buttonText}
              targetUrl={buttonUrl}
              targetBlank={true}
            />
          </div>
          <img
            src={imageUrl}
            alt={title}
            className="w-[400px] min-[821px]:px-8 max-[820px]:max-w-[280px]"
          />
        </div>
      </div>
    </div>
  );
}

function IconTitleAndBody({ icon, title, body }: IconTitleAndBodyProps) {
  const t = useTranslations();
  return (
    <div className="flex items-start mt-2">
      <img
        src={`/landing/icons/${icon}.svg`}
        alt={icon}
        className="w-12 mr-4 pt-2 max-[440px]:w-10 max-[440px]:mr-2 max-[440px]:pt-1"
      />
      <div>
        <p className="text-base font-bold text-white text-left">{t(title)}</p>
        <DexterParagraph
          additionalClass="text-left opacity-80"
          text={t(body)}
        />
      </div>
    </div>
  );
}

function DexterButton({ title, targetUrl, targetBlank }: DexterButtonProps) {
  return (
    <a
      href={targetUrl}
      className="z-100 min-w-[220px] max-w-[220px]"
      target={`${targetBlank ? "_blank" : ""}`}
    >
      <button
        className={
          `min-h-[44px] w-[220px] px-4 my-6 mt-8 rounded ` +
          `bg-dexter-green-OG text-black uppercase ` +
          `opacity-100 cursor-pointer `
        }
      >
        <span className="font-bold text-sm tracking-[.1px] ">{title}</span>
      </button>
    </a>
  );
}

function DexterHeading({ title }: DexterHeadingProps) {
  return (
    <>
      <h2
        className="text-md bg-gradient-to-r from-dexter-gradient-blue to-dexter-gradient-green to-80% bg-clip-text text-transparent font-base"
        style={{
          margin: 0,
          marginBottom: "20px",
          marginTop: "0px",
          fontSize: "38px",
        }}
      >
        {title}
      </h2>
    </>
  );
}

function DexterParagraph({ text, additionalClass }: DexterParagraphProps) {
  const t = useTranslations();
  return (
    <p
      className={
        "text-sm tracking-wide py-2 " + (additionalClass ? additionalClass : "")
      }
    >
      {t(text)}
    </p>
  );
}

/*
 * Content for each section (except hero section)
 * is stored in the following functions
 */
function getTopicsSectionProps(
  topicSectionEnum: TopicSectionEnum,
  t: (key: string) => string
): TopicSectionProps {
  return {
    TOKENOMICS: getTokenomicsTopicSectionProps(t),
    TRADE: getTradeTopicSectionProps(t),
    STAKE: getStakeTopicSectionProps(t),
    CONTRIBUTE: getContributeTopicSectionProps(t),
  }[topicSectionEnum];
}

function getTokenomicsTopicSectionProps(
  t: (key: string) => string // translation dict needs to be passed in
): TopicSectionProps {
  const tokenomicsBody = (
    <>
      <IconTitleAndBody
        icon="money"
        title={t("tokenomics")}
        body={t("100k_dextr_minted_every_2")}
      />
      <IconTitleAndBody
        icon="vote"
        title={t("vote_in_the_dao")}
        body={t("1_dextr_equals_1_vote")}
      />
      <IconTitleAndBody
        icon="chart"
        title={t("revenue_share_coming_soon")}
        body={t("trade_fees_collected_by_dexter")}
      />
    </>
  );
  return {
    backgroundColor: "bg-dexter-grey-dark",
    title: t("dextr_token"),
    body: tokenomicsBody,
    imageUrl: "/landing/sections/dexter-mascotte-holding-coin.png",
    buttonUrl:
      "https://dexter-on-radix.gitbook.io/dexter/overview/how-are-contributors-rewarded/tokenomics",
    buttonText: t("learn_more"),
    reversed: true,
  };
}

function getTradeTopicSectionProps(
  t: (key: string) => string // translation dict needs to be passed in
): TopicSectionProps {
  return {
    backgroundColor: "bg-dexter-grey-light",
    title: t("earn_rewards_by_trading"),
    body: <DexterParagraph text={t("earn_rewards_by_trading_and")} />,
    imageUrl: "/landing/sections/treasury-earn-by-trading.png",
    buttonText: t("learn_more"),
    buttonUrl:
      "https://dexter-on-radix.gitbook.io/dexter/overview/how-are-contributors-rewarded/liquidity-incentives",
    reversed: false,
  };
}

function getStakeTopicSectionProps(
  t: (key: string) => string // translation dict needs to be passed in
): TopicSectionProps {
  return {
    backgroundColor: "bg-dexter-grey-dark",
    title: t("stake_xrd_to_earn_dextr"),
    body: <DexterParagraph text={t("delegate_your_xrd_to_our")} />,
    imageUrl: "/landing/sections/staking-safe.png",
    buttonText: t("stake_now"),
    buttonUrl:
      "https://dashboard.radixdlt.com/network-staking/validator_rdx1s0sr7xsr286jwffkkcwz8ffnkjlhc7h594xk5gvamtr8xqxr23a99a",
    reversed: true,
  };
}

function getContributeTopicSectionProps(
  t: (key: string) => string // translation dict needs to be passed in
): TopicSectionProps {
  return {
    backgroundColor: "bg-dexter-grey-light",
    title: t("earn_dextr_by_contributing"),
    body: <DexterParagraph text={t("whether_you_are_a_developer")} />,
    imageUrl: "/landing/sections/hands.png",
    buttonText: t("join_us"),
    buttonUrl:
      "https://dexter-on-radix.gitbook.io/dexter/overview/how-do-i-contribute",
    reversed: false,
  };
}
