import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Formik } from 'formik';
import { CommonActions, useIsFocused, useNavigation } from '@react-navigation/native';
import * as Yup from 'yup';
import { useLngTranslation } from '../../../hooks/useLngTranslation';
import ButtonComponent from '../../../newComponents/buttons/button';
import ViewComponent from '../../../newComponents/view/view';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { isErrorDispaly, userDetails } from '../../../utils/helpers';
import OnboardingService from '../../../services/onboarding';
import { ActionLogParams, useActionLogging } from '../../../hooks/loggingHook';
import useEncryptDecrypt from '../../../hooks/encDecHook';
import PhoneInputWithPicker from '../../../newComponents/pickerComponents/formik/phonePickerInput';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import Container from '../../../newComponents/container/container';
import ConfirmLogout from '../../commonScreens/confirmLogout/comfirmLogout';
import { useDispatch, useSelector } from 'react-redux';
import { isLogin, loginAction, setUserInfo } from '../../../redux/actions/actions';
import Keychain from "react-native-keychain";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import { ActivityIndicator, Keyboard, TouchableOpacity } from 'react-native';
import { logout } from '@frontegg/react-native';
import { getTabsConfigation } from '../../../../configuration';
import { FrontEggService } from '../../../apiServices/fronteggApiServices/fronteggServices';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';

// Interface for form values
interface BindPhoneFormValues {
    phoneCode: string;
    phoneNumber: string;
}
interface PhoneCode {
    name: string;
    code: string;
    logo: string | null;
    flag: string;
    mobileCode: string;
    recorder: number;
    length?: number; // Ensure length property is defined
}

