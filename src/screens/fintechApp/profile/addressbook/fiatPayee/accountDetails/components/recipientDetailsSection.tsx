import React, { useEffect, useState, useCallback } from 'react';
import { Field } from "formik";
import InputDefault from '../../../../../../../components/textInputComponents/DefaultFiat';
import ViewComponent from '../../../../../../../components/view/view';
import { ADD_RECIPIENT } from '../../addRecipient/constant';
import FormikRadioButton from '../../../../../../../components/buttons/radioButtons/formik/radioButton';
import { SEND_CONST } from '../../../crytoPayee/sendConstant';
import { useSelector } from 'react-redux';
import useEncryptDecrypt from '../../../../../../../hooks/encDecHook';
import LabelComponent from '../../../../../../../components/textComponets/lableComponent/lable';
import ParagraphComponent from '../../../../../../../components/textComponets/paragraphText/paragraph';
import { RecipientDetailsSectionProps } from '../interface';
import { ADD_BOOK_CONST } from '../../../constants';
import DynamicFieldRenderer from './dynamicFieldRenderer';


const RecipientDetailsSection: React.FC<RecipientDetailsSectionProps> = ({
    values, touched, errors, handleBlur, handleChange, setFieldValue, nameRef, countryCodelist, relationTypes,
    NEW_COLOR, commonStyles, t, handlePhoneCode, userProfile, countries, states, setCountryStates, setRelationTypes,
    lookUpData, setFieldError, props, dynamicRecipientDetails, setErrors, setPaymentFeildInfo, dynamicAddressTypeDetails
}) => {
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const isFirstPartyDisable =
        (userInfo?.accountType?.toLowerCase() === ADD_RECIPIENT.PERSONAL && props?.accountType?.toLowerCase() === ADD_RECIPIENT.BUSINESS) ||
        (userInfo?.accountType?.toLowerCase() === ADD_RECIPIENT.BUSINESS && props?.accountType?.toLowerCase() === ADD_RECIPIENT.PERSONAL);

    const addressTypeLookUp = [
        {
            label: "GLOBAL_CONSTANTS.FIRST_PARTY",
            value: (userInfo?.accountType?.toLowerCase() === ADD_RECIPIENT.BUSINESS && props?.accountType?.toLowerCase() === ADD_RECIPIENT.BUSINESS || userInfo?.accountType?.toLowerCase() === ADD_RECIPIENT.PERSONAL && props?.accountType?.toLowerCase() !== ADD_RECIPIENT.BUSINESS) && SEND_CONST.FIRST_PARTY,
            disabled: isFirstPartyDisable
        },
        {
            label: "GLOBAL_CONSTANTS.THIRD_PARTY",
            value: SEND_CONST.THIRD_PARTY,
            disabled: false
        }
    ];

    const { decryptAES } = useEncryptDecrypt();
    const [recipentDetails, setRecipentDetails] = useState<any>({});
    const [isRecipientLoading, setIsRecipientLoading] = useState(false);

    useEffect(() => {
        if (values?.addressType === SEND_CONST.FIRST_PARTY && !props?.id) {
            handleAddressTypeChange(values?.addressType);
        } else if (values?.addressType && props?.id) {
            handleAddressTypeChange(values?.addressType);
        }
    }, [values?.addressType, props?.id]);

    const handleAddressTypeChange = useCallback(async (party?: string) => {
        if (props?.accountType?.toLowerCase() === "personal") {
            setRelationTypes(lookUpData?.Individual || []);
        } else {
            setRelationTypes(lookUpData?.Business || []);
        }

        const isPersonalAccount = props?.accountType?.toLowerCase() === "personal" && userInfo?.accountType?.toLowerCase() === "personal";
        const isBusinessAccount = props?.accountType?.toLowerCase() === "business" && userInfo?.accountType?.toLowerCase() === "business";

        if (party === addressTypeLookUp[0].value && (isPersonalAccount || isBusinessAccount)) {
            setIsRecipientLoading(true);
            try {
                const profileData: any = await userProfile?.(userInfo?.accountType?.toLowerCase());
                const updatedProfileData = {
                    ...profileData,
                };
                setRecipentDetails(updatedProfileData);

                if (profileData) {
                    if (userInfo?.accountType?.toLowerCase() === "personal") {
                        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.FIRST_NAME, profileData.firstName || "");
                        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.LAST_NAME, profileData.lastName || "");
                        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.EMAIL, decryptAES(profileData.email) || "");
                        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.PHONE_NUMBER, decryptAES(profileData.phoneNumber) || "");
                        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.PHONE_CODE, decryptAES(profileData.phoneCode) || "");
                        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.DATE_OF_BIRTH, profileData?.dateOfBirth || profileData?.dob ? new Date(profileData?.dateOfBirth || profileData?.dob) : null);
                        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.RELATION, "");
                        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.COUNTRY, profileData.country);
                        setFieldError(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.RELATION, "");
                        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.BUSINESS_NAME, profileData?.businessName || "");

                        if (profileData?.country) {
                            const selectedCountry: any = countries?.find((country: any) => country.name === profileData.country);
                            if (selectedCountry?.details) {
                                setCountryStates?.(selectedCountry.details);
                            } else {
                                setCountryStates?.([]);
                            }
                        }
                    } else {
                        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.FIRST_NAME, profileData.firstName || profileData?.businessName || "");
                        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.EMAIL, decryptAES(profileData.email) || "");
                        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.PHONE_NUMBER, decryptAES(profileData.phoneNumber) || "");
                        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.RELATION, "");
                        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.PHONE_CODE, decryptAES(profileData.phoneCode) || "");
                        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.COUNTRY, profileData.country);
                        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.BUSINESS_NAME, profileData?.businessName || "");


                        if (profileData?.country) {
                            const selectedCountry: any = countries?.find((country: any) => country.name === profileData.country);
                            if (selectedCountry?.details) {
                                setCountryStates?.(selectedCountry.details);
                            } else {
                                setCountryStates?.([]);
                            }
                        }
                    }
                }
            } catch (error) {
                // Handle error
            } finally {
                setIsRecipientLoading(false);
            }
        } else {
            if (!props?.id) {
                // Clear all fields for third party
                setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.FIRST_NAME, "");
                setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.LAST_NAME, "");
                setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.EMAIL, "");
                setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.PHONE_NUMBER, "");
                setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.PHONE_CODE, "");
                setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.DATE_OF_BIRTH, null);
                setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.RELATION, "");
                setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.COUNTRY, "");
                setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.STATE, "");
                setCountryStates?.([]);
            }
        }
    }, [addressTypeLookUp, countries, decryptAES, lookUpData, props?.accountType, props?.id, setCountryStates, setFieldError, setFieldValue, setRelationTypes, userInfo?.accountType, userProfile]);

    // Static field configuration


    const context = {
        isFirstParty: values?.addressType === SEND_CONST.FIRST_PARTY,
        accountTypeDetails: props?.accountType?.toLowerCase() || '',
        addressTypeDetails: values?.addressType === SEND_CONST.FIRST_PARTY
    };
    const handlePayeeFiatFeilds = useCallback(() => {
        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.FIRST_NAME, "");
        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.LAST_NAME, "");
        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.EMAIL, "");
        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.PHONE_NUMBER, "");
        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.PHONE_CODE, "");
        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.DATE_OF_BIRTH, "");
        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.RELATION, "");
        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.COUNTRY, "");
        setFieldError(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.RELATION, "")
        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.WALLE_CODE, "");
        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.DOCUMENT_TYPE, "");
        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.DOCUMENT_NUMBER, "");
        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.FRONT_ID_PHOTO, "");
        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.BACK_ID_PHOTO, "");
        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.BACK_ID, "");
        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.FRONT_ID, "");
        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.STABLE_COIN_PAYOUT, false)
        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.BUSINESS_TYPE, "");
        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.BUSINESS_REGISTRATION_NUMBER, "");
        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.CITY, "");
        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.STREET, "");
        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.POSTAL_CODE, "");
        setFieldValue(ADD_BOOK_CONST.PAYMENT_TYPE, '');
        setPaymentFeildInfo?.([]);
        setErrors?.({});

    }, [setErrors, setFieldError, setFieldValue, setPaymentFeildInfo]);
    // Get Address Type field from schema
    const addressTypeField = dynamicAddressTypeDetails?.find((field: any) => field.field === 'addressType');

    // Filter enabled options and map labels
    const getEnabledOptions = (options: any[]) => {
        return options?.filter((option: any) => option.isEnable === true)
            .map((option: any) => {
                const mappedValue = option.value === "FirstParty-WalletSource" ? SEND_CONST.FIRST_PARTY :
                    option.value === "WalletSources" ? SEND_CONST.THIRD_PARTY : option.value;

                const mappedLabel = option.label?.toLowerCase() === "self" ? "GLOBAL_CONSTANTS.FIRST_PARTY" :
                    option.label === "3rd Party" ? "GLOBAL_CONSTANTS.THIRD_PARTY" : option.label;

                // Find corresponding addressTypeLookUp item by label to get disabled state
                const lookupItem = addressTypeLookUp.find(item => item.label === mappedLabel);
                return {
                    ...option,
                    label: mappedLabel,
                    value: mappedValue,
                    disabled: lookupItem?.disabled || false
                };
            }) || [];
    };
    return (
        <ViewComponent>
            <Field
                maxLength={50}
                touched={touched.favouriteName}
                name={ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.FAVORITE_NAME}
                label={"GLOBAL_CONSTANTS.FAVORITE"}
                error={errors.favouriteName}
                handleBlur={handleBlur}
                placeholder={"GLOBAL_CONSTANTS.ENTER_FAVORITE_NAME"}
                component={InputDefault}
                innerRef={nameRef}
                requiredMark={<LabelComponent style={[commonStyles.textRed]} text=' *' />}
            />
            {/* <ViewComponent style={[commonStyles.formItemSpace]} />

            <FormikRadioButton
                label={"GLOBAL_CONSTANTS.TRANSFER"}
                options={addressTypeLookUp}
                isRequired={true}
                name={"addressType"}
                onOptionSelect={(value) => {
                    setFieldValue('addressType', value);
                    handlePayeeFiatFeilds();
                    handleAddressTypeChange(value);
                }}
                disabled={props?.id ? true : false}
            /> */}

            <ViewComponent style={[commonStyles.formItemSpace]} />

            {addressTypeField?.isEnable && (
                <FormikRadioButton
                    label={addressTypeField?.label || "GLOBAL_CONSTANTS.TRANSFER"}
                    options={getEnabledOptions(addressTypeField?.options)}
                    isRequired={addressTypeField?.isMandatory || true}
                    name={"addressType"}
                    onOptionSelect={(value) => {
                        setFieldValue('addressType', value);
                        handlePayeeFiatFeilds();
                        handleAddressTypeChange(value);
                        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.COUNTRY, "");
                        setFieldValue(ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.STATE, "");


                    }}
                    disabled={(props?.id) ? true : false}
                />
            )}
            <ViewComponent style={[commonStyles.sectionGap]} />

            {(dynamicRecipientDetails) && (
                <ParagraphComponent style={[commonStyles.sectionTitle]} text={"GLOBAL_CONSTANTS.FIAT_RECIPIENT"} />
            )}

            <DynamicFieldRenderer
                fields={dynamicRecipientDetails}
                values={values}
                touched={touched}
                errors={errors}
                handleBlur={handleBlur}
                handleChange={handleChange}
                setFieldValue={setFieldValue}
                countryCodelist={countryCodelist}
                relationTypes={relationTypes}
                countries={countries}
                states={states}
                setCountryStates={setCountryStates}
                NEW_COLOR={NEW_COLOR}
                commonStyles={commonStyles}
                t={t}
                handlePhoneCode={handlePhoneCode}
                recipentDetails={recipentDetails}
                isRecipientLoading={isRecipientLoading}
                props={props}
                decryptAES={decryptAES}
                context={context}
                addressType={values?.addressType}
                isRelationTypeFeildDisplay={true}

            />
        </ViewComponent>
    );
};

export default RecipientDetailsSection;