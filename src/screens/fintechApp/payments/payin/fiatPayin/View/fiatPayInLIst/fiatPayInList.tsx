import React, { useEffect, useState, useCallback } from "react";
import { useThemeColors } from "../../../../../../../hooks/themedHook/useThemeColors";
import { CoinImages, getThemedCommonStyles, statusColor } from "../../../../../../../components/CommonStyles";
import PaymentService from "../../../../../../../apiServices/payments";
import { dateFormates, isErrorDispaly } from "../../../../../../../utils/helpers";
import ViewComponent from "../../../../../../../components/view/view";
import SafeAreaViewComponent from "../../../../../../../components/safeArea/safeArea";
import DashboardLoader from "../../../../../../../components/loader"
import ErrorComponent from "../../../../../../../components/errorDisplay/errorDisplay";
import PageHeader from "../../../../../../../components/pageHeader/pageHeader";
import Container from "../../../../../../../components/container/container";
import FlatListComponent from "../../../../../../../components/flatList/flatList";
import CommonTouchableOpacity from "../../../../../../../components/touchableComponents/touchableOpacity";
import { s } from "../../../../../../../components/theme/scale";
import ParagraphComponent from "../../../../../../../components/textComponets/paragraphText/paragraph";
import { CurrencyText } from "../../../../../../../components/textComponets/currencyText/currencyText";
import ScrollViewComponent from "../../../../../../../components/scrollView/scrollView";
import TextMultiLanguage from "../../../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import { Linking, Modal, Platform, RefreshControl } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import NoDataComponent from "../../../../../../../components/noData/noData";
import CopyCard from "../../../../../../../components/copyIcon/CopyCard";
import { copyToClipboard } from "../../../../../../../components/copyToClipBoard/copy ToClopBoard";
import useEncryptDecrypt from "../../../../../../../hooks/encDecHook";
import { useNavigation } from "@react-navigation/native";
import { FormattedDateText } from "../../../../../../../components/textComponets/dateTimeText/dateTimeText";
import { useHardwareBackHandler } from "../../../../../../../hooks/backHandleHook";
import AddIcon from "../../../../../../../components/addCommonIcon/addCommonIcon";
import ImageUri from "../../../../../../../components/imageComponents/image";
import { isDecimalSmall } from '../../../../../../../../configuration';

