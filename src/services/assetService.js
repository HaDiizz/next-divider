export const fetchSymbols = async (assetType) => {
  if (assetType === "crypto") {
    const response = await fetch(
      "https://fapi.binance.com/fapi/v1/exchangeInfo"
    );
    const data = await response.json();

    return data.symbols
      .filter((symbol) => symbol.status === "TRADING")
      .map((symbol) => symbol.symbol);
  }
  return [];
};
