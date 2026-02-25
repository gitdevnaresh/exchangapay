import { StyleSheet, View } from "react-native";
import { s } from "../../constants/styels/scale";
import { NEW_COLOR } from "../../constants/styels/variables";

export const TotalCryptobalanceView = () => {
    const html = <View style={{ ...styles.container,flexDirection: "row" }}>
        <View style={{ ...styles.textSkeleton, height: 16, borderRadius: 4, width: 200, marginBottom: 10, marginLeft: "auto", marginRight: "auto" }} />
        <View style={{ ...styles.textSkeleton, height: 32, borderRadius: 4, width: 200, marginBottom: 10, marginLeft: "auto", marginRight: "auto" }} />
        <View style={{ ...styles.textSkeleton, height: 16, borderRadius: 4, width: 200, marginLeft: "auto", marginRight: "auto" }} />
    </View>;
    return html;
};
export const TotalCryptobalance = () => {
    const html = <View style={{ ...styles.container,flexDirection: "row" }}>
        <View style={{ ...styles.textSkeleton, height: 16, borderRadius: 4, width: 200, marginBottom: 10, marginLeft: "auto", marginRight: "auto" }} />
        <View style={{ ...styles.textSkeleton, height: 32, borderRadius: 4, width: 200, marginBottom: 10, marginLeft: "auto", marginRight: "auto" }} />
        <View style={{ ...styles.textSkeleton, height: 16, borderRadius: 4, width: 200, marginLeft: "auto", marginRight: "auto" }} />
    </View>;
    return html;
};
export const TotalPaymentsBalanceView = () => {
    const html = <View style={{ ...styles.container }}>
        <View style={{ ...styles.textSkeleton, height: 15, borderRadius: 4, width: 200, marginBottom: 10, marginLeft: "auto", marginRight: "auto" }} />
        <View style={{ ...styles.textSkeleton, height: 25, borderRadius: 4, width: 200, marginBottom: 10, marginLeft: "auto", marginRight: "auto" }} />
        <View style={{ ...styles.textSkeleton, height: 18, borderRadius: 4, width: 200, marginLeft: "auto", marginRight: "auto" }} />
    </View>;
    return html;
};
export const homeTotalbalanceView = () => {
    return (<View style={{ ...styles.container }}>
        <View style={{ ...styles.textSkeleton, height: 16, borderRadius: 4, width: 200, marginBottom: 10, marginLeft: "auto", marginRight: "auto" }} />
        <View style={{ ...styles.textSkeleton, height: 30, borderRadius: 4, width: 200, marginBottom: 10, marginLeft: "auto", marginRight: "auto" }} />
        <View style={{ ...styles.textSkeleton, height: 16, borderRadius: 4, width: 200, marginLeft: "auto", marginRight: "auto" }} />
    </View>
    );
};
export const TotalCardsBalanceView = () => {
    const html = <View style={{ ...styles.container }}>
        <View style={{ ...styles.textSkeleton, height: 16, borderRadius: 4, width: 200, marginBottom: 10, marginLeft: "auto", marginRight: "auto" }} />
        <View style={{ ...styles.textSkeleton, height: 30, borderRadius: 4, width: 200, marginBottom: 10, marginLeft: "auto", marginRight: "auto" }} />
        <View style={{ ...styles.textSkeleton, height: 16, borderRadius: 4, width: 200, marginLeft: "auto", marginRight: "auto" }} />
    </View>;
    return html;
};
export const coinGraph = () => {
    const html = <View style={{ ...styles.container }}>
        <View style={{ ...styles.rectangularSkeleton, height: 300, width: "100%", borderRadius: 12, }} />
    </View>;
    return html;
};
export const accountDasboardBalance = () => {
    const html = <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ ...styles.textSkeleton, width: '100%', height: 90, marginRight: 6, borderRadius: 10 }} />
    </View>;

    return html;
};
export const accountcurosalCard = () => {
    const html = <View style={{ ...styles.container, flexDirection: 'row' }}>
        <View style={{ ...styles.textSkeleton, height: 180, marginRight: 6, borderRadius: 10 }} />
        <View style={{ ...styles.textSkeleton, height: 180, borderRadius: 10 }} />
    </View>;
    return html;
};
export const homedashboardCard = () => {
    return (
        <View style={{ ...styles.container, flexDirection: 'row' }}>
            <View style={{ ...styles.textSkeleton, width: '100%', height: s(220), marginRight: s(6), borderRadius: s(10) }} />
        </View>
    );
};
export const homeTotalAmtCard = () => {
    const html = <View style={{ ...styles.container, flexDirection: 'row' }}>
        <View style={{ ...styles.textSkeleton, width: '100%', height: 90, marginRight: 6, borderRadius: 10 }} />
    </View>;
    return html;
};



