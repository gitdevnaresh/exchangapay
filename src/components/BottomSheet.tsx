import React, { useState, useEffect, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import { View, Image, Animated, TouchableOpacity, TouchableWithoutFeedback, StatusBar, Platform, Keyboard, StyleSheet } from 'react-native';
import { useKeyboard } from '../hooks';
import { NEW_COLOR, WINDOW_HEIGHT } from '../constants/theme/variables';
import icons from '../assets/icons';

interface PropTypes {
  fullScreen: any,
  isVisible: any,
  hideBottomList: any,
  hasCloseButton: any,
  hideBottomSheet: any,
  backgroundColor: any,
  navigationColor: any,
  outsideColor: any,
  children: any,
  screenHeight: any,
  styleCloseBtnCtn: any
}
const BottomSheet = ({
  isVisible = false,
  hasCloseButton = false,
  fullScreen = false,
  hideBottomSheet = false,
  hideBottomList = false,
  backgroundColor = NEW_COLOR.BACKGROUND_PRIMARY_1,
  navigationColor = NEW_COLOR.BACKGROUND_WHITE,
  outsideColor = 'transparent',
  children,
  screenHeight = WINDOW_HEIGHT,
  styleCloseBtnCtn,
}: PropTypes) => {
  const insets = useSafeAreaInsets();
  const heightKeyboard = useKeyboard();
  const [height, setHeight] = useState(screenHeight);
  const [alignment] = useState(new Animated.Value(0));

  const handleBringUp = useCallback(() => {
    Animated.timing(alignment, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [alignment]);

  const handleHide = useCallback(() => {
    Animated.timing(alignment, {
      toValue: 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [alignment]);

  const bottomSheetIntropolate = alignment.interpolate({
    inputRange: [0, 1],
    outputRange: [-height, 0],
  });

  const bottomSheetRange = {
    bottom: bottomSheetIntropolate,
  };

  const handleGestureHandler = (e: any) => {
    if (e.nativeEvent.contentOffset.y > 0) {
      handleBringUp();
    } else if (e.nativeEvent.contentOffset.y < 0) {
      handleHide();
      hideBottomSheet();
      Keyboard.dismiss();
    }
  };

  useEffect(() => {
    if (isVisible) {
      handleBringUp();
    } else {
      handleHide();
      Keyboard.dismiss();
    }

    return () => { };
  }, [isVisible, handleHide, handleBringUp]);
  const handlePressWithoutFeedback = () => {
    handleHide();
    hideBottomSheet();
  };

  const handlePress = () => {
    handleHide();
    hideBottomSheet();
  };
  const handleGesture = (e: any) => {
    handleGestureHandler(e);
  };
  const handleLayout = (e: any) => {
    if (!height) {
      setHeight(hasCloseButton
        ? e.nativeEvent?.layout?.height + 80
        : e.nativeEvent?.layout?.height + 21);
    }
  }

  return (
    <>
      {isVisible && (
        <TouchableWithoutFeedback onPress={handlePressWithoutFeedback}
        >
          <View style={[
            styles.bottomSheetOutside,
            { backgroundColor: outsideColor }]}
          />
        </TouchableWithoutFeedback>
      )}

      <Animated.View
        style={[
          { backgroundColor },
          styles.bottomSheet,
          bottomSheetRange,
        ]}
      >
        <ScrollView
          scrollEventThrottle={500}
          onScroll={(e) => { handleGesture(e) }}
          contentContainerStyle={{ flexGrow: 1, height: 21 }}
        >
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <View style={[
              styles.navigationButton,
              { backgroundColor: navigationColor }]}
            />
          </View>
        </ScrollView>

        <Animated.View
          onLayout={(e) => { handleLayout(e) }}
          style={[styles.listBottomSheetItem,
          { maxHeight: height - 31 - (Platform.OS === 'android' ? StatusBar.currentHeight : insets?.top) },
          fullScreen ? {
            height: height - 31 - (Platform.OS === 'android' ? StatusBar.currentHeight : insets?.top),
          } : null,
          heightKeyboard ? {
            height: height - 31 - (Platform.OS === 'android' ? StatusBar.currentHeight : insets?.top) - heightKeyboard,
          } : null,
          hideBottomList ? { paddingBottom: 0 } : null,
          { paddingBottom: insets.bottom ? 17 : 8 },
          ]}
        >
          {children}
          {hasCloseButton && (
            <View style={[styles.closeBtnContainer, styleCloseBtnCtn]}>
              <TouchableOpacity onPress={handlePress}
              >
                <View style={styles.closeBtn}>
                  <Image source={icons.closeBlack} style={styles.closeBtnIcon} />
                </View>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </>
  );
};

export default BottomSheet;
const styles = StyleSheet.create({
  bottomSheetOutside: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    marginHorizontal: 10,
    shadowColor: 'rgba(0,0,0,0.25)',
    shadowOffset: {
      width: 30,
      height: 30,
    },
    shadowRadius: 60,
    shadowOpacity: 1,
    elevation: 2,
  },
  navigation: {
  },
  navigationButton: {
    width: 60,
    height: 5,
    borderRadius: 2.5,
  },
  listBottomSheetItem: {
    flex: 1,
  },
  closeBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NEW_COLOR.BACKGROUND_LIGHT_1,
  },
  closeBtnIcon: {
    width: 15,
    height: 15,
  },
  closeBtnContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});


