// PatternLock.tsx
import React, { useState, useRef, useMemo, FC } from "react";
import {
  View,
  StyleSheet,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  LayoutChangeEvent,
  StyleProp,
  ViewStyle,
} from "react-native";
import Svg, { Line } from "react-native-svg";

// --- Constants for easy customization ---
const GRID_SIZE = 3;
const DOT_SIZE = 20;
const ACTIVE_DOT_SIZE = 30;
const DOT_COLOR = "#A9A9A9";
const ACTIVE_DOT_COLOR = "#007AFF";
const LINE_COLOR = "#007AFF";
const CONTAINER_SIZE = 300;

// --- Type Definitions ---
type Position = {
  x: number;
  y: number;
};

interface PatternLockProps {
  onPatternComplete: (pattern: number[]) => void;
  style?: StyleProp<ViewStyle>;
  error?: boolean;
}

const PatternLock: FC<PatternLockProps> = ({
  onPatternComplete,
  style,
  error = false,
}) => {
  const [activeDots, setActiveDots] = useState<number[]>([]);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const dotCoordinates = useRef<Position[]>([]);

  const getDotIndex = (position: Position): number => {
    for (let i = 0; i < dotCoordinates.current.length; i++) {
      const dot = dotCoordinates.current[i];
      const distance = Math.sqrt(
        Math.pow(position.x - dot.x, 2) + Math.pow(position.y - dot.y, 2)
      );
      if (distance < ACTIVE_DOT_SIZE) {
        return i;
      }
    }
    return -1;
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt: GestureResponderEvent) => {
          const { locationX, locationY } = evt.nativeEvent;
          const index = getDotIndex({ x: locationX, y: locationY });
          if (index > -1) {
            setIsDrawing(true);
            setActiveDots([index]);
          }
        },
        onPanResponderMove: (evt: GestureResponderEvent) => {
          if (!isDrawing) return;
          
          const { locationX, locationY } = evt.nativeEvent;
          setCurrentPosition({ x: locationX, y: locationY });

          const index = getDotIndex({ x: locationX, y: locationY });
          if (index > -1 && !activeDots.includes(index)) {
            setActiveDots((prev) => [...prev, index]);
          }
        },
        onPanResponderRelease: () => {
          if (activeDots.length > 0) {
            onPatternComplete(activeDots);
          }
          setTimeout(() => {
            setActiveDots([]);
            setCurrentPosition(null);
            setIsDrawing(false);
          }, 300);
        },
      }),
    [activeDots, isDrawing, onPatternComplete]
  );

  const renderLines = (): JSX.Element[] | null => {
    if (activeDots.length < 2) return null;

    return activeDots.slice(0, -1).map((dotIndex, i) => {
      const startDot = dotCoordinates.current[dotIndex];
      const endDot = dotCoordinates.current[activeDots[i + 1]];
      return (
        <Line
          key={`line-${i}`}
          x1={startDot.x}
          y1={startDot.y}
          x2={endDot.x}
          y2={endDot.y}
          stroke={error ? "#FF3B30" : LINE_COLOR}
          strokeWidth="4"
          strokeLinecap="round"
        />
      );
    });
  };

  const renderLiveLine = (): JSX.Element | null => {
    // Only show live line if we have active dots and are currently drawing
    if (activeDots.length > 0 && currentPosition && isDrawing) {
      const lastDot = dotCoordinates.current[activeDots[activeDots.length - 1]];
      
      // Check if we're near another dot - if so, don't show live line
      const nearDotIndex = getDotIndex(currentPosition);
      if (nearDotIndex > -1 && !activeDots.includes(nearDotIndex)) {
        return null; // Don't show live line when near a new dot
      }
      
      return (
        <Line
          x1={lastDot.x}
          y1={lastDot.y}
          x2={currentPosition.x}
          y2={currentPosition.y}
          stroke={error ? "#FF3B30" : LINE_COLOR}
          strokeWidth="4"
          strokeLinecap="round"
          opacity={0.6}
        />
      );
    }
    return null;
  };

  const handleLayout = (event: LayoutChangeEvent, index: number) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    dotCoordinates.current[index] = {
      x: x + width / 2,
      y: y + height / 2,
    };
  };

  return (
    <View style={[styles.container, style]} {...panResponder.panHandlers}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        {renderLines()}
        {renderLiveLine()}
      </Svg>
      <View style={styles.dotGrid}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const isActive = activeDots.includes(index);
          return (
            <View
              key={index}
              style={styles.dotContainer}
              onLayout={(event) => handleLayout(event, index)}
            >
              <View style={[styles.dot, isActive && styles.activeDot]}>
                {isActive && (
                  <View
                    style={[
                      styles.innerActiveDot,
                      { backgroundColor: error ? "#FF3B30" : ACTIVE_DOT_COLOR },
                    ]}
                  />
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CONTAINER_SIZE,
    height: CONTAINER_SIZE,
    alignSelf: "center",
  },
  dotGrid: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dotContainer: {
    width: `${100 / GRID_SIZE}%`,
    height: `${100 / GRID_SIZE}%`,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: DOT_COLOR,
  },
  activeDot: {
    width: ACTIVE_DOT_SIZE,
    height: ACTIVE_DOT_SIZE,
    borderRadius: ACTIVE_DOT_SIZE / 2,
    backgroundColor: "rgba(0, 122, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  innerActiveDot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: ACTIVE_DOT_COLOR,
  },
});

export default PatternLock;
