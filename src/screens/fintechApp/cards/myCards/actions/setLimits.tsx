import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import ViewComponent from '../../../../../components/view/view';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import CommonTouchableOpacity from '../../../../../components/touchableComponents/touchableOpacity';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import { s } from '../../../../../components/theme/scale';
import { CurrencyText } from '../../../../../components/textComponets/currencyText/currencyText';
import Container from '../../../../../components/container/container';
import PageHeader from '../../../../../components/pageHeader/pageHeader';
import CustomRBSheet from '../../../../../components/models/commonBottomSheet';
import ButtonComponent from '../../../../../components/buttons/button';
import AmountInput from '../../../../../components/amountInput/amountInput';
import TextMultiLangauge from '../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import CardsModuleService from '../../../../../apiServices/cards';
import { formatAmount, isErrorDispaly } from '../../../../../utils/helpers';
import DashboardLoader from '../../../../../components/loader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Keyboard } from 'react-native';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import { setLimitInterfaceProps } from '../../dashoard/constants';
import ImageUri from '../../../../../components/imageComponents/image';
import { EditImage } from '../../../../../assets/svg';
import { showAppToast } from '../../../../../components/toasterMessages/ShowMessage';
import { t } from 'i18next';
import { getTabsConfigation } from '../../../../../../configuration';

