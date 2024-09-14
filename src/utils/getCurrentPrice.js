export async function getCurrentPrice(symbol) {
  try {
    console.log(symbol);
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch the price");
    }

    const data = await response.json();
    return parseFloat(data.price);
  } catch (error) {
    console.log(error);
    console.error("Error fetching price:", error);
    throw new Error("Error fetching price");
  }
}
