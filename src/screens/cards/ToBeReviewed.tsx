import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View, Image, ScrollView, SafeAreaView, BackHandler, ImageBackground, Dimensions } from "react-native";
import { Container } from '../../components';
import DefaultButton from "../../components/DefaultButton";
import AntDesign from "react-native-vector-icons/AntDesign";
import Loadding from "../../components/skeleton";
import { NEW_COLOR } from "../../constants/theme/variables";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import { s, ms } from "../../constants/theme/scale";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { commonStyles } from "../../components/CommonStyles";
import { isErrorDispaly } from "../../utils/helpers";
import CardsModuleService from "../../services/card";
import { IconRefresh } from "../../assets/svg";
import { ToBeReViewLoader } from "./CardsSkeleton_views";
const { width } = Dimensions.get('window');
const isPad = width > 600;
// Stepper: only the icons and the connectors are in the row, so each connector
// runs exactly icon-to-icon. Labels are pinned under their icon and take no row
// width — sizing the row by label width made the line overshoot into the next
// icon, and pushed "Approved" off narrow screens.
// Everything scales with ms(), the same factor as the fs12 label font, so the
// spacing grows with the text on tablets instead of the labels colliding.
const STEP_ICON = ms(24);
const STEP_LINE_WIDTH = ms(60);
// Ionicons' circle sits ~2/24 of the icon inside its box; overlap by that much so the line meets the circle.
const STEP_ICON_INSET = STEP_ICON / 12;
// One label per icon-to-icon distance: neighbouring labels can never overlap;
// an over-long label (very large system font) ends in "…" instead.
const STEP_LABEL_WIDTH = STEP_ICON + STEP_LINE_WIDTH - 2 * STEP_ICON_INSET;
const STEP_LABEL_HEIGHT = ms(20);
const ToBeReviewedStep = (props: any) => {
    const [feeCardsLoading, setFeeCardsLoading] = useState<boolean>(false);
    const [applyCardsInfo, setCardsFeeInfo] = useState<any>({});
    const [errormsg, setErrormsg] = useState<string>('');
    const ExchangeCardSkeleton = ToBeReViewLoader();
    useEffect(() => {
        getApplyCardDeatilsInfo();
    }, [props?.route?.params?.cardId,
    props?.route?.params?.profileId,
    props?.route?.params?.logo]);
    const getApplyCardDeatilsInfo = async () => {
        const cardId = props?.route?.params?.cardWalletId || props?.route?.params?.cardId;
        try {
            setFeeCardsLoading(true);
            const response: any = await CardsModuleService?.getApplyCardStatus(cardId);
            if (response.status === 200) {
                setCardsFeeInfo(response?.data);
                setErrormsg('');
                setFeeCardsLoading(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setFeeCardsLoading(false);
        }
    };

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleBack(); return true; }
        );
        return () => backHandler.remove();
    }, []);
    const handleBack = () => {
        if (props?.params?.route?.from == "MyCards") {
            props.navigation.push("ViewallMyCards");
        } else {
            props.navigation.navigate("Dashboard", {
                screen: "Cards",
                animation: "slide_from_left"
            })
        }

    };

    return (
        <>
            <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
                <ScrollView>
                    <Container style={commonStyles.container}>
                        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mb43, commonStyles.gap16, commonStyles.justifyContent]}>
                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                                <TouchableOpacity style={[]} onPress={handleBack}>
                                    <View>
                                        <AntDesign name="arrowleft" size={s(22)} color={NEW_COLOR.TEXT_BLACK} />
                                    </View>
                                </TouchableOpacity>
                                <ParagraphComponent text="Apply For Exchanga Pay Card" style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800]} />
                            </View>
                            <TouchableOpacity style={[]} onPress={getApplyCardDeatilsInfo}><IconRefresh height={s(24)} width={s(24)} /></TouchableOpacity>
                        </View>
                        {feeCardsLoading && (
                            <View style={[commonStyles.flex1]}>
                                <Loadding contenthtml={ExchangeCardSkeleton} />
                            </View>
                        )}
                        {!feeCardsLoading && <View>
                            <ImageBackground source={require("../../assets/images/cards/light-purplebg.png")} resizeMode='contain' style={[{ height: isPad ? s(360) : 360, }]}  >
                                <View style={[commonStyles.p24, { height: isPad ? s(210) : "auto", }]}>
                                    <View style={{ marginBottom: "auto", marginTop: "auto" }}>
                                        <Image style={commonStyles.mxAuto} source={require("../../assets/images/cards/cardholdinghand.png")} />
                                        <ParagraphComponent text={`Card Requested \n Successfully`} style={[commonStyles.fs20, commonStyles.fw600, commonStyles.textCenter, commonStyles.textBlack]} />
                                    </View>
                                </View>

                                <View style={[styles.hline,]} />
                                <View style={styles.stepper}>
                                    {applyCardsInfo && applyCardsInfo.length > 0 && applyCardsInfo.map((item: any, index: number) =>
                                        <React.Fragment key={item?.action ?? index}>
                                            <View style={styles.stepIcon}>
                                                <Ionicons name="checkmark-circle" size={STEP_ICON} color={item?.status ? NEW_COLOR.TEXT_GREEN : NEW_COLOR.TEXT_BLACK} />
                                                <View style={styles.stepLabel}>
                                                    <ParagraphComponent text={item.action} numberOfLines={1} style={[commonStyles.fs12, commonStyles.textBlack, commonStyles.fw500, commonStyles.textCenter]} />
                                                </View>
                                            </View>
                                            {index !== (applyCardsInfo.length - 1) && <View style={[styles.stepLine, { backgroundColor: item?.status ? NEW_COLOR.TEXT_GREEN : NEW_COLOR.TEXT_BLACK }]} />}
                                        </React.Fragment>
                                    )}
                                </View>
                            </ImageBackground>
                            <View style={[commonStyles.mb43,]} />
                            <View style={[commonStyles.mb43,]} />
                            <DefaultButton
                                title='Back'
                                style={undefined}

                                disable={undefined}
                                loading={undefined}
                                onPress={handleBack}
                                iconArrowRight={false}
                                iconCheck={true}
                            />
                            <View style={[commonStyles.mb24,]} />
                        </View>}
                    </Container>
                </ScrollView>
            </SafeAreaView>
        </>
    );
};