const SetLimits: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { cardId, cardInfoData } = route?.params || {};
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const currency = getTabsConfigation('CURRENCY');
    const rbSheetRef = useRef<any>(null);
    const [selectedLimit, setSelectedLimit] = useState<any>(null);
    const [limitAmount, setLimitAmount] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [cardLimitTypes, setCardLimitTypes] = useState<any[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [validationError, setValidationError] = useState('');
    const [amountSheeterrorMsg, setAmountSheetErrorMsg] = useState('');
    const [cardInfo, setCardInfo] = useState<any>(null);

    useEffect(() => {
        fetchCardLimits();
    }, []);
    const fetchCardLimits = async () => {
        setPageLoading(true);
        try {
            const response: any = await CardsModuleService.getCardLimitsInfo(cardId);
            if (response.ok) {
                setCardLimitTypes(response?.data || []);
            } else {
                setErrorMsg(isErrorDispaly(response));
            }
            const cardResponse: any = await CardsModuleService.CardInfo(cardId);
            if (cardResponse.ok) {
                setCardInfo(cardResponse?.data);
            }
        } catch (error) {
            setErrorMsg(isErrorDispaly(error));
        } finally {
            setPageLoading(false);
        }
    };
    const handleEditLimit = (limit: any) => {
        setSelectedLimit(limit);
        setLimitAmount(limit.limitAmount.toString());
        setErrorMsg('');
        setValidationError('');
        rbSheetRef.current?.open();
    };



    const getLimitTitle = (limitType: string) => {
        const titleMap: Record<string, string> = {
            'DailyLimit': t('GLOBAL_CONSTANTS.SET_DAILY_LIMIT'),
            'MonthlyLimit': t('GLOBAL_CONSTANTS.SET_MONTHLY_LIMIT'),
            'WeeklyLimit': t('GLOBAL_CONSTANTS.SET_WEEKLY_LIMIT'),
            'YearlyLimit': t('GLOBAL_CONSTANTS.SET_YEARLY_LIMIT'),
            'TransactionLimit': t('GLOBAL_CONSTANTS.SET_TRANSACTION_LIMIT'),
        };
        return titleMap[limitType] || t('GLOBAL_CONSTANTS.TRANSACTION_LIMIT');
    };

    const handleSaveLimit = async () => {
        Keyboard.dismiss();
        setValidationError('');
        setLoading(true);

        const amount = parseFloat(limitAmount);
        if (!limitAmount || amount <= 0) {
            setAmountSheetErrorMsg(t('GLOBAL_CONSTANTS.PLEASE_ENTER_VALID_AMOUNT'));
            setLoading(false);
            return;
        }
        if (selectedLimit?.min && amount < selectedLimit.min) {
            setValidationError(`${selectedLimit?.displayName} ${t('GLOBAL_CONSTANTS.MUST_BE_AT_LEAST')} ${currency[userInfo?.currency]}${formatAmount(selectedLimit.min)}`);
            setLoading(false);
            return;
        }
        if (selectedLimit?.max && amount > selectedLimit.max) {
            setValidationError(`${selectedLimit?.displayName} ${t('GLOBAL_CONSTANTS.CANNOT_EXCEED')} ${currency[userInfo?.currency]}${formatAmount(selectedLimit.max)}`);
            setLoading(false);
            return;
        }
        const obj: setLimitInterfaceProps = {
            "cardId": cardId,
            "limit": parseFloat(limitAmount),
            "type": selectedLimit?.limitType,
        }
        try {
            const response: any = await CardsModuleService.setCardLimits(obj);
            if (response.ok) {
                setLoading(false);
                fetchCardLimits();
                showAppToast(`${selectedLimit?.displayName} ${t('GLOBAL_CONSTANTS.SET_SUCCESSFULLY')}`, 'success');

                rbSheetRef.current?.close();
            } else {
                setLoading(false);
                setAmountSheetErrorMsg(isErrorDispaly(response));
            }
        }
        catch (error) {
            setLoading(false);
            setAmountSheetErrorMsg(isErrorDispaly(error));
        }
        finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        rbSheetRef?.current?.close();
    };

    const handleSheetClose = () => {
        Keyboard.dismiss();
        setSelectedLimit(null);
        setLimitAmount('');
        setValidationError('');
        setAmountSheetErrorMsg('');
        setLoading(false);

    };
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {pageLoading ? (
                <SafeAreaView style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                    <DashboardLoader />
                </SafeAreaView>
            ) : (
                <Container style={[commonStyles.container]}>
                    <PageHeader title="GLOBAL_CONSTANTS.SET_LIMITS" onBackPress={() => navigation.goBack()} />
                    {errorMsg ? <ErrorComponent message={errorMsg} onClose={() => setErrorMsg("")} /> : null}
                    {cardInfo && (
                        <ViewComponent style={[commonStyles.cardslist]}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.titleSectionGap]}>
                                <ImageUri uri={cardInfoData?.image} width={s(80)} height={s(50)} style={[commonStyles.rounded6]} />
                                <ParagraphComponent
                                    text={`${cardInfoData?.type} **** ${cardInfoData?.number?.slice(-4)}`}
                                    style={[commonStyles.listprimarytext]}
                                />
                            </ViewComponent>

                            <ViewComponent >
                                {cardLimitTypes?.map((limit: any, index: number) => (
                                    <ViewComponent key={limit?.limitType}>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                                            <ParagraphComponent
                                                text={limit?.displayName}
                                                style={[commonStyles.listsecondarytext]}
                                            />
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                                                <CurrencyText
                                                    prifix={currency[userInfo?.currency]}
                                                    value={limit?.limitAmount}
                                                    style={[commonStyles.listprimarytext]}
                                                />
                                                <CommonTouchableOpacity onPress={() => handleEditLimit(limit)}>
                                                    <EditImage />
                                                </CommonTouchableOpacity>
                                            </ViewComponent>
                                        </ViewComponent>
                                        {index < cardLimitTypes.length - 1 && <ViewComponent style={[commonStyles.listitemGap]} />}
                                    </ViewComponent>
                                ))}
                            </ViewComponent>
                        </ViewComponent>
                    )}
                </Container>
            )}
            <CustomRBSheet
                refRBSheet={rbSheetRef}
                height={"Medium"}
                onClose={handleSheetClose}
                errorMessage={amountSheeterrorMsg}
                onErrorClose={() => setAmountSheetErrorMsg('')}
                draggable={true}
                closeOnPressMask={false}
            >
                <ViewComponent>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap2, commonStyles.mb6]}>
                        <TextMultiLangauge
                            text={selectedLimit ? getLimitTitle(selectedLimit.limitType) : "GLOBAL_CONSTANTS.EDIT_LIMIT"}
                            style={[commonStyles.sectionTitle]}
                        />
                        <ParagraphComponent
                            text={`(${currency[userInfo?.currency]})`}
                            style={[commonStyles.sectionTitle]}
                        />
                    </ViewComponent>
                    {selectedLimit?.min !== undefined &&
                        selectedLimit?.min !== null &&
                        selectedLimit?.max !== undefined &&
                        selectedLimit?.max !== null && (<ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4, commonStyles.titleSectionGap]}>
                            <ParagraphComponent text="GLOBAL_CONSTANTS.SET_A_LIMIT_BETWEEN" style={[commonStyles.setlimitpara]} />
                            <CurrencyText prifix={currency[userInfo?.currency]} value={selectedLimit?.min || 0} style={[commonStyles.textWhite]} />
                            <ParagraphComponent text="GLOBAL_CONSTANTS.AND" style={[commonStyles.setlimittext]} />
                            <CurrencyText prifix={currency[userInfo?.currency]} value={selectedLimit?.max || 0} style={[commonStyles.textWhite]} />
                        </ViewComponent>)}
                    <ViewComponent style={[commonStyles.titleSectionGap]} />
                    <AmountInput
                        label="GLOBAL_CONSTANTS.AMOUNT"
                        isRequired={true}
                        placeholder="GLOBAL_CONSTANTS.ENTER_AMOUNT"
                        maxLength={16}
                        onChangeText={(value: string) => {
                            setLimitAmount(value);
                            setValidationError('');
                            const amount = parseFloat(value);
                            if (value && amount > 0) {
                                if (selectedLimit?.min && amount < selectedLimit.min) {
                                    setValidationError(`${selectedLimit?.displayName} ${t('GLOBAL_CONSTANTS.MUST_BE_AT_LEAST')} ${currency[userInfo?.currency]}${formatAmount(selectedLimit.min)}`);
                                } else if (selectedLimit?.max && amount > selectedLimit.max) {
                                    setValidationError(`${selectedLimit?.displayName} ${t('GLOBAL_CONSTANTS.CANNOT_EXCEED')} ${currency[userInfo?.currency]}${formatAmount(selectedLimit.max)}`);
                                }
                            }
                        }}
                        value={limitAmount}
                        maxDecimals={2}
                        decimals={2}
                    />
                    {validationError && (
                        <ParagraphComponent
                            text={validationError}
                            style={[commonStyles.errormessagetext, commonStyles.mt8]}
                        />
                    )}
                    <ViewComponent style={[commonStyles.sectionGap]} />
                    <ViewComponent style={[commonStyles.sectionGap]} />


                    <ViewComponent style={[commonStyles.dflex, commonStyles.gap10]}>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <ButtonComponent
                                title="GLOBAL_CONSTANTS.CANCEL"
                                onPress={handleCancel}
                                solidBackground={true}
                                disable={loading}
                            />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <ButtonComponent
                                title="GLOBAL_CONSTANTS.SAVE"
                                onPress={handleSaveLimit}
                                loading={loading}
                                disable={loading}
                            />
                        </ViewComponent>
                    </ViewComponent>
                </ViewComponent>
            </CustomRBSheet>
        </ViewComponent>
    );
};

export default SetLimits;
