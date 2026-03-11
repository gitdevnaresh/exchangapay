import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import { s } from "../../../../../constants/theme/scale";
import { useThemeColors } from "../../../../../hooks/useThemeColors";
import Container from "../../../../../newComponents/container/container";
import ImageUri from "../../../../../newComponents/imageComponents/image";
import PageHeader from "../../../../../newComponents/pageHeader/pageHeader";
import ViewComponent from "../../../../../newComponents/view/view";
import TextMultiLanguage from "../../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import ButtonComponent from "../../../../../newComponents/buttons/button";
import PopupOrSheet from "../../../../../newComponents/models/PopupOrSheet";
import { showAppToast } from "../../../../../newComponents/ToasterMessages/ShowMessage";
import { formatCardNumberForDisplay, isErrorDispaly } from "../../../../../utils/helpers";
import { useLngTranslation } from "../../../../../hooks/useLngTranslation";
import { cardsService } from "../../../../../apiServices/cardsApis/cardsApiServices";
import { useHardwareBackHandler } from "../../../../../hooks/HardwareBackHandler";
import { DeleteCardData } from "../replaceCard/interface";
import SwokipayDashboardLoader from "../../../../../newComponents/swokipayloader";
import ImageBackgroundWrapper from "../../../../../newComponents/imageComponents/ImageBackground";
import { getThemedCommonStyles } from "../../../../../assets/styles/CommonStyles";
import ParagraphComponent from "../../../../../newComponents/textComponets/paragraphText/paragraph";
import useEncryptDecrypt from "../../../../../hooks/encDecHook";
import { useSelector } from "react-redux";
import AuthVerification from "../../../../commonScreens/authentication";
import { CARDS_URLS, COMMON_SVG_URLS } from "../../../../../assets/blobUrls";
import { CurrencyText } from "../../../../../newComponents/textComponets/currencyText/currencyText";
import ErrorComponent from "../../../../../newComponents/errorDisplay/errorDisplay";

