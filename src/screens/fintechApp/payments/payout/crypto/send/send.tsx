
import { BackHandler, StyleSheet } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useIsFocused, useNavigation } from '@react-navigation/native'
import Feather from "react-native-vector-icons/Feather";
import { useDispatch, useSelector } from 'react-redux';
import ParagraphComponent from '../../../../../../components/textComponets/paragraphText/paragraph'
import ErrorComponent from '../../../../../../components/errorDisplay/errorDisplay'
import NoDataComponent from '../../../../../../components/noData/noData'
import { formatCurrency, isErrorDispaly } from '../../../../../../utils/helpers'
import { CurrencySymbols } from '../../../../../../constants';
import { SEND_CONST } from '../../../../wallets/constant';
import PaymentService from '../../../../../../apiServices/payments';
import Loadding from '../../../../../../components/skelton/skeltons';
import { allAddressList } from '../../../../../../skeletons/cardsSkeletons';
import PageHeader from '../../../../../../components/pageHeader/pageHeader';
import { s } from '../../../../../../constants/styels/scale';
import Ionicons from '@expo/vector-icons/Ionicons';
import ButtonComponent from '../../../../../../components/buttons/button';
import ViewComponent from '../../../../../../components/view/view';
import { CoinImages, getThemedCommonStyles } from '../../../../../../components/CommonStyles';
import { useThemeColors } from '../../../../../../hooks/themedHook/useThemeColors';
import CustomRBSheet from '../../../../../../components/models/commonBottomSheet';
import ImageUri from '../../../../../../components/imageComponents/image';
import SafeAreaViewComponent from '../../../../../../components/safeArea/safeArea';
import Container from '../../../../../../components/container/container';
import { LoadingState, PayeesAddress, PayeeObj, CryptoObj } from './sendInterface';
import ScrollViewComponent from '../../../../../../components/scrollView/scrollView';

