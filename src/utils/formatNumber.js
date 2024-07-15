export function formatNumber(num) {
  const sign = Math.sign(num);
  num = Math.abs(num);

  if (num >= 1e18) {
    return (
      (sign * (num / 1e18).toFixed(2)).toString().replace(/\.00$/, "") + "E"
    );
  }
  if (num >= 1e15) {
    return (
      (sign * (num / 1e15).toFixed(2)).toString().replace(/\.00$/, "") + "P"
    );
  }
  if (num >= 1e12) {
    return (
      (sign * (num / 1e12).toFixed(2)).toString().replace(/\.00$/, "") + "T"
    );
  }
  if (num >= 1e9) {
    return (
      (sign * (num / 1e9).toFixed(2)).toString().replace(/\.00$/, "") + "B"
    );
  }
  if (num >= 1e6) {
    return (
      (sign * (num / 1e6).toFixed(2)).toString().replace(/\.00$/, "") + "M"
    );
  }

  return (sign * num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";
}