const BindPhoneComponent = () => {
    const navigation = useNavigation<any>();
    const { t } = useLngTranslation();
    const [loading, setLoading] = useState<boolean>(false);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { logEvent } = useActionLogging();
    const [phoneCodesLIst, setPhoneCodesLIst] = useState<PhoneCode[]>([])
    const { encryptAES, decryptAES } = useEncryptDecrypt("11AA7AE945754C128F2EC8DAFFE82416");
    const [isVisible, setIsVisible] = useState(false)
    const dispatch = useDispatch<any>();
    const [phoneNumberMaxLength, setPhoneNumberMaxLength] = useState<number>();
    const isFocused = useIsFocused();
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const [initialValues, setIntialValues] = useState<BindPhoneFormValues>({
        phoneCode: "",
        phoneNumber: '',
    });
    const [logoutBtnLoading, setLogoutBtnLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const Configuration: any = useMemo(
        () => getTabsConfigation("IDENITY_CONFIG"),
        []
    );

    // Form validation schema
    const BindPhoneSchema = (phoneLength: any) => {
        return Yup.object().shape({
            phoneCode: Yup.string().required(""),
            phoneNumber: Yup.string()
                .required("")
                .length(
                    phoneLength,
                    `${t('GLOBAL_CONSTANTS.INVALID_PHONE_NUMBER_PLEASE_CHECK')}`
                )
        });
    };

    useEffect(() => {
        const setupFormWithUserData = async () => {
            try {
                const response: any = await OnboardingService.countriesList();

                if (response.status === 200) {
                    const codes: PhoneCode[] = response?.data ?? [];
                    setPhoneCodesLIst(codes);

                    const decryptedCode = decryptAES(userInfo?.phonecode);
                    const decryptedNumber = decryptAES(userInfo?.phoneNumber);

                    if (decryptedCode && codes.length > 0) {
                        const selectedCodeData = codes?.find((item: PhoneCode) => item?.mobileCode === decryptedCode);
                        if (selectedCodeData?.length) {
                            setPhoneNumberMaxLength(selectedCodeData.length);
                        }
                    }

                    setIntialValues({
                        phoneCode: decryptedCode || "",
                        phoneNumber: decryptedNumber || "",
                    });
                } else {
                    setError(isErrorDispaly(response));
                }
            } catch (error: any) {
                setError(isErrorDispaly(error));
            }
        };

        if (isFocused && userInfo) {
            setupFormWithUserData();
        }
    }, [userInfo, isFocused]);


    // Navigate back to the previous screen
    const handleGoBack = () => {
        const actionData: ActionLogParams = {
            screename: 'BindPhone', actionName: 'Navigate Back', actionType: 'Button', nextScreenName: 'Previous Screen'
        };
        logEvent('navigation_action', actionData);
        navigation.goBack();
    };

    // Handle form submission
    const handleContinue = async (values: BindPhoneFormValues) => {
        setLoading(true);
        try {
            const obj = {
                phoneCode: encryptAES(values?.phoneCode),
                phoneNumber: encryptAES(values?.phoneNumber),
                isResendOTP: true,
                isPhoneNoUpdate: true,
            };
            const actionData: ActionLogParams = {
                screename: 'BindPhone', actionName: 'Navigate to Phone Verification', actionType: 'Button', nextScreenName: 'phoneVerification', actionObj: { postObj: { postObj: obj } }
            };
            logEvent('navigation_action', actionData);
            const response: any = await OnboardingService.getPhoneNumberOtp(obj);
            if (response.status === 200) {
                navigation.navigate("PhoneVerification", { phoneNumber: values?.phoneNumber, phoneCode: values?.phoneCode });
            } else {
                Keyboard.dismiss();
                setError(isErrorDispaly(response));
            }
        } catch (error: any) {
            Keyboard.dismiss();
            setError(isErrorDispaly(error));
        } finally {
            Keyboard.dismiss();
            setLoading(false);
        }
    };

    // --- Logout handlers ---
    const handleLgout = async () => {
        setLogoutBtnLoading(true);
        const actionData: ActionLogParams = {
            screename: 'NewProfile', actionName: 'Logout', actionType: 'Button',
        };
        logEvent('button_press', actionData);
        dispatch(setUserInfo(""));
        dispatch(isLogin(false));
        if (Configuration.FFRONTEGG?.enabled === true) {
            if (Configuration.FFRONTEGG?.manualForm) {

                try {
                    const refresh = await userDetails();
                    const reponse = await FrontEggService.userLogOut({
                        refreshId: refresh
                    });
                } catch (e) {
                    const errorMessage = isErrorDispaly(e);
                    setError(errorMessage);
                    return;
                }
            } else {
                await logout();//sdk
            }

        };
        await Keychain.resetGenericPassword({ service: 'authTokens' });
        dispatch(loginAction(null));
        setLogoutBtnLoading(false);
        setTimeout(() => {
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [{ name: "SplaceScreen" }],
                })
            );
        }, 1000);

    };
    const handleClose = () => setIsVisible(false);
    const handleConfirm = () => {
        setIsVisible(false);
        handleLgout();
    };
    const Logout = () => {
        Keyboard.dismiss();
        setIsVisible(true);
    }
    const logoutButton = (
        <>
            {logoutBtnLoading &&
                <ViewComponent style={[commonStyles.radioBg, commonStyles.p6, commonStyles.rounded50, commonStyles.px26]}>
                    <ActivityIndicator size="small" color={NEW_COLOR.TEXT_WHITE} />
                </ViewComponent> ||
                (<TouchableOpacity style={[commonStyles.radioBg, commonStyles.py8, commonStyles.rounded50, commonStyles.px18]} onPress={Logout} disabled={loading}>
                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.LOG_OUT"} style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.fw600]} />
                </TouchableOpacity>)
            }
        </>
    );

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <KeyboardAwareScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
            >
                <Container>
                    <PageHeader onBackPress={handleGoBack} backIcon={false} title={"GLOBAL_CONSTANTS.BIND_PHONE"} rightActions={logoutButton} disable={loading} />
                    {error && <ErrorComponent message={error} screen={true} />}
                    <Formik
                        enableReinitialize
                        initialValues={initialValues}
                        validationSchema={BindPhoneSchema(phoneNumberMaxLength)}
                        onSubmit={handleContinue}
                    >
                        {(formik) => {
                            const { handleSubmit, values, setFieldValue } = formik;

                            // --- SOLUTION: Use a ref to track the previous country code ---
                            const prevPhoneCodeRef = useRef<string>();

                            useEffect(() => {
                                const prevCode = prevPhoneCodeRef.current;

                                // Always update the phone number's max length
                                const selectedCode: any = phoneCodesLIst.find(
                                    (item: any) => item?.mobileCode === values?.phoneCode
                                );
                                if (selectedCode?.length) {
                                    setPhoneNumberMaxLength(selectedCode.length);
                                }

                                // **THE FIX**: Only clear the phoneNumber if the previous code was NOT empty
                                // and is different from the current code. This prevents clearing on initial load.
                                if (prevCode && prevCode !== values?.phoneCode) {
                                    setFieldValue('phoneNumber', '');
                                    setError(''); // Clear errors when phone code changes
                                }

                                // Update the ref with the current code for the next render.
                                prevPhoneCodeRef.current = values?.phoneCode;

                            }, [values.phoneCode, setFieldValue]);

                            // Clear errors when phone number changes
                            useEffect(() => {
                                if (values.phoneNumber && error) {
                                    setError('');
                                }
                            }, [values.phoneNumber]);

                            return (
                                <ViewComponent style={{ flex: 1 }}>
                                    <ViewComponent style={{ flex: 1 }}>
                                        <TextMultiLanguage
                                            text={"GLOBAL_CONSTANTS.BEFORE_IDENTITY_AUTHENTICATION"}
                                            style={[commonStyles.TITLE_GREY, commonStyles.fs14_24, commonStyles.fw400]}
                                        />
                                        <ViewComponent>
                                            <PhoneInputWithPicker
                                                phoneFieldName="phoneNumber"
                                                codeFieldName="phoneCode"
                                                placeholder="GLOBAL_CONSTANTS.ENTER_PHONE_NUMBER"
                                                modalTitle="GLOBAL_CONSTANTS.SELECT_COUNTRY_CODE"
                                                searchPlaceholder={"Search Country Code"}
                                                customBind={["name", " (", "mobileCode", ")"]}
                                                data={phoneCodesLIst || []}
                                                showCountryImages={true}
                                                disabled={!values.phoneCode || loading}
                                                maxLength={phoneNumberMaxLength}
                                                isCodeDisable={loading}
                                            />
                                        </ViewComponent>
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.sectionGap]} />                                     <ViewComponent style={[commonStyles.sectionGap]} >
                                        <ButtonComponent
                                            title={"GLOBAL_CONSTANTS.CONTINUE"}
                                            onPress={handleSubmit}
                                            loading={loading}
                                            disable={
                                                loading ||
                                                !formik.values.phoneNumber ||
                                                !formik.values.phoneCode ||
                                                !!formik.errors.phoneNumber ||
                                                !!formik.errors.phoneCode
                                            }
                                        />
                                    </ViewComponent>
                                </ViewComponent>
                            );

                        }}
                    </Formik>
                </Container>
            </KeyboardAwareScrollView>
            <ConfirmLogout
                isVisible={isVisible}
                onClose={handleClose}
                onConfirm={handleConfirm}
            />
        </ViewComponent>
    );
};

export default BindPhoneComponent;