import React from 'react';
import { Image, StyleProp, ImageStyle, ImageSourcePropType, ImageResizeMode } from 'react-native';
import { SvgUri } from 'react-native-svg';

interface ImageUriProps {
  uri?: string | null;
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
  tintColor?: string;
  source?: ImageSourcePropType;
  resizeMode?: ImageResizeMode;
}

const ImageUri: React.FC<ImageUriProps> = ({ uri, width, height, style, tintColor, source, resizeMode }) => {
  if (!uri && !source) return null;
  const isSvg =uri?.endsWith('.svg');
  return (
    <>
      {isSvg ? (
        <SvgUri width={width} height={height} uri={uri!} style={style}/>
      ) : (
        <Image
          source={uri? { uri } : source}
          style={[{ width, height, tintColor }, style]}
          resizeMode={resizeMode}
        />
      )}
    </>
  );
};

export default ImageUri;
