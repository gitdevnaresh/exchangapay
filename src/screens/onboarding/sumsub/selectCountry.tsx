import React, { useEffect, useRef, useState } from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../../hooks/useThemeColors';
import ViewComponent from '../../../newComponents/view/view';
import Container from '../../../newComponents/container/container';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ButtonComponent from '../../../newComponents/buttons/button';
import CustomPicker from '../../../newComponents/pickerComponents/basic/customPickerNonFormik';
import OnboardingService from '../../../services/onboarding';
import { isErrorDispaly } from '../../../utils/helpers';
import SNSMobileSDK from '@sumsub/react-native-mobilesdk-module';
import { useSelector } from 'react-redux';
import useEncryptDecrypt from '../../../hooks/encDecHook';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import useMemberLogin from '../../../hooks/userInfoHook';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import { s } from '../../../newComponents/theme/scale';
import KycPendingScreen from './sumsubpending/sumsubPending';
import { Keyboard } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import ImageUri from '../../../newComponents/imageComponents/image';
import { COMMON_SVG_URLS } from '../../../assets/blobUrls';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';
import SwokipayDashboardLoader from '../../../newComponents/swokipayloader';

// Import your picker component here

const SelectCountry = () => {
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const navigation = useNavigation<any>();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [selectedCountry, setSelectedCountry] = useState<string | number | undefined>(userInfo?.country);
    const [countryList, setCountryList] = useState([])
    const [kycPending, setKycPending] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isRestricted, setIsRestricted] = useState(false); // New state for validation
    const sdkInstance = useRef<any>(null);
    const { decryptAES } = useEncryptDecrypt();
    const decryptedEmail = decryptAES(userInfo?.email);
    const decryptedPhone = decryptAES(userInfo?.phoneNumber);
    const decryptedPhoneCode = decryptAES(userInfo?.phonecode);
    const decryptedFirstName = decryptAES(userInfo?.firstName);
    const decryptedLastName = decryptAES(userInfo?.lastName);
    const [error, setError] = useState<string>("");
    const { getMemDetails } = useMemberLogin();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    useEffect(() => {
        countriesList();
        if (userInfo?.country && !userInfo?.isKYC) {
            setSelectedCountry(userInfo?.country)
            isSumsubCompleted()
        }
    }, [])
    useEffect(() => {
        if (userInfo?.isKYC) {
            handleGoHome();
        }
    }, [userInfo]);
    useHardwareBackHandler(() => {
        handleBack();
    });

    useEffect(() => {
        if (userInfo?.kycLevel) {
            isSumsubCompleted();
        }
    }, [userInfo?.kycLevel])

    const memberDetails = async () => {
        await getMemDetails(true);
    }

    const countriesList = async () => {
        setError("");
        setIsLoading(true);
        try {
            const response: any = await OnboardingService.countriesList();
            if (response.status === 200) {
                setCountryList(response?.data ?? []);
                setIsLoading(false);
            }
            else {
                setIsLoading(false);
                setCountryList([])
                setError(isErrorDispaly(response));

            }
        }
        catch (error: any) {
            setIsLoading(false);
            setError(isErrorDispaly(error));
        }
    }

    const handleContinue = async () => {
        setError("");
        if (!isRestricted) {
            if (selectedCountry?.toLowerCase() !== userInfo?.country?.toLowerCase()) {
                await updateCountry(selectedCountry);
                if (userInfo?.kycLevel) {
                    isSumsubCompleted();
                }

            } else {
                isSumsubCompleted();

            }

        }
    };

    const handleBack = () => {
        navigation.goBack()
    }
    const updateCountry = async (country: any) => {
        setError("");
        try {
            const response: any = await OnboardingService.countryUpdate(country)
            if (response.status === 200) {
                await getMemDetails(true);

            }
            else {
                setError(isErrorDispaly(response))
            }
        }
        catch (error) {
            setError(isErrorDispaly(error))
        }
    }
    const handleSelectCountry = (value: any) => {
        setError("");
        Keyboard.dismiss(); // Dismiss the keyboard if it's open
        setSelectedCountry(value?.name);
        if (value.isCountryRestrict) {
            setIsRestricted(true);
        } else {
            setIsRestricted(false);
        }
    }

    const isSumsubCompleted = async () => {
        // setIsDismissed(false)
        try {
            const response = await OnboardingService.sumsubCompleted();
            if (response?.ok) {
                if (response.data === false) {
                    launchSNSMobileSDK()
                } else {
                    setKycPending(true)
                }


            } else {
                setError(isErrorDispaly(response))
            }
        } catch (error) {
            setError(isErrorDispaly(error))
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true);
        await getMemDetails(true); // This updates `userInfo` from Redux state.
        setRefreshing(false);
    };


    const handleGoHome = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0, // Corrected: The root of the stack is at index 0.
                routes: [{ name: "Dashboard" }],
            })
        );
    };

    const launchSNSMobileSDK = async () => {
        try {
            const response = await OnboardingService.sumsubAccessToken(userInfo.userId, userInfo?.kycLevel);
            if (response?.ok && response?.data && typeof response.data === "object" && "token" in response.data) {
                sdkInstance.current = SNSMobileSDK.init(
                    (response.data as { token: string }).token,
                    () => {
                        return OnboardingService.sumsubAccessToken(
                            userInfo.userId,
                            userInfo?.kycLevel
                        ).then(refreshRes => refreshRes?.data?.token ?? null);
                    }
                )
                    .withHandlers({
                        onStatusChanged: (event: any) => {
                        },
                        onLog: (event: any) => {
                        },
                        onEvent: (event: any) => {
                            if (event?.payload?.eventName === "msdk:dismiss" || event?.payload?.eventName === "msdk:ui:applicantDataScreen:close") {
                                sdkInstance.current = null;
                                SNSMobileSDK.reset();
                            }
                        }
                    })
                    .withDebug(true)
                    .withLocale('en')
                    .withApplicantConf(
                        {
                            "firstName": decryptedFirstName || null,
                            "lastName": decryptedLastName || null,
                            "email": decryptedEmail || null,
                            "phone": decryptedPhoneCode + " " + decryptedPhone || null,
                            "country": selectedCountry || userInfo?.country,
                            "date of birth": userInfo?.dob
                        }
                    )
                    .build();

                sdkInstance.current.launch().then((result: any) => {
                    if (result?.status === "success" || result?.status === "Approved") {
                        if ((!userInfo.isKYC) || (userInfo?.customerState !== "Approved")) {
                            memberDetails();
                            setKycPending(true); // Show pending screen
                            return;
                        } else {

                            return (navigation.dispatch(
                                CommonActions.reset({
                                    index: 1,
                                    routes: [{ name: "Dashboard", params: { isUserUpdate: true } }],
                                })
                            ))
                        }
                    }
                }).catch((error: any) => {
                    let errorMsg = error.toString()
                    // setError(errorMsg);
                });
            }
            else {
                // setError(isErrorDispaly(response));
            }
        } catch (error: any) {
            let errorMsg = error.toString()
            // setError(errorMsg);
        }
    };

    // if (kycPending) {
    //     return (

    //     );
    // }

    return (
        <>
            {isLoading &&
                <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
                    <SwokipayDashboardLoader />
                </ViewComponent>
            }
            {(!kycPending && !isLoading) && <ViewComponent style={[commonStyles.flex1]}>
                <Container>
                    <PageHeader
                        onBackPress={handleBack}
                        title={"GLOBAL_CONSTANTS.SELECT_COUNTRY_REGION"}
                    />
                    {error && <ErrorComponent message={error} screen={true} />}
                    <TextMultiLanguage
                        text={"GLOBAL_CONSTANTS.THE_INFORMATION_BELOW_MUST_MATCH_YOUR_PASSPORT_OR_GOVERNMENT_ISSUED_ID"}
                        style={[commonStyles.textGrey, commonStyles.fs14_24, commonStyles.fw400, commonStyles.mb24]}
                    />

                    <CustomPicker
                        data={countryList}
                        value={selectedCountry}
                        onChange={handleSelectCountry}
                        label={"GLOBAL_CONSTANTS.COUNTRY_REGION"}
                        placeholder={"GLOBAL_CONSTANTS.SELECT_COUNTRY_REGION"}
                        selectionType="name"
                        modalTitle={"GLOBAL_CONSTANTS.SELECT_COUNTRY_REGION"}
                        isRequired={true}
                        modalPlaceholder={"GLOBAL_CONSTANTS.SEARCH_COUNTRY_REGION"}
                    />
                    {isRestricted && (
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.mt16]}>
                            <AntDesign
                                name="closecircleo"
                                size={s(14)}
                                color={NEW_COLOR.TEXT_RED}
                                style={[commonStyles.mt6]}
                            />
                            <TextMultiLanguage
                                text={"GLOBAL_CONSTANTS.UNFORTUNATLY_BULLSWIPE_IS_NOT_AVAILABLE"}
                                style={[commonStyles.textRed, commonStyles.fs14, commonStyles.mt8, commonStyles.flex1]} // Adjust styles as needed
                            />
                        </ViewComponent>
                    )}
                    <ViewComponent style={[commonStyles.sectionGap]} />
                    <ViewComponent style={[commonStyles.dflex, commonStyles.sectionGap, commonStyles.gap10]
                    }>
                        <ImageUri uri={COMMON_SVG_URLS.infoIcon} width={s(24)} height={s(24)} />

                        <TextMultiLanguage
                            text={"GLOBAL_CONSTANTS.YOU_UNDERSTAND_THAT_THE_PROMOTION"}
                            style={[commonStyles.textGrey, commonStyles.fs14, commonStyles.fw400, { width: s(330) }]}
                        />
                    </ViewComponent>

                    <ViewComponent style={[commonStyles.flex1]} />
                    <ButtonComponent
                        title={"GLOBAL_CONSTANTS.CONTINUE"}
                        onPress={handleContinue}
                        disable={!selectedCountry || isRestricted} // Disable button if country is restricted
                    />
                    <ViewComponent style={[commonStyles.sectionGap]} />
                </Container>
            </ViewComponent>}
            {(kycPending && !isLoading) && <KycPendingScreen
                onRefresh={handleRefresh}
                onGoHome={handleGoHome}
                loading={refreshing}
            />}
        </>
    );
};

export default SelectCountry;