const fs = require('fs');
const path = require('path');

const fetchUsers = async () => {
  // fetch all pairs
  const pairsList = await fetchAllPairs();

  // fetch all orders for all pairs
  const allOrdersByPairs = await Promise.all(
    pairsList.map((pair) => {
      const { address, lastOrderId } = pair;
      const orderIds = Array.from({ length: lastOrderId }, (_, i) => i + 1); // [1, ..., lastOrderId]

      return fetchOrdersByPair(address, orderIds);
    })
  );
  const allOrders = allOrdersByPairs.flat();

  // Process orders to count wallet addresses
  const usersDict = {};
  for (let i = 0; i < allOrders.length; i++) {
    const radixWalletAddress = allOrders[i].settlementAccount; // account address for this order
    if (!radixWalletAddress) {
      continue;
    }
    usersDict[radixWalletAddress] = usersDict[radixWalletAddress] ? usersDict[radixWalletAddress] + 1 : 1;
  }

  return {
    usersDict: usersDict,
    totalUsers: Object.keys(usersDict).length,
    totalOrders: Object.values(usersDict).reduce((a, b) => a + b, 0),
  };
};

//** Helpers */
// fetch all pairs
const fetchAllPairs = async () => {
  try {
    const allPairsResponse = await fetch(
      "https://api.alphadex.net/v0/alphadex/pairs",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!allPairsResponse.ok) {
      throw new Error("Error while fetching pairs");
    }

    const allPairsData = await allPairsResponse.json();
    const pairsList = allPairsData?.pairs || [];

    return pairsList;
  } catch (error) {
    console.error("fetchAllPairs -> error", error);
    return [];
  }
};

// fetch orders
const fetchOrdersByPair = async (pairAddress, orderIds) => {
  const allOrders = [];
  const chunks = getChunkArray(orderIds, 99);

  // fetch all orders by batches of 99 orders
  for (const chunkOrderIds of chunks) {
    try {
      console.log("Fetching batch for " + pairAddress);
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
      console.log(err);
    }
  }

  return allOrders;
};

const getChunkArray = (array, size) => {
  const chunkArray = [];
  for (let i = 0; i < array.length; i += size) {
    chunkArray.push(array.slice(i, i + size));
  }

  return chunkArray;
};

const getTimestampedFileName = () => {
  // Get the current date and time
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  // Format the filename
  return `${year}-${month}-${day}_${hours}${minutes}${seconds}_fetchUsers-output.json`;
}

const getFilePath = () => {
  const filename = getTimestampedFileName();
  const directory = path.join(__dirname, '.scriptOutputs');
  // Ensure the directory exists
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  // Return the full path for the file
  return path.join(directory, filename);
}

const writeObjectToFile = (obj) => {
  const jsonString = JSON.stringify(obj, null, 2);
  const filePath = getFilePath();
  fs.writeFile(filePath, jsonString, (err) => {
    if (err) {
      console.error('Error writing file:', err);
    } else {
      console.log(`Successfully saved output to file: ${filePath}`);
    }
  });
}


// RUN SCRIPT
(async () => {
  const result = await fetchUsers();
  console.log(result);
  writeObjectToFile(result);
})();
