import React, { useEffect, useRef, useState } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { isErrorDispaly } from "../../../../utils/helpers";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import { getThemedCommonStyles } from "../../../../assets/styles/CommonStyles";
import { s, screenWidth } from "../../../../constants/theme/scale";
import Container from "../../../../newComponents/container/container";
import { cardsService } from "../../../../apiServices/cardsApis/cardsApiServices";
import ViewComponent from "../../../../newComponents/view/view";
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import ErrorComponent from "../../../../newComponents/errorDisplay/errorDisplay";
import ScrollViewComponent from "../../../../newComponents/scrollView/scrollView";
import ImageBackgroundWrapper from "../../../../newComponents/imageComponents/ImageBackground";
import { VisaHorizontalImage } from "../../../../assets/vectorAssets";
import ButtonComponent from "../../../../newComponents/buttons/button";
import FeeStepForm from "./feeStepForm/feeStepForm";
import { ApplyCardFormValues, CardsFeeInfo } from "../kycRequirements/constants";
import { useLngTranslation } from "../../../../hooks/useLngTranslation";
import { useHardwareBackHandler } from "../../../../hooks/HardwareBackHandler";
import { useSelector } from "react-redux";
import SwokipayDashboardLoader from "../../../../newComponents/swokipayloader";
import { showAppToast } from "../../../../newComponents/ToasterMessages/ShowMessage";



