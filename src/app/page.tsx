"use client";

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

// Define a shared variable for container dimensions and padding to ensure
// consistency across sections with full-width backgrounds.
const containerWidthAndPadding = "w-[1200px] max-w-[100vw] m-auto p-8 ";

function IconTitleAndBody({ icon, title, body }: IconTitleAndBodyProps) {
  return (
    <div className="flex items-start mt-2">
      <img
        src={`/landing/icons/${icon}.svg`}
        alt={icon}
        className="w-12 mr-4 pt-2 max-[440px]:w-10 max-[440px]:mr-2 max-[440px]:pt-1"
      />
      <div>
        <p className="text-base font-bold text-white text-left">{title}</p>
        <DexterParagraph additionalClass="text-left opacity-80" text={body} />
      </div>
    </div>
  );
}

function getTopicSectionProps(
  topicSection: TopicSectionEnum
): TopicSectionProps {
  const tokenomicsBody = (
    <>
      <IconTitleAndBody
        icon="money"
        title="Tokenomics"
        body="100'000 DEXTR minted every 2 weeks. No max supply, but ~26M in 10 years at current rate."
      />
      <IconTitleAndBody
        icon="vote"
        title="Vote in the DAO"
        body="1 $DEXTR equals 1 vote in governance decisions."
      />
      <IconTitleAndBody
        icon="chart"
        title="Revenue Share (coming soon...)"
        body="Trade fees collected by DeXter will be shared among all DEXTR holders."
      />
    </>
  );
  const tradeBody = (
    <p className="text-sm tracking-wide py-2">
      Earn{" "}
      <span className="text-lg tracking-tight font-bold text-white">
        0.35% on every trade
      </span>
      , plus enjoy additional liquidity incentives for orders placed near the
      market price.
    </p>
  );
  const stakeBody = (
    <DexterParagraph text="Delegate your $XRD to our Validator to earn $DEXTR." />
  );
  const contributeBody = (
    <DexterParagraph text="Whether you're a developer, designer or marketing enthusiast, all contributors get rewarded in $DEXTR tokens. We are 100% community build with no formal team." />
  );

  return {
    TOKENOMICS: {
      backgroundColor: "bg-dexter-grey-dark",
      title: "$DEXTR Token",
      body: tokenomicsBody,
      imageUrl: "/landing/sections/dexter-mascotte-holding-coin.png",
      buttonUrl:
        "https://dexter-on-radix.gitbook.io/dexter/overview/how-are-contributors-rewarded/tokenomics",
      buttonText: "Learn more",
      reversed: true,
    },
    TRADE: {
      backgroundColor: "bg-dexter-grey-light",
      title: "Earn rewards by trading",
      body: tradeBody,
      imageUrl: "/landing/sections/treasury-earn-by-trading.png",
      buttonText: "Learn more",
      buttonUrl:
        "https://dexter-on-radix.gitbook.io/dexter/overview/how-are-contributors-rewarded/liquidity-incentives",
      reversed: false,
    },
    STAKE: {
      backgroundColor: "bg-dexter-grey-dark",
      title: "Stake $XRD to earn $DEXTR",
      body: stakeBody,
      imageUrl: "/landing/sections/staking-safe.png",
      buttonText: "Stake now",
      buttonUrl:
        "https://dashboard.radixdlt.com/network-staking/validator_rdx1s0sr7xsr286jwffkkcwz8ffnkjlhc7h594xk5gvamtr8xqxr23a99a",
      reversed: true,
    },
    CONTRIBUTE: {
      backgroundColor: "bg-dexter-grey-light",
      title: "Earn $DEXTR by contributing",
      body: contributeBody,
      imageUrl: "/landing/sections/hands.png",
      buttonText: "Join us",
      buttonUrl:
        "https://dexter-on-radix.gitbook.io/dexter/overview/how-do-i-contribute",
      reversed: false,
    },
  }[topicSection];
}

export default function Landing() {
  return (
    <div className="bg-dexter-grey-light">
      <HeroSection />
      <TopicSection topicSection={TopicSectionEnum.TOKENOMICS} />
      <TopicSection topicSection={TopicSectionEnum.TRADE} />
      <TopicSection topicSection={TopicSectionEnum.STAKE} />
      <TopicSection topicSection={TopicSectionEnum.CONTRIBUTE} />
    </div>
  );
}

function HeroSection() {
  return (
    <div
      className={
        `${containerWidthAndPadding} ` +
        `flex flex-col justify-center items-center  ` +
        `min-h-[100vh] pb-[20vh]`
      }
    >
      {/* Container */}
      <div className="flex justify-center relative">
        <div
          className={
            `flex flex-col items-start justify-center z-50 ` +
            `max-[820px]:items-center max-[820px]:text-center ` +
            `min-[821px]:max-w-[60%] `
          }
        >
          <h1
            className={
              `!m-0 z-100 ` +
              `max-[420px]:py-4 ` +
              `max-[820px]:max-w-[600px] max-[820px]:!mb-2 `
            }
          >
            Decentralized Order Book Exchange on Radix
          </h1>
          <div className="relative">
            <BackgroundLights showFor={Device.MOBILE} />
            <DexterButton title="TRADE NOW" targetUrl="/trade" />
          </div>
          <KeyFeatures showFor={Device.MOBILE} />
        </div>
        <div className="relative">
          <BackgroundLights showFor={Device.DESKTOP} />
          <img
            src="/landing/dexter-mascotte.png"
            alt="Dexter Mascotte"
            className={`w-[300px] z-[100] max-[820px]:hidden relative `}
          />
        </div>
      </div>
      <KeyFeatures showFor={Device.DESKTOP} />
    </div>
  );
}

function KeyFeatures({ showFor }: { showFor: Device }) {
  const content = [
    ["landing/icons/rocket.svg", "Easy and fast"],
    ["landing/icons/decentralized.svg", "Decentralized"],
    ["landing/icons/coins.svg", "Earn rewards by trading"],
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
      {content.map(([iconUrl, title], indx) => {
        return (
          <div
            key={indx}
            className="flex flex-col justify-start items-center w-24"
          >
            <img src={iconUrl} alt={title} width="24px" />
            <p className="text-sm max-[380px]:text-xs pt-2 text-center">
              {title}
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
  topicSection,
}: {
  topicSection: TopicSectionEnum;
}): JSX.Element {
  const x = getTopicSectionProps(topicSection);
  const {
    backgroundColor,
    title,
    body,
    imageUrl,
    buttonUrl,
    buttonText,
    reversed,
  } = x;
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

interface DexterButtonProps {
  title: string;
  targetUrl?: string;
  targetBlank?: boolean;
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

function DexterParagraph({
  text,
  additionalClass,
}: {
  text: string;
  additionalClass?: string;
}) {
  return (
    <p
      className={
        "text-sm tracking-wide py-2 " + (additionalClass ? additionalClass : "")
      }
    >
      {text}
    </p>
  );
}

function DexterHeading({ title }: { title: string }) {
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
