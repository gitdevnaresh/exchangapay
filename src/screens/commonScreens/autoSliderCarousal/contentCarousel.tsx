import React, { useEffect, useRef, useState } from "react";
import { Dimensions, TouchableOpacity, View, Text } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import RenderHTML from "react-native-render-html";
import { s } from "../../../constants/styels/scale";
import NoDataComponent from "../../../components/noData/noData";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";
import { getThemedCommonStyles } from "../../../components/CommonStyles";
import { LinearGradient } from "expo-linear-gradient";
import { Logger } from '../../../utils/Logger';
import { getTabsConfigation } from "../../../../cofiguration";

interface AutoCarouselProps {
  data: any[];
  duration: number;
  width?: number;
  height?: number;
  loop?: boolean;
  scrollAnimationDuration?: number;
  contentKey?: string;
  style?: any;
  isCustomestyle?: boolean;
}

const AutoSlideCarousel: React.FC<AutoCarouselProps> = ({
  data,
  duration,
  width = Dimensions.get("window").width * 0.90,
  height = s(250),
  loop = true,
  scrollAnimationDuration = 500,
  contentKey = "templateContent",
  style,
  isCustomestyle = false
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const sharedValue = useSharedValue(0);
  const carouselRef = useRef<ICarouselInstance>(null);
  const commonComponentConfig = getTabsConfigation('COMMON_COMPONENTS');
  const handleSnapToItem = (index: number) => {
    setActiveIndex(index);
  };
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const handleDotPress = (index: number) => {
    setActiveIndex(index);
    carouselRef.current?.scrollTo({ index: index, animated: true });
  };

  useEffect(() => {
    sharedValue.value = activeIndex;
  }, [activeIndex]);
  if (!data || data?.length == 0) {
    return <NoDataComponent />;
  }
  return (
    <View >
      <Carousel
        ref={carouselRef}
        width={width}
        height={height}
        data={data}
        autoPlay={loop && data.length > 1}
        autoPlayInterval={duration}
        defaultIndex={activeIndex}
        onSnapToItem={handleSnapToItem}
        scrollAnimationDuration={scrollAnimationDuration}
        pagingEnabled
        renderItem={({ item }: { item: any }) => {
          const slideStyle = [
            {
              width: width,
              height: height,
              justifyContent: 'center', // Default, can be overridden by item's own styles
              // alignItems: 'center', // Default, can be overridden by item's own styles
            },
          ];

          // Check if item is an object and has the contentKey for HTML rendering
          if (
            typeof item === 'object' &&
            item !== null &&
            !React.isValidElement(item) &&
            contentKey &&
            typeof item[contentKey] === 'string'
          ) {
            return (
              <View style={slideStyle}>
                <RenderHTML contentWidth={width * 0.9} source={{ html: item[contentKey] }} />
              </View>
            );
          } else if (React.isValidElement(item)) {
            // If item is a React element, render it directly
            return <View style={slideStyle}>{item}</View>;
          }
          // Fallback for invalid item structure
          Logger.warn("AutoSlideCarousel: Invalid item format in data array.", item);
          return <View style={slideStyle}><Text>Invalid Slide Content</Text></View>;
        }}
      />

      <View style={isCustomestyle ? style : [
        commonStyles.dflex,
        commonStyles.justifyCenter,
        commonStyles.alignCenter,
        commonStyles.gap5,
        commonStyles.mt10,
        commonStyles.contentcarousel
      ]}>
        {data.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleDotPress(index)}
            activeOpacity={0.7}
          >
            {activeIndex === index ? (
              (commonComponentConfig.isLinearGradientApply &&
                <LinearGradient
                  colors={["#CEFF1C", "#E5FF84", "#CEFF1C"]}
                  locations={[0.085, 0.4784, 0.8589]}
                  start={{ x: 0.3, y: 0.0 }}
                  end={{ x: 0.7, y: 1.0 }}
                  style={commonStyles.ActiveCarousel}
                /> ||
                <View

                  style={[commonStyles.ActiveCarousel]}
                />
              )
            ) : (
              <View style={[commonStyles.InActiveCarousel]} />
            )}
          </TouchableOpacity>
        ))}
      </View>

    </View>
  );
};

export default AutoSlideCarousel;
