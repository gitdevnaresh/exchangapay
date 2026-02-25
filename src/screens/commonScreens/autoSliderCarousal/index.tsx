import React, { useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import RenderHTML from "react-native-render-html";
import { NEW_COLOR } from "../../../constants/styels/variables";
import { s } from "../../../constants/styels/scale";
import NoDataComponent from "../../../components/noData/noData";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";
import { getThemedCommonStyles } from "../../../components/CommonStyles";

interface AutoCarouselProps {
  data: [];
  duration: number;
  width?: number;
  height?: number;
  loop?: boolean;
  scrollAnimationDuration?: number;
  contentKey?: string
}

const ImageAutoSlideCarousel: React.FC<AutoCarouselProps> = ({
  data,
  duration,
  width = Dimensions.get("window").width * 0.92,
  height = s(250),
  loop = true,
  scrollAnimationDuration = 500,
  contentKey = "templateContent"
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const sharedValue = useSharedValue(0);
  const carouselRef = useRef<ICarouselInstance>(null);
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
        renderItem={({ item }) => (
          <View style={[commonStyles.sectionStyle]}>
            <RenderHTML contentWidth={width * 0.9} source={{ html: item[contentKey] }} />
          </View>
        )}
      />

      <View style={styles.dotsContainer}>
        {data.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleDotPress(index)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.dot,
                activeIndex === index && styles.activeDot,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  dot: {
    width: s(8),
    height: s(8),
    borderRadius: s(8) / 2,
    backgroundColor: NEW_COLOR.TEXT_GREY,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: NEW_COLOR.PRiMARY_COLOR,
    transform: [{ scale: 1.2 }],
  },
});
export default ImageAutoSlideCarousel;
