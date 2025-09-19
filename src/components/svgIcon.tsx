import React from 'react';
import { Image, View } from 'react-native';
import { SvgUri } from 'react-native-svg';
interface SvgFromUrlProps {
    uri: string;
    width: number;
    height: number;
  }
  
  const SvgFromUrl: React.FC<SvgFromUrlProps> = ({ uri, width, height }) => {
    
  return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius:100 }}>
    {uri&& uri.indexOf('.svg')>-1&&<SvgUri width={width} height={height} uri={uri} />}
    {uri&& uri.indexOf('.svg')==-1&&<Image source={{uri:uri}} style={{ width: width, height: height }} />}
    </View>;
};

export default SvgFromUrl;
