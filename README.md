# DeXter On Radix Website

This is the website for DeXter On Radix, a decentralized exchange on the [Radix network](https://github.com/radixdlt) powered by [AlphaDEX](https://alphadex.net/). Check out our [linktr.ee](https://linktr.ee/dexteronradix).

## Getting Started

To run the website locally:

```bash
npm i
npm run dev
```

If you'd like to send and receive trades, you will need to:

1. install [Radix development wallet](https://docs-babylon.radixdlt.com/main/getting-started-developers/wallet/wallet-and-connector-installation.html#_install_the_radix_wallet_preview)
2. install [connector extension](https://docs-babylon.radixdlt.com/main/getting-started-developers/wallet/wallet-and-connector-installation.html#_install_the_connector)

## Contributing

We welcome contributions to this project. Please read our [contributing guidelines](CONTRIBUTING.md) before submitting a pull request.

**REMARK ON FORKED REPOS**:

If you created a PR from a forked repo, please run the following command to create instructions on how to copy the PR from your forked repo onto the origin repository (dexter-on-radix/website). Insert the PR number into this script:

```bash
npm run copy-pr -- <PR_NUMBER>

# an actual (valid) example is PR#409:
npm run copy-pr -- 409
```
