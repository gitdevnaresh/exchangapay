import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { AppState } from "react-native";
import PatternLock from "../newComponents/pattren/pattrenCompoenent";
import PatternLockHelper from "../utils/patternLockHelper";
import { useThemeColors } from "../hooks/useThemeColors";

interface AppLockWrapperProps {
  children: React.ReactNode;
}

const AppLockWrapper: React.FC<AppLockWrapperProps> = ({ children }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isColdStart, setIsColdStart] = useState(true);
  const [isError, setIsError] = useState(false);
  const colors = useThemeColors();

  useEffect(() => {
    checkAppLockOnStartup();
    setupAppStateListener();
  }, []);

  const checkAppLockOnStartup = async () => {
    try {
      setIsChecking(true);
      const isPatternSet = await PatternLockHelper.isPatternSet();

      if (isPatternSet && isColdStart) {
        setIsLocked(true);
      }
    } catch (error) {
      console.error("Error checking app lock on startup:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const setupAppStateListener = () => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        // App was in background/killed and is coming to foreground
        if (
          AppState.currentState.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          if (!isColdStart) {
            const isPatternSet = await PatternLockHelper.isPatternSet();
            if (isPatternSet) {
              setIsLocked(true);
            }
          }
        }

        // App is going to background
        if (nextAppState.match(/inactive|background/)) {
          setIsColdStart(false);
        }
      }
    );

    return () => subscription?.remove();
  };

  const handlePatternComplete = async (pattern: number[]) => {
    try {
      const isValid = await PatternLockHelper.verifyPattern(pattern);

      if (isValid) {
        setIsError(false);
        setIsLocked(false);
        setIsColdStart(false);
      } else {
        // Pattern is wrong - show error feedback
        setIsError(true);
        console.log("Wrong pattern - try again");

        // Reset error state after a delay
        setTimeout(() => {
          setIsError(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Error verifying pattern:", error);
      setIsError(true);
    }
  };

  // Show loading while checking
  if (isChecking) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Checking app lock...
        </Text>
      </View>
    );
  }

  // Show pattern lock if app is locked
  if (isLocked) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.lockContainer}>
          <Text style={[styles.lockTitle, { color: colors.text }]}>
            Unlock App
          </Text>
          <Text
            style={[
              styles.lockSubtitle,
              { color: isError ? "#FF3B30" : colors.text },
            ]}
          >
            {isError
              ? "Wrong pattern, try again"
              : "Draw your pattern to unlock"}
          </Text>
          <PatternLock
            onPatternComplete={handlePatternComplete}
            error={isError}
          />
        </View>
      </View>
    );
  }

  // Show main app content
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  lockContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  lockTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  lockSubtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
    opacity: 0.8,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
    opacity: 0.8,
  },
});

export default AppLockWrapper;
