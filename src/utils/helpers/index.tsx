import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import axios from "axios";
import { Alert, Platform } from "react-native";
import { RequestStatus } from "../../constants";
import CryptoJS from 'crypto-js';
import moment from "moment";
import Keychain from "react-native-keychain";
import * as Sentry from '@sentry/react-native';
import crashlytics from '@react-native-firebase/crashlytics';

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
  amount = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(amount) || isNaN(decimalPlaces) || decimalPlaces < 0) {
    return amount;
  }
  const options = {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  };
  return new Intl.NumberFormat(undefined, options).format(amount);
}
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
  const date = new Date(transactionData);
  const options: any = {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  };
  let formattedDate = "--";
  if (transactionData) {
    formattedDate = date?.toLocaleString("en-US", options);
  }
  return formattedDate;
};

export const getTokenData = async () => {
  const token = await AsyncStorage.getItem("Token");
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  return token;
};
export const hideDigits = (input: string): string => {
  if (!input) {
    return '';
  }
  if (typeof input !== 'string') {
    return '';
  }
  const hiddenPart = input.slice(0, -4).replace(/./g, '*');
  const visiblePart = input.slice(-4);
  return hiddenPart + visiblePart;
};
export const hideDigitBeforLast = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }



  const visibleStart = input.slice(0, 4)   // const hiddenStart = input.slice(0, 4).replace(/./g, 'x');
  const hiddenMiddle = input.slice(4, 12).replace(/./g, 'x');
  const visibleEnd = input.slice(-4);

  const formatWithSpaces = (str: string): string => str.match(/.{1,4}/g)?.join(' ') || str;

  const formattedHiddenMiddle = formatWithSpaces(hiddenMiddle);

  return `${visibleStart} ${formattedHiddenMiddle} ${visibleEnd}`;
};
export const REGEXS = {
  HTML_REGEX: /<[^>]*>?/g,
  EMOJI_REGEX: /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FAB0}-\u{1FAB6}\u{1FAC0}-\u{1FAC2}\u{1FAD0}\u{200D}\u{2640}\u{200D}\u{2642}]/gu,
  ALPHA_NUMERIC_WITH_HYPHEN: /^[a-zA-Z0-9_\-\@]+$/,
  MIN_MAX_LENTH: /^[A-Za-z0-9-]{4,30}$/,
  SPACE_NUMBERS_REGEX: /^(?=.*\S).+$/,
}
const ERROR_MESSAGES: any = {
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
  417: "The server was unable to complete your request. Please try again later.",
  426: "A protocol upgrade is required to proceed with the request.",
  429: "Too many requests. Please try again later.",
  503: "The server was unable to complete your request. Please try again later.",
  DEFAULT: "Something went wrong, Please try again after sometime!",
  SERVER_UNAVAILABLE: "The server was unable to complete your request. Please try again later."
}


const getErrorsMessage = (errors: any) => {
  if (errors && typeof errors === 'object') {
    return Object.entries(errors)?.map(([field, fieldErrors]: any) => typeof fieldErrors[0] === "string" ? fieldErrors[0] : `${field} is invalid`)?.join(",")
  }
  return ""
}

export const isErrorDispaly = (errorToDerive: any) => {
  if (typeof errorToDerive === 'string') {
    return errorToDerive
  }
  if (typeof errorToDerive !== 'object') {
    return ERROR_MESSAGES.DEFAULT
  }
  
  // Check for server unavailable scenarios only
  if (errorToDerive?.message?.toLowerCase().includes('server unavailable') || 
      errorToDerive?.response?.status === 503){
    return ERROR_MESSAGES.SERVER_UNAVAILABLE
  }
  
  const { status, data } = errorToDerive;
  if (status === 400 || data?.status === 400) {
    return `${ERROR_MESSAGES[400]} ${getErrorsMessage(data.errors)}`
  }
  if (status === 409 || data?.status === 409 || status === 422 || data?.status === 422) {
    return data.title
  }
    if (status === 429 || data?.status === 429) {
    return data.title|| ERROR_MESSAGES[status || data?.status]
  }
  if (status >= 500 || data?.status >= 500) {
    return `Error ${data?.traceId}: Unable to process your request at the moment. Please try again after some time!`
  }
  return ERROR_MESSAGES[status || data?.status] || ERROR_MESSAGES.DEFAULT
}

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



