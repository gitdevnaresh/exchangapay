import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../../../../../hooks/themedHook/useThemeColors';
import { CoinImages, getThemedCommonStyles, statusColor } from '../../../../../../components/CommonStyles';
import { ms, s } from '../../../../../../components/theme/scale';
import ParagraphComponent from '../../../../../../components/textComponets/paragraphText/paragraph';
import { isErrorDispaly } from '../../../../../../utils/helpers';
import { PAYMENT_LINK_CONSTENTS } from '../../../constants';
import { PaymentLinkListInterface } from '../../../interface';
import PaymentService from '../../../../../../apiServices/payments';
import Loadding from '../../../../../../components/skelton/skeltons';
import { transactionCard } from '../../../../../../skeletons/skeleton_views';
import KycVerifyPopup from '../../../../../commonScreens/kycVerify';
import { useLngTranslation } from '../../../../../../hooks/languagesHook/useLngTranslation';
import { useHardwareBackHandler } from '../../../../../../hooks/backHandleHook';
import ImageUri from '../../../../../../components/imageComponents/image';
import DashboardLoader from '../../../../../../components/loader';
import ViewComponent from '../../../../../../components/view/view';
import SafeAreaViewComponent from '../../../../../../components/safeArea/safeArea';
import CommonTouchableOpacity from '../../../../../../components/touchableComponents/touchableOpacity';
import FlatListComponent from '../../../../../../components/flatList/flatList';
import ErrorComponent from '../../../../../../components/errorDisplay/errorDisplay';
import ScrollViewComponent from '../../../../../../components/scrollView/scrollView';
import { CurrencyText } from '../../../../../../components/textComponets/currencyText/currencyText';
import { FormattedDateText } from '../../../../../../components/textComponets/dateTimeText/dateTimeText';
import CustomeditLink from '../../../../../../components/svgIcons/mainmenuicons/linkedit';
import SearchComponent from '../../../../../../components/searchComponents/searchComponent';

