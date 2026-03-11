import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Field, Formik } from 'formik';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Container from '../../../newComponents/container/container';
import ViewComponent from '../../../newComponents/view/view';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import ButtonComponent from '../../../newComponents/buttons/button';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';
import FormikTextInput from '../../../newComponents/textInputComponents/formik/textInput';
import CustomPickerModal from '../../../newComponents/pickerComponents/formik/customPicker';
import DatePickerComponent from '../../../newComponents/datePickers/formik/datePickerWithFormik';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import { isErrorDispaly } from '../../../utils/helpers';
import { cardsService } from '../../../apiServices/cardsApis/cardsApiServices';
import { setKycFormData, resetKycFormData, setKycApiResponseData } from '../../../redux/actions/cardActions';
import useEncryptDecrypt from '../../../hooks/encDecHook';
import SwokipayDashboardLoader from '../../../newComponents/swokipayloader';
import { GETTING_STARTED_SCREENS, getValidationSchema, INITIAL_FORM_VALUES } from './kycFormConstants';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import { FormValues } from './interface';
import PopupOrSheet from '../../../newComponents/models/PopupOrSheet';
import { s } from '../../../constants/theme/scale';
import ImageUri from '../../../newComponents/imageComponents/image';
import { COMMON_SVG_URLS } from '../../../assets/blobUrls';