export default ToBeReviewedStep;

const styles = StyleSheet.create({
    hline: {
        borderTopWidth: 2,
        marginTop: 26, marginBottom: 36, opacity: 0.2, width: '95%'
    },
    stepper: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        // Room for half a label beyond the first and last icon, and for the labels below.
        paddingHorizontal: STEP_LABEL_WIDTH / 2 - STEP_ICON / 2 + 8,
        paddingTop: 16,
        paddingBottom: 16 + STEP_LABEL_HEIGHT + 4,
    },
    // Above the connectors, so their overlapping ends tuck under the circle.
    stepIcon: { width: STEP_ICON, height: STEP_ICON, zIndex: 1 },
    stepLabel: {
        position: "absolute",
        top: STEP_ICON + 4,
        left: (STEP_ICON - STEP_LABEL_WIDTH) / 2,
        width: STEP_LABEL_WIDTH,
    },
    stepLine: {
        // The original compact, centred look. Whole stepper is ms(256): ~227dp on a
        // 320dp phone (card is 272dp), ~445dp on a 1024dp iPad (card is 976dp).
        width: STEP_LINE_WIDTH,
        height: 1,
        marginHorizontal: -STEP_ICON_INSET,
    },
    opacity6: { opacity: 0.6, },
    mb8: { marginBottom: 8, },
    bgblack: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: NEW_COLOR.SECTION_BG,
        borderRadius: 12,
    },
    mr8: { marginRight: 8 },
    mt48: { marginTop: 48 },
    ml10: {},
});
