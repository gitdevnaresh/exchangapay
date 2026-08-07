// AutoSlideCarousel.tsx (SAFE VERSION FOR RN 0.82)

import React, { useEffect, useRef, useState } from "react";
import { FlatList, View, Dimensions } from "react-native";
import { s } from "../../constants/theme/scale";
import { horizontalItemLayout } from "../../constants/listPerformance";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const AutoSlideCarousel = ({
    data,
    duration = 5000,
    width = SCREEN_WIDTH * 0.9,
    height = s(200),
}: any) => {
    const flatListRef = useRef<FlatList>(null);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (!data?.length) return;

        const timer = setInterval(() => {
            const nextIndex = (index + 1) % data.length;
            setIndex(nextIndex);
            flatListRef.current?.scrollToIndex({
                index: nextIndex,
                animated: true,
            });
        }, duration);

        return () => clearInterval(timer);
    }, [index, data]);

    if (!data?.length) return null;

    return (
        <FlatList
            ref={flatListRef}
            data={data}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
                <View style={{ width, height }}>{item}</View>
            )}
            // P-01: every page is exactly `width` wide, so layout can be
            // computed instead of measured. This also makes the auto-slide
            // scrollToIndex reliable for slides outside the render window —
            // without getItemLayout it silently fails once windowing is on.
            getItemLayout={horizontalItemLayout(width)}
            initialNumToRender={1}
            maxToRenderPerBatch={2}
            windowSize={3}
        />
    );
};

export default AutoSlideCarousel;
