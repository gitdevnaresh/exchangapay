import dayjs from "dayjs";
import { Platform } from "react-native";
import CryptoJS from "crypto-js";
import { jwtDecode } from "jwt-decode";
import { decode as atob } from "base-64";
import * as Keychain from "react-native-keychain";
import moment from "moment";
import Auth0 from "react-native-auth0";
import { getAllEnvData } from "../../../Environment";
import store from "../../store";
import { isSessionExpired } from "../../redux/Actions/UserActions";
declare const global: any;
if (typeof global.atob === "undefined") {
  global.atob = atob;
}

export const commaSeparating = (value: any, number: any) =>
  value
    ?.toString()
    ?.replace(new RegExp(`\\B(?=(\\d{${number}})+(?!\\d))`, "g"), ",");

export const formatMoney = ({
  amount = 0,
  unit = "usd",
  hasSpaceBetween = false,
}) => {
  let formatted = Number(amount).toLocaleString("en-US", {
    style: "currency",
    currency: unit,
  });

  if (hasSpaceBetween) {
    formatted = formatted.replace(/^(\D+)/, "$1 ");
  }

  return formatted;
};
export const formatCurrency = (amount = 0, decimalPlaces = 2) => {
  amount = typeof amount === "number" ? amount : parseFloat(amount);
  if (isNaN(amount) || isNaN(decimalPlaces) || decimalPlaces < 0) {
    return amount;
  }
  const options = {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  };
  return new Intl.NumberFormat(undefined, options).format(amount);
};
export const numberWithCommas = (x: any) => {
  if (x.toString().indexOf(".") >= 0) {
    const newX = x.toString().split(".");
    return `${newX[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${newX[1]
      }`;
  }
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const formatMoneyWithoutCode = (amount = 0) =>
  Number(amount)
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, "$&,");

export const formatCoin = (amount = 0) => {
  const result = amount.toString();

  const [beforeNumber, afterNumber] = result.split(".");

  return `${commaSeparating(beforeNumber, 3) || 0}${afterNumber !== undefined ? `.${afterNumber}` : ".00"
    }`;
};

export const formatCoinWithoutDoubleZero = (amount = 0) => {
  const result = amount.toString();

  const [beforeNumber, afterNumber] = result.split(".");

  return `${commaSeparating(beforeNumber, 3) || 0}${afterNumber !== undefined ? `.${afterNumber}` : ""
    }`;
};
export const formatDateLocal = (transactionData: any) => {
  if (typeof transactionData === "string") {
    transactionData =
      transactionData.indexOf("Z") === -1
        ? transactionData + "Z"
        : transactionData;
  }
  const date = new Date(transactionData);
  const options: any = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  let formattedDate = "--";
  if (transactionData) {
    formattedDate = date?.toLocaleString("en-US", options);
  }

  return formattedDate;
};
export const formatOnlyDateLocal = (transactionData: any) => {
  if (typeof transactionData === "string") {
    transactionData =
      transactionData.indexOf("Z") === -1
        ? transactionData + "Z"
        : transactionData;
  }
  const date = new Date(transactionData);
  const options: any = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  };
  let formattedDate = "--";
  if (transactionData) {
    formattedDate = date?.toLocaleString("en-US", options);
  }

  return formattedDate;
};
export const getTokenData = async () => {
  try {
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      const { token } = JSON.parse(credentials.password);
      return token;
    }
    return null;
  } catch (err) {
    return null;
  }
};
export const hideDigits = (input: string): string => {
  if (!input) {
    return "";
  }
  if (typeof input !== "string") {
    return "";
  }
  const hiddenPart = input.slice(0, -4).replace(/./g, "*");
  const visiblePart = input.slice(-4);
  return hiddenPart + visiblePart;
};
export const hideDigitBeforLast = (input: string): string => {
  if (!input || typeof input !== "string") {
    return "";
  }

  const visiblePart = input.slice(-4);
  const hiddenPart = input.slice(4, -4).replace(/./g, "*");
  const visibleStart = input.slice(0, 4);

  return visibleStart + hiddenPart + visiblePart;
};

// export const isErrorDispaly = (objValue: any, state?: boolean) => {

