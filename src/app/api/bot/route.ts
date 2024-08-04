import TelegramBot from "node-telegram-bot-api";
import { fetchOrdersForPair } from "../../../../scripts/fetchOrdersForPair";

const DEXTR_USD_ADDRESS =
  "component_rdx1czgjmu4ed5hp0vn97ngsf6mevq9tl0v8rrh2yq0f4dnpndggk7j9pu";

const AMOUNT_LIMIT = "20000";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

export async function GET() {
  // const allOrders = await fetchOrdersForPair(DEXTR_USD_ADDRESS);

  // const ordersAbove = allOrders.filter((o) => o.amount >= AMOUNT_LIMIT);
  // // eslint-disable-next-line no-console
  // console.log("=== ordersAbove", ordersAbove);
  // if (ordersAbove.length >= 0) {
  //   // eslint-disable-next-line no-console
  //   console.log("Sending msg to bot");
  //   ordersAbove.forEach((o) => {
  //     // eslint-disable-next-line no-console
  //     console.log("orderAbove amount:", o.amount);
  //     // eslint-disable-next-line no-console
  //     console.log("orderAbove side:", o.side);
  //   });
  // }

  bot.get;
  bot.sendMessage("@deXterAlert_bot", "Hello Bot");
  // const res = await fetch(
  //   `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${sendMessage({
  //     // eslint-disable-next-line camelcase
  //     chat_id: ,
  //     text: "",
  //   })}`,
  //   {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       "API-Key": process.env.DATA_API_KEY!,
  //     },
  //     body: JSON.stringify({ time: new Date().toISOString() }),
  //   }
  // );

  // const data = await res.json();

  // eslint-disable-next-line no-console
  // console.log("==== data", data);

  return Response.json({ status: 200 });
}