export const formatDateTimes = (date: any) =>
  moment.utc(date).tz("Asia/Kolkata").format("DD MMM YYYY hh:mmA");

export const formatDateTimesWithOutUtc = (date: any) =>
  moment(date).format("DD MMM YYYY hh:mmA");


export const formatDate = (date: any) => dayjs(date).format("MM-DD-YYYY");
export const formatDateMonth = (date: any) => dayjs(date).format("YYYY-MM-DD");

export const formatPercent = (value: any) => `${value.toFixed(2)}%`;
export const formatDayMonth = (date: any) => dayjs(date).format("MM-DD");
export const formatAmount = (value: any) => `${value.toFixed(2)}`;
// export const formateMonthDay = (value: any) => {
//   return moment.utc(value).tz("Asia/Kolkata").format("DD MMM");
// };
export const localDates = (date: any) => {
  {
    moment
      .utc(date)
      .tz("Asia/Kolkata")
      .format("DD MMM hh:mmA")
  }
};

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
  status === RequestStatus.pending || status === RequestStatus.idle;

export const isLoading = (status: any) => status === RequestStatus.pending;

export const onAndroid = () => Platform.OS === "android";


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
    msg = typeof msg === 'string' ? msg : JSON.stringify(msg);
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
    console.log(error);
    return '';
  }
};

export const formatDateTimeHour = (date: any) =>
  moment.utc(date).tz("Asia/Kolkata").format("DD/MM/YYYY hh:mm:ss A");

export const formatDateTimeHourWithout = (date: any) =>
  moment.utc(date).tz("Asia/Kolkata").format("DD-MM-YY hh:mm:ss A");
export const formatDateTime = (date: any) =>
  moment.utc(date).tz("Asia/Kolkata").format("DD MMM hh:mmA");


import * as FileSystem from 'expo-file-system';
import ParagraphComponent from "../../newComponents/textComponets/paragraphText/paragraph";
import { loginAction } from "../../redux/actions/actions";
import { store } from "../../redux/reducers";
import AuthService from "../../services/auth";

export const downloadFile = async (url) => {
  const filename = url.split('/').pop();
  const fileUri = FileSystem.documentDirectory + filename;

  try {
    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      fileUri,
      {},
      (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        console.log(`Downloaded: ${progress * 100}%`);
      }
    );

    const { uri } = await downloadResumable.downloadAsync();
    Alert.alert("Download complete", "File has been downloaded successfully.");
    return uri;
  } catch (error) {
    Alert.alert('Error', error.message);
    return null;
  }
};


export const commonDateTime = (date: any) => moment.utc(date).tz("Asia/Kolkata").format('DD-MM-YYYY hh:mm A');
export const formatDateMonthYear = (date: any) => dayjs(date).format("DD-MM-YYYY");
export const formatDateTimeAPI = (date: any) => dayjs(new Date(date)).format("YYYY-MM-DDT00:00:00");

export const fileExtensionDetails = (uri: string): string | null => {
  const match = uri.match(/\.(\w+)$/);
  return match ? match[1] : null;
};

export const formatDateTimeDatePicker = (
  date: string | undefined | null,
  inputFormat: string = "MM/DD/YYYY hh:mm:ss A",
  outputFormat: string = "YYYY-MM-DDTHH:mm:ss"
): string => {
  if (!date) {
    throw new Error("Date is required");
  }
  return moment(date, inputFormat).format(outputFormat);
};

export function isUSDateFormat(dateStr) {
  const usDateFormatRegex = /^\d{1,2}\/\d{1,2}\/\d{4}/;
  return usDateFormatRegex.test(dateStr);
}


export const dateFormates = {
  date: "dd MMM yyyy",
  dateTime: "dd MMM yyyy at hh:mm A",
  dateTimeWithSeconds: "dd MMM yyyy HH:mm:ss",
  time: "hh:mm A",
  day: "dddd",
  dateMonth: "dd-MMM",
  dateMonthTime: "dd-MMM hh:mm A",
  api: 'YYYY-MM-DD',
  apiWithTime: 'YYYY-MM-DDTHH:mm:ss'
}

