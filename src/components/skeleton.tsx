import { useStyleSheet } from "@ui-kitten/components";
import React from "react";
import { View, StyleSheet } from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

const Loadding = (props: any) => {
    const styles = useStyleSheet(skeletonStyles);
    return (
        <SkeletonPlaceholder
            backgroundColor="#3F3356"
            highlightColor="#f1f1f1"
            speed={800}
        >
            {props?.contenthtml}
            {!props?.contenthtml && <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ width: 60, height: 60, borderRadius: 50 }} />
                <View style={{ marginLeft: 20 }}>
                    <View style={{ width: 120, height: 20, borderRadius: 4 }} />
                    <View
                        style={{ marginTop: 6, width: 80, height: 20, borderRadius: 4 }}
                    />
                </View>
            </View>}
        </SkeletonPlaceholder>
    );
};

const skeletonStyles = StyleSheet.create({
    imageCon: {
        flexDirection: "row",
        alignItems: "center",
    },
    subView: { marginLeft: 20 },
    image: {
        width: (60),
        height: (60),
        borderRadius: (50),
    },
    name: {
        width: (150),
        height: (20),
        borderRadius: (4),
    },
    time: {
        marginTop: (5),
        width: (100),
        height: (20),
        borderRadius: (4),
    },
    bottomView: { marginTop: 10, marginBottom: 20 },
    postTxt: {
        width: "90%",
        height: (20),
        borderRadius: (4),
        marginTop: (5),
    },

    postImage: {
        width: "100%",
        height: (200),
        borderRadius: (4),
        marginTop: (15)
    },

});




export default Loadding;