//   if (objValue.status === 522) {
//     if (objValue.data && objValue.data.title && typeof objValue.data.title === "string" && objValue.data?.title.length < 150) {
//       return objValue.data.title;
//     } else {
//       return 'An unhandled exception occurred.'
//     }
//   } else if (objValue.status === 400) {
//     if (objValue.data.errors && typeof objValue.data.errors === 'object') {
//       for (const field in objValue.data.errors) {
//         return `${typeof (objValue.data.errors[field][0]) === 'string' ? objValue.data.errors[field][0] : "Please enter valid data"}`;
//       }
//     } else if (objValue.data && objValue.data.title && typeof objValue.data.title === "string" && objValue.data?.title.length < 150) {
//       return objValue.data.title;
//     } else {
//       return 'An unhandled exception occurred.'
//     }
//   } else if (objValue.status === 500) {
//     if (objValue.data && objValue.data.title && typeof objValue.data.title === "string" && objValue.data?.title.length < 150) {
//       return objValue.data.title;
//     } else {
//       return 'Service issue,Please contact Administrator!'
//     }
//   } else if (objValue?.response?.status == 502 || objValue?.response?.status == 503) {
//     return "Server down! Please contact Administrator!";
//   } else if (objValue.status === 403) {
//     if (objValue.data && objValue.data.title && typeof objValue.data.title === "string" && objValue.data?.title.length < 150) {
//       return objValue.data.title;
//     } else {
//       return "You don't have permission, Please contact Administrator!"
//     }
//   }
//    else if (objValue.status === 524) {
//     reset("AccountProgress")
//     return;

//   }
//   else {
//     return 'Something went wrong please try again!'
//   }

// };

const ERROR_MESSAGES = {
  400: "Invalid request!",
  401: "You must be authenticated to access this resource.",
  403: "You are not authorized to access this resource.",
  404: "The requested resource was not found.",
  405: "Method not allowed.",
  406: "The requested format is not available.",
  407: "Proxy authentication is required to complete this request.",
  408: "The request took too long to process. Please try again later.",
  410: "The requested resource is no longer available.",
  411: "Content length is required but was not provided.",
  413: "The request is too large to be processed.",
  414: "The request URI is too long to be processed.",
  415: "The media type of the request is not supported.",
  417: "The server could not meet the requirements of the request.",
  426: "A protocol upgrade is required to proceed with the request.",
  DEFAULT: "Something went wrong, Please try again after sometime!",
};

const getErrorsMessage = (errors: any) => {
  if (errors && typeof errors === "object") {
    return Object.entries(errors)
      ?.map(([field, fieldErrors]: [string, any]) =>
        typeof fieldErrors[0] === "string"
          ? fieldErrors[0]
          : `${field} is invalid`
      )
      ?.join(",");
  }
  return "";
};

export const isErrorDispaly = (errorToDerive: any) => {
  if (typeof errorToDerive === "string") {
    return errorToDerive;
  }
  if (typeof errorToDerive !== "object") {
    return ERROR_MESSAGES.DEFAULT;
  }
  const { status, data } = errorToDerive;
  if (status === 400 || data?.status === 400) {
    return `${ERROR_MESSAGES[400]} ${getErrorsMessage(data.errors)}`;
  }
  if (
    status === 409 ||
    data?.status === 409 ||
    status === 422 ||
    data?.status === 422
  ) {
    return data.title;
  }
  if (status >= 500 || data?.status >= 500) {
    return `Error ${data?.traceId}: Unable to process your request at the moment. Please try again after some time!`;
  }
  if (status === 401) {
    store.dispatch(isSessionExpired(true));
    return;
  }
  return (
    ERROR_MESSAGES[status || (data?.status as keyof typeof ERROR_MESSAGES)] ||
    ERROR_MESSAGES.DEFAULT
  );
};

export const formatError = (error: any) => {
  if (error?.data) {
    if (typeof error?.data === "object") {
      return error?.message;
    }
    return error?.data;
  }

  if (error?.message === "Network Error") {
    return "Network error";
  }

  if (error?.response?.status) {
    return "Request fail";
  }

  return "Something went wrong please try again!";
};

export const createInitBirthDay = () => {
  const date = new Date();
  dayjs(date).format("YYYY/MM/DD");
};

export const formatBirthDay = (date: any) => dayjs(date).format("DD/MM/YYYY");

export const formatDateTime = (date: any) =>
  dayjs(date).format("DD MMM YYYY HH:mm A");

export const formatDate = (date: any) => dayjs(date).format("MM-DD-YYYY");
export const formatDateMonth = (date: any) => dayjs(date).format("DD-MM-YYYY");

export const formatPercent = (value: any) => `${value.toFixed(2)}%`;

export const getNameInitials = (string: any) => {
  if (!string) {
    return "";
  }
  const names = string.split(" ");
  if (names.length > 1) {
    let initials = names[0].substring(0, 1).toUpperCase();
    initials += names[names.length - 1].substring(0, 1).toUpperCase();
    return initials;
  }
  return names[0].substring(0, 2).toUpperCase();
};

export const isFetchingFirst = (status: any) =>
  status === "pending" || status === "idle";

export const isLoading = (status: any) => status === "pending";

export const onAndroid = () => Platform.OS === "android";

