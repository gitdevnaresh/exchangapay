import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView, ScrollView, Keyboard } from 'react-native';
import Container from '../../../../newComponents/container/container';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import { ActionLogParams, useActionLogging } from '../../../../hooks/loggingHook';
import ViewComponent from '../../../../newComponents/view/view';
import ButtonComponent from '../../../../newComponents/buttons/button';
import { Formik } from 'formik';
import ProfileService from '../../../../services/profile';
import { isErrorDispaly } from '../../../../utils/helpers';
import { useNavigation } from '@react-navigation/native';
import { CountryCodeDataState, PhoneNumberInterface } from './interface';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import PhoneInputWithPicker from '../../../../newComponents/pickerComponents/formik/phonePickerInput';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Yup from 'yup';
import OnboardingService from '../../../../services/onboarding';
import { useLngTranslation } from '../../../../hooks/useLngTranslation';
import { useSelector } from 'react-redux';
import { useHardwareBackHandler } from '../../../../hooks/HardwareBackHandler';
import { s } from '../../../../constants/theme/scale';
import ImageUri from '../../../../newComponents/imageComponents/image';
import { COMMON_SVG_URLS } from '../../../../assets/blobUrls';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';

// Interface for country code data
interface PhoneCode {
    name: string;
    code: string;
    logo: string | null;
    flag: string;
    mobileCode: string;
    recorder: number;
    length?: number;
    phonecode?: string;
}

