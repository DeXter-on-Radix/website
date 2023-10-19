/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  transpilePackages: ["@radixdlt/radix-dapp-toolkit"],
};

module.exports = nextConfig;
