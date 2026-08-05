/**
 * What backend-supplied HTML is allowed to be — security finding H-03.
 *
 * `showPin.tsx` renders an HTML string that arrives from the card API
 * (`getPin.description`) in the same document as the user's card PIN, and it did
 * so with `originWhitelist={['*']}`, scripting on, and no navigation gate. Anyone
 * who could influence that field — a compromised card vendor, an injection into
 * an upstream admin system, a backend template flaw — could run JavaScript next
 * to the PIN and post it anywhere, or draw a convincing "re-enter your PIN" form
 * inside the user's own app.
 *
 * The markup is not ours, so it is treated as hostile. Four independent controls
 * live here, and each one closes the exfiltration path on its own:
 *
 *   1. `sanitizeCardHtml` — an allow-list rewrite. Unknown elements are dropped,
 *      every attribute except a short safe list is discarded, and text that is
 *      not part of a recognised tag is escaped so it cannot become one. The
 *      vendor's `<style>` block survives as text, scrubbed of anything that
 *      reaches the network, so the card still renders as a card.
 *   2. `buildCardHtmlDocument` — wraps the result in a document whose meta CSP is
 *      `default-src 'none'`. No script, no frame, no fetch, no form submission,
 *      even if the sanitiser is one day walked past.
 *   3. `CARD_HTML_WEBVIEW_PROPS` — scripting, storage, file access and pop-ups
 *      off. A PIN needs none of them.
 *   4. `isCardHtmlNavigationAllowed` — the WebView never navigates anywhere. Only
 *      the initial `about:blank`/`data:` document load is permitted.
 *
 * `sanitizeNotesHtml` is the same rewrite for the KYC notes on
 * `kycUnderReview.tsx`, which are also backend HTML. Those render through
 * `react-native-render-html`, which has no script engine, so controls 2–4 do not
 * apply and only the allow-list does — it keeps an injected `javascript:` link or
 * a tracking pixel out of a screen the user is told to trust.
 *
 * This is the client half. The server should also emit the PIN as a structured
 * field rather than as markup; that would remove the class rather than this
 * instance, and it is the right fix whenever the vendor contract can be changed.
 */

import { log } from "../utils/logger";
import { parseHttpsUrl } from "./webViewUrlPolicy";

/** Guards against a pathological payload before any scanning runs. */
export const MAX_HTML_LENGTH = 64 * 1024;

/**
 * Elements that may survive. Presentation and structure only — nothing that
 * loads code, nothing that navigates, nothing that collects input. `img` is here
 * because the vendor's card artwork travels in this field; it is constrained
 * below to `data:` bitmaps and well-formed https URLs, and the CSP keeps it from
 * reaching anything else.
 */
const ALLOWED_TAGS = new Set([
  "p", "span", "div", "br", "hr",
  "b", "strong", "i", "em", "u", "small", "sub", "sup",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "table", "thead", "tbody", "tfoot", "tr", "td", "th",
  "center", "font", "section", "article", "header", "footer",
  "img",
]);

/** Emitted self-closing so a malformed document cannot nest the rest inside them. */
const VOID_TAGS = new Set(["br", "hr", "img"]);

/**
 * Elements dropped together with everything they contain. Removing only the tag
 * would leave a script body as visible text at best, and re-parseable markup at
 * worst.
 */
const DROPPED_WITH_CONTENT = [
  "script", "style", "iframe", "frame", "frameset", "object", "embed",
  "applet", "template", "noscript", "svg", "math", "form", "select",
  "textarea", "button", "audio", "video", "canvas", "head", "title",
];

/**
 * Attributes kept on every allowed element. `class` is a style hook and nothing
 * else — the notes screen maps class names to React Native styles, and the card
 * document pairs them with the scrubbed vendor stylesheet.
 */
const GLOBAL_ATTRIBUTES = new Set(["style", "class"]);

/** Attributes kept on specific elements, on top of the global set. */
const TAG_ATTRIBUTES: Record<string, Set<string>> = {
  img: new Set(["src", "alt", "width", "height"]),
  td: new Set(["colspan", "rowspan"]),
  th: new Set(["colspan", "rowspan"]),
  a: new Set(["href"]),
};

/**
 * The notes screen turns `<a>` into a tappable element, so anchors survive there
 * and nowhere else. The card PIN has nothing to link to.
 */
