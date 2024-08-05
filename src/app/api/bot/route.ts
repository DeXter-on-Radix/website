// needed to prevent caching - Route Handlers are cached by default when using the GET method with the Response object.
export const revalidate = 0;

import { fetchOrdersForPair } from "../../../../scripts/fetchOrdersForPair";

const DEXTR_USD_ADDRESS =
  "component_rdx1czgjmu4ed5hp0vn97ngsf6mevq9tl0v8rrh2yq0f4dnpndggk7j9pu";

const LIMIT_AMOUNT = 20000; // trade involving more than 20,000 DEXTR

// const DEXTER_URL = process.env.NEXT_PUBLIC_DEXTER_URL || "";
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_BOT_CHAT_ID = process.env.TELEGRAM_BOT_CHAT_ID || "";
const TELEGRAM_GROUP_CHAT_ID = process.env.TELEGRAM_GROUP_CHAT_ID || "";

export async function GET() {
  const allOrders = await fetchOrdersForPair(DEXTR_USD_ADDRESS);

  const ordersAbove = allOrders.filter(
    (o) => parseFloat(o.amount) >= LIMIT_AMOUNT
  );

  if (ordersAbove.length >= 0) {
    // eslint-disable-next-line no-console
    console.log(`Sending ${ordersAbove.length} message(s) to bot...`);

    // send messages to bot
    ordersAbove.forEach(async (o) => {
      const message = `🔥 <b>Whale Alert</b> 🔥\n<b>${
        o.side
      }</b>\n<b>Amount: ${Number(o.amount).toFixed(4)} XRD</b>`;

      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // eslint-disable-next-line camelcase
            parse_mode: "HTML",
            // eslint-disable-next-line camelcase
            chat_id: TELEGRAM_BOT_CHAT_ID,
            text: message,
          }),
        }
      );
      const data = await response.json();

      // eslint-disable-next-line no-console
      const messageId = data?.result?.message_id;

      // eslint-disable-next-line no-console
      console.log(`Forwarding message ${messageId} to group...`);

      // forward message to group
      await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/forwardMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // eslint-disable-next-line camelcase
            from_chat_id: TELEGRAM_BOT_CHAT_ID,
            // eslint-disable-next-line camelcase
            chat_id: TELEGRAM_GROUP_CHAT_ID, // target chat id
            // eslint-disable-next-line camelcase
            message_id: messageId,
          }),
        }
      );
    });
  }

  return Response.json({ status: 200 });
}