const FeeStep = (props: any) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [custumErrormsg, setCustumErrormsg] = useState<{ isShow: boolean, errorList: string[] }>({ isShow: false, errorList: [] });
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [iHaveCard, setIHaveCard] = useState<{ haveCard: boolean, sendCard: boolean }>({ haveCard: false, sendCard: false });

    const [selectedCoin, setSelectedCoin] = useState<any>("");
    const [selectedNetwork, setSelectedNetwork] = useState<any>({})
    const [coinsDataList, setCoinsDataList] = useState<any>([]);
    const [networkList, setNetworkList] = useState<any>([]);
    const [feeCardsLoading, setFeeCardsLoading] = useState<boolean>(false);
    const applyCardData = useSelector((state: any) => state.userReducer?.applyCardData);
    const applyCardTerms = useSelector((state: any) => state.userReducer?.applyCardTerms);
    const [cardsFeeInfo, setCardsFeeInfo] = useState<CardsFeeInfo | null>();
    const isFocused = useIsFocused();
    const { t } = useLngTranslation();
    const cardData = props?.route?.params?.cardDetails?.logo;
    const userInfo = useSelector((state: any) => state.userReducer?.userInfo);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const navigation = useNavigation<any>();
    const initialFormValues: ApplyCardFormValues = {
        handHoldingIdPhoto: "",
        cardNumber: "",
        envelopenumber: "",
        currency: "",
        network: "",
        membernumber: "",
        address: "",
        shippingAddressId: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        addressCountry: "",
        town: ""
    };
    const ref = useRef<any>();
    let WalletId = "";
    // const [physicalCardFormData, setPhysicalCardFormData] = useState({
    //     handHoldingIdPhoto: "",
    //     cardNumber: "",
    //     envelopenumber: ""

    // });

    const handleBackPress = () => {
        props.navigation.goBack();
    }

    useEffect(() => {
        if (isFocused) {
            getCoinsList();
        }
    }, [isFocused]);

    const getCoinsList = async () => {
        setIsLoading(true);
        try {
            const response: any = await cardsService.getWithdrawCryptoCoinList();
            if (response?.ok && response?.status === 200) {
                setCoinsDataList(response?.data);
                setSelectedCoin(response?.data[0]);
                setError("");
                getApplyCardDeatilsInfo(response?.data[0]?.id);

            } else {
                ref?.current?.scrollTo({ y: 0, animated: true });
                setError(isErrorDispaly(response));
                setIsLoading(false);
            }
        } catch (error) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setError(isErrorDispaly(error));
            setIsLoading(false);
        }

    }
    const getNetworkList = async (coinName: string) => {
        setError("");
        try {
            const res: any = await cardsService.getFeeNetworkLookup(coinName);
            if (res.status === 200) {
                setSelectedNetwork(res?.data[0])
                setNetworkList(res?.data);
                WalletId = res?.data[0]?.id;
                setError("");
            } else {
                ref?.current?.scrollTo({ y: 0, animated: true });
                setError(isErrorDispaly(res));
                setIsLoading(false);
                setError("");
            }
        } catch (err) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setError(isErrorDispaly(err));
            setIsLoading(false);
            setError("");

        }
    }
    const getApplyCardDeatilsInfo = async (networkId?: string, haveCardValue?: boolean) => {
        const cardId = props?.route?.params?.cardDetails?.id;
        const walletId = networkId || WalletId || selectedNetwork?.id;
        const cardValue = haveCardValue !== undefined ? haveCardValue : !iHaveCard.sendCard;

        if (!cardId || !walletId) {
            console.log('Missing required parameters for API call');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response: any = await cardsService?.getApplyCardsCustomerFeeInfo(cardId,cardValue);
            if (response?.ok) {
                setCardsFeeInfo(response?.data);
                setError('');
                setIsLoading(false);
            } else {
                ref?.current?.scrollTo({ y: 0, animated: true });
                setError(isErrorDispaly(response));
                setIsLoading(false);
            }
        } catch (error) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setError(isErrorDispaly(error));
            setIsLoading(false);
        }
    };

    const handleCustomerCardsWallet = async (values?: any) => {
        setError("");
        setBtnLoading(true);
        if (cardsFeeInfo?.cardType === "Physical" && !iHaveCard.haveCard && !iHaveCard.sendCard) {
            setError("Please select at least one option: either 'I have the card on hand' or 'Please send a card to me'.");
            setBtnLoading(false);
            ref?.current?.scrollTo({ y: 0, animated: true });

            return;
        }
        setCustumErrormsg({ isShow: false, errorList: [] });
        const kycData = applyCardData?.KycUpdateModel || {};

        let Obj = {
            programId: props?.route?.params?.cardDetails?.id,
            promoCode: "",
            noteType: applyCardTerms?.noteType || "",
            note: applyCardTerms?.noteType?.toLowerCase() === 'dynamic' ? JSON.stringify(applyCardTerms?.note || []).toLowerCase() : "",

            kyc: {
                cardId: props?.route?.params?.cardDetails?.id || kycData.cardId,
                firstName: kycData.firstName || "",
                addressLine1: kycData.addressLine1 || "",
                city: kycData.city || "",
                state: kycData.state || "",
                country: kycData.country || "",
                town: kycData.town || "",
                lastName: kycData.lastName || "",
                idType: kycData.idType || "",
                idNumber: kycData.idNumber || "",
                profilePicFront: kycData.profilePicFront || "",
                profilePicBack: kycData.profilePicBack || "",
                signature: kycData.signature || "",
                docExpiryDate: kycData.docExpiryDate || "",
                docIssueDate: kycData.docIssueDate || "",
                dob: kycData.dob || "",
                biometric: kycData.biometric || "",
                backDocImage: kycData.backDocImage || "",
                gender: kycData.gender || "",
                kycRequirements: kycData.requirement || "",
                email: kycData.email || "",
                mobileCode: kycData.mobileCode || "",
                mobile: kycData.mobile || "",
                faceImage: kycData.faceImage || "",
                handHoldingIDPhoto: kycData.handHoldingIDPhoto || "",
                emergencyContactName: kycData.emergencyContactName || "",
                postalCode: kycData.postalCode || "",
                cardHandHoldingIDPhoto: values?.handHoldingIdPhoto || "",
                occupation: kycData.occupation || "",
                ipAddress: kycData.ipAddress || "72.14.201.189" || "",
                annualSalary: parseInt(kycData.annualSalary) || 0,
                accountPurpose: kycData.accountPurpose || "",
                expectedMonthlyVolume: parseInt(kycData.expectedMonthlyVolume) || 0,
            },
            billingAddress: {
                cardHolderName: userInfo?.userName,
                addressLine1: values?.addressLine1 || kycData.addressLine1 || "",
                addressLine2: values?.addressLine2 || kycData.addressLine2 || "",
                city: values?.city || kycData.city || "",
                state: values?.state || kycData.state || "",
                town: values?.town || kycData.town || "",
                postalCode: values?.postalCode || kycData.postalCode || "",
                country: values?.addressCountry || kycData.country || ""
            },
            shippingAddress: {
            }
        }

        try {
            const res: any = await cardsService?.saveCustomerCardsWallet(Obj)
            if (res.status === 200) {
                props.navigation.push("CardSuccess", {
                    cardId: props?.route?.params?.cardId,
                    cardWalletId: res?.data
                });
                navigation.navigate('Dashboard', { screen: 'GLOBAL_CONSTANTS.CARDS' });
                showAppToast(t("GLOBAL_CONSTANTS.CARD_APPLIED_SUCCESSFULLY"), "success")
                setBtnLoading(false);
                setError('');
            } else {
                if (res.status === 523) {
                    if (res.data?.title.indexOf(',') > -1) {
                        setCustumErrormsg({ isShow: true, errorList: res.data?.title?.split(',') })
                    } else {
                        setCustumErrormsg({ isShow: true, errorList: [res.data?.title] })
                    }

                } else {
                    setError(isErrorDispaly(res));
                }
                setBtnLoading(false);
                ref?.current?.scrollTo({ y: 0, animated: true });
            }

        }
        catch (error) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setError(isErrorDispaly(error));
            setBtnLoading(false)
        }
    };

    useHardwareBackHandler(() => {
        handleBackPress();
    })


    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            <Container>
                <PageHeader title={"GLOBAL_CONSTANTS.CARD_APPLICATION_ORDER"} onBackPress={handleBackPress} />
                {error && <ErrorComponent message={error} screen={true} />}
                {isLoading && (
                    <ViewComponent style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter]}>
                        <SwokipayDashboardLoader />
                    </ViewComponent>
                )}
                {!isLoading && (
                    <>
                        <ScrollViewComponent>
                            <ViewComponent style={[]}>
                                <ImageBackgroundWrapper
                                    source={{ uri: cardData }}
                                    style={[
                                        commonStyles.rounded12,
                                        { width: screenWidth * 0.80, height: s(186), alignSelf: 'center', overflow: 'hidden', borderRadius: s(12) }
                                    ]}
                                    resizeMode="cover"
                                    imageStyle={[commonStyles.rounded12, { width: '100%', height: '100%', borderRadius: s(16) }]}
                                >
                                    <ViewComponent style={[commonStyles.flex1, commonStyles.p16, { justifyContent: 'flex-end', alignItems: 'flex-end' }]}>
                                        <VisaHorizontalImage />
                                    </ViewComponent>
                                </ImageBackgroundWrapper>
                            </ViewComponent>
                            <ViewComponent>
                                <ViewComponent>
                                    {!feeCardsLoading && (
                                        <FeeStepForm
                                            commonStyles={commonStyles}
                                            NEW_COLOR={NEW_COLOR}
                                            t={t}
                                            initialFormValues={initialFormValues}
                                            iHaveCard={iHaveCard}
                                            setIHaveCard={setIHaveCard}
                                            cardsFeeInfo={cardsFeeInfo}
                                            selectedCurrency={selectedCoin}
                                            selectedNetwork={selectedNetwork}
                                            currencyList={coinsDataList}
                                            networkList={networkList}
                                            setSelectedCurrency={setSelectedCoin}
                                            setSelectedNetwork={setSelectedNetwork}
                                            getApplyCardDeatilsInfo={getApplyCardDeatilsInfo}
                                            getNetworkList={getNetworkList}

                                        />
                                    )}
                                </ViewComponent>
                            </ViewComponent>
                        </ScrollViewComponent>
                        <ViewComponent style={[commonStyles.flex1]} />
                        <ButtonComponent
                            title={"GLOBAL_CONSTANTS.REVIEW_PAY"}
                            onPress={handleCustomerCardsWallet}
                            loading={btnLoading}
                            disable={btnLoading}
                        />
                        <ViewComponent style={[commonStyles.sectionGap]} />
                    </>
                )}
            </Container>
        </ViewComponent>
    );
};

export default FeeStep;

