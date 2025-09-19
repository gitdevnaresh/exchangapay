import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

import { NEW_COLOR } from "../constants/theme/variables";
import Icons from "../assets/icons";

const CustomBottomTab = () => {
  return (
    <View style={[styles.container, styles.shadowProp]}>
      <TouchableOpacity style={styles.tabIcons}>
        <Image
          source={Icons.home}
          style={[
            styles.icon,
            {
              tintColor: NEW_COLOR.TEXT_WHITE,
            },
          ]}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.tabIcons}>
        <Image
          source={Icons.exchange}
          style={[
            styles.icon,
            {
              tintColor: NEW_COLOR.BOTTOM_TAB_ICON,
            },
          ]}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.tabIcons}>
        <Image
          source={Icons.transaction}
          style={[
            styles.icon,
            {
              tintColor: NEW_COLOR.BOTTOM_TAB_ICON,
            },
          ]}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    flexDirection: "row",
    position: "absolute",
    bottom: 24,
    backgroundColor: NEW_COLOR.SECTION_BG,
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 50,
  },
  tabIcons: {
    paddingHorizontal: 18,
  },
  shadowProp: {
    shadowOffset: { width: -2, height: 4 },
    shadowColor: "#171717",
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  icon: {
    width: 27,
    height: 27,
  },
});

export default CustomBottomTab;
