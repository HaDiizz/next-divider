export const getColorChangeClass = (currentPrice, previousPrice) => {
  if (!previousPrice || !currentPrice) return "";

  const prev = Number(previousPrice);
  const curr = Number(currentPrice);

  if (curr > prev) return "text-green-500 font-semibold";
  if (curr < prev) return "text-red-500 font-semibold";

  return "";
};
