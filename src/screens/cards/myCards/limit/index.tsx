import React, { useEffect, useRef, useState } from 'react';
import {TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import SafeAreaViewComponent from '../../../../newComponents/safeArea/safeArea';
import SwokipayDashboardLoader from '../../../../newComponents/swokipayloader';
import ScrollViewComponent from '../../../../newComponents/scrollView/scrollView';
import Container from '../../../../newComponents/container/container';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import ViewComponent from '../../../../newComponents/view/view';
import { s } from '../../../../newComponents/theme/scale';
import { ActionLogParams, useActionLogging } from '../../../../hooks/loggingHook';
import PopupOrSheet from '../../../../newComponents/models/PopupOrSheet';
import ButtonComponent from '../../../../newComponents/buttons/button';
import { showAppToast } from '../../../../newComponents/ToasterMessages/ShowMessage';
import { formatCurrency, isErrorDispaly } from '../../../../utils/helpers';
import { useHardwareBackHandler } from '../../../../hooks/HardwareBackHandler';
import { cardsService } from '../../../../apiServices/cardsApis/cardsApiServices';
import { CardLimitUpdatePayload } from '../interface';
import { useSelector } from 'react-redux';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AmountInput from '../../../../newComponents/numericInputs/amountInput';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import EditPencilIcon from '../../../../assets/mainmenuicons/editPencilIcon';
import ImageBackgroundWrapper from '../../../../newComponents/imageComponents/ImageBackground';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';
import { Keyboard } from 'react-native';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { useLngTranslation } from '../../../../hooks/useLngTranslation';


const CardLimit = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const navigation = useNavigation<any>();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [dashboardLoading, setDashboardLoading] = useState<boolean>(false);
    const activeCard = props?.route?.params?.activeCard;
    const editLimitRef = useRef<any>(null);
    const REVERSE_NEW_COLOR = useThemeColors(true);
    const reversCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails); // Define a more specific type for state if possible
    const { logEvent } = useActionLogging();
    const isFoused = useIsFocused();
    const [editingLimit, setEditingLimit] = useState<any>(null);
    const [btnLoader, setBtnLoader] = useState<boolean>(false);
    const { decryptAES } = useEncryptDecrypt();
    const [cardLimit, setCardLimit] = useState<any>(null);
    const [limitType, setLimitType] = useState<string>("")
    const [amount, setAmount] = useState("");
    const [amountError, setAmountError] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<any>(null);
    const [error,setError]=useState<string>("");
    const { t } = useLngTranslation();


    useEffect(() => {
        setError("");
        getCardLimit()
    }, [isFoused]);
    // console.log(editingLimit?.dailyTransactionMaxLimit)
    const numericAmount = parseFloat(amount?.replace(/,/g, ''));
    const isLimitExceeded =
        (limitType === "Single transaction limit" && numericAmount > editingLimit?.singleTransactionMaxLimit) ||
        (limitType === "Daily transaction limit" && numericAmount > editingLimit?.dailyTransactionMaxLimit);
    const isLimitBetween =
        (limitType === "Single transaction limit" &&
            numericAmount <= editingLimit?.singleTransactionMinLimit) ||
        (limitType === "Daily transaction limit" &&
            numericAmount <= editingLimit?.singleTransactionMinLimit);


    const InfoRow = ({ label, value, onEditPress }: any) => (

        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.py6]}>

            <ParagraphComponent style={[commonStyles.listsecondarytext]} text={label} />

            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>

                <ParagraphComponent style={[commonStyles.listprimarytext, onEditPress && commonStyles.mr8]} text={value} />
                {onEditPress && (
                    <TouchableOpacity onPress={onEditPress} >
                        <EditPencilIcon height={s(16)} width={s(16)} />
                    </TouchableOpacity>
                )}
            </ViewComponent>
        </ViewComponent>
    );
    const handleEditPress = (limitType: string) => {
        setError("");
        setErrorMsg("");
        if (limitType) {
            setEditingLimit(cardLimit);
            let updateAmount = limitType == 'Daily transaction limit' ? cardLimit?.dailyLimit : cardLimit?.singleTransactionLimit;
            setLimitType(limitType)
            setAmount(updateAmount?.toString() || '');
            setAmountError(null);
            setErrorMsg(null);
            editLimitRef?.current?.open();
        }
    }
    useHardwareBackHandler(() => {
        backArrowButtonHandler();
    });
    const backArrowButtonHandler = () => {
        const actionData: ActionLogParams = {
            screename: 'MyCardsList',
            actionName: 'Navigate Back via Hardware Button',
            actionType: 'HardwareButton',
        };
        logEvent('navigation_action', actionData);
        navigation.navigate('MyCards', { cardId: activeCard.id, animation: 'slide_from_left' });

    }
    const getCardLimit = async () => {
        setError("");
        setDashboardLoading(true)
        try {
            let response: any = await cardsService.getCardLimit(activeCard.id);
            if (response?.ok) {
                setCardLimit(response?.data);
            } else {
                setError(isErrorDispaly(response))
            }

        } catch (error) {
            setError(isErrorDispaly(error))
        }
        finally {
            setDashboardLoading(false)
        }

    }
    const handleEditLimit = async (limitType: string) => {
        Keyboard.dismiss();
        setErrorMsg(null);
        const numericAmount = parseFloat(amount.replace(/,/g, ''));
        if (amount == '') {
            setAmountError("Please enter amount");
            return;
        }
        if (limitType == "Single transaction limit" && numericAmount < cardLimit?.singleTransactionMinLimit) {
            setAmountError(`Minimum allowed limit is ${"$ "}${cardLimit?.singleTransactionMinLimit}`); setBtnLoader(false);
            return;
        }

        if (limitType == "Single transaction limit" && numericAmount > cardLimit?.singleTransactionMaxLimit) {
            setAmountError(`Maximum allowed limit is ${"$ "}${cardLimit?.singleTransactionMaxLimit}`); setBtnLoader(false);
            return;
        }
        if (limitType !== "Single transaction limit" && numericAmount < cardLimit?.dailyTransactionMinLimit) {
            setAmountError(`Minimum allowed limit is ${"$ "}${cardLimit?.dailyTransactionMinLimit}`); setBtnLoader(false);
            return;
        }

        if (limitType !== "Single transaction limit" && numericAmount > cardLimit?.dailyTransactionMaxLimit) {
            setAmountError(`Maximum allowed limit is ${"$ "}${cardLimit?.dailyTransactionMaxLimit}`); setBtnLoader(false);

            return;
        }
        let type = limitType == "Single transaction limit" && "SingleTransactionLimit" || "DailyTransactionLimit"
        let obj: CardLimitUpdatePayload = {
            "cardId": activeCard.id,
            "limit": parseFloat(amount.replace(/,/g, '')),
            "modifiedBy": decryptAES(userInfo?.userName),
        }
        setBtnLoader(true);
        try {
            let response: any = await cardsService.updateCardLimit(type, obj);
            if (response?.ok) {
                setBtnLoader(false);
                await getCardLimit();
                editLimitRef?.current?.close();
                showAppToast(t("GLOBAL_CONSTANTS.TRANSACTION_LIMIT_UPDATED_SUCCESFULLY"), "success")
            } else {
                setBtnLoader(false);
                setErrorMsg(isErrorDispaly(response));
                return;
            }

        } catch (error) {
            setBtnLoader(false);
            setErrorMsg(isErrorDispaly(error));
            return;
        }
    }
    const handleCancel = () => {
        setErrorMsg(null);
        setError("");
        editLimitRef?.current?.close();

    }
    return (
        <SafeAreaViewComponent style={commonStyles.screenBg}>
            {dashboardLoading && (
                <SwokipayDashboardLoader />
            )}

            {!dashboardLoading && (
                <>
                    <ScrollViewComponent >
                        <Container>

                            <PageHeader title={"GLOBAL_CONSTANTS.CARD_LIMIT"} onBackPress={backArrowButtonHandler} />
                           {error&&<ErrorComponent message={error} screen={true}/>}
                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.TRANSACTION_LIMIT_AND_DAILY_LIMIT_FOR_THIS_CARD"} style={[commonStyles.textGrey, commonStyles.fs14, commonStyles.fw400, commonStyles.sectionGap]} />
                            <ViewComponent style={[commonStyles.textWhite, commonStyles.rounded16,]}>
                                <ViewComponent style={[commonStyles.p8, commonStyles.applycardbg, commonStyles.rounded12]}>
                                    <ViewComponent style={[commonStyles.flexRow, commonStyles.alignCenter,commonStyles.titleSectionGap ]}>
                                        <ImageBackgroundWrapper
                                            source={{ uri: activeCard?.logo }}
                                            resizeMode="cover"
                                            imageStyle={[commonStyles.rounded4]}
                                            style={[{ height: s(40), width: s(60) }]}
                                        >
                                        </ImageBackgroundWrapper>

                                        <ViewComponent style={[commonStyles.dflex, commonStyles.ml10]}>
                                            <ParagraphComponent style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400, { maxWidth: s(140) }]} numberOfLines={1}
                                                text={
                                                    cardLimit?.label
                                                        ? cardLimit?.label || decryptAES(cardLimit?.label)
                                                        : cardLimit?.type || ""
                                                } />
                                            <ParagraphComponent style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.ml4, commonStyles.fw400]}
                                                text={
                                                    cardLimit
                                                        ? `**** ${(cardLimit?.number)?.slice(-4) || ""}`
                                                        : ""
                                                } />
                                        </ViewComponent>
                                    </ViewComponent>

                                    <InfoRow
                                        label={t("GLOBAL_CONSTANTS.SINGLE_TRANSACTION_LIMIT")}
                                        value={cardLimit?.singleTransactionLimit && (formatCurrency(cardLimit?.singleTransactionLimit, 2) + " " + cardLimit?.currency) || ""}
                                        onEditPress={() => handleEditPress('Single transaction limit')}
                                    />
                                    <InfoRow
                                        label={t("GLOBAL_CONSTANTS.DAILY_LIMIT")}
                                        value={cardLimit?.dailyLimit && (formatCurrency(cardLimit?.dailyLimit, 2) + " " + cardLimit?.currency) || ""}
                                        onEditPress={() => handleEditPress('Daily transaction limit')}
                                    />
                                    <InfoRow label={t("GLOBAL_CONSTANTS.RESETS_AT")} value={cardLimit?.resetsAt || ""} />

                                    <InfoRow label={t("GLOBAL_CONSTANTS.REMAINING_LIMIT")} value={formatCurrency(cardLimit?.remainingLimit, 2) + " " + cardLimit?.currency} />

                                </ViewComponent>
                                {/* <ViewComponent style={[commonStyles.px16, commonStyles.applycardbg, commonStyles.mt10, commonStyles.rounded12]}>
                                    <InfoRow label={t("GLOBAL_CONSTANTS.RESETS_AT")} value={cardLimit?.resetsAt || ""} />

                                    <InfoRow label={t("GLOBAL_CONSTANTS.REMAINING_LIMIT")} value={formatCurrency(cardLimit?.remainingLimit, 2) + " " + cardLimit?.currency} />


                                </ViewComponent> */}
                            </ViewComponent>

                            <ViewComponent style={{ flex: 1 }} />

                        </Container>



                    </ScrollViewComponent>
                    <PopupOrSheet
                        ref={editLimitRef}
                        height={s(360)}
                        showCloseIcon={false}
                        showCloseIconAndTittle={false}
                    >

                        <ViewComponent style={[reversCommonStyles.flex1]}>
                            <KeyboardAwareScrollView
                                contentContainerStyle={[{ flexGrow: 1 }]}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                                enableOnAndroid={true}
                                scrollEnabled={false}
                            >

                                <ViewComponent style={[reversCommonStyles.alignCenter]}>
                                    {errorMsg && <ErrorComponent message={errorMsg} />}

                                    <ParagraphComponent style={[reversCommonStyles.fs16, reversCommonStyles.fw700, reversCommonStyles.textWhite, reversCommonStyles.mb16]} text={limitType}/>
                                    <ViewComponent style={[reversCommonStyles.alignCenter, reversCommonStyles.mb16]}>
                                        <AmountInput value={amount} onChangeText={setAmount} containerStyle={{
                                            marginVertical: 0,
                                        }}
                                            placeholder="0.00"
                                            isError={!!amountError} // Pass boolean flag
                                            error={amountError || ''}
                                            inputStyle={{
                                                color: reversCommonStyles.textWhite.color,
                                                fontSize: s(48),
                                            }} />
                                    </ViewComponent>

                                    {amountError === null && (<>
                                        {(isLimitExceeded == false) && (
                                            <ViewComponent style={[reversCommonStyles.dflex, reversCommonStyles.alignCenter, reversCommonStyles.sectionGap]}>
                                                <Feather name="info" size={s(20)} color={NEW_COLOR.BG_YELLOW} />
                                                <ParagraphComponent style={[reversCommonStyles.fs14, reversCommonStyles.fw400, reversCommonStyles.ml8, reversCommonStyles.textWhite]}>
                                                    {`${t("GLOBAL_CONSTANTS.SET_A_LIMIT_BETWEEN")} $ ${limitType == "Single transaction limit" && formatCurrency(editingLimit?.singleTransactionMinLimit, 2) || formatCurrency(editingLimit?.dailyTransactionMinLimit, 2)} to $ ${limitType == "Single transaction limit" && formatCurrency(editingLimit?.singleTransactionMaxLimit, 2) || formatCurrency(editingLimit?.dailyTransactionMaxLimit, 2)}`}
                                                </ParagraphComponent>
                                            </ViewComponent>)}

                                        {(isLimitExceeded == true) && (
                                            <ViewComponent
                                                style={[
                                                    reversCommonStyles.dflex,
                                                    reversCommonStyles.alignCenter,
                                                    reversCommonStyles.sectionGap
                                                ]}
                                            >
                                                <Feather name="info" size={s(24)}

                                                    color={NEW_COLOR.TEXT_RED}
                                                />
                                                <ParagraphComponent
                                                    style={[
                                                        reversCommonStyles.fs14,
                                                        reversCommonStyles.fw400,
                                                        { color: NEW_COLOR.TEXT_RED, marginLeft: s(8) },
                                                    ]}

                                                    text={`${t("GLOBAL_CONSTANTS.MAXIMUM_ALLOWED_LIMIT_IS")} $ ${limitType === "Single transaction limit"
                                                        ? formatCurrency(editingLimit?.singleTransactionMaxLimit, 2)
                                                        : formatCurrency(editingLimit?.dailyTransactionMaxLimit, 2)
                                                        }`}
                                                />
                                            </ViewComponent>
                                        )}


                                    </>)}

                                </ViewComponent>

                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                    <ViewComponent style={[commonStyles.flex1]}>
                                        <ButtonComponent
                                            title={"GLOBAL_CONSTANTS.CANCEL"}
                                            onPress={handleCancel}
                                            solidBackground={true}
                                            customContainerStyle={[{ height: s(50) }]}
                                        />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.flex1]}>
                                        <ButtonComponent
                                            title={"GLOBAL_CONSTANTS.CONFIRM"}
                                            onPress={() => handleEditLimit(limitType)}
                                            capitalizeTitle={false}
                                            loading={btnLoader}
                                            disable={btnLoader || isLimitExceeded || isLimitBetween || amount <= 0}
                                            customContainerStyle={[reversCommonStyles.rounded100, { height: s(50) }]}
                                            customTitleStyle={[reversCommonStyles.fs14, reversCommonStyles.fw700]}
                                        />
                                    </ViewComponent>

                                </ViewComponent>
                            </KeyboardAwareScrollView>
                        </ViewComponent>
                    </PopupOrSheet>
                </>
            )}
        </SafeAreaViewComponent>
    );
};

export default CardLimit;