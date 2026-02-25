import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { SEND_CONST } from './sendConstant';
import useEncryptDecrypt from '../../../../../hooks/encDecHook';
import { ADD_RECIPIENT } from './constant';
import ViewComponent from '../../../../../components/view/view';
import FormikRadioButton from '../../../../../components/buttons/radioButtons/formik/radioButton';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import { RecipientDetailsSectionProps, RecipientProfileDetails } from './interface';
import useCountryData from '../../../../../hooks/countryDataHook/useCountryData';
import DynamicAddressFields from '../fiatPayee/accountDetails/components/dynamicAddressFields';
import DynamicFieldRenderer from '../fiatPayee/accountDetails/components/dynamicFieldRenderer';

const RecipientDetails: React.FC<RecipientDetailsSectionProps> = ({ values, touched, errors, handleBlur, handleChange, setFieldValue, nameRef, countryCodelist, NEW_COLOR, commonStyles, t, handlePhoneCode, userProfile, countries, setCountryStates, setFieldError, props,
    formik, countryStates, currentCountry, formatState, propsUpdateId, screenName, getCryptoCoins, accountType, recepientDynamicFeieldDetails, setErrors
}) => {
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const isFirstPartyDisable =
        (userInfo?.accountType?.toLowerCase() === ADD_RECIPIENT.PERSONAL && props?.route?.params?.accountType?.toLowerCase() === ADD_RECIPIENT.BUSINESS) ||
        (userInfo?.accountType?.toLowerCase() === ADD_RECIPIENT.BUSINESS && props?.route?.params?.accountType?.toLowerCase() === ADD_RECIPIENT.PERSONAL);
    const addressTypeLookUp = [{ label: "GLOBAL_CONSTANTS.FIRST_PARTY", value: (userInfo?.accountType?.toLowerCase() === ADD_RECIPIENT.BUSINESS && accountType === ADD_RECIPIENT.BUSINESS || userInfo?.accountType?.toLowerCase() === ADD_RECIPIENT.PERSONAL && accountType !== ADD_RECIPIENT.BUSINESS) && SEND_CONST.FIRST_PARTY, disabled: isFirstPartyDisable }, { label: "GLOBAL_CONSTANTS.THIRD_PARTY", value: SEND_CONST.THIRD_PARTY, disabled: false }];
    const { decryptAES } = useEncryptDecrypt();
    const [isRecipientLoading, setIsRecipientLoading] = useState<boolean>(false);
    const [recipentDetails, setRecipentDetails] = useState<RecipientProfileDetails>({})
    const [addressTypeSelected, setAddressTypeSelected] = useState<boolean>(false);

    // Use optimized country data with states
    const { countriesWithStates } = useCountryData({
        loadCountries: true,
        loadStates: true,
    });

    useEffect(() => {
        if (values?.addressType === SEND_CONST.FIRST_PARTY && !propsUpdateId) {
            handleAddressTypeChange(values?.addressType);
        } else if (values?.addressType && propsUpdateId) {
            handleAddressTypeChange(values?.addressType);
        }
    }, [values?.addressType, propsUpdateId]);

    useEffect(() => {
        if (!Array.isArray(countriesWithStates) || countriesWithStates?.length === 0) return;

        const selectedCountry = countriesWithStates?.find(
            (country: any) => country?.name === formik?.values?.country
        );
        const formattedStates =
            selectedCountry?.details?.map((state: any) => formatState(state)) || [];

        setCountryStates(formattedStates);
    }, [countriesWithStates, formik?.values?.country]);

    const handleCountryChange = useCallback((countryName: string) => {
        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.COUNTRY, countryName);
        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.STATE, "");

        const selectedCountry = countriesWithStates?.find(
            (country: any) => country?.name === countryName
        );
        const formattedStates = selectedCountry?.details?.map((state: any) => formatState(state)) || [];
        setCountryStates(formattedStates);
    }, [countriesWithStates, formatState, setCountryStates, setFieldValue]);

    const handleAddressTypeChange = useCallback(async (party?: string) => {
        const isPersonalAccount = props?.route?.params?.accountType?.toLowerCase() === ADD_RECIPIENT.PERSONAL && userInfo?.accountType?.toLowerCase() === ADD_RECIPIENT.PERSONAL;
        const isBusinessAccount = props?.route?.params?.accountType?.toLowerCase() === ADD_RECIPIENT.BUSINESS && userInfo?.accountType?.toLowerCase() === ADD_RECIPIENT.BUSINESS;
        if ((party === addressTypeLookUp[0].value) && (isPersonalAccount || isBusinessAccount)) {
            setIsRecipientLoading(true);
            try {
                const profileData: any = userProfile ? await userProfile(userInfo?.accountType?.toLowerCase()) : null;
                const updatedProfileData = {
                    ...profileData,
                };
                setRecipentDetails(prev => ({ ...prev, ...updatedProfileData }))
                if (profileData) {
                    if ((userInfo?.accountType?.toLowerCase() === ADD_RECIPIENT.PERSONAL)) {
                        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.FIRST_NAME, profileData?.firstName || "");
                        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.LAST_NAME, profileData?.lastName || "");
                        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.EMAIL, profileData?.email ? decryptAES(profileData.email) : "");
                        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.PHONE_NUMBER, profileData?.phoneNumber ? decryptAES(profileData.phoneNumber) : "");
                        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.PHONE_CODE, profileData?.phoneCode ? decryptAES(profileData.phoneCode) : "");
                        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.DATE_OF_BIRTH, profileData?.dateOfBirth || profileData?.dob ? new Date(profileData?.dateOfBirth || profileData?.dob) : null);
                        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.RELATION, "");
                        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.COUNTRY, profileData?.country || values?.country);
                        setFieldError(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.RELATION, "")
                        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.BUSINESS_NAME, profileData?.businessName || profileData.firstName || "");

                        if (profileData?.country) {
                            const selectedCountry: any = countriesWithStates?.find((country: any) => country?.name === profileData?.country);
                            const formattedStates = selectedCountry?.details?.map((state: any) => formatState(state)) || [];
                            setCountryStates(formattedStates);
                        }

                    } else {
                        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.FIRST_NAME, profileData?.firstName || profileData?.businessName || "");
                        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.EMAIL, profileData?.email ? decryptAES(profileData.email) : "");
                        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.PHONE_NUMBER, profileData?.phoneNumber ? decryptAES(profileData.phoneNumber) : "");
                        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.RELATION, "");
                        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.PHONE_CODE, profileData?.phoneCode ? decryptAES(profileData.phoneCode) : "");
                        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.COUNTRY, profileData?.country);
                        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.BUSINESS_NAME, profileData?.businessName || profileData.firstName || "");

                        if (profileData?.country) {
                            const selectedCountry: any = countriesWithStates?.find((country: any) => country?.name === profileData?.country);
                            const formattedStates = selectedCountry?.details?.map((state: any) => formatState(state)) || [];
                            setCountryStates(formattedStates);
                        }
                    }
                }
            } catch (error) {
            } finally {
                setIsRecipientLoading(false);
            }
        } else {
            if (!props?.id && !propsUpdateId) {
                setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.FIRST_NAME, "");
                setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.LAST_NAME, "");
                setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.EMAIL, "");
                setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.PHONE_NUMBER, "");
                setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.PHONE_CODE, "");
                setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.DATE_OF_BIRTH, null);
                setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.RELATION, "");
                setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.STATE, "");
                setCountryStates([]);
            }
        }
    }, [addressTypeLookUp, countriesWithStates, decryptAES, formatState, props, setCountryStates, setFieldError, setFieldValue, userInfo?.accountType, userProfile, values?.addressType]);

    const handleCryptoFeilds = useCallback((screenName?: string) => {
        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.FIRST_NAME, "");
        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.LAST_NAME, "");
        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.EMAIL, "");
        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.PHONE_NUMBER, "");
        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.PHONE_CODE, "");
        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.COUNTRY, "");
        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.STATE, "");
        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.CITY, "");
        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.STREET, "");
        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.LINE1, "");
        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.POSTAL_CODE, "");
        // if (screenName !== ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.WITHDRAW) {
        //     // setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.WALLET_ADDRESS, "");
        //     // setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.NETWORK, "");
        //     // setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.TOKEN, "");
        // }
        if (values?.source === "Self Hosted") {
            setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.SOURCE, "");
        }

        setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.PROOF_TYPE, "");
        // setFieldValue(ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.REMARKS, "")
    }, [setFieldValue, values?.source]);
    const context = {
        isFirstParty: values?.addressType === SEND_CONST.FIRST_PARTY,
        accountTypeDetails: accountType?.toLowerCase() || '',
        addressTypeDetails: values?.addressType
    };
    // Get Address Type field from schema
    const addressTypeField = recepientDynamicFeieldDetails?.account?.find((field: any) => field.field === 'addressType');

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
            {addressTypeField?.isEnable && (
                <FormikRadioButton
                    label={addressTypeField?.label || "GLOBAL_CONSTANTS.TRANSFER"}
                    options={getEnabledOptions(addressTypeField?.options)}
                    isRequired={addressTypeField?.isMandatory || true}
                    name={ADD_RECIPIENT.CRYPTO_PAYEE_FIELD_NAMES.ADDRESS_TYPE}
                    onOptionSelect={(value) => {
                        setAddressTypeSelected(true);
                        setFieldValue('addressType', value);
                        handleAddressTypeChange(value);
                        handleCryptoFeilds(screenName);
                        getCryptoCoins(value);
                    }}
                    disabled={(props?.id || propsUpdateId) ? true : false}
                />
            )}
            <ViewComponent style={[commonStyles.sectionGap]} />

            {(recepientDynamicFeieldDetails?.recipient) && (
                <ParagraphComponent style={[commonStyles.sectionTitle]} text={"GLOBAL_CONSTANTS.FIAT_RECIPIENT"} />
            )}

            <DynamicFieldRenderer
                fields={recepientDynamicFeieldDetails?.recipient}
                values={values}
                touched={touched}
                errors={errors}
                handleBlur={handleBlur}
                handleChange={handleChange}
                setFieldValue={setFieldValue}
                countryCodelist={countryCodelist}
                countries={countries}
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
                isRelationTypeFeildDisplay={false}
            />
            <ViewComponent style={[commonStyles.formItemSpace]} />

            <DynamicAddressFields
                fields={recepientDynamicFeieldDetails?.address}
                values={values}
                touched={touched}
                errors={errors}
                handleBlur={handleBlur}
                setFieldValue={setFieldValue}
                countries={countriesWithStates || countries}
                states={countryStates || []}
                setCountryStates={setCountryStates}
                NEW_COLOR={NEW_COLOR}
                commonStyles={commonStyles}
                handleCountryChange={handleCountryChange}
            />

        </ViewComponent>
    );
};

export default RecipientDetails;
