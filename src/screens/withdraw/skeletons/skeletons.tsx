import { StyleSheet, View } from "react-native";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";

const NEW_COLOR = useThemeColors();
const commonStyles = getThemedCommonStyles(NEW_COLOR);

export const listSkeleton = () => {
    // Render 5 skeleton boxes for the list
    return (
        <View style={{ marginTop: 24 }}>
            {[...Array(5)].map((_, idx) => (
                <View key={idx} style={styles.skeletonBox}>
                    <View style={styles.iconSkeleton} />
                    <View style={styles.textContainer}>
                        <View style={styles.titleSkeleton} />
                        <View style={styles.subtitleSkeleton} />
                    </View>
                    <View style={styles.arrowSkeleton} />
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    skeletonBox: {
        width: 327,
        height: 52,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#23232A",
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 24,
        marginRight: 24,
        marginBottom: 16,
        backgroundColor: "#18181C",
        paddingHorizontal: 16,
    },
    iconSkeleton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#23232A",
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
        justifyContent: "center",
    },
    titleSkeleton: {
        width: 60,
        height: 14,
        borderRadius: 4,
        backgroundColor: "#23232A",
        marginBottom: 6,
    },
    subtitleSkeleton: {
        width: 40,
        height: 10,
        borderRadius: 4,
        backgroundColor: "#23232A",
    },
    arrowSkeleton: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: "#23232A",
        marginLeft: 12,
    },
});