const ANCHOR_TAGS = new Set(["a"]);

/**
 * CSS that reaches the network or the script engine. `url()` is the one that
 * matters: without it a static document has no way to signal anything outward,
 * and with it a single injected background image becomes a beacon.
 */
const UNSAFE_CSS = /url\s*\(|expression\s*\(|@import|javascript\s*:|behaviou?r\s*:|-moz-binding|<|&#/i;

/** Characters a declaration block legitimately needs — rgb(), %, #hex, quotes. */
const CSS_CHARS = /^[A-Za-z0-9\s:;,.#%()\-_/'"!]*$/;

/** `data:` images only in bitmap formats. SVG is markup, so it stays out. */
const DATA_IMAGE = /^data:image\/(?:png|jpe?g|gif|webp|bmp);base64,[A-Za-z0-9+/=\s]+$/i;

/** Digits only — a width or a colspan has no other legitimate shape. */
const NUMERIC = /^\d{1,4}$/;

/** A single vendor stylesheet, past which the document is not a card layout. */
const MAX_STYLE_BLOCK = 16 * 1024;

const STYLE_BLOCK = /<style\b(?:"[^"]*"|'[^']*'|[^'">])*>([\s\S]*?)<\/style\s*>/gi;

/**
 * The card markup arrives with a `<style>` block carrying the vendor's layout,
 * and dropping it would leave the PIN as unstyled text. So the block is kept —
 * but only its text, checked against the same rules as an inline style.
 *
 * Nothing in it can reach outside the document: `url()` and `@import` are
 * refused here, and `default-src 'none'` refuses them again at the WebView. A
 * `<` cannot appear, so the block cannot close itself early and smuggle markup
 * out of the stylesheet.
 */
const extractStyleBlocks = (html: string): string => {
  const kept: string[] = [];
  // The same input the markup pass sees: truncated the same way, with comments
  // already gone so a commented-out block cannot come back to life here.
  const source = stripComments(html.slice(0, MAX_HTML_LENGTH));

  STYLE_BLOCK.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = STYLE_BLOCK.exec(source)) !== null) {
    const css = (match[1] || "").trim();
    if (!css || css.length > MAX_STYLE_BLOCK || UNSAFE_CSS.test(css)) continue;
    kept.push(css);
  }

  return kept.join("\n");
};

/**
 * Matches one tag. The attribute run steps over quoted values so that a `>`
 * inside `alt="a > b"` does not end the tag early — the sanitiser must see the
 * same tag boundaries the WebView's parser will.
 */
const TAG = /<(\/?)([A-Za-z][A-Za-z0-9]*)((?:"[^"]*"|'[^']*'|[^'">])*)\/?>/g;

