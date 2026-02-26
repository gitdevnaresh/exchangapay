const React = require("react");
const { ScrollView, View } = require("react-native");

const Carousel = React.forwardRef(function Carousel(props, ref) {
  const {
    width = 0,
    height = 0,
    data = [],
    autoPlay = false,
    autoPlayInterval = 3000,
    defaultIndex = 0,
    onSnapToItem,
    pagingEnabled = true,
    renderItem,
    loop = false,
  } = props || {};

  const scrollRef = React.useRef(null);
  const [index, setIndex] = React.useState(defaultIndex || 0);

  const scrollToIndex = React.useCallback(
    (nextIndex, animated = true) => {
      if (!Array.isArray(data) || data.length === 0) return;
      const max = data.length - 1;
      const safeIndex = Math.max(0, Math.min(nextIndex, max));
      setIndex(safeIndex);
      if (scrollRef.current && typeof scrollRef.current.scrollTo === "function") {
        scrollRef.current.scrollTo({ x: safeIndex * width, y: 0, animated });
      }
      if (typeof onSnapToItem === "function") {
        onSnapToItem(safeIndex);
      }
    },
    [data, onSnapToItem, width]
  );

  React.useImperativeHandle(
    ref,
    () => ({
      scrollTo: ({ index: toIndex = 0, animated = true } = {}) => {
        scrollToIndex(toIndex, animated);
      },
      next: ({ animated = true } = {}) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const next = index + 1;
        if (next > data.length - 1) {
          if (loop) {
            scrollToIndex(0, animated);
          }
          return;
        }
        scrollToIndex(next, animated);
      },
      prev: ({ animated = true } = {}) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const prev = index - 1;
        if (prev < 0) {
          if (loop) {
            scrollToIndex(data.length - 1, animated);
          }
          return;
        }
        scrollToIndex(prev, animated);
      },
    }),
    [data, index, loop, scrollToIndex]
  );

  React.useEffect(() => {
    if (defaultIndex > 0) {
      const id = setTimeout(() => scrollToIndex(defaultIndex, false), 0);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [defaultIndex, scrollToIndex]);

  React.useEffect(() => {
    if (!autoPlay || !Array.isArray(data) || data.length <= 1) return undefined;
    const id = setInterval(() => {
      setIndex((prev) => {
        const next = prev + 1;
        if (next > data.length - 1) {
          if (!loop) return prev;
          scrollToIndex(0, true);
          return 0;
        }
        scrollToIndex(next, true);
        return next;
      });
    }, autoPlayInterval);
    return () => clearInterval(id);
  }, [autoPlay, autoPlayInterval, data, loop, scrollToIndex]);

  const handleMomentumEnd = React.useCallback(
    (e) => {
      if (!width) return;
      const x = e?.nativeEvent?.contentOffset?.x || 0;
      const nextIndex = Math.round(x / width);
      if (nextIndex !== index) {
        setIndex(nextIndex);
        if (typeof onSnapToItem === "function") {
          onSnapToItem(nextIndex);
        }
      }
    },
    [index, onSnapToItem, width]
  );

  return React.createElement(
    ScrollView,
    {
      ref: scrollRef,
      horizontal: true,
      pagingEnabled,
      showsHorizontalScrollIndicator: false,
      onMomentumScrollEnd: handleMomentumEnd,
      scrollEventThrottle: 16,
      style: [{ width, height }, props.style],
      contentContainerStyle: { alignItems: "stretch" },
    },
    (data || []).map((item, itemIndex) =>
      React.createElement(
        View,
        { key: String(itemIndex), style: { width, height } },
        typeof renderItem === "function" ? renderItem({ item, index: itemIndex }) : null
      )
    )
  );
});

module.exports = Carousel;
module.exports.default = Carousel;
