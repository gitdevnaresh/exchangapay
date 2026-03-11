import React, { useEffect, useState } from 'react';
import { Formik, Field } from 'formik';
import { Keyboard, Linking } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useLngTranslation } from '../../hooks/useLngTranslation';
import { useThemeColors } from '../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';
import Container from '../../newComponents/container/container';
import PageHeader from '../../newComponents/pageHeader/pageHeader';
import ViewComponent from '../../newComponents/view/view';
import FormikTextInput from '../../newComponents/textInputComponents/formik/textInput';
import CustomPickerModal from '../../newComponents/pickerComponents/formik/customPicker';
import Checkbox from '../../newComponents/checkBoxes/basic/checkBox';
import ButtonComponent from '../../newComponents/buttons/button';
import OnboardingService from '../../services/onboarding';
import { showAppToast } from '../../newComponents/ToasterMessages/ShowMessage';
import { isErrorDispaly } from '../../utils/helpers';
import { useSelector } from 'react-redux';
import ErrorComponent from '../../newComponents/errorDisplay/errorDisplay';
import { useNavigation } from '@react-navigation/native';
import { ReferralValidationSchema } from './interface';
import TextMultiLanguage from '../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ParagraphComponent from '../../newComponents/textComponets/paragraphText/paragraph';
import { useHardwareBackHandler } from '../../hooks/HardwareBackHandler';
import useEncryptDecrypt from '../../hooks/encDecHook';
import FormikTextAreaInput from '../../newComponents/textInputComponents/formik/TextAreaInput';
import { s } from '../../constants/theme/scale';

