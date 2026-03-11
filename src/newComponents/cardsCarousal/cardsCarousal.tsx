import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  Animated,
  Dimensions,
  View,
  StyleSheet,
  FlatList,
  Text,
  ViewToken
} from "react-native";

const screenWidth = Dimensions.get("window").width;

const DOT_CONTAINER_MARGIN_TOP = 12;
const DOT_CONTAINER_MARGIN_BOTTOM = 4;
const DOT_HEIGHT = 8;
const SPACE_FOR_DOTS = DOT_CONTAINER_MARGIN_TOP + DOT_CONTAINER_MARGIN_BOTTOM + DOT_HEIGHT;

const CardCarousel: React.FC<AutoCarouselProps> = ({
  data,
  width = screenWidth * 0.95,
  height = 185 + SPACE_FOR_DOTS,
  renderItem,
  keyExtractor = (_, index) => index.toString(),
  onActiveCardChange,
  NoData,
  containerStyle,
  emptyMessage = "No data available",
  initialScrollIndex = 0,
}) => {
  const flatListRef = useRef<FlatList<any>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [layoutDone, setLayoutDone] = useState(false);

  const isTwoCards = data.length >= 2;
  const isSingleCard = data.length === 1;

  const infiniteData = isTwoCards ? [...data, ...data, ...data] : data;
  const middleSetStart = isTwoCards ? data.length : 0;

  const [activeIndex, setActiveIndex] = useState(
    initialScrollIndex < data.length ? initialScrollIndex : 0
  );

  const ITEM_WIDTH_PERCENTAGE = isSingleCard ? 0.89 : 0.82;
  const HORIZONTAL_ITEM_SPACING_PERCENTAGE = isSingleCard ? 0.005 : 0.006;

  const ITEM_WIDTH = Math.round(width * ITEM_WIDTH_PERCENTAGE);
  const HORIZONTAL_ITEM_SPACING = Math.round(width * HORIZONTAL_ITEM_SPACING_PERCENTAGE);
  const SYMMETRICAL_CONTAINER_PADDING = Math.round((width - ITEM_WIDTH - HORIZONTAL_ITEM_SPACING) / 2);
  const cardItemHeight = height - SPACE_FOR_DOTS;

  const getOriginalIndex = (index: number) => (!isTwoCards ? index : index % data.length);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 51 }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      const visibleItem = viewableItems[0];
      if (visibleItem.index !== null) {
        const origIdx = getOriginalIndex(visibleItem.index);
        setActiveIndex(origIdx);
        onActiveCardChange?.(data[origIdx], origIdx);
      }
    }
  }).current;

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_WIDTH + HORIZONTAL_ITEM_SPACING,
      offset: (ITEM_WIDTH + HORIZONTAL_ITEM_SPACING) * index,
      index,
    }),
    [ITEM_WIDTH, HORIZONTAL_ITEM_SPACING]
  );

  const handleMomentumScrollEnd = (event: any) => {
    if (!isTwoCards) return;
    const offsetX = event.nativeEvent.contentOffset.x;
    const itemWidthWithSpacing = ITEM_WIDTH + HORIZONTAL_ITEM_SPACING;
    const currentIndex = Math.round(offsetX / itemWidthWithSpacing);

    if (currentIndex < data.length) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + data.length, animated: false });
    } else if (currentIndex >= data.length * 2) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - data.length, animated: false });
    }
  };

  // Fix: scroll after layout to proper index
  useEffect(() => {
    if (layoutDone && flatListRef.current) {
      const scrollTo = isTwoCards
        ? middleSetStart + (initialScrollIndex % data.length)
        : initialScrollIndex < data.length
        ? initialScrollIndex
        : 0;

      flatListRef.current.scrollToIndex({
        index: scrollTo,
        animated: false,
      });
    }
  }, [layoutDone]);

  if (!data || data.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        {NoData ? NoData : <Text>{emptyMessage}</Text>}
      </View>
    );
  }

  return (
    <View
      style={[{ width: width, alignSelf: 'center', height: height }, containerStyle]}
      onLayout={() => setLayoutDone(true)}
    >
      <Animated.FlatList
        ref={flatListRef}
        data={infiniteData}
        horizontal
        snapToInterval={ITEM_WIDTH + HORIZONTAL_ITEM_SPACING}
        decelerationRate="fast"
        pagingEnabled={false}
        snapToAlignment="start"
        keyExtractor={(item, index) => `${keyExtractor(item, getOriginalIndex(index))}-${index}`}
        contentContainerStyle={{ paddingHorizontal: SYMMETRICAL_CONTAINER_PADDING }}
        showsHorizontalScrollIndicator={false}
        getItemLayout={getItemLayout}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item, index }) => {
          const originalIndex = getOriginalIndex(index);

          const inputRange = [
            (index - 1) * (ITEM_WIDTH + HORIZONTAL_ITEM_SPACING),
            index * (ITEM_WIDTH + HORIZONTAL_ITEM_SPACING),
            (index + 1) * (ITEM_WIDTH + HORIZONTAL_ITEM_SPACING),
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 0.9],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: "clamp",
          });

          return (
            <View style={[styles.itemContainer, { width: ITEM_WIDTH, marginHorizontal: HORIZONTAL_ITEM_SPACING / 2 }]}>
              <Animated.View style={{ transform: [{ scale }], opacity, flex: 1 }}>
                {renderItem(item, originalIndex, ITEM_WIDTH, cardItemHeight, originalIndex === activeIndex)}
              </Animated.View>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  itemContainer: {
    justifyContent: 'center',
  },
});

export default CardCarousel;
