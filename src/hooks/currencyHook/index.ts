import { useSelector } from 'react-redux';

export const useCurrency = () => {
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);

  const currencyList: { [key: string]: string } = {
    USD: "$",
    INR: "₹",
    EUR: "€",
    GBP: "£",
    AUD: "$",
    CAD: "$",
    CHF: "€",
    CNY: "¥",
    HKD: "$",
    JPY: "¥",
    NZD: "$",
    RUB: "₽",
    SGD: "$",
    ZAR: "R",
  };

  const currencyCode = userInfo?.currency;
  const CurrencySymbol = currencyList[currencyCode] || "$";
  return { coin: currencyCode, CurrencySymbol };
};