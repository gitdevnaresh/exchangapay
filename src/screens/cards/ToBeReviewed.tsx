import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { StyleSheet, TouchableOpacity, View, Image, ScrollView, SafeAreaView, BackHandler, ImageBackground, Dimensions } from "react-native";
import { Container } from '../../components';
import DefaultButton from "../../components/DefaultButton";
import AntDesign from "react-native-vector-icons/AntDesign";
import Loadding from "../../components/skeleton";
import { NEW_COLOR } from "../../constants/theme/variables";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import { s } from "../../constants/theme/scale";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { commonStyles } from "../../components/CommonStyles";
import { isErrorDispaly } from "../../utils/helpers";
import CardsModuleService from "../../services/card";
import { IconRefresh } from "../../assets/svg";
import { ToBeReViewLoader } from "./CardsSkeleton_views";
const { width } = Dimensions.get('window');
const isPad = width > 600;
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
        props.navigation.navigate("Dashboard", {
        })
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
                                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap20, commonStyles.mxAuto, commonStyles.p16, { height: isPad ? s(70) : "auto", }]}>
                                    {applyCardsInfo && applyCardsInfo.length > 0 && applyCardsInfo.map((item, index) => <>
                                        <View>
                                            <View style={[commonStyles.relative, commonStyles.mxAuto]}>
                                                {index !== (applyCardsInfo.length - 1) && <View style={{ height: 1, width: isPad ? s(45) : 60, backgroundColor: item?.status ? NEW_COLOR.TEXT_GREEN : NEW_COLOR.TEXT_BLACK, position: "absolute", top: 13, left: 22, }} />}
                                                <Ionicons name="checkmark-circle" size={24} color={item?.status ? NEW_COLOR.TEXT_GREEN : NEW_COLOR.TEXT_BLACK} />
                                            </View>
                                            <ParagraphComponent text={item.action} style={[commonStyles.fs12, commonStyles.textBlack, commonStyles.fw500, commonStyles.textCenter]} />
                                        </View>
                                    </>
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
