import { CARD_URIS, getThemedCommonStyles } from "../../../../../components/CommonStyles";
import Container from "../../../../../components/container/container";
import PageHeader from "../../../../../components/pageHeader/pageHeader";
import { useEffect, useRef, useState } from "react";
import ErrorComponent from "../../../../../components/errorDisplay/errorDisplay";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import ImageBackgroundWrapper from "../../../../../components/imageComponents/ImageBackground";
import ViewComponent from "../../../../../components/view/view";
import TextMultiLangauge from "../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ImageUri from "../../../../../components/imageComponents/image";
import { s } from "../../../../../constants/styels/scale";
import { isErrorDispaly } from "../../../../../utils/helpers";
import CardsModuleService from "../../../../../apiServices/cards";
import ScrollViewComponent from "../../../../../components/scrollView/scrollView";
import Loadding from "../../../../../components/skelton/skeltons";
import KycForm from "../apply_card_kyc/kycForm";
import CustomRBSheet from "../../../../../components/models/commonBottomSheet";
import { useDispatch, useSelector } from "react-redux";
import { setApplyCardData, setCardHolderStatusId,setKybApplyCardData } from "../../../../../redux/actions/actions";
import ParagraphComponent from "../../../../../components/textComponets/paragraphText/paragraph";
import useEncryptDecrypt from "../../../../../hooks/encDecHook";
import ApplySuccess from "../apply_card_kyc/applySuccess";
import { KycCompleteImage } from "../../../../../assets/svg";
import { CardFee, ExchangeCardViewLoader,CardDetailsFieldLoader } from "../../../../../skeletons/cardsSkeletons";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import { Dimensions, ScrollView } from "react-native";
import ActionButton from "../../../../../components/gradianttext/gradiantbg";
import { useLngTranslation } from "../../../../../hooks/languagesHook/useLngTranslation";
import ApplyCardForm from "./feeDetails";
import { AssetForSelector } from "../constants";
import { ApplyCardData, ApplyCardFormValues, ApplyCardProps, CardRequirements, CardsFeeInfo, RBSheetRef, RootState } from "../interface";
import { useHardwareBackHandler } from "../../../../../hooks/backHandleHook";
import { logEvent } from "../../../../../hooks/loggingHook";
import { buildCardCompanyApplicationModel } from "../apply_card_kyb/kybservice";
import ButtonComponent from "../../../../../components/buttons/button";

const screenWidth = Dimensions.get("window").width;

