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

### mainnet

```
NEXT_PUBLIC_NETWORK=mainnet # Options: mainnet or stokenet
NEXT_PUBLIC_DAPP_DEFINITION_ADDRESS=account_rdx168qrzyngejus9nazhp7rw9z3qn2r7uk3ny89m5lwvl299ayv87vpn5
NEXT_PUBLIC_DEFAULT_PAIR_ADDRESS=component_rdx1czgjmu4ed5hp0vn97ngsf6mevq9tl0v8rrh2yq0f4dnpndggk7j9pu
```

### testnet (default)

```
NEXT_PUBLIC_NETWORK=stokenet # Options: mainnet or stokenet
NEXT_PUBLIC_DAPP_DEFINITION_ADDRESS=account_tdx_2_129kev9w27tsl7qjg0dlyze70kxnlzycs8v2c85kzec40gg8mt73f7y
NEXT_PUBLIC_DEFAULT_PAIR_ADDRESS=component_tdx_2_1crs8ud8rr680krgtlskauye7qnns5zdawdlspvcqceder6tysu884p
```
