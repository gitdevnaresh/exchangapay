import { SecureStorage } from '../secureStorage';
import dayjs from "dayjs";
import axios from "axios";
import { Alert, Platform } from "react-native";
import { RequestStatus } from "../../constants";
import CryptoJS from 'crypto-js';
import moment from "moment";
import * as Sentry from '@sentry/react-native';
import crashlytics from '@react-native-firebase/crashlytics';
import { CommonActions } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import ParagraphComponent from "../../components/textComponets/paragraphText/paragraph";
import { setSessionExpired } from "../../redux/actions/actions";
import { store } from "../../redux/reducers";
import { Logger } from '../Logger';

// Global navigation reference
let globalNavigationRef: any = null;
let isNavigatingTo401: boolean = false;
let isNavigatingTo403: boolean = false;

export const setGlobalNavigationRef = (ref: any) => {
  globalNavigationRef = ref;
};

const getGlobalNavigationRef = () => globalNavigationRef;

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
export function formatDateTimeForAPI(dateInput: string | number | Date): string {
  const date = new Date(dateInput);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  // Always set time to 00:00:00
  return `${year}-${month}-${day}T00:00:00`;
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
  const token = await SecureStorage.getSecureItem("Token");
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
export const hideStartsDigitBeforLast = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }



  const visibleStart = input.slice(0, 4)   // const hiddenStart = input.slice(0, 4).replace(/./g, 'x');
  const hiddenMiddle = input.slice(4, 12).replace(/./g, '*');
  const visibleEnd = input.slice(-4);

  const formatWithSpaces = (str: string): string => str.match(/.{1,4}/g)?.join(' ') || str;

  const formattedHiddenMiddle = formatWithSpaces(hiddenMiddle);

  return `${visibleStart} ${formattedHiddenMiddle} ${visibleEnd}`;
};

