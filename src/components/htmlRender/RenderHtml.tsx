import React, { useMemo } from "react";
import { Linking } from "react-native";
import RNRenderHTML, { RenderHTMLProps } from "react-native-render-html";
import { sanitizeNotesHtml } from "../../security/htmlPolicy";
import { log } from "../../utils/logger";


const isExternalLink = (href: string) =>
  href.startsWith("https:") || href.startsWith("mailto:");

/** Bare action tokens such as `goTomenu`, which screens route to navigation. */
const IN_APP_ACTION = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/;

const openSafeLink = (_event: unknown, href: string) => {
  if (typeof href !== "string") {
    return;
  }
  if (isExternalLink(href)) {
    Linking.openURL(href).catch((err) => log.error("Failed to open link", err));
  }
};

const RenderHtml = ({ baseStyle, source, renderersProps, ...props }: RenderHTMLProps) => {
  const safeSource = useMemo(() => {
    if (source && "html" in source) {
      return { ...source, html: sanitizeNotesHtml(source.html) };
    }
    return source;
  }, [source]);

  // M-05: the scheme check runs before any screen's own handler, so a caller
  // cannot hand an `intent:`, `tel:` or custom-scheme href to Linking.openURL.
  const safeRenderersProps = useMemo(() => {
    const callerOnPress = renderersProps?.a?.onPress;
    return {
      ...renderersProps,
      a: {
        ...renderersProps?.a,
        onPress: (event: any, href: string, ...rest: any[]) => {
          if (typeof href !== "string") return;
          const external = isExternalLink(href);
          if (!external && !IN_APP_ACTION.test(href)) {
            log.warn("Blocked link with disallowed scheme");
            return;
          }
          if (callerOnPress) return (callerOnPress as any)(event, href, ...rest);
          if (external) openSafeLink(event, href);
        },
      },
    };
  }, [renderersProps]);

  return (
    <RNRenderHTML
      enableCSSInlineProcessing
      enableUserAgentStyles
      baseStyle={{ fontSize: 14, ...baseStyle }}
      {...props}
      source={safeSource}
      renderersProps={safeRenderersProps}
    />
  );
};

export default RenderHtml;
