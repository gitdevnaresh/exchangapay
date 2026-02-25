import React from 'react';
import { Image } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { s } from '../constants/styels/scale';
interface SvgFromUrlProps {
  uri: string;
  width: number;
  height: number;
  style?: any;
}

const SvgFromUrl: React.FC<SvgFromUrlProps> = ({ uri, width, height, style }) => {
  if (!uri) return null;
  if (uri.indexOf('.svg') > -1) {
    return <SvgUri width={width} height={height} uri={uri} style={[{ borderRadius: s(100) / 2 }, style]} />;
  }
  return <Image source={{ uri }} style={[{ width, height, borderRadius: s(100) / 2 }, style]} />;
};

export default SvgFromUrl;
