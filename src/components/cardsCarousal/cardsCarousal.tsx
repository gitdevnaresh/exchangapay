import React, { useRef, useState, useCallback } from "react";
import {
  Dimensions,
  View,
  StyleSheet,
  FlatList,
  ViewToken,
  TouchableOpacity,
} from "react-native";
import { s } from "../../constants/styels/scale";
import NoDataComponent from "../noData/noData";
import { useThemeColors } from "../../hooks/themedHook/useThemeColors";

interface AutoCarouselProps {
  data: any[];
  width?: number;
  height?: number;
  renderItem: (
    item: any,
    index: number,
    calculatedItemWidth: number,
    calculatedItemHeight: number
  ) => JSX.Element;
  keyExtractor?: (item: any, index: number) => string;
  onActiveCardChange?: (card: any, index: number) => void;
  NoData?: React.ReactNode;
  emptyMessage?: string;
  containerStyle?: any;
  initialScrollIndex?: number;

  /** Height ratio for non-active cards (0–1) */
  inactiveCardHeightRatio?: number;

  /** NEW: opacity controls */
  inactiveCardOpacity?: number; // e.g., 0.55 dims the side cards
  activeCardOpacity?: number;   // opacity for the active card
}

const screenWidth = Dimensions.get("window").width;

const DOT_CONTAINER_MARGIN_TOP = s(10);
const DOT_CONTAINER_MARGIN_BOTTOM = s(4);
const DOT_HEIGHT = s(4);
const IN_DOT_HEIGHT = s(10);
const DOT_BORDER_RADIUS = s(100) / 2;
const DOT_MARGIN_HORIZONTAL = s(4);

const SPACE_FOR_DOTS =
  DOT_CONTAINER_MARGIN_TOP +
  DOT_CONTAINER_MARGIN_BOTTOM +
  Math.max(DOT_HEIGHT, IN_DOT_HEIGHT);

const CardCarousel: React.FC<AutoCarouselProps> = ({
  data,
  width = screenWidth * 0.99,
  height = s(210) + SPACE_FOR_DOTS,
  renderItem,
  keyExtractor = (_, index) => index.toString(),
  onActiveCardChange,
  NoData,
  containerStyle,
  emptyMessage = "No data available",
  initialScrollIndex = 0,

  /** defaults */
  inactiveCardHeightRatio = 0.96,

  /** NEW defaults */
  inactiveCardOpacity = 0.55,
  activeCardOpacity = 1,
}) => {
  const flatListRef = useRef<FlatList<any>>(null);
  const [activeIndex, setActiveIndex] = useState(
    initialScrollIndex < data.length ? initialScrollIndex : 0
  );

  const isSingleCard = data.length === 1;

  const carouselTotalWidth = width;
  const ITEM_WIDTH_PERCENTAGE = isSingleCard ? 0.89 : 0.81;
  const HORIZONTAL_ITEM_SPACING_PERCENTAGE = isSingleCard ? 0.005 : 0.028;

  const NEW_COLOR = useThemeColors();
  const styles = screenStyles(NEW_COLOR);

  const ITEM_WIDTH = Math.round(carouselTotalWidth * ITEM_WIDTH_PERCENTAGE);
  const HORIZONTAL_ITEM_SPACING = Math.round(
    carouselTotalWidth * HORIZONTAL_ITEM_SPACING_PERCENTAGE
  );
  const SYMMETRICAL_CONTAINER_PADDING = Math.round(
    (carouselTotalWidth - ITEM_WIDTH - HORIZONTAL_ITEM_SPACING) / 2
  );

  // Full available card area (the tallest – used for the active card)
  const cardItemHeight = height - SPACE_FOR_DOTS;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 90,
  });

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems?.length > 0) {
        const visible = viewableItems[0];
        if (visible?.item && visible.index !== null) {
          setActiveIndex(visible.index!);
          onActiveCardChange?.(visible.item, visible.index!);
        }
      }
    }
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_WIDTH + HORIZONTAL_ITEM_SPACING,
      offset: (ITEM_WIDTH + HORIZONTAL_ITEM_SPACING) * index,
      index,
    }),
    [ITEM_WIDTH, HORIZONTAL_ITEM_SPACING]
  );

  const handleDotPress = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  if (!data || data.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        {NoData ? NoData : <NoDataComponent Description={emptyMessage} />}
      </View>
    );
  }

  return (
    <View
      style={[
        { width: carouselTotalWidth, alignSelf: "center", height },
        containerStyle,
      ]}
    >
      <FlatList
        ref={flatListRef}
        data={data}
        horizontal
        snapToInterval={ITEM_WIDTH + HORIZONTAL_ITEM_SPACING}
        decelerationRate="fast"
        pagingEnabled={false}
        snapToAlignment="start"
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingHorizontal: SYMMETRICAL_CONTAINER_PADDING }}
        showsHorizontalScrollIndicator={false}
        getItemLayout={getItemLayout}
        renderItem={({ item, index }) => {
          const isActive = index === activeIndex || isSingleCard;
          const itemHeight = isActive
            ? cardItemHeight
            : Math.round(cardItemHeight * inactiveCardHeightRatio);

          return (
            <View
              style={{
                width: ITEM_WIDTH,
                marginHorizontal: HORIZONTAL_ITEM_SPACING / 3,
                justifyContent: "center",
                alignItems: "center",
                height: cardItemHeight,
                // NEW: dim inactive cards
                // opacity: isActive ? activeCardOpacity : inactiveCardOpacity,
              }}
            >
              {renderItem(item, index, ITEM_WIDTH, itemHeight)}
            </View>
          );
        }}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
        initialScrollIndex={
          initialScrollIndex < data.length ? initialScrollIndex : 0
        }
      />

      {/* Dots */}
      <View
        style={[
          styles.dotsContainer,
          { marginTop: DOT_CONTAINER_MARGIN_TOP, marginBottom: DOT_CONTAINER_MARGIN_BOTTOM },
        ]}
      >
        {data.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              activeIndex === index ? styles.activeDot : styles.inactiveDot,
              {
                height: activeIndex === index ? DOT_HEIGHT : IN_DOT_HEIGHT,
                borderRadius: DOT_BORDER_RADIUS,
                marginHorizontal: DOT_MARGIN_HORIZONTAL,
              },
            ]}
            onPress={() => handleDotPress(index)}
            activeOpacity={0.7}
          />
        ))}
      </View>
    </View>
  );
};

const screenStyles = (NEW_COLOR: any) =>
  StyleSheet.create({
    noDataContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    dotsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    activeDot: {
      width: s(20),
      backgroundColor: NEW_COLOR.TEXT_WHITE,
    },
    inactiveDot: {
      width: s(10),
      backgroundColor: NEW_COLOR.CAROUSEL_BG,
    },
  });

export default CardCarousel;
