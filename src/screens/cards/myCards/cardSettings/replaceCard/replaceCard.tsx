import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import { s } from "../../../../../constants/theme/scale";
import { useThemeColors } from "../../../../../hooks/useThemeColors";
import Container from "../../../../../newComponents/container/container";
import ImageUri from "../../../../../newComponents/imageComponents/image";
import PageHeader from "../../../../../newComponents/pageHeader/pageHeader";
import ViewComponent from "../../../../../newComponents/view/view";
import { ImageBackground } from "react-native";
import TextMultiLanguage from "../../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import ButtonComponent from "../../../../../newComponents/buttons/button";
import PopupOrSheet from "../../../../../newComponents/models/PopupOrSheet";
import { showAppToast } from "../../../../../newComponents/ToasterMessages/ShowMessage";
import { formatCardNumberForDisplay, isErrorDispaly } from "../../../../../utils/helpers";
import { useLngTranslation } from "../../../../../hooks/useLngTranslation";
import { cardsService } from "../../../../../apiServices/cardsApis/cardsApiServices";
import { useHardwareBackHandler } from "../../../../../hooks/HardwareBackHandler";
import { CardData } from "./interface";
import SwokipayDashboardLoader from "../../../../../newComponents/swokipayloader";
import { getThemedCommonStyles } from "../../../../../assets/styles/CommonStyles";
import ParagraphComponent from "../../../../../newComponents/textComponets/paragraphText/paragraph";
import useEncryptDecrypt from "../../../../../hooks/encDecHook";
import AuthVerification from "../../../../commonScreens/authentication";
import { CARDS_URLS, COMMON_SVG_URLS } from "../../../../../assets/blobUrls";
import { CurrencyText } from "../../../../../newComponents/textComponets/currencyText/currencyText";
import ErrorComponent from "../../../../../newComponents/errorDisplay/errorDisplay";

