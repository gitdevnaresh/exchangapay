
import React, { useEffect, useState } from 'react'
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { PAYMENT_LINK_CONSTENTS } from '../../constants';
import { formatDateTimes, isErrorDispaly } from '../../../../../utils/helpers';
import { CoinImages, getThemedCommonStyles, statusColor } from '../../../../../components/CommonStyles';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import NoDataComponent from '../../../../../components/noData/noData';
import { s } from '../../../../../components/theme/scale';
import PaymentService from '../../../../../apiServices/payments';
import TextMultiLanguage from '../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import ImageUri from '../../../../../components/imageComponents/image';
import ViewComponent from '../../../../../components/view/view';
import { CurrencyText } from '../../../../../components/textComponets/currencyText/currencyText';
import { showAppToast } from '../../../../../components/toasterMessages/ShowMessage';
import FlatListComponent from '../../../../../components/flatList/flatList';
import CommonTouchableOpacity from '../../../../../components/touchableComponents/touchableOpacity';
import { FormattedDateText } from '../../../../../components/textComponets/dateTimeText/dateTimeText';

interface RecentPaymentLinksProps {
    accountType: string;
    initialData?: any[];
    dashboardLoading?: boolean;
    cardId?: string;
    currency?: string;
}

const RecentPaymentLinks = (props: RecentPaymentLinksProps) => {
    const [recentData, setRecentData] = useState<any>(props.initialData || []);
    const [dataLoading, setDataloading] = useState<boolean>(false);
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    useEffect(() => {
        if (props.initialData !== undefined) {
            setRecentData(props.initialData);
            setDataloading(false);
            return;
        }

        if (props.initialData === undefined && isFocused) {
            fetchData();
        }
    }, [props.initialData, isFocused]);
    const fetchData = async () => {
        setDataloading(true);
        try {
            let response: any;
            response = await PaymentService.getAllPaymentLinks(
                "payins",
                null,
                1,
                5
            );
            if (response.ok) {
                if (props?.accountType === PAYMENT_LINK_CONSTENTS.PAYMENTS) {
                    setRecentData(response?.data.data);
                } else {
                    setRecentData(response?.data?.data);
                }

                setDataloading(false);
            } else {
                setDataloading(false);
                showAppToast(isErrorDispaly(response), 'error')
            }


        } catch (error) {
            showAppToast(isErrorDispaly(error), 'error')
            setDataloading(false);
        } finally {
            setDataloading(false)
        }
    };
    const handleSeeAll = () => {
        navigation?.navigate(PAYMENT_LINK_CONSTENTS.PAY_IN_GRID, {
            trasactionType: props?.accountType,
            cardId: props?.cardId,
            currency: props?.currency,
            initialTab: 1
        })
    }
    const handleDetails = (item: any) => {
        if (item?.type === "Invoice") {
            navigation.navigate(PAYMENT_LINK_CONSTENTS.INVOICE_FROM_SUMMARY, { id: item?.id, action: "Home", invoiceNo: item?.invoiceNo })
        }
        else if (item?.type === "PaymentLink") {
            navigation.navigate(PAYMENT_LINK_CONSTENTS.STATIC_PAYMENT_LINK, { id: item?.id, action: "Home", invoiceNo: item?.invoiceNo })
        }
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const amount = item.amount || item.value || 0;
        const state = item?.state || item?.remarks || item?.status || "";
        const network = item?.network || "";
        const currency = item?.currency || "";
        const invoiceNo = item?.invoiceNo || ""
        const createdDate = item?.date || ""

        return (
            <ViewComponent>
                <CommonTouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => { handleDetails(item) }}
                    style={[commonStyles.cardsbannerbg]}
                >
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter, commonStyles.flex1]}>
                            <ViewComponent style={{ minHeight: s(32), minWidth: s(32) }}>
                                <ImageUri uri={CoinImages[currency.toLowerCase() || 'eur']} width={s(34)} height={s(34)} />
                            </ViewComponent>
                            <ViewComponent>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter,]}>
                                    <ParagraphComponent text={invoiceNo} style={[commonStyles.idrprimarytext]} numberOfLines={1} />
                                </ViewComponent>
                                <ParagraphComponent text={`${currency}(${network})`} style={[commonStyles.idrsecondarytext]} numberOfLines={1} />
                                <ParagraphComponent text={item?.type} style={[commonStyles.idrsecondarytext]} />
                            </ViewComponent>
                        </ViewComponent>
                        <ViewComponent>
                            <FormattedDateText value={createdDate || "--"} conversionType='UTC-to-local' style={[commonStyles.idrsecondarytext]} />
                            <CurrencyText value={amount || 0} currency={currency} decimalPlaces={4} style={[commonStyles.idrprimarytext, commonStyles.textRight]} />
                            <ParagraphComponent text={state} style={[commonStyles.colorstatus, commonStyles.textRight, { color: statusColor[item?.status?.toLowerCase()] || NEW_COLOR.TEXT_GREEN }]} />
                        </ViewComponent>
                    </ViewComponent>
                </CommonTouchableOpacity>
            </ViewComponent>
        );
    };

    const ItemSeparator = () => <ViewComponent style={[commonStyles.transactionsListGap]} />;

    // Don't render anything if dashboard is loading and initialData is undefined
    if (props.dashboardLoading !== undefined && props.initialData === undefined) {
        return null;
    }

    return (
        <ViewComponent>
            <ViewComponent style={commonStyles.sectionGap}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.titleSectionGap, commonStyles.justifyContent]}>
                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.RECENT_PAYIN"} style={[commonStyles.sectionTitle]} />
                    {recentData && recentData?.length >= 1 && (
                        <CommonTouchableOpacity onPress={handleSeeAll} style={[commonStyles.dflex, commonStyles.alignCenter]} activeOpacity={0.9} >
                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.SEE_ALL"} style={[commonStyles.sectionLink]} />
                        </CommonTouchableOpacity>
                    )}
                </ViewComponent>
                <>
                    {!dataLoading && recentData?.length > 0 && (
                        <FlatListComponent
                            data={recentData}
                            renderItem={renderItem}
                            keyExtractor={(item) => item?.id?.toString()}
                            ItemSeparatorComponent={ItemSeparator}
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={false}
                        />
                    )}
                </>
                {(!recentData || recentData?.length < 1 && !dataLoading && !props.dashboardLoading) && (
                    <NoDataComponent Description={"GLOBAL_CONSTANTS.NO_DATA_AVAILABLE"} />
                )}
            </ViewComponent>
        </ViewComponent>
    )
}

export default RecentPaymentLinks