export const formatTimer = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}s`;
};
export const REGEXS = {
  HTML_REGEX: /<[^>]*>?/g,
  EMOJI_REGEX: /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FAB0}-\u{1FAB6}\u{1FAC0}-\u{1FAC2}\u{1FAD0}\u{200D}\u{2640}\u{200D}\u{2642}]/gu,
  ALPHA_NUMERIC_WITH_HYPHEN: /^[a-zA-Z0-9_\-\@]+$/,
  MIN_MAX_LENTH: /^[A-Za-z0-9-]{4,30}$/,
  SPACE_NUMBERS_REGEX: /^(?=.*\S).+$/,
}
const handleNavigate = () => {
  isNavigatingTo403 = true;
  const navigation = getGlobalNavigationRef();
  if (navigation) {
    navigation.navigate("AccessDenied", { AccessDenied: true });
  }
  setTimeout(() => {
    isNavigatingTo403 = false;
  }, 1000);
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
  417: "The server could not meet the requirements of the request.",
  426: "A protocol upgrade is required to proceed with the request.",
  429: "Too many requests. Please wait a moment and try again.",
  DEFAULT: "Something went wrong, Please try again after sometime!"
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
  const { status, data } = errorToDerive;
  if (status === 400 || data?.status === 400) {
    return `${ERROR_MESSAGES[400]} ${getErrorsMessage(data.errors)}`
  }
  if (status === 409 || data?.status === 409 || status === 422 || data?.status === 422) {
    let message = data?.title ?? "";
    const text = message?.toLowerCase()?.replace(/[^\w\s]/g, "")?.replace(/\s+/g, "");
    if (text?.includes("thisemailorusernameisalreadyinuse")) {
      return "Email address or username already exists";
    }
    return message;
  }
  if (status >= 500 || data?.status >= 500) {
    return `Error ${data?.traceId}: Unable to process your request at the moment. Please try again after some time!`
  }
  if (status === 429 || data?.status === 429) {
    return data?.message || data?.title || ERROR_MESSAGES[429];
  }
  if (data?.status === 403 || data?.data?.status === 403) {
    return handleNavigate();
  }
  if (errorToDerive?.status == 401) {
    if (isNavigatingTo401) {
      return ERROR_MESSAGES[401];
    }
    isNavigatingTo401 = true;
    const navigation = getGlobalNavigationRef();
    if (navigation) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "RelogIn" }],
        })
      );
    }
    store.dispatch(setSessionExpired(true));
    // Reset flag after navigation
    setTimeout(() => {
      isNavigatingTo401 = false;
    }, 1000);
    return;
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
  moment.utc(date).tz("Asia/Kolkata").format("DD MMM YYYY hh:mm A");

export const formatDateTimesWithOutUtc = (date: any) =>
  moment(date).format("DD MMM YYYY hh:mmA");


export const formatDate = (date: any) => dayjs(date).format("MM-DD-YYYY");

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
    Logger.info(error);
    return '';
  }
};

export const formatDateTimeHour = (date: any) =>
  moment.utc(date).tz("Asia/Kolkata").format("DD/MM/YYYY hh:mm:ss A");

export const formatDateTimeHourWithout = (date: any) =>
  moment.utc(date).tz("Asia/Kolkata").format("DD-MM-YY hh:mm:ss A");
export const formatDateTime = (date: any) =>
  moment.utc(date).tz("Asia/Kolkata").format("DD MMM hh:mmA");



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
        Logger.info(`Downloaded: ${progress * 100}%`);
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
export const formatYearMonthDate = (date: any) => dayjs(date).format("YYYY-MM-DD");
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
  date: "dd/MM/yyyy",
  dateTime: "dd/MM/yyyy hh:mm A",
  dateTimeWithSeconds: "dd/MM/yyyy hh:mm:ss A",
  time: "hh:mm A",
  day: "dddd",
  dateMonth: "dd-MMM",
  dateMonthTime: "dd-MMM hh:mm A",
  api: 'YYYY-MM-DD',
  apiWithTime: 'YYYY-MM-DDTHH:mm:ss',
  dateTime24: "dd/MM/yyyy HH:mm",
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

// export function formatDates(dateString, format) {

//   if(dateString && format){
//   const date = new Date(dateString);
//   const day = date.getDate().toString().padStart(2, '0');
//   const month = date.getMonth();
//   const year = date.getFullYear();
//   const shortYear = year.toString().slice(-2);
//   const hours24 = date.getHours();
//   const minutes = date.getMinutes().toString().padStart(2, '0');
//   const seconds = date.getSeconds().toString().padStart(2, '0');
//   const dayName = date.getDay()

//   const hours12 = hours24 % 12 || 12;
//   const amPm = hours24 >= 12 ? 'PM' : 'AM';

//   const monthNames = [
//     'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
//     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
//   ];
//   const dayNames = [
//     'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
//   ];
//   let formattedDate = format
//     .replace('A', amPm)
//     .replace('dddd',dayNames[dayName])
//     .replace('dd', day)
//     .replace('yyyy', year)
//     .replace('yy', shortYear)
//     .replace('MMM', monthNames[month])
//     .replace('MM', month+1)
//     .replace('hh', hours12.toString().padStart(2, '0'))
//     .replace('HH', hours24.toString().padStart(2, '0'))
//     .replace('mm', minutes)
//     .replace('ss', seconds)


//   return formattedDate;
// }else{
//   return '--'
// }
// }
export function formatDates(dateString, format) {

  // 1. Initial check for missing data
  if (!dateString || !format) {
    return '--'
  }

  let date;

  // 2. THE FIX: Intelligently decide how to parse the date
  //    Check if the string matches the problematic "M/D/YYYY..." format.
  if (typeof dateString === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}/.test(dateString)) {
    // If it's the American format, tell moment exactly how to read it.
    date = moment(dateString, "M/D/YYYY hh:mm:ss A").toDate();
  } else {
    // For all other formats (ISO strings, Date objects, etc.), use moment's standard parser.
    date = moment(dateString).toDate();
  }

  // 3. Final safety check
  if (isNaN(date.getTime())) {
    return '--';
  }

  // 4. The rest of your formatting logic remains the same and will now work.
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.getMonth();
  const year = date.getFullYear();
  const shortYear = year.toString().slice(-2);
  const hours24 = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const dayName = date.getDay();

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
    .replace('MM', (month + 1).toString())
    .replace('hh', hours12.toString().padStart(2, '0'))
    .replace('HH', hours24.toString().padStart(2, '0'))
    .replace('mm', minutes)
    .replace('ss', seconds);

  return formattedDate;
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

    const { sanitizeData } = require('../../utils/Logger');
    scope.setExtra("Request Body", sanitizeData(requestBody));
    scope.setExtra("Response Data", sanitizeData(responseData));

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
