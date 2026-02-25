import moment from "moment";

export const DATE_PICKER_CONST = {
  DATE: "date",
  TIME: "time",
  DATETIME: "datetime",
  FORMAT: "DD/MM/YYYY", // fallback format
  CALENDER: "calendar",
} as const;

export const CONSTANTS_FILEDS = {
  SELECT_DATE: "Select Date",
};

export const formatDate = (
  date: Date | null,
  mode: "date" | "time" | "datetime" = "date",
  format: string = DATE_PICKER_CONST.FORMAT
): string => {
  if (!date) return format; // fallback placeholder like "YYYY-MM-DD"

  switch (mode) {
    case DATE_PICKER_CONST.TIME:
      return moment(date).format("HH:mm");

    case DATE_PICKER_CONST.DATETIME:
      return moment(date).format("DD/MM/YYYY HH:mm");

    case DATE_PICKER_CONST.DATE:
    default:
      return moment(date).format(format); // default uses passed format (YYYY-MM-DD)
  }
};