export const toFixedNumber = (x: any) => {
  if (!x) {
    return 0;
  }
  if (Math.abs(x) < 1.0) {
    const e = Number(x.toString().split("e-")[1]);
    if (e) {
      x *= 10 ** (e - 1);
      x = `0.${new Array(e).join("0")}${x.toString().substring(2)}`;
    }
  } else {
    let e = Number(x.toString().split("+")[1]);
    if (e > 20) {
      e -= 20;
      x /= 10 ** e;
      x += new Array(e + 1).join("0");
    }
  }
  if (x && x.toString().indexOf(".") >= 0) {
    const [before, after] = x.toString().split(".");
    if (after.length > 7) {
      const res = after.split("");
      const res1 = res.slice(0, -2).join("");
      const lastNumber = res[res.length - 1];
      const beforeLastNumber = res[res.length - 2];
      if (Number(lastNumber) >= 5) {
        x = `${before}.${res1}${Number(beforeLastNumber) + 1}`;
      }
    }
    return x;
  }
  return x;
};
export const checkValidationNumber = (newValue: any) => {
  const format = /[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/;
  const result = format.test(newValue.toString());
  if (result) {
    return "";
  }
  return newValue;
};

export const encryptValue = (msg: any, key: any) => {
  try {
    msg = typeof msg === "string" ? msg : JSON.stringify(msg);
    const salt = CryptoJS.lib.WordArray.random(128 / 8);
    const key1 = CryptoJS.PBKDF2(key, salt, {
      keySize: 256 / 32,
      iterations: 10,
    });

    const iv = CryptoJS.lib.WordArray.random(128 / 8);

    const encrypted = CryptoJS.AES.encrypt(msg, key1, {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });

    return salt.toString() + iv.toString() + encrypted.toString();
  } catch (error) {
    return "";
  }
};
export const formatDateTimeAPI = (date: any) => {
  if (date !== null) {
    return dayjs(new Date(date)).format("YYYY-MM-DDT00:00:00");
  }
};
export const trimValues = (obj: any) => {
  const trimmedObj: any = {};
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      trimmedObj[key] = obj[key].trim();
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      trimmedObj[key] = trimValues(obj[key]);
    } else {
      trimmedObj[key] = obj[key];
    }
  }
  return trimmedObj;
};

const ENV = "tst";

const mainnetAddressRegex = {
  btc: /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{39,59}|bc1p[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{58})$/,
  "erc-20": /^0x[a-fA-F0-9]{40}$/, // Ethereum Mainnet
  pol: /^0x[a-fA-F0-9]{40}$/, // Polygon Mainnet (uses EVM format)
  "trc-20": /^(T[1-9A-HJ-NP-Za-km-z]{33}|41[a-fA-F0-9]{40})$/, // Tron Mainnet
  sol: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/, // Solana Mainnet
};

const testnetAddressRegex = {
  btc: new RegExp(
    [
      // Allow Mainnet formats on testnet for flexibility
      "^1[a-km-zA-HJ-NP-Z1-9]{25,34}",
      "|3[a-km-zA-HJ-NP-Z1-9]{25,34}",
      "|bc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{39,59}",
      "|bc1p[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{58}",
      // Actual Testnet formats
      "|(m|n)[a-km-zA-HJ-NP-Z1-9]{26,35}", // Testnet P2PKH
      "|2[a-km-zA-HJ-NP-Z1-9]{26,35}", // Testnet P2SH (common prefix)
      "|tb1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{39,59}", // Testnet SegWit
      "|tb1p[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{58}", // Testnet Taproot
      "$", // End of string
    ].join("")
  ),
  "erc-20": /^0x[a-fA-F0-9]{40}$/, // EVM testnets use the same format
  pol: /^0x[a-fA-F0-9]{40}$/, // Polygon testnets use the same format
  "trc-20": /^(T[1-9A-HJ-NP-Za-km-z]{33}|41[a-fA-F0-9]{40})$/, // Tron testnets often use mainnet format
  sol: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/, // Solana testnets use mainnet format
};
const addressRegex: any =
  ENV === "tst" || ENV === "prod" ? mainnetAddressRegex : testnetAddressRegex;

// Assuming you have an addressRegex object defined somewhere, like:
// const addressRegex = {
//   'trc-20': /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
//   'pol': /^0x[a-fA-F0-9]{40}$/,
//   // ... other regexes
// };

export const validateCryptoAddress = (
  network: string | undefined | null,
  address: string | undefined | null
): boolean => {
  // 1. Basic check: If network or address is missing, it's always invalid.
  if (!network || !address) {
    return false;
  }

  const lowerNetwork = network.toLowerCase();
  let networkKey: "trc-20" | "pol" | null = null;

  // 2. Identify if the network is one we need to validate.
  if (lowerNetwork === "trc-20" || lowerNetwork === "trx") {
    networkKey = "trc-20";
  } else if (lowerNetwork === "pol" || lowerNetwork === "polygon") {
    networkKey = "pol";
  }

  // 3. If the network is NOT TRC-20 or Polygon, allow it by returning true.
  // This is the main change from the original code.
  if (!networkKey) {
    return true;
  }

  // 4. If it IS a network we need to validate, proceed with the regex check.
  const regex = addressRegex[networkKey];

  // If for some reason a regex isn't defined for a network we want to validate,
  // treat it as invalid for safety.
  if (!regex) {
    return false;
  }

  return regex.test(address.trim());
};

