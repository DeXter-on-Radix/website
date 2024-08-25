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

function runContributorAnalytics(
  contributorMap: Map<string, Contributor>,
  votingResultRows: VotingResultRow[]
): void {
  for (let phase = 1; phase <= 224; phase++) {
    const phaseRows = votingResultRows.filter((row) => row.phase === phase);
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
    const userTokens = totalTokens * (points / total);
    console.log(`${user}: ${userTokens} DEXTR`);
    const contributor = contributorMap.get(user);
    if (!contributor) {
      continue;
    }
    contributor.tokensEarned = contributor.tokensEarned
      ? contributor.tokensEarned + userTokens
      : userTokens;
  }
  // Log for testing
  console.log(
    `Phase ${phase}:\ntotal points: ${total}\ntotal contributors: ${phaseRows.length}`
  );
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
}

function rowToContributor(row: string): Contributor {
  const [telegram, github, discord, imageUrl, expertiseStr, radixWallet] =
    row.split(",");
  const expertise = expertiseStr
    .split(";")
    .map((str) => str.toUpperCase() as Expertise);
  return {
    telegram,
    github,
    discord,
    imageUrl,
    expertise,
    radixWallet,
  } as Contributor;
}

function rowToVotingResultRow(row: string): VotingResultRow {
  const [phase, user, points] = row.split(",");
  return {
    phase: Number(phase),
    user,
    points: Number(points),
  } as VotingResultRow;
}
