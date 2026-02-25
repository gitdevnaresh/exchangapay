import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useSelector } from "react-redux";
import { PayWithWalletFiatConfirm } from './createAccConstant';
import { KeyboardAvoidingView, Platform, BackHandler } from 'react-native';
import Container from '../../../../../components/container/container';
import { formatDateTimeForAPI, isErrorDispaly } from '../../../../../utils/helpers';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import ButtonComponent from '../../../../../components/buttons/button';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import SendOTP from '../../../../../components/sendPhoneOtp';
import EmailOTP from '../../../../../components/EmailOTP';
import CreateAccountService from '../../../../../apiServices/bank/createAccount';
import useEncryptDecrypt from '../../../../../hooks/encDecHook';
import CommonSuccess from '../../../../commonScreens/successPage/commonSucces';
import ViewComponent from '../../../../../components/view/view';
import ScrollViewComponent from '../../../../../components/scrollView/scrollView';
import { s } from '../../../../../components/theme/scale';
import CustomRBSheet from '../../../../../components/models/commonBottomSheet';
import { logEvent } from '../../../../../hooks/loggingHook';
import PageHeader from '../../../../../components/pageHeader/pageHeader';
import { CurrencyText } from '../../../../../components/textComponets/currencyText/currencyText';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import { getVerificationData } from '../../../../../apiServices/common/countryService';
import { getTabsConfigation, walletsTabsNavigation } from '../../../../../../configuration';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';

