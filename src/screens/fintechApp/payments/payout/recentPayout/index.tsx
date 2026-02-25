import { CoinImages, getThemedCommonStyles, statusColor } from "../../../../../components/CommonStyles";
import { TouchableOpacity } from "react-native-gesture-handler";
import NoDataComponent from "../../../../../components/noData/noData";
import PaymentService from "../../../../../apiServices/payments";
import { useEffect, useState } from "react";
import { isErrorDispaly } from "../../../../../utils/helpers";
import TransactionDetails from "../../../../commonScreens/transactions/details";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { s } from "../../../../../constants/styels/scale";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import { PAYMENT_LINK_CONSTENTS } from "../../constants";
import ParagraphComponent from "../../../../../components/textComponets/paragraphText/paragraph";
import { PayoutData } from "../../interface";
import TextMultiLanguage from "../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ImageUri from "../../../../../components/imageComponents/image";
import ViewComponent from "../../../../../components/view/view";
import { CurrencyText } from "../../../../../components/textComponets/currencyText/currencyText";
import { FormattedDateText } from "../../../../../components/textComponets/dateTimeText/dateTimeText";
import { showAppToast } from "../../../../../components/toasterMessages/ShowMessage";

interface RecentPayoutListProps {
    initialData?: PayoutData[];
    dashboardLoading?: boolean;
    accountType?: string;
}

const RecentPayoutList = (props: RecentPayoutListProps) => {
    const [data, setData] = useState<PayoutData[]>(props.initialData || [])
    const [loading, setLoading] = useState(false);
    const [trasactionId, setTransactionId] = useState("")
    const [detailsVisible, setDetailsVisible] = useState<boolean>(false);
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    useEffect(() => {
        if (props.initialData !== undefined) {
            setData(props.initialData);
            setLoading(false);
            return;
        }

        if (props.initialData === undefined && isFocused) {
            payOutListDetails();
        }
    }, [props.initialData, isFocused])
    const payOutListDetails = async () => {
        setLoading(true)
        try {
            const response: any = await PaymentService.getPayOutList(1, 5, null)
            if (response.ok) {
                const data = response.data?.data as PayoutData[]
                setData(data)
                setLoading(false)
            }
            else {
                setLoading(false)
                showAppToast(isErrorDispaly(response), 'error')
            }
        }
        catch (error) {
            setLoading(false)
            showAppToast(isErrorDispaly(error), 'error')
        }
    }
    const handleSeeAll = () => {
        navigation?.navigate("PayoutTransactions", {
            trasactionType: props?.accountType
        })
    }
    const handleDetails = (item: any) => {
        setTransactionId(item?.id)
        setDetailsVisible(true)
    }

    // Don't render anything if dashboard is loading and initialData is undefined
    if (props.dashboardLoading !== undefined && props.initialData === undefined) {
        return null;
    } return (
        <ViewComponent style={commonStyles.sectionGap}>
            <ViewComponent>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.titleSectionGap, commonStyles.justifyContent]}>
                    <TextMultiLanguage text={'GLOBAL_CONSTANTS.RECENT_PAYOUTS'} style={[commonStyles.sectionTitle]} />
                    {data && data?.length >= 1 && (
                        <TouchableOpacity onPress={handleSeeAll} activeOpacity={0.9} style={[commonStyles.dflex, commonStyles.alignCenter]}>
                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.SEE_ALL"} style={[commonStyles.sectionLink]} />
                        </TouchableOpacity>
                    )}
                </ViewComponent>
                {!loading && data?.length > 0 &&
                    <ViewComponent >
                        {data?.map((item: any, index: any) => {
                            const wallet = item.walletCode || item.wallet || "";
                            const amount = item.amount || item.value || 0;
                            const state = item?.state || item?.remarks || item?.status || "";
                            const network = item?.network || "";
                            const merchantName = item?.merchantName;
                            const value = item?.value;
                            const decimalPlaces = item?.txSubtype?.toLowerCase() === "fiat" ? 2 : 4;
                            return (<ViewComponent key={item?.id}>
                                <TouchableOpacity

                                    activeOpacity={0.9}
                                    onPress={() => { handleDetails(item) }}
                                    style={[commonStyles.cardsbannerbg]}
                                >
                                                           <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter,]}>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter, commonStyles.flex1]}>
                                            <ViewComponent style={{width:s(32),height:s(32)}} >
                                                <ImageUri uri={CoinImages[item?.wallet.toLowerCase() || 'eur']} width={s(32)} height={s(32)} />
                                            </ViewComponent>
                                            <ViewComponent>
                                                <ParagraphComponent text={network && network.trim() !== '' ? `${wallet}(${network})` : wallet || ''} style={[commonStyles.idrprimarytext]} />
                                                <FormattedDateText value={item?.createdDate} conversionType='UTC-to-local' style={[commonStyles.idrsecondarytext,commonStyles.textRight]} /> 
                                            </ViewComponent>
                                        </ViewComponent>
                                        <ViewComponent>
                                            <CurrencyText value={value || 0} decimalPlaces={decimalPlaces} currency={item?.wallet} symboles={true} style={[commonStyles.idrprimarytext, commonStyles.textRight]} />
                                            <ParagraphComponent text={state} style={[commonStyles.colorstatus, commonStyles.textRight,  { color: statusColor[state?.toLowerCase()] || NEW_COLOR.TEXT_GREEN }]} />

                                        </ViewComponent>
                                    </ViewComponent>
                                </TouchableOpacity>
                                {index !== data.length - 1 && <ViewComponent style={[commonStyles.transactionsListGap]} />}
                            </ViewComponent>

                            );
                        })}
                    </ViewComponent>
                }
                {(!data || data?.length < 1 && !loading && !props.dashboardLoading) && (
                    <NoDataComponent Description={PAYMENT_LINK_CONSTENTS.NO_DATA_AVAILABLE} />
                )}
            </ViewComponent>
            {detailsVisible && (
                <TransactionDetails
                    modalVisible={detailsVisible}
                    transactionId={trasactionId}
                    closePopUp={() => setDetailsVisible(false)}
                />
            )}
        </ViewComponent>
    )
}

export default RecentPayoutList
