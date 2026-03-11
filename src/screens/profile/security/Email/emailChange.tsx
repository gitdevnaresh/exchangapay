import React, { useEffect, useState } from 'react';
import { TextInput, SafeAreaView, ScrollView, BackHandler, Keyboard } from 'react-native';
import Container from '../../../../newComponents/container/container';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import { ActionLogParams, useActionLogging } from '../../../../hooks/loggingHook';
import ViewComponent from '../../../../newComponents/view/view';
import ButtonComponent from '../../../../newComponents/buttons/button';
import { Formik } from 'formik';
import * as Yup from 'yup';
import ProfileService from '../../../../services/profile';
import { isErrorDispaly } from '../../../../utils/helpers';
import { useNavigation } from '@react-navigation/native';
import { ChangeEmailInterface } from './interface';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import LabelComponent from '../../../../newComponents/textComponets/lableComponent/lable';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSelector } from 'react-redux';
import { s } from '../../../../constants/theme/scale';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ImageUri from '../../../../newComponents/imageComponents/image';
import { COMMON_SVG_URLS } from '../../../../assets/blobUrls';
import { useLngTranslation } from '../../../../hooks/useLngTranslation';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';
import FormikTextInput from '../../../../newComponents/textInputComponents/formik/textInput';

const EmailChangeSchema = Yup.object().shape({
    newEmail: Yup.string()
        .matches(
            /^[a-zA-Z0-9._%+-]{3,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            'GLOBAL_CONSTANTS.INVALID_EMAIL_ADDRESS'
        )
        .test(
            'valid-email-format',
            'GLOBAL_CONSTANTS.INVALID_EMAIL_ADDRESS',
            value => {
                if (!value) return true;
                const [localPart] = value.split('@');
                if (!localPart) return false;
                // Check for consecutive dots, leading/trailing dots in local part
                return !/\.{2,}/.test(localPart) && !/^\./.test(localPart) && !/\.$/.test(localPart);
            }
        )
        .required(''),
});

const EmailChange = () => {
    const [loading, setLoading] = useState(false);
    const NEW_COLOR = useThemeColors();
    const navigation = useNavigation<any>();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { logEvent } = useActionLogging();
    const { encryptAES, decryptAES } = useEncryptDecrypt();
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const { t } = useLngTranslation();
    const [error, setError] = useState<string>();
    useEffect(() => {
        const backAction = () => {
            const actionData: ActionLogParams = {
                screename: 'EmailChange',
                actionName: 'Navigate Back via Hardware Button',
                actionType: 'HardwareButton',
            };
            logEvent('navigation_action', actionData);
            handleBackPress();
            return true;
        };
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );
        return () => backHandler.remove();
    }, [navigation, logEvent]);
    const handleBackPress = () => {
        const actionData: ActionLogParams = {
            screename: 'EmailChange',
            actionName: 'Navigate Back to EmailAuthenticationScreen',
            actionType: 'Icon',
            nextScreenName: 'EmailAuthenticationScreen'
        };
        logEvent('navigation_action', actionData);
        navigation.navigate('EmailAuthenticationScreen', { animation: 'slide_from_left' });
    }
    const handleNext = async (values: { newEmail: string }) => {
        setError("");
        Keyboard.dismiss();
        if (values.newEmail === decryptAES(userInfo?.email)) {
            setError(t("GLOBAL_CONSTANTS.YOUR_EMAIL_IS_ALREADY_REGISTERED"))
            return;
        }
        setLoading(true);
        const payload: ChangeEmailInterface = {
            email: encryptAES(values.newEmail),
            action: "changeemail",
        };
        try {
            const response = await ProfileService.changeEmail(payload);
            if (response.ok) {
                const actionData: ActionLogParams = {
                    screename: 'EmailChange',
                    actionName: 'Navigate to OTP Verification',
                    actionType: 'Button',
                    nextScreenName: 'EmailOtpVericication'
                };
                logEvent('navigation_action', actionData);

                navigation.navigate('EmailOtpVericication', { email: values.newEmail });
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
                enableOnAndroid={true} // Good practice to enable explicitly
            >
                <Formik
                    initialValues={{ newEmail: '' }}
                    validationSchema={EmailChangeSchema}
                    onSubmit={handleNext}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid }) => {
                        return (
                            <>

                                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={commonStyles.flexGrow1} keyboardShouldPersistTaps="handled">
                                    <Container style={commonStyles.container}>
                                        <PageHeader title={"GLOBAL_CONSTANTS.CHANGE_EMAIL"} onBackPress={handleBackPress} />
                                        {error && <ErrorComponent message={error} screen={true} />}
                                        <ViewComponent style={[commonStyles.dflex,commonStyles.gap16]}>
                                            <ImageUri uri={COMMON_SVG_URLS.alertIcon} height={s(24)} width={s(24)} />
                                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.FOR_SECURITY_REASONS_AFTER_UNBINDING_CHANGING_EMAIL_WITHDRAWALS_AND_INTERNAL_TRANSFERS_WILL_BE_DISABLED"} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.flex1, commonStyles.textGrey]} />
                                        </ViewComponent>

                                        <ViewComponent style={[commonStyles.mt20]}>
                                            <LabelComponent style={[commonStyles.inputLabel]} text={t("GLOBAL_CONSTANTS.NEW_EMAIL_ADDRESS")} children={<ParagraphComponent style={[commonStyles.textRed]} text={' *'} />} />
                                            <FormikTextInput
                                                name="newEmail"
                                                placeholder="GLOBAL_CONSTANTS.ENTER_NEW_EMAIL"
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                                onChangeText={(text) => {
                                                    handleChange('newEmail')(text);
                                                    setError("");
                                                }}
                                            />
                                        </ViewComponent>
                                    </Container>
                                </ScrollView>
                                <ViewComponent style={[commonStyles.mt30, { margin: 15 }]}>
                                    <ButtonComponent
                                        title={"GLOBAL_CONSTANTS.NEXT"}
                                        onPress={handleSubmit}
                                        loading={loading}
                                        disable={!values.newEmail || !isValid || loading}
                                    />
                                </ViewComponent>
                                <ViewComponent style={[commonStyles.sectionGap]} />
                            </>)
                    }}
                </Formik>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
};
export default EmailChange;
