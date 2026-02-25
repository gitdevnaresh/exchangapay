import moment from "moment";
const fillNumberLength = (input: string, inputLength: number) => {
  const cardNumber = input.replace(/\D/g, "");

  // Trim the remaining input to ten characters, to preserve phone number format
  const cardNum = cardNumber.substring(0, inputLength);
  let output = "";
  if (cardNum.length < inputLength) {
    const numOfSpace = inputLength - cardNum.length;
    output = cardNum + "*".repeat(numOfSpace);
  } else {
    output = cardNum;
  }
  return output;
};

export default fillNumberLength;


								
export function formatNumberWithCommasToFixed(number) {
  if (number == null) return null;
  if (typeof number !== 'number' || isNaN(number)) {
    return null;
  }
  const parts = number.toFixed(2).split(".");
  const integerPart = parts[0];
  const decimalPart = parts[1] ? "." + parts[1] : "";
  let formattedIntegerPart;
  if (integerPart.length <= 3) {
    formattedIntegerPart = integerPart;
  } else {
    const lastThreeDigits = integerPart.slice(-3);
    const remainingDigits = integerPart.slice(0, -3);
    formattedIntegerPart = remainingDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThreeDigits;
  }

  return formattedIntegerPart + decimalPart;
}

export const commonDayMonthYear = (time:any) => {
  const commonDateTime = moment.utc(time).tz('Asia/Kolkata').format('DD-MM-YYYY');
  return commonDateTime;
};
