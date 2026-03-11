// --- 1. ADD THESE IMPORTS ---
import React, { useEffect, useState, useRef } from 'react'; // Make sure useRef is imported
import { Keyboard, View, LayoutChangeEvent } from 'react-native'; // Import these
import { useThemeColors } from '../../../hooks/useThemeColors';
import ButtonComponent from '../../../newComponents/buttons/button';
import { Formik, Field, FormikErrors } from 'formik'; // Make sure FormikErrors is imported
import FormikTextInput from '../../../newComponents/textInputComponents/formik/textInput';
import CustomPickerModal from '../../../newComponents/pickerComponents/formik/customPicker';
import { s } from '../../../constants/theme/scale';
import ViewComponent from '../../../newComponents/view/view';
import Container from '../../../newComponents/container/container';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { AddressFormProps, AddressFormRouteParams, addressValidationSchema } from './addressSchema';
import OnboardingService from '../../../services/onboarding';
import { showAppToast } from '../../../newComponents/ToasterMessages/ShowMessage';
import { isErrorDispaly } from '../../../utils/helpers';
import { setBillingAddress, setShippingAddress } from '../../../redux/actions/cardActions';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import { cardsService } from '../../../apiServices/cardsApis/cardsApiServices';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import SwokipayDashboardLoader from '../../../newComponents/swokipayloader';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import useEncryptDecrypt from '../../../hooks/encDecHook';
import ImageUri from '../../../newComponents/imageComponents/image';
import { COMMON_SVG_URLS } from '../../../assets/blobUrls';
import { useLngTranslation } from '../../../hooks/useLngTranslation';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';