const ReplaceCard = (props: any) => {
    const navigation = useNavigation<any>();
    const rbSheetRef = useRef<any>(null);
    const { t } = useLngTranslation();
    const cardData = props?.route?.params?.activeCard;
    const NEW_COLOR = useThemeColors();
    // Keep commonStyles memoized as it's a derived value from a hook
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
    const REVERSE_NEW_COLOR = useThemeColors(true);
    // Keep reverseCommonStyles memoized as it's a derived value from a hook
    const reverseCommonStyles = useMemo(() => getThemedCommonStyles(REVERSE_NEW_COLOR), [REVERSE_NEW_COLOR]);
    const [replaceCardData, setReplaceCardData] = useState<CardData | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);
    // Memoize handleBackPress since it's a simple navigation action
    const handleBackPress = useCallback(() => navigation.goBack(), [navigation]);
    const cardNumber = cardData?.number;
    const [replaceLoading, setReplacLoading] = useState<boolean>(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [authLoading, setAuthLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    // Memoize getReplaceCardInfo to prevent unnecessary re-creation
    const getReplaceCardInfo = useCallback(async () => {
        setError("");
        setLoading(true);
        try {
            const response: any = await cardsService.getReplaceCard(cardData?.id);
            if (response.status === 200) {
                setReplaceCardData(response?.data as CardData);
                rbSheetRef.current?.open();
                setLoading(false);
            } else {
                setError(isErrorDispaly(response));
                setLoading(false);
                setReplaceCardData(undefined)
            }
        } catch (error) {
            setError(isErrorDispaly(error));
            setLoading(false);
        }
    }, [cardData?.cardId]); // Depend on cardData.id as it's used in the service call
    // Memoize handleReplaceCard
    const handleReplaceCard = useCallback(async () => {
        setError("");
        try {
            if (!replaceCardData || !cardData?.id) {
                // Handle cases where data might be missing before making the API call
                setError("Missing card or replacement fee data.");
                return;
            }
            const body = {
                CardId: cardData?.id,
                Amount: replaceCardData?.replacementFee?.amount,
                Currency: replaceCardData?.replacementFee?.currency,
            };
            setReplacLoading(true);
            const response = await cardsService.replaceCard(cardData.id, body);
            if (response.status === 200) {
                showAppToast(t("GLOBAL_CONSTANTS.CARD_REPLACED_SUCCESSFULLY"), "success");
                rbSheetRef.current?.close();
                navigation.navigate("MyCards")
                setReplacLoading(false);
            } else {
                setError(isErrorDispaly(response));
                setReplacLoading(false);
            }
        } catch (error) {
            setError(isErrorDispaly(error));
            setReplacLoading(false);
        }
    }, [cardData?.id, replaceCardData, navigation]); // Dependencies: cardData.id, replaceCardData, navigation

    // Memoize handleSubmit
    const handleSubmit = useCallback(() => {
        rbSheetRef.current?.close();
    }, []); // No dependencies as it only interacts with the ref

    // Memoize propsCloseModel
    const propsCloseModel = useCallback(() => {
        rbSheetRef.current?.close();
    }, []); // No dependencies as it only interacts with the ref

    useEffect(() => {
        getReplaceCardInfo();
    }, [getReplaceCardInfo]); // Depend on getReplaceCardInfo

    useHardwareBackHandler(() => {
        handleBackPress();
    }); // Use the memoized handleBackPress
    const handleCancel = useCallback(() => {
        rbSheetRef.current?.close();
        navigation.goBack();
    }, []);
    const handleAuthClose = () => {
        setAuthOpen(false);
        setAuthLoading(false);
    }
    const handleAuthSucess = (verifications: any) => {
        setAuthOpen(false);
        setAuthLoading(false);
        handleReplaceCard();
    }
    const verifyAuth = () => {
        setError("");
        setAuthLoading(true);
        setAuthOpen(true);
    }
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {loading ? (<SwokipayDashboardLoader />) : (
                <Container>
                    <PageHeader
                        title={"GLOBAL_CONSTANTS.REPLACE_CARD_TITLE"}
                        onBackPress={handleBackPress}
                    />
                    {error && <ErrorComponent message={error} screen={true} />}
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap12, commonStyles.sectionGap]}>
                        <ImageUri uri={COMMON_SVG_URLS.alertIcon} height={s(24)} width={s(24)} />
                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.SAME_CARD_NUMBER_NEW_EXPIRY_DATE_AND_CVV"} style={[commonStyles.fs14_24, commonStyles.fw400, commonStyles.textGrey]} />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                        <ImageBackground
                            source={{ uri: cardData?.logo }}
                            resizeMode="cover"
                            imageStyle={[commonStyles.rounded12]}
                            style={[commonStyles.rounded12, { height: s(210), width: s(380) }]}
                        >
                            <ViewComponent
                                style={[
                                    commonStyles.p16,
                                    commonStyles.flex1,
                                    { justifyContent: "space-between" },
                                ]}
                            >
                                <ViewComponent style={[commonStyles.cardbadge]}>
                                    <ViewComponent style={[commonStyles.cardvirtualbadge]}>
                                        <TextMultiLanguage style={[commonStyles.fs8, commonStyles.fw700, commonStyles.textWhite]} text={cardData?.type.toUpperCase() || cardData.type} />
                                    </ViewComponent>
                                </ViewComponent>
                                <ViewComponent
                                    style={[commonStyles.dflex, commonStyles.justifyend]} />

                                <ViewComponent>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]} >
                                        <ParagraphComponent text={formatCardNumberForDisplay(cardNumber)}
                                            style={[commonStyles.fs12, commonStyles.textWhite, commonStyles.fw600, commonStyles.cardml27]}
                                        />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]} >
                                        <ParagraphComponent text={cardData?.lable}
                                            style={[commonStyles.fs12, commonStyles.textWhite, commonStyles.fw600, commonStyles.cardml27]}
                                        />
                                    </ViewComponent>
                                </ViewComponent>
                            </ViewComponent>
                        </ImageBackground>
                    </ViewComponent>

                    <ViewComponent style={[commonStyles.flex1]} />
                    <ViewComponent
                        style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.listbg, commonStyles.sectionGap]} >
                        <TextMultiLanguage
                            text={"GLOBAL_CONSTANTS.REPLACEMENT_FEE"}
                            style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]}
                        />

                        <CurrencyText value={replaceCardData?.replacementFee?.amount} currency={replaceCardData?.replacementFee?.currency} />

                    </ViewComponent>
                    <ButtonComponent
                        onPress={verifyAuth}
                        title={"GLOBAL_CONSTANTS.PAY"}
                        loading={authLoading || replaceLoading}
                        disable={authLoading || replaceLoading || !replaceCardData}
                    />
                    <ViewComponent style={[commonStyles.sectionGap]} />
                </Container>)}

            <PopupOrSheet ref={rbSheetRef} height={s(350)} onClose={propsCloseModel} closeOnPressMask={false} showCloseIcon={false}
                showCloseIconAndTittle={false}>
                <ViewComponent style={[commonStyles.alignCenter]}>
                    <ViewComponent>
                        <ViewComponent
                            style={[commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mb16]}>
                            <ImageUri uri={CARDS_URLS?.replaceCardIcon} width={s(90)} height={s(80)} />
                        </ViewComponent>
                        <TextMultiLanguage
                            style={[commonStyles.fs16, commonStyles.fw700, reverseCommonStyles.textWhite, commonStyles.textCenter, commonStyles.mb16]} text={`GLOBAL_CONSTANTS.REPLACECARD`} />
                        <ParagraphComponent
                            style={[commonStyles.fs14, commonStyles.fw400, reverseCommonStyles.textWhite, commonStyles.textCenter]}
                            text={`${t("GLOBAL_CONSTANTS.A_NEW_CARD_WILL_BE_ISSUED_AND_THE_OLD_ONE_WILL_BE_DEACTIVATED")} `}>
                            <CurrencyText style={[commonStyles.fw700, reverseCommonStyles.textWhite]} value={`${replaceCardData?.replacementFee?.amount}`} currency={`${replaceCardData?.replacementFee?.currency} `} />
                            <TextMultiLanguage style={[reverseCommonStyles.textWhite, commonStyles.fw400, commonStyles.fs14]} text={"GLOBAL_CONSTANTS.WILL_APPLY"} /></ParagraphComponent>
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.mb16]} />
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <ButtonComponent
                                title={"GLOBAL_CONSTANTS.CANCEL"}
                                onPress={handleCancel}
                                solidBackground={true}
                            />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <ButtonComponent
                                title={"GLOBAL_CONSTANTS.CONFIRM"}
                                onPress={handleSubmit}
                                customContainerStyle={[reverseCommonStyles.bg_yellow, reverseCommonStyles.rounded100, { height: s(50) }]}
                                customTitleStyle={[reverseCommonStyles.fs14, reverseCommonStyles.fw700, reverseCommonStyles.textAlwaysBlack]}
                            />
                        </ViewComponent>

                    </ViewComponent>
                </ViewComponent>
            </PopupOrSheet>
            {authOpen && <AuthVerification onClose={handleAuthClose} onSuccess={handleAuthSucess} feature={'ReplaceCard'} requiredVerifys={1} />}
        </ViewComponent>
    );
};

export default ReplaceCard;