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
        source: '/roadmap',
        destination: 'https://ductus.notion.site/DeXter-Roadmap-e8faed71fe1c4cdf95fb247f682c0d3a',
        permanent: false, // Set it to false if you want a 307 temporary redirect, set it to true to make it a 308 permanent redirect. 
      },
    ];
  },
};

module.exports = withMDX(nextConfig);
