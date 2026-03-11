import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import PopupOrSheet from '../../../../newComponents/models/PopupOrSheet';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import Container from '../../../../newComponents/container/container';
import ViewComponent from '../../../../newComponents/view/view';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import TransactionService from '../../../../services/transaction';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import { FormattedDateText } from '../../../../newComponents/textComponets/dateTimeText/dateTimeText';
import { CurrencyText } from '../../../../newComponents/textComponets/currencyText/currencyText';
import Loadding from '../../../commonScreens/skeltons';
import NoDataComponent from '../../../../newComponents/noData/noData';
import TransactionDetails from '../../../TransactionDetails';
import { isErrorDispaly } from '../../../../utils/helpers';
import { s } from '../../../../newComponents/theme/scale';
import FlatListComponent from '../../../../newComponents/flatList/flatList';
import CommonTouchableOpacity from '../../../../newComponents/touchableComponents/touchableOpacity';
import ImageBackgroundWrapper from '../../../../newComponents/imageComponents/ImageBackground';
import { VisaHorizontalImage } from '../../../../assets/vectorAssets';
import BillStatementExportIcon from '../../../../assets/mainmenuicons/billStatementExportIcon';
import SwokipayDashboardLoader from '../../../../newComponents/swokipayloader';
import { ActionLogParams, useActionLogging } from '../../../../hooks/loggingHook';
import { useHardwareBackHandler } from '../../../../hooks/HardwareBackHandler';
import { NEW_COLOR } from '../../../../constants/theme/variables';
import { CARDS_URLS } from '../../../../assets/blobUrls';
import { Ionicons } from '@expo/vector-icons';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';
import { MAsterIcon } from '../../../../assets/svg';

