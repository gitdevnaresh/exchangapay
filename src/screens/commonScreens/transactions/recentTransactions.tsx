import { View, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { isErrorDispaly } from '../../../utils/helpers';
import { s } from '../../../constants/theme/scale';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import TransactionService from '../../../services/transaction';
import { useSelector } from 'react-redux';
import { useThemeColors } from '../../../hooks/useThemeColors';
import Loadding from '../skeltons';
import { transactionCard } from './skeltonViews';
import TransactionDetails from '../../TransactionDetails';
import { FormattedDateText } from '../../../newComponents/textComponets/dateTimeText/dateTimeText';
import {getThemedCommonStyles, statusColor } from '../../../assets/styles/CommonStyles';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import NoDataComponent from '../../../newComponents/noData/noData';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import TransactionBarChartIcon from '../../../assets/mainmenuicons/transactionBarChart';
import { AntDesign } from '@expo/vector-icons';
import { CurrencyText } from '../../../newComponents/textComponets/currencyText/currencyText';
import { useLngTranslation } from '../../../hooks/useLngTranslation';
import ViewComponent from '../../../newComponents/view/view';


interface RecentTransactionsProps {
    initialData?: any[];
    accountType: string;
    currency?: string;
    cardId?: string;
    recentTranscationReload?: boolean;
    handleRecentTranscationReloadDetails: (reload: boolean, error?: string | null) => void;
    displayTittle?: boolean; // Optional prop to control title display
    screenName?: string;

}
const RecentTransactions = (props: RecentTransactionsProps) => {
    const [recentData, setRecentData] = useState<any>([]);
    const [dataLoading, setDataloading] = useState<boolean>(!props.initialData || props.initialData.length === 0); // Set initial loading based on props
    const navigation = useNavigation<any>();
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [transactionId, setTransactionid] = useState<string>("");
    const [txType, setTxtype] = useState<string>("");
    const isFocused = useIsFocused();
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const isCustodial = false;
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const transactionCardContent = transactionCard(5);
    const [transactionTypes, setTransactionTypes] = useState<any>([]);
    const [showTittle, setShowTitle] = useState<boolean>(props.displayTittle !== undefined ? props.displayTittle : true);
    const { t } = useLngTranslation();
    useEffect(() => {
        if (props.initialData && props.initialData.length > 0) {
            setRecentData(props.initialData);
            setDataloading(false);
        } else if (props?.accountType && (isFocused || props?.recentTranscationReload)) {
            fetchData(props?.accountType);
        }
    }, [isFocused, userInfo, props?.recentTranscationReload, props?.accountType, props.initialData]);

    useEffect(() => {
        // Only fetch if no initialData, and either focused or reload requested
        if (props?.accountType && (isFocused || props?.recentTranscationReload)) {
            getTransactionTypes();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFocused, props.recentTranscationReload, props.accountType]);
    const fetchData = async (accountType: string) => {
        setDataloading(true);
        try {
            let response: any;
            response = await TransactionService.getNonCustodianTransactions(accountType, props?.currency || null, props?.cardId || "All");
            if (response.ok) {
                setRecentData(response?.data?.data);
                setDataloading(false);
                props?.handleRecentTranscationReloadDetails(false, null);
            } else {
                setDataloading(false);
                const errorMessage = isErrorDispaly(response);
                props?.handleRecentTranscationReloadDetails(false, errorMessage);
                return;
            }
        } catch (error) {
            const errorMessage = isErrorDispaly(error);
            props?.handleRecentTranscationReloadDetails(false, errorMessage);
            return;
        } finally {
            setDataloading(false);
        }
    };
    const getTransactionTypes = async () => {
        try {
            const response: any = await TransactionService.getTransactionTypesIcons();
            if (response.data) {
                setTransactionTypes(response?.data?.CustomerTransactionTypes);
            } else {
                const errorMessage = isErrorDispaly(response);
                props?.handleRecentTranscationReloadDetails(false, errorMessage);
            }
        } catch (error) {
            const errorMessage = isErrorDispaly(error);
            props?.handleRecentTranscationReloadDetails(false, errorMessage);
        }
    };
    const handleSeeAll = (screenName?: any) => {
        navigation?.navigate("TransactionList", {
            screenName: screenName,
            trasactionType: props?.accountType,
            cardId: props?.cardId,
            currency: props?.accountType == 'CryptoCoinBalance' ? '' : props?.currency
        })
    };

    const handleDetails = (item: any) => {
        setTransactionid(item?.id);
        setTxtype(item?.action);
        setModalVisible(true);
    };

    return (
        <View>
            <View>
                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.titleSectionGap]}>
                    {showTittle && <TextMultiLanguage text={"GLOBAL_CONSTANTS.TRANSACTIONS"} style={[commonStyles.sectionTitle]} />}
                    {showTittle && (recentData && recentData?.length > 0) && (
                        <TouchableOpacity style={[commonStyles.dflex, commonStyles.alignCenter,]} onPress={() => handleSeeAll(undefined)}>
                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.VIEW_ALL"} style={[commonStyles.sectionLink]} />

                        </TouchableOpacity>
                    )}
                </View>
                {props?.screenName === "MyCards" && (<View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.mb16]}>
                    <View>
                        <TextMultiLanguage text={t("GLOBAL_CONSTANTS.TRANSACTIONS")} style={[commonStyles.fs18, commonStyles.fw600, commonStyles.textWhite]} />
                    </View>
                    <View style={[commonStyles.dflex, commonStyles.alignCenter, { gap: s(12) }]}>
                        <TouchableOpacity onPress={() => handleSeeAll(props?.screenName)}>
                            <TransactionBarChartIcon color={NEW_COLOR.TEXT_WHITE} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('BillStatementList')}>
                            <AntDesign name="ellipsis1" size={24} color={NEW_COLOR.TEXT_WHITE} />
                        </TouchableOpacity>
                    </View>
                </View>)}


                {dataLoading && (
                    <Loadding contenthtml={transactionCardContent} />
                )}
                <>
                    {!dataLoading && recentData?.length > 0 &&
                        <View style={[commonStyles.rounded5, commonStyles.mb20]}>
                            {recentData?.map((item: any, index: number) => {
                                const txType = item.action || item.transactionType || item?.txType || item.type || "";
                                const wallet = item.walletCode || item.wallet || "";
                                const amount = item?.volume || item?.amount || item?.value || 0;
                                const state = isCustodial && (item?.state || item?.remarks || item?.status || "") || !isCustodial && (item?.state || item?.status);
                                return (
                                    <View key={item?.id}>
                                        <TouchableOpacity
                                            activeOpacity={0.9}
                                            onPress={() => handleDetails(item)}
                                        >
                                            {/* Main container for a single transaction row. The gap is conditional. */}
                                            <View style={[
                                                commonStyles.dflex,
                                                commonStyles.alignCenter,
                                                item?.cardNumber && commonStyles.gap16, // Apply gap only when the Visa icon is present
                                                commonStyles.transactionsCard
                                            ]}>
                                                <View style={[commonStyles.flex1, commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, item?.logo && commonStyles.ml10]}>

                                                    {/* Left Column: Transaction Title and Status/Date */}
                                                    <View>
                                                        <ParagraphComponent
                                                            text={txType || ""}
                                                            numberOfLines={1}
                                                            style={[commonStyles.fs14, commonStyles.fw700, commonStyles.textWhite, { maxWidth: s(180) }]}
                                                        />

                                                        {/* Row for Status and Date combined */}
                                                        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mt4, commonStyles.gap4]}>
                                                            {/* <ParagraphComponent
                                                                text={`${state} `}
                                                                style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}
                                                            /> */}
                                                            <FormattedDateText
                                                                value={item?.dateTime || item?.date || item?.transactionDate || ""}
                                                                conversionType="UTC-to-local"
                                                                style={[commonStyles.secondaryText]}
                                                            />
                                                        </View>
                                                    </View>
                                                    <ViewComponent style={{ alignItems: 'flex-end' }}>
                                                        <View style={[commonStyles.mb4]}>
                                                            <CurrencyText value={amount || 0} currency={item?.type || wallet} style={[commonStyles.fs14, commonStyles.fw700, NEW_COLOR.TEXT_WHITE, item?.cardNumber && { color: amount < 0 ? NEW_COLOR.TEXT_RED : NEW_COLOR.TEXT_WHITE }, commonStyles.textRight]} actionType={item?.action} />
                                                        </View>
                                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter,commonStyles.gap4]}>
                                                            <ViewComponent
                                                                style={{
                                                                    width: s(8),
                                                                    height: s(8),
                                                                    borderRadius: s(4),
                                                                    backgroundColor: statusColor[item?.state?.toLowerCase()] || NEW_COLOR.TEXT_GREY,
                                                                }}
                                                            />
                                                            <ParagraphComponent
                                                                text={item?.state}
                                                                style={[commonStyles.secondaryText]}
                                                            />
                                                        </ViewComponent>
                                                    </ViewComponent>
                                                   

                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                        {/* Render a divider unless it's the last item */}
                                        {index !== recentData.length - 1 && <View style={[commonStyles.transactionsGap]} />}
                                    </View>
                                );
                            })}
                        </View>
                    }
                </>
                {(!recentData || recentData?.length < 1 && !dataLoading) && (<View style={[]}>
                    <NoDataComponent Description={"GLOBAL_CONSTANTS.NO_DATA_AVAILABLE"} />
                </View>
                )}
            </View>
            {modalVisible && (
                <TransactionDetails
                    modalVisible={modalVisible}
                    transactionId={transactionId}
                    closePopUp={() => setModalVisible(false)}
                    txType={txType}
                />
            )}
        </View>
    )
}

export default RecentTransactions
