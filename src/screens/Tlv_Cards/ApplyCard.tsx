import React, { useEffect, useRef, useState } from 'react';
import { View, SafeAreaView, ScrollView, TouchableOpacity, ImageBackground, useWindowDimensions, BackHandler, LayoutAnimation, Dimensions, Platform } from 'react-native';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import { Container } from '../../components';
import { NEW_COLOR, WINDOW_HEIGHT, WINDOW_WIDTH } from '../../constants/theme/variables';
import { ms, s } from '../../constants/theme/scale';
import AntDesign from "react-native-vector-icons/AntDesign";
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import { Overlay } from 'react-native-elements';
import DefaultButton from '../../components/DefaultButton';
import { commonStyles } from '../../components/CommonStyles';
import { isErrorDispaly } from '../../utils/helpers';
import { CardApplicationLoader } from './CardsSkeleton';
import RenderHtml from 'react-native-render-html';
import Loadding from '../../components/skeleton';
import { ChevronRight } from '../../assets/svg';
import { useIsFocused } from '@react-navigation/native';
import { isCardKycCompleted, setPersonalInfo } from '../../redux/Actions/UserActions';
import { useDispatch, useSelector } from 'react-redux';
import CardsModuleService from '../../services/card';
import MFAPopup from '../Currencypop/mfaPopup';
import AccountDeactivatePopup from '../Currencypop/actDeactivatePopup';
import ErrorComponent from '../../components/Error';
import NoDataComponent from '../../components/nodata';
const { width } = Dimensions.get('window');
const isPad = width > 600;

