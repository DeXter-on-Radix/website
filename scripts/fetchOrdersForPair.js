const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "lastOrderId.json");

// Function to get the lastOrderId from the file sytem
const getLastOrderId = () => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      const { lastOrderId } = JSON.parse(data);
      // eslint-disable-next-line no-console
      console.log("Retrieved previously saved lastOrderId: ", lastOrderId);
      return lastOrderId || 0;
    } else {
      return 0;
    }
  } catch (error) {
    console.error("Error reading lastOrderId:", error);
    return 0;
  }
};

// Function to save the lastOrderId to the file sytem
const saveLastOrderId = (lastOrderId) => {
  try {
    // eslint-disable-next-line no-console
    console.log("Saving new lastOrderId: ", lastOrderId);
    fs.writeFileSync(filePath, JSON.stringify({ lastOrderId }), "utf8");
  } catch (error) {
    console.error("Error saving lastOrderId:", error);
  }
};

// Function to fetch all pairs
const fetchAllPairs = async () => {
  try {
    const response = await fetch("https://api.alphadex.net/v0/alphadex/pairs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error while fetching pairs");
    }

    const data = await response.json();
    return data.pairs || [];
  } catch (error) {
    console.error("fetchAllPairs -> error", error);
    return [];
  }
};

// Function to fetch orders by pairAddress
const fetchOrdersByPair = async (pairAddress, orderIds) => {
  const allOrders = [];
  const chunks = getChunkArray(orderIds, 99);

  for (const chunkOrderIds of chunks) {
    try {
      // eslint-disable-next-line no-console
      console.log("fetchOrdersByPair -> fetching batch for " + pairAddress);
      const response = await fetch("https://api.alphadex.net/v0/pair/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pairAddress, orderIds: chunkOrderIds }),
      });

      const data = await response.json();
      allOrders.push(...data.orders);
    } catch (err) {
      console.error(err);
    }
  }

  return allOrders;
};

// Helper function to chunk an array
const getChunkArray = (array, size) => {
  const chunkArray = [];
  for (let i = 0; i < array.length; i += size) {
    chunkArray.push(array.slice(i, i + size));
  }
  return chunkArray;
};

// Main function to fetch pair data
export const fetchOrdersForPair = async (pairAddress) => {
  // Fetch all pairs
  const pairsList = await fetchAllPairs();
  const dextrUsdPair = pairsList.find((p) => p.address === pairAddress);
  let { lastOrderId } = dextrUsdPair;

  // Get the last stored orderId
  const lastStoredOrderId = getLastOrderId();
  // eslint-disable-next-line no-console
  console.log("fetchOrdersForPair -> lastStoredOrderId", lastStoredOrderId);

  // Create new orderIds [lastStoredOrderId + 1 .... lastOrderId]
  let orderIds = [];

  if (lastStoredOrderId < lastOrderId) {
    orderIds = Array.from(
      { length: lastOrderId - lastStoredOrderId },
      (_, i) => i + 1 + lastStoredOrderId
    );
  }

  // Fetch all orders for pairAddress
  let allOrders = [];

  if (lastStoredOrderId < lastOrderId) {
    // eslint-disable-next-line no-console
    console.log(
      `fetchOrdersForPair -> Fetching orders from ${
        lastStoredOrderId + 1
      } to ${lastOrderId}`
    );
    allOrders = await fetchOrdersByPair(pairAddress, orderIds);

    // Save the last orderId
    if (allOrders.length > 0) {
      saveLastOrderId(lastOrderId);
    }
  }

  // eslint-disable-next-line no-console
  console.log("fetchOrdersForPair -> allOrders", allOrders);

  return allOrders;
};
