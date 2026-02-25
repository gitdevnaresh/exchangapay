import { StyleSheet, View } from "react-native";

import { WINDOW_WIDTH } from "../constants/styels/variables";
import { s } from "../constants/styels/scale";
import { useThemeColors } from "../hooks/themedHook/useThemeColors";
import { getThemedCommonStyles } from "../components/CommonStyles";
const NEW_COLOR=useThemeColors();
 const commonStyles = getThemedCommonStyles(NEW_COLOR);


export const CardAvailableBalanceLoader = () => {
    const html = <View>
        <View style={{ marginLeft: "auto", marginRight: "auto" }}>
            <View style={{ ...styles.textSkeleton, height: 26, width: 200, marginTop: 40, borderRadius: 5, }} />
            <View style={{ ...styles.textSkeleton, height: 40, width: 200, marginTop: 8, borderRadius: 5, }} />
        </View>
        <View style={{ ...styles.textSkeleton, height: 60, width: "100%", marginTop: 20, borderRadius: 5, }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", marginTop: 15, borderRadius: 5, }} />
        <View style={{ ...styles.textSkeleton, height: 46, width: "100%", marginTop: 120, borderRadius: 5, }} />
    </View>;
    return html;
};
export const CardViewtotalLoader = () => {
    const html = <View>
        <View style={{ ...styles.textSkeleton, height: 190, width: "100%", marginTop: 20, borderRadius: 15, }} />
        <View style={{ ...styles.dflex, marginTop: 15, justifyContent: "center", }}>
            <View style={{ ...styles.textSkeleton, height: 60, width: 50, borderRadius: 8, }} />
            <View style={{ ...styles.textSkeleton, height: 60, width: 50, borderRadius: 8, marginHorizontal: 20 }} />
            <View style={{ ...styles.textSkeleton, height: 60, width: 50, borderRadius: 8, }} />
        </View>
    </View>;

    return html;
};
export const addNewAllCardsSk = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View style={{ marginTop: 20 }}>
        {countList.map(() => (
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 60, borderRadius: 8 }} />))}
    </View>;
    return html;
};
export const CoinsSelect = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View>
        {countList.map(() => (
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 60, borderRadius: 6, marginBottom: 26 }} />))}
    </View>;
    return html;
};
export const CardTopupLoader = () => {
    const html = <View>
        <View style={{ ...styles.textSkeleton, height: 190, width: "100%", marginTop: 20, borderRadius: 15, }} />
        <View style={{ ...styles.dflex, marginTop: 15, justifyContent: "center", }}>
            <View style={{ ...styles.textSkeleton, height: 40, width: '50%', borderRadius: 8, }} />
        </View>
        <View style={{ ...styles.dflex, marginTop: 15, justifyContent: "center", }}>
            <View style={{ ...styles.textSkeleton, height: 60, width: 50, borderRadius: 8, }} />
            <View style={{ ...styles.textSkeleton, height: 60, width: 50, borderRadius: 8, marginHorizontal: 20 }} />
        </View>
    </View>;

    return html;
};
export const CardsDetailsLoader = () => {
    const html = <View>
        <View style={{ ...styles.textSkeleton, height: 130, width: "100%", marginTop: 20, borderRadius: 15, }} />
        <View style={{ ...styles.dflex, marginTop: 12, justifyContent: "center", }}>
            <View style={{ ...styles.textSkeleton, height: 20, width: '50%', borderRadius: 8, }} />
        </View>
        <View style={{ ...styles.dflex, marginTop: 15, justifyContent: "center", }}>
            <View style={{ ...styles.textSkeleton, height: 60, width: 50, borderRadius: 8, }} />
            <View style={{ ...styles.textSkeleton, height: 60, width: 50, borderRadius: 8, marginHorizontal: 20 }} />
        </View>
    </View>;

    return html;
};
export const CardsHomeBalance = () => {
    const html = <View style={{ ...styles.container }}>
        <View style={{ ...styles.textSkeleton, height: 20, width: "100%", marginTop: 20, borderRadius: 5, }} />
        <View style={{ ...styles.textSkeleton, height: 40, width: "100%", borderRadius: 5, }} />
        <View style={{ ...styles.textSkeleton, height: 20, width: "100%", borderRadius: 5, }} />
    </View>;

    return html;
};
export const CardsHomeSetup = () => {
    const html = <View>

        <View style={{ ...styles.textSkeleton, height: 120, width: "100%", marginTop: 20, borderRadius: 15, }} />

    </View>;

    return html;
};
export const CardsLoader = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View style={{ flexDirection: "row", gap: 4 }}>
        {countList.map((item) => (
            <View key='item' style={{ ...styles.cardsbody, width: 240, height: 151, borderRadius: 15 }} />))}
    </View>;
    return html;
};
export const CardsSection = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View style={{ flexDirection: "row", gap: 4 }}>
        {countList.map((item) => (
            <View key={item} style={{ ...styles.cardsbody, width: s(300), height: s(181), borderRadius: 15 }} />))}
    </View>;
    return html;
};
export const vaultsLoader = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View style={{ flexDirection: "row", gap: 4 }}>
        {countList.map(() => (
            <View key='item' style={{ ...styles.textSkeleton, width: 240, height: 115, borderRadius: 15 }} />))}
    </View>;
    return html;
};
export const CardDetailsLoader = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View>
        {countList.map(() => (
            <View key='item' style={{ ...styles.textSkeleton, width: "100%", height: 27, borderRadius: 5, marginTop: 10 }} />))}
    </View>;
    return html;
};
export const AddressLoader = () => {
    const html = <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ ...styles.textSkeleton, width: '100%', height: 90, marginRight: 6, borderRadius: 10 }} />
    </View>;

    return html;
};
export const CardApplicationLoader = () => {
    const html = <View >
        <View style={{ ...styles.textSkeleton, height: 164, width: "100%", borderRadius: 12, }} />
        <View style={[commonStyles.mb32]} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />

    </View>;
    return html;
};
export const CardListLoader = () => {
    const html = <View >
        <View style={[commonStyles.mb43]} />
        <View style={{ ...styles.textSkeleton, height: 220, width: "100%", borderRadius: 20, }} />
        <View style={[commonStyles.mb32]} />
        <View style={{ ...styles.textSkeleton, height: 220, width: "100%", borderRadius: 20, }} />
        <View style={[commonStyles.mb32]} />
        <View style={{ ...styles.textSkeleton, height: 220, width: "100%", borderRadius: 20, }} />
        <View style={[commonStyles.mb32]} />
        <View style={{ ...styles.textSkeleton, height: 220, width: "100%", borderRadius: 20, }} />
        <View style={[commonStyles.mb32]} />
        <View style={{ ...styles.textSkeleton, height: 220, width: "100%", borderRadius: 20, }} />
        <View style={[commonStyles.mb32]} />
        <View style={{ ...styles.textSkeleton, height: 220, width: "100%", borderRadius: 20, }} />
        <View style={[commonStyles.mb32]} />
        <View style={{ ...styles.textSkeleton, height: 220, width: "100%", borderRadius: 20, }} />
        <View style={[commonStyles.mb32]} />
    </View>;
    return html;
};
export const WalletsReceiveLoader = () => {
    const html = <View >
        <View style={{ ...styles.textSkeleton, height: 46, width: "100%", borderRadius: 5, marginTop: 10, }} />
        <View style={{ ...styles.textSkeleton, height: WINDOW_WIDTH / 2, width: WINDOW_WIDTH / 2, borderRadius: 5, marginTop: 24, marginLeft: "auto", marginRight: "auto" }} />
        <View style={{ ...styles.textSkeleton, height: 24, width: WINDOW_WIDTH / 4, borderRadius: 5, marginTop: 24, marginLeft: "auto", marginRight: "auto" }} />
        <View style={{ ...styles.textSkeleton, height: 24, width: WINDOW_WIDTH - 100, borderRadius: 5, marginTop: 8, marginLeft: "auto", marginRight: "auto" }} />
        <View style={{ ...styles.textSkeleton, height: 24, width: WINDOW_WIDTH / 3, borderRadius: 5, marginTop: 24, }} />
        <View style={{ ...styles.textSkeleton, height: 24, width: WINDOW_WIDTH - 60, borderRadius: 5, marginTop: 4, }} />
        <View style={{ ...styles.textSkeleton, height: 24, width: WINDOW_WIDTH - 60, borderRadius: 5, marginTop: 4, }} />
        <View style={{ ...styles.textSkeleton, height: 24, width: WINDOW_WIDTH - 60, borderRadius: 5, marginTop: 4, }} />
        <View style={{ ...styles.textSkeleton, height: 24, width: WINDOW_WIDTH - 60, borderRadius: 5, marginTop: 4, }} />
        <View style={{ ...styles.textSkeleton, height: 56, width: WINDOW_WIDTH - 100, borderRadius: 32, marginTop: 24, marginLeft: "auto", marginRight: "auto" }} />
    </View>;
    return html;
};
export const WalletsDepositLoader = WalletsReceiveLoader;
export const MarketHeilightsLoader = () => {
    const html = <View >
        <View style={{ ...styles.textSkeleton, height: 25.5, width: WINDOW_WIDTH - 60, borderRadius: 5, marginTop: 4, }} />
        <View style={{ ...styles.textSkeleton, height: 25.5, width: WINDOW_WIDTH - 60, borderRadius: 5, marginTop: 4, }} />
        <View style={{ ...styles.textSkeleton, height: 25.5, width: WINDOW_WIDTH - 60, borderRadius: 5, marginTop: 4, }} />
        <View style={{ ...styles.textSkeleton, height: 25.55, width: WINDOW_WIDTH - 60, borderRadius: 5, marginTop: 4, }} />
        <View style={{ ...styles.textSkeleton, height: 27.55, width: WINDOW_WIDTH - 60, borderRadius: 5, marginTop: 4, }} />
    </View>;
    return html;
};
export const buyonecoincontent = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View >
        {countList.map((item) => (
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 30, borderRadius: 6, marginTop: 8 }} />))}
    </View>;
    return html;
};
export const buyCoinSelect = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View >
        {countList.map(() => (
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 30, borderRadius: 6, marginBottom: 26 }} />))}
    </View>;
    return html;
};
export const ExchangeCardViewLoader = () => {
    const html = <View>
        <View style={[commonStyles.mb32]} />
        <View style={{ ...styles.textSkeleton, height: 26, width: 150, borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />

    </View>;
    return html;
};
export const allAddressList = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View style={{ marginTop: 20 }}>
        {countList.map((item) => (
            <View key={item} style={{ ...styles.textSkeleton, width: '100%', height: 55, borderRadius: 10, marginBottom: 16 }} />))}
    </View>;
    return html;
};
export const CardToBeReViewLoader = () => {
    const html = <View>
        <View style={[commonStyles.mb32]} />
        <View style={{ ...styles.textSkeleton, height: 26, width: 250, borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
    </View>;
    return html;
};
export const CardFee = () => {
    const html = <View>
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        <View style={{ ...styles.textSkeleton, height: 26, width: "100%", borderRadius: 5, marginBottom: 16 }} />
        </View>;
    return html;
};
export const CardDetailsFieldLoader = () => {
    const html = <View>
        <View style={{ ...styles.textSkeleton, height: 37, width: "100%", borderRadius: 5, marginBottom: 10 }} />
        <View style={{ ...styles.textSkeleton, height: 37, width: "100%", borderRadius: 5, marginBottom: 10 }} />
        <View style={{ ...styles.textSkeleton, height: 37, width: "100%", borderRadius: 5, marginBottom: 10 }} />
        <View style={{ ...styles.textSkeleton, height: 37, width: "100%", borderRadius: 5, marginBottom: 10 }} />
        <View style={{ ...styles.textSkeleton, height: 37, width: "100%", borderRadius: 5, marginBottom: 10 }} />
        <View style={{ ...styles.textSkeleton, height: 37, width: "100%", borderRadius: 5, marginBottom: 10 }} />

    </View>;
    return html;
};
export const Sample = () => {
    const html = <View style={styles.container}>
        <View style={{ ...styles.textSkeleton }} />

        <View style={styles.rectangularSkeleton} />

        <View style={styles.circularSkeleton} />

        <View style={styles.imageSkeleton} />

        <View style={styles.horizontalLineSkeleton} />

        <View style={styles.verticalLineSkeleton} />
    </View>;

    return html;
};
export const commonVaultsSkeleton = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View>
        {countList.map(() => (
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 48, borderRadius: 6, marginBottom: 6 }} />))}
    </View>;
    return html;
};
const styles = StyleSheet.create({
    dflex: {
        flexDirection: "row",
    },
    container: {
        padding: 16,
        backgroundColor: '#ECF1F7',
    },
    textSkeleton: {
        height: 16,
        width: '50%',
        marginBottom: 8,
        backgroundColor: NEW_COLOR.SHIMMER_LOADERCOLOR,
    },
    cardsbody: {
        height: 16,
        width: '50%',
        marginBottom: 0,
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

