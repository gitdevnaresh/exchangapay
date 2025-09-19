import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

const customFonts = {
};

interface LabelProps {
  text?: string | number;
  style?: any;
  children?: React.ReactNode;
  numberOfLines?: number;
  onPress?: () => void;
}

const ParagraphComponent = ({ text, style, children, numberOfLines, onPress }: LabelProps) => {
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
  return (
    <Text style={[styles.CommonText, style]} numberOfLines={numberOfLines} ellipsizeMode="tail" onLayout={onLayoutRootView} onPress={onPress}>
      {text}{children}
    </Text>
  );
};

export default ParagraphComponent;

const styles = StyleSheet.create({
  container: {},
  CommonText: {
    // Define your common text styles here
    // fontSize: 12
  },
});