export function toLocalStringWithoutZone(recivedDate) {
  const now = new Date(recivedDate);
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
  const date = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  const timezoneOffsetMinutes = now.getTimezoneOffset();

  const offsetHours = Math.floor(Math.abs(timezoneOffsetMinutes) / 60);
  const offsetMinutes = Math.abs(timezoneOffsetMinutes) % 60;

  const offsetSign = timezoneOffsetMinutes <= 0 ? '+' : '-';

  const formattedOffset = `${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;

  const localTimeString = `${year}-${month}-${date}T${hours}:${minutes}:${seconds}`;

  return localTimeString;
}

export function formatDates(dateString, format) {

  if (dateString && format) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.getMonth();
    const year = date.getFullYear();
    const shortYear = year.toString().slice(-2);
    const hours24 = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const dayName = date.getDay()

    const hours12 = hours24 % 12 || 12;
    const amPm = hours24 >= 12 ? 'PM' : 'AM';

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const dayNames = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];
    let formattedDate = format
      .replace('A', amPm)
      .replace('dddd', dayNames[dayName])
      .replace('dd', day)
      .replace('yyyy', year)
      .replace('yy', shortYear)
      .replace('MMM', monthNames[month])
      .replace('MM', month + 1)
      .replace('hh', hours12.toString().padStart(2, '0'))
      .replace('HH', hours24.toString().padStart(2, '0'))
      .replace('mm', minutes)
      .replace('ss', seconds)


    return formattedDate;
  } else {
    return '--'
  }
}

export function formatUTCtoLocalDate(dateString, format) {
  if (dateString && format) {
    // Create a Date object from the input date string
    if ((typeof dateString == 'string') && !dateString.endsWith('Z') && !dateString.includes('+')) {
      dateString = dateString + 'Z'
    }

    const date = new Date(dateString);
    // Extract date and time components
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.getMonth(); // January is 0!
    const year = date.getFullYear();
    const shortYear = year.toString().slice(-2); // Last two digits of the year
    const hours24 = date.getHours(); // 24-hour format
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const dayName = date.getDay()

    // Convert to 12-hour format and determine AM/PM
    const hours12 = hours24 % 12 || 12; // 12-hour format, 12 is special case
    const amPm = hours24 >= 12 ? 'PM' : 'AM';

    // Month names for formatting
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const dayNames = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];
    let formattedDate = format
      .replace('A', amPm)
      .replace('dddd', dayNames[dayName])
      .replace('dd', day)
      .replace('yyyy', year)
      .replace('yy', shortYear)
      .replace('MMM', monthNames[month])
      .replace('MM', month + 1)
      .replace('hh', hours12.toString().padStart(2, '0'))
      .replace('HH', hours24.toString().padStart(2, '0'))
      .replace('mm', minutes)
      .replace('ss', seconds)


    return formattedDate;
  } else {
    return '--'
  }
}


export function formatTime(hours, minutes) {
  // Ensure hours and minutes are two digits
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = '00'; // Default seconds to '00'

  // Combine into the desired format
  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}
export function dateFilter(date) {
  return moment(date).format("YYYY-MM-DD");
}

interface FormattedNumberProps {
  value: number;
  style?: TextStyle;
  decimalPlaces?: number;
}

export const FormattedNumberComponent: React.FC<FormattedNumberProps> = ({
  value,
  style,
  decimalPlaces = 2,
}) => {
  let unit = '';
  let divisor = 1;
  if (value >= 1_000_000_000_000) {
    unit = ' T';
    divisor = 1_000_000_000_000;
  } else if (value >= 1_000_000_000) {
    unit = ' B';
    divisor = 1_000_000_000;
  } else {
    unit = ' M';
    divisor = 1_000_000;
  }
  const formattedValue = (value / divisor).toFixed(decimalPlaces);

  return (
    <ParagraphComponent style={style}>
      {`$ ${formattedValue}${unit}`}
    </ParagraphComponent>
  );
};
export const formatCardNumberForDisplay = (cardNumberString: any) => {
  if (!cardNumberString || cardNumberString.length < 4) {
    // Handle cases where number is null, undefined, or too short
    return '**** **** **** ****'; // Default masked or empty string
  }
  const lastFourDigits = cardNumberString.slice(-4);
  // This creates the '**** **** **** ' prefix, ensuring 12 masked characters + spaces
  return `**** **** **** ${lastFourDigits}`;
};
export const getFileExtension = (uri: string): string | null => {
  const match = uri.match(/\.(\w+)$/);
  return match ? match[1] : null;
};
// email with stars
export const getFormattedEmail = (email: string) => {
  if (!email || typeof email !== 'string') {
    return ''; // Return empty string or handle error appropriately
  }

  const atIndex = email.indexOf('@');
  if (atIndex === -1) {
    return email; // No '@' found, return original email
  }

  const localPart = email.substring(0, atIndex);
  const domainPart = email.substring(atIndex); // Includes the '@'

  const firstFourLetters = localPart.substring(0, 3);

  return `${firstFourLetters}*****${domainPart}`;
};

export const maskToLastFourDigits = (value: string | number): string => {
  const str = String(value);
  return str.length > 4 ? `******${str.slice(-4)}` : str;
};
export const VendorDetails = async () => {
  try {
    const vendorData = await Keychain.getGenericPassword({ service: "vendorToken" });
    if (vendorData) {
      const { vendorToken } = JSON.parse(vendorData.password);
      return vendorToken;
    }
  } catch (e) {
    console.error("Error retrieving vendor token:", e);
  }

};

export const accesToken = async () => {
  try {
    const credentials = await Keychain.getGenericPassword({ service: "authTokens" });
    if (credentials) {
      const { accessToken } = JSON.parse(credentials.password);
      return accessToken;
    }
  } catch (error) {
    console.error("Error retrieving access token:", error);
  }

};


export const userDetails = async () => {
  try {
    const credentials = await Keychain.getGenericPassword({ service: "authTokens" });
    if (credentials) {
      const { refreshToken } = JSON.parse(credentials.password);
      return refreshToken;
    }
  } catch (e) {
    console.error("Error retrieving refresh token:", e);
  }

};

// sentryLogger.ts


export interface ApiErrorLogParams {
  url: string;
  method?: string;
  statusCode?: number | string;
  requestBody?: any;
  responseData?: any;
  userId?: string | number;
  errorMessage?: string;
  environment?: "development" | "staging" | "production";
  appName?: string;
}

export const logApiErrorToSentry = ({
  url,
  method = "GET",
  statusCode,
  requestBody,
  responseData,
  userId,
  errorMessage,
  environment = "development",
  appName = "Swakipay",
}: ApiErrorLogParams) => {

  Sentry.withScope(scope => {
    if (userId) {
      scope.setUser({ id: userId.toString() });
    }

    scope.setTag("api_endpoint", url);
    scope.setTag("api_method", method);
    scope.setTag("api_status_code", String(statusCode || ""));
    scope.setTag("app_name", appName);
    scope.setTag("environment", environment);

    scope.setExtra("Request Body", requestBody);
    scope.setExtra("Response Data", responseData);

    Sentry.addBreadcrumb({
      category: "http.error",
      message: `API call to ${url} failed with status ${statusCode}`,
      level: "error",
    });

    Sentry.captureException(
      new Error(errorMessage || "API Error")
    );
  });
};
// crashlyticsLogger.ts


export interface CrashlyticsLogParams {
  endpoint: string;
  method?: string;
  status?: number | string;
  appName?: string;
  request?: any;
  response?: any;
  error: any;
}

export const logApiErrorToCrashlytics = ({
  endpoint,
  method = "GET",
  status,
  appName = "Swakipay",
  request,
  response,
  error,
}: CrashlyticsLogParams) => {

  crashlytics().setAttributes({
    endpoint,
    method,
    status: String(status || ""),
    appName,
    request: JSON.stringify(request ?? {}),
    response: JSON.stringify(response ?? {}),
  });

  crashlytics().recordError(error);
};
export const updateInfo = async () => {
  try {
    const userLoginInfo = await AuthService.getMemberInfo();
    if (userLoginInfo?.status == 200) {
      store.dispatch(loginAction(userLoginInfo.data));
    }
  } catch (error) {
    console.log("error", error)
  }
}