const PayWithFiatPreview = React.memo((props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
    const [saveDataLoading, setSaveDataLoading] = useState<boolean>(false);
    const [errormsg, setErrormsg] = useState<string | null>(null);
    const {
        userDetails: userInfo,
        selectedBank: reduxSelectedBank,
        identityDocuments,
        selectedAddresses,
        documentsData,
        uboFormDataList,
        directorFormDataList,
        ipAddress,
        personalDob,
        sectors,
        types,
    } = useSelector((state: any) => state.userReducer);

    const selectedBank = reduxSelectedBank || props?.route?.params?.selectedBank;
    const ref = useRef<any>(null);
    const [otp, setOtp] = useState<string>('');
    const [isOTP, setIsOTP] = useState<boolean>(false);
    const [emailOtp, setEmailOtp] = useState('');
    const [isEmailOTP, setIsEmailOTP] = useState<boolean>(false);
    const [isOTPVerified, setIsOTPVerified] = useState<boolean>(false);
    const [isEmailOTPVerified, setIsEmailOTPVerified] = useState<boolean>(false);
    const [showOtpError, setShowOtpError] = useState<boolean>(false);
    const [showEmailOtpError, setShowEmailOtpError] = useState<boolean>(false);
    const [verficationFeild, setVerficationFeild] = useState<any>({});
    const { encryptAES, decryptAES } = useEncryptDecrypt();
    const [verifiedPhoneOtp, setVerifiedPhoneOtp] = useState(false);
    const [verfiedOtpErrorMsg] = useState(false);
    const [isAuthenticationOTP, setIsAuthenticationOTP] = useState("");
    const [isAuthenticationOTPVerified, setIsAuthenticationOTPVerified] = useState(false);
    const [showAuthenticationOtpError, setShowAuthenticationOtpError] = useState(false);
    const verificationSheetRef = useRef<any>(null);
    const successSheetRef = useRef<any>(null);
    const CommonConfig = getTabsConfigation('COMMON');
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleBack(); return true; }
        );
        return () => backHandler.remove();
    }, []);

    const handleBack = useCallback(() => {
        props.navigation.goBack();
    }, []);


    const handleReceiveOTP = (text: any) => {
        const numericValue = text.replace(/[^0-9]/g, '');
        if (numericValue.length <= 6) {
            setOtp(numericValue);
        }
    };

    const handleReceiveEmailOTP = (text: any) => {
        const numericValue = text.replace(/[^0-9]/g, '');
        if (numericValue.length <= 6) {
            setEmailOtp(numericValue);
        }
    };

    const handleReceiveAuthenticationOTP = (text: any) => {
        const numericValue = text.replace(/[^0-9]/g, '');
        if (numericValue.length <= 6) {
            setIsAuthenticationOTP(numericValue);
        }
    };

    const handleContinue = async () => {
        setSaveDataLoading(true);
        try {
            const securityVerififcationData: any = await getVerificationData();
            if (securityVerififcationData?.ok) {
                const verificationData = securityVerififcationData.data;
                setVerficationFeild(verificationData);
                logEvent("Button Pressed", { action: "Bank create account button", currentScreen: "Bank create account", nextScreen: "Bank create account success" })
                if (verificationData?.isPhoneVerified || verificationData?.isEmailVerification || verificationData?.isTwoFactorEnabled) {
                    clearVerificationData();
                    setErrormsg(null);
                    verificationSheetRef.current?.open();
                } else {
                    await handleSave();
                }
            } else {
                setErrormsg(isErrorDispaly(securityVerififcationData));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        } finally {
            setSaveDataLoading(false);
        }
    };
    const handleSave = async () => {
        setSaveDataLoading(true);

        if (verficationFeild?.isPhoneVerified && (!otp || !isOTPVerified)) {
            setShowOtpError(true);
            setIsOTP(true);
            setSaveDataLoading(false);
            return;
        }

        if (verficationFeild?.isEmailVerification && (!emailOtp || !isEmailOTPVerified)) {
            setShowEmailOtpError(true);
            setIsEmailOTP(true);
            setSaveDataLoading(false);
            return;
        }

        if (verficationFeild?.isTwoFactorEnabled && (!isAuthenticationOTP || !isAuthenticationOTPVerified)) {
            setShowAuthenticationOtpError(true);
            setSaveDataLoading(false);
            return;
        }


        setIsEmailOTP(false);
        setShowEmailOtpError(false);
        setIsOTP(false);
        setShowOtpError(false);
        setShowAuthenticationOtpError(false);

        const isPersonal = userInfo?.accountType?.toLowerCase() === "personal";

        // Use identityDocuments from Redux (stored by KYC process)
        const transformedPersonalDocuments = (identityDocuments || []).filter((doc: any) => {
            if (doc.documentType?.toLowerCase() === "passport") {
                const hasData = doc.frontImage || doc.backDocImage || doc.documentNumber || doc.handHoldingImage || doc.selfieImage || doc.singatureImage;
                return hasData;
            }
            if (doc.documentType?.toLowerCase() === "national id") {
                const hasData = doc.frontImage || doc.backDocImage || doc.documentNumber;
                return hasData;
            }
            return false;
        }).map((doc: any) => {
            const transformedDoc = {
                documentType: doc.documentType,
                frontImage: doc.frontImage || "",
                backDocImage: doc.backDocImage || "",
                handHoldingImage: doc.handHoldingImage || "",
                singatureImage: doc.singatureImage || "",
                selfieImage: doc.selfieImage || "",
                docId: doc.documentNumber || "",
                docExpiryDate: doc.documentExpiryDate ? (() => {
                    if (doc.documentExpiryDate instanceof Date) {
                        return formatDateTimeForAPI(doc.documentExpiryDate);
                    }

                    if (typeof doc.documentExpiryDate === 'string') {
                        if (doc.documentExpiryDate.includes('AM') || doc.documentExpiryDate.includes('PM')) {
                            // Convert MM/DD/YYYY HH:MM:SS AM/PM to ISO format
                            const parts = doc.documentExpiryDate.split(' ');
                            const datePart = parts[0]; // "9/14/2026"
                            const timePart = parts[1]; // "12:00:00"
                            const ampm = parts[2]; // "AM"

                            const [month, day, year] = datePart.split('/');
                            const [hour, minute, second] = timePart.split(':');

                            let hour24 = parseInt(hour);
                            if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
                            if (ampm === 'AM' && hour24 === 12) hour24 = 0;

                            const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour24.toString().padStart(2, '0')}:${minute}:${second}`;
                            const dateObj = new Date(isoString);

                            if (!isNaN(dateObj.getTime())) {
                                return formatDateTimeForAPI(dateObj);
                            }
                        } else {
                            const dateObj = new Date(doc.documentExpiryDate);
                            if (!isNaN(dateObj.getTime())) {
                                return formatDateTimeForAPI(dateObj);
                            }
                        }
                    }

                    return "";
                })() : ""
            };

            return transformedDoc;
        });


        let saveObj: PayWithWalletFiatConfirm = {
            walletId: props?.route?.params?.selectedPayingItem?.id,
            amount: props?.route?.params?.amount,
            metadata: null,
            documents: transformedPersonalDocuments,
            address: selectedAddresses,
            ubo: [],
            director: [],
            isReapply: false,
            sector: sectors,
            type: types,
            dob: personalDob ? formatDateTimeForAPI(personalDob) : null
        };

        // Convert documents object to array format for API (Business accounts)

        const processedDocuments = [];
        if (documentsData?.passport && (documentsData.passport.frontImage || documentsData.passport.backImage || documentsData.passport.docNumber || documentsData.passport.handHoldingImage || documentsData.passport.selfieImage || documentsData.passport.signatureImage)) {
            const passportDoc = {
                documentType: "Passport",
                frontImage: documentsData.passport.frontImage || "",
                // backDocImage: documentsData.passport.backImage || "", commented  beacuse  back is  not required
                handHoldingImage: documentsData.passport.handHoldingImage || "",
                singatureImage: documentsData.passport.signatureImage || "",
                selfieImage: documentsData.passport.selfieImage || "",
                docId: documentsData.passport.docNumber || "",
                docExpiryDate: documentsData.passport.docExpiryDate ? (() => {
                    const date = documentsData.passport.docExpiryDate;
                    if (date instanceof Date) {
                        return formatDateTimeForAPI(date);
                    }
                    if (typeof date === 'string') {
                        if (date.includes('AM') || date.includes('PM')) {
                            return formatDateTimeForAPI(new Date(date.replace(/\s(AM|PM)$/, '')));
                        }
                        return formatDateTimeForAPI(new Date(date));
                    }
                    return "";
                })() : ""
            };
            processedDocuments.push(passportDoc);
        }

        if (documentsData?.nationalId && (documentsData.nationalId.frontImage || documentsData.nationalId.backImage || documentsData.nationalId.docNumber)) {
            const nationalIdDoc = {
                documentType: "National Id",
                frontImage: documentsData.nationalId.frontImage || "",
                backDocImage: documentsData.nationalId.backImage || "",
                handHoldingImage: "",
                singatureImage: "",
                selfieImage: "",
                docId: documentsData.nationalId.docNumber || "",
                docExpiryDate: documentsData.nationalId.docExpiryDate ? (() => {
                    const date = documentsData.nationalId.docExpiryDate;
                    if (date instanceof Date) {
                        return formatDateTimeForAPI(date);
                    }
                    if (typeof date === 'string') {
                        if (date.includes('AM') || date.includes('PM')) {
                            return formatDateTimeForAPI(new Date(date.replace(/\s(AM|PM)$/, '')));
                        }
                        return formatDateTimeForAPI(new Date(date));
                    }
                    return "";
                })() : ""
            };
            processedDocuments.push(nationalIdDoc);
        }




        // Transform UBO data to match target structure
        const transformedUboData = (uboFormDataList || []).map((ubo: any) => ({
            id: ubo.id,
            uboPosition: ubo.uboPosition,
            firstName: ubo.firstName,
            lastName: ubo.lastName,
            middleName: ubo.middleName || null,
            dob: ubo.dob,
            phoneCode: encryptAES(ubo.phoneCode),
            phoneNumber: encryptAES(ubo.phoneNumber),
            email: encryptAES(ubo.email),
            country: ubo.country,
            shareHolderPercentage: ubo.shareHolderPercentage,
            note: ubo.note || null,
            recordStatus: "Modified",
            docDetails: {
                id: ubo.docDetailsid || "00000000-0000-0000-0000-000000000000",
                frontImage: ubo.frontId,
                backImage: ubo.backImgId,
                type: ubo.docType,
                number: encryptAES(ubo.docNumber),
                expiryDate: ubo.docExpiryDate
            }
        }));

        // Transform Director data to match target structure
        const transformedDirectorData = (directorFormDataList || []).map((director: any) => ({
            id: director.id,
            uboPosition: director.uboPosition,
            firstName: director.firstName,
            lastName: director.lastName,
            middleName: director.middleName || null,
            dob: director.dob,
            phoneCode: encryptAES(director.phoneCode),
            phoneNumber: encryptAES(director.phoneNumber),
            email: encryptAES(director.email),
            country: director.country,
            shareHolderPercentage: director.shareHolderPercentage,
            note: director.note || null,
            recordStatus: "Modified",
            docDetails: {
                id: director.docDetailsid || "00000000-0000-0000-0000-000000000000",
                frontImage: director.frontId,
                backImage: director.backImgId,
                type: director.docType,
                number: encryptAES(director.docNumber),
                expiryDate: director.docExpiryDate
            }
        }));

        let saveKbObj: PayWithWalletFiatConfirm = {
            walletId: props?.route?.params?.selectedPayingItem?.id,
            amount: props?.route?.params?.amount,
            metadata: null,
            documents: processedDocuments,
            address: selectedAddresses,
            ubo: transformedUboData,
            director: transformedDirectorData,
            ipAddress: ipAddress,
            isTradingAddress: !isPersonal,
            isReapply: false,
            sector: sectors,
            type: types
        };
        const payload = isPersonal ? saveObj : saveKbObj;
        try {
            const response: any = await CreateAccountService.summaryAccountCreation(
                selectedBank?.productId,
                payload
            );

            if (response?.ok) {
                setSaveDataLoading(false);
                verificationSheetRef.current?.close();
                setTimeout(() => {
                    successSheetRef.current?.open();
                }, 300);
            } else {
                setErrormsg(isErrorDispaly(response));
                setSaveDataLoading(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setSaveDataLoading(false);
        }
    };

    const handleError = useCallback(() => {
        setErrormsg(null);
    }, []);

    const clearVerificationData = () => {
        setOtp('');
        setEmailOtp('');
        setIsAuthenticationOTP('');
        setIsOTPVerified(false);
        setIsEmailOTPVerified(false);
        setIsAuthenticationOTPVerified(false);
        setShowOtpError(false);
        setShowEmailOtpError(false);
        setShowAuthenticationOtpError(false);
        setIsOTP(false);
        setIsEmailOTP(false);
        setVerifiedPhoneOtp(false);
    };

    const handleVerificationSheetClose = () => {
        clearVerificationData();
    };

    const handleSuccessClose = () => {
        // Default to Wallets since this is a crypto wallet payment flow
        if (walletsTabsNavigation == 'AllAssetsTabs') {
            props.navigation.reset({
                index: 0,
                routes: [{
                    name: 'Dashboard',
                    params: {
                        initialTab: "GLOBAL_CONSTANTS.BANK",
                        animation: "slide_from_left"
                    }
                }]
            });
        } else {
            props.navigation.reset({
                index: 0,
                routes: [{
                    name: 'Dashboard',
                    params: {
                        initialTab: "GLOBAL_CONSTANTS.WALLETS",
                        animation: "slide_from_left"
                    }
                }]
            });
        }
    };

    const handleSuccessSheetClose = () => {
        successSheetRef.current?.close();
        logEvent("Button Pressed", { action: "Bank create account canncel button", currentScreen: "Bank create account success", nextScreen: "Bank" })
    };

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={[commonStyles.container]}>
                <PageHeader
                    title="GLOBAL_CONSTANTS.SUMMARY"
                    onBackPress={handleBack}
                />
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={s(64)}
                >
                    <ScrollViewComponent
                        ref={ref}
                        contentContainerStyle={{ flexGrow: 1 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >

                        <ViewComponent style={[commonStyles.flex1]}>
                            <ViewComponent>
                                {props?.route?.params?.accountToCreate && (
                                    <ViewComponent>
                                        <ViewComponent style={[
                                            commonStyles.dflex,
                                            commonStyles.alignCenter,
                                            commonStyles.justifyContent,
                                            commonStyles.flexWrap,
                                        ]}>
                                            <ParagraphComponent
                                                style={[
                                                    commonStyles.listsecondarytext
                                                ]}
                                                text="GLOBAL_CONSTANTS.ACCOUNT_TO_CREATE"
                                            />
                                            <ParagraphComponent
                                                style={[
                                                    commonStyles.listprimarytext
                                                ]}
                                                text={`${props?.route?.params?.accountToCreate || ""}`}
                                            />
                                        </ViewComponent>
                                        <ViewComponent style={[commonStyles.listGap]} />
                                    </ViewComponent>
                                )}

                                {props?.route?.params?.payingWalletCoin && (
                                    <ViewComponent>
                                        <ViewComponent style={[
                                            commonStyles.dflex,
                                            commonStyles.alignCenter,
                                            commonStyles.justifyContent,
                                            commonStyles.flexWrap
                                        ]}>
                                            <ParagraphComponent
                                                style={[
                                                    commonStyles.listsecondarytext
                                                ]}
                                                text="GLOBAL_CONSTANTS.COIN"
                                            />
                                            <ParagraphComponent
                                                style={[
                                                    commonStyles.listprimarytext,


                                                ]}
                                                text={`${props?.route?.params?.payingWalletCoin || ""}`}
                                            />
                                        </ViewComponent>
                                        <ViewComponent style={[commonStyles.listGap]} />
                                    </ViewComponent>
                                )}

                                {props?.route?.params?.amount && (
                                    <ViewComponent>
                                        <ViewComponent style={[
                                            commonStyles.dflex,
                                            commonStyles.alignCenter,
                                            commonStyles.justifyContent,
                                            commonStyles.flexWrap

                                        ]}>
                                            <ParagraphComponent
                                                style={[
                                                    commonStyles.listsecondarytext
                                                ]}
                                                text="GLOBAL_CONSTANTS.AMOUNT_TO_PAY"
                                            />
                                            <CurrencyText
                                                value={props?.route?.params?.amount || 0}
                                                currency={props?.route?.params?.payingWalletCoin || ""}
                                                style={[
                                                    commonStyles.listprimarytext
                                                ]}
                                            />
                                        </ViewComponent>
                                    </ViewComponent>
                                )}
                            </ViewComponent>
                        </ViewComponent>

                        <ViewComponent>
                            <ButtonComponent
                                title="GLOBAL_CONSTANTS.CONTINUE"
                                loading={saveDataLoading}
                                onPress={handleContinue}
                            />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.sectionGap]} />
                    </ScrollViewComponent>

                </KeyboardAvoidingView>
            </Container>




            {/* <CustomRBSheet
                refRBSheet={verificationSheetRef}
                height={s(520)}
                onClose={() => {
                    handleVerificationSheetClose();
                    setErrormsg('');
                }}
            >
                <ViewComponent >
                    <ViewComponent >
                        {errormsg && (
                            <ErrorComponent message={errormsg} onClose={handleError} />
                        )}

                        {verficationFeild?.isPhoneVerified === true && (
                            <>

                                <SendOTP
                                    isOTP={isOTP}
                                    onChangeText={handleReceiveOTP}
                                    value={otp}
                                    customerId={userInfo?.id}
                                    phoneNumber={decryptAES(userInfo?.phoneNumber)}
                                    onVerify={setIsOTPVerified}
                                    showError={showOtpError}
                                    handlePhoneOtpVerified={setVerifiedPhoneOtp}
                                    verifiedPhoneOtp={verifiedPhoneOtp}
                                    verfiedOtpErrorMsg={verfiedOtpErrorMsg}
                                />
                            </>
                        )}

                        {verficationFeild?.isEmailVerification === true && (
                            <>
                                <ViewComponent style={[commonStyles.formItemSpace]} />
                                <EmailOTP
                                    isEmailOTP={isEmailOTP}
                                    onChangeText={handleReceiveEmailOTP}
                                    value={emailOtp}
                                    onVerify={setIsEmailOTPVerified}
                                    showError={showEmailOtpError}
                                />
                            </>
                        )}
                        <ViewComponent style={[commonStyles.formItemSpace]} />

                        {verficationFeild?.isTwoFactorEnabled === true && (
                            <>
                                <SendAuthenticatonOTP
                                    isOTP={Boolean(isAuthenticationOTP)}
                                    onChangeText={handleReceiveAuthenticationOTP}
                                    value={isAuthenticationOTP}
                                    onVerify={(value: any) =>
                                        setIsAuthenticationOTPVerified(value)
                                    }
                                    showError={showAuthenticationOtpError}
                                    customerId={String(userInfo?.id || '')}
                                    phoneNumber={String(decryptAES(userInfo?.phoneNumber || userInfo?.phoneNo) || '')}
                                    handlePhoneOtpVerified={() => { }}
                                    verifiedPhoneOtp={false}
                                    verfiedOtpErrorMsg={false}
                                />
                            </>
                        )}
                    </ViewComponent>

                   

                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <ButtonComponent
                                title="GLOBAL_CONSTANTS.CANCEL"
                                onPress={() => {
                                    clearVerificationData();
                                    verificationSheetRef.current?.close();
                                }}
                                solidBackground={true}
                                disable={saveDataLoading}
                            />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <ButtonComponent
                                title="GLOBAL_CONSTANTS.CONTINUE"
                                loading={saveDataLoading}
                                disable={(
                                    (verficationFeild?.isPhoneVerified && !isOTPVerified) ||
                                    (verficationFeild?.isEmailVerification && !isEmailOTPVerified) ||
                                    (verficationFeild?.isTwoFactorEnabled && !isAuthenticationOTPVerified)
                                )}
                                onPress={handleSave}
                            />
                        </ViewComponent>
                    </ViewComponent>

                    <ViewComponent style={[commonStyles.mb10]} />
                </ViewComponent>
            </CustomRBSheet> */}

            <CustomRBSheet
                refRBSheet={verificationSheetRef}
                height={"Large"}
                onClose={() => {
                    handleVerificationSheetClose();
                    setErrormsg('');
                }}
            >
                <ViewComponent style={{ flex: 1 }}>

                    <ScrollViewComponent contentContainerStyle={{}}>
                        {errormsg && (
                            <ErrorComponent message={errormsg} onClose={handleError} />
                        )}

                        {verficationFeild?.isPhoneVerified === true && (
                            <SendOTP
                                isOTP={isOTP}
                                onChangeText={handleReceiveOTP}
                                value={otp}
                                customerId={userInfo?.id}
                                phoneNumber={decryptAES(userInfo?.phoneNumber)}
                                onVerify={(verified) => {
                                    setIsOTPVerified(verified);
                                }}
                                showError={showOtpError}
                                handlePhoneOtpVerified={(verified) => {
                                    setVerifiedPhoneOtp(verified);
                                }}
                                verifiedPhoneOtp={verifiedPhoneOtp}
                                verfiedOtpErrorMsg={verfiedOtpErrorMsg}
                            />
                        )}

                        {verficationFeild?.isEmailVerification === true && (
                            <>
                                <ViewComponent style={commonStyles.formItemSpace} />
                                <EmailOTP
                                    isEmailOTP={isEmailOTP}
                                    onChangeText={handleReceiveEmailOTP}
                                    value={emailOtp}
                                    onVerify={setIsEmailOTPVerified}
                                    showError={showEmailOtpError}
                                />
                            </>
                        )}
                        <ViewComponent style={commonStyles.formItemSpace} />

                        {/* {verficationFeild?.isTwoFactorEnabled === true && (
                            <SendAuthenticatonOTP
                                isOTP={Boolean(isAuthenticationOTP)}
                                onChangeText={handleReceiveAuthenticationOTP}
                                value={isAuthenticationOTP}
                                onVerify={(value: any) => setIsAuthenticationOTPVerified(value)}
                                showError={showAuthenticationOtpError}
                                customerId={String(userInfo?.id || '')}
                                phoneNumber={String(decryptAES(userInfo?.phoneNumber || userInfo?.phoneNo) || '')}
                                handlePhoneOtpVerified={() => { }}
                                verifiedPhoneOtp={false}
                                verfiedOtpErrorMsg={false}
                            />
                        )} */}
                    </ScrollViewComponent>
                    <ViewComponent
                        style={[
                            commonStyles.dflex,
                            commonStyles.alignCenter,
                            commonStyles.gap10,
                            commonStyles.sectionGap
                        ]}
                    >
                        <ViewComponent style={commonStyles.flex1}>
                            <ButtonComponent
                                title="GLOBAL_CONSTANTS.CANCEL"
                                onPress={() => {
                                    clearVerificationData();
                                    verificationSheetRef.current?.close();
                                }}
                                solidBackground={true}
                                disable={saveDataLoading}
                            />
                        </ViewComponent>
                        <ViewComponent style={commonStyles.flex1}>
                            <ButtonComponent
                                title="GLOBAL_CONSTANTS.CONTINUE"
                                loading={saveDataLoading}
                                disable={
                                    saveDataLoading ||
                                    (verficationFeild?.isPhoneVerified && (!otp || !isOTPVerified)) ||
                                    (verficationFeild?.isEmailVerification && (!emailOtp || !isEmailOTPVerified)) ||
                                    (verficationFeild?.isTwoFactorEnabled && (!isAuthenticationOTP || !isAuthenticationOTPVerified))
                                }
                                onPress={handleSave}
                            />
                        </ViewComponent>
                    </ViewComponent>
                </ViewComponent>
            </CustomRBSheet>







            <CustomRBSheet
                refRBSheet={successSheetRef}
                height={"Large"}
                onClose={handleSuccessClose}
                draggable={false} closeOnPressMask={false}
            >
                <ViewComponent>
                    <CommonSuccess
                        successMessage="GLOBAL_CONSTANTS.ACCOUNT_CREATION_REQUEST_SUBMITTED_SUCCESSFULLY"
                        note="GLOBAL_CONSTANTS.NOTE_YOU_WILL_BE_NOTIFIED_ONCE_YOUR_REQUEST_IS_PROCESSED_THIS_MAY_TAKE_FEW_MUNITES"
                        buttonText="GLOBAL_CONSTANTS.OK"
                        buttonAction={handleSuccessSheetClose}
                        amount={props?.route?.params?.amount}
                        prifix={props?.route?.params?.payingWalletCoin}
                        showDeductionMessage={true}

                    />
                </ViewComponent>
            </CustomRBSheet>
        </ViewComponent>
    );
});

export default PayWithFiatPreview;