const ApplyCard = (props: ApplyCardProps) => {
    const [errorMsg, setErrorMsg] = useState<string>("");
    const FeeCardSkeleton = ExchangeCardViewLoader();
    const CardDetailsSkeleton = CardDetailsFieldLoader();

    const [cardRequirements, setCardRequrements] = useState<CardRequirements | null>(null);
    const [feeCardsLoading, setFeeCardsLoading] = useState<boolean>(false);
    const [cardFeeDetailsLoading, setCardFeeDetailsLoading] = useState<boolean>(false);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [cardsFeeInfo, setCardsFeeInfo] = useState<CardsFeeInfo | null>();
    const [iHaveCard, setIHaveCard] = useState<{ haveCard: boolean, sendCard: boolean }>({ haveCard: false, sendCard: false });
    const [shippingAddressId, setShippingAddressId] = useState<string | null>(null);
    const [dynamicFields, setDynamicFields] = useState<any[]>([]);

    const rbSheetRef = useRef<RBSheetRef>(null);
    const applyCardsKycData = useSelector((state: RootState) => state.userReducer.applyCardData);
    const acceptedTerms = useSelector((state: any) => state.userReducer?.acceptedTerms);

    const dispatch = useDispatch();
    const rbSheetRef1 = useRef<RBSheetRef>(null);
    const { encryptAES } = useEncryptDecrypt();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const isFocused = useIsFocused();
    const [coinWithCurrencyListForSelector, setCoinWithCurrencyListForSelector] = useState<AssetForSelector[]>([]);
    const [selectedAssetForDisplay, setSelectedAssetForDisplay] = useState<AssetForSelector | null>(null);
    const { t } = useLngTranslation();
    const cardFeeLoader = CardFee();
    const scrollViewRef = useRef<ScrollView>(null);
    const navigation = useNavigation<any>();
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const applyCardsKyBData = useSelector((state: RootState) => state.userReducer.kybApplyCardData);
    const storeCardHolderStatusId=useSelector((state: RootState) => state.userReducer.cardHolderStatusId);
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
        town: "",
    };
    const isBusiness = userInfo?.accountType?.toLowerCase() !== "personal";
    const isCusomerCreated = props?.route?.params?.isCustomerCreated
    useEffect(() => {
        if (props?.route?.params?.cardId) {
            getRequirements();
            fetchAllCoinNetworkCombinations();
        }
    }, [props?.route?.params?.cardId, isFocused, props?.route?.params?.refreshFromSumsub]);

    useHardwareBackHandler(() => {
        handleBack()
    })
    const safeEncrypt = (value: unknown): string => {
        try {
            if (value === null || value === undefined || value === '') return '';
            return encryptAES(String(value));
        } catch (error) {
            return '';
        }
    };
    const processKycData = (
        kycData: ApplyCardData | null | undefined
    ) => {
        if (isBusiness) {
            return {
                ...kycData,
                KycUpdateModel: null
            };
        }
        if (!kycData || !kycData.KycUpdateModel) return {};

        const processed = JSON.parse(JSON.stringify(kycData));

        const kyc = processed?.KycUpdateModel;

        return {
            KycUpdateModel: !isBusiness ? {
                customerId: userInfo?.id ?? "",
                cardId: props?.route?.params?.cardId ?? "",
                firstName: safeEncrypt(kyc?.firstName ?? ""),
                lastName: safeEncrypt(kyc?.lastName ?? ""),
                addressLine1: kyc?.addressLine1 ?? "",
                city: kyc?.city ?? "",
                state: kyc?.state ?? "",
                country: kyc?.country ?? "",
                addressCountry: kyc?.addressCountry ?? "",
                // town: kyc?.town ?? "",
                idType: kyc?.idType ?? "",
                idNumber: safeEncrypt(kyc?.idNumber ?? ""),
                issueDate: kyc?.issueDate ?? "",
                profilePicFront: kyc?.profilePicFront ?? "",
                profilePicBack: kyc?.backDocImage ?? "",
                signature: kyc?.signature ?? "",
                docExpiryDate: kyc?.docExpiryDate,
                docIssueDate: safeEncrypt(kyc?.docIssueDate) ?? "",
                dob: safeEncrypt(kyc?.dob) ?? "",
                biometric: kyc?.biometric ?? "",
                backDocImage: kyc?.backDocImage ?? "",
                gender: kyc?.gender ?? "",
                email: safeEncrypt(kyc?.email ?? ""),
                mobileCode: safeEncrypt(kyc?.mobileCode ?? ""),
                mobile: safeEncrypt(kyc?.mobile ?? ""),
                faceImage: kyc?.faceImage ?? "",
                emergencyContactName: kyc?.emergencyContactName ?? "",
                postalCode: kyc?.postalCode ?? "",
                handHoldingIDPhoto: kyc?.handHoldingIDPhoto ?? "",
                occupation: kyc?.occupation ?? "",
                ipAddress: kyc?.ipAddress ?? "",
                annualSalary: parseFloat(kyc?.annualSalary )?? 0,
                accountPurpose: kyc?.accountPurpose ?? "",
                expectedMonthlyVolume: parseFloat(kyc?.expectedMonthlyVolume) ?? 0,
                requirement: kyc?.requirement || "",
                addressLine2: kyc?.addressLine2 ?? "",
            } : null,
        };
    };
    const kycData = isBusiness ? processKycData(applyCardsKycData) : null;
    const encryptKybData = (data: ApplyCardData | null | undefined
    ) => {
        if (!data || typeof data !== 'object') return {};
        const encryptedData = JSON.parse(JSON.stringify(data));
        if (userInfo?.accountType?.toLowerCase() !== "personal") {
            encryptedData.KycUpdateModel = null;
            return encryptedData;
        }
        if (!encryptedData.KycUpdateModel) {
            encryptedData.KycUpdateModel = {};
            return encryptedData;
        }
        if (encryptedData.KycUpdateModel) {
            encryptedData.KycUpdateModel = {
                customerId: userInfo?.id ?? "",
                cardId: props?.route?.params?.cardId ?? "",
                firstName: safeEncrypt(encryptedData?.KycUpdateModel?.firstName),
                lastName: safeEncrypt(encryptedData?.KycUpdateModel?.lastName),
                country: encryptedData?.KycUpdateModel?.country,
                addressCountry: encryptedData?.KycUpdateModel?.addressCountry ?? "",
                dob: safeEncrypt(encryptedData?.KycUpdateModel?.dob),
                email: safeEncrypt(encryptedData?.KycUpdateModel?.email),
                gender: encryptedData?.KycUpdateModel?.gender,
                biometric: encryptedData?.KycUpdateModel?.biometric,
                docExpiryDate: encryptedData?.KycUpdateModel?.docExpiryDate || "",
                mixDoc: encryptedData?.KycUpdateModel?.mixDoc || "",
                emergencyContactName: encryptedData?.KycUpdateModel?.emergencyContactName || "",
                faceImage: encryptedData?.KycUpdateModel?.faceImage || "",
                addressLine1: encryptedData?.KycUpdateModel?.addressLine1 ?? "",
                city: encryptedData?.KycUpdateModel?.city ?? "",
                state: encryptedData?.KycUpdateModel?.state ?? "",
                // town: encryptedData?.KycUpdateModel?.town ?? "",
                idType: encryptedData?.KycUpdateModel?.idType ?? "",
                idNumber: safeEncrypt(encryptedData?.KycUpdateModel?.idNumber ?? ""),
                issueDate: encryptedData?.KycUpdateModel?.issueDate ?? "",
                profilePicFront: encryptedData?.KycUpdateModel?.profilePicFront ?? "",
                profilePicBack: encryptedData?.KycUpdateModel?.backDocImage ?? "",
                signature: encryptedData?.KycUpdateModel?.signature ?? "",
                docIssueDate: safeEncrypt(encryptedData?.KycUpdateModel?.docIssueDate ?? ""),
                backDocImage: encryptedData?.KycUpdateModel?.backDocImage ?? "",
                mobileCode: safeEncrypt(encryptedData?.KycUpdateModel?.mobileCode ?? ""),
                mobile: safeEncrypt(encryptedData?.KycUpdateModel?.mobile ?? ""),
                handHoldingIDPhoto: encryptedData?.KycUpdateModel?.handHoldingIDPhoto ?? "",
                cardHandHoldingIDPhoto: encryptedData?.KycUpdateModel?.handHoldingIDPhoto ?? "",
                postalCode: encryptedData?.KycUpdateModel?.postalCode ?? "",
                occupation: encryptedData?.KycUpdateModel?.occupation ?? "",
                ipAddress: encryptedData?.KycUpdateModel?.ipAddress ?? "",
                annualSalary: encryptedData?.KycUpdateModel?.annualSalary ?? 0,
                accountPurpose: encryptedData?.KycUpdateModel?.accountPurpose ?? "",
                expectedMonthlyVolume: encryptedData?.KycUpdateModel?.expectedMonthlyVolume ?? 0,
                requirement: encryptedData?.KycUpdateModel?.requirement || "",
                addressLine2: encryptedData?.KycUpdateModel?.addressLine2 ?? "",

            };
        }


        return encryptedData;
    };
    const encryptedKybData = isBusiness ? encryptKybData(applyCardsKycData) : null;;

    const fetchAllCoinNetworkCombinations = async (formikSetFieldValue?: Function) => {
        setFeeCardsLoading(true);
        setErrorMsg("");
        let initialSelectedAsset: AssetForSelector | null = null;
        try {
            const coinsResponse: any = await CardsModuleService.getCoins(props?.route?.params?.cardId);
            const tempCombinedList: any[] = [];
            if (coinsResponse?.data?.length > 0) {
                coinsResponse?.data.forEach((item: any) => {
                    tempCombinedList.push({
                        id: item.id,
                        coinName: item.name || item.currencyCode,
                        code: item.currencyCode,
                        coinImage: item.logo,
                        amount: item.amount,

                    })

                });
            }

            setCoinWithCurrencyListForSelector(tempCombinedList);

            if (tempCombinedList.length > 0) {
                initialSelectedAsset = tempCombinedList[0];
                setSelectedAssetForDisplay(initialSelectedAsset);
                if (formikSetFieldValue && initialSelectedAsset) {
                    formikSetFieldValue("currency", initialSelectedAsset.code);
                }
                if (initialSelectedAsset) {
                    await getApplyCardDeatilsInfo(initialSelectedAsset.id, iHaveCard.haveCard);
                }
            } else {
                setSelectedAssetForDisplay(null);
                setCardsFeeInfo(null);
                if (formikSetFieldValue) {
                    formikSetFieldValue("currency", "");
                }
                setErrorMsg("No currency/network combinations found.");
            }
        } catch (error: unknown) {
            setErrorMsg(isErrorDispaly(error));
            setSelectedAssetForDisplay(null);
            setCardsFeeInfo(undefined);
        } finally {
            setFeeCardsLoading(false);
        }
    };

    const getApplyCardDeatilsInfo = async (walletId: string, haveCardValue?: boolean) => {
        const programId = props?.route?.params?.cardId;
        setCardFeeDetailsLoading(true);
        try {
            const response: any = await CardsModuleService?.getApplyCardsCustomerFeeInfo(programId, walletId, haveCardValue ?? iHaveCard.haveCard);
            if (response?.ok) {
                setCardsFeeInfo(response?.data);
                setErrorMsg('');
            } else {
                setErrorMsg(isErrorDispaly(response));
            }
        } catch (error: unknown) {
            setErrorMsg(isErrorDispaly(error));
        }
        finally {
            setCardFeeDetailsLoading(false);
        }
    };
   const handleBack = () => {
        if(props?.route?.params?.screenName === "CardSetupStatus"){
        dispatch(setCardHolderStatusId(""));
        navigation.navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.CARDS", animation: 'slide_from_left' });
        }else{
        navigation.goBack();
        // dispatch(setApplyCardData(""))
        // dispatch(setKybApplyCardData(""))
        // dispatch({ type: 'SET_KYC_FORM_DATA', payload: null }); // Clear KYC form data
        }
    }
    const getRequirements = async () => {
        try {
            const response: any = await CardsModuleService.getApplyCardsRequirements(props?.route?.params?.cardId);
            if (response?.ok) {
                if (userInfo?.accountType?.toLowerCase() === "personal") {
                    setCardRequrements(response?.data?.kyc);
                } else {
                    setCardRequrements(response?.data?.kyb);

                }
                setErrorMsg("");
            } else {
                setErrorMsg(isErrorDispaly(response));
            }
        } catch (error: unknown) {
            setErrorMsg(isErrorDispaly(error));
        }
    };


    // KYC Modal
    const hadleFillKyc = async () => {
        if (userInfo?.accountType?.toLowerCase() === "personal") {
            props.navigation.navigate("KycForm", {
                cardId: props?.route?.params?.cardId
            })
        } else {
            dispatch({ type: 'SET_CARD_UBO_FORM_DATA', payload: [] });
            dispatch({ type: 'SET_CARDS_DIRECTOR_FORM_DATA', payload: [] });
            dispatch({ type: 'SET_CARDS_REPRESENTATIVE_FORM_DATA', payload: [] });
            props.navigation.navigate("CardsKybInfoPreview", {
                cardId: props?.route?.params?.cardId
            }
            )
        }

        setErrorMsg("");
    };

    const handleCloseKyc = () => {
        rbSheetRef?.current?.close();
    };
    const handlSuccessClose = () => {
        logEvent("Button Pressed", { action: "Apply card done button", currentScreen: "Apply Card", nextScreen: "Cards Dashboard" })
        if (rbSheetRef1.current) {
            rbSheetRef1.current.close();
        }
        navigation.reset({
            index: 0,
            routes: [{
                name: 'Dashboard',
                params: { initialTab: "GLOBAL_CONSTANTS.CARDS" },
                animation: 'slide_from_left'
            }],
        });
    };
    const handleError = () => {
        setErrorMsg("");
    };
    const handleApplyCard = async (values: ApplyCardFormValues) => {
        logEvent("Button Pressed", { action: "Apply Card", currentScreen: "Apply Card", nextScreen: "Apply Card Success" })
        if ((selectedAssetForDisplay?.amount ?? 0) < (cardsFeeInfo?.amountPaid ?? 0)) {
            setErrorMsg("Insufficient Funds");
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            return;
        }

        if (cardsFeeInfo?.cardType === "Physical" && !iHaveCard.haveCard && !iHaveCard.sendCard) {
            setErrorMsg("Please select at least one option: either 'I have the card on hand' or 'Please send a card to me'.");
            setBtnLoading(false);
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            return;
        }
        // if (!values.agreedToTerms) {
        //     setErrorMsg(t("GLOBAL_CONSTANTS.PLEASE_ACCEPT_TERMS_AND_CONDITIONS"));
        //     scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        //     return;
        // }
        setBtnLoading(true);

        // Process dynamic fields for encryption
        const processDynamicFields = (formValues: ApplyCardFormValues, dynamicFields: any[]) => {
            const processedFields: Record<string, any> = {};
            const sensitiveFields = ['cardlastfourdigits', 'expirydate', 'envelopenumber', 'linkcardnumber', 'cardnumber'];

            dynamicFields.forEach(field => {
                let fieldValue = formValues[field.field as keyof ApplyCardFormValues];
                let fieldName = field.field;

                // Map linkcardnumber to cardNumber and use cardNumber value
                if (field.field?.toLowerCase() === 'linkcardnumber') {
                    fieldValue = formValues.cardNumber || fieldValue;
                    fieldName = 'cardNumber'; // Change field name to cardNumber
                }

                if (fieldValue !== undefined && fieldValue !== '') {
                    if (sensitiveFields.includes(field.field?.toLowerCase())) {
                        processedFields[fieldName] = encryptAES(String(fieldValue));
                    } else {
                        processedFields[fieldName] = fieldValue;
                    }
                }
            });

            return processedFields;
        };


        let Obj;
        let ObjPhysical;
        let doubleStepVirtualObj;
        // For virtual cards
        Obj = {
            KycUpdateModel: (isBusiness || isCusomerCreated) ? null : (processKycData(applyCardsKycData)?.KycUpdateModel ? processKycData(applyCardsKycData)?.KycUpdateModel : null),
            companyApplicationModel:
                (isBusiness && (isCusomerCreated === false))
                    ? (applyCardsKyBData || null)
                    : null,
            cardId: props?.route?.params?.cardId,
            name: cardsFeeInfo?.cardName,
            type: cardsFeeInfo?.cardType,
            amount: cardsFeeInfo?.amountPaid,
            // cryptoWalletId: selectedAssetForDisplay?.id,
            paidCurrency: selectedAssetForDisplay?.code,
            noteType: acceptedTerms?.noteType || "",
            note: acceptedTerms?.noteType?.toLowerCase() === 'dynamic' ? JSON.stringify(acceptedTerms?.note || []).toLowerCase() : ""
        };
        doubleStepVirtualObj = {
            CardId: storeCardHolderStatusId ? storeCardHolderStatusId : props?.route?.params?.cardId,
            Currency: selectedAssetForDisplay?.code || "",
            IHaveCard: false,
            noteType: acceptedTerms?.noteType || "",
            note: acceptedTerms?.noteType?.toLowerCase() === 'dynamic' ? JSON.stringify(acceptedTerms?.note || []).toLowerCase() : "",
        }

        // For physical cards
        if (cardsFeeInfo?.cardType === "Physical") {
            const dynamicFieldsData = processDynamicFields(values, dynamicFields);

            ObjPhysical = {
                KycUpdateModel: (isBusiness || isCusomerCreated) ? null : (processKycData(applyCardsKycData)?.KycUpdateModel ? processKycData(applyCardsKycData)?.KycUpdateModel : null),
                companyApplicationModel:
                    (isBusiness && (isCusomerCreated === false))
                        ? (applyCardsKyBData || null)
                        : null,
                cardId: props?.route?.params?.cardId,
                name: cardsFeeInfo?.cardName,
                type: cardsFeeInfo?.cardType,
                amount: cardsFeeInfo?.amountPaid,
                // cryptoWalletId: selectedAssetForDisplay?.id,
                paidCurrency: selectedAssetForDisplay?.code,
                personalAddressId: applyCardsKycData?.KycUpdateModel?.addressId || "00000000-0000-0000-0000-000000000000",
                iHaveCard: iHaveCard?.haveCard,
                // cardNumber: encryptAES(values?.cardNumber) || "",
                // envelopeNumber: iHaveCard?.haveCard ? encryptAES(values?.envelopenumber) : "",
                HandHoldIdPhoto: iHaveCard?.haveCard ? values?.handHoldingIdPhoto : "",
                noteType: acceptedTerms?.noteType || "",
                note: acceptedTerms?.noteType?.toLowerCase() === 'dynamic' ? JSON.stringify(acceptedTerms?.note || []).toLowerCase() : "",
                shippingAddressId: iHaveCard?.sendCard ? values?.shippingAddressId : null,
                ...dynamicFieldsData
            };
        }
        let res: any;

        try {
            if (props?.route?.params?.cardProcessType?.toLowerCase() == "doublestep") {
                const response = await CardsModuleService.postDoubleStepFeeStepVirtual(doubleStepVirtualObj);
                if (response?.status === 200) {
                    if (cardsFeeInfo?.cardType === "Physical") {
                        rbSheetRef1.current?.open();
                        setBtnLoading(false);
                        dispatch(setApplyCardData(""));
                        dispatch(setKybApplyCardData(""));
                        setErrorMsg('');
                    } else {
                        rbSheetRef1.current?.open();
                        setBtnLoading(false);
                        dispatch(setApplyCardData(""));
                        dispatch(setKybApplyCardData(""));
                        setErrorMsg('');
                    }
                    return
                }

            } else if (props?.route?.params?.cardProcessType?.toLowerCase() !== "doublestep") {


                if (cardsFeeInfo?.cardType === "Physical") {
                    res = await CardsModuleService?.physicalCardApply(ObjPhysical);
                } else {
                    res = await CardsModuleService?.vertualCardApply(Obj);
                }
            }
            if (res.status === 200) {
                rbSheetRef1.current?.open();
                setBtnLoading(false);
                dispatch(setApplyCardData(""));
                dispatch(setKybApplyCardData(""));
                setErrorMsg('');
            } else {

                setErrorMsg(isErrorDispaly(res));
                scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                setBtnLoading(false);
            }
        } catch (error: any) {

            setErrorMsg(isErrorDispaly(error));
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            setBtnLoading(false);
        }
        finally {
            setBtnLoading(false);
        }
    };
     const getCardDetailValue = (name: any) => {
        const details = cardRequirements?.applyCarddetails;
        if (Array.isArray(details)) {
            return details.find((item: any) => item?.name === name)?.value || "";
        }
        return "";
    };
    const cardName = getCardDetailValue("Card Name");
    const cardType = getCardDetailValue("Card Type");
    const cardCurrency = getCardDetailValue("Card Currency");
    const consumptionMethod = getCardDetailValue("Consumption Method");
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>

            <Container style={[commonStyles.container]}>
                <PageHeader title={"GLOBAL_CONSTANTS.FEE"} onBackPress={handleBack} />

                <ScrollViewComponent ref={scrollViewRef}>
                    {errorMsg && <ErrorComponent message={errorMsg} onClose={handleError} />}
                    <ImageBackgroundWrapper
                        source={{ uri: props?.route?.params?.logo }}
                        style={[commonStyles.rounded12,
                        { width: screenWidth * 0.87, height: s(217) }
                        ]}
                        resizeMode="cover"
                        imageStyle={[commonStyles.cardradius,
                        ]}
                    >
                    </ImageBackgroundWrapper>
                      <ViewComponent style={[commonStyles.mt32]} >
                        {!cardRequirements ? (
                            <Loadding contenthtml={CardDetailsSkeleton} />
                        ) : (
                            <>
                                <TextMultiLangauge text={"GLOBAL_CONSTANTS.CARD_DETAILS"} style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} />
                                {cardRequirements?.applyCarddetails?.map((item: any, index: number) => (
                                    <ViewComponent key={index} style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.listitemGap]}>
                                        <ParagraphComponent text={item?.name} style={[commonStyles.listsecondarytext]} />
                                        <ParagraphComponent text={item?.value} style={[commonStyles.listprimarytext]} />
                                    </ViewComponent>
                                ))}
                            </>
                        )}
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.sectionGap]} />
                    <ViewComponent>
                        {feeCardsLoading && (
                            <Loadding contenthtml={FeeCardSkeleton} />
                        )}
                        {!feeCardsLoading && (
                            <ApplyCardForm
                                commonStyles={commonStyles}
                                NEW_COLOR={NEW_COLOR}
                                t={t}
                                initialFormValues={initialFormValues}
                                iHaveCard={iHaveCard}
                                setIHaveCard={setIHaveCard} // Pass setIHaveCard
                                cardsFeeInfo={cardsFeeInfo}
                                onSubmitForm={handleApplyCard}
                                selectedAssetForDisplay={selectedAssetForDisplay}
                                setSelectedAssetForDisplay={setSelectedAssetForDisplay}
                                coinWithCurrencyListForSelector={coinWithCurrencyListForSelector}
                                getApplyCardDeatilsInfo={getApplyCardDeatilsInfo} // Pass the function
                                cardFeeDetailsLoading={cardFeeDetailsLoading}
                                cardFeeLoader={cardFeeLoader}
                                btnLoading={btnLoading}
                                setShippingAddressId={setShippingAddressId}
                                cardId={props?.route?.params?.cardId}
                                dynamicFields={dynamicFields}
                                setDynamicFields={setDynamicFields}
                                // applicationInfoCardStatus={props?.route?.params?.applicationInfoCardStatus||"approved"}

                            />
                        )}
                    </ViewComponent>

                </ScrollViewComponent>
                <CustomRBSheet
                    refRBSheet={rbSheetRef}
                    title="GLOBAL_CONSTANTS.KYC_REQUIREMENTS"
                    height={"Large"}
                    onClose={() => { }}
                >
                    <KycForm cardId={props?.route?.params?.cardId} closeModal={handleCloseKyc} />
                </CustomRBSheet>
                <CustomRBSheet refRBSheet={rbSheetRef1} title="GLOBAL_CONSTANTS.SUCCESS" height={'Medium'} closeOnPressMask={false} draggable={true}>
                    <ScrollViewComponent>
                        <ApplySuccess amount={cardsFeeInfo?.amountPaid ?? undefined} currency={cardsFeeInfo?.paymentCurrency} cardName={cardsFeeInfo?.cardName} cardType={cardsFeeInfo?.cardType} onDone={handlSuccessClose} isSuccessMessage={false} isApplyCardSuccess={true} />
                    </ScrollViewComponent>
                </CustomRBSheet>
            </Container>
        </ViewComponent>
    );
};

export default ApplyCard;