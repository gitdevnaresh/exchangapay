import { Platform } from "react-native";

/**
 * P-01 — shared virtualisation presets for FlatList / SectionList.
 *
 * React Native ships with initialNumToRender=10, maxToRenderPerBatch=10 and
 * windowSize=21, which keeps roughly ten screens of cells mounted at once. On
 * the paginated transaction / case / payee lists that is hundreds of live
 * views, so scrolling spends its frame budget on layout instead of drawing.
 *
 * IMPORTANT — only spread these onto a list that owns its own scroll view.
 * A list rendered inside a ScrollView, or one with scrollEnabled={false},
 * never receives scroll events, so capping the render window would leave rows
 * permanently blank. Those lists are intentionally left on the RN defaults.
 */

const isAndroid = Platform.OS === "android";

/**
 * Long, paginated, vertically scrolling lists (transactions, applications,
 * support cases, payees). windowSize 7 keeps ~3 screens above and below the
 * viewport — enough to hide the recycling from the user on a fast fling.
 *
 * removeClippedSubviews is Android-only on purpose: it is a no-op-to-harmful
 * on iOS and is what detaches off-screen cell views from the native tree.
 * Do NOT spread this onto a list whose rows draw absolutely-positioned content
 * outside the row bounds — use LIST_PERF_NO_CLIP for those.
 */
export const LIST_PERF_PAGINATED = {
  initialNumToRender: 10,
  maxToRenderPerBatch: 10,
  updateCellsBatchingPeriod: 50,
  windowSize: 7,
  removeClippedSubviews: isAndroid,
} as const;

/**
 * Same batching as LIST_PERF_PAGINATED but never detaches cell views.
 * Use when rows contain `position: 'absolute'` children that overflow the row
 * (Android clips those away when removeClippedSubviews is on) or when the list
 * is `inverted`, where clipping is a known source of blank cells.
 */
export const LIST_PERF_NO_CLIP = {
  initialNumToRender: 10,
  maxToRenderPerBatch: 10,
  updateCellsBatchingPeriod: 50,
  windowSize: 7,
  removeClippedSubviews: false,
} as const;

/**
 * Chat transcripts. Messages are short and users scroll back quickly, so the
 * window is wider than the paginated preset and clipping stays off — the
 * transcript lists are inverted / auto-scrolled to the end.
 */
export const LIST_PERF_CHAT = {
  initialNumToRender: 15,
  maxToRenderPerBatch: 10,
  updateCellsBatchingPeriod: 50,
  windowSize: 11,
  removeClippedSubviews: false,
} as const;

/**
 * Search-filtered pickers (country, currency, payee). The first batch has to
 * fill the screen immediately after a keystroke, so it renders a little more
 * up front than the paginated preset.
 */
export const LIST_PERF_PICKER = {
  initialNumToRender: 12,
  maxToRenderPerBatch: 12,
  updateCellsBatchingPeriod: 50,
  windowSize: 9,
  removeClippedSubviews: isAndroid,
} as const;

/**
 * getItemLayout for a horizontal list of fixed-width pages (carousels).
 * Besides removing measurement from the scroll path, this is what makes
 * scrollToIndex reliable for indices outside the current render window.
 */
export const horizontalItemLayout =
  (itemWidth: number) =>
  (_: any, index: number) => ({
    length: itemWidth,
    offset: itemWidth * index,
    index,
  });

/**
 * getItemLayout for a vertical list of fixed-height rows.
 * Only use this when every row really is the same height — including when the
 * OS font scale is turned up. A wrong offset here shows as overlapping rows or
 * a scrollbar that does not match the content.
 */
export const verticalItemLayout =
  (rowHeight: number) =>
  (_: any, index: number) => ({
    length: rowHeight,
    offset: rowHeight * index,
    index,
  });
