import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Field, Formik } from 'formik';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Container from '../../../newComponents/container/container';
import ViewComponent from '../../../newComponents/view/view';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import ButtonComponent from '../../../newComponents/buttons/button';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';
import FormikTextInput from '../../../newComponents/textInputComponents/formik/textInput';
import CustomPickerModal from '../../../newComponents/pickerComponents/formik/customPicker';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import { useLngTranslation } from '../../../hooks/useLngTranslation';
import { cardsService } from '../../../apiServices/cardsApis/cardsApiServices';
import { setKycFormData } from '../../../redux/actions/cardActions';
import { GETTING_STARTED_SCREENS, getValidationSchema, INITIAL_FORM_VALUES } from './kycFormConstants';
import { isErrorDispaly } from '../../../utils/helpers';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import { FormValues } from './interface';

const FinancialInformation: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const cardId = route.params?.cardId;
  const kycFormData = useSelector((state: any) => state.cardsReducer?.kycFormData);
  const kycApiResponseData = useSelector((state: any) => state.cardsReducer?.kycApiResponseData);
  const [submitError, setSubmitError] = useState('');
  const [occupationList, setOccupationList] = useState<any[]>([]);
  const [loadingOccupations, setLoadingOccupations] = useState(false);

  // Fetch occupation list from API
  useEffect(() => {
    fetchOccupations();
  }, []);

  useHardwareBackHandler(() => {
    handleBack();
  });

  const fetchOccupations = useCallback(async () => {
    try {
      setLoadingOccupations(true);
      const response: any = await cardsService.getOccupationsList(cardId);

      if (response?.status === 200 && Array.isArray(response.data)) {
        setOccupationList(response.data);
      } else {
        setSubmitError(isErrorDispaly(response))
      }
    } catch (err) {
      setSubmitError(isErrorDispaly(err));
    } finally {
      setLoadingOccupations(false);
    }
  }, [cardId]);

  // Employment status options (Yes/No)
  const employmentOptions = [
    { name: 'Yes', code: 'Yes', label: 'Yes' },
    { name: 'No', code: 'No', label: 'No' },
  ];

  const handleContinue = useCallback((values: FormValues) => {
    try {
      setSubmitError('');
      const completeFormData = {
        ...kycFormData,
        employmentStatus: values.employmentStatus,
        occupation: values.occupation,
        annualSalary: values.annualSalary,
        estimatedMonthlyValue: values.estimatedMonthlyValue,
        accountPurpose: values.accountPurpose,
      };

      dispatch(setKycFormData(completeFormData));
      const card = route.params?.card;
      navigation.navigate('ApplyCardAllSet', { cardId, card });
    } catch (err: any) {
      setSubmitError(isErrorDispaly(err));
    }
  }, [kycFormData, cardId, dispatch, navigation, route.params?.card, t]);

  const handleBack = useCallback(() => {
    navigation.navigate('ContactInformation', { cardId: cardId, animation: 'slide_from_left' });
  }, [navigation, cardId, kycFormData, dispatch]);

  const validationSchema = useMemo(() => getValidationSchema(GETTING_STARTED_SCREENS.SCREEN_3), []);

  // Initialize values: use API data for employment fields if available, otherwise use form data or defaults
  const initialValues: FormValues = useMemo(() => ({
    employmentStatus: kycApiResponseData?.employmentStatus || kycFormData?.employmentStatus || INITIAL_FORM_VALUES.employmentStatus,
    occupation: kycApiResponseData?.occupation || kycFormData?.occupation || INITIAL_FORM_VALUES.occupation,
    annualSalary: kycApiResponseData?.annualSalary || kycFormData?.annualSalary || INITIAL_FORM_VALUES.annualSalary,
    estimatedMonthlyValue: kycApiResponseData?.estimatedMonthlyValue || kycFormData?.estimatedMonthlyValue || INITIAL_FORM_VALUES.estimatedMonthlyValue,
    firstName: kycFormData?.firstName,
    lastName: kycFormData?.lastName,
    addressLine1: kycFormData?.addressLine1,
    addressLine2: kycFormData?.addressLine2,
    country: kycFormData?.country,
    state: kycFormData?.state,
    city: kycFormData?.city,
    pincode: kycFormData?.pincode,
    dob: kycFormData?.dob ? (typeof kycFormData.dob === 'string' ? new Date(kycFormData.dob) : kycFormData.dob) : null,
    phoneCode: kycFormData?.phoneCode,
    phoneNumber: kycFormData?.phoneNumber,
    email: kycFormData?.email,
    accountPurpose: kycFormData?.accountPurpose,
  }), [kycApiResponseData, kycFormData]);

  // Check if all required fields on this screen are filled
  const isScreenValid = useCallback((values: FormValues): boolean => {
    return !!(
      values.employmentStatus?.trim() &&
      values.occupation?.trim() &&
      values.annualSalary?.trim() &&
      values.estimatedMonthlyValue?.trim()&&
      values.accountPurpose?.trim()
    );
  }, []);

  return (
    <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
      <Container>
        <PageHeader
          title="GLOBAL_CONSTANTS.GETTING_STARTED"
          onBackPress={handleBack}
          disable={loadingOccupations}
        />

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleContinue}
          enableReinitialize
          validateOnChange={true}
          validateOnBlur={true}
        >
          {({ values, isSubmitting }) => {

            return (
              <>
                <KeyboardAwareScrollView
                  contentContainerStyle={[{ flexGrow: 1 }]}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  enableOnAndroid={true}
                >
                  <ViewComponent style={[]}>
                    {submitError && <ErrorComponent message={submitError}/>}
                    <TextMultiLanguage text="GLOBAL_CONSTANTS.PLEASE_FILL_OCCUPATION_FUNDING" style={[commonStyles.textGrey, commonStyles.fs14_24, commonStyles.fw400,commonStyles.mb16]} />
                    {/* Employment Status - Yes/No Dropdown */}
                    <Field
                      name="employmentStatus"
                      component={CustomPickerModal}
                      data={employmentOptions}
                      label={'GLOBAL_CONSTANTS.ARE_YOU_CURRENTLY_EMPLOYED'}
                      isRequired={true}
                      placeholder={'GLOBAL_CONSTANTS.SELECT_EMPLOYMENT_STATUS'}
                      disabled={!!kycApiResponseData?.employmentStatus}
                      selectionType="code"
                      modalTitle={'GLOBAL_CONSTANTS.ARE_YOU_CURRENTLY_EMPLOYED'}
                      searchPlaceholder={'GLOBAL_CONSTANTS.SEARCH_EMPLOYMENT_STATUS'}
                    />
                    <ViewComponent style={[commonStyles.formItemSpace]} />
                    {/* Occupation Dropdown - Using API */}
                    <Field
                      name="occupation"
                      component={CustomPickerModal}
                      data={occupationList}
                      label={'GLOBAL_CONSTANTS.OCCUPATION'}
                      isRequired={true}
                      placeholder={'GLOBAL_CONSTANTS.SELECT_OCCUPATION'}
                      disabled={!!kycApiResponseData?.occupation }
                      selectionType="code"
                      modalTitle={'GLOBAL_CONSTANTS.SELECT_OCCUPATION'}
                      searchPlaceholder={'GLOBAL_CONSTANTS.SEARCH_OCCUPATION'}
                    />
                    <ViewComponent style={[commonStyles.formItemSpace]} />

                     <FormikTextInput
                      name="accountPurpose"
                      label="GLOBAL_CONSTANTS.ACCOUNT_PURPOSE"
                      placeholder="GLOBAL_CONSTANTS.ENTER_ACCOUNT_PURPOSE"
                      isRequired={true}
                      maxLength={50}
                    />
                    <ViewComponent style={[commonStyles.formItemSpace]} /> 
                    {/* Annual Salary - Text Input */}
                    <FormikTextInput
                      name="annualSalary"
                      label="GLOBAL_CONSTANTS.ANNUAL_SALARY"
                      placeholder="GLOBAL_CONSTANTS.ENTER_ANNUAL_SALARY"
                      keyboardType="decimal-pad"
                      isRequired={true}
                      editable={!kycApiResponseData?.annualSalary}
                      isNumber={true}
                      isDecimal={true}
                    />
                    <ViewComponent style={[commonStyles.formItemSpace]} />

                    {/* Estimated Monthly Value - Text Input */}
                    <FormikTextInput
                      name="estimatedMonthlyValue"
                      label="GLOBAL_CONSTANTS.ESTIMATED_MONTHLY_VALUE"
                      placeholder="GLOBAL_CONSTANTS.ENTER_MONTHLY_VALUE"
                      keyboardType="decimal-pad"
                      isRequired={true}
                      editable={!kycApiResponseData?.estimatedMonthlyValue}
                      isNumber={true}
                      isDecimal={true}
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
                      disable={!isScreenValid(values) || isSubmitting || loadingOccupations}
                    />

                    <ViewComponent style={[commonStyles.mb16]} />
                    {/* Cancel Button */}
                    <ButtonComponent
                      title="GLOBAL_CONSTANTS.CANCEL"
                      onPress={handleBack}
                      loading={isSubmitting}
                      disable={isSubmitting || loadingOccupations}
                      solidBackground={true}
                    />
                  </ViewComponent>
                  <ViewComponent style={[commonStyles.sectionGap]} />
                </KeyboardAwareScrollView>
              </>
            );
          }}
        </Formik>
      </Container>
    </ViewComponent>
  );
};

export default FinancialInformation;
