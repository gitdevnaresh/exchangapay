import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Formik } from 'formik';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import SwokipayDashboardLoader from '../../../newComponents/swokipayloader';
import Container from '../../../newComponents/container/container';
import ViewComponent from '../../../newComponents/view/view';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import ButtonComponent from '../../../newComponents/buttons/button';
import FormikTextInput from '../../../newComponents/textInputComponents/formik/textInput';
import PhoneInputWithPicker from '../../../newComponents/pickerComponents/formik/phonePickerInput';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import { setKycFormData } from '../../../redux/actions/cardActions';
import OnboardingService from '../../../services/onboarding';
import { GETTING_STARTED_SCREENS, getValidationSchema, INITIAL_FORM_VALUES } from './kycFormConstants';
import { isErrorDispaly } from '../../../utils/helpers';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import { FormValues } from './interface';

const ContactInformation: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const NEW_COLOR = useMemo(() => useThemeColors(), []);
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  const cardId = route.params?.cardId;
  const kycFormData = useSelector((state: any) => state.cardsReducer?.kycFormData);
  const kycApiResponseData = useSelector((state: any) => state.cardsReducer?.kycApiResponseData);
  const [countryCodes, setCountryCodes] = useState<any[]>([]);
  const [loadingCodes, setLoadingCodes] = useState<boolean>(false);
  const [phoneNumberMaxLength, setPhoneNumberMaxLength] = useState<number>();
  const [currentPhoneCode, setCurrentPhoneCode] = useState<string>('');
  const prevPhoneCodeRef = useRef<string>();
  const [error, setError] = useState<string>('');

  // Fetch phone codes only once on mount
  useEffect(() => {
    fetchPhoneCodes();
  }, []);
  useHardwareBackHandler(() => {
    handleBack();
  });
  
  // Initialize currentPhoneCode from API response or form data
  useEffect(() => {
    const code = kycApiResponseData?.phoneCode || kycFormData?.phoneCode || INITIAL_FORM_VALUES.phoneCode;
    setCurrentPhoneCode(code);
    prevPhoneCodeRef.current = code;
  }, [kycApiResponseData?.phoneCode, kycFormData?.phoneCode]);
  const fetchPhoneCodes = useCallback(async () => {
    setError('');
    setLoadingCodes(true);
    try {
      const response: any = await OnboardingService.countriesList();

      if (response?.status === 200 && Array.isArray(response.data)) {
        const codes = response.data;
        setCountryCodes(codes);
      } else {
        setError(isErrorDispaly(response));
      }
    } catch (err) {
      setError(isErrorDispaly(err));
    } finally {
      setLoadingCodes(false);
    }
  }, []);

  const handleContinue = useCallback(async (values: FormValues) => {
    try {
      // Convert Date to ISO string for Redux serialization
      const serializedValues = {
        ...values,
        dob: values.dob instanceof Date ? values.dob.toISOString() : values.dob
      };
      dispatch(setKycFormData(serializedValues));
      navigation.navigate('FinancialInformation', { cardId });
    } catch (err) {
      setError(isErrorDispaly(err));
    }
  }, [dispatch, navigation, cardId]);

  const handleBack = useCallback(() => {
    navigation.navigate('UserPersonalInformation', { cardId, animation: "slide_from_left" });
  }, [navigation, cardId]);
  const validationSchema = useMemo(() => getValidationSchema(GETTING_STARTED_SCREENS.SCREEN_2), []);
  // Initialize values: use API data for phone/email if available, otherwise use form data or defaults
  const initialValues: FormValues = useMemo(() => ({
    phoneCode: kycApiResponseData?.phoneCode || kycFormData?.phoneCode || INITIAL_FORM_VALUES.phoneCode,
    phoneNumber: kycApiResponseData?.phoneNumber || kycFormData?.phoneNumber || INITIAL_FORM_VALUES.phoneNumber,
    email: kycApiResponseData?.email || kycFormData?.email || INITIAL_FORM_VALUES.email,
    // Include other fields for payload building
    firstName: kycFormData?.firstName,
    lastName: kycFormData?.lastName,
    addressLine1: kycFormData?.addressLine1,
    addressLine2: kycFormData?.addressLine2,
    country: kycFormData?.country,
    state: kycFormData?.state,
    city: kycFormData?.city,
    pincode: kycFormData?.pincode,
    dob: kycFormData?.dob ? (typeof kycFormData.dob === 'string' ? new Date(kycFormData.dob) : kycFormData.dob) : null,
  }), [kycApiResponseData, kycFormData]);

  // Check if all required fields on this screen are filled
  const isScreenValid = useCallback((values: FormValues): boolean => {
    return !!(
      values.phoneCode?.trim() &&
      values.phoneNumber?.trim() &&
      values.email?.trim()
    );
  }, []);

  return (
    <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
      <Container>
        <PageHeader
          title="GLOBAL_CONSTANTS.GETTING_STARTED"
          onBackPress={handleBack}
        />
        {loadingCodes && (
          <ViewComponent style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter]}>
            <SwokipayDashboardLoader />
          </ViewComponent>
        )}
        {!loadingCodes && (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleContinue}
          enableReinitialize
          validateOnChange={true}
          validateOnBlur={true}
        >
          {({ values, setFieldValue, isSubmitting }) => {
            // Use useEffect to handle phone code changes
            React.useEffect(() => {
              if (currentPhoneCode !== values.phoneCode || currentPhoneCode !== prevPhoneCodeRef.current) {
                const selectedCode: any = countryCodes.find(
                  (item: any) => item?.mobileCode === values.phoneCode
                );
                if (selectedCode?.length) {
                  setPhoneNumberMaxLength(selectedCode.length);
                }

                if (prevPhoneCodeRef.current && prevPhoneCodeRef.current !== values.phoneCode) {
                  setFieldValue('phoneNumber', '');
                }
                setCurrentPhoneCode(values.phoneCode || '');
                prevPhoneCodeRef.current = values.phoneCode;
              }
            }, [values.phoneCode]);

            return (
              <>
                <KeyboardAwareScrollView
                  contentContainerStyle={[{ flexGrow: 1 }]}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  enableOnAndroid={true}
                >
                  <ViewComponent style={[]}>
                    {error && <ErrorComponent message={error} />}
                    <TextMultiLanguage text="GLOBAL_CONSTANTS.PLEASE_FILL_PHONE_EMAIL" style={[commonStyles.textGrey, commonStyles.fs14_24, commonStyles.fw400]} />
                    <PhoneInputWithPicker
                      phoneFieldName="phoneNumber"
                      codeFieldName="phoneCode"
                      label="GLOBAL_CONSTANTS.PHONE_NUMBER"
                      placeholder="GLOBAL_CONSTANTS.ENTER_PHONE"
                      isRequired={true}
                      modalTitle="GLOBAL_CONSTANTS.SELECT_COUNTRY_CODE"
                      customBind={["name", " (", "mobileCode", ")"]}
                      data={countryCodes}
                      showCountryImages={true}
                      disabled={!!kycApiResponseData?.phoneCode || !!kycApiResponseData?.phoneNumber || !values.phoneCode}
                      maxLength={phoneNumberMaxLength}
                      isCodeDisable={!!kycApiResponseData?.phoneCode}
                    />
                    <ViewComponent style={[commonStyles.formItemSpace]} />

                    {/* Email */}
                    <FormikTextInput
                      name="email"
                      label="GLOBAL_CONSTANTS.EMAIL_ADDRESS_LABEL"
                      placeholder="GLOBAL_CONSTANTS.ENTER_EMAIL"
                      keyboardType="email-address"
                      isRequired={true}
                      editable={!kycApiResponseData?.email}
                    />
                    <ViewComponent style={[commonStyles.formItemSpace]} />
                  </ViewComponent>

                  <ViewComponent style={[commonStyles.flex1]} />
                  {/* Continue Button */}
                  <ViewComponent style={[]}>
                    <ButtonComponent
                      title="GLOBAL_CONSTANTS.CONTINUE"
                      onPress={() => handleContinue(values)}
                      loading={isSubmitting}
                      disable={!isScreenValid(values) || isSubmitting }
                    />

                    <ViewComponent style={[commonStyles.mb16]} />
                    {/* Cancel Button */}
                    <ButtonComponent
                      title="GLOBAL_CONSTANTS.CANCEL"
                      onPress={handleBack}
                      loading={isSubmitting}
                      disable={isSubmitting }
                      solidBackground={true}
                    />
                  </ViewComponent>
                  <ViewComponent style={[commonStyles.sectionGap]} />
                </KeyboardAwareScrollView>
              </>
            );
          }}
        </Formik>
        )}
      </Container>
    </ViewComponent>
  );
};

export default ContactInformation;
