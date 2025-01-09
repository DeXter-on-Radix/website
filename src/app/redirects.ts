export const redirects: { [key: string]: string } = {
  "/treasury":
    "https://dashboard.radixdlt.com/account/account_rdx168qrzyngejus9nazhp7rw9z3qn2r7uk3ny89m5lwvl299ayv87vpn5",
  "/tester-setup":
    "https://ductus.notion.site/DeXter-Beta-Tester-Setup-106a4c8666088049987dc71fe4bb3daa",
  "/roadmap":
    "https://ductus.notion.site/DeXter-Roadmap-e8faed71fe1c4cdf95fb247f682c0d3a",
  "/rakoon-revenue":
    "https://docs.google.com/spreadsheets/d/1xyEob71d5c2eHuQjq1P60DXaAeeuboB2nSQFztiWviU/edit?usp=sharing",
  "/contribute":
    "https://github.com/DeXter-on-Radix/website/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22",
};

export function isRedirectPath(input: string): boolean {
  if (redirects[input]) {
    return true;
  }
  return false;
}

export function getRedirectUrl(input: string): string {
  return redirects[input];
}
