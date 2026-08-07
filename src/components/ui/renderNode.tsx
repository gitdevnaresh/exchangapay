import React from "react";

/**
 * Faithful port of react-native-elements' `renderNode` helper, kept so the
 * local Button / Input accept the exact same `title` / `icon` / `label` shapes
 * their call sites already pass (element, string, number, function, props
 * object or false). See src/components/ui/README notes in Overlay.tsx.
 */
const renderNode = (
  Component: any,
  content: any,
  defaultProps: any = {}
): React.ReactNode => {
  if (content == null || content === false) {
    return null;
  }
  if (React.isValidElement(content)) {
    return content;
  }
  if (typeof content === "function") {
    return content();
  }
  if (content === true) {
    return <Component {...defaultProps} />;
  }
  if (typeof content === "string") {
    if (content.length === 0) {
      return null;
    }
    return <Component {...defaultProps}>{content}</Component>;
  }
  if (typeof content === "number") {
    return <Component {...defaultProps}>{content}</Component>;
  }
  return <Component {...defaultProps} {...content} />;
};

export default renderNode;
