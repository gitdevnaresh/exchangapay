import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { useThemeColors } from "../../hooks/themedHook/useThemeColors";

interface LineProgressBarProps {
  progress: number;                 // e.g., 40 means 40%
  total: number;                    // e.g., 100
  height?: number;
  backgroundColor?: string;         // track color
  progressColor?: string;           // fill color
  startFrom?: number;               // <— NEW: start percentage in "total" units (e.g., 50)

  // timing controls
  firstStepPct?: number;            // where step 1 ends (default 50)
  firstStepDuration?: number;       // ms to reach firstStepPct from 0
  secondStepDelay?: number;         // ms pause between steps
  secondStepMsPerPercent?: number;  // duration per percent for step 2
}

const LineProgressBar: React.FC<LineProgressBarProps> = ({
  progress,
  total,
  height = 8,
  backgroundColor,
  progressColor,
  startFrom = 0,                    // <— NEW
  firstStepPct = 50,
  firstStepDuration = 3000,
  secondStepDelay = 300,
  secondStepMsPerPercent = 90,
}) => {
  const COLORS = useThemeColors();

  const clamp = (v: number) => Math.min(Math.max(v, 0), total);
  const targetPct = (clamp(progress) / total) * 100;
  const startPct  = (clamp(startFrom) / total) * 100;   // <— NEW
  const stepOneTarget = Math.min(firstStepPct, targetPct);

  // Start from startPct so step 2 can begin at 50%
  const animatedPct = useRef(new Animated.Value(startPct)).current; // <— CHANGED

  useEffect(() => {
    animatedPct.stopAnimation((current) => {
      const seq: Animated.CompositeAnimation[] = [];

      // Step 1: only if we still need to reach 50% from current/start
      const step1End = Math.max(stepOneTarget, startPct); // don’t animate back below start
      if (current < step1End) {
        const step1Distance = step1End - current;
        const durationStep1 =
          (firstStepDuration * step1Distance) / Math.max(firstStepPct, 1);

        seq.push(
          Animated.timing(animatedPct, {
            toValue: step1End,
            duration: Math.max(200, durationStep1),
            easing: Easing.linear,
            useNativeDriver: false,
          })
        );
      }

      // Step 2: from (>=50%) to target, if needed
      if (targetPct > step1End) {
        const delta = targetPct - Math.max(step1End, current);
        const durationStep2 = Math.max(250, delta * secondStepMsPerPercent);

        if (secondStepDelay > 0) seq.push(Animated.delay(secondStepDelay));
        seq.push(
          Animated.timing(animatedPct, {
            toValue: targetPct,
            duration: durationStep2,
            easing: Easing.linear,
            useNativeDriver: false,
          })
        );
      }

      if (seq.length) Animated.sequence(seq).start();
    });
  }, [
    targetPct,
    startPct,             // <— NEW dep
    stepOneTarget,
    firstStepPct,
    firstStepDuration,
    secondStepDelay,
    secondStepMsPerPercent,
    animatedPct,
  ]);

  return (
    <View
      style={[
        styles.container,
        { height, backgroundColor: backgroundColor ?? COLORS.INPUT_BG },
      ]}
    >
      <Animated.View
        style={[
          styles.progressBar,
          {
            width: animatedPct.interpolate({
              inputRange: [0, 100],
              outputRange: ["0%", "100%"],
            }),
            backgroundColor: progressColor ?? COLORS.BUTTON_BG,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: "100%", borderRadius: 10, overflow: "hidden" },
  progressBar: { height: "100%", borderRadius: 10 },
});

export default LineProgressBar;
