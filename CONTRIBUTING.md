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
- **Run tests locally** with `npm run test-all` before submitting any PR. This will help you find issues fast.
- **Try to avoid custom CSS** - the project uses [DaisyUI](https://daisyui.com/) and [TailwindCSS](https://tailwindcss.com/docs/) for styling, whenever possible use the existing components and classes, the full rationale (by creator of TailwindCSS) is [here](https://adamwathan.me/css-utility-classes-and-separation-of-concerns/)
- **Use [Redux Dev Tools Extension](https://chromewebstore.google.com/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)** for easy debugging of redux state. Watch this [1 min video tutorial](https://www.youtube.com/watch?v=5qrIbU1XspA) on how to set it up.

If you happen to use VS Code, install the recommended extensions to get automatic formatting and linting on save, they are listed in `.vscode/extensions.json` and VS Code will prompt you to install them.

## Set Up

- Fork the Dexter repository to your github account.
- Clone from your forked repo.
- Make a new branch with a feature name (you can see some examples in [closed PRs](https://github.com/DeXter-on-Radix/website/pulls?q=is%3Apr+is%3Aclosed)).
- Make some changes.
- Commit and push local branch changes to your own repo.
- Make a pull request into the [original Dexter repo](https://github.com/DeXter-on-Radix/website).

## Env setup

Environment variables are set up in `.env.testnet` and `.env.mainnet` files. If you need to add new variables do **NOT** use fallbacks in the code (like `process.env.REACT_APP_MY_VAR || 'default'`)
anywhere other than in `next.config.js`,
so that the app will crash and you will be reminded to set it correctly for both environments early.

Refer to package.json to see what env files are used with which command.

If you have an `.env` file it will take precedence over the `.env.testnet` and `.env.mainnet` files.

Do not run build command without ENV_FILE variable set beforehand, (it's not already set in package.json for deployment purposes).

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

## How to use Translations

To ensure our application supports multiple languages, all text displayed must be translated. We currently support **English** (**en**) and **Portuguese** (**pt**). Translations are stored in JSON files at `/src/app/states/locales/{{lng}}/{{namespace}}`.json, where `lng` is the language code and `namespace` is a specific category of content. This structure facilitates potential future integration with server-side internationalization. Upon initial page load, content in all languages is preloaded and instantly available.

### Implementing Translations in Components

To use a translation in a React component:

```jsx
import React from "react";
import { useTranslations } from "hooks";

const MyComponent = () => {
  const t = useTranslations();

  return <div>{t("some_key")}</div>;
};
```

### Adding New Translations

Extend the JSON files with new key-value pairs to add translations. Ensure to add keys for every supported language to avoid displaying the key as fallback text.

### Creating a New Namespace

For new subpages, create a corresponding namespace. Search for "INSTRUCTIONS_add_namespace" in the codebase and follow the outlined steps. After setup, utilize your namespace as mentioned above.

### Naming Conventions

- **Keys** in JSON files:
  - Use the full text in lowercase, replacing spaces with underscores, e.g., "trade_now".
  - Enums or errors should be in uppercase.
- **Values** should:
  - Use title capitalization, capitalizing all main words except for short filler words, e.g., "Trade Now", "History of Transactions".

### Placeholders

Placeholders allow the dynamic insertion of content into sentences, accommodating language-specific syntax. For example, "market buy XRD" in English may translate to "comprar XRD a mercado" in Portuguese. To handle this, we use placeholders like <$IDENTIFIER>, for variable content such as token symbols. The translation files define the sentence structure for each language, e.g.:

- en: "market buy <$TOKEN_SYMBOL>"
- pt: "comprar <$TOKEN_SYMBOL> a mercado"

Developers are responsible for replacing placeholders with actual values within the code.

## Notifications (Toasts)

Whenever you need toast notifications, please use our `DexterToast` API, which wraps `react-hot-toast` and applies Dexter branding to all generated toasts.

Use Toast notifications for:

- ✅ Low attention messages that do not require user action
- ✅ Singular status updates
- ✅ Confirmations
- ✅ Information that does not need to be followed up

Do not use Toast notifications for:

- ❌ High attention and crtitical information
- ❌ Time-sensitive information
- ❌ Requires user action or input
- ❌ Batch updates

### Toast Notification Code Examples

There are 3 functions exposed:

- `DexterToast.success(...)`
- `DexterToast.error(...)`
- `DexterToast.promise(...)`

![Group 56](https://github.com/DeXter-on-Radix/website/assets/44790691/09dca3d8-fd9b-4988-9c59-87669fb2a16b)

See usage examples:

```jsx
// Import DexterToast class anywhere in the code
import { DexterToast } from "components/DexterToaster";

// Create success toast
DexterToast.success("Success!");

// Create error toast
DexterToast.error("Oops, something went wrong!");

// Create loading toast that initially has a loading state
// and resolves to either a success or error toast
DexterToast.promise(
  () => dispatch(fetchBalances()), // function call, must return a promise
  "Fetching balances", // loading text
  "Balances fetched", // success text
  "Failed to fetch balances" // error text
);
```

Further reading:

- [Toast notifications — how to make it efficient](https://bootcamp.uxdesign.cc/toast-notifications-how-to-make-it-efficient-400cab6026e9)
- [When should we “TOAST” use the most? — fix UX.](https://bootcamp.uxdesign.cc/when-should-we-toast-use-the-most-fix-ux-353def0e61a5)
- [Toast notifications Guide](https://design-system.hpe.design/templates/toast-notifications)
- [A UX designer’s guide to implementing toast notifications](https://blog.logrocket.com/ux-design/toast-notifications/)

## Promo Banners

The space on top of the trading page can be used to display promo banners, for example:

![image](https://github.com/DeXter-on-Radix/website/assets/44790691/670983d6-3233-4685-8c5e-e0b4c06335f6)

### Add new Banners

To add a new banner, follow these steps:

1. Each banner needs to be created in 2 versions: dektop (600x80) and mobile (600x200).
2. The background for all banners is always a linear gradient from green -> blue (see example for [desktop](https://github.com/DeXter-on-Radix/website/assets/44790691/ec2a489e-3e89-4e4e-a9b8-612d5478f7cb) or [mobile](https://github.com/DeXter-on-Radix/website/assets/44790691/86ade9db-7055-464c-843b-e2298e8980f4)) and will be painted by the website.
3. If you are the designer creating the banner, the content needs to be delivered as an SVG with a transparent background (see examples for [desktop](https://github.com/DeXter-on-Radix/website/blob/main/public/promo-banners/validator-node-staking/desktop-600x80.svg) or [mobile](https://github.com/DeXter-on-Radix/website/blob/main/public/promo-banners/validator-node-staking/mobile-600x200.svg)). Furthermore, ensure there is only a single call to action (CTA). Avoid having multiple competing actions like "STAKE NOW" and "learn more". Decide which one is more important and design the banner accordingly :D
4. Upload both files to `/public/promo-banners/`.
5. Fill out `imageUrl`, `imageUrlMobile` and optionally `redirecturl` inside [`src/app/layout.tsx`](https://github.com/DeXter-on-Radix/website/blob/main/src/app/layout.tsx#L15-L20).
