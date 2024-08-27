import { createSlice } from "@reduxjs/toolkit";
import { GoogleSheet } from "../utils/GoogleSheet";

export interface TeamState {
  contributorMap: [string, Contributor][];
  votingResultRows: VotingResultRow[];
}

interface VotingResultRow {
  phase: number;
  user: string;
  points: number;
  tokens?: number;
}

const initialState: TeamState = {
  contributorMap: [],
  votingResultRows: [],
};

interface Allocation {
  contributors: number;
  treasury?: number;
  liquidity?: number;
  stakers?: number;
}

function getAllocation(phase: number): Allocation {
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

// Returns the total DEXTR emission for each phase
function getEmission(phase: number): number {
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

export enum Expertise {
  "DEVELOPER" = "DEVELOPER",
  "DESIGN" = "DESIGN",
  "SOCIAL_MEDIA" = "SOCIAL_MEDIA",
  "ADMINISTRATION" = "ADMINISTRATION",
  "TESTER" = "TESTER",
  "NA" = "NA",
}

export interface Contributor {
  telegram: string;
  github?: string;
  discord?: string;
  imageUrl?: string;
  expertise?: Expertise[];
  radixWallet?: string;
  // badges
  isOG?: boolean;
  isLongTerm?: boolean;
  isActive?: boolean;
  phasesActive?: string[];
  // analytics
  tokensEarned?: number;
  trophyGold?: number;
  trophySilver?: number;
  trophyBronze?: number;
}

export const teamSlice = createSlice({
  name: "team",
  initialState,

  // synchronous reducers
  reducers: {},

  // async thunks
  extraReducers: () => {},
});

export async function fetchTeamState(): Promise<TeamState> {
  const [contributorMap, votingResultRows] = await Promise.all([
    fecthContributorMap(),
    fetchVotingResultRows(),
  ]);
  // Compute contributor analytics
  runContributorAnalytics(contributorMap, votingResultRows);
  return {
    contributorMap: Array.from(contributorMap.entries()),
    votingResultRows,
  };
}

export function showContributorRanking(
  contributorMap: Map<string, Contributor>
) {
  const contr = Array.from(contributorMap.entries())
    .map((arr): Contributor | undefined => arr[1])
    .filter(
      (item): item is Contributor =>
        item !== undefined && item.tokensEarned !== undefined
    )
    .sort(
      (a, b) =>
        (b as { tokensEarned: number }).tokensEarned -
        (a as { tokensEarned: number }).tokensEarned
    );
  // eslint-disable-next-line no-console
  console.log(contr.map((c) => `${c.telegram}: ${c.tokensEarned}`).join("\n"));
}

export function exportBarchartRaceData(
  contributorMap: Map<string, Contributor>,
  votingResultRows: VotingResultRow[]
) {
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
  const uniqeUsers = Array.from(contributorMap.keys());
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
    for (let phase = 1; phase <= 31; phase++) {
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
}

function runContributorAnalytics(
  contributorMap: Map<string, Contributor>,
  votingResultRows: VotingResultRow[]
): void {
  for (let phase = 1; phase <= 224; phase++) {
    const phaseRows = votingResultRows.filter((row) => row.phase === phase);
    if (phaseRows.length === 0) {
      continue;
    }
    runPhaseAnalytics(phase, contributorMap, phaseRows);
  }
}

interface Trophies {
  gold: { [key: string]: number };
  silver: { [key: string]: number };
  bronze: { [key: string]: number };
}

function runPhaseAnalytics(
  phase: number,
  contributorMap: Map<string, Contributor>,
  phaseRows: VotingResultRow[]
) {
  if (phaseRows.length === 0) {
    return;
  }
  // Total points
  const total = phaseRows.map((row) => row.points).reduce((a, b) => a + b, 0);
  // Run for all rows
  const trophies: Trophies = {
    gold: {},
    silver: {},
    bronze: {},
  };
  for (let i = 0; i < phaseRows.length; i++) {
    const { user, points } = phaseRows[i];
    if (i === 0) {
      trophies.gold[user] = trophies.gold[user] ? trophies.gold[user] + 1 : 1;
    }
    if (i === 1) {
      trophies.silver[user] = trophies.silver[user]
        ? trophies.silver[user] + 1
        : 1;
    }
    if (i === 2) {
      trophies.bronze[user] = trophies.bronze[user]
        ? trophies.bronze[user] + 1
        : 1;
    }
    // get contributor rewards tokens
    const totalTokens = getAllocation(phase).contributors * getEmission(phase);
    const tokens = totalTokens * (points / total);
    phaseRows[i].tokens = tokens;
    const contributor = contributorMap.get(user);
    if (!contributor) {
      continue;
    }
    contributor.tokensEarned = contributor.tokensEarned
      ? contributor.tokensEarned + tokens
      : tokens;
  }
}

async function fecthContributorMap(): Promise<Map<string, Contributor>> {
  const contributorsCSV = await GoogleSheet.fetch(
    "19iIwysEyjCPBfqyKS7paBR33-ZRo4dGs8zwH-2JKlFk",
    "597869606"
  );
  const contributors = contributorsCSV
    .split("\n")
    .slice(1)
    .map((row) => rowToContributor(row));
  const contributorMap: Map<string, Contributor> = new Map();
  for (let contributor of contributors) {
    contributorMap.set(contributor.telegram, contributor);
  }
  return contributorMap;
}

async function fetchVotingResultRows(): Promise<VotingResultRow[]> {
  const votingResultRowsCSV = await GoogleSheet.fetch(
    "19iIwysEyjCPBfqyKS7paBR33-ZRo4dGs8zwH-2JKlFk",
    "1859086643"
  );
  return votingResultRowsCSV
    .split("\n")
    .slice(1)
    .map((row) => rowToVotingResultRow(row));
  // // compute tokens earned for each row
  // for (let phase = 1; phase <= 224; phase++) {
  //   const phaseRows = votingResultRows.filter((row) => row.phase === phase);
  //   if (phaseRows.length === 0) {
  //     continue;
  //   }
  //   const phasePoints = phaseRows
  //     .map((row) => row.points)
  //     .reduce((a, b) => a + b, 0);
  //   const phaseContributorAllocation =
  //     getAllocation(phase).contributors * getEmission(phase);
  //   for (let phaseRow = 0; phaseRow < phaseRows.length; phaseRow++) {
  //     const { user, points } = phaseRows[phaseRow];
  //     const contributor = contributorMap.get(user);
  //     if (!contributor) {
  //       continue;
  //     }
  //     contributor.tokensEarned = contributor.tokensEarned
  //       ? contributor.tokensEarned + userTokens
  //       : userTokens;
  //   }
  // }
}

function rowToContributor(row: string): Contributor {
  const [telegram, github, discord, imageUrl, expertiseStr, radixWallet] =
    row.split(",");
  const expertise = expertiseStr
    .split(";")
    .map((str) => str.toUpperCase() as Expertise);
  return {
    telegram: telegram.toLowerCase(),
    github: github.toLowerCase(),
    discord: discord.toLowerCase(),
    imageUrl,
    expertise,
    radixWallet,
  } as Contributor;
}

function rowToVotingResultRow(row: string): VotingResultRow {
  const [phase, user, points] = row.split(",");
  return {
    phase: Number(phase),
    user: user.toLowerCase(),
    points: Number(points),
  } as VotingResultRow;
}
