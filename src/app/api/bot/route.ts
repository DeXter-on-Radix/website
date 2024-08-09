// needed to prevent caching - Route Handlers are cached by default when using the GET method with the Response object.
export const revalidate = 0;

const {
  fetchAllTradesForPair,
} = require("../../../../scripts/fetchAllTradesForPair");

const LIMIT_AMOUNT = 10000; // 10000 DEXTR

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_BOT_CHAT_ID = process.env.TELEGRAM_BOT_CHAT_ID || "";
const TELEGRAM_GROUP_CHAT_ID = process.env.TELEGRAM_GROUP_CHAT_ID || "";

const TELEGRAM_BASE_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const TELEGRAM_SEND_MSG_TO_BOT_URL = `${TELEGRAM_BASE_URL}/sendMessage`;
const TELEGRAM_FORWARD_MSG_TO_GROUP_URL = `${TELEGRAM_BASE_URL}/forwardMessage`;

type TTrade = {
  id: number;
  token1Receiver: number;
  token2Receiver: number;
  token1Amount: string;
  token2Amount: string;
  side: string;
  timestamp: string;
};

export async function GET() {
  try {
    // eslint-disable-next-line no-console
    console.log(`Fetching trades...`);
    const trades: TTrade[] = await fetchAllTradesForPair(); // default to DEXTR/XRD
    // eslint-disable-next-line no-console
    console.log(`Fetching trades...DONE`);

    // filter trades > Limit AMount
    const filteredTrades = trades?.filter(
      (t) => parseFloat(t.token1Amount) > LIMIT_AMOUNT
    );

    // eslint-disable-next-line no-console
    console.log(
      `Number of filtered trades above limit amount ${LIMIT_AMOUNT} XRD: `,
      filteredTrades.length
    );

    if (filteredTrades.length > 0) {
      // eslint-disable-next-line no-console
      console.log(`Sending ${filteredTrades.length} message(s) to bot...`);

      // send messages to bot
      filteredTrades.forEach(async (t) => {
        const message = `🔥 <b>Whale Alert</b> 🔥\n<b>${
          t.side
        }</b>\n<b>Amount: ${Number(t.token1Amount).toFixed(4)} XRD</b>
        `;

        let response = await fetch(TELEGRAM_SEND_MSG_TO_BOT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // eslint-disable-next-line camelcase
            parse_mode: "HTML",
            // eslint-disable-next-line camelcase
            chat_id: TELEGRAM_BOT_CHAT_ID,
            text: message,
          }),
        });

        let data = await response.json();
        if (!data.ok) {
          // eslint-disable-next-line no-console
          console.log(`Error ${data?.error_code} - ${data?.description}`);
        }

        // eslint-disable-next-line no-console
        const messageId = data?.result?.message_id;

        // eslint-disable-next-line no-console
        console.log(`Forwarding message ${messageId} to group...`);

        // forward message to group
        response = await fetch(TELEGRAM_FORWARD_MSG_TO_GROUP_URL, {
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
        });
        // eslint-disable-next-line no-console
        console.log(`Forwarding message ${messageId} to group...DONE`);
      });
    }

    return Response.json({ status: 200 });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("error", error);
    return Response.json({ status: 500 });
  }
}
