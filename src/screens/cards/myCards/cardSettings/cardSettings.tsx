import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import ViewComponent from '../../../../newComponents/view/view';
import Container from '../../../../newComponents/container/container';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import CommonTouchableOpacity from '../../../../newComponents/touchableComponents/touchableOpacity';
import { s } from '../../../../constants/theme/scale';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import PopupOrSheet from '../../../../newComponents/models/PopupOrSheet';
import CommonInputText from '../../../../newComponents/textInputComponents/basic/inputText';
import ButtonComponent from '../../../../newComponents/buttons/button';
import { showAppToast } from '../../../../newComponents/ToasterMessages/ShowMessage';
import { isErrorDispaly } from '../../../../utils/helpers';
import { cardsService } from '../../../../apiServices/cardsApis/cardsApiServices';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useHardwareBackHandler } from '../../../../hooks/HardwareBackHandler';
import ImageBackgroundWrapper from '../../../../newComponents/imageComponents/ImageBackground';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import { CARDS_URLS } from '../../../../assets/blobUrls';
import ImageUri from '../../../../newComponents/imageComponents/image';
import { useLngTranslation } from '../../../../hooks/useLngTranslation';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';

const CardSettings = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const labelNameRef = React.useRef<any>(null);
    const { activeCard, onLabelUpdate, details } = route.params || {};
    const { decryptAES } = useEncryptDecrypt();
    const [cardDetails, setCardDetails] = useState<any>(activeCard);
    const [labelName, setLabelNameInput] = useState<string>(cardDetails?.lable || decryptAES(cardDetails?.cardName));
    const [lableNameError, setLableNameError] = useState<string | null>(null);
    const [validating, setValidating] = useState<boolean>(false);
    const { t } = useLngTranslation();
    const REVERSE_NEW_COLOR = useThemeColors(true);
    const reversCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
    const [error, setError] = useState<string>("");
    const cardNumber = cardDetails?.number;

    const handleBackPress = () => {
        navigation.goBack();
    };

    useHardwareBackHandler(() => {
        handleBackPress();
        return true;
    });

    useEffect(() => {
        if (route.params?.updatedAddress) {
            setCardDetails((prevDetails: any) => ({
                ...prevDetails,
                billingAddress: route.params.updatedAddress,
            }));
        }
    }, [route.params?.updatedAddress]);

    const handleSecuritySettings = () => navigation.navigate('SecuritySettings', {
        activeCard: cardDetails,
    });

    const handleChangeBilling = () => navigation.navigate('AddressForm', {
        addressType: 'billing',
        mode: 'change',
        fromScreen: 'CardSettings',
        activeCard: cardDetails,
    });

    const handleCardLabel = () => {
        labelNameRef.current?.open();
    };

    const handleReplaceCard = () => { navigation.navigate('ReplaceCard', { activeCard: cardDetails }) }
    const handleDeleteCard = () => { navigation.navigate('DeleteCard', { activeCard: cardDetails }) }

    const handleLableChange = async () => {
        setError("");
        try {
            // if (!labelName) {
            //     setLableNameError(`${t("GLOBAL_CONSTANTS.IS_REQUIRED")}`);
            //     return;
            // }
            if (labelName.length > 30) {
                setLableNameError(`${t("GLOBAL_CONSTANTS.LABLE_MUST_BE_30_CHARACTERS_OR_LESS")}`);
                return;
            }
            setValidating(true);
            setLableNameError(null);
            const body = {
                CardId: cardDetails?.id,
                LableName: labelName,
            };
            const response = await cardsService.updateCardLable(body);
            if (response.status == 200) {
                showAppToast(t("GLOBAL_CONSTANTS.CARD_LABEL_SAVED"), "success");
                labelNameRef.current?.close();
                setCardDetails((prevDetails: any) => {
                    const newDetails = { ...prevDetails, lable: labelName };
                    if (onLabelUpdate) {
                        onLabelUpdate(newDetails);
                    }
                    return newDetails;
                });
                setLabelNameInput(labelName)
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        } finally {
            setValidating(false);
        }
    };
    // const handleAuthClose = () => {
    //     setAuthOpen(false);
    // }
    // const handleAuthSucess = (verifications: any) => {
    //     setAuthOpen(false);
    //     if(actionName==='ReplaceCard'){
    //         navigation.navigate('ReplaceCard', { activeCard: cardDetails })
    //     }
    //     if(actionName==='DeleteCard'){
    //         navigation.navigate('DeleteCard', { activeCard: cardDetails })
    //     }
    // }
    // const verifyAuth = () => {
    //     setAuthOpen(true);
    // }
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <KeyboardAwareScrollView
                contentContainerStyle={[{ flexGrow: 1 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
            >
                <Container>
                    <PageHeader title={"GLOBAL_CONSTANTS.SETTINGS"} onBackPress={handleBackPress} />
                    {/* Card Info */}
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.cardslistbg, commonStyles.sectionGap, commonStyles.gap16]}>
                        <ViewComponent style={[commonStyles.rounded10]}>
                            <ImageBackgroundWrapper
                                source={{ uri: cardDetails?.logo }}
                                resizeMode="cover"
                                imageStyle={[commonStyles.rounded4]}
                                style={[{ height: s(40), width: s(60) }]}
                            >
                            </ImageBackgroundWrapper>
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.dflex]}>
                            <ParagraphComponent style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400, { maxWidth: s(140) }]} numberOfLines={1}
                                text={`${cardDetails.lable || decryptAES(cardDetails.cardName) || cardDetails.type || cardDetails.cardType}`} />
                            <ParagraphComponent style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]}
                                text={` **** ${(cardDetails.last4 || (cardNumber ? cardNumber.slice(-4) : ''))}`}
                            />
                        </ViewComponent>
                    </ViewComponent>

                    {/* Card Management */}
                    <TextMultiLanguage text="GLOBAL_CONSTANTS.CARD_MANAGEMENT" style={[commonStyles.fs14, commonStyles.fw600, commonStyles.titleSectionGap]} />
                    {details?.find((d: any) => d.id === 'security')?.isDisplay && (
                        <CommonTouchableOpacity style={[commonStyles.list, commonStyles.menuitemspace]} onPress={handleSecuritySettings}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
                                    <MaterialCommunityIcons name="shield-check-outline" size={s(18)} color={NEW_COLOR.TEXT_WHITE} />
                                </ViewComponent>
                                <TextMultiLanguage text="GLOBAL_CONSTANTS.SECURITY_SETTINGS" style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} />
                            </ViewComponent>
                            <Ionicons name="chevron-forward" size={s(20)} color={NEW_COLOR.TEXT_GREY} />
                        </CommonTouchableOpacity>
                    )}

                    {details?.find((d: any) => d.id === 'billing')?.isDisplay && (
                        <CommonTouchableOpacity style={[commonStyles.list, commonStyles.menuitemspace]} onPress={handleChangeBilling}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
                                    <Feather name="map-pin" size={s(18)} color={NEW_COLOR.TEXT_WHITE} />
                                </ViewComponent>
                                <TextMultiLanguage text={"GLOBAL_CONSTANTS.CHANGE_BILLING_ADDRESS"} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} />
                            </ViewComponent>
                            <Ionicons name="chevron-forward" size={s(20)} color={NEW_COLOR.TEXT_GREY} />
                        </CommonTouchableOpacity>
                    )}

                    <CommonTouchableOpacity style={[commonStyles.list, commonStyles.titleSectionGap]} onPress={handleCardLabel}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                            <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
                                <MaterialCommunityIcons name="credit-card-edit-outline" size={s(20)} color={NEW_COLOR.TEXT_WHITE} />
                            </ViewComponent>
                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.CARD_LABEL"} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} />
                        </ViewComponent>
                        <Ionicons name="chevron-forward" size={s(20)} color={NEW_COLOR.TEXT_GREY} />
                    </CommonTouchableOpacity>

                    {/* Card Actions */}
                    <TextMultiLanguage text="GLOBAL_CONSTANTS.CARD_ACTIONS" style={[commonStyles.fs14, commonStyles.fw600, commonStyles.mb16]} />
                    {details?.find((d: any) => d.id === 'replace')?.isDisplay && (
                        <CommonTouchableOpacity style={[commonStyles.list, commonStyles.menuitemspace]} onPress={handleReplaceCard}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
                                    <ImageUri width={s(22)} height={s(22)} uri={CARDS_URLS?.replaceCard} />
                                </ViewComponent>
                                <TextMultiLanguage text={"GLOBAL_CONSTANTS.REPLACE_CARD_TITLE"} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} />
                            </ViewComponent>
                            <Ionicons name="chevron-forward" size={s(20)} color={NEW_COLOR.TEXT_GREY} />
                        </CommonTouchableOpacity>
                    )}

                    {details?.find((d: any) => d.id === 'delete')?.isDisplay && (
                        <CommonTouchableOpacity style={[commonStyles.list]} onPress={handleDeleteCard}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
                                    <MaterialCommunityIcons name="credit-card-remove-outline" size={s(22)} color={NEW_COLOR.TEXT_WHITE} />
                                </ViewComponent>
                                <TextMultiLanguage text={"GLOBAL_CONSTANTS.DELETE_CARD_TITLE"} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} />
                            </ViewComponent>
                            <Ionicons name="chevron-forward" size={s(20)} color={NEW_COLOR.TEXT_GREY} />
                        </CommonTouchableOpacity>
                    )}
                </Container>
                <PopupOrSheet
                    ref={labelNameRef}
                    height={s(320)}
                    showCloseIconAndTittle={false}
                >
                    {error && <ErrorComponent message={error} screen={true} />}
                    <ViewComponent style={[]}>
                        <ViewComponent style={[commonStyles.alignCenter, commonStyles.mb16]}>
                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.CARD_LABEL"} style={[commonStyles.fs16, commonStyles.fw700, reversCommonStyles.textWhite]} />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                            {lableNameError ? (
                                <TextMultiLanguage style={[commonStyles.fs12, { color: NEW_COLOR.TEXT_RED }]} text={lableNameError} />
                            ) : (
                                <ViewComponent />
                            )}

                            <ParagraphComponent style={[commonStyles.fs12, commonStyles.textGrey]}>
                                {labelName.length}/30
                            </ParagraphComponent>
                        </ViewComponent>
                        <CommonInputText
                            value={labelName}
                            isModal={true}
                            onChangeText={text => {
                                setLabelNameInput(text);
                                setLableNameError(null);
                                setError("");
                            }}
                            maxLength={30}
                            placeholder={"GLOBAL_CONSTANTS.TRAVEL_OR_BUSINESS_EXPENSES"}
                        />

                        <ViewComponent style={[commonStyles.flex1, commonStyles.sectionGap]} />
                        <ButtonComponent
                            title={"GLOBAL_CONSTANTS.SAVE"}
                            onPress={handleLableChange}
                            loading={validating}
                            disable={validating || !labelName}
                        />
                    </ViewComponent>
                </PopupOrSheet>
            </KeyboardAwareScrollView>
        </ViewComponent>
    );
};

export default CardSettings;