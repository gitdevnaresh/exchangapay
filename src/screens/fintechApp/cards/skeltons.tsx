
import { StyleSheet, View } from "react-native";
import { getThemedCommonStyles } from "../../../components/CommonStyles";
import { WINDOW_WIDTH } from "../../../constants/styels/variables";
import { s } from "../../../constants/styels/scale";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";
const NEW_COLOR = useThemeColors();
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
export const ProfileDrawerInfoLoader = () => {
    const html = (
        <View style={[commonStyles.alignCenter, commonStyles.gap6, commonStyles.dflex, commonStyles.mt16]}>
            {/* Image Skeleton - Reduced height and width */}
            <View style={{
                ...styles.textSkeleton,
                width: s(35), // Reduced from s(45)
                height: s(35), // Reduced from s(45)
                borderRadius: s(35) / 2,
                marginBottom: 0, // Resetting default marginBottom from circularSkeleton
            }} />
            <View style={[commonStyles.flex1]}>
                {/* Name Skeleton - Reduced height and bottom margin */}
                <View style={{
                    ...styles.textSkeleton,
                    height: s(16), // Reduced from s(20)
                    width: '70%', // Adjust width as needed
                    borderRadius: s(4),
                    marginBottom: s(2), // Reduced from s(4)
                }} />
                {/* Ref ID Skeleton - Reduced height */}
                <View style={{
                    ...styles.textSkeleton,
                    height: s(12), // Reduced from s(16)
                    width: '90%', // Adjust width as needed
                    borderRadius: s(4),
                }} />
            </View>
        </View>
    );
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
        {countList.map((item) => (
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: s(60), borderRadius: 8 }} />))}
    </View>;
    return html;
};
export const cardsInfoDetails = () => {
    const html = (
        <View style={[commonStyles.flex1]}>
            {/* Balance Section */}
            <View style={[commonStyles.alignCenter, { marginTop: s(15), marginBottom: s(20) }]}>
                <View style={[commonStyles.mb4]}>
                    <View style={{
                        ...styles.textSkeleton,
                        width: s(150), // Adjusted width
                        height: s(18), // Reduced height for title
                        borderRadius: s(4)
                    }} />
                </View>
                <View style={{
                    ...styles.textSkeleton,
                    width: s(200),
                    height: s(27),
                    borderRadius: s(4)
                }} />
            </View>
            <View style={[
                commonStyles.dflex,
                commonStyles.justifyAround,
                { marginBottom: s(30), paddingHorizontal: s(8) } // Increased marginBottom
            ]}>
                {['View', 'Top Up', 'Unfreeze'].map((_, index) => (
                    <View
                        key={`action-${index}`}
                        style={{
                            ...styles.textSkeleton,
                            width: s(100),
                            height: s(35),
                            borderRadius: s(24),
                            marginBottom: 0
                        }}
                    />
                ))}
            </View>

            {/* Manage Card Section Title */}
            <View style={[{ marginTop: s(20), marginBottom: s(10) }]}>
                <View style={[commonStyles.mb8, { paddingHorizontal: s(16) }]}>
                    <View style={{
                        ...styles.textSkeleton,
                        width: '40%', // Relative width
                        height: s(20), // Reduced height
                        borderRadius: s(4)
                    }} />
                </View>
            </View>

            {/* List Items (e.g., Limit, Supported Platform) */}
            {[1, 2].map((item) => (
                <View
                    key={`list-item-skel-${item}`}
                    style={[
                        commonStyles.dflex,
                        commonStyles.alignCenter,
                        commonStyles.gap10, // Added gap for consistency
                        { marginBottom: s(12), paddingHorizontal: s(16) } // Adjusted margin
                    ]}
                >
                    <View style={{ // Icon placeholder
                        ...styles.textSkeleton, // Using textSkeleton for color
                        width: s(32),
                        height: s(32),
                        borderRadius: s(16), // Circular
                        marginBottom: 0
                    }} />
                    <View style={[commonStyles.flex1, { marginLeft: s(10) }]}>
                        <View style={{
                            ...styles.textSkeleton,
                            width: '100%',
                            height: s(20), // Reduced height for text line
                            borderRadius: s(4),
                            marginBottom: 0
                        }} />
                    </View>
                </View>
            ))}

            {/* Add padding at the bottom to account for content below Manage Card section */}
            <View style={{ paddingBottom: s(30) }} />
        </View>
    );
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
        {countList.map((item) => (
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
export const FeeAndTotalReceiveSkeleton = () => {
    const html = (
        <View>
            <View style={[styles.dflex, { justifyContent: "space-between", }]}>
                <View style={{ ...styles.textSkeleton, width: '100%', borderRadius: 5, }} />
            </View>
            <View style={{ backgroundColor: styles.textSkeleton.backgroundColor, marginTop: s(10) }} />
            <View style={[styles.dflex, { justifyContent: "space-between", }]}>
                <View style={{ ...styles.textSkeleton, width: '100%', borderRadius: 5, }} />
            </View>
            <View style={{ height: s(8.5) }} />
        </View>
    );
    return html;
};
export const FeeUpgradeSkeleton = () => {
    const html = (
        <View>
            <View style={[commonStyles.sectionBorder]}>
                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.p14]}>
                    <View style={{ ...styles.textSkeleton, height: s(12), width: '40%', borderRadius: s(4), marginBottom: 0 }} />
                    <View style={{ ...styles.textSkeleton, height: s(14), width: '50%', borderRadius: s(4), marginBottom: 0 }} />
                </View>
                <View style={[commonStyles.hLine]} /> {/* Horizontal Line */}
                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.p14]}>
                    <View style={{ ...styles.textSkeleton, height: s(12), width: '40%', borderRadius: s(4), marginBottom: 0 }} />
                    <View style={{ ...styles.textSkeleton, height: s(14), width: '50%', borderRadius: s(4), marginBottom: 0 }} />
                </View>
                <View style={[commonStyles.hLine]} /> {/* Horizontal Line */}
                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.p14]}>
                    <View style={{ ...styles.textSkeleton, height: s(12), width: '45%', borderRadius: s(4), marginBottom: 0 }} />
                    <View style={{ ...styles.textSkeleton, height: s(14), width: '45%', borderRadius: s(4), marginBottom: 0 }} />
                </View>
                <View style={[commonStyles.hLine]} /> {/* Horizontal Line */}

                {/* Row 4: Available Balance */}
                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.p14]}>
                    <View style={{ ...styles.textSkeleton, height: s(12), width: '40%', borderRadius: s(4), marginBottom: 0 }} />
                    <View style={{ ...styles.textSkeleton, height: s(14), width: '50%', borderRadius: s(4), marginBottom: 0 }} />
                </View>
            </View>
        </View>
    );
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
        {countList.map((item, index) => (
            <View key={`skeleton-card-${index.toString()}`} style={{ ...styles.cardsbody, width: 240, height: s(180), borderRadius: 15 }} />))}
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
        {countList.map((item) => (
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
        {countList.map((item) => (
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
        <View style={[commonStyles.mb43]} />
        <View style={{ ...styles.textSkeleton, height: 220, width: "100%", borderRadius: 32, }} />
        <View style={[commonStyles.mb32]} />
        <View style={{ ...styles.textSkeleton, height: 164, width: "100%", borderRadius: 12, }} />
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
        <View style={{ ...styles.rectangularSkeleton, height: 80, width: "100%", borderRadius: 12, marginBottom: 4 }} />
        <View style={{ ...styles.rectangularSkeleton, height: 160, width: "100%", borderRadius: 12, }} />
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
        {countList.map((item) => (
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
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 55, borderRadius: 10, marginBottom: 16 }} />))}
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
        {countList.map((item) => (
            <View key='item' style={{ ...styles.textSkeleton, width: '100%', height: 48, borderRadius: 6, marginBottom: 6 }} />))}
    </View>;
    return html;
};

export const AssignCardListSkeltons = () => {
    const html = (
        <View>
            <View style={[styles.dflex, { justifyContent: "space-between", }]}>
                <View style={{ ...styles.textSkeleton, width: '100%', borderRadius: 5, height: s(40) }} />
            </View>
            <View style={{ backgroundColor: styles.textSkeleton.backgroundColor, marginTop: s(10) }} />
            <View style={[styles.dflex, { justifyContent: "space-between", }]}>
                <View style={{ ...styles.textSkeleton, width: '100%', borderRadius: 5, height: s(40) }} />
            </View>
            <View style={{ backgroundColor: styles.textSkeleton.backgroundColor, marginTop: s(10) }} />
            <View style={[styles.dflex, { justifyContent: "space-between", }]}>
                <View style={{ ...styles.textSkeleton, width: '100%', borderRadius: 5, height: s(40) }} />
            </View>
            <View style={{ backgroundColor: styles.textSkeleton.backgroundColor, marginTop: s(10) }} />
            <View style={[styles.dflex, { justifyContent: "space-between", }]}>
                <View style={{ ...styles.textSkeleton, width: '100%', borderRadius: 5, height: s(40) }} />
            </View>
            <View style={{ height: s(8.5) }} />
        </View>
    );
    return html;
};

const styles = StyleSheet.create({
    dflex: {
        flexDirection: "row",
    },
    container: {
        padding: 16,
        backgroundColor: "#ECF1F7",
    },


    textSkeleton: {
        height: 20,
        width: '50%',
        marginBottom: 8,
        backgroundColor: NEW_COLOR.SHIMMER_LOADERCOLOR,



    },




    cardsbody: {
        height: 20,
        width: '50%',
        marginBottom: 0,
        backgroundColor: "#ECF1F7",
    },
    rectangularSkeleton: {
        height: 80,
        width: '100%',
        marginBottom: 16,
        backgroundColor: "#ECF1F7",
    },
    circularSkeleton: {
        height: 50,
        width: 50,
        borderRadius: 25,
        marginBottom: 16,
        backgroundColor: "#ECF1F7",
    },
    imageSkeleton: {
        height: 200,
        width: '100%',
        marginBottom: 16,
        backgroundColor: "#ECF1F7",
    },
    horizontalLineSkeleton: {
        height: 1,
        width: '100%',
        marginBottom: 16,
        backgroundColor: "#ECF1F7",
    },
    verticalLineSkeleton: {
        height: 80,
        width: 1,
        marginBottom: 16,
        backgroundColor: "#ECF1F7",
    },
});
