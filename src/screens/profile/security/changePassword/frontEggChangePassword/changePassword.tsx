import React, { useState } from 'react';
import { Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AntDesign } from '@expo/vector-icons';
import { s } from '../../../../../constants/theme/scale';
import { useLngTranslation } from '../../../../../hooks/useLngTranslation';
import { useThemeColors } from '../../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../../assets/styles/CommonStyles';
import OnboardingService from '../../../../../services/onboarding';
import { showAppToast } from '../../../../../newComponents/ToasterMessages/ShowMessage';
import { isErrorDispaly } from '../../../../../utils/helpers';
import Container from '../../../../../newComponents/container/container';
import ViewComponent from '../../../../../newComponents/view/view';
import PageHeader from '../../../../../newComponents/pageHeader/pageHeader';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ParagraphComponent from '../../../../../newComponents/textComponets/paragraphText/paragraph';
import FormikTextInput from '../../../../../newComponents/textInputComponents/formik/textInput';
import ButtonComponent from '../../../../../newComponents/buttons/button';
import { PasswordCriteriaDisplay } from '../../../../onboarding/signup/constants';
import useEncryptDecrypt from '../../../../../hooks/encDecHook';
import ImageUri from '../../../../../newComponents/imageComponents/image';
import { COMMON_SVG_URLS } from '../../../../../assets/blobUrls';
import TextMultiLanguage from '../../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ErrorComponent from '../../../../../newComponents/errorDisplay/errorDisplay';

const ChangePasswordSchema = Yup.object().shape({
    oldPassword: Yup.string()
        .required(''),
    newPassword: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('')
});

