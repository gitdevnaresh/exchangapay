import React from 'react';
import { Image } from 'react-native-elements';
import { SvgUri } from 'react-native-svg';

interface IconImageProps {
  containerStyle: any;
  source: any;
  style: any;
}

const Icon = ({ containerStyle, style = { width: 0, height: 0 }, source }: IconImageProps) => {
  const isSourceSvg = source?.toString()?.slice(-4) === '.svg';
  const isSourceLink = source?.toString().includes('https://');

  const { width, height } = style;

  const resolvedSource = isSourceLink ? { uri: source } : source;

  return isSourceSvg
    ? (
      <SvgUri
        width={width}
        height={height}
        uri={source}
      />
    )
    : (
      <Image
        source={resolvedSource}
        style={style}
        containerStyle={containerStyle}
      />
    );
};

export default Icon;
