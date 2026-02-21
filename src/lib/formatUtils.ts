export const formatNumber = (num?: number | null | string): string => {
  if (num === undefined || num === null) return "0";
  const parsedNum = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(parsedNum)) return "0";
  return new Intl.NumberFormat("en-US").format(parsedNum);
};