const FiatPayinsList = (props: any) => {
    const { payInsList, isLoading, error: propError, onRefresh, onBackPress } = props;
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    // Use local state for error to allow it to be dismissible
    const [error, setError] = useState<any>(propError);
    const [details, setDetails] = useState<any[]>([]); // Initial state as an empty array
    const [detailLoading, setDetailLoading] = useState(false)
    const [visible, setVisible] = useState(false)
    const { decryptAES } = useEncryptDecrypt();
    const navigation = useNavigation<any>();


    useEffect(() => {
        setError(propError);
    }, [propError]);

    useHardwareBackHandler(() => {
        onBackPress();
        return true; // Prevent default back action
    })

    const handleCloseError = useCallback(() => {
        setError(null);
    }, []);

    const handleView = (val: any) => {
        props.navigation.navigate("FiatPayinView", {
            data: val,
        })
    }

    const handleClose = () => {
        setVisible(!visible)
    }

    const fetchFiatDetails = async () => {
        setDetailLoading(true)
        try {
            const response = await PaymentService?.fiatDetails(props?.route?.params?.data?.code, props?.route?.params?.data?.type);
            if (response?.ok) {
                setError(null);
                setDetails(Array.isArray(response?.data) ? response.data : []);
            }
            else {
                setError(isErrorDispaly(response));
                setDetails([]); // Set to empty array on error
            }
        }
        catch (error) {
            setError(isErrorDispaly(error));
            setDetails([]); // Set to empty array on catch
        } finally {
            setDetailLoading(false)
        }
    }

    const renderDetailItem = ({ item }: { item: any }) => {
        const decryptedAccountNumber = decryptAES(item.accountOrIbanNumber);
        const maskedAccountNumber = decryptedAccountNumber
            ? `${decryptedAccountNumber.substring(0, 8)} ..... ${decryptedAccountNumber.slice(-4)}`
            : "-";

        return (
            <ViewComponent style={[commonStyles.applycardbg, commonStyles.p14, { borderRadius: s(8) }]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.listGap]}>
                    <TextMultiLanguage text="GLOBAL_CONSTANTS.ACCOUNT_NUMBER" style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw500]} />
                    <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.alignCenter]}>
                        <ParagraphComponent
                            text={maskedAccountNumber}
                            style={commonStyles.textWhite}
                            numberOfLines={1}
                        />
                        <CopyCard onPress={() => copyToClipboard(decryptedAccountNumber)} />
                    </ViewComponent>
                </ViewComponent>

                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.listGap, commonStyles.alignCenter]}>
                    <TextMultiLanguage text="GLOBAL_CONSTANTS.SWIFT_CODE" style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw500]} />
                    <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.alignCenter]}>
                        <ParagraphComponent text={item.swiftOrBicCode || "-"} style={commonStyles.textWhite} />
                        <CopyCard onPress={() => copyToClipboard(item.swiftOrBicCode)} />
                    </ViewComponent>
                </ViewComponent>

                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.listGap, commonStyles.alignCenter]}>
                    <TextMultiLanguage text="GLOBAL_CONSTANTS.NAME" style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw500]} />
                    <ParagraphComponent text={item.name || "-"} style={[commonStyles.textWhite, commonStyles.fs16, commonStyles.fw500]} />
                </ViewComponent>

                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.listGap, commonStyles.alignCenter]}>
                    <TextMultiLanguage text="GLOBAL_CONSTANTS.ADDRESS" style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw500]} />
                    <ParagraphComponent text={item.address || "-"} style={[commonStyles.textWhite, commonStyles.fs16, commonStyles.fw500, commonStyles.textRight, { width: s(150) }]} numberOfLines={2} />
                </ViewComponent>
                {item.routingNumber && (
                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.listGap, commonStyles.alignCenter]}>
                        <TextMultiLanguage text="GLOBAL_CONSTANTS.ROUTING_NUMBER" style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw500]} />
                        <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.alignCenter]}>
                            <ParagraphComponent text={item.routingNumber} style={[commonStyles.textWhite, commonStyles.fs16, commonStyles.fw500]} />
                            <CopyCard onPress={() => copyToClipboard(item.routingNumber)} />
                        </ViewComponent>
                    </ViewComponent>
                )}

                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                    <TextMultiLanguage text="GLOBAL_CONSTANTS.REFERENCE_NO" style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw500]} />
                    <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.alignCenter]}>
                        <ParagraphComponent text={decryptAES(item.reference) || "-"} style={[commonStyles.textWhite, commonStyles.fs16, commonStyles.fw500]} />
                        <CopyCard onPress={() => copyToClipboard(decryptAES(item.reference))} />
                    </ViewComponent>
                </ViewComponent>
            </ViewComponent>
        );
    };

    const handleAddPayinFiat = () => {
        navigation.navigate(props?.addFiatNavigation, { ...props?.route?.params, type: props.route.params?.data, screenName: props?.screenName });
    }
    const addIcon = (
        <ViewComponent style={[commonStyles.actioniconbg]}>
            <AddIcon onPress={handleAddPayinFiat} />

        </ViewComponent>
    );
    const handlePaymentLink = (val: any) => {
        Linking.openURL(val)
    }
    const handleBackpress = () => {
        const returnTab = props?.route?.params?.returnTab ?? 0;
        navigation.navigate('PayInGrid', { animation: 'slide_from_left', initialTab: returnTab })
    }

    const finalOnBackPress = onBackPress;
    const finalOnRefresh = onRefresh || (() => { });

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>

            <Container style={[commonStyles.container]}>
                <PageHeader title={`${props?.route?.params?.data?.code || props?.route?.params?.data?.currency}`} rightActions={props?.route?.params?.data?.code?.toLowerCase() === "idr" ? addIcon : null} onBackPress={finalOnBackPress} />
                {error && (<ErrorComponent message={error} onClose={handleCloseError} />)}
                {isLoading && <SafeAreaViewComponent><DashboardLoader /></SafeAreaViewComponent>}
                {!isLoading && <ScrollViewComponent showsVerticalScrollIndicator={false} refreshing={isLoading} onRefresh={finalOnRefresh}>
                    <ViewComponent>
                        <ViewComponent style={[commonStyles.sectionGap]}>
                            <TextMultiLanguage text={'GLOBAL_CONSTANTS.TOTAL_BALANCE'} style={[commonStyles.transactionamounttextlabel]} />
                            <CurrencyText value={props.route.params?.data?.amount || 0} symboles={true} style={[commonStyles.transactionamounttext]} currency={props?.route?.params?.data?.code} smallDecimal={isDecimalSmall} />
                        </ViewComponent>

                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.PAYMENT_LINKS"} style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} />
                    </ViewComponent>
                    <FlatListComponent
                        showsVerticalScrollIndicator={false}
                        data={payInsList}
                        scrollEnabled={false}
                        nestedScrollEnabled={true}
                        renderItem={({ item, index }: any) => (
                            <ViewComponent>
                                <CommonTouchableOpacity key={item.id} onPress={() => handleView(item)}>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                        <ViewComponent>
                                            <ViewComponent style={{ minHeight: s(32), minWidth: s(32) }}>
                                                <ImageUri
                                                    uri={CoinImages[item?.currency.toLowerCase() || 'eur']} width={s(34)} height={s(34)} />
                                            </ViewComponent>
                                        </ViewComponent>

                                        <ViewComponent style={[commonStyles.flex1]}>

                                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                                                {item?.invoiceNo && <ParagraphComponent text={item?.invoiceNo} style={[commonStyles.idrprimarytext]} />}
                                                <ParagraphComponent text={item?.status} style={[commonStyles.colorstatus, commonStyles.textRight, { color: statusColor[item?.status?.toLowerCase()] || NEW_COLOR.TEXT_GREEN }]} />
                                            </ViewComponent>
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]} >
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                                                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.EXPIRYDATE"} style={[commonStyles.idrsecondarytext]} />
                                                    <FormattedDateText value={item?.expiryDate} dateFormat={dateFormates.date} style={[commonStyles.idrsecondarytext]} />
                                                </ViewComponent>
                                                <ViewComponent style={[commonStyles.buttonBg, commonStyles.rounded100, commonStyles.px10, commonStyles.py7]}>
                                                    <CommonTouchableOpacity onPress={() => handlePaymentLink(item?.paymentLink)}>
                                                        <TextMultiLanguage style={[commonStyles.paymentlink]} text={"GLOBAL_CONSTANTS.STATIC_PAYMENT_LINK"} />
                                                    </CommonTouchableOpacity>
                                                </ViewComponent>

                                            </ViewComponent>
                                            <CurrencyText value={item?.amount} currency={item?.currency} symboles={true} style={[commonStyles.primarytext]} />

                                        </ViewComponent>
                                    </ViewComponent>
                                </CommonTouchableOpacity>
                                {index !== payInsList.length - 1 &&
                                    <ViewComponent style={[commonStyles.listGap]} />}
                            </ViewComponent>
                        )}
                        keyExtractor={(item, index) => item.id}
                    />
                </ScrollViewComponent>}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={visible}
                    onRequestClose={handleClose}
                >
                    <Container style={[commonStyles.container, commonStyles.flex1, Platform.OS === 'android' ? commonStyles.modalpt : { paddingTop: 60 }]}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.mb20]}>
                            <TextMultiLanguage style={[commonStyles.sectionTitle]} text={"GLOBAL_CONSTANTS.DETAILS"} />
                            <CommonTouchableOpacity style={[commonStyles.dflex, commonStyles.alignCenter]} onPress={handleClose}>
                                <Ionicons name="close" size={25} color={NEW_COLOR.TEXT_WHITE} />
                            </CommonTouchableOpacity>
                        </ViewComponent>

                        {detailLoading ? (
                            <DashboardLoader />
                        ) : (
                            <ViewComponent style={{ flex: 1 }}>
                                {error && <ErrorComponent message={error} onClose={() => setError(null)} />}
                                <FlatListComponent
                                    data={details}
                                    renderItem={renderDetailItem}
                                    keyExtractor={(item) => item.id}
                                    ItemSeparatorComponent={() => <ViewComponent style={commonStyles.sectionGap} />} // Adds space between each bank detail card
                                    ListEmptyComponent={<NoDataComponent />} // Shows if the 'details' array is empty
                                    showsVerticalScrollIndicator={false}
                                />
                            </ViewComponent>
                        )}
                    </Container>
                </Modal>
            </Container>
        </ViewComponent>
    );
};

export default FiatPayinsList;
