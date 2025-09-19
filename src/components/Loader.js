import React from "react";
import { View, StyleSheet } from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

const Loadding = (props) => {
  const { imageStyle, imageVisiable } = props;
  return (
    <SkeletonPlaceholder speed={1000}>
      <View style={styles.imageCon}>
        <View style={styles.image} />
        <View style={styles.subView}>
          <View style={styles.name} />
          <View style={styles.time} />
        </View>
      </View>
      <View style={styles.bottomView}>
        <View style={styles.postTxt} />
        <View style={styles.postTxt} />
        <View style={styles.postTxt} />
        {imageVisiable && <View style={[styles.postImage, imageStyle]} />}
      </View>
    </SkeletonPlaceholder>
  );
};

const styles = StyleSheet.create({
  imageCon: {
    flexDirection: "row",
    alignItems: "center",
  },
  subView: { marginLeft: 20 },
  image: {
    width: 60,
    height: 60,
    borderRadius: 50,
  },
  name: {
    width: 150,
    height: 20,
    borderRadius: 4,
  },
  time: {
    marginTop: 5,
    width: 100,
    height: 20,
    borderRadius: 4,
  },
  bottomView: { marginTop: 10, marginBottom: 20 },
  postTxt: {
    width: "90%",
    height: 20,
    borderRadius: 4,
    marginTop: 5,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 4,
    marginTop: 15,
  },
});

export default Loadding;
