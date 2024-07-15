// script to update translations with 'node src/app/updateTranslations.js'

const fs = require("fs");
const path = require("path");

const exceptions = ["DeXter", "Radix", "DAO", "$DEXTR", "DEXTR", "$XRD"];

const capitalizeSentence = (str) => {
  const segments = str.split(/(?<=[.!?])\s+/);

  const capitalizedSegments = segments.map((segment) => {
    const trimmedSegment = segment.trim();

    const words = trimmedSegment.split(/\s+/);
    const isException = words.some((word) => exceptions.includes(word));

    if (isException) {
      return segment;
    }

    // capitalize the first letter of the first word and convert the rest to lowercase
    let capitalizedSegment = words
      .map((word, i) =>
        i === 0
          ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          : word.toLowerCase()
      )
      .join(" ");

    return capitalizedSegment;
  });

  return capitalizedSegments.join(" ");
};

// Function to update the translations in a given file
const updateTranslations = (filePath) => {
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      data[key] = capitalizeSentence(data[key]);
    }
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
};

const translationDirs = ["state/locales/en", "state/locales/pt"];
const translationFiles = [
  "enums.json",
  "errors.json",
  "footer.json",
  "landing.json",
  "rewards.json",
  "trade.json",
];

// Update each translation file
translationDirs.forEach((dir) => {
  translationFiles.forEach((file) => {
    const filePath = path.join(__dirname, dir, file);
    updateTranslations(filePath);
  });
});

console.log("Translations updated successfully!");