const PhoneNumberChange = () => {
    const [loading, setLoading] = useState(false);
    const NEW_COLOR = useThemeColors();
    const navigation = useNavigation<any>();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { logEvent } = useActionLogging();
    const { encryptAES, decryptAES } = useEncryptDecrypt();
    const [countryCodeData, setCountryCodeData] = useState<CountryCodeDataState>({ countryCodeLoader: false, countryCodelist: [] });
    const [phoneNumberMaxLength, setPhoneNumberMaxLength] = useState<number>();
    const { t } = useLngTranslation();
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails)
    const [error, setError] = useState<string>();
    // Dynamic Validation Schema
    const PhoneNumberSchema = (phoneLength: any) => {
        return Yup.object().shape({
            phonecode: Yup.string().required(""),
            phonenumber: Yup.string()
                .required("")
                .length(
                    phoneLength,
                    t('GLOBAL_CONSTANTS.INVALID_PHONE_NUMBER_PLEASE_CHECK')
                ),
        });
    };
    useHardwareBackHandler(() => {
        if (loading) {
            return true;
        }
        handleBackPress()
    })

    useEffect(() => {
        getPhoneCodes();
    }, []);

    const getPhoneCodes = async () => {
        setCountryCodeData(prev => ({ ...prev, countryCodeLoader: true }));
        const startLog: ActionLogParams = {
            screename: 'PhoneNumberChange',
            actionName: 'Start Fetch Country Codes',
            actionType: 'API',
        };
        logEvent('api_action', startLog);

        try {
            const response: any = await OnboardingService.countriesList();
            if (response.status === 200) {
                setCountryCodeData({
                    countryCodeLoader: false,
                    countryCodelist: response?.data,
                });
            } else {
                const emptyLog: ActionLogParams = {
                    screename: 'PhoneNumberChange',
                    actionName: 'Country Codes Empty',
                    actionType: 'API',
                };
                logEvent('api_action', emptyLog);
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        } finally {
            setCountryCodeData(prev => ({ ...prev, countryCodeLoader: false }));
        }
    };

    const handleBackPress = () => {
        const actionData: ActionLogParams = {
            screename: 'PhoneNumberChange',
            actionName: 'Navigate Back to PhoneAuthenticationScreen',
            actionType: 'Icon',
            nextScreenName: 'PhoneAuthenticationScreen'
        };
        logEvent('navigation_action', actionData);
        navigation.navigate('PhoneAuthenticationScreen', { animation: 'slide_from_left' });
    };

    const handleNext = async (values: { phonecode: string; phonenumber: string }) => {
        setError("");
        if (values.phonenumber === decryptAES(userInfo?.phoneNumber) && (values.phonecode == decryptAES(userInfo?.phonecode))) {
            Keyboard.dismiss();
            setError("You’re already using this Phone Number. Please enter a new Phone Number.")
            return;
        }
        setLoading(true);
        Keyboard.dismiss();

        const payload: PhoneNumberInterface = {
            phonenumber: encryptAES(values.phonenumber),
            action: "ChangePhone",
            source: "sms",
            phonecode: encryptAES(values.phonecode)
        };
        try {
            const response = await ProfileService.changePhoneNumber(payload);
            if (response.ok) {
                const actionData: ActionLogParams = {
                    screename: 'PhoneNumberChange',
                    actionName: 'Navigate to OTP Verification',
                    actionType: 'Button',
                    nextScreenName: 'PhoneOtpVericication'
                };
                logEvent('navigation_action', actionData);
                navigation.navigate('PhoneOtpVericication', { phoneCode: values.phonecode, phonenumber: values.phonenumber });
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        } finally {
            Keyboard.dismiss();
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
            <KeyboardAwareScrollView
                contentContainerStyle={[{ flexGrow: 1 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
            >
                <Formik
                    initialValues={{ phonecode: '', phonenumber: '' }}
                    validationSchema={PhoneNumberSchema(phoneNumberMaxLength)}
                    onSubmit={handleNext}
                    enableReinitialize
                >
                    {({ handleSubmit, values, setFieldValue, isValid }) => {
                        const prevPhoneCodeRef = useRef<string>();

                        useEffect(() => {
                            const prevCode = prevPhoneCodeRef.current;
                            const selectedCode: any = countryCodeData?.countryCodelist?.find((item: any) => item?.mobileCode === values?.phonecode);

                            if (selectedCode?.length) {
                                setPhoneNumberMaxLength(selectedCode?.length);
                            }

                            if (prevCode && prevCode !== values?.phonecode) {
                                setFieldValue('phonenumber', '');
                            }

                            prevPhoneCodeRef.current = values?.phonecode;
                        }, [values.phonecode, setFieldValue]);

                        useEffect(() => {
                            if (values.phonenumber || values.phonecode) {
                                setError(undefined);
                            }
                        }, [values.phonenumber, values.phonecode]);

                        return (
                            <>
                                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                                    <Container style={[]}>
                                        <PageHeader title={t("GLOBAL_CONSTANTS.HEDAER_CHANGE_PHONE_NUMBER")} onBackPress={handleBackPress} disable={loading} />
                                        {error && <ErrorComponent message={error} screen={true} />}
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.gap16]}>
                                            <ImageUri uri={COMMON_SVG_URLS.alertIcon} height={s(24)} width={s(24)} />
                                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.FOR_SECURITY_REASONS_AFTER_UNBINDING_CHANGING_PHONE_WITHDRAWALS_AND_INTERNAL_TRANSFERS_WILL_BE_DISABLED"} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.flex1, commonStyles.textGrey]} />
                                        </ViewComponent>
                                        <ViewComponent>
                                            <PhoneInputWithPicker
                                                label='GLOBAL_CONSTANTS.PHONE_NUMBER'
                                                phoneFieldName="phonenumber"
                                                codeFieldName="phonecode"
                                                placeholder="GLOBAL_CONSTANTS.ENTER_PHONE_NUMBER"
                                                modalTitle="GLOBAL_CONSTANTS.SELECT_COUNTRY_CODE"
                                                customBind={["name", "(", "mobileCode", ")"]}
                                                data={countryCodeData?.countryCodelist ?? []}
                                                showCountryImages={true}
                                                maxLength={phoneNumberMaxLength}
                                                disabled={!values.phonecode}
                                                isCodeDisable={loading}
                                            />
                                        </ViewComponent>

                                    </Container>
                                </ScrollView>
                                <ViewComponent style={[commonStyles.mt30, commonStyles.p24]}>
                                    <ButtonComponent
                                        title={"GLOBAL_CONSTANTS.NEXT"}
                                        onPress={handleSubmit}
                                        loading={loading}
                                        disable={
                                            loading ||
                                            !values.phonenumber ||
                                            !values.phonecode ||
                                            !isValid
                                        }
                                    />
                                </ViewComponent>
                                <ViewComponent style={[commonStyles.sectionGap]} />
                            </>
                        )
                    }}
                </Formik>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
};

export default PhoneNumberChange;