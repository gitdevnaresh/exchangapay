import { StyleSheet, View } from "react-native";
import { WINDOW_WIDTH } from "../constants/styels/variables";
import { useThemeColors } from "../hooks/themedHook/useThemeColors";
import { getThemedCommonStyles } from "../components/CommonStyles";
import { ms } from "../components/theme/scale";

export const addressBookFiatCryptoGridSk = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View>
        {countList.map((item) => (
            <View key={item} style={{ ...styles.textSkeleton, width: '100%', height: 45, borderRadius: 6, marginBottom: 26 }} />))}
    </View>;
    return html;
};
export const CrptoPayeeViewSkeltons = () => {
    const html = <View >
        <View style={{ ...styles.rectangularSkeleton, height: 160, width: "100%", borderRadius: 12, }} />
        <View style={{ ...styles.textSkeleton, height: WINDOW_WIDTH / 2, width: WINDOW_WIDTH / 2, borderRadius: 5, marginTop: 24, marginLeft: "auto", marginRight: "auto" }} />
        <View style={{ ...styles.textSkeleton, height: 24, width: "40%", borderRadius: 5, marginTop: 24, marginLeft: "auto", marginRight: "auto" }} />
        <View style={{ ...styles.textSkeleton, height: 56, width: WINDOW_WIDTH - 100, borderRadius: 32, marginTop: 70, marginLeft: "auto", marginRight: "auto" }} />
    </View>;
    return html;
};
export const addressBookCryptoCoinSelect = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View>
        {countList.map((item) => (
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 45, borderRadius: 6, marginBottom: 26 }} />))}
    </View>;
    return html;
};
const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#ECF1F7',
    },
    textSkeleton: {
        height: 16,
        width: '50%',
        marginBottom: 8,
        backgroundColor: '#ECF1F7',
    },
    rectangularSkeleton: {
        height: 80,
        width: '100%',
        marginBottom: 16,
        backgroundColor: '#ECF1F7',
    },
    circularSkeleton: {
        height: 50,
        width: 50,
        borderRadius: 25,
        marginBottom: 16,
        backgroundColor: '#ECF1F7',
    },
    imageSkeleton: {
        height: 200,
        width: '100%',
        marginBottom: 16,
        backgroundColor: '#ECF1F7',
    },
    horizontalLineSkeleton: {
        height: 1,
        width: '100%',
        marginBottom: 16,
        backgroundColor: '#ECF1F7',
    },
    verticalLineSkeleton: {
        height: 80,
        width: 1,
        marginBottom: 16,
        backgroundColor: '#ECF1F7',
    },
});



export const recipientSummaryLoader = (count: number) => {
    const NEW_COLOR = useThemeColors();
     const commonStyles = getThemedCommonStyles(NEW_COLOR);
    
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList?.push(i)
        }
    }
    const html = <View >
        {countList?.map((index) => (
          <View  key={index} style={[commonStyles.kpibg, { width: '100%', height: ms(2), borderRadius: ms(12),  marginBottom: ms(-10), }]} />))}
    </View>;
    return html;
};