const ApplyCard = React.memo((props: any) => {
    const styles = useStyleSheet(themedStyles);
    const [visible, setVisible] = useState(false);
    const [applyCardsLoading, setApplyCardsLoading] = useState(false);
    const [errormsg, setErrormsg] = useState("");
    const [applyCardsData, setApplyCardsData] = useState<any>(null);
    const [appInformation, setAppInformation] = useState<any>([]);
    const ApplyCardSkeleton = CardApplicationLoader();
    const { width } = useWindowDimensions();
    const isFocus = useIsFocused();
    const ref = useRef<any>(null);
    const dispatch = useDispatch();
    const [expanded, setExpanded] = useState<number | null>(null);
    const [AccordionData, setAccordionData] = useState<any>([]);
    const isMFACompleted = useSelector((state: any) => state.UserReducer?.isMFACompleted);
    const [isPressed, setIsPressed] = useState<boolean>(false);
    const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);
    const toggleItem = (index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(index === expanded ? null : index);
    }

    useEffect(() => {
        getApplyCardDeatilsInfo();
        getFAQsInfo();
        ref?.current?.scrollTo({ y: 0, animated: true });
    }, [isFocus]);

    const toggleOverlay = () => {
        if (userInfo.accountStatus === "Inactive") {
            setIsPressed(true);
        } else {
            setVisible(!visible);
        }
    };
    const CloseOverlay = () => {
        dispatch(setPersonalInfo(""));
        props.navigation.push("ApplyExchangaCard", {
            cardId: props?.route?.params?.cardId,
            logo: props?.route?.params?.logo,
            cardType: applyCardsData?.cardType,
            cardKycLevl: applyCardsData?.cardKycLevl,
        });
        dispatch(isCardKycCompleted(false))
        setVisible(false);
    };

    const getApplyCardDeatilsInfo = async () => {
        const cardId = props?.route?.params?.cardId;
        try {
            setApplyCardsLoading(true);
            const response: any = await CardsModuleService.getApplyCardDeatils(cardId);
            if (response.ok) {
                setApplyCardsData(response.data);
                setAppInformation(response.data.rules);
                setErrormsg('');
            } else {
                setErrormsg(isErrorDispaly(response));
            }
            setApplyCardsLoading(false);
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setApplyCardsLoading(false);
        }
    };
    const getFAQsInfo = async () => {
        try {
            const response: any = await CardsModuleService.getApplyCardFAQs();
            if (response.status === 200) {
                setAccordionData(response.data?.faQs || []);
                setErrormsg('');
            } else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }
    };
    const source = {
        html: `${applyCardsData?.note}`
    };
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleBack(); return true; }
        );
        return () => backHandler.remove();
    }, []);
    const handleBack = () => {
        props.navigation.navigate('Dashboard', { screen: 'Cards' });
    };

    const handleCloseMFAPopUp = () => {
        setIsPressed(false)
    };

    const handleCloseError = () => {
        setErrormsg("")
    };
    return (
        <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
            <ScrollView showsVerticalScrollIndicator={false} ref={ref}>
                <Container style={[commonStyles.container,]}>
                    {applyCardsLoading && (
                        <Loadding contenthtml={ApplyCardSkeleton} />
                    )}
                    {!applyCardsLoading && <>
                        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap20, commonStyles.justifyContent]}>
                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap20]}>
                                <TouchableOpacity style={[]} onPress={() => handleBack()} >
                                    <View>
                                        <AntDesign name="arrowleft" size={s(22)} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
                                    </View>
                                </TouchableOpacity>
                                <ParagraphComponent text="Card " style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw700]} />
                            </View>
                        </View>
                        {errormsg && <ErrorComponent message={errormsg} onClose={handleCloseError} />}
                        <View style={[commonStyles.mb43]} />
                        <View style={[commonStyles.mb32]} />
                        {!applyCardsLoading && applyCardsData && <View style={[styles.cardbackground]}>
                            <ImageBackground
                                source={{ uri: props?.route?.params?.logo }}
                                resizeMode={Platform.OS === "ios" ? "cover" : "contain"}
                                imageStyle={{ borderRadius: 24, }}
                                style={[{ marginTop: -36, height: isPad ? 250 : Platform.OS === "ios" ? 184 : ms(184), width: isPad ? (WINDOW_WIDTH * 50) / 100 : (WINDOW_WIDTH * 75) / 100, padding: 16, borderRadius: 24, }]}
                            >
                                <View style={[styles.cardContent]}>
                                    <View style={[commonStyles.mt16]}>



                                        <ParagraphComponent style={[applyCardsData?.colorCode ? { color: applyCardsData?.colorCode } : commonStyles.textAlwaysWhite, isPad ? commonStyles.fs12 : commonStyles.fs16, commonStyles.fw500]}
                                            text={`XXXX  XXXX  XXXX  XXXX`} numberOfLines={1} />
                                    </View>
                                    <View style={{ marginTop: "auto", }}>
                                        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent,]}>
                                            <ParagraphComponent style={[applyCardsData?.colorCode ? { color: applyCardsData?.colorCode } : commonStyles.textAlwaysWhite, commonStyles.fw500, commonStyles.fs14,]} text="XXX" />
                                            <View style={[commonStyles.dflex, commonStyles.gap16]}>
                                                <ParagraphComponent style={[applyCardsData?.colorCode ? { color: applyCardsData?.colorCode } : commonStyles.textAlwaysWhite, commonStyles.fw500, commonStyles.fs14,]}
                                                    text={"XX/XX"} />
                                                <ParagraphComponent style={[commonStyles.textAlwaysWhite, commonStyles.fw500, commonStyles.fs14,]}
                                                    text={applyCardsData?.assoc} />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </ImageBackground>
                        </View>}


                        {(appInformation && appInformation?.length > 0) && <>
                            <View style={[commonStyles.mb24]} />
                            <ParagraphComponent text='Application Rules' style={[commonStyles.fs16, commonStyles.fw700, commonStyles.textAlwaysWhite,]} />
                            <View style={[commonStyles.mb8]} />
                            <View style={[styles.p16, styles.darkBg]}>
                                {(appInformation && appInformation?.length > 0) && appInformation?.map((item: any, index: any) => (<>
                                    <ParagraphComponent
                                        key={item.id}
                                        text={`${index + 1}. ${item?.rules}`}
                                        style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textLightWhite, commonStyles.mb8]}
                                    />
                                </>
                                ))}
                            </View>
                        </>}
                        <View style={[commonStyles.mb24]} />
                        {applyCardsData?.keyValuePairs && applyCardsData.keyValuePairs?.length > 0 && <View>
                            <ParagraphComponent text='Charges' style={[commonStyles.fs16, commonStyles.fw700, commonStyles.textBlack, commonStyles.mb16]} />
                            <View style={[styles.darkBg, styles.p16,]}>
                                {applyCardsData?.keyValuePairs && applyCardsData.keyValuePairs.length > 0 && applyCardsData?.keyValuePairs?.map((item: any, index: number) => <><View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap16]}>
                                    <ParagraphComponent text={item.title} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textLightGrey, { width: ms(160) }]} />
                                    <ParagraphComponent text={item?.value} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textBlack, commonStyles.flex1, commonStyles.textRight,]} />
                                </View>
                                    {(index < applyCardsData.keyValuePairs.length - 1) && <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.2 }]} />}
                                </>)}

                            </View>
                        </View>}

                        {(!applyCardsData || applyCardsData?.length === 0) && (
                            <View style={[styles.cAccount, styles.custNodata]}>
                                <NoDataComponent />

                            </View>)}

                        <View style={[commonStyles.mb30]} />
                        {AccordionData?.length > 0 && <View>
                            <View style={[commonStyles.dflex, commonStyles.gap8, commonStyles.alignCenter, commonStyles.justifyContent]}>
                                <ParagraphComponent style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw700]} text='FAQ' />
                                {AccordionData?.length > 5 && <TouchableOpacity activeOpacity={0.7} onPress={() => props.navigation.navigate('AllFAQs')}>
                                    <View style={[commonStyles.dflex, commonStyles.gap4, commonStyles.alignCenter]}>
                                        <AntDesign
                                            style={styles.arrowRotate}
                                            name="arrowup"
                                            size={s(16)}
                                            color={NEW_COLOR.TEXT_ORANGE}
                                        />
                                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, { color: NEW_COLOR.TEXT_ORANGE }]} text='More' />

                                    </View>
                                </TouchableOpacity>}
                            </View>

                            <View style={[commonStyles.mt16]} />
                            <View style={[styles.darkBg, styles.p16,]}>
                                {AccordionData?.map((item: any, index: number) => {
                                    if (index < 6) {
                                        return <View key={index}>
                                            <TouchableOpacity onPress={() => toggleItem(index)} activeOpacity={0.8}>
                                                <View style={[commonStyles.dflex, commonStyles.gap8, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap16,]}>
                                                    <ParagraphComponent style={[commonStyles.fs14, commonStyles.textBlack, commonStyles.fw600, commonStyles.flex1]} text={item.question} />
                                                    <ChevronRight style={{ transform: [{ rotate: expanded === index ? '90deg' : '0deg' }], }} />
                                                </View>
                                            </TouchableOpacity>
                                            {expanded === index &&
                                                <ParagraphComponent style={[commonStyles.fs12, commonStyles.textGrey, commonStyles.fw500, commonStyles.flex1, { marginTop: 6, marginBottom: 8 }]}
                                                    text={item.answer} />
                                            }
                                            {index != 5 && <View style={[styles.btmBorder]} />}
                                        </View>
                                    }
                                })}
                            </View>
                        </View>}
                        <View style={[commonStyles.mb43]} />

                        <View style={[commonStyles.mb43]} />
                        <Overlay overlayStyle={[styles.overlayContent, { width: WINDOW_WIDTH - 50, maxHeight: WINDOW_HEIGHT - 100 }]} isVisible={visible} onBackdropPress={toggleOverlay}>
                            <ParagraphComponent text='Notes' style={[commonStyles.fs16, commonStyles.fw800, commonStyles.textWhite, commonStyles.textCenter]} />
                            <View style={[commonStyles.mb24]} />
                            <ParagraphComponent text='Application requirements:' style={[commonStyles.fs12, commonStyles.fw800, commonStyles.mb8, commonStyles.textWhite]} />
                            <ScrollView>
                                <RenderHtml
                                    contentWidth={width}
                                    source={source}
                                    tagsStyles={{
                                        body: { color: 'black' },
                                    }}
                                    renderersProps={{
                                        img: {
                                            enableExperimentalPercentWidth: true
                                        }
                                    }}
                                    enableExperimentalMarginCollapsing={true}
                                />
                            </ScrollView>
                            <View style={[commonStyles.mb43]} />
                            <TouchableOpacity onPress={CloseOverlay} activeOpacity={0.8}>
                                <View style={[styles.readbtn]}>
                                    <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textAlwaysWhite,]} text='I’ve read' />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={toggleOverlay} activeOpacity={0.8} >
                                <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textOrange, commonStyles.textCenter, commonStyles.mt8]} text='Cancel' />
                            </TouchableOpacity>
                        </Overlay>
                        <View style={[commonStyles.mb43]} />
                    </>}
                </Container>
            </ScrollView>
            <View style={[styles.btnFixed, commonStyles.px24]}>
                <DefaultButton
                    title={"Apply Now"}
                    customTitleStyle={undefined}
                    style={undefined}
                    customButtonStyle={undefined}
                    customContainerStyle={undefined}
                    backgroundColors={undefined}
                    disable={undefined}
                    loading={undefined}
                    colorful={undefined}
                    transparent={undefined}
                    onPress={toggleOverlay}
                    iconArrowRight={false}
                    iconCheck={true}
                />
            </View>
            {/* {(!isMFACompleted && isPressed) && <MFAPopup isVisible={!isMFACompleted && isPressed} handleClose={handleCloseMFAPopUp} />} */}
            {((userInfo?.accountStatus === "Inactive") && isPressed) && <AccountDeactivatePopup isVisible={((userInfo?.accountStatus === "Inactive") && isPressed)} handleClose={handleCloseMFAPopUp} />}

        </SafeAreaView >
    )
});

