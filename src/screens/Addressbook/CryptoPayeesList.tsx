import React, { useEffect, useState, useCallback } from "react";
import {
    SafeAreaView,
    View,
    SectionList,
    TouchableOpacity,
    Dimensions,
    BackHandler
} from "react-native";
import { StyleService, useStyleSheet } from "@ui-kitten/components";
import AntDesign from "react-native-vector-icons/AntDesign";
import { sellCoinSelect } from "../Crypto/buySkeleton_views";
import { NEW_COLOR } from "../../constants/theme/variables";
import { commonStyles } from "../../components/CommonStyles";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import { Container } from "../../components";
import ErrorComponent from "../../components/Error";
import Loadding from "../../components/skeleton";
import NoDataComponent from "../../components/nodata";
import AddressbookService from "../../services/addressbook";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { isErrorDispaly } from "../../utils/helpers";
import { s } from "../../constants/theme/scale";
import TextInputField from "../../components/textInput";
import { CryptoPayee } from "./constants";
import useEncryptDecrypt from "../../hooks/useEncryption_Decryption";
import { IconRefresh } from "../../assets/svg";

const { width } = Dimensions.get("window");
const isPad = width > 600;

const CryptoPayeesList = (props: any) => {
    const styles = useStyleSheet(themedStyles);
    const [verifiedPayees, setVerifiedPayees] = useState<CryptoPayee[]>([]);
    const [unverifiedPayees, setUnverifiedPayees] = useState<CryptoPayee[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [page, setPage] = useState<number>(1);
    const [isMoreData, setIsMoreData] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [errormsg, setErrormsg] = useState<string>("");
    const skeletonLoader = sellCoinSelect(10);
    const navigation = useNavigation<any>();
    const { decryptAES } = useEncryptDecrypt()
    const isFocused = useIsFocused();

    useEffect(() => {
        const validSearch = searchQuery.trim();
        if (validSearch.length === 0 || validSearch.length >= 3) {
            setPage(1);
            setIsMoreData(true);
            setVerifiedPayees([]);
            setUnverifiedPayees([]);
            getAllPayees(1);
        }
    }, [searchQuery, isFocused]);

    useEffect(() => {
        const unsubscribe = navigation.addListener("blur", () => {
            setSearchQuery("");
        });
        return unsubscribe;
    }, [navigation]);

    const getAllPayees = async (currentPage: number) => {
        setLoading(true);
        try {
            const response: any = await AddressbookService.getAllCryptoPayees(searchQuery, currentPage, 10);
            if (response.ok && response.data?.data) {
                const newPayees = response.data.data;
                const newVerified: CryptoPayee[] = [];
                const newUnverified: CryptoPayee[] = [];
                newPayees?.map((payee: CryptoPayee) => {
                    if (payee.isEmailVerified) {
                        newVerified.push(payee);
                    } else {
                        newUnverified.push(payee);
                    }
                });
                if (currentPage === 1) {
                    setVerifiedPayees(newVerified);
                    setUnverifiedPayees(newUnverified);
                } else {
                    setVerifiedPayees(prev => [...prev, ...newVerified]);
                    setUnverifiedPayees(prev => [...prev, ...newUnverified]);
                }

                setIsMoreData(newPayees.length === 10);
                setPage(currentPage + 1);
                setErrormsg("");
            } else {
                setErrormsg(isErrorDispaly(response));
                setIsMoreData(false);
            }
        } catch (error: any) {
            setErrormsg(isErrorDispaly(error));
            setIsMoreData(false);
        }
        setLoading(false);
    };

    const loadMoreData = () => {
        if (!loading && isMoreData) {
            getAllPayees(page);
        }
    };

    const badgeColor: { [key: string]: string } = {
        approved: NEW_COLOR.BG_GREEN,
        completed: NEW_COLOR.BG_GREEN,
        pending: NEW_COLOR.BG_YELLOW,
        submitted: NEW_COLOR.BG_BLUE,
        failed: NEW_COLOR.BG_RED,
        fail: NEW_COLOR.BG_RED,
        rejected: NEW_COLOR.BG_RED,
        finished: NEW_COLOR.BG_GREEN,
        freezed: NEW_COLOR.TEXT_GREY,
        unfreezed: NEW_COLOR.BG_GREEN,
        cancelled: NEW_COLOR.BG_RED,
        inactive: NEW_COLOR.BG_RED,
        active: NEW_COLOR.BG_GREEN,
    };

    const goToPayeeDetails = (item: CryptoPayee) => {
        if (!item.isEmailVerified) {
            navigation.push("emailOtpVerification", {
                payeeId: item.id,
                isResend: true,
            });
        } else {
            navigation.navigate("payeeDetails", { payeeId: item.id });
        }
    };

    const renderPayeeItem = ({ item }: { item: CryptoPayee }) => (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => goToPayeeDetails(item)}
            style={{ marginBottom: s(8) }}
        >
            <View style={[commonStyles.dflex, styles.container]}>
                <View style={{ marginRight: s(12) }}>
                    <View style={styles.userBg}>
                        <AntDesign name="user" size={s(23)} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: s(2) }} />
                    </View>
                </View>
                <View style={[commonStyles.flex1]}>
                    <ParagraphComponent
                        text={decryptAES(item.favoriteName) || ""}
                        style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textBlack]}
                        numberOfLines={1}
                    />
                    <ParagraphComponent
                        text={`Currency - ${item.currency || ""}`}
                        style={[commonStyles.fs12, commonStyles.textGrey, { marginTop: s(4) }]}
                        numberOfLines={1}
                    />
                    <ParagraphComponent
                        text={`Network - ${item.network || ""}`}
                        style={[commonStyles.fs12, commonStyles.textGrey, { marginTop: s(4) }]}
                        numberOfLines={1}
                    />
                </View>
                {item?.state && (
                    <View style={[{}]}>
                        <View style={[styles.status, { backgroundColor: badgeColor[item.state.toLowerCase()] || NEW_COLOR.BG_GREEN }]}>
                            <ParagraphComponent
                                text={item.state}
                                style={[commonStyles.fw500, commonStyles.textAlwaysWhite, { fontSize: s(8) }]}
                                numberOfLines={1}
                            />
                        </View>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
        <ParagraphComponent
            text={title}
            style={[commonStyles.fs16, commonStyles.fw700, styles.sectionHeader, { color: NEW_COLOR.TEXT_BLACK }]}
        />
    );

    const handleBackPress = useCallback(() => {
        if (props.route?.params?.screenName === "withdraw") {
            navigation.navigate("Dashboard", {
                animation: "slid_from_left"
            })
        } else {
            navigation.navigate("DrawerModal", {
                animation: "slid_from_left"
            });

        }
        return true;
    }, [navigation]);


    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                handleBackPress();
                return true;
            }
        );
        return () => backHandler.remove();
    }, []);
    const handleCloseError = () => {
        setErrormsg("");
    };

    const sections = [];
    if (verifiedPayees.length > 0) {
        sections.push({ title: "Ready to Use", data: verifiedPayees });
    }
    if (unverifiedPayees.length > 0) {
        sections.push({ title: "Request to Email Verification", data: unverifiedPayees });
    };
    const handleRefresh = () => {
        setVerifiedPayees([]);
        setUnverifiedPayees([]);
        getAllPayees(1);
    };

    return (
        <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
            <Container style={commonStyles.container}>
                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.justifyContent]}>
                    <View style={[commonStyles.dflex, commonStyles.alignCenter, { marginBottom: s(16) }]}>
                        <TouchableOpacity onPress={handleBackPress} style={{ paddingRight: s(16) }}>
                            <AntDesign name="arrowleft" size={s(24)} color={NEW_COLOR.TEXT_BLACK} />
                        </TouchableOpacity>
                        <ParagraphComponent text="Whitelist Address" style={[commonStyles.fs20, commonStyles.fw800, { color: NEW_COLOR.TEXT_BLACK }]} />

                    </View>
                    <TouchableOpacity activeOpacity={0.6} onPress={handleRefresh}>
                        <IconRefresh height={s(24)} width={s(24)} />
                    </TouchableOpacity>
                </View>
                <View style={styles.searchHeader}>
                    <View style={styles.searchBox}>
                        <View style={styles.searchContainer}>
                            <TextInputField
                                inputStyle={isPad ? commonStyles.fs16 : commonStyles.fs18}
                                style={styles.borderNone}
                                placeholder="Search Whitelist Address"
                                onChangeText={setSearchQuery}
                                value={searchQuery}
                            />
                            <View style={styles.blackCircle}>
                                <AntDesign name="search1" size={s(16)} color={NEW_COLOR.TEXT_ALWAYS_WHITE} style={styles.searchIcon} />
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.addIconContainer} onPress={() => navigation.navigate("addPayee")}>
                        <AntDesign name="plus" size={s(24)} color={NEW_COLOR.TEXT_ALWAYS_WHITE} />
                    </TouchableOpacity>
                </View>
                {errormsg && <ErrorComponent message={errormsg} onClose={handleCloseError} /> || null}
                <SectionList
                    sections={sections}
                    renderItem={renderPayeeItem}
                    renderSectionHeader={renderSectionHeader}
                    keyExtractor={(item) => item.id}
                    onEndReached={loadMoreData}
                    onEndReachedThreshold={0.1}
                    ListFooterComponent={loading ? <Loadding contenthtml={skeletonLoader} /> : null}
                    ListEmptyComponent={!loading && sections.length === 0 ? <NoDataComponent /> : null}
                    stickySectionHeadersEnabled={false}
                />
            </Container>
        </SafeAreaView>
    );
};