const BillStatementList = ({ navigation }: any) => {
    const cardSheetRef = useRef<any>(null);
    const typeSheetRef = useRef<any>(null);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const isFocused = useIsFocused();
    const REVERSE_NEW_COLOR = useThemeColors(true);
    const reversCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
    const [listLoading, setListLoading] = useState<boolean>(false);
    const PAGE_SIZE = 10;
    const isFetching = useRef(false);
    const { logEvent } = useActionLogging();
    const [error, setError] = useState<string>("");
    const [filters, setFilters] = useState<any>({
        transactionType: { label: 'All', value: 'All' },
        card: { label: 'All cards', value: 'All' },
        transactionTypeOptions: [],
        cardOptions: [],
    });

    const [transactions, setTransactions] = useState<any[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        loading: true,
        loadingMore: false,
        hasMore: true,
    });

    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
    useHardwareBackHandler(() => {
        backArrowButtonHandler();
    });
    useEffect(() => {
        getTransactionTypes();
        getCardOptions();
    }, []);

    useEffect(() => {
        if (isFocused) {
            setPagination(prev => ({ ...prev, page: 1, hasMore: true }));
            fetchData(true);
        }
    }, [filters.transactionType, filters.card, isFocused]);

    const fetchData = useCallback(async (reset = false) => {
        setError("");
        if (isFetching.current) {
            return;
        }
        if (!reset && (pagination.loadingMore || !pagination.hasMore)) {
            return;
        }

        setListLoading(true);
        isFetching.current = true;

        const currentPage = reset ? 1 : pagination.page;
        setPagination(prev => ({
            ...prev,
            loading: currentPage === 1,
            loadingMore: currentPage > 1
        }));

        try {
            const response: any = await TransactionService.getAllTransactionsList(
                filters.card.value,
                filters.transactionType.value,
                "",
                "",
                currentPage,
                PAGE_SIZE,
                "MyCards"
            );

            if (response.ok) {
                const newTransactions = response.data.data;
                setTransactions(prev => reset ? newTransactions : [...prev, ...newTransactions]);
                setPagination(prev => ({
                    ...prev,
                    page: prev.page + 1,
                    hasMore: newTransactions.length === PAGE_SIZE,
                }));
            } else {
                setError(isErrorDispaly(response));
                setPagination(prev => ({ ...prev, hasMore: false }));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
            setPagination(prev => ({ ...prev, hasMore: false }));
        } finally {
            isFetching.current = false;
            setPagination(prev => ({ ...prev, loading: false, loadingMore: false }));
            setListLoading(false);
        }
    }, [pagination.page, pagination.loadingMore, pagination.hasMore, filters.transactionType, filters.card]);


    const getTransactionTypes = async () => {
        setError("");
        try {
            const response: any = await TransactionService.cardTransactionTypeLu();
            if (response.status == 200) {
                const formattedTypes = response.data.CardTransaction.map((type: any) => ({
                    label: type.name,
                    value: type.code,
                    logo: type.logo,
                }));

                setFilters((prev: any) => ({
                    ...prev,
                    transactionTypeOptions: formattedTypes,
                }));
            }
            else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        }
    };




    const getCardOptions = async () => {
        setError("");
        try {
            // In your actual code, you would use the live API response.
            const response: any = await TransactionService.getCardsInfo();

            if (response.ok && response.data) {
                // 1. Map the cards from the API response
                const formattedCards = response.data?.map((card: any) => ({
                    label: `${card.cardType} **** ${card.cardNumber.slice(-4)}`,
                    value: card.id,
                    logo: card.logo,
                    name: card.name
                }));

                const cardOptions = response.data?.length > 0
                    ? [
                        {
                            label: 'All cards',
                            value: 'All',
                            logo: CARDS_URLS.cardImage,
                        },
                        ...formattedCards,
                    ]
                    : [];

                setFilters((prev: any) => ({
                    ...prev,
                    cardOptions,
                }));

            }
            else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        }
    };
    const backArrowButtonHandler = () => {
        const actionData: ActionLogParams = {
            screename: 'BillStatementList',
            nextScreenName: 'MyCards',
            actionType: 'Button',
            actionName: "button_press"
        };
        logEvent('button_press', actionData);
        navigation.goBack();
    }
    const handleLoadMore = () => {
        if (!pagination.loading && !pagination.loadingMore && pagination.hasMore) {
            fetchData();
        }
    };

    const handleSelectFilter = (type: 'transactionType' | 'card', value: any) => {
        setFilters((prev: any) => ({ ...prev, [type]: value }));
        setPagination(prev => ({ ...prev, page: 1, hasMore: true })); // Reset paginasi pada perubahan filter
        if (type === 'transactionType') typeSheetRef.current?.close();
        if (type === 'card') cardSheetRef.current?.close();
    };
    const handleResetFilter = (type: 'transactionType' | 'card') => {
        const defaultFilter = {
            transactionType: { label: 'All', value: 'All' },
            card: { label: 'All cards', value: 'All' },
        };
        handleSelectFilter(type, defaultFilter[type]);
    };

    const handleDetails = (item: any) => {
        setSelectedTransaction(item);
        setModalVisible(true);
    };



    const renderTransactionItem = ({ item, index }: { item: any; index: number }) => {
        const txType = item?.action || item.txType || item.transactionType || item.type || "Transaction";
        const wallet = item.walletCode || item.wallet || "";
        const amount = item?.volume || item?.amount || item?.value || 0;
        const state = item?.state || item?.status || "Approved";
        const currency = item?.type || wallet || '';

        return (
            <ViewComponent>
                <TouchableOpacity activeOpacity={0.9} onPress={() => handleDetails(item)}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.transactionsCard]}>
                        {/* {item?.logo ? (
                            <ViewComponent style={{ minHeight: s(30), minWidth: s(30) }}>
                                <ImageUri width={s(38)} height={s(30)} uri={item.logo} />
                            </ViewComponent>
                        ) : item?.cardNumber ? (
                            <VisaLogoIcon width={s(48)} height={s(48)} />
                        ) : null} */}
                        <ViewComponent style={[commonStyles.flex1, commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                            <ViewComponent>
                                <ParagraphComponent
                                    text={txType}
                                    numberOfLines={1}
                                    style={[commonStyles.fs14, commonStyles.fw700, commonStyles.textWhite, { maxWidth: s(180) }]}
                                />
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mt4]}>
                                    <ParagraphComponent
                                        text={`${state} `}
                                        style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}
                                    />
                                    <FormattedDateText
                                        value={item?.date || item?.dateTime || item?.transactionDate || ""}
                                        conversionType="UTC-to-local"
                                        style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]}
                                    />
                                </ViewComponent>
                            </ViewComponent>
                            <ViewComponent style={[{ alignItems: 'flex-end' }]}>
                                <CurrencyText
                                    currency={currency}
                                    value={amount < 0 ? Math.abs(parseFloat(String(amount)) || 0) : parseFloat(String(amount)) || 0}
                                    style={[
                                        commonStyles.fs14, commonStyles.fw700,
                                        { color: amount < 0 ? NEW_COLOR.TEXT_RED : NEW_COLOR.TEXT_WHITE },
                                        commonStyles.textRight
                                    ]}
                                />
                            </ViewComponent>
                        </ViewComponent>
                    </ViewComponent>
                </TouchableOpacity>
                {index !== transactions.length - 1 && <ViewComponent style={[commonStyles.transactionsGap]} />}
            </ViewComponent>
        );
    };

    const renderFooter = () => {
        if (!pagination.loadingMore) return null;
        return <ActivityIndicator style={{ marginVertical: 20 }} size="large" color={NEW_COLOR.PRIMARY} />;
    };
    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            {listLoading ? (
                <SwokipayDashboardLoader />
            ) : (
                <Container>

                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                        <PageHeader title={"GLOBAL_CONSTANTS.BILL_STATEMENT_LIST"} onBackPress={backArrowButtonHandler} />
                        {(transactions.length > 0 && filters?.cardOptions?.length > 0) && (<ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                            <TouchableOpacity style={[{ paddingTop: s(-5) }]} onPress={() => navigation.navigate("ExportBillStatement", { activeCard: filters.card })}>
                                <BillStatementExportIcon color={NEW_COLOR.TEXT_WHITE} />
                            </TouchableOpacity>
                        </ViewComponent>)}
                    </ViewComponent>
                    {error && <ErrorComponent message={error} screen={true} />}
                    <ViewComponent style={styles.filterContainer}>
                        <FilterPill
                            label={filters.transactionType.label}
                            isActive={filters.transactionType.value !== 'All'}
                            onPress={() => typeSheetRef.current?.open()}
                            onReset={() => handleResetFilter('transactionType')}
                        />
                        <FilterPill
                            label={filters.card.label}
                            isActive={filters.card.value !== 'All'}
                            onPress={() => cardSheetRef.current?.open()}
                            onReset={() => handleResetFilter('card')}
                        />
                    </ViewComponent>

                    <ViewComponent style={styles.contentArea}>
                        {pagination.loading ? (
                            <Loadding />
                        ) : transactions.length === 0 ? (
                            <NoDataComponent Description={"GLOBAL_CONSTANTS.NO_TRANSACTION_FOUND"} />
                        ) : (
                            <FlatList
                                data={transactions}
                                renderItem={renderTransactionItem}
                                keyExtractor={(item, index) => `${item.id}-${index}`}
                                onEndReached={handleLoadMore}
                                onEndReachedThreshold={0.5}
                                ListFooterComponent={renderFooter}
                                contentContainerStyle={{ flexGrow: 1 }}
                            />
                        )}
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.sectionGap]} />
                </Container>)}

            {selectedTransaction && (
                <TransactionDetails
                    modalVisible={modalVisible}
                    transactionId={selectedTransaction?.id || selectedTransaction?.transactionId}
                    txType={selectedTransaction?.action || selectedTransaction?.transactionType}
                    closePopUp={() => {
                        setModalVisible(false);
                        setSelectedTransaction(null);
                    }}
                />
            )}

            <PopupOrSheet
                showCloseIcon={false}
                ref={typeSheetRef}
                title={"GLOBAL_CONSTANTS.TRANSACTIONS_TYPE"}
                titleStyle={[reversCommonStyles.fw700, reversCommonStyles.fs16]}
                height={s(330)}
            >
                <ViewComponent>
                    <FlatListComponent
                        data={filters.transactionTypeOptions}
                        scrollEnabled={true}
                        ListEmptyComponent={<NoDataComponent isPopup={true} />}
                        keyExtractor={(item: any, index: number) => `${item.value}-${index}`}
                        renderItem={({ item }: { item: any }) => {
                            const isSelected = filters.transactionType.value === item.value;
                            return (
                                item.label !== "Card Apply" ? (
                                    <CommonTouchableOpacity
                                        style={[
                                            reversCommonStyles.dflex,
                                            reversCommonStyles.alignCenter,
                                            reversCommonStyles.justifyContent,
                                            reversCommonStyles.p12,
                                            isSelected && reversCommonStyles.bgBlack,
                                            reversCommonStyles.rounded12,
                                            reversCommonStyles.mb12
                                        ]}
                                        onPress={() => handleSelectFilter('transactionType', item)}
                                    >
                                        <ParagraphComponent
                                            text={item.label}
                                            style={[
                                                reversCommonStyles.fs14,
                                                reversCommonStyles.fw400,
                                                reversCommonStyles.textWhite
                                            ]}
                                        />
                                        {isSelected ? (
                                            <ViewComponent style={reversCommonStyles.radioDot}>
                                                <Ionicons name="checkmark-sharp" size={s(16)} color={NEW_COLOR.TEXT_BLACK} />
                                            </ViewComponent>
                                        ) : (
                                            <ViewComponent style={[reversCommonStyles.radioOuter]} />
                                        )}
                                    </CommonTouchableOpacity>
                                ) : null
                            );
                        }}
                        showsVerticalScrollIndicator={false}
                    />
                </ViewComponent>
            </PopupOrSheet>

            <PopupOrSheet
                ref={cardSheetRef}
                title={"GLOBAL_CONSTANTS.SELECT_CARD"}
                height={s(350)}
                showCloseIcon={false}
            >
                <ViewComponent>
                    <FlatListComponent
                        scrollEnabled={true}
                        data={filters.cardOptions}
                        keyExtractor={(item: any) => item.value}
                        ListEmptyComponent={<NoDataComponent isPopup={true} />}
                        renderItem={({ item }: { item: any }) => {
                            const isSelected = filters.card.value === item.value;
                            return (
                                <CommonTouchableOpacity
                                    onPress={() => handleSelectFilter('card', item)}
                                    style={[
                                        reversCommonStyles.dflex,
                                        reversCommonStyles.alignCenter,
                                        reversCommonStyles.justifyContent,
                                        reversCommonStyles.p12,
                                        isSelected && reversCommonStyles.bgBlack,
                                        reversCommonStyles.rounded12,
                                        reversCommonStyles.mb12

                                    ]}
                                >
                                    <ViewComponent style={[reversCommonStyles.dflex, reversCommonStyles.alignCenter]}>
                                        <ImageBackgroundWrapper
                                            source={{ uri: item.logo }}
                                            resizeMode="cover"
                                            imageStyle={[reversCommonStyles.rounded8]}
                                            style={[{ height: s(40), width: s(60), marginRight: s(12) }]}
                                        >
                                        </ImageBackgroundWrapper>
                                        <ParagraphComponent
                                            text={item.label}
                                            style={[
                                                reversCommonStyles.fs16,
                                                reversCommonStyles.fw500,
                                                { color: REVERSE_NEW_COLOR.TEXT_ALWAYS_BLACK },
                                            ]}
                                        />
                                    </ViewComponent>
                                    {isSelected ? (
                                        <ViewComponent style={reversCommonStyles.radioDot}>
                                            <Ionicons name="checkmark-sharp" size={s(16)} color={NEW_COLOR.TEXT_BLACK} />
                                        </ViewComponent>
                                    ) : (
                                        <ViewComponent style={[reversCommonStyles.radioOuter]} />
                                    )}
                                </CommonTouchableOpacity>
                            );
                        }}
                        showsVerticalScrollIndicator={false}
                    />
                </ViewComponent>
            </PopupOrSheet>
        </ViewComponent>
    );
};