const AddressForm: React.FC<AddressFormProps> = () => {
  // All your existing hooks and state remain unchanged
  const route = useRoute<any & { params?: AddressFormRouteParams }>();
  const addressType = route?.params?.addressType || 'billing';
  const mode = route?.params?.mode || 'edit'; // add | edit | change
  const fromScreen = route?.params?.fromScreen || ''; // can be 'CardSettings'
  const activeCard = route?.params?.activeCard
  const billingAddress = useSelector((state: any) => state.cardsReducer?.billingAddress);
  const shippingAddress = useSelector((state: any) => state.cardsReducer?.shippingAddress);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [countryList, setCountryList] = useState<{ cardId: string; name: string; isCountryRestrict?: boolean }[]>([]);
  const [loading, setLoading] = useState(false)
  const [btnLoading, setBtnLoading] = useState(false);
  const { decryptAES, encryptAES } = useEncryptDecrypt();
  const userInfo = useSelector((state: any) => state?.userReducer?.userDetails);
  const { t } = useLngTranslation();
  const [error, setError] = useState<string>("");
  const decryptedCardHolderName = decryptAES(userInfo?.firstName || "") + ' ' + decryptAES(userInfo?.lastName || "") || '';

  const defaultAddressInitialValues = {
    cardholderName: decryptedCardHolderName,
    country: userInfo?.country || '',
    address1: '',
    address2: '',
    state: '',
    town: "",
    city: '',
    postalCode: '',
  };

  const [initialValues, setInitialValues] = useState(defaultAddressInitialValues);

  useHardwareBackHandler(() => {
    handleBackPress();
    return true;
  });

  // --- 2. ADD THIS SECTION FOR SCROLLING ---
  type AddressValues = typeof defaultAddressInitialValues;
  const scrollRef = useRef<KeyboardAwareScrollView>(null);
  const fieldLayouts = useRef<{ [key in keyof AddressValues]?: number }>({}).current;

  const storeFieldLayout = (name: keyof AddressValues) => (event: LayoutChangeEvent) => {
    fieldLayouts[name] = event.nativeEvent.layout.y;
  };

  const handleFormikSubmit = (handleSubmit: () => void, errors: FormikErrors<AddressValues>) => {
    Keyboard.dismiss();
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const fieldOrder: (keyof AddressValues)[] = ['cardholderName', 'country', 'address1', 'state', 'town', 'city', 'postalCode'];
      const firstErrorField = fieldOrder.find(field => errorKeys.includes(field));
      if (firstErrorField) {
        const yPos = fieldLayouts[firstErrorField] ?? 0;
        scrollRef.current?.scrollToPosition(0, yPos, true);
      }
    }
    handleSubmit();
  };
  // --- END SECTION ---


  useEffect(() => {
    // NO CHANGES HERE
    const fetchCountries = async () => {
      try {
        const response: any = await OnboardingService.countriesList();
        if (response.status === 200) {
          setCountryList(response?.data ?? []);
        } else {
          setCountryList([]);
          setError(isErrorDispaly(response));
        }
      } catch (error) {
        setCountryList([]);
        setError(isErrorDispaly(error));
      }
    };

    const fetchAddress = async () => {
      if (fromScreen === 'CardSettings' && mode === 'change') {
        setLoading(true);
        try {
          const res: any = await cardsService.getChangeAddress(activeCard?.id);
          if (res.status === 200) {
            const formattedData = {
              ...defaultAddressInitialValues,
              ...res?.data,
              cardholderName: decryptAES(res?.data?.cardHolderName)||decryptedCardHolderName,
              address1: res?.data?.addressLine1,
              address2: res?.data?.addressLine2 || '',
              town: res?.data?.town || '',
              postalCode: decryptAES(res?.data?.postalCode),
            };
            setInitialValues(formattedData);
          } else {
            setError(isErrorDispaly(res));
          }
        } catch (err) {
          setError(isErrorDispaly(err));
        } finally {
          setLoading(false);
        }
      } else {
        if (addressType === 'billing') {
          if (billingAddress && Object.keys(billingAddress).length > 0) {
            const values = {
              ...defaultAddressInitialValues,
              ...(billingAddress || {}),
              town: mode === 'change' ? '' : (billingAddress?.town || ''),
            };
            setInitialValues(values);
          } else {
            getApplyCardDeatilsInfo();
          }
        } else if (addressType === 'shipping') {
          setInitialValues({
            ...defaultAddressInitialValues,
            ...(shippingAddress || {})
          });
        } else {
          setInitialValues(defaultAddressInitialValues);
        }
      }
    };

    fetchCountries();
    fetchAddress();
  }, [fromScreen, mode, addressType, activeCard?.cardId, billingAddress, shippingAddress]);

  // ALL YOUR OTHER FUNCTIONS (handleBackPress, handleSave, etc.) REMAIN UNCHANGED
  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSave = async (values: any) => {
    setError("");
    if (countryList.find(c => c.name === values.country)?.isCountryRestrict) {
      setError(t("GLOBAL_CONSTANTS.UNFORTUNATLY_BULLSWIPE_IS_NOT_AVAILABLE"));
      return;
    }
    const payload: any = {
      CardId: activeCard?.id,
      CardHolderName: encryptAES(values?.cardholderName),
      AddressLine1: values?.address1,
      AddressLine2: values?.address2 || "",
      City: values?.city,
      State: values?.state,
      PostalCode: encryptAES(values?.postalCode),
      Country: values?.country,
      phoneNumber: values?.phoneNumber || '',
      Town: values.town
    };
    if (addressType === 'shipping') {
      dispatch(setShippingAddress(values));
      navigation.goBack();
      return;
    } else if (addressType === 'billing' && mode === 'edit') {
      dispatch(setBillingAddress(values));
      navigation.goBack();
      return;
    }

    if (fromScreen === 'CardSettings') {
      try {
        setBtnLoading(true);
        const res = await cardsService.updateChangeAddress(activeCard?.id, payload);
        if (res.status === 200) {
          showAppToast(t("GLOBAL_CONSTANTS.YOUR_ADDRESS_HAS_BEEN_UPDATED"), 'success');
          navigation.goBack();
        } else {
          setError(isErrorDispaly(res));
        }
      } catch (error) {
        setError(isErrorDispaly(error));
      } finally {
        setBtnLoading(false);
      }
    }
  };

  let pageTitle = '';
  if (addressType === 'shipping') {
    pageTitle = "GLOBAL_CONSTANTS.SHIPPING_ADDRESS";
  } else if (addressType === 'billing' && mode === 'edit') {
    pageTitle = "GLOBAL_CONSTANTS.BILLING_ADDRESS";
  } else {
    pageTitle = "GLOBAL_CONSTANTS.CHANGE_BILLING_ADDRESS";
  }

  const handleSelectCountry = (
    value: any,
    setFieldValue: (field: string, value: any) => void,
    setFieldError: (field: string, message: string | undefined) => void
  ) => {
    Keyboard.dismiss();
    const countryName = value?.name || '';
    setFieldValue('country', countryName);
    if (value?.isCountryRestrict) {
      setFieldError('country', t("GLOBAL_CONSTANTS.YOUR_ADDRESS_HAS_BEEN_UPDATED"));
    } else {
      // Clear the error if the country is not restricted
      setFieldError('country', undefined);
    }
  };
  const getApplyCardDeatilsInfo = async () => {
    setLoading(true)
    try {
      const response: any = await cardsService.getKycRequirements(activeCard?.id)
      if (response?.status === 200) {
        setInitialValues({
          ...response?.data,
          address1: response?.data?.addressLine1,
          address2: response?.data?.addressLine2,
          postalCode: decryptAES(response?.data?.postalCode),
          cardholderName: decryptedCardHolderName,
          town: response?.data?.town || '',

        })
        setLoading(false)
      } else {
        setLoading(false)
        setError(isErrorDispaly(response));
      }
    }
    catch (error) {
      setLoading(false)
      setError(isErrorDispaly(error));
    }
  }

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container>
        <PageHeader title={pageTitle} onBackPress={handleBackPress} disable={btnLoading} />
        {error && <ErrorComponent message={error} screen={true} />}
        {loading ? <SwokipayDashboardLoader /> : (
          <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={addressValidationSchema}
            validationContext={{ mode, fromScreen, addressType }}
            onSubmit={handleSave}
          >
            {(formikProps) => {
              // Clear error when any field changes
              React.useEffect(() => {
                setError("");
              }, [formikProps.values]);

              const { handleSubmit, setFieldValue, setFieldError, errors, touched, values } = formikProps;
              const requiredFields = ['cardholderName', 'country', 'address1', 'state', 'town', 'city', 'postalCode'];
              const allRequiredFilled = requiredFields.every(field => {
                const value = values[field as keyof typeof values];
                return value != null && String(value).trim() !== '';
              });
              return (
                <ViewComponent style={{ flex: 1 }}>
                  <KeyboardAwareScrollView
                    // --- 3. MODIFY THIS COMPONENT ---
                    ref={scrollRef}
                    extraScrollHeight={s(50)}
                    enableOnAndroid
                    // --- END MODIFICATION ---
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: s(40) }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                  >
                    <ViewComponent>
                      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap12, commonStyles.mb16]}>
                        <ImageUri uri={COMMON_SVG_URLS.alertIcon} height={s(24)} width={s(24)} />                                <TextMultiLanguage text={"GLOBAL_CONSTANTS.THE_FORM_CAN_ONLY_BE_FILLED_IN_ENGLISH"} style={[commonStyles.fs14_24, commonStyles.fw400, commonStyles.textGrey]} />
                      </ViewComponent>

                      {/* --- 4. WRAP FIELDS AND MODIFY BUTTON --- */}
                      <View onLayout={storeFieldLayout('cardholderName')}>
                        <FormikTextInput name="cardholderName"
                          label={"GLOBAL_CONSTANTS.CARD_HOLDER_NAME"}
                          isRequired
                          custInput={commonStyles.inputStyle}
                          placeholder={"GLOBAL_CONSTANTS.ENTER_CARD_HOLDER_NAME"} />
                      </View>
                      <ViewComponent style={[commonStyles.formItemSpace]} />

                      <View onLayout={storeFieldLayout('country')}>
                        <Field
                          name="country"
                          component={CustomPickerModal}
                          data={countryList}
                          label={"GLOBAL_CONSTANTS.COUNTRY_REGION"}
                          placeholder={"GLOBAL_CONSTANTS.SELECT_COUNTRY"}
                          modalTitle={"GLOBAL_CONSTANTS.SELECT_COUNTRY_REGION"}
                          selectionType="name"
                          isRequired
                          onChange={(value: any) => handleSelectCountry(value, setFieldValue, setFieldError)}
                          error={touched.country && errors.country ? errors.country : undefined}
                          sheetHeight={s(500)}
                          searchPlaceholder={"GLOBAL_CONSTANTS.SEARCH_COUNTRY_REGION"}
                        />
                      </View>
                      <ViewComponent style={[commonStyles.formItemSpace]} />

                      <View onLayout={storeFieldLayout('address1')}>
                        <FormikTextInput
                          name="address1"
                          label={"GLOBAL_CONSTANTS.ADDRESS_LINE"}
                          isRequired
                          custInput={commonStyles.inputStyle}
                          placeholder={"GLOBAL_CONSTANTS.ADDRESS_LINE1_PLACEHOLDER"} />
                      </View>
                      <ViewComponent style={[commonStyles.formItemSpace]} />

                      <View onLayout={storeFieldLayout('address2')}>
                        <FormikTextInput
                          name="address2"
                          label={"GLOBAL_CONSTANTS.ADDRESS_LINE2"}
                          custInput={commonStyles.inputStyle}
                          placeholder={"GLOBAL_CONSTANTS.ADDRESS_LINE2_PLACEHOLDER"} />
                      </View>
                      <ViewComponent style={[commonStyles.formItemSpace]} />

                      <View onLayout={storeFieldLayout('state')}>
                        <FormikTextInput name="state"
                          label={"GLOBAL_CONSTANTS.PROVINCE_STATE"}
                          isRequired custInput={commonStyles.inputStyle}
                          placeholder={"GLOBAL_CONSTANTS.ENTER_PROVINCE_STATE"} />
                      </View>
                      <ViewComponent style={[commonStyles.formItemSpace]} />

                      <View onLayout={storeFieldLayout('town')}>
                        <FormikTextInput
                          name="town"
                          label={"GLOBAL_CONSTANTS.TOWN"}
                          custInput={commonStyles.inputStyle}
                          isRequired
                          placeholder={"GLOBAL_CONSTANTS.TOWN_PLACEHOLDER"} />
                      </View>
                      <ViewComponent style={[commonStyles.formItemSpace]} />

                      <View onLayout={storeFieldLayout('city')}>
                        <FormikTextInput name="city"
                          label={"GLOBAL_CONSTANTS.CITY"}
                          isRequired
                          custInput={commonStyles.inputStyle}
                          placeholder={"GLOBAL_CONSTANTS.ENTER_CITY"} />
                      </View>
                      <ViewComponent style={[commonStyles.formItemSpace]} />

                      <View onLayout={storeFieldLayout('postalCode')}>
                        <FormikTextInput name="postalCode"
                          label={"GLOBAL_CONSTANTS.POSTAL_ZIP_CODE"}
                          isRequired
                          custInput={commonStyles.inputStyle}
                          placeholder={"GLOBAL_CONSTANTS.ENTER_POSTAL_ZIP_CODE"}
                          autoCapitalize="characters"
                          maxLength={10}
                        />
                      </View>
                      <ViewComponent style={[commonStyles.sectionGap]} />

                      <ButtonComponent title={"GLOBAL_CONSTANTS.SAVE"}
                        onPress={() => handleFormikSubmit(handleSubmit, errors)}
                        loading={btnLoading}
                        disable={btnLoading || !allRequiredFilled || Object.keys(errors).length > 0}
                      />
                      <ViewComponent style={[commonStyles.sectionGap]} />
                      {/* --- END WRAPPERS AND BUTTON MODIFICATION --- */}
                    </ViewComponent>
                  </KeyboardAwareScrollView>
                </ViewComponent>
              );
            }}
          </Formik>
        )}
      </Container>
    </ViewComponent>
  );
};

export default AddressForm;