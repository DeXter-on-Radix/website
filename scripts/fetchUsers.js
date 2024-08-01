const fetchUsers = async () => {
  try {
    // fetch all pairs
    const pairsList = await fetchAllPairs();

    // Aggregate all pairs info
    const pairsInfo = pairsList.map((pair) => ({
      pairAddress: pair.address,
      lastOrderId: pair.lastOrderId,
    }));

    // fetch all orders for all pairs
    const allOrdersByPair = await Promise.all(
      pairsInfo.map((pair) => {
        const { pairAddress, lastOrderId } = pair;
        const orderIds = Array.from({ length: lastOrderId }, (_, i) => i + 1); // [1, ..., lastOrderId]

        return fetchOrdersByPair(pairAddress, orderIds);
      })
    );

    // Process orders to count wallet addresses
    const usersFreqCounter = allOrdersByPair.reduce((acc, curr) => {
      if (!curr?.orders?.length) return acc;

      // process all orders for each pair
      const orders = curr.orders;

      for (const order of orders) {
        const radixWalletAddress = order?.settlementAccount; // account address for this order

        if (!radixWalletAddress) continue;
        else {
          acc[radixWalletAddress] = (acc[radixWalletAddress] || 0) + 1;
        }
      }
      return acc;
    }, {});

    // get total unique users count
    const totalUsersCount = Object.values(usersFreqCounter).reduce(
      (acc, curr) => {
        return acc + curr;
      },
      0
    );

    return { usersFreqCounter, totalUsersCount };
  } catch (error) {
    console.error("fetchUsers -> error", error);
    return { usersFreqCounter: {}, totalUsersCount: 0 };
  }
};

export default fetchUsers;

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
  try {
    const allOrders = [];
    const chunks = getChunkArray(orderIds, 99);

    // fetch all orders by batches of 99 orders
    for (const chunkOrderIds of chunks) {
      const response = await fetch("https://api.alphadex.net/v0/pair/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pairAddress, orderIds: chunkOrderIds }),
      });

      if (!response.ok) {
        throw new Error("Error while fetching orders by pair");
      }

      const data = await response.json();
      allOrders.push(...data.orders);
    }

    return { orders: allOrders };
  } catch (error) {
    console.error("fetchOrdersByPair -> error", error);
    return { orders: [] };
  }
};

const getChunkArray = (array, size) => {
  const chunkArray = [];
  for (let i = 0; i < array.length; i += size) {
    chunkArray.push(array.slice(i, i + size));
  }

  return chunkArray;
};
