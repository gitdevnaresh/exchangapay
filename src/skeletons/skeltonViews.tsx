import { StyleSheet, View } from "react-native";
import { s } from "../constants/styels/scale";
import { NEW_COLOR } from "../constants/styels/variables";

export const transactionCard = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View >
        {countList.map((index) => (
            <View key={index} style={{ ...styles.textSkeleton, width: '100%', height: s(45), borderRadius: 8 }} />))}
    </View>;
    return html;
};

export const allTransactionList = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View>
        {countList.map((item, index) => (
            <View key={`all-tx-skeleton-${index}`} style={{ ...styles.textSkeleton, width: '100%', height: 55, borderRadius: 10, marginBottom: 16 }} />))}
    </View>;
    return html;
};
export const transactionsCard = () => {
    const html = <View style={{}}>
        <View style={{ ...styles.textSkeleton, width: "100%", height: 170, marginRight: 6, borderRadius: 10 }} />

    </View>;
    return html;
};
export const referralDetailsSkelton = () => {
    const html = <View style={{ ...styles.container, flexDirection: 'row' }}>
        <View style={{ ...styles.textSkeleton, width: '100%', height: 240, marginRight: 6, borderRadius: 10 }} />
    </View>;
    return html;
};
export const referralBtnSkelton = () => {
    const html = <View style={{ ...styles.container, flexDirection: 'row' }}>
        <View style={{ ...styles.textSkeleton, width: '100%', height: 50, marginRight: 6, borderRadius: 10 }} />
    </View>;
    return html;
};
export const kpisSkelton = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View style={{ marginTop: 0 }}>
        {countList.map((item) => (
            <View key={`kpi-skeleton-${item}`} style={{ ...styles.textSkeleton, width: '100%', height: 80, borderRadius: 10, marginBottom: 16 }} />))}
    </View>;
    return html;
};
export const reviewDetaislLoader = () => {
    const html = <View >
        <View style={{ ...styles.rectangularSkeleton, height: 300, width: "100%", marginTop: 40, borderRadius: 12, }} />
    </View>;
    return html;
};
export const assetsSkeltons = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View >
        {countList.map((item) => (
            <View key={`assets-skeleton-${item}`} style={{ ...styles.textSkeleton, width: '100%', height: s(49.5), borderRadius: 8 }} />))}
    </View>;
    return html;
};
export const homeAssetsSkeltons = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View >
        {countList.map((item) => (
            <View key={`home-assets-skeleton-${item}`} style={{ ...styles.textSkeleton, width: '100%', height: s(54), borderRadius: 8 }} />))}
    </View>;
    return html;
};
export const referalIDSkelton = () => {
    const html = <View style={{}}>
        <View style={{ ...styles.referaltextSkeleton, width: "100%", height: s(14), borderRadius: s(8) }} />
    </View>;
    return html;
};
export const ProductDetailSkeletons = () => {
    return (
        <View style={styles.ProductDetailscontainer}>
            <View style={[styles.skeleton, styles.imageSkeleton]} />
            <View style={[styles.skeleton, { width: '80%', height: s(24), marginTop: s(16) }]} />

            {/* Price */}
            <View style={[styles.skeleton, { width: '40%', height: s(30), marginTop: s(10) }]} />

            {/* Rating */}
            <View style={[styles.skeleton, { width: '30%', height: s(20), marginTop: s(10) }]} />

            {/* Horizontal Line */}
            <View style={[styles.skeleton, styles.horizontalLineSkeleton, { marginTop: s(10) }]} />

            {/* Category & Brand */}
            <View style={[styles.skeleton, { width: '50%', height: s(18), marginTop: s(10) }]} />
            <View style={[styles.skeleton, { width: '50%', height: s(18), marginTop: s(10) }]} />

            {/* Tabs */}
            <View style={[styles.skeleton, { width: '30%', height: s(16), marginTop: s(16) }]} />

            {/* Description */}
            <View style={[styles.skeleton, { width: '100%', height: s(14), marginTop: s(16) }]} />
            <View style={[styles.skeleton, { width: '100%', height: s(14), marginTop: s(8) }]} />
            <View style={[styles.skeleton, { width: '80%', height: s(14), marginTop: s(8) }]} />

            {/* Button */}
            <View style={[styles.skeleton, { width: '100%', height: s(40), marginTop: s(16) }]} />
        </View>
    );
};
export const cartSkeltons = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View>
        {countList.map((item) => (
            <View key={`cart-skeleton-${item}`} style={{ ...styles.textSkeleton, width: '100%', height: s(150), borderRadius: 10, marginBottom: 16 }} />))}
    </View>;
    return html;
};
export const referelSkelnot = () => {
    const html = <View>
        <View key='referel-skeleton-item' style={{ ...styles.textSkeleton, width: '100%', height: s(130), borderRadius: 10, marginBottom: 16 }} />
    </View>;
    return html;
};
const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#FFFFFF',
    },
    textSkeleton: {
        height: 16,
        width: '50%',
        marginBottom: 8,
        backgroundColor: NEW_COLOR.SHIMMER_LOADERCOLOR,
    },
    rectangularSkeleton: {
        height: 80,
        width: '100%',
        marginBottom: 16,
        backgroundColor: '#E1E1E1',
    },
    circularSkeleton: {
        height: 50,
        width: 50,
        borderRadius: 25,
        marginBottom: 16,
        backgroundColor: '#E1E1E1',
    },
    imageSkeleton: {
        height: s(340),
        width: '100%',
        marginBottom: 16,
        backgroundColor: NEW_COLOR.TEXT_BLACK,
    },
    horizontalLineSkeleton: {
        height: 1,
        width: '100%',
        marginBottom: 16,
        backgroundColor: NEW_COLOR.TEXT_BLACK,
    },
    verticalLineSkeleton: {
        height: 80,
        width: 1,
        marginBottom: 16,
        backgroundColor: '#E1E1E1',
    },
    skeleton: {
        backgroundColor: NEW_COLOR.TEXT_BLACK,
        borderRadius: 5,
    },
    ProductDetailscontainer: {
        padding: 16,
        backgroundColor: '#4b5363',
    },
    referaltextSkeleton: {
        backgroundColor: NEW_COLOR.SHIMMER_LOADERCOLOR,

    },
});