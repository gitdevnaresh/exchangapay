import React, { useState } from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { useLngTranslation } from '../../hooks/useLngTranslation';

interface GradientTextProps {
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  textAnchor?: 'start' | 'middle' | 'end';
  style?: TextStyle | (TextStyle | ViewStyle)[];
  x?: string | number;
  y?: number;
  children?: React.ReactNode;
}

const GradientText: React.FC<GradientTextProps> = ({
  text,
  fontSize,
  fontWeight,
  fontFamily,
  textAnchor,
  x,
  y,
  style,
  children,
}) => {
  const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style || {};
  const resolvedFontSize = fontSize || flatStyle.fontSize || 24;
  const resolvedFontWeight = fontWeight || flatStyle.fontWeight || 'bold';
  const resolvedFontFamily = fontFamily || flatStyle.fontFamily;
  const { t } = useLngTranslation();

  const displayText = typeof children === 'string' ? t(children) : t(text || '');
  const [textWidth, setTextWidth] = useState<number>(0);

  // Resolve textAnchor from style or props
  let resolvedTextAnchor: 'start' | 'middle' | 'end';
  if (textAnchor !== undefined) {
    resolvedTextAnchor = textAnchor;
  } else if (flatStyle.textAlign === 'center') {
    resolvedTextAnchor = 'middle';
  } else if (flatStyle.textAlign === 'right') {
    resolvedTextAnchor = 'end';
  } else {
    resolvedTextAnchor = 'start';
  }

  // Dynamically compute x based on anchor
  let defaultXValue: number;
  if (resolvedTextAnchor === 'middle') {
    defaultXValue = textWidth / 2;
  } else if (resolvedTextAnchor === 'end') {
    defaultXValue = textWidth;
  } else {
    defaultXValue = 0;
  }

  const resolvedX = x ?? defaultXValue;

  // Calculate alignItemsValue once, as it only depends on resolvedTextAnchor
  let alignItemsValue: 'flex-start' | 'center' | 'flex-end';
  if (resolvedTextAnchor === 'start') {
    alignItemsValue = 'flex-start';
  } else if (resolvedTextAnchor === 'middle') {
    alignItemsValue = 'center';
  } else {
    alignItemsValue = 'flex-end';
  }

  return (
    <>
      {/* Measure text width invisibly */}
      {textWidth === 0 && (
        <Text
          style={{
            position: 'absolute',
            opacity: 0,
            fontSize: resolvedFontSize,
            fontWeight: resolvedFontWeight,
            fontFamily: resolvedFontFamily,
          }}
          onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
        >
          {displayText}
        </Text>
      )}

      {/* Render SVG after width is known */}
      {textWidth > 0 && (
        <View
          style={[
            {
              height: resolvedFontSize * 1.2,
              width: textWidth,
              alignItems: alignItemsValue,
            },
            flatStyle,
          ]}
        >
          <Svg height={resolvedFontSize * 1.2} width={textWidth}>
            <Defs>
              <LinearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="8.54%" stopColor="#11998E" />
                <Stop offset="102.13%" stopColor="#38EF7D" />
              </LinearGradient>
            </Defs>
            <SvgText
              fill="url(#textGradient)"
              fontSize={resolvedFontSize}
              fontWeight={resolvedFontWeight}
              fontFamily={resolvedFontFamily}
              x={resolvedX}
              y={y ?? resolvedFontSize * 0.8}
              textAnchor={resolvedTextAnchor}
            >
              {displayText}
            </SvgText>
          </Svg>
        </View>
      )}
    </>
  );
};

export default GradientText;