const ATTRIBUTE =
  /([A-Za-z_:][-\w:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

/** Only `<` and `>` are escaped, so `&nbsp;` and friends still render. */
const escapeText = (text: string): string =>
  text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

const escapeAttribute = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Strip comments — including an unterminated one, which would hide the tail. */
const stripComments = (html: string): string =>
  html.replace(/<!--[\s\S]*?-->/g, "").replace(/<!--[\s\S]*$/, "");

const stripDroppedElements = (html: string): string => {
  let out = html;
  for (const tag of DROPPED_WITH_CONTENT) {
    out = out.replace(
      new RegExp(`<${tag}\\b(?:"[^"]*"|'[^']*'|[^'">])*>[\\s\\S]*?<\\/${tag}\\s*>`, "gi"),
      ""
    );
    // An element that is never closed takes the rest of the document with it.
    // Losing markup is the safe direction; keeping it is not.
    out = out.replace(new RegExp(`<${tag}\\b[\\s\\S]*$`, "i"), "");
  }
  return out;
};

const sanitizeStyle = (value: string): string | null => {
  if (!value || UNSAFE_CSS.test(value) || !CSS_CHARS.test(value)) return null;
  return value.trim() || null;
};

const sanitizeImageSource = (value: string): string | null => {
  const candidate = value.trim();
  if (DATA_IMAGE.test(candidate)) return candidate;
  // Reuses the deliberately strict https parser from the 2FA origin policy, so
  // the two surfaces agree on what a URL is.
  return parseHttpsUrl(candidate) ? candidate : null;
};

/**
 * Only `https:` and `mailto:` survive. `javascript:` is the obvious one to keep
 * out; `data:`, `intent:`, `file:` and app schemes matter just as much, because
 * the notes screen hands the href to `Linking.openURL`.
 */
const MAILTO = /^mailto:[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const sanitizeHref = (value: string): string | null => {
  const candidate = value.trim();
  if (MAILTO.test(candidate)) return candidate;
  return parseHttpsUrl(candidate) ? candidate : null;
};

/** Class names are a style hook only, so anything exotic is not one of ours. */
const CLASS_NAMES = /^[A-Za-z0-9 _-]{1,128}$/;

type Counters = { tags: number; attributes: number };

const sanitizeAttributes = (
  tag: string,
  raw: string,
  counters: Counters
): string => {
  const allowed = TAG_ATTRIBUTES[tag];
  const kept: string[] = [];

  ATTRIBUTE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = ATTRIBUTE.exec(raw)) !== null) {
    const name = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? "";

    if (!GLOBAL_ATTRIBUTES.has(name) && !allowed?.has(name)) {
      counters.attributes++;
      continue;
    }

    let safe: string | null = null;
    if (name === "style") safe = sanitizeStyle(value);
    else if (name === "src") safe = sanitizeImageSource(value);
    else if (name === "href") safe = sanitizeHref(value);
    else if (name === "class") safe = CLASS_NAMES.test(value.trim()) ? value.trim() : null;
    else if (name === "alt") safe = value.slice(0, 128);
    else safe = NUMERIC.test(value.trim()) ? value.trim() : null;

    if (safe === null) {
      counters.attributes++;
      continue;
    }
    kept.push(`${name}="${escapeAttribute(safe)}"`);
  }

  // An <img> whose src did not survive would render as a broken-image icon.
  if (tag === "img" && !kept.some((a) => a.startsWith("src="))) return "";

  return kept.length ? ` ${kept.join(" ")}` : "";
};

const rewrite = (
  html: string,
  counters: Counters,
  allowAnchors: boolean
): string => {
  let out = "";
  let cursor = 0;
  // An anchor whose href did not survive is dropped, and so is its closing tag —
  // otherwise the notes screen renders a tappable element with no destination.
  let droppedAnchors = 0;

  TAG.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TAG.exec(html)) !== null) {
    out += escapeText(html.slice(cursor, match.index));
    cursor = TAG.lastIndex;

    const closing = match[1] === "/";
    const tag = match[2].toLowerCase();

    if (!ALLOWED_TAGS.has(tag) && !(allowAnchors && ANCHOR_TAGS.has(tag))) {
      counters.tags++;
      continue;
    }

    if (closing) {
      if (tag === "a" && droppedAnchors > 0) {
        droppedAnchors--;
        continue;
      }
      if (!VOID_TAGS.has(tag)) out += `</${tag}>`;
      continue;
    }

    if (VOID_TAGS.has(tag)) {
      const attributes = sanitizeAttributes(tag, match[3] || "", counters);
      // An <img> that lost its source is dropped rather than left empty.
      if (tag === "img" && !attributes) {
        counters.tags++;
        continue;
      }
      out += `<${tag}${attributes}/>`;
      continue;
    }

    const attributes = sanitizeAttributes(tag, match[3] || "", counters);

    if (tag === "a" && !attributes.includes("href=")) {
      droppedAnchors++;
      counters.tags++;
      continue;
    }

    out += `<${tag}${attributes}>`;
  }

  return out + escapeText(html.slice(cursor));
};

const sanitize = (raw: unknown, allowAnchors: boolean, surface: string): string => {
  if (typeof raw !== "string" || !raw.trim()) return "";

  const counters: Counters = { tags: 0, attributes: 0 };
  const truncated = raw.length > MAX_HTML_LENGTH;
  const source = truncated ? raw.slice(0, MAX_HTML_LENGTH) : raw;

  const stripped = stripDroppedElements(stripComments(source))
    // Doctype and processing instructions carry nothing we need.
    .replace(/<![^>]*>/g, "")
    .replace(/<\?[\s\S]*?\?>/g, "");

  const clean = rewrite(stripped, counters, allowAnchors);

  if (counters.tags || counters.attributes || truncated) {
    // Counts only. The document being sanitised contains the PIN, so no part of
    // it may reach a breadcrumb.
    log.warn("HTML sanitiser removed disallowed markup", {
      surface,
      droppedTags: counters.tags,
      droppedAttributes: counters.attributes,
      truncated,
    });
  }

  return clean;
};