const DeleteCard = (props: any) => {
    const navigation = useNavigation<any>();
    const rbSheetRef = useRef<any>(null);
    const { t } = useLngTranslation();
    const cardData = props?.route?.params?.activeCard;
    const NEW_COLOR = useThemeColors();
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
    const REVERSE_NEW_COLOR = useThemeColors(true);
    const reverseCommonStyles = useMemo(() => getThemedCommonStyles(REVERSE_NEW_COLOR), [REVERSE_NEW_COLOR]);
    const [deleteCardData, setDeleteCardData] = useState<DeleteCardData | undefined>(undefined);
    const handleBackPress = useCallback(() => navigation.goBack(), [navigation]);
    const [loading, setLoading] = useState<boolean>(false);
    const [deleteCardLoading, setDeleteCardLoading] = useState<boolean>(false)
    const [authLoading, setAuthLoading] = useState<boolean>(false);
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const { decryptAES } = useEncryptDecrypt();
    const cardNumber = decryptAES(cardData?.number);
    const [authOpen, setAuthOpen] = useState(false);
    const [error,setError]=useState<string>("");
    const getDeleteCardInfo = useCallback(async () => {
        setError("");
        setLoading(true);
        try {
            const response: any = await cardsService.getDeleteCard(cardData?.cardId || cardData?.id);
            if (response.status === 200) {
                setDeleteCardData(response?.data as DeleteCardData);
                setLoading(false);
                rbSheetRef.current?.open();
            } else {
                setError(isErrorDispaly(response));
                setLoading(false);
                setDeleteCardData(undefined);
            }
        } catch (error) {
            setError(isErrorDispaly(error));
            setLoading(false);
        }
    }, [cardData?.cardId || cardData?.id]); // Depend on cardData.id as it's used in the service call
    // Memoize handleReplaceCard
    const handleDeleteCard = useCallback(async () => {
        setError("");
        try {
            if (!deleteCardData) {
                // Handle cases where data might be missing before making the API call
                setError(t("GLOBAL_CONSTANTS.MISSING_CARD_OR_DELETE_FEE_DATA"));
                return;
            }
            const body = {
                // id: cardData.cardId||cardData?.id,
                id: deleteCardData?.id,
                ModifiedBy: decryptAES(userInfo?.userName)
            };
            setDeleteCardLoading(true)
            const response = await cardsService.deleteCardSave(body);
            if (response.status === 200) {
                showAppToast(t("GLOBAL_CONSTANTS.CARD_HAS_BEEN_DELETED"), "success");
                rbSheetRef.current?.close();
                if (props?.route?.params?.screenName === "Overview") {
                    navigation.navigate("MyCards");
                } else {
                    navigation.navigate("ChooseCard");
                }
                setDeleteCardLoading(false)
            } else {
                setError(isErrorDispaly(response));
                setDeleteCardLoading(false)
            }
        } catch (error) {
            setError(isErrorDispaly(error));
            setDeleteCardLoading(false)

        }
    }, [cardData?.cardId || cardData?.id, deleteCardData, navigation]); // Dependencies: cardData.id, replaceCardData, navigation

    // Memoize handleSubmit
    const handleSubmit = useCallback(() => {
        rbSheetRef.current?.close();
    }, []); // No dependencies as it only interacts with the ref

    // Memoize propsCloseModel
    const propsCloseModel = useCallback(() => {
        rbSheetRef.current?.close();
    }, []); // No dependencies as it only interacts with the ref

    useEffect(() => {
        if (props?.route?.params?.screenName === "Overview") {
            rbSheetRef.current?.close();
        }
        getDeleteCardInfo();
    }, [getDeleteCardInfo]); // Depend on getReplaceCardInfo

    const handleAuthClose = () => {
        setAuthOpen(false);
        setAuthLoading(false);
    }
    const handleAuthSucess = (verifications: any) => {
        setAuthOpen(false);
        setAuthLoading(false);
        handleDeleteCard();
    }
    const verifyAuth = () => {
        setError("");
        setAuthLoading(true);
        setAuthOpen(true);
    }



    useHardwareBackHandler(handleBackPress); // Use the memoized handleBackPress
    const handleCancel = () => {
        rbSheetRef.current?.close();
        navigation.goBack();
    }
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {loading ? (
                <SwokipayDashboardLoader />
            ) : (
                <Container>
                    <PageHeader
                        title={"GLOBAL_CONSTANTS.DELETE_CARD_TITLE"}
                        onBackPress={handleBackPress}
                    />
                    {error&&<ErrorComponent message={error} screen={true}/>}
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.gap12, commonStyles.sectionGap]}>
                        <ImageUri uri={COMMON_SVG_URLS.alertIcon} height={s(24)} width={s(24)} />
                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.THE_CARD_WILL_BE_UNUSABLE_AFTER_DELETION_AND_THIS_ACTION_IS_IRREVERSIBLE"} style={[commonStyles.textGrey, commonStyles.fs14, commonStyles.fw400, commonStyles.flex1]} />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>

                        <ImageBackgroundWrapper
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
                                    style={[commonStyles.dflex, commonStyles.justifyend]}/>

                                <ViewComponent
                                    style={[]} >
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter,commonStyles.cardml27]} >
                                        <ParagraphComponent text={formatCardNumberForDisplay(cardNumber)}
                                            style={[commonStyles.fs12, commonStyles.textWhite, commonStyles.fw600]}
                                        />
                                    </ViewComponent>
                                     <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]} >
                                        <ParagraphComponent text={cardData?.lable}
                                            style={[commonStyles.fs12, commonStyles.textWhite, commonStyles.fw600, commonStyles.cardml27]}
                                        />
                                    </ViewComponent>
                                </ViewComponent>
                            </ViewComponent>
                        </ImageBackgroundWrapper>
                    </ViewComponent>

                    <ViewComponent style={[commonStyles.flex1]} />
                    {cardData?.status != "Rejected" && <ViewComponent
                        style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.listbg, commonStyles.sectionGap]} >
                        <TextMultiLanguage
                            text={"GLOBAL_CONSTANTS.DELETE_FEE"}
                            style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]}
                        />
                        <CurrencyText value={deleteCardData?.deleteFee?.amount} currency={deleteCardData?.deleteFee?.currency} />
                    </ViewComponent>}
                    <ButtonComponent
                        onPress={verifyAuth}
                        title={cardData?.status == "Rejected" ? "GLOBAL_CONSTANTS.DELETE" : "GLOBAL_CONSTANTS.PAY"}
                        loading={authLoading || deleteCardLoading}
                        disable={authLoading || deleteCardLoading||!deleteCardData}
                    />
                    <ViewComponent style={[commonStyles.sectionGap]} />
                </Container>)}

            <PopupOrSheet ref={rbSheetRef} height={s(350)} onClose={propsCloseModel} closeOnPressMask={false} showCloseIcon={false}
                showCloseIconAndTittle={false} >
                <ViewComponent style={[commonStyles.alignCenter]}>
                    <ViewComponent>
                        <ViewComponent
                            style={[commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mb16]}>
                            <ImageUri uri={CARDS_URLS?.deleteCardIcon} width={s(90)} height={s(70)} />
                        </ViewComponent>
                        <TextMultiLanguage
                            style={[commonStyles.fs16, commonStyles.fw700, reverseCommonStyles.textWhite, commonStyles.textCenter, commonStyles.mb16]} text={`GLOBAL_CONSTANTS.DELETE_CARD?`} />
                        <ParagraphComponent
                            style={[commonStyles.fs14, commonStyles.fw400, reverseCommonStyles.textWhite, commonStyles.textCenter]}
                            text={cardData?.status !== "Rejected" ? `${t("GLOBAL_CONSTANTS.THIS_ACTION_WILL_PERMANENTLY_DELETE_THE_CARD_AND_CHARGE_A")}` : `${t("GLOBAL_CONSTANTS.THIS_ACTION_WILL_PERMANENTLY_DELETE")}`}>
                            {cardData?.status != "Rejected" && <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, reverseCommonStyles.textWhite,]} text={t("GLOBAL_CONSTANTS.AND_CHARGE_A")} />
                                <CurrencyText style={[commonStyles.fw700, reverseCommonStyles.textWhite]} value={deleteCardData?.deleteFee?.amount} currency={deleteCardData?.deleteFee?.currency} />
                                <ParagraphComponent style={[reverseCommonStyles.textWhite, commonStyles.fw400, commonStyles.fs14]} text={`${t("GLOBAL_CONSTANTS.FEE_DOT")}`} /></ViewComponent>}</ParagraphComponent>
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.mb32]} />
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
                                customContainerStyle={[reverseCommonStyles.bg_yellow, reverseCommonStyles.rounded100, { height: s(55) }]}
                                customTitleStyle={[reverseCommonStyles.fs14, reverseCommonStyles.fw700, reverseCommonStyles.textAlwaysBlack]}
                            />
                        </ViewComponent>
                    </ViewComponent>
                </ViewComponent>
            </PopupOrSheet>
            {authOpen && <AuthVerification onClose={handleAuthClose} onSuccess={handleAuthSucess} feature={'DeleteCard'} requiredVerifys={1} />}
        </ViewComponent>
    );
};

export default DeleteCard;
