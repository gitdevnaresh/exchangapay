import React, { useMemo } from "react";
import { Linking } from "react-native";
import RNRenderHTML, { RenderHTMLProps } from "react-native-render-html";
import { sanitizeNotesHtml } from "../../security/htmlPolicy";
import { log } from "../../utils/logger";


const openSafeLink = (_event: unknown, href: string) => {
  if (typeof href !== "string") {
    return;
  }
  if (href.startsWith("https:") || href.startsWith("mailto:")) {
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

  const safeRenderersProps = useMemo(
    () => ({
      ...renderersProps,
      a: { onPress: openSafeLink, ...renderersProps?.a },
    }),
    [renderersProps]
  );

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
