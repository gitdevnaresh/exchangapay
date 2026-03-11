import React, { useCallback } from 'react';
import { Linking, TextInput as RNTextInput } from "react-native";
import { Field, FormikProps } from "formik";
import CustomPicker from "../../../../components/customPicker/CustomPicker";
import ModalPicker from '../../../../components/pickerComponents/ModalPicker';
import RadioButton from '../../../../components/radiobutton/RadioButton';
import { s } from '../../../../constants/styels/scale';
import ViewComponent from '../../../../components/view/view';
import { CountryListItem, PhoneCodeListItem, RegFormValues, RootState } from './constants';
import InputDefault from '../../../../components/textInputComponents/DefaultFiat';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import { useLngTranslation } from '../../../../hooks/languagesHook/useLngTranslation';
import ButtonComponent from '../../../../components/buttons/button';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ParagraphComponent from '../../../../components/textComponets/paragraphText/paragraph';
import LabelComponent from '../../../../components/textComponets/lableComponent/lable';
import DatePickerComponent from '../../../../components/datePickers/formik/datePicker';

type EditInfoFormProps = FormikProps<RegFormValues> & {
    userinfo: RootState['userReducer']['userDetails'];
    isAddressRequired: boolean;
    countries: CountryListItem[];
    countryCodelist: PhoneCodeListItem[];
    commonStyles: ReturnType<typeof getThemedCommonStyles>;
    NEW_COLOR: ReturnType<typeof useThemeColors>;
    isChecked: boolean;
    handleCheck: (isActive: boolean) => void;
    isCheckedError: string | null;
    genderOptions: any[];
    saveLoading: boolean;
    handleBackArrow: () => void;
};

