import React, { useState, useRef, useEffect } from 'react';
import { Text, TouchableOpacity, } from 'react-native';
import { format, subMonths, startOfYear, endOfYear, subYears, startOfMonth, endOfMonth } from 'date-fns';
import { s } from 'react-native-size-matters';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Container from '../../../../newComponents/container/container';
import ViewComponent from '../../../../newComponents/view/view';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import CustomCalendar from '../../../../newComponents/customCalender';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import ImageBackgroundWrapper from '../../../../newComponents/imageComponents/ImageBackground';
import FlatListComponent from '../../../../newComponents/flatList/flatList';
import CommonTouchableOpacity from '../../../../newComponents/touchableComponents/touchableOpacity';
import PopupOrSheet from '../../../../newComponents/models/PopupOrSheet';
import TransactionService from '../../../../services/transaction';
import { formatDateMonth, getFormattedEmail, isErrorDispaly } from '../../../../utils/helpers';
import { useSelector } from 'react-redux';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import ButtonComponent from '../../../../newComponents/buttons/button';
import ScrollViewComponent from '../../../../newComponents/scrollView/scrollView';
import ImageUri from '../../../../newComponents/imageComponents/image';
import { showAppToast } from '../../../../newComponents/ToasterMessages/ShowMessage';
import AntDesign from '@expo/vector-icons/AntDesign';
import { ActionLogParams, useActionLogging } from '../../../../hooks/loggingHook';
import { useHardwareBackHandler } from '../../../../hooks/HardwareBackHandler';
import { useLngTranslation } from '../../../../hooks/useLngTranslation';
import { CARDS_URLS, COMMON_SVG_URLS } from '../../../../assets/blobUrls';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';