const CryptoPayInGrid = (props: any) => {
    const isInTab = props?.isInTab || false;
    const [errormsg, setErrormsg] = useState<any>('');
    const [paymentsData, setPaymentsData] = useState<PaymentLinkListInterface[]>([]);
    const [prevPaymentData, setPrevPaymentData] = useState<PaymentLinkListInterface[]>([]);
    const flatListRef = useRef<any>(); // Added ref for FlatList
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails)
    const [dataLoading, setDataLoading] = useState<boolean>(false)
    const [initialLoading, setInitialLoading] = useState<boolean>(true) // Added for initial load
    const loading = transactionCard(10);
    const [pageNo, setPageNo] = useState<number>(1);
    const [isLoadMore, setIsLoading] = useState<boolean>(false);
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();
    const [kycModelVisible, setKycModelVisible] = useState<boolean>(false)
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { t } = useLngTranslation();

    useEffect(() => {
        if (!isInTab || props?.isActiveTab) {
            if (isFocused) {
                getData(1, true);
            }
        }
    }, [isFocused, isInTab, props?.isActiveTab])

    useHardwareBackHandler(() => {
        backArrowButtonHandler();
    })

    const backArrowButtonHandler = () => {
        navigation.navigate("Dashboard", { screen: "GLOBAL_CONSTANTS.PAYMENTS" });
    };

    const getData = async (pageNumber: any, isInitialLoad = false) => {
        if (isInitialLoad) {
            setInitialLoading(true);
        } else {
            setDataLoading(true);
        }

        const pageSize = 10;
        try {
            const response: any = await PaymentService.getAllPaymentLinks(
                "payins",
                'null', // Always fetch all data, search is local now
                pageNumber || pageNo,
                pageSize
            );
            const moreData = response?.data?.data.length == pageSize;
            if (response.ok) {
                if ((pageNumber || pageNo) === 1) {
                    setPrevPaymentData(response.data?.data); // Store original data
                    setPaymentsData(response.data?.data); // Show all by default
                } else {
                    setPrevPaymentData(prev => [...prev, ...response?.data?.data]);
                    setPaymentsData(prev => [...prev, ...response?.data?.data]);
                }
                setErrormsg('')
            } else {
                setErrormsg(isErrorDispaly(response))
            }
            setIsLoading(moreData)
        }
        catch (error) {
            setErrormsg(isErrorDispaly(error))
        } finally {
            if (isInitialLoad) {
                setInitialLoading(false);
            } else {
                setDataLoading(false);
            }
        }
    }
    const loadMoreData = () => {
        if (isLoadMore === true && !dataLoading) {
            setPageNo(prevPage => prevPage + 1);
            getData(pageNo + 1);
        }
    };
    const renderFooter = () => {
        if (!dataLoading) {
            return null;
        }
        else {
            return (
                <Loadding contenthtml={loading} />
            );
        }
    };
    const handleView = (item: any) => {
        const returnTab = props?.currentTabIndex ?? 1;
        if (item?.type === PAYMENT_LINK_CONSTENTS.INVOICE) {
            navigation.navigate(PAYMENT_LINK_CONSTENTS.INVOICE_FROM_SUMMARY, { id: item?.id, payinGrid: PAYMENT_LINK_CONSTENTS.PAY_IN_GRID, action: PAYMENT_LINK_CONSTENTS.VIEW_COMPONENT, invoiceNo: item?.invoiceNo, returnTab })
        }
        else if (item?.type === PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.PAYMENT_LINK) {
            navigation.navigate(PAYMENT_LINK_CONSTENTS.STATIC_PAYMENT_LINK, { id: item?.id, payinGrid: PAYMENT_LINK_CONSTENTS.PAY_IN_GRID, action: PAYMENT_LINK_CONSTENTS.VIEW_COMPONENT, invoiceNo: item?.invoiceNo, returnTab })
        }
    };
    const handleEdit = (val: any) => {
        if (userInfo?.kycStatus == null || userInfo?.kycStatus == "Draft" || userInfo?.kycStatus == "Submitted") {
            setKycModelVisible(!kycModelVisible);
            return;
        }
        if (val?.status === PAYMENT_LINK_CONSTENTS.PAID) {
            setErrormsg(PAYMENT_LINK_CONSTENTS.PAYIN_HAS_BEEN_FULLY_PAID);
            setTimeout(() => scrollToTop(), 100);
        }
        else if (val?.status === PAYMENT_LINK_CONSTENTS.CANCELLED) {
            setErrormsg(PAYMENT_LINK_CONSTENTS.CANNOT_EDIT_CANCELLED_PAYIN);
            setTimeout(() => scrollToTop(), 100);
        }
        else if (val?.status === PAYMENT_LINK_CONSTENTS.PARTIALLY_PAID) {
            setErrormsg(PAYMENT_LINK_CONSTENTS.PAY_IN_HAS_BEEN_PARTIALLY_PAID);
            setTimeout(() => scrollToTop(), 100);
        }
        else if (val?.status === "Expired") {
            setErrormsg(PAYMENT_LINK_CONSTENTS.EXPIRED_PAYIN);
            setTimeout(() => scrollToTop(), 100);
        }
        else {
            const returnTab = props?.currentTabIndex ?? 1;
            if (val.type === PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.PAYMENT_LINK) {
                navigation.navigate(PAYMENT_LINK_CONSTENTS.CREATE_PAYMENT_COMPONENT, { id: val?.id, Type: val?.type, invoiceNo: val?.invoiceNo, returnTab });
            }
            else {
                navigation.navigate(PAYMENT_LINK_CONSTENTS.INVOICE_FORM, { id: val?.id, Type: val?.type, invoiceNo: val?.invoiceNo, returnTab })
            }
        }
    };

    const handleSearchResult = (filteredData: any[]) => {
        setPaymentsData(filteredData);
    }


    const scrollToTop = () => {
        if (flatListRef?.current) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: true });
        }
    };


    const handleError = () => {
        setErrormsg('');
    }

    const closekycModel = () => {
        setKycModelVisible(!kycModelVisible)
    };

    return (
        <ViewComponent style={[commonStyles.flex1]}>
            {initialLoading && <SafeAreaViewComponent><DashboardLoader /></SafeAreaViewComponent>}
            {!initialLoading && <ViewComponent style={[ commonStyles.flex1]}>
                <ViewComponent style={commonStyles.flex1}>
                    {errormsg && <ErrorComponent message={errormsg} onClose={handleError} />}
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <SearchComponent
                                customBind={'currency'}
                                data={prevPaymentData || []}
                                onSearchResult={handleSearchResult}
                            />
                        </ViewComponent>
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.flex1, commonStyles.sectionGap]}>
                        <ScrollViewComponent>
                            <FlatListComponent
                                scrollEnabled={false}   // ?? disables FlatList scroll
                                nestedScrollEnabled={true}
                                showsVerticalScrollIndicator={false}
                                ref={flatListRef}
                                data={paymentsData}
                                renderItem={({ item, index }: any) => (<ViewComponent>
                                    <CommonTouchableOpacity key={index} onPress={() => handleView(item)}
                                        style={[commonStyles.cardsbannerbg]}>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter, commonStyles.flex1]}>
                                                <ViewComponent style={{ minWidth: s(34), minHeight: s(34) }}>
                                                    <ImageUri uri={CoinImages[item?.currency.toLowerCase() || 'eur']} width={s(34)} height={s(34)} />
                                                </ViewComponent>
                                                <ViewComponent>
                                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mb6, commonStyles.gap10]}>
                                                        <ParagraphComponent text={item?.invoiceNo} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} numberOfLines={1} />
                                                        <CustomeditLink width={s(24)} height={s(20)} onPress={() => handleEdit(item)} />
                                                    </ViewComponent>
                                                    <ParagraphComponent text={`${item.currency}(${item?.network})`} numberOfLines={1} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey, commonStyles.mb6]} />
                                                    <ParagraphComponent text={item?.type} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} />
                                                </ViewComponent>
                                            </ViewComponent>
                                            <ViewComponent style={[]}>
                                                <FormattedDateText value={item?.date || "--"} conversionType='UTC-to-local' style={[commonStyles.idrsecondarytext]} />
                                                <CurrencyText value={item?.amount || 0} decimalPlaces={4} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite, commonStyles.textRight, commonStyles.mb6]} />
                                                <ParagraphComponent text={item?.status} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textRight, { color: statusColor[item?.status?.toLowerCase()] || NEW_COLOR.TEXT_GREEN }]} />

                                            </ViewComponent>
                                        </ViewComponent>
                                    </CommonTouchableOpacity>
                                    {index !== paymentsData.length - 1 &&
                                        <ViewComponent style={[commonStyles.transactionsListGap]} />}
                                </ViewComponent>)}
                                keyExtractor={(item) => item?.id}
                                onEndReached={loadMoreData}
                                onEndReachedThreshold={0.5}
                                ListFooterComponent={renderFooter}
                            />
                        </ScrollViewComponent>
                    </ViewComponent>
                </ViewComponent>
                {kycModelVisible && <KycVerifyPopup closeModel={closekycModel} />}
            </ViewComponent>}
        </ViewComponent>
    );
};
export default CryptoPayInGrid;

