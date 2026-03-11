import React, { useEffect, useState, useCallback } from "react";
import { getThemedCommonStyles } from "../../../../../../components/CommonStyles";
import { useThemeColors } from "../../../../../../hooks/themedHook/useThemeColors";
import PageHeader from "../../../../../../components/pageHeader/pageHeader";
import ViewComponent from "../../../../../../components/view/view";
import PaymentService from "../../../../../../apiServices/payments";
import { isErrorDispaly } from "../../../../../../utils/helpers";
import ErrorComponent from "../../../../../../components/errorDisplay/errorDisplay";
import DashboardLoader from "../../../../../../components/loader";
import SafeAreaViewComponent from "../../../../../../components/safeArea/safeArea";
import { ScrollView, ActivityIndicator } from "react-native";
import Container from "../../../../../../components/container/container";
import PaymentScreen from "./fiatPayInDetails";
import { useHardwareBackHandler } from "../../../../../../hooks/backHandleHook";
import { useNavigation } from "@react-navigation/native";
import NoDataComponent from "../../../../../../components/noData/noData";
import { RefreshControl } from "react-native-gesture-handler";
import CommonTouchableOpacity from "../../../../../../components/touchableComponents/touchableOpacity";
import DownloadFile from "../../../../../../components/downloadFile";
import { showAppToast } from "../../../../../../components/toasterMessages/ShowMessage";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { s } from "../../../../../../constants/styels/scale";


const FiatPayinView = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [payInView, setPayInView] = useState<any>([]);
    const [error, setError] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadPaymentLinkUrl, setDownloadPaymentLinkUrl] = useState<string | null>(null);
    const [shouldAutoStartActualDownload, setShouldAutoStartActualDownload] = useState(false);
    const navigation = useNavigation<any>();



    useEffect(() => {
        fetchFiatPayinView();
    }, []);

    const fetchFiatPayinView = async () => {
        setIsLoading(true); // show loader before API call
        try {
            const response = await PaymentService.fiatView(props.route.params?.data?.id);
            if (response?.ok) {
                setError(null);
                const data: any = response?.data || [];
                setPayInView(data);
                setIsLoading(false);
            } else {
                setError(isErrorDispaly(response));
                setIsLoading(false);
            }
        } catch (e) {
            setError(isErrorDispaly(e));
        } finally {
            setIsLoading(false); // hide loader after API call
        }
    };
    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const response: any = await PaymentService.getPaymentDataDownload(props.route.params?.data?.id, "payment link");
            if (response?.ok && response?.data) {
                setDownloadPaymentLinkUrl(response.data);
                setShouldAutoStartActualDownload(true);
                setIsDownloading(false);
            } else {
                showAppToast(isErrorDispaly(response), "error");
                setIsDownloading(false);
            }
        } catch (error) {
            showAppToast(isErrorDispaly(error), "error");
            setIsDownloading(false);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleCloseError = useCallback(() => {
        setError(null);
    }, []);
    const handlePaymentDownload = (
        <CommonTouchableOpacity onPress={handleDownload} disabled={isDownloading}>
            <ViewComponent style={[commonStyles.actioniconbg]}>
                {isDownloading ? (
                    <ActivityIndicator size={s(16)} color={NEW_COLOR.ADD_ICON} />
                ) : (
                    <MaterialCommunityIcons name="tray-arrow-down" size={s(18)} color={NEW_COLOR.ADD_ICON} />
                )}
            </ViewComponent>
            {downloadPaymentLinkUrl && (
                <ViewComponent style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
                    <DownloadFile
                        imageURL={downloadPaymentLinkUrl}
                        autoStartDownload={shouldAutoStartActualDownload && !!downloadPaymentLinkUrl}
                        onAutoStartProcessed={() => setShouldAutoStartActualDownload(false)}
                    />
                </ViewComponent>
            )}
        </CommonTouchableOpacity>
    );
    const handleBack = () => {
        navigation.goBack();
    }
    useHardwareBackHandler(() => {
        handleBack();
    })
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>

            <Container style={[commonStyles.container]}>
                <PageHeader title={"GLOBAL_CONSTANTS.FIAT_PAYIN_VIEW"} onBackPress={handleBack} rightActions={handlePaymentDownload} />
                {error && (<ErrorComponent message={error} onClose={handleCloseError} />)}
                {isLoading && <SafeAreaViewComponent><DashboardLoader /></SafeAreaViewComponent>}
                {payInView && Object.keys(payInView).length > 0 ? (
                    (!isLoading && <ScrollView
                        horizontal={false}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchFiatPayinView} />}>

                        <PaymentScreen paymentData={payInView} />
                        <ViewComponent style={[commonStyles.sectionGap]} />
                    </ScrollView>)
                ) : (
                    <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                        {/* <NoDataComponent /> */}
                    </ViewComponent>
                )}
            </Container>
        </ViewComponent>
    );
};

export default FiatPayinView;
