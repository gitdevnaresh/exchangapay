import React, { useEffect, useRef, useState } from "react";
import { Dimensions, TouchableOpacity, View, Text } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import RenderHTML from "react-native-render-html";
import { s } from "../../../constants/theme/scale";
import NoDataComponent from "../../../newComponents/noData/noData";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";

interface AutoCarouselProps {
  data: any[];
  duration: number;
  width?: number;
  height?: number;
  loop?: boolean;
  scrollAnimationDuration?: number;
  /** if you want to render html from a key in each object pass the key.
   *  Pass undefined/null when you pass React elements directly. */
  contentKey?: string;
  style?: any;
  isCustomestyle?: boolean;
  isLoopDotsDisply?: boolean;
  onIndexChange?: (index: number) => void;
}

const AutoSlideCarousel: React.FC<AutoCarouselProps> = ({
  data,
  duration,
  width = Dimensions.get("window").width * 0.87,
  height = s(200),
  loop = true,
  scrollAnimationDuration = 500,
  contentKey,
  style,
  isCustomestyle = false,
  isLoopDotsDisply = false,
  onIndexChange
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const sharedValue = useSharedValue(0);
  const carouselRef = useRef<ICarouselInstance>(null);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  const handleSnapToItem = (index: number) => {
    setActiveIndex(index);
    if (onIndexChange) onIndexChange(index);
  };

  const handleDotPress = (index: number) => {
    setActiveIndex(index);
    carouselRef.current?.scrollTo({ index, animated: true });
  };

  useEffect(() => {
    sharedValue.value = activeIndex;
  }, [activeIndex]);

  if (!data || data.length === 0) {
    return <NoDataComponent />;
  }

  return (
    <View>
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
          const slideStyle = {
            width,
            height: s(187),
            justifyContent: "center"
          };

          // ✅ If you passed objects with HTML string
          if (
            contentKey &&
            typeof item === "object" &&
            item !== null &&
            !React.isValidElement(item) &&
            typeof item[contentKey] === "string"
          ) {
            return (
              <View style={slideStyle}>
                <RenderHTML
                  contentWidth={width * 0.9}
                  source={{ html: item[contentKey] }}
                />
              </View>
            );
          }

          // ✅ If you passed React elements directly
          if (React.isValidElement(item)) {
            return item; // render the element exactly as given
          }

          // Fallback
          console.warn("AutoSlideCarousel: Invalid item format", item);
          return (
            <View style={slideStyle}>
              <Text>Invalid Slide Content</Text>
            </View>
          );
        }}
      />

      {isLoopDotsDisply && (
        <View
          style={
            isCustomestyle
              ? style
              : [
                  commonStyles.dflex,
                  commonStyles.justifyCenter,
                  commonStyles.alignCenter,
                  commonStyles.gap5,
                  commonStyles.mt16
                ]
          }
        >
          {data.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleDotPress(index)}
              activeOpacity={0.7}
            >
              {activeIndex === index ? (
                <View style={[commonStyles.ActiveCarousel]} />
              ) : (
                <View style={[commonStyles.InActiveCarousel]} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default AutoSlideCarousel;
