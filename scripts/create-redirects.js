const fs = require("fs");
const path = require("path");

const redirectionPaths = {
  roadmap:
    "https://ductus.notion.site/DeXter-Roadmap-e8faed71fe1c4cdf95fb247f682c0d3a",
  "tester-setup":
    "https://ductus.notion.site/DeXter-Beta-Tester-Setup-106a4c8666088049987dc71fe4bb3daa",
  treasury:
    "https://dashboard.radixdlt.com/account/account_rdx168qrzyngejus9nazhp7rw9z3qn2r7uk3ny89m5lwvl299ayv87vpn5",
  contribute:
    "https://github.com/DeXter-on-Radix/website/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22",
};

const redirectionHTMLPage = (destination) => {
  return `<!DOCTYPE HTML>
<html lang="en-US">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="refresh" content="0; url=${destination}">
        <script type="text/javascript">
            window.location.href = "${destination}"
        </script>
        <title>Dexter</title>
    </head>
    <body>
        If you are not redirected automatically, click <a href='${destination}'>here</a>.
    </body>
</html>`;
};

const generateRedirectPage = (source, destination) => {
  // Get the nextjs static page output directory
  const outputDirectory = path.join(__dirname, "../out");
  // Get the path for the html file to generate
  const htmlFilePath = path.join(outputDirectory, `${source}.html`);
  // Check to see if the file exists, if it does, we do not want to replace it
  if (!fs.existsSync(htmlFilePath)) {
    fs.writeFile(htmlFilePath, redirectionHTMLPage(destination), (err) => {
      if (err) {
        console.error("Error writing file:", err);
      } else {
        // eslint-disable-next-line no-console
        console.log(`Successfully saved output to file: ${htmlFilePath}`);
      }
    });
  }
};

// RUN POST BUILD SCRIPT
(async () => {
  Object.keys(redirectionPaths).forEach((redirectionPath) => {
    generateRedirectPage(redirectionPath, redirectionPaths[redirectionPath]);
  });
})();
