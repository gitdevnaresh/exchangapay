import React from "react";
import { StyleSheet, View } from "react-native";
import { s } from "../../newComponents/theme/scale";

export const ProfileUIDLoader = (NEW_COLOR: any) => {
    const skeltonStyles = StyleSheet.create({
        textSkeleton: {
            backgroundColor: NEW_COLOR.SKELETON_SECONDARY,
        },
    });
    const html = <View style={{ flexDirection: "row", alignItems: "center", justifyContent:"center" }}>
        <View style={{ ...skeltonStyles.textSkeleton, height: s(17), width: s(20), borderRadius: s(4), marginLeft: s(8) }} />
        <View style={{ ...skeltonStyles.textSkeleton, height: s(17), width: s(70), borderRadius: s(4), marginLeft: s(4), marginRight: s(4) }} />
        <View style={{ ...skeltonStyles.textSkeleton, height: s(17), width: s(16), borderRadius: s(4) }} />
    </View>;
    return html;
};
export const SecurityLevelLoader = (NEW_COLOR: any) => {
    const skeltonStyles = StyleSheet.create({
        textSkeleton: {
            backgroundColor: NEW_COLOR.SKELETON_SECONDARY,
        },
    });
    const html = <View style={{ ...skeltonStyles.textSkeleton, height: s(14), width: s(50), borderRadius: s(4) }} />;
    return html;
};
export const CardOptionSkeleton = (
  NEW_COLOR: Record<string, string>,
  commonStyles: Record<string, any>
) => (
  <View
    style={[
      commonStyles.sectionBordered,
      commonStyles.dflex,
      commonStyles.alignCenter,
      commonStyles.rounded12,
      {
        backgroundColor: NEW_COLOR.CARD_BG,
        borderColor: NEW_COLOR.SECTION_BORDER,
        padding: 12,
        minHeight: 24, // matches real option height
        marginBottom: 12,
      },
    ]}
  >
    <View
      style={[
        commonStyles.radioInactive,
        commonStyles.alignCenter,
        commonStyles.justifyCenter,
        {
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          backgroundColor: NEW_COLOR.RADIO_BG,
        },
      ]}
    />
    <View style={[commonStyles.ml16, { flex: 1 }]}>
      <View
        style={{
          height: 16, // matches title font size
          width: 120,
          borderRadius: 6,
          backgroundColor: NEW_COLOR.SKELETON_PRYMARY,
          marginBottom: 6,
        }}
      />
      <View
        style={{
          height: 14, // matches description font size
          width: 200,
          borderRadius: 6,
          backgroundColor: NEW_COLOR.SKELETON_SECONDARY,
        }}
      />
    </View>
  </View>
);