export default ApplyCard;

const themedStyles = StyleService.create({
    cardbackground: {
        paddingBottom: 30,
        backgroundColor: NEW_COLOR.BG_PURPLERDARK,
        borderRadius: 24,
        borderStyle: "dashed",
        borderWidth: 1, borderColor: NEW_COLOR.DASHED_BORDER_STYLE,
        flexDirection: "row", justifyContent: "center"
    },
    btmBorder: {
        borderWidth: 1,
        borderColor: NEW_COLOR.DASHED_BORDER_STYLE,
        height: 1, flex: 1,
        marginVertical: 14,
        borderStyle: "dashed", opacity: 0.3
    },
    btnFixed: {
        position: "absolute", bottom: 20,
        width: "100%",
    },
    mb32: {
        marginBottom: 32,
    },
    readbtn: {
        padding: 13,
        backgroundColor: NEW_COLOR.BG_ORANGE,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 50 / 2,
    },
    overlayContent: {
        paddingHorizontal: s(28),
        paddingVertical: s(24),
        borderRadius: 25, backgroundColor: NEW_COLOR.TEXT_ALWAYS_WHITE
    },
    darkBg: {
        backgroundColor: NEW_COLOR.MENU_CARD_BG,
        borderRadius: 16,
    },
    p16: {
        padding: 16
    },
    cardContent: {
        padding: 16,
        flex: 1,
    },
    container: {
        padding: 24,
        flex: 1,
        backgroundColor: NEW_COLOR.BACKGROUND_WHITE,
    },
    arrowRotate: {
        transform: [{ rotate: "45deg" }]
    },
    custNodata: {
        marginTop: 22,
        marginBottom: 80,
    },
    cAccount: {
        justifyContent: "center",
        alignItems: "center",
    },
});