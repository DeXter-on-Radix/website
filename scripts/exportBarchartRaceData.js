// Script that fetches data to create barchart race of contributors earning tokens
//
// Run with the following command
// > node ./scripts/exportBarchartRaceData.js -- <MAX_PHASE>
//
// For example
// > node ./scripts/exportBarchartRaceData.js -- 31

/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");

// Get max phase passed in as argument
const args = process.argv.slice(2);
const MAX_PHASE = Number(args[0]) || 32;

/**
 * HELPER FUNCTION: Fetch from google sheet
 */
const fetchSheet = async (sheetId, gic) => {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gic}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.text(); // Getting the CSV data as text
};
const GoogleSheet = {
  fetch: fetchSheet,
};

/**
 * HELPER FUNCTION: Write Object to File
 */
const getTimestampedFileName = (scriptName, fileEnding) => {
  // Get the current date and time
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  // Format the filename
  return `${year}-${month}-${day}_${hours}${minutes}${seconds}_${scriptName}.${fileEnding}`;
};

const getFilePath = (scriptName, fileEnding) => {
  const filename = getTimestampedFileName(scriptName, fileEnding);
  const directory = path.join(__dirname, ".scriptOutputs");
  // Ensure the directory exists
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  // Return the full path for the file
  return path.join(directory, filename);
};

const writeObjectOrStringToFile = (objOrString, scriptName, fileEnding) => {
  // If obj is already a string, write it directly; otherwise, stringify it
  const stringToWrite =
    typeof objOrString === "string"
      ? objOrString
      : JSON.stringify(objOrString, null, 2);
  const filePath = getFilePath(scriptName, fileEnding);
  fs.writeFile(filePath, stringToWrite, (err) => {
    if (err) {
      console.error("Error writing file:", err);
    } else {
      // eslint-disable-next-line no-console
      console.log(`Successfully saved output to file: ${filePath}`);
    }
  });
};

/**
 * HELPER FUNCTION: Get allocation distribution for each phase
 * (e.g. how much % goes to contributors, stakers etc...)
 */
function getAllocation(phase) {
  const table = [
    // phase, contributors, treasury, liqudiity, stakers
    [1, 1, 0, 0, 0],
    [4, 0.95, 0.05, 0, 0],
    [18, 0.75, 0.05, 0.2, 0],
    [23, 0.65, 0.05, 0.2, 0.1],
    [26, 0.45, 0, 0.3, 0.25],
  ];
  for (let row of table.reverse()) {
    const [currentPhase, contributors, treasury, liquidity, stakers] = row;
    if (phase >= currentPhase) {
      return {
        contributors,
        treasury,
        liquidity,
        stakers,
      };
    }
  }
  return { contributors: 1 };
}

/**
 * HELPER FUNCTION: Returns the total DEXTR emission for each phase
 * Has decided linear emission reduction model implemented.
 */
function getEmission(phase) {
  return phase <= 67
    ? 100000
    : phase <= 119
    ? 75000
    : phase <= 171
    ? 50000
    : phase <= 224
    ? 25000
    : 0;
}

async function fetchVotingResultRows() {
  const votingResultRowsCSV = await GoogleSheet.fetch(
    "19iIwysEyjCPBfqyKS7paBR33-ZRo4dGs8zwH-2JKlFk",
    "1859086643"
  );
  return votingResultRowsCSV
    .split("\n")
    .slice(1)
    .map((row) => rowToVotingResultRow(row));
}

function rowToVotingResultRow(row) {
  const [phase, user, points] = row.split(",");
  return {
    phase: Number(phase),
    user: user.toLowerCase(),
    points: Number(points),
  };
}

async function fecthContributorMap() {
  const contributorsCSV = await GoogleSheet.fetch(
    "19iIwysEyjCPBfqyKS7paBR33-ZRo4dGs8zwH-2JKlFk",
    "597869606"
  );
  const contributors = contributorsCSV
    .split("\n")
    .slice(1)
    .map((row) => rowToContributor(row));
  const contributorMap = new Map();
  for (let contributor of contributors) {
    contributorMap.set(contributor.telegram, contributor);
  }
  return contributorMap;
}

function rowToContributor(row) {
  const [telegram, github, discord, imageUrl, expertiseStr, radixWallet] =
    row.split(",");
  const expertise = expertiseStr.split(";").map((str) => str.toUpperCase());
  return {
    telegram: telegram.toLowerCase(),
    github: github.toLowerCase(),
    discord: discord.toLowerCase(),
    imageUrl,
    expertise,
    radixWallet,
  };
}

(async () => {
  // Fetch raw voting results raw rows containing fields:
  // phase, user, points
  const votingResultRows = await fetchVotingResultRows();
  // Add DEXTR amounts to each row in votingResultRows
  // Run for each phase
  for (let phase = 1; phase <= MAX_PHASE; phase++) {
    const phaseRows = votingResultRows.filter((row) => row.phase === phase);
    if (phaseRows.length === 0) {
      continue;
    }
    // Total points for this phase
    const totalPoints = phaseRows
      .map((row) => row.points)
      .reduce((a, b) => a + b, 0);
    // Total contributor rewards for this phase
    const totalTokens = getAllocation(phase).contributors * getEmission(phase);
    // Determine earned DEXTR tokens for each contributor in this phase
    for (let i = 0; i < phaseRows.length; i++) {
      // Save to new field tokens
      phaseRows[i].tokens = (phaseRows[i].points / totalPoints) * totalTokens;
    }
  }

  // Fetch contributorMap from google sheet
  const contributorMap = await fecthContributorMap();

  // Generate barchart data as CSV
  const phasesArray = votingResultRows.map((row) => row.phase);
  const uniqPhases = phasesArray
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort((a, b) => a - b);
  const finalRows = [];
  const header = ["user", "imageUrl", "category"]
    .concat(uniqPhases.map((num) => num.toString()))
    .flat();
  finalRows.push(header);
  // for each contributor
  const uniqeUsers = Array.from(contributorMap.entries()).map((arr) => arr[0]);
  for (let user of uniqeUsers) {
    const contributor = contributorMap.get(user);
    const userRow = [
      user,
      contributor?.imageUrl || "",
      contributor?.expertise[0],
    ];
    let userTokens = 0;
    const userVotingResultRows = votingResultRows.filter(
      (row) => row.user === user
    );
    for (let phase = 1; phase <= MAX_PHASE; phase++) {
      const targetUserVotingResultRow = userVotingResultRows.find(
        (row) => row.phase === phase
      );
      if (targetUserVotingResultRow && targetUserVotingResultRow.tokens) {
        userTokens += targetUserVotingResultRow.tokens;
      }
      userRow.push(userTokens.toString());
    }
    finalRows.push(userRow);
  }

  // Write result to file
  writeObjectOrStringToFile(
    finalRows.map((row) => row.join(",")).join("\n"),
    "exportBarchartRaceData",
    "csv"
  );
})();