const BillStatementScreen = (props: any) => {
    const cardSheetRef = useRef<any>(null);
    const exportPopupRef = useRef<any>(null);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const REVERSE_NEW_COLOR = useThemeColors(true);
    const reversCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const calendarSheetRef = useRef<any>(null);
    const [generateLoader, setGenerateLoader] = useState<boolean>(false)
    const { logEvent } = useActionLogging();
    const { t } = useLngTranslation();
    const [error, setError] = useState<string>('');
    const [filters, setFilters] = useState<any>({
        card: {
            label: props?.route?.params?.activeCard?.label,
            value: props?.route?.params?.activeCard?.value,
            logo: props?.route?.params?.activeCard?.logo || CARDS_URLS.cardImage
        },
        cardOptions: [],
    });
    useHardwareBackHandler(() => {
        backArrowButtonHandler();
    });

    const [activeDateFilter, setActiveDateFilter] = useState('custom');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [datePickerFor, setDatePickerFor] = useState('start');
    const navigation = useNavigation<any>();
    const { decryptAES } = useEncryptDecrypt();
    const isFocused = useIsFocused();
    useEffect(() => {
        setError("");
        getCardOptions();
    }, [isFocused]);

    const getCardOptions = async () => {
        setError("");
        try {
            const response: any = await TransactionService.getCardsInfo();
            if (response.ok && response.data) {
                const formattedCards = response.data?.map((card: any) => ({

                    label: `${card.cardType} **** ${card.cardNumber.slice(-4)}`,
                    value: card.id,
                    logo: card.logo,
                    name: card.name
                }));

                setFilters((prev: any) => ({
                    ...prev,
                    cardOptions: [
                        { label: 'All cards', value: 'All', logo: CARDS_URLS.cardImage, name: "All" },
                        ...formattedCards,
                    ],
                }));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        }
    };

    const handleDateFilterSelect = (filter: string) => {
        setActiveDateFilter(filter);
        const today = new Date();
        let start, end;
        if (filter === 'lastMonth') {
            const lastMonth = subMonths(today, 1);
            start = startOfMonth(lastMonth); end = endOfMonth(lastMonth);
        } else if (filter === 'thisYear') {
            start = startOfYear(today); end = endOfYear(today);
        } else if (filter === 'lastYear') {
            const lastYear = subYears(today, 1);
            start = startOfYear(lastYear); end = endOfYear(lastYear);
        } else return;
        setStartDate(start); setEndDate(end);
    };

    const handleSelectFilter = (type: string, value: any) => {
        setFilters((prev: any) => ({ ...prev, [type]: value }));
        if (type === 'card') cardSheetRef.current?.close();
    };

    const handleDateSelect = (date: Date) => {
        if (datePickerFor === 'start') setStartDate(date);
        else setEndDate(date);
        calendarSheetRef.current?.close();
    };


    const handleExport = () => {
        setError("");
        exportPopupRef.current?.open();
    }




    const renderDateFilterButton = (label: string, filter: string) => (
        <TouchableOpacity
            style={[
                activeDateFilter !== filter && { backgroundColor: NEW_COLOR.BANNER_BG },
                commonStyles.mr10, commonStyles.rounded20, commonStyles.px18, commonStyles.py12,
                activeDateFilter === filter && { borderWidth: 1, borderColor: NEW_COLOR.CARD_STATE_BORDER }
            ]}
            onPress={() => handleDateFilterSelect(filter)}>
            <Text style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.fw400]}>{label}</Text>
        </TouchableOpacity>
    );

    const backArrowButtonHandler = () => {
        const actionData: ActionLogParams = {
            screename: 'BillStatement',
            nextScreenName: 'BillStatementList',
            actionType: 'Button',
            actionName: "button_press"
        };
        logEvent('button_press', actionData);
        navigation.goBack();

    };


    const handleConfirmExport = async () => {
        setError("");
        setGenerateLoader(true)
        try {
            let response: any = await TransactionService.getGenerateTransaction(filters?.card?.value, formatDateMonth(startDate), formatDateMonth(endDate));
            if (response?.ok) {
                showAppToast(`${t("GLOBAL_CONSTANTS.BILL_STATEMENT_IS_RECEIVED_FOR")} ${decryptAES(userInfo?.email)}`, "success");
                setGenerateLoader(false)
            } else {
                setError(isErrorDispaly(response));
                setGenerateLoader(false)
            }
        } catch (error) {
            setError(isErrorDispaly(error));
            setGenerateLoader(false)
        } finally {
            exportPopupRef.current?.close();
            setGenerateLoader(false)
        }
    };

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <ScrollViewComponent contentContainerStyle={{ flexGrow: 1 }}>
                <Container >

                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                        <PageHeader title={t("GLOBAL_CONSTANTS.BILL_STATEMENT")} onBackPress={backArrowButtonHandler} />
                    </ViewComponent>
                    {error && <ErrorComponent message={error} screen={true} />}
                    <TouchableOpacity style={[commonStyles.rounded12, commonStyles.mb30, commonStyles.px16, commonStyles.py12, commonStyles.dflex, commonStyles.alignCenter, { backgroundColor: NEW_COLOR.APPLY_CARD_BG }]} onPress={() => cardSheetRef.current?.open()}>
                        <ImageBackgroundWrapper
                            source={{ uri: filters?.card?.logo }}
                            resizeMode="cover"
                            imageStyle={[commonStyles.rounded4]}
                            style={[{ height: s(40), width: s(60), marginRight: s(16) }]}
                        >
                        </ImageBackgroundWrapper>
                        <ParagraphComponent text={filters?.card?.label} style={[commonStyles.flex1, commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} />
                        <AntDesign name="right" size={s(16)} color={NEW_COLOR.TEXT_WHITE} />
                    </TouchableOpacity>

                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifystart, commonStyles.mb20]}>
                        {renderDateFilterButton('Last month', 'lastMonth')}
                        {renderDateFilterButton('This year', 'thisYear')}
                        {renderDateFilterButton('Last year', 'lastYear')}
                    </ViewComponent>

                    <ViewComponent style={[commonStyles.titleSectionGap]}>
                        <ParagraphComponent text={t("GLOBAL_CONSTANTS.CUSTOM")} style={[commonStyles.textWhite, commonStyles.fs16, commonStyles.mb10]} />
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifystart]}>
                            <TouchableOpacity
                                style={[commonStyles.px16, commonStyles.py12, commonStyles.rounded20, { borderWidth: 1, borderColor: "transparent", backgroundColor: NEW_COLOR.BANNER_BG }, activeDateFilter === 'custom' && datePickerFor === 'start' && NEW_COLOR.CARD_STATE_BORDER]}
                                onPress={() => {
                                    setDatePickerFor('start'); calendarSheetRef.current?.open();
                                }}>
                                <ParagraphComponent text={format(startDate, 'dd MMMM yyyy')} style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.fw400, commonStyles.textCenter]} />
                            </TouchableOpacity>

                            <ParagraphComponent text="to" style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400, commonStyles.ml_mr10]} />
                            <TouchableOpacity
                                style={[commonStyles.rounded20, { borderWidth: 1, borderColor: "transparent", backgroundColor: NEW_COLOR.BANNER_BG }, commonStyles.px16, commonStyles.py12, activeDateFilter === 'custom' && datePickerFor === 'end' && NEW_COLOR.CARD_STATE_BORDER]}
                                onPress={() => {
                                    setDatePickerFor('end'); calendarSheetRef.current?.open();
                                }}>
                                <ParagraphComponent text={format(endDate, 'dd MMMM yyyy')} style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.fw400, commonStyles.textCenter]} />
                            </TouchableOpacity>
                        </ViewComponent>
                    </ViewComponent>

                    <ViewComponent style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: s(20) }}>
                        <ViewComponent style={[commonStyles.sectionGap, commonStyles.rounded12, commonStyles.p16, { backgroundColor: '#151519' }, commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                            <ParagraphComponent text={t("GLOBAL_CONSTANTS.FILE_FORMATE")} style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw400]} />
                            <ParagraphComponent text={t("GLOBAL_CONSTANTS.PDF")} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} />
                        </ViewComponent>

                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.sectionGap, commonStyles.rounded12, commonStyles.p16, { backgroundColor: '#151519' }]}>
                            <ParagraphComponent text={t("GLOBAL_CONSTANTS.RECEIVING_EMAIL")} style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw400]} />
                            <ParagraphComponent text={getFormattedEmail(decryptAES(userInfo?.email))} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} />
                        </ViewComponent>

                        <ButtonComponent
                            title={t("GLOBAL_CONSTANTS.EXPORT")}
                            onPress={handleExport}
                        />
                        <ViewComponent style={[commonStyles.titleSectionGap]} />
                    </ViewComponent>

                    <PopupOrSheet ref={cardSheetRef} title={t("GLOBAL_CONSTANTS.SELECT_CARD")} height={s(380)} >
                        <ViewComponent>
                            <FlatListComponent
                                data={filters.cardOptions}
                                keyExtractor={(item: any) => item.value}
                                renderItem={({ item }: { item: any }) => {
                                    const isSelected = filters.card.value === item.value;
                                    return (
                                        <CommonTouchableOpacity
                                            onPress={() => handleSelectFilter('card', item)}
                                            style={[reversCommonStyles.dflex, reversCommonStyles.alignCenter, reversCommonStyles.justifyContent, reversCommonStyles.p12, isSelected && { backgroundColor: '#f0f0f0' }, reversCommonStyles.rounded12, reversCommonStyles.mb12]}
                                        >
                                            <ViewComponent style={[reversCommonStyles.dflex, reversCommonStyles.alignCenter]}>
                                                <ImageBackgroundWrapper
                                                    source={{ uri: item.logo }}
                                                    resizeMode="cover"
                                                    imageStyle={[reversCommonStyles.rounded8]}
                                                    style={[{ height: s(40), width: s(60), marginRight: s(12) }]}
                                                >
                                                </ImageBackgroundWrapper>
                                                <ParagraphComponent text={item.label} style={[reversCommonStyles.fs16, reversCommonStyles.fw500, { color: '#000' }]} />
                                            </ViewComponent>
                                            <ViewComponent
                                                style={[
                                                    reversCommonStyles.justifyCenter,
                                                    reversCommonStyles.alignCenter,
                                                    {
                                                        height: s(24),
                                                        width: s(24),
                                                        borderRadius: s(14),
                                                        backgroundColor: isSelected ? '#E1E31E' : 'transparent',
                                                        borderWidth: isSelected ? 0 : s(2),
                                                        borderColor: '#E0E0E0'
                                                    }
                                                ]}
                                            >

                                                {isSelected && (
                                                    <ViewComponent style={[{
                                                        height: s(24),
                                                        width: s(24),
                                                    }, reversCommonStyles.rounded12, reversCommonStyles.bg_yellow, reversCommonStyles.justifyCenter, reversCommonStyles.alignCenter]}>
                                                        <MaterialIcons name="check" size={s(16)} color={"black"} />
                                                    </ViewComponent>
                                                )}
                                            </ViewComponent>

                                        </CommonTouchableOpacity>
                                    );
                                }}
                                showsVerticalScrollIndicator={false}
                            />
                        </ViewComponent>
                    </PopupOrSheet>

                    <PopupOrSheet showCloseIcon={true} ref={exportPopupRef} height={s(280)} showCloseIconAndTittle={false}>
                        <ViewComponent style={[reversCommonStyles.justifyCenter, reversCommonStyles.alignCenter, reversCommonStyles.rounded30, reversCommonStyles.textWhite]}>
                            <ViewComponent style={[commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mb16]}>
                                <ImageUri uri={COMMON_SVG_URLS.alert_Icon} width={s(90)} height={s(70)} />
                            </ViewComponent>
                            <ParagraphComponent text={t("GLOBAL_CONSTANTS.BILLING_STATEMENT")} style={[reversCommonStyles.fs16, reversCommonStyles.fw700, reversCommonStyles.mb16, reversCommonStyles.textWhite]} />
                            <ParagraphComponent text={t("GLOBAL_CONSTANTS.YOUR_BILLING_STATEMENT_HAS_BEEN_SENT_BY_EMAIL")} style={[reversCommonStyles.fs14, reversCommonStyles.fw400, reversCommonStyles.textWhite, reversCommonStyles.textCenter, reversCommonStyles.listGap, { lineHeight: s(24) }]} />
                            <ButtonComponent title="GLOBAL_CONSTANTS.OK" onPress={handleConfirmExport} loading={generateLoader} disable={generateLoader} customButtonStyle={{ width: s(225), height: s(50) }} />

                        </ViewComponent>
                    </PopupOrSheet>
                    <PopupOrSheet
                        displayType="bottom-sheet"
                        ref={calendarSheetRef}
                        height={s(500)} // Adjust as needed
                        title={t("GLOBAL_CONSTANTS.SELECT_DATE")}
                        showCloseIconAndTittle={false}
                    >
                        <CustomCalendar
                            initialDate={datePickerFor === 'start' ? startDate : endDate}
                            onDateSelect={handleDateSelect}
                            onClose={() => calendarSheetRef.current?.close()}
                            maxDate={new Date()} // This will disable all future dates
                        />
                    </PopupOrSheet>
                </Container>
            </ScrollViewComponent>
        </ViewComponent>
    );
};



export default BillStatementScreen;