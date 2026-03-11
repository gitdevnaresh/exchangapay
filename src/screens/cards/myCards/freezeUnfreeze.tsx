import React, { useRef, useState } from "react";
import PopupOrSheet from "../../../newComponents/models/PopupOrSheet";
import { s } from "../../../newComponents/theme/scale";
import ViewComponent from "../../../newComponents/view/view";
import { CardStatus, FreezeUnFreezeProps } from "./interface";
import ButtonComponent from '../../../newComponents/buttons/button';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import { useThemeColors } from "../../../hooks/useThemeColors";
import { ActivityIndicator, Text } from "react-native";
import ImageUri from "../../../newComponents/imageComponents/image";
import useEncryptDecrypt from "../../../hooks/encDecHook";
import { cardsService } from "../../../apiServices/cardsApis/cardsApiServices";
import { UserInfo } from "../../Dashboard/interface";
import { useSelector } from "react-redux";
import { isErrorDispaly } from "../../../utils/helpers";
import { useNavigation } from "@react-navigation/native";
import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";
import TextMultiLanguage from "../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import { CARDS_URLS } from "../../../assets/blobUrls";
import { commonStyles } from "../../../newComponents/theme/commonStyles";
import { useLngTranslation } from "../../../hooks/useLngTranslation";
import { showAppToast } from "../../../newComponents/ToasterMessages/ShowMessage";

