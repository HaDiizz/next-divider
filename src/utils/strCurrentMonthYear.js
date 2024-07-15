export default function strCurrentMonthYear() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const currentMonthYear = `${year}-${month}`;
  return currentMonthYear;
}