const CryptoSend = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [errorMsg, setErrorMsg] = useState<any>("");
    const [addressList, setAdressList] = useState<PayeesAddress[]>([]);
    const allTransactionListLoader = allAddressList(10);
    const isFocused = useIsFocused();
    const navigation = useNavigation<any>();
    const showQuickInfo = useRef<any>();
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const dispatch = useDispatch();
    const [selectedPayee, setSelectedPayee] = useState<PayeesAddress>(
        {
            amount: 0,
            email: "",
            entryNote: "",
            id: "",
            recipientAddress: "",
            recipientName: "",
            customerId: "",
            walletCode: "",
            network: "",
            name: "",
            walletAddress: "",
            createdDate: "",
        });
    const [isLoadings, setIsLoadings] = useState<LoadingState>({
        addressListLoader: false,
        btnLoading: false,
        isSelectedPayee: false,
    })
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleBack(); return true; }
        );
        return () => backHandler.remove();

    }, [])
    useEffect(() => {
        getAdressessList();
    }, [isFocused]);

    const payeesRefresh = useCallback(() => {
        getAdressessList();
    }, [])
    const goToTheSummarryPage = async () => {
        let response: any;
        try {
            let obj: PayeeObj = {
                payeeId: selectedPayee?.id,
                amount: parseFloat(props.route?.params?.amount),
                cryptorWalletId: props.route?.params?.networkId,
                fiatCurrency: props?.route?.params?.toCurrency || props?.route?.params?.fiatCurrency,
            };
            let cryptoobj: CryptoObj = {
                customerWalletId: props?.route.params?.customerWalletId,
                amount: parseFloat(props?.route.params?.amount),
                fiatCurrency: props?.route?.params?.toCurrency || props?.route?.params?.fiatCurrency,
                payeeId: selectedPayee?.id,
                metadata: "",
                moduleType: ""
            };
            if (props?.route?.params?.screenName === SEND_CONST?.PAYMENTS) {
                response = await PaymentService.postCryptoWithdraw(cryptoobj);
            }
            else {
                response = await PaymentService.gotoExchangeSummeryPage(props?.route?.params?.screenName, obj);
            }
            setIsLoadings((prev) => ({ ...prev, btnLoading: true }))
            if (response.ok) {
                setIsLoadings((prev) => ({ ...prev, btnLoading: false }))
                setErrorMsg("");
                if (props?.route?.params?.screenName === SEND_CONST?.PAYMENTS) {
                    navigation.navigate(SEND_CONST?.PAY_OUT_SUMMARY, {
                        amount: props?.route.params?.amount,
                        totalAmount: response?.data?.totalAmount,
                        oneCoinValue: response?.data?.oneCoinValue,
                        tierDiscount: response?.data?.tierDiscount,
                        feeCommission: response?.data?.feeCommission,
                        coin: response?.data?.coin,
                        network: props?.route?.params?.network,
                        exchangeRate: response.data.exchangeRate,
                        addressBookId: selectedPayee?.id,
                        walletCode: props.route?.params?.coinCode,
                        walletAddress: selectedPayee?.walletAddress,
                        merchantId: props?.route?.params?.merchantId,
                        customerWalletId: props?.route?.params?.customerWalletId,
                        fee: response?.data?.feeInfo?.Fee,
                        flatFee: response?.data?.feeInfo["Flat Fee"] || response?.data?.feeInfo?.FlatFee,
                        finalAmount: response?.data?.finalAmount,
                        requestedAmount: response?.data?.requestedAmount,
                        quoteId: response?.data?.quoteId,
                        expiresIn: response?.data?.expiresIn,
                        logo: props?.route?.params?.logo,
                        payeeName: selectedPayee?.favoriteName || selectedPayee?.name,
                        paymentType: props?.route?.params?.paymentType,
                        fiatCurrency: props?.route?.params?.fiatCurrency,
                        document: props?.route?.params?.document,
                        balance: props?.route?.params?.balance || props?.route?.params?.coinBalance,
                    })
                } else {
                    navigation.navigate(SEND_CONST?.SEND_WALLE_PREVIEW, {
                        data: response?.data,
                        screenName: props?.route?.params?.screenName,
                    })
                }
            } else {
                setErrorMsg(isErrorDispaly(response));
                setIsLoadings((prev) => ({ ...prev, btnLoading: false }))

            }

        } catch (error) {
            setErrorMsg(isErrorDispaly(error));
            setIsLoadings((prev) => ({ ...prev, btnLoading: false }))

        }
    };
    const getAdressessList = async () => {
        setErrorMsg("");
        setIsLoadings((prevState: LoadingState) => ({
            ...prevState,
            addressListLoader: true,
        }));
        try {
            let response: any;
            if (props?.route?.params?.screenName === SEND_CONST?.PAYMENTS) {
                response = await PaymentService.getCryptoPayee(props?.route?.params?.toCurrency || props?.route?.params?.fiatCurrency, "");
                setAdressList(response?.data);
            }
            else {
                response = await PaymentService.getAllCryptoPayees(props?.route?.params?.coinCode || props?.route?.params?.walletCode, props?.route?.params?.network);
                setAdressList(response?.data?.data);
            }


            setIsLoadings((prevState: LoadingState) => ({
                ...prevState,
                addressListLoader: false,
            }));
        } catch (error) {
            setErrorMsg(isErrorDispaly(error));
            setIsLoadings((prevState: LoadingState) => ({
                ...prevState,
                addressListLoader: false,
            }));
        }
    }
    const handleActvePayee = (item: any) => {
        setSelectedPayee(item)
        setIsLoadings((prev) => ({ ...prev, isSelectedPayee: true }));
    };
    const handleaddpayee = () => {
        dispatch({ type: 'SCREEN_NAME', payload: 'Crypto' });
        props.navigation.navigate('AccountDetails', {
            accountType: userInfo?.accountType,
            screenName: "Payout"
        });
        showQuickInfo.current.close();
    }
    const addPayeeData = (
        <ViewComponent>
            <ParagraphComponent text="� Only approved payees will be available for transactions." style={[commonStyles.fs16, commonStyles.textWhite, commonStyles.mb8]} />
            <ParagraphComponent text="� Approval may take some time. You will be notified once it's done." style={[commonStyles.fs16, commonStyles.textWhite, commonStyles.mb8]} />
            <ParagraphComponent text="� Ensure the payee details are accurate to avoid delays." style={[commonStyles.fs16, commonStyles.textWhite, commonStyles.mb8]} />
            <ParagraphComponent text="� Once approved, payees will be visible in your list automatically." style={[commonStyles.fs16, commonStyles.textWhite, commonStyles.mb8]} />
            <ParagraphComponent text="� You can track the status in the payees section." style={[commonStyles.fs16, commonStyles.textWhite, commonStyles.mb16]} />
            <ViewComponent style={[commonStyles.justifyContent, commonStyles.gap10, commonStyles.mt16]}>

                <ButtonComponent
                    title="GLOBAL_CONSTANTS.ADD_PAYEE"
                    onPress={handleaddpayee}
                />
                <ViewComponent style={[]} />
                <ButtonComponent
                    title="GLOBAL_CONSTANTS.CANCEL"
                    onPress={() => showQuickInfo.current.close()}
                    solidBackground={true}
                />
            </ViewComponent>
        </ViewComponent>

    )
    const handleAddcontact = () => {
        showQuickInfo.current.open();
    };
    const handleBack = useCallback(() => {
        if (props?.route?.params?.screenName == "CryptoWithdraw") {
            props?.navigation?.navigate(SEND_CONST?.SEND_AMOUNTS, {
                coinCode: props?.route?.params?.coinCode,
                available: props?.route?.params?.availableAmount,
                logo: props?.route?.params?.logo,
                network: props?.route?.params?.network,
                merchantId: props?.route?.params?.merchantId,
                vault: props?.route?.params?.vault,
                screenName: props?.route?.params?.screenName,
            })
        } else {
            props?.navigation?.goBack()
        }
    }, []);

    const handleError = useCallback(() => {
        setErrorMsg("")
    }, []);

    const handleCryptoPayeeeView = (val: any) => {
        props.navigation.navigate('AddressbookCryptoView', {
            coin: val?.currency,
            status: val?.status,
            id: val?.id
        })
    };
    return (
        <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={commonStyles.container}>
                <PageHeader title={`${"GLOBAL_CONSTANTS.SELECT_PAYEE"}`} onBackPress={handleBack} isrefresh={true} onRefresh={payeesRefresh} />
                <ScrollViewComponent>
                    {errorMsg && <ErrorComponent message={errorMsg} onClose={handleError} />}
                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.sectionGap,]}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                            <ImageUri uri={CoinImages[props?.route?.params?.coinCode.toLowerCase()]} width={s(34)} height={s(34)} />
                            <ViewComponent>
                                <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textWhite, commonStyles.mb4]} text={props?.route?.params?.vault} />
                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textlinkgrey,]} text={`${props?.route?.params?.coinCode} ${'('} ${props?.route?.params?.network} ${')'}`} />

                            </ViewComponent>
                        </ViewComponent>
                        <ViewComponent>
                            <ParagraphComponent style={[commonStyles.fs18, commonStyles.fw600, commonStyles.textWhite, commonStyles.textRight, commonStyles.mb4]} text={`${formatCurrency(props?.route?.params?.amount, 2)}`} />


                            <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textGrey, commonStyles.textRight]} text={`${"GLOBAL_CONSTANTS.AVAILABLE"}`} multiLanguageAllows children={<ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textGrey, commonStyles.textRight]} text={` ${CurrencySymbols[props?.route?.params?.coinCode] || '$'} ${formatCurrency(props?.route?.params?.availableAmount || props?.route?.params?.coinBalance, 2)}`} />} />
                        </ViewComponent>
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                        <ParagraphComponent text={"GLOBAL_CONSTANTS.ADD_PAYEE"} style={[commonStyles.sectionTitle]} multiLanguageAllows />
                        <TouchableOpacity onPress={handleAddcontact}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter,]}>
                                <Ionicons name="add-circle-outline" size={s(26)} color={NEW_COLOR.TEXT_PRIMARY} />
                            </ViewComponent>
                        </TouchableOpacity>
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.titleSectionGap]} />
                    <ParagraphComponent text={"GLOBAL_CONSTANTS.RECENT_PAYEE"} style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} multiLanguageAllows />

                    <ViewComponent >
                        {isLoadings?.addressListLoader && (
                            <Loadding contenthtml={allTransactionListLoader} />
                        )}
                        <ViewComponent style={[]} />
                        {!isLoadings?.addressListLoader && addressList && addressList?.length > 0 &&

                            <ViewComponent>
                                {addressList?.map((item: any, index: any) => {
                                    const isActive = selectedPayee?.id === item?.id;
                                    return (
                                        <ViewComponent key={item?.id}>
                                            <TouchableOpacity onPress={() => { handleActvePayee(item) }}>
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.flex1, commonStyles.justifyContent, commonStyles.gap10, isActive ? commonStyles?.activeItemBg : null, commonStyles.alignCenter]}>
                                                    <ViewComponent style={[commonStyles.dflex, commonStyles.flex1, commonStyles.gap16, commonStyles.alignCenter]}>
                                                        <ViewComponent style={[commonStyles.nameIconStyle, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, isActive ? commonStyles.bannerbg : null]}>
                                                            <ParagraphComponent style={[commonStyles.fs18, commonStyles.fw600, isActive ? commonStyles.textWhite : commonStyles.textWhite, commonStyles.textCenter]} text={item?.favoriteName?.slice(0, 1)?.toUpperCase() || item?.recipientName?.slice(0, 1)?.toUpperCase()} />
                                                        </ViewComponent>
                                                        <ViewComponent style={[commonStyles.flex1]}>
                                                            <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite, commonStyles.mb4]} text={`${(item?.favoriteName || item?.recipientName) || "--"}`} numberOfLines={1} />
                                                            <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textlinkgrey]} text={(item?.walletAddress || item?.network || item?.currency) || " "} />
                                                        </ViewComponent>
                                                    </ViewComponent>
                                                    <ViewComponent>
                                                        {isActive &&
                                                            <TouchableOpacity onPress={() => handleCryptoPayeeeView(item)}>
                                                                <Feather size={s(18)} name={SEND_CONST?.EYE} color={NEW_COLOR.TEXT_PRIMARY} />
                                                            </TouchableOpacity>}

                                                    </ViewComponent>

                                                </ViewComponent>


                                            </TouchableOpacity>

                                            {index !== addressList?.length - 1 && <ViewComponent style={[commonStyles.listGap]} />}
                                        </ViewComponent>
                                    )
                                })}
                            </ViewComponent>
                        }
                        {!isLoadings?.addressListLoader && !addressList || addressList?.length <= 0 &&
                            <ViewComponent>
                                <NoDataComponent />
                            </ViewComponent>
                        }
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.mb30]} />


                </ScrollViewComponent>
                {isLoadings?.isSelectedPayee && <ViewComponent style={[commonStyles.mb24,]}>
                    <ButtonComponent
                        title={"GLOBAL_CONSTANTS.CONTINUE"}
                        onPress={goToTheSummarryPage}
                        loading={isLoadings?.btnLoading}


                    />
                </ViewComponent>}
            </Container>

            <CustomRBSheet
                refRBSheet={showQuickInfo}
                onClose={() => { }}
                height={"Medium"}
            >
                {addPayeeData}
            </CustomRBSheet>
        </SafeAreaViewComponent >
    )
}

export default CryptoSend

const styles = StyleSheet.create({

})
