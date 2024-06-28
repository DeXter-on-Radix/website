export interface KpiData {
  tradeVolume: {
    total: {
      XRD: number;
      USD: number;
    };
    weekly: {
      XRD: WeeklySnapshot[];
      USD: WeeklySnapshot[];
    };
  };
  socials: {
    youtubeSubscribers: number;
    twitterFollowers: number;
    instagramFollowers: number;
  };
  website: {
    uniqueVisitors: WeeklySnapshot[];
    pageRequests: WeeklySnapshot[];
  };
}

interface WeeklySnapshot {
  weekIdentifier: string;
  value: number;
}

export async function fetchKpiData(): Promise<KpiData> {
  const rawData = await fetchGoogleSheetDataAsCSV();
  return extractData(rawData);
}

async function fetchGoogleSheetDataAsCSV(): Promise<string> {
  const sheetId = "1t0QVTUzNTACNmX6GFG-wFOqHw1dqpQHcTbAufrGn6y8";
  const sheet2024gid = "821833036"; // sheet tracking 2024 numbers
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${sheet2024gid}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.text(); // Getting the CSV data as text
}

function extractNumbersFromRow(input: string): number[] {
  return removeDoubleQuotes(removeCommasFromNumbers(input))
    .slice(1)
    .split(",")
    .map((str) => Number(str))
    .filter((n) => n);
}

function removeCommasFromNumbers(input: string): string {
  // commas are escaped using doublequotes, if there are no
  // doublequotes there are no escaped commas, hence we can skip
  if (!input.includes('"')) {
    return input;
  }
  // This regex finds commas between digits and removes them
  return input.replace(/(?<=\d),(?=\d)/g, "");
}

function removeDoubleQuotes(input: string): string {
  return input.replace(/"/g, "");
}

function extractWeeklySnapshotsFromRow(
  row: string,
  weekIds: string[],
  startIndx: number = 0
): WeeklySnapshot[] {
  return extractNumbersFromRow(row).map((num, indx) => {
    return {
      weekIdentifier: weekIds[startIndx + indx],
      value: num,
    } as WeeklySnapshot;
  });
}

function extractData(rawData: string): KpiData {
  if (rawData === "") {
    throw new Error("Empty CSV data");
  }

  // split rows
  const rows = rawData.split("\n");

  // Get weekIds (e.g. "15-Jan-24")
  const weekIds = rows[0]
    .split(",")
    .slice(1)
    .map((d) => d.trim()); // trim linebreaks and whitespaces

  // Get Trade Volume KPIs
  const tradeVolWeeklyXRD = extractWeeklySnapshotsFromRow(rows[11], weekIds);
  const tradeVolWeeklyUSD = extractWeeklySnapshotsFromRow(rows[13], weekIds);

  // Get Website KPIs
  const startDate = "29-Apr-24"; // start date of tracking website and social data
  const startIndx = weekIds.findIndex((weekId) => weekId === startDate) || 0;
  const websitePageRequests = extractWeeklySnapshotsFromRow(
    rows[4],
    weekIds,
    startIndx
  );
  const websiteUniqueVisitors = extractWeeklySnapshotsFromRow(
    rows[5],
    weekIds,
    startIndx
  );

  // Get Social KPIs
  const youtubeSubscribers = extractNumbersFromRow(rows[8]).slice(-1)[0];
  const instagramFollowers = extractNumbersFromRow(rows[7]).slice(-1)[0];
  const twitterFollowers = extractNumbersFromRow(rows[6]).slice(-1)[0];

  return {
    tradeVolume: {
      total: {
        XRD: tradeVolWeeklyXRD.map((o) => o.value).reduce((a, b) => a + b),
        USD: tradeVolWeeklyUSD.map((o) => o.value).reduce((a, b) => a + b),
      },
      weekly: {
        XRD: tradeVolWeeklyXRD,
        USD: tradeVolWeeklyUSD,
      },
    },
    website: {
      uniqueVisitors: websiteUniqueVisitors,
      pageRequests: websitePageRequests,
    },
    socials: {
      youtubeSubscribers,
      twitterFollowers,
      instagramFollowers,
    },
  } as KpiData;
}
