export const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  JPY: "¥",
};

export const getCurrencySymbol = (code?: string) => {
    if (!code) return "";
    return currencySymbols[code.toUpperCase()] || code; // fallback to code itself
};

export const dummyTransactions = [
  {
    id: "1",
    type: "Sephora",
    amount: "+1.00",
    currency: "USDT",
    date: "2025-04-11T16:20:00Z",
    status: "Pending",
  },
  {
    id: "2",
    type: "Amazon",
    amount: "+1.00",
    currency: "USDT",
    date: "2025-04-06T11:35:00Z",
    status: "Pending",
  },
  {
    id: "3",
    type: "NTUC Fairprice",
    amount: "+1.00",
    currency: "USDT",
    date: "2025-03-24T14:03:00Z",
    status: "Pending",
  },
];  



