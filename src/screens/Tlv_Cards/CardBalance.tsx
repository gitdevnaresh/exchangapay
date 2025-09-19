import React, { useEffect, useRef, useState } from 'react';
import { View, SafeAreaView, ScrollView, TouchableOpacity, BackHandler, Image, Dimensions } from 'react-native';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import { Container } from '../../components';
import DefaultButton from "../../components/DefaultButton";
import { useIsFocused } from '@react-navigation/native';
import CardsModuleService from '../../services/card';
import ErrorComponent from '../../components/Error';
import Loadding from '../../components/skeleton';
import { isErrorDispaly, formatCurrency } from '../../utils/helpers';
import { NEW_COLOR } from '../../constants/theme/variables';
import AntDesign from "react-native-vector-icons/AntDesign";
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import TextInputField from '../../components/textInput';
import { commonStyles } from '../../components/CommonStyles';
import { personalInfoLoader } from '../Profile/skeleton_views';
import { s } from '../../constants/theme/scale';
import CoinsDropdown from './CoinsDropDown';
import CryptoServices from '../../services/crypto';
import SendCryptoServices from '../../services/sendcrypto';
import { CONSTANTS } from './constants';
let checkAmount;

const CardBalance = React.memo((props: any) => {
    const ref = useRef<any>(null);
    const isFocused = useIsFocused();
    const styles = useStyleSheet(themedStyles);
    const [topupLoading, setTopupLoading] = useState(false);
    const [errormsg, setErrormsg] = useState<any>("");
    const [depositData, setDeposiData] = useState<any>({});
    const [depositDataLoading, setDepositDataLoading] = useState<boolean>(false);
    const [topupAmount, setTopupAmount] = useState('');
    const [feeComissionLoading, setFeeComissionLoading] = useState<boolean>(false);
    const [feeComissionData, setFeeComissionData] = useState<any>({});
    const EditInfoLoader = personalInfoLoader(3);
    const CardAvailableBalance = personalInfoLoader(10);
    const { width } = Dimensions.get(CONSTANTS.WINDOW);
    const isPad = width > 600;
    const [coinsModelVisible, setCoinsModelVisible] = useState<boolean>(false);
    const [networkModelVisible, setNetworkModelVisible] = useState<boolean>(false);
    const [selectedCoin, setSelectedCoin] = useState<any>("");
    const [selectedNetwork, setSelectedNetwok] = useState<any>("");
    const [coinsDataList, setCoinsDataList] = useState<any>([]);
    const [networkList, setNetworkList] = useState<any>([]);

    const getCoinsList = async () => {
        try {
            const response: any = await SendCryptoServices.getWithdrawCryptoCoinList();
            if (response?.status === 200) {
                setCoinsDataList(response?.data);
                setErrormsg(null);
                getExchangeDeposite(response?.data[0]?.walletCode)
                getNetworkList(response?.data[0]?.walletCode);

            } else {
                setErrormsg(isErrorDispaly(response));
            }

        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }
    }

    const getNetworkList = async (coinName: string) => {
        try {
            const cardId = props?.route?.params?.cardId
            const res: any = await CryptoServices.getCardNetworks(coinName, cardId);
            if (res.status === 200) {
                setSelectedNetwok(res?.data[0]?.name)
                setNetworkList(res?.data);
            } else {
                setErrormsg(isErrorDispaly(res));
            }
        } catch (err) {
            setErrormsg(isErrorDispaly(err));
        }
    }

    const handleSelectedCoin = async (coin: any) => {
        setSelectedCoin(coin);
        setCoinsModelVisible(false);
        await getExchangeDeposite(coin)
        getNetworkList(coin)
    };

    const handleSelectedNetwork = (network: any) => {
        setSelectedNetwok(network);
        setNetworkModelVisible(false)
    }

    useEffect(() => {
        getCoinsList();
    }, []);

    useEffect(() => {
        if (/^[0-9]\d*(\.\d+)?$/.test(topupAmount)) {
            fetchDepositFeeComission();
        } else {
            setFeeComissionData({});
            checkAmount = null;
        }
    }, [topupAmount, selectedNetwork, selectedCoin]);





    const getExchangeDeposite = async (walletCode?: any) => {
        const cardId = props?.route?.params?.cardId
        setDepositDataLoading(true);
        try {
            const response: any = await CardsModuleService.getDepositData(cardId, walletCode);
            if (response?.status === 200) {
                setDeposiData(response?.data);
                setSelectedCoin(response?.data?.cryptoCurrency)
                setDepositDataLoading(false);
                setErrormsg(null);
            } else {
                setErrormsg(isErrorDispaly(response));
                setDepositDataLoading(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setDepositDataLoading(false);
        }
    };

    const fetchDepositFeeComission = async () => {
        const cardId = props?.route?.params?.cardId;
        if (parseFloat(topupAmount) >= parseFloat(depositData?.depositCryptoMinAmount?.toFixed(2))) {
            setFeeComissionLoading(true)
            try {
                const response: any = await CardsModuleService.getDepositFeeComission(topupAmount || 0, cardId);
                if (response?.status === 200) {
                    if (checkAmount) {
                        setFeeComissionData(response?.data);
                    } else {
                        setFeeComissionData({})
                    }
                    setFeeComissionLoading(false)
                    setErrormsg(null);
                } else {
                    setErrormsg(isErrorDispaly(response));
                    setFeeComissionLoading(false)
                };
            } catch (error) {
                setErrormsg(isErrorDispaly(error));
                setFeeComissionLoading(false)
            }
        } else {
            setFeeComissionData({})
        }
    };
    const handleTopupAmountChange = (text: any) => {
        setErrormsg("");
        checkAmount = text || null;
        if (text) {
            if ((/^\d{0,8}(\.\d{0,2})?$/.test(text))) {
                setTopupAmount(text);
            }
        } else {
            setTopupAmount(text);
        }
    };



    const saveTopUp = async () => {
        setTopupLoading(true);
        if (!topupAmount) {
            setTopupLoading(false);
            ref?.current?.scrollTo({ y: 0, animated: true });
            return setErrormsg(`${CONSTANTS.PLEASE_ENTER_AMOUNT}`);
        }
        if (topupAmount && /^[0-9]\d*(\.\d+)?$/.test(topupAmount) == false) {
            setTopupLoading(false);
            ref?.current?.scrollTo({ y: 0, animated: true });
            return setErrormsg(`${CONSTANTS.PLEASE_ENTER_A_VALID_AMOUNT}`);
        }
        if (!topupAmount || (topupAmount && !(parseFloat(topupAmount) >= (depositData?.depositCryptoMinAmount?.toFixed(2))))) {
            setTopupLoading(false);
            ref?.current?.scrollTo({ y: 0, animated: true });
            return setErrormsg(`${CONSTANTS.THE_MINIMUM_AMOUNT_FOR_DEPOSIT_IS}${" "} ${depositData?.depositCryptoMinAmount?.toFixed(2)} ${depositData?.cryptoCurrency}`);
        }
        if (!topupAmount || (topupAmount && !(parseFloat(topupAmount) <= (depositData?.depositCryptoMaxAmount.toFixed(2))))) {
            setTopupLoading(false);
            ref?.current?.scrollTo({ y: 0, animated: true });
            return setErrormsg(`${CONSTANTS.THE_MAXIMUM_AMOUNT_FOR_DEPOSIT_IS}${" "} ${depositData?.depositCryptoMaxAmount.toFixed(2)} ${depositData?.cryptoCurrency}`);
        }
        if (parseFloat(topupAmount) > parseFloat(amount)) {
            setTopupLoading(false);
            ref?.current?.scrollTo({ y: 0, animated: true });
            return setErrormsg(CONSTANTS.INSUFFICIENT_BALANCE);
        }
        setErrormsg('')
        try {
            const Obj: any = {
                "cardId": props.route.params.cardId,
                "cardNumber": depositData?.cardNumber,
                "network": selectedNetwork,
                "cuurency": depositData?.cryptoCurrency,
                "holderId": depositData?.holderId,
                "amount": topupAmount,
                "fee": feeComissionData?.fee,
                "estimatedAmount": feeComissionData?.estimatedAmount,
                "receivedAmount": feeComissionData?.toTalAmount
            }
            const res = await CardsModuleService.saveDeposit(Obj);
            if (res.status === 200) {
                setTopupLoading(false);
                props.navigation.navigate(CONSTANTS.DEPOSIT_SUBMITTED, { cardId: props.route.params.cardId, reciveAmount: `${formatCurrency(feeComissionData?.toTalAmount || 0, 2)} ${depositData?.fiatCurrency}` });
            } else {
                ref?.current?.scrollTo({ y: 0, animated: true });
                setErrormsg(isErrorDispaly(res));
                setTopupLoading(false);
            }
        } catch (error) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrormsg(isErrorDispaly(error));
            setTopupLoading(false);
        }
    }

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            CONSTANTS.HARDWARE_BACK_PRESS,
            () => { handleBack(); return true; }
        );
        return () => backHandler.remove();
    }, []);
    const handleBack = () => {
        props.navigation.navigate(CONSTANTS.CARD_DETAILS,
            { cardId: props.route.params.cardId })
    };

    const selectedNetworkData = networkList.find(network => network.code === selectedNetwork);
    const amount = selectedNetworkData ? selectedNetworkData.amount : 0;

    const handleSelectCoin = () => {
        setCoinsModelVisible(true)
    };

    const handleNetworkModel = () => {
        setNetworkModelVisible(true)
    };

    const handleCloseError = () => {
        setErrormsg("");
    };
    return (
        <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
            <ScrollView showsVerticalScrollIndicator={false} ref={ref}>
                <Container style={commonStyles.container}>
                    <View>
                        {depositDataLoading ? (
                            <Loadding contenthtml={CardAvailableBalance} />
                        ) : (
                            <>
                                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.justifyContent]}>
                                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                        <TouchableOpacity style={[]} onPress={handleBack}>
                                            <View>
                                                <AntDesign name={CONSTANTS.ARROW_LEFT} size={s(22)} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
                                            </View>
                                        </TouchableOpacity>
                                        <ParagraphComponent text={CONSTANTS.DEPOSIT} style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw700]} />
                                    </View>
                                </View>
                                {errormsg && <ErrorComponent message={errormsg} onClose={handleCloseError} />}
                                <View style={[commonStyles.mb43]} />
                                <View style={[commonStyles.orangeSection, commonStyles.dflex, commonStyles.rounded20, { minHeight: isPad ? 150 : 115, paddingVertical: 16 }]}>

                                    <Image style={[styles.hand]} source={require("../../assets/images/cards/deposithand.png")} />
                                    <View style={[commonStyles.flex1, commonStyles.px10]}>
                                        <View >
                                            <TouchableOpacity onPress={handleSelectCoin} style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                                                <ParagraphComponent text={selectedCoin || depositData?.cryptoCurrency} style={[commonStyles.fs24, commonStyles.textBlack, commonStyles.fw700]} />
                                                <Image style={styles.downArrow} source={require("../../assets/images/banklocal/down-arrow.png")} />
                                            </TouchableOpacity>
                                        </View>
                                        <ParagraphComponent style={[commonStyles.fs12, commonStyles.textBlack, commonStyles.fw600]} text='Crypto Currency' />
                                        <View style={[styles.dashedHr, commonStyles.mt10,]} />

                                        <ParagraphComponent text={`${formatCurrency(amount)} ${selectedCoin || depositData?.cryptoCurrency}`} style={[commonStyles.fs24, commonStyles.textBlack, commonStyles.fw700]} />
                                        <View >
                                            <TouchableOpacity onPress={handleNetworkModel} style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                                                <ParagraphComponent text={`${CONSTANTS.BALANCE} (${selectedNetwork || ""}) `} style={[commonStyles.fs18, commonStyles.textBlack, commonStyles.fw600]}
                                                />

                                                <Image style={styles.downArrow} source={require("../../assets/images/banklocal/down-arrow.png")} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                                <View style={[styles.cardNumberStyle, commonStyles.rounded24, commonStyles.p24, { marginTop: -40, zIndex: -1 }]}>
                                    <View style={commonStyles.mb28} />
                                    <ParagraphComponent text={depositData?.cardNumber} style={[commonStyles.fs18, commonStyles.textBlack, commonStyles.fw600, commonStyles.textCenter]} />
                                    <ParagraphComponent style={[commonStyles.fs12, commonStyles.textGrey, commonStyles.fw600, commonStyles.flex1, commonStyles.textCenter]} text='Card Number' numberOfLines={2} />
                                </View>
                                <View style={commonStyles.mb24} />
                                <View>

                                    <View style={[commonStyles.relative, styles.SelectStyle, commonStyles.p16, commonStyles.rounded24, commonStyles.dflex, commonStyles.alignCenter]}>
                                        <ParagraphComponent text={`${CONSTANTS.DEPOSIT} \n ${CONSTANTS.AMOUNT}`} style={[commonStyles.fs24, commonStyles.textGrey, commonStyles.fw600, { color: NEW_COLOR.INPUT_INSIDE_LABEL }]} />
                                        <View style={[commonStyles.flex1]}>
                                            <TextInputField
                                                inputStyle={[isPad ? commonStyles.fs24 : commonStyles.fs36, commonStyles.textRight, { height: 45, paddingBottom: 0, paddingTop: 0, paddingRight: 0, }]}
                                                style={styles.depoInput}
                                                onChangeText={handleTopupAmountChange}
                                                keyboardType={CONSTANTS.NUMERIC}
                                                value={topupAmount}
                                                placeholder={CONSTANTS.PLACEHOLDER} />
                                            <View >
                                                <ParagraphComponent text={`${depositData?.cryptoCurrency}`} style={[commonStyles.fs14, commonStyles.textGrey, commonStyles.fw600, commonStyles.textRight]} />
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.mb4} />
                                    <ParagraphComponent text={`${CONSTANTS.MAXIMUM_DEPOSIT_AMOUNT_IS}`} style={[commonStyles.fs10, commonStyles.textGrey, commonStyles.fw500, { marginLeft: 16 }]}
                                        children={<ParagraphComponent text={` ${formatCurrency(depositData.depositCryptoMaxAmount || 0, 2)} `} style={[commonStyles.fs12, commonStyles.textBlack, commonStyles.fw700,]}
                                            children={<ParagraphComponent text={depositData?.cryptoCurrency} style={[commonStyles.fs10, commonStyles.textGrey, commonStyles.fw500,]} numberOfLines={1}
                                                children={<ParagraphComponent text={` / ${formatCurrency(depositData?.depositMaxAmount || 0, 2)} `} style={[commonStyles.fs10, commonStyles.textBlack, commonStyles.fw700,]} numberOfLines={1}
                                                    children={<ParagraphComponent text={`${depositData?.fiatCurrency}`} style={[commonStyles.fs10, commonStyles.textGrey, commonStyles.fw500,]} numberOfLines={1} />}
                                                />}
                                            />}
                                            numberOfLines={1} />}
                                        numberOfLines={1}
                                    />
                                    <ParagraphComponent text={`${CONSTANTS.MINIMUM_DEPOSIT_AMOUNT_IS} `} style={[commonStyles.fs10, commonStyles.textGrey, commonStyles.fw500, { marginLeft: 16 }]}
                                        children={<ParagraphComponent text={` ${formatCurrency(depositData.depositCryptoMinAmount || 0, 2)} `} style={[commonStyles.fs12, commonStyles.textBlack, commonStyles.fw700,]}
                                            children={<ParagraphComponent text={depositData?.cryptoCurrency} style={[commonStyles.fs10, commonStyles.textGrey, commonStyles.fw500,]}
                                                children={<ParagraphComponent text={` /  ${formatCurrency(depositData?.depositMinAmount || 0, 2)} `} style={[commonStyles.fs10, commonStyles.textBlack, commonStyles.fw700,]} numberOfLines={1}
                                                    children={<ParagraphComponent text={`${depositData?.fiatCurrency}`} style={[commonStyles.fs10, commonStyles.textGrey, commonStyles.fw500,]} numberOfLines={1} />}
                                                />}
                                                numberOfLines={1} />}
                                            numberOfLines={1} />}
                                        numberOfLines={1}
                                    />
                                </View>
                                <View style={[commonStyles.mb24]} />
                                {feeComissionLoading && (
                                    <View style={[commonStyles.flex1]}>
                                        <Loadding contenthtml={EditInfoLoader} />
                                    </View>
                                )}
                                {!feeComissionLoading &&
                                    <View style={[commonStyles.sectionStyle]}>
                                        <View style={[commonStyles.dflex, commonStyles.justify, commonStyles.alignCenter, commonStyles.gap16,]}>
                                            <ParagraphComponent style={[commonStyles.fs12, commonStyles.textGrey, commonStyles.fw400,]} text={CONSTANTS.FEE} />
                                            <ParagraphComponent style={[commonStyles.fs14, commonStyles.textBlack, commonStyles.fw500,]} text={`${formatCurrency(feeComissionData?.fee || 0, 2)} ${depositData?.cryptoCurrency}`} />
                                        </View>
                                        <View style={[commonStyles.dashedLine, commonStyles.mt8, commonStyles.mb8]} />
                                        <View style={[commonStyles.dflex, commonStyles.justify, commonStyles.alignCenter, commonStyles.gap16,]}>
                                            <ParagraphComponent style={[commonStyles.fs12, commonStyles.textGrey, commonStyles.fw400, commonStyles.flex1]} text={CONSTANTS.ESTIMATED_CRYPTO_AMOUNT} />
                                            <ParagraphComponent style={[commonStyles.fs14, commonStyles.textBlack, commonStyles.fw500,]} text={`${formatCurrency(feeComissionData?.estimatedAmount || 0, 2)} ${depositData?.cryptoCurrency}`} />
                                        </View>
                                        <View style={[commonStyles.dashedLine, commonStyles.mt8, commonStyles.mb8]} />

                                        <View style={[commonStyles.dflex, commonStyles.justify, commonStyles.alignCenter, commonStyles.gap16,]}>
                                            <ParagraphComponent style={[commonStyles.fs12, commonStyles.textGrey, commonStyles.fw400,]} text={CONSTANTS.TOTAL_RECEIVE_CURRENCY_AMOUNT} />
                                            <ParagraphComponent style={[commonStyles.fs14, commonStyles.textBlack, commonStyles.fw500,]} text={`${formatCurrency(feeComissionData?.toTalAmount || 0, 2)} ${depositData?.fiatCurrency}`} />
                                        </View>

                                    </View>}

                                <View style={[commonStyles.mb16]} />
                                <View>
                                    <ParagraphComponent style={[commonStyles.fs12, commonStyles.textGrey, commonStyles.fw400, commonStyles.flex1, { paddingHorizontal: 10, }]} text={CONSTANTS.DUE_TO_CURRENCY_PRICE_FLUCTUATIONS_THERE_MAY_BE_A_SMALL_DIFFERENCE_BETWEEN_THE_FINAL_DEDUCTION_AMOUNT_AND_THE_DISPLAYED_AMOUNT} />
                                </View>
                                <View style={[commonStyles.mb43]} />
                                <View style={[commonStyles.mb43]} />
                                <View >
                                    <DefaultButton
                                        title={CONSTANTS.CONFIRM}
                                        style={undefined}
                                        customButtonStyle={undefined}
                                        customContainerStyle={undefined}
                                        backgroundColors={undefined}
                                        disable={topupLoading}
                                        loading={topupLoading}
                                        colorful={undefined}
                                        transparent={undefined}
                                        onPress={() => saveTopUp()}
                                        iconCheck={true}
                                        iconRight={false}
                                    />
                                </View>
                            </>)}
                        <View style={[commonStyles.mb32]} />
                    </View>

                </Container>
            </ScrollView>
            {coinsModelVisible && <CoinsDropdown coinsList={coinsDataList} modelvisible={() => { setCoinsModelVisible(false) }} handleSelect={handleSelectedCoin} label={CONSTANTS.COIN} selected={selectedCoin} />}
            {networkModelVisible && <CoinsDropdown coinsList={networkList} modelvisible={() => { setNetworkModelVisible(false) }} handleSelect={handleSelectedNetwork} label={CONSTANTS.NETWORK} selected={selectedNetwork} />}
        </SafeAreaView>
    )
});

export default CardBalance;

const themedStyles = StyleService.create({
    depoInput: {
        borderWidth: 0,
        backgroundColor: "transparent",
        height: 45,
    },
    cardNumberStyle: {
        borderWidth: 1, borderColor: NEW_COLOR.SEARCH_BORDER,
        width: "100%", borderStyle: "dashed",
    },
    hand: {
        bottom: -10, left: 0
    },
    dashedHr: {
        borderBottomWidth: 0.8, borderBottomColor: NEW_COLOR.TEXT_BLACK,
        height: 1, width: "100%", borderStyle: "dashed",
    },
    mb4: {
        marginBottom: 4
    },
    SelectStyle: {
        borderRadius: 12,
        borderWidth: 1, backgroundColor: NEW_COLOR.BG_PURPLERDARK,
        borderColor: NEW_COLOR.SEARCH_BORDER,
        borderStyle: "dashed"
    },
});