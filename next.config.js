/** @type {import('next').NextConfig} */
const withMDX = require("@next/mdx")();

const dotenv = require("dotenv");
const path = require("path");

const envPath = path.join(__dirname, process.env.ENV_FILE || ".env.testnet");
dotenv.config({ path: envPath });

const nextConfig = {
  output: "export",

  // React strict mode causes the dApp to render twice.
  // For some reason this does not play well with dApp toolkit.
  // https://discord.com/channels/417762285172555786/1181329944811413555/1181336985609175080
  reactStrictMode: false,

  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],

  // for github pages
  basePath: process.env.BASE_PATH || "",
  async redirects() {
    return [
      {
        source: "/roadmap",
        destination:
          "https://ductus.notion.site/DeXter-Roadmap-e8faed71fe1c4cdf95fb247f682c0d3a",
        permanent: false,
      },
      {
        source: "/treasury",
        destination:
          "https://dashboard.radixdlt.com/account/account_rdx168qrzyngejus9nazhp7rw9z3qn2r7uk3ny89m5lwvl299ayv87vpn5",
        permanent: false,
      },
      {
        source: "/tester-setup",
        destination:
          "https://ductus.notion.site/DeXter-Beta-Tester-Setup-106a4c8666088049987dc71fe4bb3daa",
        permanent: false,
      },
    ];
  },
};

module.exports = withMDX(nextConfig);
