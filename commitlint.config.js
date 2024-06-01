module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2, // raise an error if the rules are not met
      "always", // always raise an error
      ["fix", "refactor", "revert", "hotfix", "bump", "feat", "styles", "docs"],
    ],
  },
};
