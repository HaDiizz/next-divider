export const fetchSymbols = async (assetType) => {
  if (assetType === "crypto") {
    const response = await fetch("https://api.binance.com/api/v3/exchangeInfo");
    const data = await response.json();

    return data.symbols
      .filter((symbol) => symbol.status === "TRADING")
      .map((symbol) => symbol.symbol);
  }
  return [];
};
