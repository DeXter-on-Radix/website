/**
 * This Service loads data from a google sheet as single string in CSV format
 */
const fetchSheet = async (sheetId: string, gic: string) => {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gic}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.text(); // Getting the CSV data as text
};

export const GoogleSheet = {
  fetch: fetchSheet,
};
