import React, { useEffect, useState } from "react";
import ViewComponent from "../../../../../../../components/view/view";
import PaymentService from "../../../../../../../apiServices/payments";
import { isErrorDispaly } from "../../../../../../../utils/helpers";
import FlatListComponent from "../../../../../../../components/flatList/flatList";
import { useThemeColors } from "../../../../../../../hooks/themedHook/useThemeColors";
import { CoinImages, getStatusColor, getThemedCommonStyles } from "../../../../../../../components/CommonStyles";
import { CurrencyText } from "../../../../../../../components/textComponets/currencyText/currencyText";
import ErrorComponent from "../../../../../../../components/errorDisplay/errorDisplay";
import Loadding from "../../../../../../../components/skelton/skeltons";
import { allTransactionList } from "../../../../../../../skeletons/skeltonViews";
import { s } from "../../../../../../../components/theme/scale";
import { FormattedDateText } from "../../../../../../../components/textComponets/dateTimeText/dateTimeText";
import ImageUri from "../../../../../../../components/imageComponents/image";
import TextMultiLanguage from "../../../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ParagraphComponent from "../../../../../../../components/textComponets/paragraphText/paragraph";

const FiatTransactions = (props: any) => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [pageNo, setPageNo] = useState<number>(1);
    const [isLoadMore, setIsLoadMore] = useState<boolean>(false);
    const allTransactionListLoader = allTransactionList(10);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const statusColor = getStatusColor(NEW_COLOR);
    useEffect(() => {
        fetchTransactionsList(1);
    }, [props?.data.type, props?.data.code]);
    const fetchTransactionsList = async (pageNumber: number) => {
        if (pageNumber > 1) {
            setIsLoading(true); // Show footer loader
        } else {
            setIsLoading(true); // Show initial loader
        }

        const pageSize = 10;
        try {
            const response = await PaymentService?.fiatTransactions(props?.data.type, props?.data.code, pageNumber, pageSize);
            if (response?.ok) {
                const responseData = response?.data?.data || [];
                const moreDataAvailable = responseData.length === pageSize;

                if (pageNumber === 1) {
                    setTransactions(responseData);
                } else {
                    setTransactions(prevTransactions => [...prevTransactions, ...responseData]);
                }
                setIsLoadMore(moreDataAvailable);
                setError(null);
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (e) {
            setError(isErrorDispaly(e));
        } finally {
            setIsLoading(false);
        }
    };

    const loadMoreData = () => {
        if (isLoadMore && !isLoading) {
            const nextPage = pageNo + 1;
            setPageNo(nextPage);
            fetchTransactionsList(nextPage);
        }
    };

    const renderFooter = () => {
        if (!isLoading || pageNo === 1) return null; // Don't show footer on initial load
        <Loadding contenthtml={allTransactionListLoader} />
    };
    const renderItem = ({ item, index }: { item: any; index: number }) => (
        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap16]}>
            <ViewComponent style={[commonStyles.alignCenter, commonStyles.justifyCenter, { minHeight: s(34), minWidth: s(34) }]}>
                {item.code && <ImageUri uri={CoinImages[item?.code ? item?.code.toLowerCase() : item?.currency?.toLowerCase()]} height={s(34)} width={s(34)} />}

            </ViewComponent>
            <ViewComponent style={[commonStyles.dflex, commonStyles.flex1, commonStyles.justifyContent, commonStyles.gap10, commonStyles.alignCenter]}>
                <ViewComponent style={[commonStyles.flex1]}>
                    <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite,]} text={`${item?.code}`} numberOfLines={1} />
                    <FormattedDateText value={item?.date ?? item?.dateTime ?? item?.transactionDate ?? ""} conversionType='UTC-to-local' style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey, commonStyles.mt4]} />
                </ViewComponent>
                <ViewComponent>
                    <ViewComponent><CurrencyText style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite, commonStyles.textRight, commonStyles.mb2]} value={item?.value ?? item?.amount} currency={`${item?.wallet ?? item?.walletCode ?? item?.type ?? ""}`} /></ViewComponent>
                    <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textRight, commonStyles.mt4, { color: statusColor[item.state !== null && item.state?.toLowerCase()] ?? NEW_COLOR.TEXT_GREEN }]} text={item.state} />
                </ViewComponent>
            </ViewComponent>
        </ViewComponent>
    );

    return (
        <ViewComponent>
            <ViewComponent>
                <TextMultiLanguage text={"Transactions"} style={[commonStyles.fs18, commonStyles.fw600, commonStyles.textWhite]} />
            </ViewComponent>
            <ViewComponent style={[commonStyles.listGap]} />
            {error && <ErrorComponent message={error} onClose={() => setError(null)} />}
            <FlatListComponent
                showsVerticalScrollIndicator={false}
                data={transactions}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.id || `fiat-tx-${index}`}
                onEndReached={loadMoreData}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                ItemSeparatorComponent={() => <ViewComponent style={commonStyles.listGap} />}
                isLoading={isLoading && pageNo === 1}
            />
        </ViewComponent>
    );
};

export default FiatTransactions;