const EditInfoForm: React.FC<EditInfoFormProps> = ({
    values,
    errors,
    touched,
    setFieldValue,
    handleBlur,
    handleSubmit, // Formik's handleSubmit
    userinfo,
    isAddressRequired,
    countries,
    countryCodelist,
    commonStyles,
    NEW_COLOR,
    isChecked,
    handleCheck,
    isCheckedError,
    genderOptions,
    saveLoading, // from parent state
    handleBackArrow // from parent
}) => {
    const { t } = useLngTranslation();
    const phoneErrorKey = errors.phoneNumber || errors.phoneCode;

    const handlePhoneCodeChange = useCallback((item: { code: string }) => {
        setFieldValue('phoneCode', item.code);
    }, [setFieldValue]);

    const handlePhoneNumberChange = useCallback((text: string) => {
        const formattedText = text.replace(/\D/g, "").slice(0, 13);
        setFieldValue('phoneNumber', formattedText);
    }, [setFieldValue]);

    const handleCountryChange = useCallback((itemValue: string) => {
        setFieldValue('country', itemValue);
    }, [setFieldValue]);

    const handleGenderSelect = useCallback((val: string) => {
        setFieldValue('gender', val);
    }, [setFieldValue]);

    const handleCheckboxPress = useCallback(() => {
        handleCheck(!isChecked);
    }, [handleCheck, isChecked]);

    const handlePrivacyPolicyPress = useCallback(() => {
        Linking.openURL("https://www.rapidz.money/privacy-policy");
    }, []);

    return (
        <>
            <ViewComponent style={[commonStyles.mt5]} />

            {userinfo?.accountType !== 'Business' && <>
                <Field name="firstName" label={t("GLOBAL_CONSTANTS.FIRST_NAME")} placeholder={t("GLOBAL_CONSTANTS.FIRST_NAME_PLACEHOLDER")} component={InputDefault} requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />} error={touched.firstName && errors.firstName} handleBlur={handleBlur('firstName')} editable={true} />
                {touched.firstName && errors.firstName && <ParagraphComponent style={[commonStyles.textRed, commonStyles.fs14, commonStyles.fw400, commonStyles.mt4]} text={t(errors.firstName)} />}
                <ViewComponent style={[commonStyles.formItemSpace]} />
                <Field name="lastName" label={t("GLOBAL_CONSTANTS.LAST_NAME")} placeholder={t("GLOBAL_CONSTANTS.LAST_NAME_PLACEHOLDER")} component={InputDefault} requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />} error={touched.lastName && errors.lastName} handleBlur={handleBlur('lastName')} editable={true} />
                {touched.lastName && errors.lastName && <ParagraphComponent style={[commonStyles.textRed, commonStyles.fs14, commonStyles.fw400, commonStyles.mt4]} text={t(errors.lastName)} />}
                <ViewComponent style={[commonStyles.formItemSpace]} />
                <LabelComponent text={t("GLOBAL_CONSTANTS.GENDER")} style={[commonStyles.mb10]}>
                    <LabelComponent text=" *" style={commonStyles.textError} />
                </LabelComponent>
                <RadioButton options={genderOptions} selectedOption={values.gender} onSelect={handleGenderSelect} nameField='label' valueField='name' />
                {touched.gender && errors.gender && <ParagraphComponent style={[commonStyles.textRed, commonStyles.fs14, commonStyles.fw400, commonStyles.mt4]} text={t(errors.gender)} />}
                <ViewComponent style={[commonStyles.formItemSpace]} />
            </>}

            {userinfo?.accountType === 'Business' && <>
                <Field name="businessName" label={t("GLOBAL_CONSTANTS.BUSINESS_NAME")} placeholder={t("GLOBAL_CONSTANTS.BUSINESS_NAME_PLACEHOLDER")} component={InputDefault} requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />} error={touched.businessName && errors.businessName} handleBlur={handleBlur('businessName')} editable={true} />
                {touched.businessName && errors.businessName && <ParagraphComponent style={[commonStyles.textRed, commonStyles.fs14, commonStyles.fw400, commonStyles.mt4]} text={t(errors.businessName)} />}
                <ViewComponent style={[commonStyles.formItemSpace]} />
                <DatePickerComponent name="incorporationDate" label={t("GLOBAL_CONSTANTS.INCORPORATION_DATE")} maximumDate={new Date()} />
                {touched.incorporationDate && errors.incorporationDate && <ParagraphComponent style={[commonStyles.textRed, commonStyles.fs14, commonStyles.fw400, commonStyles.mt4]} text={t(errors.incorporationDate as string)} />}
                <ViewComponent style={[commonStyles.formItemSpace]} />
            </>}
            <LabelComponent style={[commonStyles.inputLabel]} text={t("GLOBAL_CONSTANTS.MOBILE_NO")}>
                <ParagraphComponent style={[commonStyles.textRed]} text={' *'} />
            </LabelComponent>
            <ViewComponent style={[commonStyles.dflex, commonStyles.relative]}>
                <ViewComponent style={{ width: s(120) }}>
                    <Field
                        name="phoneCode"
                        component={ModalPicker}
                        customStyles={[(touched.phoneCode || touched.phoneNumber) && (errors.phoneCode || errors.phoneNumber) && commonStyles.errorBorder, { borderTopRightRadius: 0, borderBottomRightRadius: 0, }]}
                        customBind={['name', '(', 'code', ')']}
                        data={countryCodelist}
                        modalTitle={"GLOBAL_CONSTANTS.SELECT_COUNTRY_CODE"}
                        value={values.phoneCode}
                        placeholder="GLOBAL_CONSTANTS.SELECT"
                        onChange={handlePhoneCodeChange}
                        error={(touched.phoneCode || touched.phoneNumber) && (!!errors.phoneCode || !!errors.phoneNumber)}
                        isOnlycountry={true}
                    />
                </ViewComponent>
                <ViewComponent style={commonStyles.flex1}>
                    <RNTextInput style={[commonStyles.textInput, (touched.phoneCode || touched.phoneNumber) && (errors.phoneCode || errors.phoneNumber) && commonStyles.errorBorder, { borderBottomLeftRadius: 0, borderTopLeftRadius: 0 }]}
                        placeholder={t("GLOBAL_CONSTANTS.PHONE_NUMBER_PLACEHOLDER")}
                        onChangeText={handlePhoneNumberChange}
                        onBlur={handleBlur('phoneNumber')}
                        value={values.phoneNumber}
                        placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                        keyboardType="phone-pad"
                    />
                </ViewComponent>
            </ViewComponent>
            {(touched.phoneCode || touched.phoneNumber) && phoneErrorKey && <ParagraphComponent style={[commonStyles.textRed, commonStyles.fs14, commonStyles.fw400, commonStyles.mt4]} text={t(phoneErrorKey)} />}
            <ViewComponent style={[commonStyles.formItemSpace]} />

            <LabelComponent style={[commonStyles.inputLabel]} text={((userinfo?.accountType) !== 'Business' ? t("GLOBAL_CONSTANTS.COUNTRY_OF_RECIDENCY") : t("GLOBAL_CONSTANTS.COUNTRY_OF_BUSINESS")) ?? ""}>
                <ParagraphComponent style={[commonStyles.textRed]} text={' *'} />
            </LabelComponent>
            <Field
                name="country"
                component={CustomPicker}
                activeOpacity={0.9}
                style={commonStyles.textInput}
                error={touched.country && !!errors.country}
                handleBlur={handleBlur('country')}
                data={countries}
                placeholder={"GLOBAL_CONSTANTS.SELECT_COUNTRY"}
                placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                modalTitle={"GLOBAL_CONSTANTS.SELECT_COUNTRY"}
                onChange={handleCountryChange}
                showCountryImages={true}
                isOnlycountry={true}
            />
            {touched.country && errors.country && <ParagraphComponent style={[commonStyles.textRed, commonStyles.fs14, commonStyles.fw400, commonStyles.mt4]} text={t(errors.country)} />}
            <ViewComponent style={[commonStyles.formItemSpace]} />

            {isAddressRequired &&
                <>
                    <ViewComponent style={[commonStyles.mt24]} />
                    <Field name="addressLine1" label={t('ADDRESS_LINE_1_LABEL')} placeholder={t('ADDRESS_LINE_1_PLACEHOLDER')} component={InputDefault} requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />} error={touched.addressLine1 && errors.addressLine1} handleBlur={handleBlur('addressLine1')} editable={true} />
                    {touched.addressLine1 && errors.addressLine1 && <ParagraphComponent style={[commonStyles.textRed, commonStyles.fs14, commonStyles.fw400, commonStyles.mt4]} text={t(errors.addressLine1)} />}
                    <ViewComponent style={[commonStyles.formItemSpace]} />
                    <Field name="state" label={t('PROVINCE_STATE_LABEL')} placeholder={t('PROVINCE_STATE_PLACEHOLDER')} component={InputDefault} requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />} error={touched.state && errors.state} handleBlur={handleBlur('state')} editable={true} />
                    {touched.state && errors.state && <ParagraphComponent style={[commonStyles.textRed, commonStyles.fs14, commonStyles.fw400, commonStyles.mt4]} text={t(errors.state)} />}
                    <ViewComponent style={[commonStyles.formItemSpace]} />
                    <Field name="city" label={t('CITY_LABEL')} placeholder={t('CITY_PLACEHOLDER')} component={InputDefault} requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />} error={touched.city && errors.city} handleBlur={handleBlur('city')} editable={true} />
                    {touched.city && errors.city && <ParagraphComponent style={[commonStyles.textRed, commonStyles.fs14, commonStyles.fw400, commonStyles.mt4]} text={t(errors.city)} />}
                    <ViewComponent style={[commonStyles.formItemSpace]} />
                    <Field name="postalCode" label={t('POSTAL_CODE_LABEL')} placeholder={t('POSTAL_CODE_PLACEHOLDER')} component={InputDefault} requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />} error={touched.postalCode && errors.postalCode} handleBlur={handleBlur('postalCode')} keyboardType='numeric' editable={true} />
                    {touched.postalCode && errors.postalCode && <ParagraphComponent style={[commonStyles.textRed, commonStyles.fs14, commonStyles.fw400, commonStyles.mt4]} text={t(errors.postalCode)} />}
                    <ViewComponent style={[commonStyles.formItemSpace]} />
                </>
            }

            <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.alignStart, commonStyles.sectionGap]}>
                <MaterialCommunityIcons
                    name={isChecked === true ? 'checkbox-outline' : 'checkbox-blank-outline'} size={s(24)}
                    color={isChecked === true ? NEW_COLOR.TEXT_PRIMARY : NEW_COLOR.TEXT_link}
                    onPress={handleCheckboxPress}
                />
                <ParagraphComponent text={t("GLOBAL_CONSTANTS.BY_CLICK_SUBMIT")} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey, commonStyles.flex1]} >
                    <ParagraphComponent text={t("GLOBAL_CONSTANTS.AGREEMENT")} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} >
                        <ParagraphComponent text={t("GLOBAL_CONSTANTS.AND_IVE_READ")} style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textlinkgrey]} />
                    </ParagraphComponent>
                    <ParagraphComponent text={t("GLOBAL_CONSTANTS.PRIVACY_POLICY")} style={[commonStyles.fs12, commonStyles.fw900, commonStyles.textprimary]} onPress={handlePrivacyPolicyPress} />
                </ParagraphComponent>
            </ViewComponent>
            {isCheckedError && <ParagraphComponent style={[commonStyles.textRed, commonStyles.fs14, commonStyles.fw400]} text={isCheckedError} />}
            <ViewComponent style={[commonStyles.mt24,]}>
                <ButtonComponent
                    title={t("GLOBAL_CONSTANTS.UPDATE")}
                    onPress={() => handleSubmit()} // Use Formik's handleSubmit
                    disable={saveLoading}
                    loading={saveLoading}
                />
                <ViewComponent style={[commonStyles.mt16]}>
                    <ButtonComponent
                        title={t("GLOBAL_CONSTANTS.CANCEL")}
                        onPress={handleBackArrow} // Passed from parent
                        solidBackground={true}
                    />
                    <ViewComponent style={[commonStyles.mb70]} />
                </ViewComponent>
            </ViewComponent>
        </>
    );
};

export default EditInfoForm;