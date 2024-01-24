/** @type {import('next').NextConfig} */
const withMDX = require("@next/mdx")();

const nextConfig = {
  output: "export",

  // React strict mode causes the dApp to render twice.
  // For some reason this does not play well with dApp toolkit.
  // https://discord.com/channels/417762285172555786/1181329944811413555/1181336985609175080
  reactStrictMode: false,

  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
};

module.exports = withMDX(nextConfig);
