import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import weekOfYear from "dayjs/plugin/weekOfYear";
import dayOfYear from "dayjs/plugin/dayOfYear";
import relativeTime from "dayjs/plugin/relativeTime";
// P-03: these three back the call sites that used to be moment's. Import dayjs
// from this module (never straight from "dayjs") so the plugins are guaranteed
// to be registered before the first call — under Metro's inline-requires a bare
// "dayjs" import can otherwise evaluate first.
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/en";
dayjs.extend(dayOfYear);
dayjs.extend(isToday);
dayjs.extend(weekOfYear);
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);

dayjs.locale("en");

export default dayjs;
