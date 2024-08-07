const { google } = require("googleapis");
const path = require("path");

// google sheet to read / write completedAfter key/value
const GOOGLE_SPREADSHEET_ID = "1EnV1QllbuyaejXHAE4TNJ3k9ICSDP8xuHbNUXEuV0ws";
const GOOGLE_SHEET_G_ID = "0";

// Path to google credentials
const keyFile = path.join(
  process.cwd(),
  "/scripts/credentials/gsheetTrades.json"
);

const DEXTR_XRD_ADDRESS =
  "component_rdx1czgjmu4ed5hp0vn97ngsf6mevq9tl0v8rrh2yq0f4dnpndggk7j9pu";

// https://www.postman.com/alphadex/workspace/public-workspace/request/26459424-9363f1cb-0048-405b-9262-a86bbf5259d1
const ADEX_TRADES_API_URL = "https://api.alphadex.net/v0/pair/trades";

// default options to fetchAllTradesForPair
const defaultOptions = {
  pairAddress: DEXTR_XRD_ADDRESS,
  completedBefore: new Date().toISOString(),
  limit: 10000,
  startFrom: 0,
};

// fetch all trades (for 1 pair) from completedAfter to completedBefore (default to now)
export const fetchAllTradesForPair = async (options = defaultOptions) => {
  try {
    const { pairAddress, completedBefore, limit, startFrom } = options;

    // fetch previous completedAfter value from google sheet
    // eslint-disable-next-line no-console
    console.log(`Retrieve previous completedAfter value from google sheet...`);
    const gSheetData = await fetchGoogleSheetDataAsCSV(
      GOOGLE_SPREADSHEET_ID,
      GOOGLE_SHEET_G_ID
    );

    const completedAfter =
      gSheetData.split(",")[1] || new Date(0).toISOString();

    // eslint-disable-next-line no-console
    console.log(
      `Retrieve previous completedAfter value from google sheet...DONE - value: `,
      completedAfter
    );

    // fetch trades
    // eslint-disable-next-line no-console
    console.log(`Fetching trades...`);
    const response = await fetch(ADEX_TRADES_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pairAddress,
        completedBefore,
        completedAfter,
        limit,
        startFrom,
      }),
    });

    if (!response.ok) {
      throw new Error("Error while fetching trades");
    }

    // eslint-disable-next-line no-console
    console.log(`Fetching trades...DONE`);

    // update completedAfter key/value
    // eslint-disable-next-line no-console
    console.log(`Update google sheet...`);
    await updateGoogleSheet();
    // eslint-disable-next-line no-console
    console.log(`Update google sheet...DONE`);

    const data = await response.json();
    const trades = data?.trades || [];

    return trades;
  } catch (error) {
    console.error("fetchAllTradesForPair -> error", error);
    return [];
  }
};

async function fetchGoogleSheetDataAsCSV(sheetId, sheet2024gid) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${sheet2024gid}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.text(); // Getting the CSV data as text
}

// update completedAfter value to now
async function updateGoogleSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  // Define the range and value to update
  const range = "Sheet1!A1:B1";

  // Fetch current data to find the correct cell to update
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SPREADSHEET_ID,
    range,
  });

  const values = response.data.values || [];

  let updated = false;
  const newValue = new Date().toISOString();

  for (let i = 0; i < values.length; i++) {
    if (values[i][0] === "completedAfter") {
      values[i][1] = newValue;
      updated = true;
      break;
    }
  }

  if (!updated) {
    // If not found, append new key-value pair
    values.push(["completedAfter", newValue]);
  }

  // Write updated values back to the sheet
  await sheets.spreadsheets.values.update({
    spreadsheetId: GOOGLE_SPREADSHEET_ID,
    range,
    valueInputOption: "RAW",
    requestBody: {
      values,
    },
  });

  // eslint-disable-next-line no-console
  console.log("Data updated in sheet");
}
