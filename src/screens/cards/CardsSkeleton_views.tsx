import { StyleSheet, View } from "react-native";
import { commonStyles } from "../../components/CommonStyles";


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
export const CardShowPinLoader = () => {
    const html = <View>
        <View style={{ marginLeft: "auto", marginRight: "auto" }}>
            <View style={{ ...styles.textSkeleton, height: 80, width: 100, marginTop: 8, borderRadius: 5, }} />
        </View>
        <View style={{ ...styles.textSkeleton, height: 40, width: "100%", marginTop: 20, borderRadius: 5, }} />
        <View style={{ ...styles.textSkeleton, height: 40, width: "100%", marginTop: 15, borderRadius: 5, }} />
    </View>;
    return html;
};
export const CardViewtotalLoader = () => {
    const html = <View>
        <View style={{ ...styles.textSkeleton, height: 180, width: "100%", marginBottom: 32, borderRadius: 32, }} />

        <View style={{ ...styles.textSkeleton, height: 24, width: 200, borderRadius: 8, marginBottom: 8 }} />
        <View style={{ ...styles.textSkeleton, height: 60, width: "100%", borderRadius: 8, marginBottom: 32 }} />
        <View style={{ ...styles.textSkeleton, height: 24, width: 200, borderRadius: 8, marginBottom: 22 }} />
        <View style={{ flexDirection: "row", gap: 10, justifyContent: "space-between", marginBottom: 20, }}>
            <View>
                <View style={{ ...styles.textSkeleton, height: 80, width: 80, borderRadius: 80 / 2, }} />
                <View style={{ ...styles.textSkeleton, height: 24, width: "100%", borderRadius: 5, marginTop: 8, }} />
            </View>
            <View>
                <View style={{ ...styles.textSkeleton, height: 80, width: 80, borderRadius: 80 / 2, }} />
                <View style={{ ...styles.textSkeleton, height: 24, width: "100%", borderRadius: 5, marginTop: 8, }} />
            </View>
            <View>
                <View style={{ ...styles.textSkeleton, height: 80, width: 80, borderRadius: 80 / 2, }} />
                <View style={{ ...styles.textSkeleton, height: 24, width: "100%", borderRadius: 5, marginTop: 8, }} />
            </View>
        </View>
        <View style={{ flexDirection: "row", gap: 10, justifyContent: "space-between", marginBottom: 34, }}>
            <View>
                <View style={{ ...styles.textSkeleton, height: 80, width: 80, borderRadius: 80 / 2, }} />
                <View style={{ ...styles.textSkeleton, height: 24, width: "100%", borderRadius: 5, marginTop: 8, }} />
            </View>
            <View>
                <View style={{ ...styles.textSkeleton, height: 80, width: 80, borderRadius: 80 / 2, }} />
                <View style={{ ...styles.textSkeleton, height: 24, width: "100%", borderRadius: 5, marginTop: 8, }} />
            </View>
            <View>
                <View style={{ ...styles.textSkeleton, height: 80, width: 80, borderRadius: 80 / 2, }} />
                <View style={{ ...styles.textSkeleton, height: 24, width: "100%", borderRadius: 5, marginTop: 8, }} />
            </View>
        </View>
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
export const ToBeReViewLoader = () => {
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
    </View>;
    return html;
};
export const CardsHomeBalance = () => {
    const html = <View>
        <View style={{ ...styles.dflex, gap: 20 }}>
            <View style={{ ...styles.textSkeleton, height: 32, width: 200, borderRadius: 5, }} />
            <View style={{ ...styles.textSkeleton, height: 32, width: 200, borderRadius: 5, }} />
        </View>
        <View style={{ ...styles.textSkeleton, height: 26, width: 200, marginTop: 34, borderRadius: 5, marginBottom: 34, }} />
        <View style={{ flexDirection: "row", gap: 16, justifyContent: "center", marginBottom: 34, }}>
            <View>
                <View style={{ ...styles.textSkeleton, height: 80, width: 80, borderRadius: 80 / 2, }} />
                <View style={{ ...styles.textSkeleton, height: 24, width: "100%", borderRadius: 5, marginTop: 8, }} />
            </View>
            <View>
                <View style={{ ...styles.textSkeleton, height: 80, width: 80, borderRadius: 80 / 2, }} />
                <View style={{ ...styles.textSkeleton, height: 24, width: "100%", borderRadius: 5, marginTop: 8, }} />
            </View>
            <View>
                <View style={{ ...styles.textSkeleton, height: 80, width: 80, borderRadius: 80 / 2, }} />
                <View style={{ ...styles.textSkeleton, height: 24, width: "100%", borderRadius: 5, marginTop: 8, }} />
            </View>
        </View>
        <View style={{ ...styles.textSkeleton, height: 24, width: "100%", borderRadius: 5, }} />
        <View style={{ ...styles.textSkeleton, height: 84, width: "100%", marginTop: 16, borderRadius: 8, }} />
        <View style={{ ...styles.textSkeleton, height: 84, width: "100%", marginTop: 16, borderRadius: 8, }} />
        <View style={{ ...styles.textSkeleton, height: 84, width: "100%", marginTop: 16, borderRadius: 8, marginBottom: 34, }} />
        <View style={{ ...styles.dflex, gap: 20, justifyContent: "space-between" }}>
            <View style={{ ...styles.textSkeleton, height: 24, width: 100, borderRadius: 5, }} />
            <View style={{ ...styles.textSkeleton, height: 24, width: 100, borderRadius: 5, }} />
        </View>
        <View style={{ ...styles.textSkeleton, height: 84, width: "100%", marginTop: 16, borderRadius: 8, }} />
        <View style={{ ...styles.textSkeleton, height: 84, width: "100%", marginTop: 16, borderRadius: 8, }} />
        <View style={{ ...styles.textSkeleton, height: 84, width: "100%", marginTop: 16, borderRadius: 8, }} />
        <View style={{ ...styles.textSkeleton, height: 84, width: "100%", marginTop: 16, borderRadius: 8, }} />
        <View style={{ ...styles.textSkeleton, height: 84, width: "100%", marginTop: 16, borderRadius: 8, }} />
        <View style={{ ...styles.textSkeleton, height: 84, width: "100%", marginTop: 16, borderRadius: 8, }} />
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
    const html = <View>
        {countList.map((item) => (
            <View key='item' style={{ ...styles.textSkeleton, width: 240, height: 230, borderRadius: 15 }} />))}
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
        {countList.map((item) => (
            <View key='item' style={{ ...styles.textSkeleton, width: "100%", height: 27, borderRadius: 5, marginTop: 10 }} />))}
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
const styles = StyleSheet.create({
    dflex: {
        flexDirection: "row",
    },
    container: {
        padding: 16,
        backgroundColor: '#FFFFFF',
    },
    textSkeleton: {
        height: 16,
        width: '50%',
        marginBottom: 8,
        backgroundColor: '#E1E1E1',
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
});
