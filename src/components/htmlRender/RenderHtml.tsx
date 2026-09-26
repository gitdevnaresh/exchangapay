import React from "react";
import RNRenderHTML, { RenderHTMLProps } from "react-native-render-html";


const RenderHtml = ({ baseStyle, ...props }: RenderHTMLProps) => (
  <RNRenderHTML
    enableCSSInlineProcessing
    enableUserAgentStyles
    baseStyle={{ fontSize: 14, ...baseStyle }}
    {...props}
  />
);

export default RenderHtml;