export const storeToken = async (token: string, refresh_token: any) => {
  try {
    const decoded: any = jwtDecode(token);
    const expiryTime = decoded.exp * 1000;
    await Keychain.setGenericPassword(
      "authToken",
      JSON.stringify({ token, expiryTime, refresh_token }),
      {
        service: "authTokenService",
      }
    );
  } catch (err) { }
};

export function formatExpityDate(dateString: any) {
  if (dateString) {
    const dateParts = dateString?.split(" ")[0].split("/");
    if (dateParts?.length !== 3) {
      return "Invalid Date";
    }
    const month = dateParts[0].padStart(2, "0");
    const day = dateParts[1].padStart(2, "0");
    const year = dateParts[2];
    const reliableDateString = `${year}-${month}-${day}`;
    const date = new Date(reliableDateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    const finalMonth = (date.getMonth() + 1).toString().padStart(2, "0");
    const finalDay = date.getDate().toString().padStart(2, "0");
    const finalYear = date.getFullYear();

    return `${finalMonth}-${finalDay}-${finalYear}`;
  } else {
    return "Invalid Date";
  }
}
export function formatDateToISOString(dateString: any) {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0"); // Months are 0-based
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  const seconds = `${date.getSeconds()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

export const formateExpiryValidationDate = (inputDate: any): string | null => {
  if (!inputDate) {
    return null;
  }
  const formattedDate = moment(inputDate, "YYYY/MM/DD").format(
    "YYYY-MM-DDTHH:mm:ss"
  );
  return formattedDate;
};

export const formatTimestamp = (date: Date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return "";
  }
  const now = new Date();
  const messageDate = new Date(date);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const messageDay = new Date(
    messageDate.getFullYear(),
    messageDate.getMonth(),
    messageDate.getDate()
  );
  const timeString = messageDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (messageDay.getTime() === today.getTime()) {
    return timeString;
  }
  if (messageDay.getTime() === yesterday.getTime()) {
    return `Yesterday ${timeString}`;
  }
  const dateString = messageDate.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return `${dateString}, ${timeString}`;
};
export const getDecodedTokenExpiry = async (): Promise<number | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: "authTokenService",
    });
    if (!credentials) {
      return null;
    }
    const { token } = JSON.parse(credentials.password);
    const decodedToken: any = jwtDecode(token);
    const expiryTime = decodedToken?.exp; // exp is a number (seconds)
    return expiryTime;
  } catch (error) {
    return null;
  }
};

export const checkAndRefreshToken = async () => {
  const { oAuthConfig } = getAllEnvData();
  const auth0 = new Auth0({
    domain: oAuthConfig.issuer,
    clientId: oAuthConfig.clientId,
  });
  try {
    const credentials = await Keychain.getGenericPassword({
      service: "authTokenService",
    });
    if (!credentials) {
      return;
    }
    const { refresh_token } = JSON.parse(credentials.password);
    // Ensure there is a refresh token to use
    if (!refresh_token) {
      // Could dispatch a logout action here if a refresh token is required but missing
      return;
    }
    const decodedToken: any = await getDecodedTokenExpiry();
    const currentTime = Math.floor(Date.now() / 1000);
    // Check if token needs refreshing (expires within the next 60 seconds)
    if (decodedToken && decodedToken - currentTime <= 60) {
      try {
        const refreshed = await auth0.auth.refreshToken({
          refreshToken: refresh_token,
        });
        // CORRECTED: Handle refresh token rotation.
        // Use the new refresh token from the response if it exists, otherwise fallback to the old one.
        const newRefreshToken = refreshed.refreshToken || refresh_token;
        await storeToken(refreshed.accessToken, newRefreshToken);
      } catch (error: any) {
        // This error often occurs if the refresh token is expired or revoked.
        // You should handle this by logging the user out.
        // store.dispatch(isSessionExpired(true));
      }
    }
  } catch (error) { }
};

//Navigation Sliding Animations
export const getAnimationForRoute = (route: any) => {
  const { animation } = route.params || {};

  switch (animation) {
    case "slide_from_left":
      return { animation: "slide_from_left" };
    case "slide_from_right":
      return { animation: "slide_from_right" };
    case "slide_from_bottom":
      return { animation: "slide_from_bottom" };
    case "fade":
      return { animation: "fade" };
    default:
      // Default animation
      return {};
  }
};