export const transactionCard = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View >
        {countList.map((item) => (
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 60, borderRadius: 8 }} />))}
    </View>;
    return html;
};
export const homeTransactionCard = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View style={{ marginTop: 20 }}>
        {countList.map((item) => (
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 60, borderRadius: 8 }} />))}
    </View>;
    return html;
};
export const homeNotifications = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View style={{ marginTop: 20 }}>
        {countList.map((item) => (
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 60, borderRadius: 8, marginBottom: 5 }} />))}
    </View>;
    return html;
};
export const allMarketsSketltons = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View>
        {countList.map((item) => (
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 60, borderRadius: 8, marginBottom: 5 }} />))}
    </View>;
    return html;
};
export const cryptoPortfolioLoader = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View style={{ ...styles.container, flexDirection: 'row' }}>
        {countList.map((item) => (
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 60, borderRadius: 8 }} />))}
    </View>;
    return html;
};
export const profileImageSkelton = () => {
    const html = <View style={{ ...styles.container, flexDirection: 'row' }}>
        <View style={{ ...styles.textSkeleton, width: 75, height: 75, borderRadius: 60, marginLeft: -14 }} />
    </View>;
    return html;
};
export const profileInfoLoader = () => {
    const html = <View style={{ flexDirection: "row", alignItems: "center"  }}>
        <View style={{ ...styles.textSkeleton, width: '100%', height: 200, marginRight: 6, borderRadius: 10 }} />
    </View>;

    return html;
};
export const newprofileInfoLoader = () => {
    const html = <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ ...styles.textSkeleton, width: '100%', height: s(121), marginRight: 6, borderRadius: 10}} />
    </View>;

    return html;
};
export const buyLoader = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View >
        {countList.map((item) => (
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 110, borderRadius: 8, marginBottom: 5 }} />))}
    </View>;
    return html;
};
export const cryptoBalanceCard = () => {
    const html = <View style={{ ...styles.container }}>
        <View style={{ ...styles.textSkeleton, height: 16, borderRadius: 4, width: '100%', marginBottom: 10 }} />
        <View style={{ ...styles.textSkeleton, height: 30, borderRadius: 4, width: '100%', marginBottom: 10 }} />
        <View style={{ ...styles.textSkeleton, height: 16, borderRadius: 4, width: '100%' }} />
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
export const Sample = () => {
    // Generate HTML dynamically based on the data
    const html = <View style={styles.container}>
        {/* Skeleton for text */}
        <View style={{ ...styles.textSkeleton }} />

        {/* Skeleton for rectangular box */}
        <View style={styles.rectangularSkeleton} />

        {/* Skeleton for circular shape */}
        <View style={styles.circularSkeleton} />

        {/* Skeleton for image */}
        <View style={styles.imageSkeleton} />

        {/* Skeleton for horizontal line */}
        <View style={styles.horizontalLineSkeleton} />

        {/* Skeleton for vertical line */}
        <View style={styles.verticalLineSkeleton} />
    </View>;


    return html;

};
export const feelistSkeltons = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View>
        {countList.map((item) => (
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 100, borderRadius: 6, marginBottom: 16 }} />))}
    </View>;
    return html;
};
export const homeTotalValueSkeleton = () => {
    const html = <View style={{ ...styles.container, flexDirection: 'row' }}>
        <View style={{ ...styles.textSkeleton, width: '100%', height: s(111), marginRight: 6, borderRadius: 10 }} />
    </View>;
    return html;
};
export const ValutsHomeTotalValueSkeleton = () => {
    const html = <View style={{ ...styles.container, flexDirection: 'row' }}>
        <View style={{ ...styles.textSkeleton, width: '100%', height: s(107), marginRight: 6, borderRadius: 10 }} />
    </View>;
    return html;
};
export const feetabskelton = () => {
    const html = <View style={{ flexDirection: "row", alignItems: "center" ,marginTop:5}}>
        <View style={{ ...styles.textSkeleton, width: '100%', height: 200, marginRight: 6, borderRadius: 10 }} />
    </View>;

    return html;
};
export const selectAccount = (count: number) => {
    let countList = [0];
    if (count) {
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View>
        {countList.map((item) => (
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 50, borderRadius: 6 }} />))}
    </View>;
    return html;
};
export const analyticsGraph = () => {
    const html = <View >
        <View style={{ ...styles.rectangularSkeleton, height: 110, width: "100%", borderRadius: 12, }} />
    </View>;
    return html;
};
export const homeanalyticsGraph = () => {
    const html = <View >
        <View style={{ ...styles.rectangularSkeleton, height: s(300), width: "100%", borderRadius: 12, }} />
    </View>;
    return html;
};
export const homeSpendingGraph = () => {
    const html = <View >
        <View style={{ ...styles.rectangularSkeleton, height: s(245), width: "100%", borderRadius: 12, }} />
    </View>;
    return html;
};
export const valutsProtoFolioStatusGraph = () => {
    const html = <View >
        <View style={{ ...styles.rectangularSkeleton, height: s(245.5), width: "100%", borderRadius: 12, }} />
    </View>;
    return html;
};
const styles = StyleSheet.create({
    container: {
        backgroundColor: NEW_COLOR.SHIMMER_LOADERCOLOR,
    },
    textSkeleton: {
        backgroundColor: NEW_COLOR.SHIMMER_LOADERCOLOR,
    },

    rectangularSkeleton: {
        height: 80,
        width: '100%',
        marginBottom: 16,
        backgroundColor: NEW_COLOR.SHIMMER_LOADERCOLOR,
    },
    circularSkeleton: {
        height: 50,
        width: 50,
        borderRadius: 25,
        marginBottom: 16,
        backgroundColor: '#E1E1E1',
    },
    imageSkeleton: {
        height: 200,
        width: '100%',
        marginBottom: 16,
        backgroundColor: '#E1E1E1',
    },
    horizontalLineSkeleton: {
        height: 1,
        width: '100%',
        marginBottom: 16,
        backgroundColor: '#E1E1E1',
    },
    verticalLineSkeleton: {
        height: 80,
        width: 1,
        marginBottom: 16,
        backgroundColor: '#E1E1E1',
    },
    cardContainer: {
        marginBottom: 10,
    },
    dflex: {
        flexDirection: "row",
    },
});
