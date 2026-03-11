import React, { useState } from 'react';
import { Image, StyleProp, ImageStyle, ImageSourcePropType, ImageResizeMode, View, ActivityIndicator } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { useThemeColors } from '../../hooks/useThemeColors';

interface ImageUriProps {
  uri?: string | null;
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
  tintColor?: string;
  source?: ImageSourcePropType;
  resizeMode?: ImageResizeMode;
  isImageLoading?: boolean;
  onLoad?: any;
  onError?: any;
}

const ImageUri: React.FC<ImageUriProps> = ({ uri, width, height, style, tintColor, source, resizeMode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const NEW_COLOR = useThemeColors();

  const isLocalAsset = !!source;

  if (!uri && !source) {
    return null;
  }

  const isSvg = uri?.endsWith('.svg');

  const handleLoadStart = () => setIsLoading(true);
  const handleLoadEnd = () => setIsLoading(false);
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <View style={[style, { width, height, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ccc' }]} />
    );
  }

  return (
    <View style={[{ width, height, justifyContent: 'center', alignItems: 'center' }, style]}>
      {/* The loader is correctly shown based on the loading state of remote images. */}
      {isLoading && !isLocalAsset && (
        <ActivityIndicator
          style={{ position: 'absolute' }}
          size="small"
          color={NEW_COLOR.ICON_YELLOW_LOADER}
        />
      )}
      {isSvg ? (
        <SvgUri
          width={width}
          height={height}
          uri={uri!}
          // FIX: Apply opacity to hide SVG while loading for a consistent experience.
          style={[style, { opacity: isLoading ? 0 : 1 }]}
          onLoad={handleLoadEnd}
          onError={handleError}
        />
      ) : (
        <Image
          source={uri ? { uri } : source}
          style={[
            { width, height, tintColor },
            style,
            // FIX: Use opacity instead of display: 'none' to keep the component mounted.
            // This allows the onLoadEnd event to fire correctly.
            { opacity: isLoading && !isLocalAsset ? 0 : 1 }
          ]}
          resizeMode={resizeMode}
          onLoadStart={!isLocalAsset ? handleLoadStart : undefined}
          onLoadEnd={!isLocalAsset ? handleLoadEnd : undefined}
          onError={handleError}
        />
      )}
    </View>
  );
};

export default ImageUri;