const FilterPill = ({ label, isActive, onPress, onReset }: any) => {
    if (!isActive) {
        return (
            <TouchableOpacity style={styles.filterPillInactive} onPress={onPress}>
                <ParagraphComponent style={styles.filterPillTextInactive} text={label} />
            </TouchableOpacity>
        );
    }
    return (
        <TouchableOpacity style={styles.filterPillActive} onPress={onPress}>
            <ParagraphComponent style={styles.filterPillTextActive} text={label} />
            <TouchableOpacity onPress={onReset} style={styles.closeIconTouchable}>
                <ParagraphComponent style={styles.filterPillTextActive} text={"✕"} />
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    filterContainer: { flexDirection: 'row', paddingHorizontal: s(16), paddingVertical: s(12), alignItems: 'center', gap: s(10), marginLeft: s(-16) },
    filterPillInactive: { backgroundColor: NEW_COLOR.BANNER_BG, paddingHorizontal: s(20), paddingVertical: s(8), borderRadius: s(100) / 2 },
    filterPillActive: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E1E31E', paddingLeft: s(16), paddingRight: s(8), paddingVertical: s(5), borderRadius: s(100) / 2 },
    filterPillTextActive: { color: NEW_COLOR.TEXT_BLACK, fontWeight: 'bold', fontSize: s(14) },
    filterPillTextInactive: { color: '#FFFFFF', fontWeight: '500', fontSize: s(14) },
    closeIconTouchable: { marginLeft: s(8), padding: s(4) },
    contentArea: { flex: 1, paddingTop: s(10) },
});

export default BillStatementList;