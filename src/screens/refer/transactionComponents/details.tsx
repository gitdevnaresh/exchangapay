import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";
import { useThemeColors } from "../../../hooks/useThemeColors";
import Container from "../../../newComponents/container/container";
import PageHeader from "../../../newComponents/pageHeader/pageHeader";
import ViewComponent from "../../../newComponents/view/view";
import { useEffect, useState } from "react";
import { isErrorDispaly } from '../../../utils/helpers';
import { s } from '../../../newComponents/theme/scale';
import Clipboard from '@react-native-clipboard/clipboard';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import CopyCard from '../../../newComponents/copyComponent/CopyCard';
import { CurrencyText } from "../../../newComponents/textComponets/currencyText/currencyText";
import { FormattedDateText } from "../../../newComponents/textComponets/dateTimeText/dateTimeText";
    import { useHardwareBackHandler } from "../../../hooks/HardwareBackHandler";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import SwokipayDashboardLoader from "../../../newComponents/swokipayloader";
import TransactionStatus from "../../TransactionDetails/status";
import TextMultiLanguage from "../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import ScrollViewComponent from "../../../newComponents/scrollView/scrollView";
import { ReferralServices } from "../../../apiServices/referApis/referServices";
import ErrorComponent from "../../../newComponents/errorDisplay/errorDisplay";

const ReferralTransactionDetails = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [transactionData, setTransactionData] = useState<any>(null);
    const navigation = useNavigation();
    const [loading, setLoading] = useState<boolean>(false);
    const isfocussed=useIsFocused();
    const [error,setError]=useState<string>("");

    const copyToClipboard = (text: string) => {
        if (text) {
            Clipboard.setString(text);
        }
    };

    useEffect(() => {
        getSendTransactionStatus();
    }, [isfocussed]);

    const getSendTransactionStatus = async () => {
        setError("");
        setLoading(true);
        try {
            const response = await ReferralServices.referralTransactionDetail(props?.route?.params?.transactionId);
            if (response.status === 200) {
                setTransactionData(response.data);
                setLoading(false);
            }
            else {
                setError(isErrorDispaly(response));
                setLoading(false);
                setTransactionData(null);
            }
        }
        catch (error) {
            setError(isErrorDispaly(error));
            setLoading(false);
        }
    }
    useHardwareBackHandler(() => {
        handleBackPress();
        return true;
    });

    const handleBackPress = () => {
        navigation.goBack();
    }
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {loading && <SwokipayDashboardLoader />}
            {!loading && <Container>
                <PageHeader title={"GLOBAL_CONSTANTS.TRANSACTIONS"} onBackPress={handleBackPress} />
                {error&&<ErrorComponent message={error} screen={true}/>}
                 <ScrollViewComponent showsVerticalScrollIndicator={false}>
                    <ViewComponent style={[commonStyles.mb24]}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>

                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                                <ViewComponent style={[]}>
                                    <ParagraphComponent style={[commonStyles.fs30, commonStyles.fw700, commonStyles.textWhite]} text={"+"} />
                                </ViewComponent>
                                <CurrencyText
                                    value={transactionData?.casbackAmount || 0}
                                    style={[commonStyles.fs30, commonStyles.fw700, commonStyles.textWhite]}
                                    symboles={true}
                                />
                            </ViewComponent>
                            <ParagraphComponent
                                style={[commonStyles.textGrey, commonStyles.fs14, commonStyles.fw400, commonStyles.mt12]}
                                text={`${transactionData?.cashBackCurrency || ""}`}
                            />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.alignCenter]}>
                            <TransactionStatus status={transactionData?.state?.toLowerCase() || "Approved"} />
                        </ViewComponent>

                    </ViewComponent>
                    <ViewComponent>
                        <TextMultiLanguage
                            text={"GLOBAL_CONSTANTS.TRANSACTION_DETAILS"}
                            style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite, commonStyles.mb16]}
                        />
                        <ViewComponent style={[commonStyles.transaction_bg]}>
                            <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.TRANSACTIONS_TYPE"} />
                            <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} numberOfLines={1}>{transactionData?.type || ''}</ParagraphComponent>
                        </ViewComponent>
                         <ViewComponent style={[commonStyles.transaction_bg]}>
                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.AMOUNT"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} />
                            <CurrencyText value={transactionData?.casbackAmount} currency={transactionData?.cashBackCurrency} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} />
                        </ViewComponent>
                         <ViewComponent style={[commonStyles.transaction_bg]}>
                            <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.REFERRAL_NAME"} />
                            <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transactionData?.referralCustomerName || ""}</ParagraphComponent>
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.transaction_bg]}>
                            <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.TRANSACTION_AMOUNT"} />
                            <CurrencyText value={transactionData?.transactionAmount} currency={transactionData?.cashBackCurrency} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} />
                        </ViewComponent>
                         <ViewComponent style={[commonStyles.transaction_bg]}>
                            <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.MERCHANT_SOURCE"} />
                            <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transactionData?.merchantName || ""}</ParagraphComponent>
                        </ViewComponent>

                       <ViewComponent style={[commonStyles.transaction_bg]}>
                            <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.CREATED_ON"} />
                            <FormattedDateText value={transactionData?.date} conversionType="UTC-to-local" style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} />
                        </ViewComponent>

                         <ViewComponent style={[commonStyles.transaction_bg, commonStyles.alignCenter]}>
                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.ORDER_ID"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} />
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transactionData?.txId || ''}</ParagraphComponent>
                                {transactionData?.txId && (<CopyCard size={s(24)} onPress={() => copyToClipboard(transactionData?.txId)} />)}
                            </ViewComponent>
                        </ViewComponent>
                    </ViewComponent>
                </ScrollViewComponent>
            </Container>}
        </ViewComponent>
    )
};

export default ReferralTransactionDetails;