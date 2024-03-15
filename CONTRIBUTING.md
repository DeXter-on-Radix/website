Contributions are welcome!

Check out [existing issues (especially Todo)](https://github.com/orgs/DeXter-on-Radix/projects/1/views/1), review a [pull request](https://github.com/orgs/DeXter-on-Radix/projects/1/views/3), or [create a new issue](https://github.com/DeXter-on-Radix/website/issues/new) to start a discussion.

Here are a few guidelines to follow:

- **Discuss** major changes with the maintainers before starting work, our [Discord](https://discord.gg/Y44jqe2q2W) is a good place to do that
- **Use [Pull Requests (PRs)](https://docs.github.com/en/pull-requests)** - commits direclty to `main` branch are not allowed
- **Use [Prettier](https://prettier.io/)** and automatic code formatting to keep PRs focused on the changes
- **Use [ESLint](https://eslint.org/)** to keep code clean and consistent
- **Make PRs small and focused on a single change** so they are easier to review and merge
- **Make PRs complete** so that the new feature is functional
- **Write tests** to prevent regressions, unit tests with [Jest](https://jestjs.io/) in `__tests__` folder, end to end tests with [Playwright](https://playwright.dev/) in `e2e` folder

If you happen to use VS Code, install the recommended extensions to get automatic formatting and linting on save, they are listed in `.vscode/extensions.json` and VS Code will prompt you to install them.

## Set Up

- Fork the Dexter repository to your github account.
- Clone from your forked repo.
- Make a new branch with a feature name (you can see some examples in [closed PRs](https://github.com/DeXter-on-Radix/website/pulls?q=is%3Apr+is%3Aclosed)).
- Make some changes.
- Commit and push local branch changes to your own repo.
- Make a pull request into the [original Dexter repo](https://github.com/DeXter-on-Radix/website).

## Env setup

By default `npm run dev` uses the testnet (stokenet), but it can be set to mainnet by creating a `.env` file in the root project dir with the following content:

### Mainnet

```
NEXT_PUBLIC_NETWORK=mainnet # Options: mainnet or stokenet
NEXT_PUBLIC_DAPP_DEFINITION_ADDRESS=account_rdx168qrzyngejus9nazhp7rw9z3qn2r7uk3ny89m5lwvl299ayv87vpn5
NEXT_PUBLIC_DEFAULT_PAIR_ADDRESS=component_rdx1czgjmu4ed5hp0vn97ngsf6mevq9tl0v8rrh2yq0f4dnpndggk7j9pu
```

### Testnet (default)

```
NEXT_PUBLIC_NETWORK=stokenet # Options: mainnet or stokenet
NEXT_PUBLIC_DAPP_DEFINITION_ADDRESS=account_tdx_2_129kev9w27tsl7qjg0dlyze70kxnlzycs8v2c85kzec40gg8mt73f7y
NEXT_PUBLIC_DEFAULT_PAIR_ADDRESS=component_tdx_2_1crs8ud8rr680krgtlskauye7qnns5zdawdlspvcqceder6tysu884p
```

## Testnet Wallet Setup

Follow these steps to configure your wallet for testnet use, enabling developer mode, switching networks, and acquiring test tokens.

**Enable Developer Mode**

1. **Access Settings**: Navigate to `App settings` from the main menu.
2. **Activate Developer Mode**: Within `App settings`, locate and toggle on the `Developer Mode` option.

**Switch to Testnet**

1. **Open Gateways**: Within `App settings`, proceed to `Gateways`.
2. **Select Testnet**: From the list of gateways, choose `babylon-stokenet-...` option.

Your wallet is now in developer mode and connected to the testnet.

**Acquire Test XRD Tokens**

1. Follow the standard procedure to `Create a wallet` and set up a `Persona` within the app.
2. **Access Test Account**: Open your test account profile.
3. **Navigate to Dev Preferences**: Tap the three dots in the top right corner to access more options, then select `Dev preferences`.
4. **Get Test Tokens**: Click on `Get XRD Test Tokens` to receive your test currency.

By following these steps, you'll have your wallet set up for testing Dexter on localhost and creating orders using test XRD tokens.

## How to use Translations^

Every piece of text content that is displayed on the page, needs to be translated into all supported languages. Currently we support:

- en (english)
- pt (portuguese)

The translation files are located in `/src/app/states/locales/{{lng}}/{{namespace}}.json` where `lng` is the language code, and `namespace` is the namespace. This structure is chosen for a seamless transition into server side internationalization at a later stage (if required). Currently all content in all languages is fully loaded on initial pageload.

### Using existing translations

```jsx
import React from "react";
import { useTranslations } from "hooks";

const MyComponent = () => {
  const t = useTranslations();

  return <div>{t("some_key")}</div>;
};
```

### Adding translations

To add translations, simply extend the JSON files by adding new KEY -> VALUE pairs. The KEY is then accessible via `t("your_key")` as shown above.

**IMPORTANT**: It is the developers responsibility to add keys for all languages! If a key in a language is missing, the key iteself will be returned.

### Adding a new namespace

If you create a new subpage, it's recommended to create a new namespace. To do so, search the codebase for the keyword "INSTRUCTIONS_add_namespace", then follow each steps instructions. Once you have done all the steps, you can start using your new namespace as described in the previous sections.
