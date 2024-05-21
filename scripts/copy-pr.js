/* eslint-disable no-console */
// Get PR number passed in as argument
const args = process.argv.slice(2);

// Assuming you want the first argument after the script name
const pullNumber = Number(args[0]);

function printInvalidScriptInput() {
  console.error("\n\n❌ ERROR");
  console.error("# No PR number provided. Please run: ");
  console.error("npm run copy-pr -- <YOUR_PR_NUMBER>");
  console.error("");
  console.error("# For example: ");
  console.error("npm run copy-pr -- 408\n\n");
}

function printInvalidBaseRepoTargetBranch(baseRepoTargetBranch) {
  console.error("\n\n❌ ERROR: Invalid baseRepoTargetBranch\n");
  console.error(
    `The base repo target branch must be:\n> dexter-on-radix/website:main.\n\nFound instead:\n> dexter-on-radix/website:${baseRepoTargetBranch}\n\n`
  );
}

function printInvalidForkedRepo() {
  console.error("\n\n❌ ERROR: Not a forked Repo\n");
  console.error(
    `looks like this is already a branch of the origin repository, no need to copy this PR!\n\n`
  );
}

if (!pullNumber) {
  printInvalidScriptInput();
  return;
}

(async () => {
  const url = `https://api.github.com/repos/dexter-on-radix/website/pulls/${pullNumber}`;
  const response = await fetch(url);
  const data = await response.json();

  const baseRepo = `${data.base.repo.full_name}`;
  const baseRepoTargetBranch = data.base.ref;
  const forkedRepoOwner = data.head.user.login;
  const forkedRepoName = data.head.repo.name;
  const forkedRepoBranchName = data.head.ref;

  if (baseRepo.toLowerCase() !== "dexter-on-radix/website") {
    printInvalidBaseRepo(baseRepo);
    return;
  }

  if (baseRepoTargetBranch.toLowerCase() !== "main") {
    printInvalidBaseRepoTargetBranch(baseRepoTargetBranch);
    return;
  }

  if (forkedRepoOwner.toLowerCase() === "dexter-on-radix") {
    printInvalidForkedRepo();
    return;
  }

  // Success: Print instructions to copy PR
  console.log(`

# 👋 Hi ${forkedRepoOwner}

# Welcome to DeXter! Thank you for your contribution! 

# TO MERGE YOUR PR, PLEASE FOLLOW THESE INSTRUCTIONS:

# You just got invited to the "developers" group of the "Dexter-on-Radix" organization. 
# Please accept the invite and ensure your github account shows up here:
# https://github.com/orgs/DeXter-on-Radix/teams/developers

# Then follow these steps:

# 1. Clone the original repository (if you haven't already)
git clone https://github.com/dexter-on-radix/website.git dexter-webapp
cd dexter-webapp

# 2. Add your fork as a remote (if you haven't already):
git remote add fork-${forkedRepoOwner} https://github.com/${forkedRepoOwner}/${forkedRepoName}.git

# 3. Fetch the branches from your fork:
git fetch fork-${forkedRepoOwner}

# 4. Create a new branch in the original repository and copy the PR from your forked repository's branch:
git checkout -b fork-${forkedRepoOwner}--${forkedRepoBranchName} fork-${forkedRepoOwner}/${forkedRepoBranchName}

# 5. Push the new branch to the original repository:
git push origin fork-${forkedRepoOwner}--${forkedRepoBranchName}

# Create a pull request for 'fork-${forkedRepoOwner}--${forkedRepoBranchName}' on GitHub by visiting:
#      https://github.com/DeXter-on-Radix/website/pull/new/fork-${forkedRepoOwner}--${forkedRepoBranchName}

  `);
})();
