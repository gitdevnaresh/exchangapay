export const handleChangeText = (text: any, setChangeAmt: Function, getFromAssetValue: Function, setCryptoConvertVal: Function, setErrormsg: Function) => {
  setErrormsg("");
  if (!text || text.trim() === "") {
    setChangeAmt('');
    getFromAssetValue(0);
    setCryptoConvertVal("");
    return;
  }
  let cleanText = text.replace(/[^0-9.]/g, "").slice(0, 8);
  const decimalIndex = cleanText.indexOf('.');
  if (decimalIndex != -1) {
    const integerPart = cleanText.slice(0, decimalIndex);
    const fractionalPart = cleanText.slice(decimalIndex + 1).replace(/\./g, '');
    cleanText = integerPart + '.' + fractionalPart.slice(0, 4);
  }
  setChangeAmt(cleanText);
  getFromAssetValue((cleanText !== null && cleanText) ?? 0);
};

export const setFiatChangeText = (text: any, setCryptoConvertVal: Function, setChangeAmt: Function, setErrormsg: Function) => {
  setErrormsg("");
  let cleanText = text.replace(/[^0-9.]/g, "").slice(0, 8);
  const decimalIndex = cleanText.indexOf('.');
  if (decimalIndex != -1) {
    const integerPart = cleanText.slice(0, decimalIndex);
    const fractionalPart = cleanText.slice(decimalIndex + 1).replace(/\./g, '');
    cleanText = integerPart + '.' + fractionalPart.slice(0, 2);
  }
  setCryptoConvertVal(cleanText);
};