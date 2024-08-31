import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GoogleSheet } from "../utils/GoogleSheet";

export interface TeamState {
  contributorMap: [string, Contributor][];
  votingResultRows: VotingResultRow[];
  activityStatusFilter?: ActivityStatus;
  expertiseFilter?: Expertise;
}

interface VotingResultRow {
  phase: number;
  user: string;
  points: number;
  tokens?: number;
}

export enum Expertise {
  "ADMIN" = "ADMIN",
  "DEV" = "DEV",
  "DESIGN" = "DESIGN",
  "SOCIAL_MEDIA" = "SOCIAL_MEDIA",
  "TESTING" = "TESTING",
}

export enum ActivityStatus {
  "ACTIVE" = "ACTIVE",
  "PAST" = "PAST",
}

const initialState: TeamState = {
  contributorMap: [],
  votingResultRows: [],
  activityStatusFilter: ActivityStatus.ACTIVE,
  expertiseFilter: undefined,
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

export interface Contributor {
  name: string;
  telegram: string;
  github?: string;
  discord?: string;
  imageUrl?: string;
  expertise: Expertise[];
  radixWallet?: string;
  // badges
  isOG?: boolean;
  isLongTerm?: boolean;
  isActive: boolean;
  phasesActive: number[];
  // analytics
  tokensEarned: number;
  trophyGold: number;
  trophySilver: number;
  trophyBronze: number;
}

export const teamSlice = createSlice({
  name: "team",
  initialState,

  // synchronous reducers
  reducers: {
    setTeamState: (state: TeamState, action: PayloadAction<TeamState>) => {
      state.contributorMap = action.payload.contributorMap;
      state.votingResultRows = action.payload.votingResultRows;
    },
    setExpertiseFilter: (
      state: TeamState,
      action: PayloadAction<Expertise | undefined>
    ) => {
      state.expertiseFilter = action.payload;
    },
    setActivityStatusFilter: (
      state: TeamState,
      action: PayloadAction<ActivityStatus | undefined>
    ) => {
      state.activityStatusFilter = action.payload;
    },
  },

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

export function showContributorTrophies(
  contributorMap: [string, Contributor][]
) {
  const contr = contributorMap
    .map((arr) => arr[1])
    .filter((item): item is Contributor => item !== undefined)
    .filter(
      (item): item is Contributor =>
        item.trophyGold > 0 || item.trophySilver > 0 || item.trophyBronze > 0
    )
    .sort((a, b) => {
      if (b.trophyGold !== a.trophyGold) {
        // First, sort by gold trophies
        return b.trophyGold - a.trophyGold;
      } else if (b.trophySilver !== a.trophySilver) {
        // Then, sort by silver trophies
        return b.trophySilver - a.trophySilver;
      } else {
        // Finally, sort by bronze trophies
        return b.trophyBronze - a.trophyBronze;
      }
    });
  // eslint-disable-next-line no-console
  console.log(`#   USER             🏆 | 🥈 | 🥉\n`);
  // eslint-disable-next-line no-console
  console.log(
    contr
      .map((c, indx, arr) => {
        const maxNameLength = Math.max(...arr.map((c) => c.telegram.length)); // Get the max length of telegram names
        const paddedName = c.telegram.padEnd(maxNameLength + 1); // Pad the names to align
        const indexString = (indx + 1).toString().padStart(2); // Add a space for single-digit numbers
        return `#${indexString} ${paddedName}: ${c.trophyGold} | ${c.trophySilver} | ${c.trophyBronze}`; // Combine everything into the final string
      })
      .join("\n")
  );
}

export function showContributorTotalEarnings(
  contributorMap: [string, Contributor][]
) {
  const contr = contributorMap
    .map((arr) => arr[1])
    .filter((item): item is Contributor => item !== undefined)
    .sort(
      (a, b) =>
        (b as { tokensEarned: number }).tokensEarned -
        (a as { tokensEarned: number }).tokensEarned
    );
  // eslint-disable-next-line no-console
  console.log("TOTAL EARNINGS");
  // eslint-disable-next-line no-console
  console.log(
    contr
      .map((c, indx, arr) => {
        const maxNameLength = Math.max(...arr.map((c) => c.telegram.length)); // Get the max length of telegram names
        const paddedName = c.telegram.padEnd(maxNameLength + 1); // Pad the names to align
        const indexString = (indx + 1).toString().padStart(2); // Add a space for single-digit numbers
        const valueString = Number(c.tokensEarned?.toFixed(0))
          .toLocaleString("en")
          .padStart(8); // Right-align the value, assuming a max length of 7 digits plus comma formatting
        return `#${indexString} ${paddedName}: ${valueString}`; // Combine everything into the final string
      })
      .join("\n")
  );
}

export function showActiveContributors(
  contributorMap: [string, Contributor][]
) {
  const activeContributors = contributorMap
    .map((arr) => arr[1])
    .filter((contributor) => contributor.isActive);
  // eslint-disable-next-line no-console
  console.log(activeContributors);
  // eslint-disable-next-line no-console
  console.log(activeContributors.length);
}

function runContributorAnalytics(
  contributorMap: Map<string, Contributor>,
  votingResultRows: VotingResultRow[]
): void {
  const lastPhase = votingResultRows[votingResultRows.length - 1].phase;
  for (let phase = 1; phase <= lastPhase; phase++) {
    const phaseRows = votingResultRows.filter((row) => row.phase === phase);
    if (phaseRows.length === 0) {
      continue;
    }
    runPhaseAnalytics(phase, contributorMap, phaseRows);
  }
  // mark contributor Status level
  const nLastPhases = 3; // contributing withing the last 3 phases
  const activePhaseThreshold = lastPhase - (nLastPhases - 1); // last phase also counts
  const votingResultRowsSubset = votingResultRows.filter(
    (row) => row.phase >= activePhaseThreshold
  );
  const activeUsers = votingResultRowsSubset
    .map((row) => row.user)
    .filter((val, indx, self) => self.indexOf(val) === indx);
  for (const username of activeUsers) {
    const contributor = contributorMap.get(username);
    if (contributor) {
      contributor.isActive = true;
    }
  }
}

function runPhaseAnalytics(
  phase: number,
  contributorMap: Map<string, Contributor>,
  phaseRows: VotingResultRow[]
) {
  if (phaseRows.length === 0) {
    return;
  }
  // Total points for this phase
  const totalPoints = phaseRows
    .map((row) => row.points)
    .reduce((a, b) => a + b, 0);
  // Total contributor rewards for this phase
  const totalTokens = getAllocation(phase).contributors * getEmission(phase);
  // Determine earned DEXTR tokens for each contributor in this phase
  for (let row = 0; row < phaseRows.length; row++) {
    const { user, points } = phaseRows[row];
    const contributor = contributorMap.get(user);
    // Calculate trophies
    if (!contributor) {
      continue;
    }
    if (!points) {
      console.error("Error with google sheet...");
      console.error({ phaseRows, phase, user, points });
      continue;
    }
    // Add phase to phasesActive array
    contributor.phasesActive.push(phase);
    // Add trophies
    if (row === 0) {
      contributor.trophyGold += 1;
    }
    if (row === 1) {
      contributor.trophySilver += 1;
    }
    if (row === 2) {
      contributor.trophyBronze += 1;
    }
    // Calculate user earnings per phase per user
    const userEarnings = (points / totalPoints) * totalTokens;
    phaseRows[row].tokens = userEarnings;
    // contributor.tokensEarned += userEarnings;
    contributor.tokensEarned = contributor.tokensEarned
      ? contributor.tokensEarned + userEarnings
      : userEarnings;
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
    contributor.tokensEarned = 0;
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
  const expertise: Expertise[] = expertiseStr
    .split(";")
    .filter((str) => Object.values(Expertise).includes(str as Expertise))
    .map((str) => str.toUpperCase() as Expertise);
  return {
    name: telegram,
    telegram: telegram.toLowerCase(),
    github: github.toLowerCase(),
    discord: discord.toLowerCase(),
    imageUrl,
    isActive: false,
    expertise,
    radixWallet,
    phasesActive: [],
    tokensEarned: 0,
    trophyGold: 0,
    trophySilver: 0,
    trophyBronze: 0,
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
