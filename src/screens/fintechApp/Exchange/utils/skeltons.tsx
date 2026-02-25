import { StyleSheet, View } from "react-native";
import { NEW_COLOR } from "../../../../constants/styels/variables";
import { ms, s } from "../../../../constants/styels/scale";

export const MinMAxLoader = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View>
        {countList.map((item) => (
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: ms(1.5), borderRadius: ms(6), marginTop: ms(1.5) }} />))}
    </View>;
    return html;


};
export const AvilableLoader = () => {
    const html = <View style={{}}>
        <View style={{ ...styles.avilabletextSkeleton, width: s(200), height: s(36), borderRadius: s(20) }} />
    </View>;
    return html;
};
const styles = StyleSheet.create({
    textSkeleton: {
        height: ms(5),
        width: '50%',
        marginBottom: 8,
    },

    avilabletextSkeleton: {
        backgroundColor: NEW_COLOR.SHIMMER_LOADERCOLOR,
    },

})
