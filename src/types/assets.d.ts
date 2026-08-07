/**
 * SVGs are compiled to React components by react-native-svg-transformer (see
 * metro.config.js). TypeScript needs to be told the same thing.
 *
 * This declaration used to arrive by accident, through a global .d.ts inside
 * one of react-native-elements' transitive dependencies. Removing that UI kit
 * (P-03) took it with it and every `import Icon from "./x.svg"` in
 * src/assets/svg/index.tsx started erroring, so the project now owns it.
 */
declare module "*.svg" {
  import React from "react";
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}
