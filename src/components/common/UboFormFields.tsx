import React, { useMemo } from "react";
import { View, TextInput } from "react-native";
import { Field, Formik, FormikValues } from "formik";
import InputDefault from '../textInputComponents/DefaultFiat';
import CustomPicker from "../customPicker/CustomPicker";
import FileUpload from "../fileUpload/fileUpload";
import PhoneCodePicker from "../phonePicker/phonePicker";
import ViewComponent from "../view/view";
import { useThemeColors } from "../../hooks/themedHook/useThemeColors";
import { getThemedCommonStyles } from "../CommonStyles";
import { useLngTranslation } from "../../hooks/languagesHook/useLngTranslation";
import { FORM_FIELD, KYB_INFO_CONSTANTS } from "../../screens/fintechApp/onboarding/kyb/constants";
import { getKybAddUobsSchema } from "../../screens/fintechApp/onboarding/schema";
import LabelComponent from "../textComponets/lableComponent/lable";
import ParagraphComponent from "../textComponets/paragraphText/paragraph";
import DatePickerComponent from "../datePickers/formik/datePicker";
import useCountryData from "../../hooks/countryDataHook/useCountryData";
import { s } from "../../constants/styels/scale";
import InfoTooltip from "../tooltip/InfoTooltip";
import TextMultiLanguage from "../textComponets/multiLanguageText/textMultiLangauge";
import AddIcon from "../addCommonIcon/addCommonIcon";

interface UboFormComponentProps {
  onSubmit: (values: FormikValues) => void;
  initialValues: any;
  countryCodelist: any[];
  countryList: any[];
  documentTypesLookUp: any[];
  imagesLoader: { frontId: boolean; backImgId: boolean };
  fileNames: { frontId: string | null; backImgId: string | null };
  onUploadImg: (item: string, setFieldValue: any, source?: 'camera' | 'library') => void;
  deleteImage: (fileName: string, setFieldValue: any) => void;
  innerRef: any;
  maxDate?: Date;
  loading?: boolean;
  onValidationError?: (message: string) => void;
  onFormReady?: (formActions: { validateForm: () => Promise<any>; setTouched: (touched: any) => void; handleSubmit: () => void; setFieldValue: (field: string, value: any) => void }) => void;
  onCountryChange?: (country: string) => void;
  screenName?: string;
  isDcoumentExpDate?: boolean;
  addressesList?: any[];
  hideAddressField?: boolean;
  onAddAddress?: () => void;
}

