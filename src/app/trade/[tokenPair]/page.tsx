import Trade from "components/Trade";
import { PromoBanner, PromoBannerProps } from "components/PromoBanner";

// Configuration for promo banner
// Once both images and a targetUrl are defined the banner will automatically show
const promoBannerConfig: PromoBannerProps = {
  imageUrl: "/promo-banners/validator-node-staking/desktop-600x80.svg",
  imageUrlMobile: "/promo-banners/validator-node-staking/mobile-600x200.svg",
  redirectUrl:
    "https://dashboard.radixdlt.com/network-staking/validator_rdx1s0sr7xsr286jwffkkcwz8ffnkjlhc7h594xk5gvamtr8xqxr23a99a",
};

export default function TradePage({
  params,
}: {
  params: { tokenPair: string };
}) {
  const adjustedTokenPair = params.tokenPair.replace("-", "/").toUpperCase();

  return (
    <>
      <PromoBanner {...promoBannerConfig} />
      <Trade tokenPair={adjustedTokenPair} />
    </>
  );
}