const ReferralProgram = () => {
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const { decryptAES } = useEncryptDecrypt();
    const [countries, setCountries] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        fetchCountries();
    }, []);

    const fetchCountries = async () => {
        try {
            const res: any = await OnboardingService.countriesList();
            if (res?.status === 200 || res?.ok) {
                const list = res?.data || res;
                // map to picker shape
                const mapped = (Array.isArray(list) ? list : []).map((c: any) => ({ id: c.id || c.countryCode || c.code, name: c.country || c.name, code: c.countryCode || c.code }));
                setCountries(mapped);
            } else {
                setError(isErrorDispaly(res));
            }
        } catch (err: any) {
            setError(isErrorDispaly(err));
        }
    };
    const navigation = useNavigation<any>();
    const validationSchema = ReferralValidationSchema;

    useHardwareBackHandler(() => {
        navigation.goBack();
        return true;
    });

    const handleSubmit = async (values: any, { resetForm }: any) => {
        setError('');
        Keyboard.dismiss();
        setLoading(true);
        try {
            const body = {
                customerId: userInfo?.id || '',
                fullName: values.fullName,
                email: values.email,
                countryOfResidence: values.countryOfResidence,
                preferredCommunication: values.preferredCommunication,
                socialMediaorCommunityURL: values.socialMediaorCommunityURL,
                marketingCountry: values.marketingCountry,
                briefintroduction: values.briefintroduction,
            };

            const response: any = await OnboardingService.submitAffiliate(body);
            if (response?.status === 200) {
                showAppToast(t('GLOBAL_CONSTANTS.REFERRAL_SUBMITTED_SUCCESS'), 'success');
                resetForm();
                // Navigate back to Refer screen after successful submit
                navigation.navigate('Dashboard', { screen: 'GLOBAL_CONSTANTS.REFER' });
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (err: any) {
            setError(isErrorDispaly(err));
        } finally {
            setLoading(false);
        }
    };
    const initialValues = {
        fullName: decryptAES(userInfo.firstName) + ' ' + decryptAES(userInfo.lastName) || '',
        email: decryptAES(userInfo.email) || '',
        bullswipeUID: decryptAES(userInfo.depositReference) || '',
        countryOfResidence: userInfo.country || '',
        preferredCommunication: '',
        socialMediaorCommunityURL: '',
        marketingCountry: '',
        briefintroduction: '',
        termsAccepted: false,
    };

    const handleNavigateTerms = () => {
        Linking.openURL('https://bullswipe.com/terms-conditions/');
    };
    useHardwareBackHandler(() => {
        navigation.goBack();
        return true;
    });
    const handleBackPress = () => {
        navigation.goBack();
    }

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container>
                <PageHeader title={'GLOBAL_CONSTANTS.PARTNER_PROGRAM'} onBackPress={handleBackPress} />
                {error && <ErrorComponent message={error} screen={true} />}
                <KeyboardAwareScrollView
                    contentContainerStyle={[{ flexGrow: 1 }]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    enableOnAndroid={true}
                    extraScrollHeight={s(150)}
                    enableAutomaticScroll={true}
                >
                    <ViewComponent style={[]}>
                        {/* Eligibility static content (from partner program image) */}
                        <ViewComponent style={[commonStyles.mb16]}>
                            <TextMultiLanguage text={'GLOBAL_CONSTANTS.PARTNER_PROGRAM_ELIGIBILITY_TITLE'} style={[commonStyles.fs14, commonStyles.fw700, commonStyles.textWhite, commonStyles.mb8]} />
                            <TextMultiLanguage text={'GLOBAL_CONSTANTS.PARTNER_PROGRAM_DESCRIPTION'} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textGrey]} />

                            <ViewComponent style={[]}>
                                {[1, 2, 3, 4].map((num) => (
                                    <ViewComponent key={num} style={[commonStyles.mt20]}>

                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                                            <TextMultiLanguage text={`${String(num)}. `} style={[commonStyles.fs12, commonStyles.fw700, commonStyles.textGrey]} />
                                            <TextMultiLanguage text={`GLOBAL_CONSTANTS.PARTNER_CRITERIA_${num}_TITLE`} style={[commonStyles.fs12, commonStyles.fw700, commonStyles.textGrey]} />

                                        </ViewComponent>
                                        <ViewComponent style={[commonStyles.flex1]}>
                                            <TextMultiLanguage text={`GLOBAL_CONSTANTS.PARTNER_CRITERIA_${num}_DESC`} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textGrey]} />
                                        </ViewComponent>
                                    </ViewComponent>
                                ))}

                                <TextMultiLanguage text={'GLOBAL_CONSTANTS.PARTNER_PROGRAM_CONCLUSION'} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textGrey, commonStyles.mt8]} />
                            </ViewComponent>
                        </ViewComponent>

                        {/* Form - second image fields */}
                        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                            {({ values, handleSubmit, setFieldValue, touched, errors, isValid }) => {
                                return (
                                    <>
                                        <FormikTextInput label={'GLOBAL_CONSTANTS.FULL_NAME'} name="fullName" placeholder={'GLOBAL_CONSTANTS.FULL_NAME'} isRequired={true} editable={!values.fullName} />
                                        <ViewComponent style={commonStyles.formItemSpace} />

                                        <FormikTextInput label={'GLOBAL_CONSTANTS.EMAIL_ADDRESS'} name="email" placeholder={'GLOBAL_CONSTANTS.ENTER_EMAIL_ADDRES'} keyboardType="email-address" isRequired={true} autoCapitalize="none" editable={!values.email} />
                                        <ViewComponent style={commonStyles.formItemSpace} />

                                        <FormikTextInput label={'GLOBAL_CONSTANTS.BULLSWIPE_UID'} name="bullswipeUID" placeholder={'GLOBAL_CONSTANTS.BULLSWIPE_UID'} isRequired={true} editable={!values.bullswipeUID} />
                                        <ViewComponent style={commonStyles.formItemSpace} />

                                        <Field name="countryOfResidence" component={CustomPickerModal} data={countries} label={'GLOBAL_CONSTANTS.COUNTRY_OF_RESIDENCE'} isRequired={true} placeholder={'GLOBAL_CONSTANTS.SELECT_COUNTRY'} disabled={!!values.countryOfResidence} />
                                        <ViewComponent style={commonStyles.formItemSpace} />

                                        {/* <Field name="preferredCommunication" component={CustomPickerModal} data={socialMediaPlatforms} label={'GLOBAL_CONSTANTS.PREFERRED_COMMUNICATION'} isRequired={true} placeholder={'GLOBAL_CONSTANTS.SELECT_OPTION'} />
                                        <ViewComponent style={commonStyles.formItemSpace} /> */}

                                        <FormikTextInput label={'GLOBAL_CONSTANTS.SOCIAL_MEDIA_OR_COMMUNITY_URL'} name="socialMediaorCommunityURL" placeholder={'GLOBAL_CONSTANTS.ENTER_URL'} discription={"GLOBAL_CONSTANTS.MUST_MEET_FOLLOWER_CRITERIA"} isRequired={true} />
                                        <ViewComponent style={commonStyles.formItemSpace} />

                                        <Field name="marketingCountry" component={CustomPickerModal} data={countries} label={'GLOBAL_CONSTANTS.MARKETING_COUNTRY'} isRequired={true} placeholder={'GLOBAL_CONSTANTS.SELECT_COUNTRY'} />
                                        <ViewComponent style={commonStyles.formItemSpace} />

                                        <FormikTextAreaInput
                                            name="briefintroduction"
                                            placeholder={'GLOBAL_CONSTANTS.BRIEF_INTRODUCTION'}
                                            label={'GLOBAL_CONSTANTS.BRIEF_INTRODUCTION'}
                                            maxLength={500}
                                            maxLines={4}
                                            isRequired={true}
                                        />
                                        <ViewComponent style={commonStyles.formItemSpace} />

                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                                            <Checkbox
                                                value={values.termsAccepted}
                                                onChange={(val: boolean) => setFieldValue('termsAccepted', val)}
                                                checkedColor={NEW_COLOR.TITLE_TEXT}
                                                uncheckedBorderColor={NEW_COLOR.BORDER_COLOR}
                                                backgroundColor={NEW_COLOR.CHECK_BOX_BG}
                                                style={[commonStyles.mr10]}
                                            />
                                            <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.flex1]} text={t('GLOBAL_CONSTANTS.BY_SUBMITTING_THE_FORM_YOU_AGREE_TO_OUR')}>
                                                <TextMultiLanguage text={'GLOBAL_CONSTANTS.TERMS_OF_USE'} style={[commonStyles.text_yellow, commonStyles.fw400]} onPress={handleNavigateTerms} />
                                            </ParagraphComponent>
                                        </ViewComponent>

                                        {touched.termsAccepted && errors.termsAccepted && (
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                                                <ViewComponent style={[commonStyles.textRed]} />
                                            </ViewComponent>
                                        )}

                                        <ViewComponent style={[commonStyles.mt30]}>
                                            <ButtonComponent
                                                title={t('GLOBAL_CONSTANTS.SUBMIT')}
                                                onPress={handleSubmit}
                                                loading={loading}
                                                disable={loading || !isValid || !values.termsAccepted}
                                            />
                                        </ViewComponent>
                                    </>
                                )
                            }}
                        </Formik>
                    </ViewComponent>
                </KeyboardAwareScrollView>
            </Container>
        </ViewComponent >
    );
};

export default ReferralProgram;