const UserPersonalInformation: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const NEW_COLOR = useMemo(() => useThemeColors(), []);
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  const REVERSE_COLOR = useMemo(() => useThemeColors(true), []);
  const reverseCommonStyles = useMemo(() => getThemedCommonStyles(REVERSE_COLOR), [REVERSE_COLOR]);
  const cardId = route.params?.cardId;
  const kycFormData = useSelector((state: any) => state.cardsReducer?.kycFormData);
  const kycApiResponseData = useSelector((state: any) => state.cardsReducer?.kycApiResponseData);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false);
  const [error, setError] = useState('');
  const [countries, setCountries] = useState<any[]>([]);
  const [initialValues, setInitialValues] = useState<FormValues | null>(null);
  const rbSheetRef = useRef<any>(null);
  const { decryptAES } = useEncryptDecrypt();
  useEffect(() => {
    if (!initialLoadComplete && cardId) {
      fetchKycData();
    }
  }, [cardId, initialLoadComplete]);

  useHardwareBackHandler(() => {
    confirmCancel();
  });

  const fetchKycData = useCallback(async () => {
    setLoading(true);
    try {
      const response: any = await cardsService.getKycRequirements(cardId);
      if (response?.status === 200) {
        setError('');
        const apiData = response.data;
        // Decrypt API response fields
        const decryptedApiData = {
          ...apiData,
          firstName: decryptAES(apiData?.firstName) || '',
          lastName: decryptAES(apiData?.lastName) || '',
          addressLine1: apiData?.addressLine1 || '',
          addressLine2: apiData?.addressLine2 || '',
          country: apiData?.country || '',
          state: apiData?.state || '',
          city: apiData?.city || '',
          pincode: decryptAES(apiData?.postalCode) || apiData?.postalCode || '',
          phoneCode: decryptAES(apiData?.mobileCode) || apiData?.mobileCode || '',
          phoneNumber: decryptAES(apiData?.mobile) || apiData?.mobile || '',
          email: decryptAES(apiData?.email) || apiData?.email || '',
          dob: (() => {
            try {
              const rawDob = decryptAES(apiData?.dob) || apiData?.dob;
              return rawDob ? new Date(rawDob).toISOString() : '';
            } catch (e) {
              return '';
            }
          })(),
          employmentStatus: apiData?.employmentStatus || '',
          occupation: apiData?.occupation || '',
          annualSalary: apiData?.annualSalary || '',
          estimatedMonthlyValue: apiData?.estimatedMonthlyValue || '',
        };

        // Store API response in separate reducer
        dispatch(setKycApiResponseData(decryptedApiData));

        // Set initial form values: use API data if available, otherwise use form data or empty
        const mergedInitialValues: FormValues = {
          firstName: decryptedApiData.firstName || kycFormData?.firstName || '',
          lastName: decryptedApiData.lastName || kycFormData?.lastName || '',
          addressLine1: decryptedApiData.addressLine1 || kycFormData?.addressLine1 || '',
          addressLine2: decryptedApiData.addressLine2 || kycFormData?.addressLine2 || '',
          country: decryptedApiData.country || kycFormData?.country || '',
          state: decryptedApiData.state || kycFormData?.state || '',
          city: decryptedApiData.city || kycFormData?.city || '',
          pincode: decryptedApiData.pincode || kycFormData?.pincode || '',
          dob: decryptedApiData.dob ? new Date(decryptedApiData.dob) : (kycFormData?.dob ? new Date(kycFormData.dob) : null),
        };

        setInitialValues(mergedInitialValues);

        // Fetch countries list
        await fetchCountries();
        setInitialLoadComplete(true);
      } else {
        setError(isErrorDispaly(response));
      }
    } catch (err) {
      setError(isErrorDispaly(err));
    } finally {
      setLoading(false);
    }
  }, [cardId, dispatch, decryptAES]);

  const fetchCountries = useCallback(async () => {
    try {
      const response: any = await cardsService.getcountriesList();
      if (response?.status === 200 && Array.isArray(response.data)) {
        setCountries(response.data);
      } else {
        setError(isErrorDispaly(response));
      }
    } catch (err) {
      setError(isErrorDispaly(err));
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
      navigation.navigate('ContactInformation', { cardId });
    } catch (err) {
      setError(isErrorDispaly(err));
    }
  }, [dispatch, navigation, cardId]);

  const handleCancel = useCallback(() => {
    rbSheetRef.current?.close();
    // Clear KYC form data when user cancels/back
    dispatch(resetKycFormData());
    navigation.navigate('SupportedCountry', { cardId, animation: 'slide_from_left' });
  }, [dispatch, navigation, cardId]);
  const confirmCancel = useCallback(() => {
    rbSheetRef.current?.open();
  }, [])
  const validationSchema = useMemo(
    () => getValidationSchema(GETTING_STARTED_SCREENS.SCREEN_1),
    []
  );
  const ClosePopup = () => {
    rbSheetRef.current?.close()
  }
  // Initialize values: use merged API + form data if loaded, otherwise use defaults
  const formInitialValues: FormValues = useMemo(
    () => initialValues || {
      firstName: INITIAL_FORM_VALUES.firstName,
      lastName: INITIAL_FORM_VALUES.lastName,
      addressLine1: INITIAL_FORM_VALUES.addressLine1,
      addressLine2: INITIAL_FORM_VALUES.addressLine2,
      country: INITIAL_FORM_VALUES.country,
      state: INITIAL_FORM_VALUES.state,
      city: INITIAL_FORM_VALUES.city,
      pincode: INITIAL_FORM_VALUES.pincode,
      dob: INITIAL_FORM_VALUES.dob,
    },
    [initialValues]
  );

  // Check if all required fields on this screen are filled
  const isScreenValid = useCallback((values: FormValues): boolean => {
    return !!(
      values.firstName?.trim() &&
      values.lastName?.trim() &&
      values.addressLine1?.trim() &&
      values.country &&
      values.state?.trim() &&
      values.city?.trim() &&
      values.pincode?.trim() &&
      values.dob
    );
  }, []);

  return (
    <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
      <Container>
        <PageHeader
          title="GLOBAL_CONSTANTS.GETTING_STARTED"
          onBackPress={confirmCancel}
          disable={loading}
        />
        {loading && (
          <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <SwokipayDashboardLoader />
          </ViewComponent>
        )}
        {!loading && (
          <Formik
            initialValues={formInitialValues}
            validationSchema={validationSchema}
            onSubmit={handleContinue}
            enableReinitialize
            validateOnChange={true}
            validateOnBlur={true}
          >
            {({ values, isSubmitting }) => (
              <>
                {error && <ErrorComponent message={error} screen={true} />}
                <KeyboardAwareScrollView
                  contentContainerStyle={[{ flexGrow: 1 }]}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  enableOnAndroid={true}
                >   
                 <ViewComponent style={[]}>
                    <TextMultiLanguage
                      text={"GLOBAL_CONSTANTS.PLEASE_FILL_FIRST_LAST_DOB"}
                      style={[commonStyles.textGrey, commonStyles.fs14_24, commonStyles.fw400, commonStyles.mb24]}
                    />
                    {/* First Name */}
                    <FormikTextInput
                      name="firstName"
                      label="GLOBAL_CONSTANTS.FIRST_NAME"
                      placeholder="GLOBAL_CONSTANTS.ENTER_FIRST_NAME"
                      isRequired={true}
                      editable={!kycApiResponseData?.firstName}
                    />
                    <ViewComponent style={[commonStyles.formItemSpace]} />

                    {/* Last Name */}
                    <FormikTextInput
                      name="lastName"
                      label="GLOBAL_CONSTANTS.LAST_NAME"
                      placeholder="GLOBAL_CONSTANTS.ENTER_LAST_NAME"
                      isRequired={true}
                      editable={!kycApiResponseData?.lastName}
                    />
                    <ViewComponent style={[commonStyles.formItemSpace]} />

                    {/* Address Line 1 */}
                    <FormikTextInput
                      name="addressLine1"
                      label="GLOBAL_CONSTANTS.ADDRESS_LINE"
                      placeholder="GLOBAL_CONSTANTS.ENTER_ADDRESS"
                      isRequired={true}
                      editable={!kycApiResponseData?.addressLine1}
                    />
                    <ViewComponent style={[commonStyles.formItemSpace]} />

                    {/* Address Line 2 (Optional) */}
                    <FormikTextInput
                      name="addressLine2"
                      label="GLOBAL_CONSTANTS.ADDRESS_LINE_2"
                      placeholder="GLOBAL_CONSTANTS.ENTER_ADDRESS_LINE_2"
                      isRequired={false}
                      editable={!kycApiResponseData?.addressLine2}
                    />
                    <ViewComponent style={[commonStyles.formItemSpace]} />

                    {/* Country Picker */}
                    <Field
                      name="country" 
                      component={CustomPickerModal} 
                      data={countries} 
                      label={'GLOBAL_CONSTANTS.COUNTRY'} 
                      isRequired={true} 
                      placeholder={'GLOBAL_CONSTANTS.SELECT_COUNTRY'} 
                      disabled={!!kycApiResponseData?.country}
                    />
                     <ViewComponent style={[commonStyles.formItemSpace]} />
                    {/* City */}
                    <FormikTextInput
                      name="state"
                      label="GLOBAL_CONSTANTS.STATE_"
                      placeholder="GLOBAL_CONSTANTS.STATE_PLACEHOLDER"
                      isRequired={true}
                      editable={!kycApiResponseData?.state}
                    />
                    <ViewComponent style={[commonStyles.formItemSpace]} />

                    {/* City */}
                    <FormikTextInput
                      name="city"
                      label="GLOBAL_CONSTANTS.CITY"
                      placeholder="GLOBAL_CONSTANTS.ENTER_CITY"
                      isRequired={true}
                      editable={!kycApiResponseData?.city}
                    />
                    <ViewComponent style={[commonStyles.formItemSpace]} />

                    {/* Pincode */}
                    <FormikTextInput
                      name="pincode"
                      label="GLOBAL_CONSTANTS.PINCODE"
                      placeholder="GLOBAL_CONSTANTS.ENTER_PINCODE"
                      isRequired={true}
                      keyboardType="numeric"
                      editable={!kycApiResponseData?.pincode}
                    />
                    <ViewComponent style={[commonStyles.formItemSpace]} />

                    {/* Date of Birth */}
                    <DatePickerComponent
                      name="dob"
                      label="GLOBAL_CONSTANTS.DATE_OF_BIRTH"
                      placeholder="GLOBAL_CONSTANTS.SELECT_DOB"
                      required={true}
                      maximumDate={new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate())}
                      disabled={!!kycApiResponseData?.dob}
                    />
                    <ViewComponent style={[commonStyles.sectionGap]} />
                  </ViewComponent>

                  {/* Continue Button */}
                  <ViewComponent style={[]}>
                    <ButtonComponent
                      title="GLOBAL_CONSTANTS.CONTINUE"
                      onPress={() => handleContinue(values)}
                      loading={isSubmitting}
                      disable={!isScreenValid(values) || isSubmitting || loading}
                    />
                    <ViewComponent style={[commonStyles.mb16]} />
                    {/* Cancel Button */}
                    <ButtonComponent
                      title="GLOBAL_CONSTANTS.CANCEL"
                      onPress={confirmCancel}
                      loading={isSubmitting}
                      disable={isSubmitting || loading}
                      solidBackground={true}
                    />
                  </ViewComponent>
                  <ViewComponent style={[commonStyles.sectionGap]} />
                </KeyboardAwareScrollView>
              </>
            )}
          </Formik>
        )}
      </Container>
      <PopupOrSheet ref={rbSheetRef} height={s(300)} closeOnPressMask={false} showCloseIcon={false} showCloseIconAndTittle={false}>
        <ViewComponent style={[commonStyles.alignCenter]}>
          <ViewComponent>
            <ViewComponent
              style={[commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mb16]}>
              <ImageUri uri={COMMON_SVG_URLS?.alert_Icon} width={s(90)} height={s(70)} />
            </ViewComponent>
            <TextMultiLanguage
              style={[commonStyles.fs16, commonStyles.fw700, reverseCommonStyles.textWhite, commonStyles.textCenter, commonStyles.mb16]} text={"GLOBAL_CONSTANTS.ARE_YOU_SURE_YOU_WANT_TO_GO_BACK"} />
            <TextMultiLanguage
              style={[commonStyles.fs14, commonStyles.fw400, reverseCommonStyles.textWhite, commonStyles.textCenter, commonStyles.mb32]} text={"GLOBAL_CONSTANTS.ANY_UNSAVED_DETAILS_MAY_BE_LOST"} />
          </ViewComponent>
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
            <ViewComponent style={[commonStyles.flex1]}>
              <ButtonComponent
                title={"GLOBAL_CONSTANTS.STAY_ON_PAGE"}
                onPress={ClosePopup}
                capitalizeTitle={false}
              />
            </ViewComponent>
            <ViewComponent style={[commonStyles.flex1]}>
              <ButtonComponent
                title={"GLOBAL_CONSTANTS.GO_BACK"}
                onPress={handleCancel}
                capitalizeTitle={false}
                solidBackground={true}
              />
            </ViewComponent>
          </ViewComponent>
        </ViewComponent>
      </PopupOrSheet>
    </ViewComponent>
  );
};

export default UserPersonalInformation;
