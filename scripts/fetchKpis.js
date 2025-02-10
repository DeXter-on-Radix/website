/* eslint-disable no-console */
const adex = require("alphadex-sdk-js");

// Welcome developer
console.log("Hi 👋\nStarting script to fetch KPIs...");

// call the init function to connect to the AlphaDEX exchange
// and initialize the clientState object
adex.init();

// assign the clientState object to a local variable
let myAdexState = adex.clientState;

console.log(myAdexState);

// IMPLEMENTATION PLAN

// Script Pseudocode
// Step 0a: Verify if the user provided an input parameter for the script.
//   Supported parameter: `weeksBack`, which indicates how many weeks to look back.
//   weeksBack=1 means last week only, weeksBack=10 means the last 10 weeks
//   (excluding the current week). If no parameter was provided, set to 1.
// Step 0b: initialize resultDict: Key=DateString, value=VolumeData for that week
// Step 1 : Initialize connection to alphadex
// Step 2a: Fetch all available pairs for DeXter (PlatformId=4)
// Step 2b: Create and populate a pairAddress -> pairName dictionary
// Step 3 : Get lastWeeks array
// Step 4 : For each week, do this:
// Step 5 :   For each pair, do this:
// Step 6 :     a) set currentSelectedPair to the pair
//              b) set canclePeriod to 1W
//              c) get the pairName based on the pairAddress
//              d) get Volume of that week from candle stick data
//                 and set resultDict[weekStr][pairName]: volume

// Helper functions needed
// getLastWeeks(n: number): Date[]
// -> returns array of dates, each date represents the start of a week (Monday).
// -> the current week is not included
// -> if run without parameters, it returns a sigle date, which is last weeks monday
// -> we return last week, because the ongoing week is not finished yet

// dateToUnixTimestamp(date: Date): number
// -> Number(date) -> returns unix timestamp of a date

// dateToDateStr(date: Date, returnFormat: "DD-MM-YYYY" | "YYYY-MM-DD): string
// -> returns the date in the specified return format:
//    - DD-MM-YYYY (needed for coingecko historic API)
//    - YYYY-MM-DD (needed for google sheet KPI tracking)

// Coingecko.getHistoricPrice(date: string, coinId: string): number
// -> given date (day in the format "31-12-2023") and the coinSlug (e.g. "radix")
//    returns the historic USD price on that day.
