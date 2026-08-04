import numeral from "numeral";
import { log } from "./logger";

export const formatDefault = (amount: string, currency = "$") => {
  let textResult = `${currency}`;
  try {
    if (isNaN(parseFloat(amount))) {
      textResult += numeral(parseFloat(amount.replace(",", ""))).format(
        "0,0.00"
      );
    } else {
      textResult += numeral(parseFloat(amount)).format("0,0.00");
    }
  } catch (e) {
    // M-16: the raw error is dev-only — a formatting failure here embeds the
    // monetary amount in its message, which has no business in a device log.
    log.debug("formatDefault failed to parse amount", { error: e });
  }
  return textResult;
};