const FreezeUnFreeze = ({ UnFreezeRef, FreezeUnFreezeRef, activeCardDetails, onFreezeSuccess, selectedAction, deleteCardRef, onActionComplete, activeCard, deleteCardData, deleteCardInfoLoader, onError, handleClose }: FreezeUnFreezeProps) => {
    const REVERSE_NEW_COLOR = useThemeColors(true);
    const reversCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
    const handleTouchIdRef = useRef<any>(null);
    const cardLockedRef = useRef<any>(null);
    const { decryptAES } = useEncryptDecrypt();
    const userInfo: UserInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const [freezeUnfreezeLoader, setFreezeUnfreezeLoader] = useState<boolean>(false);
    const { t } = useLngTranslation();
    const handleFreezeCard = () => {
        FreezeUnFreezeRef.current?.close();
        setTimeout(() => {
            cardLockedRef.current?.open();
        }, 1000);
    }
    const navigation = useNavigation<any>()
    const handleTouchID = (action?: string) => {
        if (action !== "unfreeze") {
            handleTouchIdRef.current?.close();
            cardLockedRef.current?.open();
        } else {
            handleContinue(action);
        }
    }


    const handleContinue = async (action: string) => {
        onError?.("");
        setFreezeUnfreezeLoader(true)
        let Obj: CardStatus = {
            "id": activeCard?.id || activeCardDetails?.cardId,
            "status": 1,
            "actionBy": action === "freeze" ? "Freezed" : "UnFreezed",
            "signImage": userInfo?.userName,
            "createdBy": userInfo?.userName
        }
        try {
            let response: any = await cardsService.updateCardFreezeAndUnFreeze(activeCard?.id || activeCardDetails?.cardId, Obj);
            if (response?.ok) {
                if (action === "freeze") {
                   showAppToast(t("GLOBAL_CONSTANTS.CARD_FREEGED_SUCCESSFULLY"), "success");
                    cardLockedRef.current?.close();
                } else if (action !== "freeze") {
                    UnFreezeRef.current?.close();
                    showAppToast(t("GLOBAL_CONSTANTS.CARD_UNFREEZED_SUCCESSFULLY"), "success");
                }
                else {
                    handleTouchIdRef.current?.close();
                }
                onFreezeSuccess?.();
                onActionComplete();
            } else {
                onError?.(isErrorDispaly(response));
            }
        } catch (error) {
            onError?.(isErrorDispaly(error))

        }
        finally {
            setFreezeUnfreezeLoader(false)
            if (action === "freeze") {
                cardLockedRef.current?.close();
            } else {
                UnFreezeRef.current?.close();
            }
        }

    }

    const handleDelete = () => {
        navigation.navigate('DeleteCard', { activeCard: activeCard, screenName: "Overview" })

    }
    const handleCancel = () => {
        handleClose?.()
    }

    return (
        <ViewComponent>
            <ViewComponent>
                <PopupOrSheet
                    ref={FreezeUnFreezeRef}
                    height={s(480)}
                    showCloseIcon={false}
                    showCloseIconAndTittle={false}
                // onClose={handleCancel}
                >
                    <ParagraphComponent
                        text={t("GLOBAL_CONSTANTS.FREEZE_THIS_CARD")}
                        style={[
                            reversCommonStyles.fs16, // A slightly larger font size for the title
                            reversCommonStyles.fw700, // Make it bold
                            reversCommonStyles.textWhite,
                            reversCommonStyles.mb16, // Add some margin below it
                            reversCommonStyles.textCenter,  // Center it
                        ]}
                    />
                    <ViewComponent style={[reversCommonStyles.alignCenter,]}>
                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.FREEZING_YOUR_CARD_WILL_RESULT_IN_THE_IMIDDITE_REJECTION_OR_REVERSAL_OF_ALL_PENDING_TRANSACTIONS"} style={[reversCommonStyles.fs14, reversCommonStyles.fw400, reversCommonStyles.textWhite, { textAlign: 'center' }]} />
                        <ParagraphComponent
                            style={[
                                reversCommonStyles.fs14,
                                reversCommonStyles.textWhite, // Base styles for the whole paragraph
                                reversCommonStyles.fw700,
                                reversCommonStyles.textCenter,
                                reversCommonStyles.mb20

                            ]}
                        >
                            {/* First part of the text inherits the parent style */}
                            {t("GLOBAL_CONSTANTS.ANY_ATTEMPTED_TRANSACTIONS_WHETHER_BY_YOU_OR_ANOTHER_PARTY_WILL_BE_AUTOMATICALLY_DECLINED")}
                        </ParagraphComponent>
                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.BULLSWIPE_WILL_NOT_BE_LIABLE_FOR_DECLINED_TRANSACTION_FEES_INCURRRED"}
                            style={[reversCommonStyles.fs14, reversCommonStyles.fw400, reversCommonStyles.textWhite, reversCommonStyles.mb16, reversCommonStyles.textCenter,]}
                        />

                        <ViewComponent style={[reversCommonStyles.dflex, reversCommonStyles.alignCenter, reversCommonStyles.gap16, reversCommonStyles.mt10]}>
                            <ViewComponent style={[reversCommonStyles.flex1]}>
                                <ButtonComponent
                                    title={"GLOBAL_CONSTANTS.CANCEL"}
                                    onPress={handleCancel}
                                    solidBackground={true}
                                    customContainerStyle={[{ height: s(50) }]}
                                />
                            </ViewComponent>
                            <ViewComponent style={[reversCommonStyles.flex1]}>
                                <ButtonComponent
                                    title={"GLOBAL_CONSTANTS.CONFIRM"}
                                    onPress={() => handleFreezeCard()}
                                    capitalizeTitle={false}
                                    solidBackground={false}
                                    customContainerStyle={[reversCommonStyles.rounded100, { height: s(50) }]}
                                    customTitleStyle={[reversCommonStyles.fs14, reversCommonStyles.fw700]}
                                />
                            </ViewComponent>

                        </ViewComponent>
                    </ViewComponent>
                </PopupOrSheet>
            </ViewComponent>
            <ViewComponent>
                <PopupOrSheet
                    ref={handleTouchIdRef}
                    height={s(350)}
                    showCloseIcon={false}
                >
                    <ViewComponent style={[reversCommonStyles.alignCenter, reversCommonStyles.justifyCenter, reversCommonStyles.flex1]}>
                        <ParagraphComponent
                            text="For your security, please verify your identity to freeze this card."
                            style={[reversCommonStyles.fs14, reversCommonStyles.fw400, reversCommonStyles.textAlwaysBlack, reversCommonStyles.mb24, reversCommonStyles.textCenter]}
                        />
                        {/* Fingerprint Icon */}
                        <ViewComponent style={[reversCommonStyles.alignCenter, reversCommonStyles.justifyCenter, reversCommonStyles.mb24]}>
                            {/* Replace with your actual SVG or PNG component */}
                            {/* <FingerprintIcon width={90} height={90} /> */}
                        </ViewComponent>
                        {/* Button */}
                        <ButtonComponent
                            title={t("GLOBAL_CONSTANTS.CONTINUE_WITH_TOUCH_ID")}
                            onPress={() => handleTouchID(selectedAction)}
                            customContainerStyle={[reversCommonStyles.bg_yellow, reversCommonStyles.rounded100, { width: s(225), height: s(50) }]}
                            customTitleStyle={[reversCommonStyles.fs14, reversCommonStyles.fw700, reversCommonStyles.textAlwaysBlack]}
                            solidBackground={false}
                            capitalizeTitle={false}
                        />
                        {/* Sign in link */}
                        <ParagraphComponent
                            text={t("GLOBAL_CONSTANTS.SIGN_IN")}
                            style={[reversCommonStyles.fs16, reversCommonStyles.textGrey6, reversCommonStyles.mt10, reversCommonStyles.textCenter]}
                        />
                    </ViewComponent>
                </PopupOrSheet>

            </ViewComponent>
            <ViewComponent>
                <PopupOrSheet
                    ref={cardLockedRef}
                    height={s(300)}
                    showCloseIcon={false}
                    showCloseIconAndTittle={false}

                >
                    <ViewComponent style={[reversCommonStyles.alignCenter, reversCommonStyles.justifyCenter]}>
                        {/* Bell Icon */}
                        <ImageUri uri={CARDS_URLS.lockIcon} width={s(90)} height={s(70)} />
                        <ViewComponent style={[commonStyles.mb16]} />
                        {/* Title */}
                        <TextMultiLanguage
                            text={"GLOBAL_CONSTANTS.CARD_LOCKED"}
                            style={[reversCommonStyles.fs14, reversCommonStyles.fw700, reversCommonStyles.textWhite, reversCommonStyles.mb16, reversCommonStyles.textCenter]}
                        />

                        <ParagraphComponent
                            style={[reversCommonStyles.fs14, reversCommonStyles.fw400, reversCommonStyles.textWhite, reversCommonStyles.mb16, reversCommonStyles.textCenter]}
                        >
                            {t("GLOBAL_CONSTANTS.YOUR_CARD_ENDING_IN")}<ParagraphComponent style={[reversCommonStyles.fw700, reversCommonStyles.textWhite]}>{decryptAES(activeCardDetails?.number)?.slice(-4) || " "}</ParagraphComponent>{' '}{t("GLOBAL_CONSTANTS.IS_CURRENTLY_FROZEN")}{"\n"}{t("GLOBAL_CONSTANTS.PLEASE_VISIT_THE_CARD_PAGE_IN_APP_TO_UNFREEZE_IT")}
                        </ParagraphComponent>

                        {/* Button */}
                        <ButtonComponent
                            title={"GLOBAL_CONSTANTS.Continue"}
                            onPress={() => handleContinue(selectedAction)}
                            customContainerStyle={[reversCommonStyles.bg_yellow, reversCommonStyles.rounded100, { width: s(225), height: s(50) }]}
                            customTitleStyle={[reversCommonStyles.fs14, reversCommonStyles.fw700, reversCommonStyles.textAlwaysBlack]}
                            solidBackground={false}
                            capitalizeTitle={false}
                            loading={freezeUnfreezeLoader}
                            disable={freezeUnfreezeLoader}
                        />
                    </ViewComponent>
                </PopupOrSheet>

            </ViewComponent>
            <ViewComponent>
                <PopupOrSheet
                    ref={UnFreezeRef}
                    height={s(350)}
                    showCloseIcon={false}
                    showCloseIconAndTittle={false}

                >
                    <ViewComponent style={[reversCommonStyles.alignCenter, reversCommonStyles.justifyCenter]}>
                        <ViewComponent style={[commonStyles.mb16]}>
                            <ImageUri uri={CARDS_URLS.lockIcon} width={s(90)} height={s(70)} />
                        </ViewComponent>
                        <ParagraphComponent
                            text={t("GLOBAL_CONSTANTS.UNFREEZE_THIS_CARD")}
                            style={[
                                reversCommonStyles.fs16, // A slightly larger font size for the title
                                reversCommonStyles.fw700, // Make it bold
                                reversCommonStyles.textWhite,
                                reversCommonStyles.mb16, // Add some margin below it
                                reversCommonStyles.textCenter,   // Center it
                            ]}
                        />
                        <ViewComponent style={[reversCommonStyles.alignCenter, reversCommonStyles.gap16]}>
                            <ParagraphComponent text={t("GLOBAL_CONSTANTS.ONCE_THE_ONE_KEY_CARD_LOCK_FUNCTION_IS_DISABLED_YOU_WILL_BE_ABLE_TO_USE_THIS_CARD")} style={[reversCommonStyles.fs14, reversCommonStyles.fw400, reversCommonStyles.textWhite, commonStyles.textCenter]} />

                            <ButtonComponent
                                title={t("GLOBAL_CONSTANTS.UN_FREEZE_CARD")}
                                onPress={() => handleContinue(selectedAction)}
                                customContainerStyle={[reversCommonStyles.bg_yellow, reversCommonStyles.rounded100, { width: s(225), height: s(50) }]}
                                customTitleStyle={[reversCommonStyles.fs16, reversCommonStyles.fw700, reversCommonStyles.textAlwaysBlack]}
                                solidBackground={false}
                                capitalizeTitle={false}
                                loading={freezeUnfreezeLoader}
                                disable={freezeUnfreezeLoader}
                            />
                        </ViewComponent>
                    </ViewComponent>
                </PopupOrSheet>
            </ViewComponent>

            <ViewComponent>
                <PopupOrSheet
                    ref={deleteCardRef}
                    height={s(360)}
                    showCloseIcon={false}
                    showCloseIconAndTittle={false}
                >
                    {deleteCardInfoLoader && (
                        <ViewComponent style={[reversCommonStyles.alignCenter, reversCommonStyles.justifyCenter, reversCommonStyles.flex1]}>
                            <ActivityIndicator size="large" color={REVERSE_NEW_COLOR.BG_YELLOW} />
                        </ViewComponent>
                    )}
                    {!deleteCardInfoLoader && (
                        <ViewComponent style={[reversCommonStyles.alignCenter, reversCommonStyles.justifyCenter, reversCommonStyles.flex1]}>
                            {/* Bell Icon */}
                            {/* Replace with your actual bell SVG or PNG component */}
                            <ImageUri source={require('../../../assets/imageAssets/depositeNotificationIcon.png')} width={s(120)} height={s(90)} style={[reversCommonStyles.mb12]} />
                            {/* </ViewComponent> */}

                            {/* Title */}
                            <ParagraphComponent
                                text={t("GLOBAL_CONSTANTS.DELETE_CARD?")}
                                style={[reversCommonStyles.fs16, reversCommonStyles.fw700, reversCommonStyles.textAlwaysBlack, reversCommonStyles.mb16, reversCommonStyles.textCenter]}
                            />

                            {/* Description */}
                            <ParagraphComponent style={[reversCommonStyles.fs14, reversCommonStyles.fw400, reversCommonStyles.textWhite, reversCommonStyles.mb32, reversCommonStyles.textCenter]}>
                                {t("GLOBAL_CONSTANTS.THIS_ACTION_WILL_PERMANENTLY_DELETE_THE_CARD_A_FEE_OF")}{' '}<Text style={reversCommonStyles.fw700}>{deleteCardData?.deleteFee?.amount}{' '}{deleteCardData?.deleteFee?.currency}</Text>{' '}{t("GLOBAL_CONSTANTS.WILL_APPLY")}
                            </ParagraphComponent>


                            {/* Button */}
                            <ButtonComponent
                                title={"GLOBAL_CONSTANTS.Continue"}
                                onPress={() => handleDelete()}
                                customContainerStyle={[reversCommonStyles.bg_yellow, reversCommonStyles.rounded100, { width: s(225), height: s(50) }]}
                                customTitleStyle={[reversCommonStyles.fs14, reversCommonStyles.fw700, reversCommonStyles.textAlwaysBlack]}
                                solidBackground={false}
                                capitalizeTitle={false}
                                loading={freezeUnfreezeLoader}
                                disable={freezeUnfreezeLoader}
                            />
                        </ViewComponent>)}
                </PopupOrSheet>

            </ViewComponent>
        </ViewComponent >
    );
}
export default FreezeUnFreeze;