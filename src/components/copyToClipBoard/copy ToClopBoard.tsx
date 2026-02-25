import { Clipboard } from "react-native";

export const copyToClipboard = (copiedText:string) => {
  return   Clipboard.setString(copiedText);
  }