const UboFormComponent: React.FC<UboFormComponentProps> = ({
  onSubmit,
  initialValues,
  countryCodelist,
  countryList,
  documentTypesLookUp,
  imagesLoader,
  fileNames,
  onUploadImg,
  deleteImage,
  innerRef,
  maxDate,
  loading = false,
  onValidationError,
  onFormReady,
  onCountryChange,
  screenName,
  isDcoumentExpDate = true,
  addressesList = [],
  hideAddressField = false,
  onAddAddress
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  const { t } = useLngTranslation();
  const { countryPickerData, phoneCodePickerData, loading: countryLoading, error: countryError, clearCache } = useCountryData({ loadCountries: true, loadPhoneCodes: true });

  const previousCountryRef = React.useRef<string>('');
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={getKybAddUobsSchema(screenName, isDcoumentExpDate, hideAddressField)}
      onSubmit={onSubmit}
      enableReinitialize={true}
      validateOnChange={true}
      validateOnBlur={false}
    >
      {({ handleSubmit, touched, errors, handleBlur, values, setFieldValue, handleChange, validateForm, setTouched }) => {
        // Expose form actions to parent
        React.useEffect(() => {
          onFormReady?.({ validateForm, setTouched, handleSubmit, setFieldValue });
        }, [validateForm, setTouched, handleSubmit, setFieldValue, onFormReady]);

        // Monitor country changes only for PayoutUboForm
        React.useEffect(() => {
          if (screenName === 'PayoutUboForm' && values.country !== previousCountryRef.current) {
            previousCountryRef.current = values.country;
            if (values.country && onCountryChange) {
              onCountryChange(values.country);
            }
          }
        }, [values.country, onCountryChange, screenName]);
        return (
          <>
            <Field
              touched={touched?.firstName}
              name={FORM_FIELD.FIRST_NAME}
              label={"GLOBAL_CONSTANTS.FIRST_NAME"}
              error={errors?.firstName}
              handleBlur={handleBlur}
              placeholder={"GLOBAL_CONSTANTS.FIRST_NAME_PLACEHOLDER"}
              component={InputDefault}
              innerRef={innerRef}
              requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
            />
            <View style={commonStyles.formItemSpace} />

            <Field
              touched={touched?.middleName}
              name={FORM_FIELD.MIDLE_NAME}
              label={"GLOBAL_CONSTANTS.MIDLE_NAME"}
              error={errors?.middleName}
              handleBlur={handleBlur}
              placeholder={"GLOBAL_CONSTANTS.MIDLE_NAME_PLACEHOLDER"}
              component={InputDefault}
              innerRef={innerRef}
            />
            <View style={commonStyles.formItemSpace} />

            <Field
              touched={touched?.lastName}
              name={FORM_FIELD.LAST_NAME}
              label={"GLOBAL_CONSTANTS.LAST_NAME"}
              error={errors?.lastName}
              handleBlur={handleBlur}
              placeholder={"GLOBAL_CONSTANTS.LAST_NAME_PLACEHOLDER"}
              component={InputDefault}
              innerRef={innerRef}
              requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
            />
            <View style={commonStyles.formItemSpace} />

            <Field
              touched={touched?.email}
              name={FORM_FIELD.EMAIL}
              label={"GLOBAL_CONSTANTS.EMAIL"}
              error={errors?.email}
              handleBlur={handleBlur}
              placeholder={"GLOBAL_CONSTANTS.EMAIL_PLACEHOLDER"}
              component={InputDefault}
              innerRef={innerRef}
              requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
            />
            <View style={commonStyles.formItemSpace} />

            <Field
              touched={touched?.country}
              name={FORM_FIELD.COUNTRY}
              label={"GLOBAL_CONSTANTS.COUNTRY"}
              error={errors?.country}
              handleBlur={handleBlur}
              placeholder={"GLOBAL_CONSTANTS.SELECT_COUNTRY"}
              component={CustomPicker}
              data={countryPickerData || []}
              innerRef={innerRef}
              requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
            />
            <View style={commonStyles.formItemSpace} />

            <Field
              activeOpacity={0.9}
              touched={touched?.shareHolderPercentage}
              name={FORM_FIELD.SHARE_HOLDER_PERCENTAGE}
              label={"GLOBAL_CONSTANTS.SHARE_HOLDER_PERCENTAGE"}
              error={errors?.shareHolderPercentage}
              handleBlur={handleBlur}
              customContainerStyle={{ height: 80 }}
              placeholder={"GLOBAL_CONSTANTS.SHARE_HOLDER_PERCENTAGE_PLACEHOLDER"}
              component={InputDefault}
              innerRef={innerRef}

              autoCapitalize="words"
              keyboardType={KYB_INFO_CONSTANTS.NUMURIC_KEYPAD}
              requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
            />
            <View style={commonStyles.formItemSpace} />

            <DatePickerComponent
              name={FORM_FIELD.DATE_OF_BIRTH}
              label={"GLOBAL_CONSTANTS.DATE_OF_BIRTH"}
              maximumDate={maxDate}
            />
            <View style={commonStyles.formItemSpace} />

            <LabelComponent style={[commonStyles.inputLabel]} text={"GLOBAL_CONSTANTS.PHONE_NUMBER"}>
              <ParagraphComponent style={[commonStyles.textRed]} text={FORM_FIELD.START_REQUIRED} />
            </LabelComponent>

            <ViewComponent style={[commonStyles.relative, commonStyles.dflex]}>
              <PhoneCodePicker
                inputStyle={{
                  borderRightWidth: 0,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  borderColor: touched?.phoneCode && errors?.phoneCode ? NEW_COLOR.TEXT_RED : NEW_COLOR.INPUT_BORDER
                }}
                modalTitle={"GLOBAL_CONSTANTS.SELECT_PHONE_CODE"}
                customBind={['name', '(', 'code', ')']}
                data={phoneCodePickerData || []}
                placeholder={"GLOBAL_CONSTANTS.SELECT"}
                value={values.phoneCode}
                onChange={(item) => setFieldValue(FORM_FIELD.PHONE_CODE, item.code)}
                isOnlycountry={true}
              />

              <View style={[commonStyles.flex1, commonStyles.pr2]}>
                <TextInput
                  style={[
                    commonStyles.textInput, commonStyles.phonecodeplaceholder,
                    {
                      borderBottomLeftRadius: 0,
                      borderTopLeftRadius: 0,
                      borderColor: touched?.phoneNumber && errors?.phoneNumber ? NEW_COLOR.TEXT_RED : NEW_COLOR.INPUT_BORDER
                    }
                  ]}
                  placeholder={t("GLOBAL_CONSTANTS.PHONE_NUMBER_PLACEHOLDER")}
                  onChangeText={(text) => {
                    const formattedText = text.replace(/[^0-9]/g, "").slice(0, 13);
                    handleChange(FORM_FIELD.PHONE_NUMBER)(formattedText);
                  }}
                  onBlur={handleBlur(FORM_FIELD.PHONE_NUMBER)}
                  value={values.phoneNumber}
                  placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                  keyboardType={FORM_FIELD.PHONE_PAD as any}
                />
              </View>
            </ViewComponent>

            {(touched.phoneCode && errors.phoneCode || touched.phoneNumber && errors.phoneNumber) &&
              <ParagraphComponent style={[commonStyles.textRed]} text={errors.phoneCode || errors?.phoneNumber} />
            }

            {!hideAddressField && (
              <>
                <ViewComponent style={[commonStyles.formItemSpace]} />
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.titleSectionGap]}>
                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                    <TextMultiLanguage style={[commonStyles.sectionTitle]} text={"GLOBAL_CONSTANTS.ADDRESS_INFO"} />
                    <InfoTooltip
                      tooltipText="GLOBAL_CONSTANTS.PLEASE_SELECT_AT_LEAST_ONE_ADDRESS"
                      linkText=""
                      linkUrl=""
                      verticalGap={s(5)}
                      arrowXPosition={s(10)}
                    />
                  </ViewComponent>
                  <ViewComponent style={[commonStyles.actioniconbg]}>
                    <AddIcon onPress={() => {
                      onAddAddress?.();
                    }} />
                  </ViewComponent>
                </ViewComponent>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.mb10]}>
                  <LabelComponent style={[commonStyles.inputLabel]} text={t("GLOBAL_CONSTANTS.ADDRESS_INFO")} children={<ParagraphComponent style={[commonStyles.textRed]} text={' *'} />} />
                </ViewComponent>
                <Field
                  activeOpacity={0.9}
                  touched={touched?.address}
                  name={'address'}
                  error={errors?.address}
                  handleBlur={handleBlur}
                  customContainerStyle={{ height: 80 }}
                  data={addressesList || []}
                  placeholder={"GLOBAL_CONSTANTS.SELECT_ADDRESS"}
                  placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                  component={CustomPicker}
                  modalTitle={"GLOBAL_CONSTANTS.SELECT_ADDRESS"}
                  onChange={(value: string) => {
                    setFieldValue('address', value);
                  }}
                  requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                />
              </>
            )}
            <View style={commonStyles.formItemSpace} />

            <Field
              touched={touched?.note}
              name={FORM_FIELD.NOTE}
              label={"GLOBAL_CONSTANTS.NOTE_LABLE"}
              error={errors?.note}
              handleBlur={handleBlur}
              placeholder={"GLOBAL_CONSTANTS.NOTE_PLACEHOLDER"}
              component={InputDefault}
              innerRef={innerRef}
            />
            <View style={commonStyles.formItemSpace} />

            <ParagraphComponent
              style={[commonStyles.fs24, commonStyles.fw600, commonStyles.textWhite]}
              text={"GLOBAL_CONSTANTS.UPLOAD_THE_DOCUMENTS"}
            />
            <View style={[commonStyles.mt24]} />

            <Field
              activeOpacity={0.9}
              innerRef={innerRef}
              style={{ color: KYB_INFO_CONSTANTS.TRANSPARENT, backgroundColor: KYB_INFO_CONSTANTS.TRANSPARENT }}
              label={"GLOBAL_CONSTANTS.CHOOSE_DOCUMENT_TYPE"}
              touched={touched?.docType}
              name={FORM_FIELD.DOC_TYPE}
              error={errors?.docType}
              handleBlur={handleBlur}
              customContainerStyle={{ height: 80 }}
              data={documentTypesLookUp || []}
              placeholder={"GLOBAL_CONSTANTS.SELECT_DOCUMENT_TYPE"}
              placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
              component={CustomPicker}
              modalTitle={"GLOBAL_CONSTANTS.SELECT_DOCUMENT_TYPE"}
              selectionType='code'
              requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
            />


            <View style={[commonStyles.formItemSpace]} />



            <Field
              activeOpacity={0.9}
              touched={touched?.docNumber}
              name="docNumber"
              label={"GLOBAL_CONSTANTS.DACUMENT_NUMBER"}
              error={errors?.docNumber}
              handleBlur={handleBlur}
              autoCapitalize="characters"
              customContainerStyle={{ height: 80 }}
              placeholder={"GLOBAL_CONSTANTS.DACUMENT_NUMBER_PLACEHOLDER"}
              component={InputDefault}
              maxLength={30}
              requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
            />
            <ViewComponent style={[commonStyles.mb28]} />

            {(screenName !== 'PayoutUboForm' || (values.docType?.toLowerCase() !== 'tax id' && values.docType?.toLowerCase() !== 'national id')) && (
              <>
                {isDcoumentExpDate && (
                  <>
                    <DatePickerComponent
                      name='docExpireDate'
                      minimumDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                      label="GLOBAL_CONSTANTS.DOCUMENT_EXPIRY_DATE"
                      placeholder="GLOBAL_CONSTANTS.DATE_PLACEHOLDER"
                      required={screenName !== 'PayoutUboForm' || (values.docType?.toLowerCase() !== 'tax id' && values.docType?.toLowerCase() !== 'national id')}
                    />
                    <View style={[commonStyles.formItemSpace]} />
                  </>
                )}

                <FileUpload
                  fileLoader={imagesLoader?.frontId}
                  uploadedImageUri={values?.frontId}
                  fileName={fileNames?.frontId as any}
                  errorMessage={touched?.frontId ? errors?.frontId as any : undefined}
                  deleteImage={() => deleteImage(FORM_FIELD.FRONT_ID, setFieldValue)}
                  label={"GLOBAL_CONSTANTS.FRONT_ID_PHOTO"}
                  isRequired={screenName !== 'PayoutUboForm' || (values.docType?.toLowerCase() !== 'tax id' && values.docType?.toLowerCase() !== 'national id')}
                  showImageSourceSelector={true}
                  fieldName={FORM_FIELD.FRONT_ID}
                  setFieldValue={setFieldValue}
                  setErrorMessage={onValidationError}
                  subLabel={"GLOBAL_CONSTANTS.PNG_JPG_JPEG_PDF_FILES_ALLOWED"}
                />
                <View style={commonStyles.formItemSpace} />

                <FileUpload
                  fileLoader={imagesLoader?.backImgId}
                  uploadedImageUri={values?.backImgId}
                  fileName={fileNames?.backImgId as any}
                  errorMessage={touched?.backImgId ? errors?.backImgId as any : undefined}
                  deleteImage={() => deleteImage(FORM_FIELD.BACK_IMG_ID, setFieldValue)}
                  label={"GLOBAL_CONSTANTS.BACK_ID_PHOTO"}
                  isRequired={screenName !== 'PayoutUboForm' || (values.docType?.toLowerCase() !== 'tax id' && values.docType?.toLowerCase() !== 'national id')}
                  showImageSourceSelector={true}
                  fieldName={FORM_FIELD.BACK_IMG_ID}
                  setFieldValue={setFieldValue}
                  setErrorMessage={onValidationError}
                  subLabel={"GLOBAL_CONSTANTS.PNG_JPG_JPEG_PDF_FILES_ALLOWED"}
                />
              </>
            )}

            <ViewComponent style={{ flex: 1 }} />


          </>
        );
      }}
    </Formik>
  );
};

export default UboFormComponent;