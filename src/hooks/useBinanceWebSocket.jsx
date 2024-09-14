"use client";
import { useEffect, useState } from "react";

export const useBinanceWebSocket = (symbols) => {
  const [realTimePrices, setRealTimePrices] = useState({});
  const [previousPrices, setPreviousPrices] = useState({});

  useEffect(() => {
    if (symbols.length === 0) return;

    const streamName = symbols
      .map((symbol) => `${symbol.toLowerCase()}@miniTicker`)
      .join("/");
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/stream?streams=${streamName}`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { s: symbol, c: price } = data.data;

      setRealTimePrices((prevPrices) => {
        const prevPrice = prevPrices[symbol.toUpperCase()] || price;
        setPreviousPrices((prev) => ({
          ...prev,
          [symbol.toUpperCase()]: prevPrice,
        }));

        return {
          ...prevPrices,
          [symbol.toUpperCase()]: price,
        };
      });
    };

    return () => {
      ws.close();
    };
  }, [symbols]);

  return { realTimePrices, previousPrices };
};