const ChangePasswordComponent = () => {
    const { t } = useLngTranslation();
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState<boolean>(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { encryptAES } = useEncryptDecrypt();
    const [error,setError]=useState<string>("");
    const initialValues = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    };

    const handleChangePassword = async (values: typeof initialValues) => {
        setLoading(true);
        try {
            const body = {
                "password": encryptAES(values.oldPassword),
                "newPassword": encryptAES(values.newPassword),
                // "confirmPassword": encryptAES(values.confirmPassword),
            };
            const response: any = await OnboardingService.changePassword(body);
            if (response?.status===200) {
                showAppToast(`${t('GLOBAL_CONSTANTS.PASSWORD_CHANGED_SUCCESSFULLY')}`, 'success');
                navigation.goBack();
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error: any) {
            const errorMessage = isErrorDispaly(error);
            setError(errorMessage);
        } finally {
            Keyboard.dismiss();
            setLoading(false);
        }
    };

    const handleBackPress = () => {
        navigation.goBack();
    };

    const handleChange = () => {
        setError("");
    }

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <KeyboardAwareScrollView
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid={true}
                showsVerticalScrollIndicator={false}
            >
                <Container style={[{ flex: 1 }]}>
                    <ViewComponent style={{ flex: 1 }}>
                        <PageHeader
                            onBackPress={handleBackPress}
                            title={t('GLOBAL_CONSTANTS.CHANGE_PASSWORD')}
                            disable={loading}
                        />
                        {error &&<ErrorComponent message={error} screen={true}/>}
                        <ViewComponent style={[
                            commonStyles.dflex,
                            commonStyles.mb24,
                            commonStyles.rounded10,
                            commonStyles.gap10
                        ]}>
                            <ViewComponent>
                                <ImageUri uri={COMMON_SVG_URLS.alertIcon} height={s(24)} width={s(24)} />
                            </ViewComponent>
                            <TextMultiLanguage
                                style={[commonStyles.fs14_24, commonStyles.fw400, commonStyles.textGrey, { flex: 1 }]}
                                text="GLOBAL_CONSTANTS.FOR_ADDED_SECURITY_BULLSWIPE_PAY_WILL_AUTOMATICALLY"
                            />
                        </ViewComponent>
                        <Formik
                            initialValues={initialValues}
                            validationSchema={ChangePasswordSchema}
                            onSubmit={handleChangePassword}
                            validateOnChange={true}
                            validateOnBlur={true}
                        >
                            {({ values, touched, handleSubmit, handleBlur, errors }) => {
                                let passwordsMatch;
                                if (
                                    values.newPassword.length > 0 &&
                                    values.confirmPassword.length > 0
                                ) {
                                    passwordsMatch = values.newPassword === values.confirmPassword;
                                }

                                return (
                                    <>
                                        <FormikTextInput
                                            label={t('GLOBAL_CONSTANTS.OLD_PASSWORD')}
                                            name="oldPassword"
                                            placeholder={t('GLOBAL_CONSTANTS.ENTER_OLD_PASSWORD')}
                                            placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                            secureTextEntry={true}
                                            isRequired={true}
                                            maxLength={32}
                                            onChange={handleChange}
                                        />

                                        <ViewComponent style={[commonStyles.mb16]} />

                                        <FormikTextInput
                                            label={t('GLOBAL_CONSTANTS.NEW_PASSWORD')}
                                            name="newPassword"
                                            placeholder={t('GLOBAL_CONSTANTS.ENTER_NEW_PASSWORD')}
                                            placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                            secureTextEntry={true}
                                            isRequired={true}
                                            maxLength={32}
                                            onFocus={() => setIsPasswordFocused(true)}
                                            onBlur={(e) => {
                                                handleBlur('newPassword')(e);
                                                setIsPasswordFocused(false);
                                            }}
                                            onChange={handleChange}
                                            custInput={[
                                                passwordsMatch === false ? commonStyles.error_Border : null,
                                                passwordsMatch === true ? commonStyles.success_Border : null,
                                            ]}
                                        />

                                       <ViewComponent style={[commonStyles.mb16]} />

                                        <FormikTextInput
                                            label={t('GLOBAL_CONSTANTS.CONFIRM_PASSWORD')}
                                            name="confirmPassword"
                                            placeholder={t('GLOBAL_CONSTANTS.ENTER_CONFIRM_PASSWORD')}
                                            placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                            secureTextEntry={true}
                                            isRequired={true}
                                            maxLength={32}
                                            onFocus={() => setIsPasswordFocused(true)}
                                            onBlur={(e) => {
                                                handleBlur('confirmPassword')(e);
                                                setIsPasswordFocused(false);
                                            }}
                                            onChange={handleChange}
                                            custInput={[
                                                passwordsMatch === false ? commonStyles.error_Border : null,
                                                passwordsMatch === true ? commonStyles.success_Border : null,
                                            ]}
                                        />

                                        {(passwordsMatch === false) && (
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                                                <AntDesign
                                                    name="closecircleo"
                                                    size={s(14)}
                                                    color={NEW_COLOR.TEXT_RED}
                                                    style={[commonStyles.mt6]}
                                                />
                                                <ParagraphComponent
                                                    text={t("GLOBAL_CONSTANTS.PASSWORD_DO_NOT_MATCH")}
                                                    style={[commonStyles.fs14, commonStyles.mt4, commonStyles.textRed, commonStyles.fw400]}
                                                />
                                            </ViewComponent>
                                        )}

                                        {(isPasswordFocused ||
                                            (touched?.newPassword && !!values.newPassword)) && (
                                                <PasswordCriteriaDisplay
                                                    password={values.newPassword}
                                                    NEW_COLOR={NEW_COLOR}
                                                    commonStyles={commonStyles}
                                                    t={t}
                                                />
                                            )}

                                        <ViewComponent style={{ flex: 1 }} />
                                        <ViewComponent style={[commonStyles.sectionGap]} />
                                        <ViewComponent style={[commonStyles.sectionGap]}>
                                            <ButtonComponent
                                                title={t('GLOBAL_CONSTANTS.CONTINUE')}
                                                onPress={handleSubmit}
                                                loading={loading}
                                                disable={!passwordsMatch || loading}
                                            />
                                        </ViewComponent>
                                    </>
                                );
                            }}
                        </Formik>
                    </ViewComponent>
                </Container>
            </KeyboardAwareScrollView>
        </ViewComponent>
    );
};

export default ChangePasswordComponent;