export default CryptoPayeesList;

const themedStyles = StyleService.create({
    searchHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: s(16),
    },
    sectionHeader: {
        marginBottom: s(12),
        marginTop: s(8),
    },
    searchBox: {
        flex: 1,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: s(10),
        borderRadius: s(10),
        backgroundColor: NEW_COLOR.BG_BLACK,
        borderColor: NEW_COLOR.SEARCH_BORDER,
        borderWidth: 1,
        height: s(64),
        borderStyle: "dashed",
    },
    borderNone: {
        borderWidth: 0,
        flex: 1,
        color: NEW_COLOR.TEXT_ALWAYS_WHITE,
    },
    blackCircle: {
        backgroundColor: "#3F3356",
        borderRadius: s(108),
        height: s(36),
        width: s(36),
        justifyContent: "center",
        alignItems: "center",
    },
    addIconContainer: {
        backgroundColor: NEW_COLOR.BG_BLACK,
        borderRadius: s(108),
        height: s(48),
        width: s(48),
        marginLeft: s(12),
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: NEW_COLOR.SEARCH_BORDER,
    },
    userBg: {
        backgroundColor: NEW_COLOR.USER_ICON_BG,
        height: s(42),
        width: s(42),
        borderRadius: s(42) / 2,
        justifyContent: "center",
        alignItems: "center",
    },
    status: { position: 'absolute', top: s(-40), right: 24, paddingVertical: 3, paddingHorizontal: 12, borderBottomRightRadius: 12, borderBottomLeftRadius: 12 },
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: NEW_COLOR.MENU_CARD_BG,
        borderRadius: s(16),
        padding: isPad ? s(18) : s(10),
        justifyContent: "space-between",
        position: "relative",
    },
});