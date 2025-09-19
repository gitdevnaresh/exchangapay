import React, { useCallback, useEffect, useState } from 'react';
import { Text } from 'react-native';
const customFonts = {
  // 'InriaSans-Bold': require('../../../assets/fonts/InriaSans-Bold.ttf'),
  // 'InriaSans-Light': require('../../../assets/fonts/InriaSans-Light.ttf'),
  // 'InriaSans-Regular': require('../../../assets/fonts/InriaSans-Regular.ttf'),
};

interface LabelProps {
  text: string;
  style: any;
  children?: React.ReactNode;
  numberOfLines?: number;
  fontFamily?: string;
}

const TitleComponent = ({ text, style, children, numberOfLines, fontFamily }: LabelProps) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Promise.all(
          Object.keys(customFonts).map(async (font) => {
            await Font.loadAsync({ [font]: customFonts[font] });
          })
        );
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
      }
    };

    loadFonts();
  }, []);

  const onLayoutRootView = useCallback(() => {
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Text style={[style, { fontFamily }]} numberOfLines={numberOfLines} ellipsizeMode="tail" onLayout={onLayoutRootView}>
      {text}
      {children}
    </Text>
  );
};

export default TitleComponent;