/**
 * Allow-list sanitiser for the card HTML. Returns a fragment safe to place in a
 * body — never null, never the input unchanged unless the input was already
 * within the allow-list.
 */
export const sanitizeCardHtml = (raw: unknown): string =>
  sanitize(raw, false, "cardPin");

/**
 * The same rewrite for the KYC notes, which are rendered by
 * `react-native-render-html` rather than a WebView. Links survive here because
 * the screen makes them tappable; every other difference is intentional.
 */
export const sanitizeNotesHtml = (raw: unknown): string =>
  sanitize(raw, true, "kycNotes");

/**
 * The Content-Security-Policy the rendered document runs under.
 *
 * `default-src 'none'` covers script, connect, frame, object and everything else
 * not named explicitly, so the only things this document can do are draw text,
 * draw an image, and sit there. Exported so the test can assert on it rather
 * than on a string buried in a template literal.
 */
export const CARD_HTML_CSP = [
  "default-src 'none'",
  "img-src https: data:",
  "style-src 'unsafe-inline'",
  "font-src data:",
  "form-action 'none'",
  "frame-ancestors 'none'",
  "base-uri 'none'",
].join("; ");

/**
 * The full document handed to the WebView: sanitised markup inside a CSP that
 * assumes the sanitiser failed.
 */
export const buildCardHtmlDocument = (raw: unknown): string => {
  const body = sanitizeCardHtml(raw);
  const vendorCss = typeof raw === "string" ? extractStyleBlocks(raw) : "";

  return (
    `<!DOCTYPE html><html><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<meta http-equiv="Content-Security-Policy" content="${CARD_HTML_CSP}">` +
    `<style>html,body{margin:0;padding:0;background:transparent;` +
    `-webkit-user-select:none;user-select:none;}img{max-width:100%;}` +
    `${vendorCss}</style>` +
    `</head><body>${body}</body></html>`
  );
};

/**
 * Navigation gate for a WebView showing card HTML: nothing may be loaded except
 * the document we just built. Sub-resources are not routed through this on
 * Android, which is why the CSP above is the control that constrains them.
 */
export const isCardHtmlNavigationAllowed = (request: unknown): boolean => {
  const url = (request as { url?: unknown })?.url;
  if (typeof url !== "string" || !url) return true; // the initial load
  const target = url.trim().toLowerCase();
  return (
    target === "about:blank" ||
    target.startsWith("about:blank#") ||
    target.startsWith("about:blank?") ||
    target.startsWith("data:text/html")
  );
};

/**
 * Props every WebView rendering card HTML must carry. Kept here rather than
 * inline so a second such screen cannot be written with a weaker set — and so
 * the regression test has one object to assert against.
 */
export const CARD_HTML_WEBVIEW_PROPS: {
  javaScriptEnabled: boolean;
  javaScriptCanOpenWindowsAutomatically: boolean;
  domStorageEnabled: boolean;
  allowFileAccess: boolean;
  allowFileAccessFromFileURLs: boolean;
  allowUniversalAccessFromFileURLs: boolean;
  setSupportMultipleWindows: boolean;
  thirdPartyCookiesEnabled: boolean;
  sharedCookiesEnabled: boolean;
  cacheEnabled: boolean;
  incognito: boolean;
  mixedContentMode: "never";
  originWhitelist: string[];
} = {
  // A PIN needs no scripting, and without it the exfiltration path in the
  // finding does not exist at all.
  javaScriptEnabled: false,
  javaScriptCanOpenWindowsAutomatically: false,
  domStorageEnabled: false,
  allowFileAccess: false,
  allowFileAccessFromFileURLs: false,
  allowUniversalAccessFromFileURLs: false,
  setSupportMultipleWindows: false,
  thirdPartyCookiesEnabled: false,
  sharedCookiesEnabled: false,
  cacheEnabled: false,
  incognito: true,
  mixedContentMode: "never",
  // Opaque origin: the document belongs to nothing, so there is no origin for
  // it to be same-origin with.
  originWhitelist: ["about:blank"],
};
