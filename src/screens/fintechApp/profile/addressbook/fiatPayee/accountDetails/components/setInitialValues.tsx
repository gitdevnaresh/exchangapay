import AddressbookService from '../../../../../../../apiServices/profile/general/addressbook';
import { isErrorDispaly } from '../../../../../../../utils/helpers';
import { ADD_RECIPIENT } from '../../addRecipient/constant';
import { FiatPayeeValidationSchema } from './validationSchema';
import { useState } from 'react';

interface UseAccountLocalLogicProps {
    props: any;
    userinfo: any;
    setErrormsg: any;
    setWalletCode: any;
    setDocumentType: any;
    setAccountTypesLu: any;
    setCountries: any;
    setCountryCodelist: any;
    setBusinessType: any;
    setRelationTypes: any;
    setServiceProviders: any;
    setDynamicLookupData: any;
    setLoadedUrls: any;
    setPaymentFeildsLoader: any;
    setPaymentFields: any;
    setFieldsForSelectedCurrency: any;
    setFieldsForSelectedPaymentType: any;
    setBankLookupData: any;
    setAddressbookListLoading: any;
    setPayeeEditData: any;
    setPaymentFeildInfo: any;
    setInitValues: any;
    initValues: any;
    decryptAES: any;
    encryptAES: any;
    setBtnDisabled: any;
    setLoading: any;
    payeeEditData: any;
    fieldsForSelectedCurrency: any;
    frontImage: any;
    backImage: any;
    setUploadError: any;
    ref: any;
    navigation: any;
    accountTypesLu: any;
    bankLookupData: any;
    fieldsForSelectedPaymentType: any;
    serviceProviders: any;
    dynamicLookupData: any;
    loadedUrls: any;
    paymentFields: any;
    setBackSideImg: any;
    setFrontImage: any;
    setLookUpData: any;
    lookUpData: any;
    walletCode: any;
}

export const useAccountLocalLogic = ({
    props,
    userinfo,
    setErrormsg,
    setWalletCode,
    setDocumentType,
    setAccountTypesLu,
    setCountries,
    setCountryCodelist,
    setBusinessType,
    setRelationTypes,
    setServiceProviders,
    setDynamicLookupData,
    setLoadedUrls,
    setPaymentFeildsLoader,
    setPaymentFields,
    setFieldsForSelectedCurrency,
    setFieldsForSelectedPaymentType,
    setBankLookupData,
    setAddressbookListLoading,
    setPayeeEditData,
    setPaymentFeildInfo,
    setInitValues,
    initValues,
    decryptAES,
    encryptAES,
    setBtnDisabled,
    setLoading,
    payeeEditData,
    fieldsForSelectedCurrency,
    frontImage,
    backImage,
    setUploadError,
    ref,
    navigation,
    accountTypesLu,
    bankLookupData,
    fieldsForSelectedPaymentType,
    dynamicLookupData,
    loadedUrls,
    paymentFields,
    // --- FIX START ---
    // Destructure the setter functions to make them available in the hook
    setBackSideImg,
    setFrontImage,
    setLookUpData,
    walletCode,
    // --- FIX END ---
}: UseAccountLocalLogicProps) => {
    const [paymentInfoDynamicValues, setPaymentInfoDynamicValues] = useState<Record<string, any>>({});
    const [dynamicValidationSchema, setDynamicValidationSchema] =
        useState<any>(FiatPayeeValidationSchema(
            props.accountType,
            [], // start with no dynamic fields
            [],

            "",
        ));
    const formatState = (state: any) => {
        const formattedState: any = {};
        for (const key in state) {
            if (Object.prototype.hasOwnProperty.call(state, key)) {
                const lowerCaseKey = key.toLowerCase();
                const value = state[key];
                if (lowerCaseKey === ADD_RECIPIENT.NAME && typeof value === ADD_RECIPIENT.STRING) {
                    formattedState[lowerCaseKey] = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                } else {
                    formattedState[lowerCaseKey] = value;
                }
            }
        }
        return formattedState;
    };

    const getCurrencies = async (country?: string, setFieldValue?: any) => {
        setErrormsg('');

        try {
            const response: any = await AddressbookService?.getCurrenicesLookup();

            if (response?.data) {
                setWalletCode(response?.data);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }
    };

    const handleCountryChange = (country: string, setFieldValue: any) => {
        // Clear dynamic fields
    };

    const loadBankData = async (country: string) => {
        try {
            const bankResponse: any = await AddressbookService.getproviderbanksLookup(country);
            if (bankResponse?.data) {
                setDynamicLookupData((prev: any) => ({
                    ...prev,
                    bankName: bankResponse.data
                }));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));

        }
    };

    const loadBranchData = async (bankName: string) => {
        try {
            const branchResponse: any = await AddressbookService.getbranches(bankName);
            if (branchResponse?.data) {
                setDynamicLookupData((prev: any) => ({
                    ...prev,
                    branchCode: branchResponse.data
                }));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }
    };

    const getPayeesFiatLookup = async () => {
        setErrormsg('');
        try {
            const response: any = await AddressbookService.getPayeesLookups();
            if (response?.data) {
                setDocumentType(response?.data?.documentTypes);
                const accountTypesLuInfo = response?.data?.AccountTypes?.map(item => ({ ...item, name: item?.code }))
                setAccountTypesLu(accountTypesLuInfo);
                // setCountries(response?.data?.countryWithStates);
                // setCountryCodelist(response?.data?.PhoneCodes);
                setBusinessType(response?.data?.businessTypes);
                setLookUpData(response?.data);
                setRelationTypes(response?.data?.Individual);

                // Store Account Types for dynamic lookup
                if (response?.data?.AccountTypes) {
                    setDynamicLookupData((prev: any) => ({
                        ...prev,
                        accountType: response.data.AccountTypes
                    }));
                }

                setErrormsg('');
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }
    };

    const getDynamicLookupData = async (url: string, fieldKey: string) => {
        // Check if this URL has already been loaded
        if (loadedUrls.has(url)) {
            return;
        }
        try {
            // Mark URL as being loaded
            setLoadedUrls(prev => new Set([...prev, url]));

            const response: any = await AddressbookService.getDynamicLookup(url);
            if (response?.ok && response?.data) {
                setDynamicLookupData((prev: any) => ({
                    ...prev,
                    [fieldKey]: response?.data
                }));
            } else {
                setErrormsg(`Failed to load ${fieldKey} data`);
                // Remove URL from loaded set so it can be retried
                setLoadedUrls(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(url);
                    return newSet;
                });
            }
        } catch (error) {
            setErrormsg(`Error loading ${fieldKey} data: ${isErrorDispaly(error)}`);
            // Remove URL from loaded set on error so it can be retried
            setLoadedUrls(prev => {
                const newSet = new Set(prev);
                newSet.delete(url);
                return newSet;
            });
        }
    };

    const getPaymentFeilds = async (currecy?: string) => {
        setPaymentFeildsLoader(true);
        setErrormsg('');
        try {
            const response: any = await AddressbookService.getPaymentFieds(currecy);
            if (response?.ok) {
                setPaymentFields(response?.data);
                if (currecy && response?.data[currecy]?.length > 0) {
                    const fields = response?.data[currecy][0]?.fields || [];
                    setFieldsForSelectedCurrency(fields);
                } else {
                    setFieldsForSelectedCurrency([]);
                }
                setPaymentFeildsLoader(false);
                setErrormsg('');
            }
        }
        catch (error) {
            setErrormsg(isErrorDispaly(error));
            setPaymentFeildsLoader(false);
        }
    };


    const getPaymentTypeFieds = (paymentType?: string, currency?: string) => {
        if (!paymentType || !currency || !paymentFields) {
            setFieldsForSelectedPaymentType([]);
            return;
        }

        try {
            const currencyData = paymentFields[currency];
            if (currencyData && currencyData.length > 0) {
                const paymentTypeData = currencyData.find((item: any) => item.code === paymentType);
                if (paymentTypeData?.fields) {
                    setFieldsForSelectedPaymentType(paymentTypeData.fields);
                } else {
                    setFieldsForSelectedPaymentType([]);
                }
            } else {
                setFieldsForSelectedPaymentType([]);
            }
        } catch (error) {
            setFieldsForSelectedPaymentType([]);
        }
    };
    const getValidationSchema = (values: any, recipientFields: any[] = [], addressFields: any[] = [], addressTypeFeilds: any[] = []) => {
        return FiatPayeeValidationSchema(props?.accountType, fieldsForSelectedCurrency, fieldsForSelectedPaymentType, values, recipientFields, addressFields, addressTypeFeilds);
    };

    const validateImages = () => {
        if (props?.accountType === ADD_RECIPIENT.PERSIONAL) {
            if (!frontImage?.url && !frontImage?.uri) {
                setUploadError((prev: any) => ({ ...prev, frontId: 'Is required' }))
            } else {
                setUploadError((prev: any) => ({ ...prev, frontId: '' }))
            }
            if (!backImage?.url && !backImage?.uri) {
                setUploadError((prev: any) => ({ ...prev, backId: 'Is required' }))
            } else {
                setUploadError((prev: any) => ({ ...prev, backId: '' }))
            }
        }
    };

    const getAddressbookDetails = async () => {
        setErrormsg('');
        setAddressbookListLoading(true);
        const response: any = await AddressbookService.getAddressbookFiatPayeeDetails(props?.id);
        if (response?.ok) {
            setAddressbookListLoading(false);
            setErrormsg("");
            setPayeeEditData(response?.data)
            getPaymentFeilds(response?.data?.currency)
            setPaymentFeildInfo(response?.data?.paymentInfo)
            getCurrencies()
            getPayeesFiatLookup();
            // Auto-load payment type fields if payment type exists
            const paymentType = response?.data?.paymentType || response?.data?.paymentAccountType;
            if (paymentType) {
                await getPaymentTypeFieds(paymentType, response?.data?.currency);
            }
            setInitValues({
                ...initValues,
                favouriteName: response?.data?.favouriteName,
                country: response?.data?.country,
                state: response?.data?.state,
                city: response?.data?.city,
                postalCode: decryptAES(response?.data?.postalCode),
                address: response?.data?.line1,
                businessName: response?.data?.businessName,
                firstName: response?.data?.firstName,
                lastName: response?.data?.lastName,
                birthDate: response?.data?.birthDate || response?.data?.dateOfBirth,
                email: decryptAES(response?.data?.email),
                phoneNumber: decryptAES(response?.data?.phoneNumber),
                documentType: response?.data?.documentType,
                currency: response?.data?.currency,
                documentNumber: response?.data?.documentNumber,
                accountNumber: response?.data?.paymentInfo?.accountNumber,
                recipientEmail: response?.data?.paymentInfo?.recipientEmail,
                recipientMobile: response?.data?.paymentInfo?.recipientMobile,
                recipientName: response?.data?.paymentInfo?.recipientName,
                recipientAddress: response?.data?.paymentInfo?.recipientAddress,
                recipientLastName: response?.data?.paymentInfo?.recipientLastName,
                recipientMiddleName: response?.data?.paymentInfo?.recipientMiddleName,
                recipientFirstName: response?.data?.paymentInfo?.recipientFirstName,
                remarks: response?.data?.paymentInfo?.remarks,
                appName: response?.data?.appName,
                pixKeyId: response?.data?.paymentInfo?.pixKeyId,
                taxId: response?.data?.paymentInfo?.taxId,
                targetName: response?.data?.paymentInfo?.targetName,
                targetLastName: response?.data?.paymentInfo?.targetLastName,
                targetEmail: response?.data?.paymentInfo?.targetEmail,
                targetDocument: response?.data?.paymentInfo?.targetDocument,
                targetBankName: response?.data?.paymentInfo?.targetBankName,
                targetBankCode: response?.data?.paymentInfo?.targetBankCode,
                targetBankBranchId: response?.data?.paymentInfo?.targetBankBranchId,
                targetBankAccountId: response?.data?.paymentInfo?.targetBankAccountId,
                targetBankId: response?.data?.paymentInfo?.targetBankId,
                accountName: response?.data?.paymentInfo?.accountName,
                accountNumber: response?.data?.paymentInfo?.accountNumber || response?.data?.accNoorWalletAddress,
                accountType: response?.data?.paymentInfo?.accountType,
                bankDocumentNumber: response?.data?.paymentInfo?.bankDocumentNumber,
                bankTransferCode: response?.data?.paymentInfo?.bankTransferCode,
                branchId: response?.data?.paymentInfo?.branchId,
                bankName: response?.data?.bankName || response?.data?.paymentInfo?.bankName,
                bankAddress: response?.data?.paymentInfo?.bankAddress,
                bankCountry: response?.data?.paymentInfo?.bankCountry,
                swiftBIC: response?.data?.paymentInfo?.swiftBIC || response?.data?.swiftOrBicCode,
                branchCode: response?.data?.paymentInfo?.branchCode,
                localTransferCode: response?.data?.paymentInfo?.localTransferCode,
                holderName: response?.data?.paymentInfo?.holderName,
                phoneCode: decryptAES(response?.data?.phoneCode),
                stableCoinPayout: response?.data?.stableCoinPayout,
                paymentType: response?.data?.paymentType || response?.data?.paymentAccountType,
                dob: response?.data?.birthDate || response?.data?.dateOfBirth,
                relation: response?.data?.relation,
                serviceProvider: response?.data?.paymentInfo?.serviceProvider,
                businessRegistrationNo: response?.data?.businessRegistrationNo,
                businessType: response?.data?.businessType,
                // Additional fields from API response
                iban: response?.data?.iban ? decryptAES(response?.data?.iban) : '',
                walletaddress: response?.data?.walletaddress ? decryptAES(response?.data?.walletaddress) : '',
                middleName: response?.data?.middleName || '',
                transferType: response?.data?.transferType || '',
                businessRegistrationNumber: response?.data?.businessRegistrationNumber || '',
                walletSource: response?.data?.walletSource || '',
                bankBranch: response?.data?.bankBranch || '',
                swiftOrBicCode: response?.data?.swiftOrBicCode || '',
                ukShortCode: response?.data?.ukShortCode || '',
                paymentAccountType: response?.data?.paymentAccountType || '',
                relationCode: response?.data?.relationCode || '',
                walletType: response?.data?.walletType || '',
                network: response?.data?.network || '',
                proofType: response?.data?.proofType || '',
                otherWallet: response?.data?.otherWallet || '',
                whiteListState: response?.data?.whiteListState || '',
                whiteListRemarks: response?.data?.whiteListRemarks || '',
                street: response?.data?.street || response?.data?.line1 || '',
                rejectReason: response?.data?.rejectReason || '',
                // Dynamically map all paymentInfo fields to form values (but exclude addressType)
                ...Object.keys(response?.data?.paymentInfo || {}).reduce((acc: any, field: string) => {
                    const value = response?.data?.paymentInfo[field];
                    if (value !== undefined && value !== null && field !== 'addressType') {
                        // Decrypt if it's an encrypted field
                        if (field === 'accountNumber' || field === 'recipientAccountNumber') {
                            try {
                                acc[field] = decryptAES(value);
                            } catch (e) {
                                acc[field] = value;
                            }
                        } else {
                            acc[field] = value;
                        }
                    }
                    return acc;
                }, {}),

                // Map additional payment info fields
                channelsubject: response?.data?.paymentInfo?.channelsubject || response?.data?.paymentInfo?.serviceProvider,

                // IMPORTANT: Set addressType at the very end to prevent overwriting
                addressType: response?.data?.addressType,
            });
            // These calls will now correctly update the state in the UI
            setBackSideImg(response?.data?.backImage);
            setFrontImage(response?.data?.frontImage);

        }
        else {
            setErrormsg(isErrorDispaly(response));
            setAddressbookListLoading(false);
        }
    };
    const handlePaymentTypes = (value: any) => {
        let paymentInfo: Record<string, any> = {};

        // Use walletCode data to get fields for the selected currency
        if (value?.currency && walletCode) {
            const currencyData = walletCode?.find((curr: any) => curr.code === value.currency);

            if (currencyData?.paymentInfo) {
                // Collect all fields from all payment types for this currency
                const allFields = new Set<string>();
                currencyData.paymentInfo.forEach((paymentType: any) => {
                    if (paymentType.fields) {
                        paymentType.fields.forEach((field: any) => {
                            if (field.field) {
                                allFields.add(field.field);
                            }
                        });
                    }
                });

                // Include all payment fields that exist in form values
                allFields.forEach(fieldName => {
                    if (value[fieldName] !== undefined && fieldName !== 'currency') {
                        paymentInfo[fieldName] = value[fieldName] || '';
                    }
                });
            }
        }

        setPaymentInfoDynamicValues(paymentInfo);
        return paymentInfo;
    };

    const handleSave = async (value: any) => {
        setErrormsg('');
        if (props?.accountType == ADD_RECIPIENT.PERSIONAL && value?.stableCoinPayouts) {
            const hasFrontImage = frontImage?.url || frontImage?.uri;
            const hasBackImage = backImage?.url || backImage?.uri;

            if (!hasFrontImage && !hasBackImage) {
                setUploadError((prev: any) => ({ ...prev, frontId: 'Is required', backId: 'Is required' }))
                setBtnDisabled(false);
                setLoading(false);
                return;
            } else if (!hasFrontImage) {
                setUploadError((prev: any) => ({ ...prev, frontId: 'Is required' }));
                setBtnDisabled(false);
                setLoading(false);
                return;
            } else if (!hasBackImage) {
                setUploadError((prev: any) => ({ ...prev, backId: 'Is required' }));
                setBtnDisabled(false);
                setLoading(false);
                return;
            } else {
                // Clear errors if both images exist
                setUploadError((prev: any) => ({ ...prev, frontId: '', backId: '' }));
            }
        }

        setBtnDisabled(true);
        setLoading(true);
        const paymentInfo = handlePaymentTypes(value);
        let obj: any = {
            id: props?.id || ADD_RECIPIENT.GUID,
            customerId: userinfo?.customerId || ADD_RECIPIENT.GUID,
            favouriteName: value?.favouriteName,
            currency: value?.currency,
            network: "",
            walletaddress: value?.walletaddress && value?.walletaddres || "",
            createdBy: userinfo?.name,
            proofType: "",
            otherWallet: "",
            whiteListState: value?.whiteListState && value?.whiteListState || ADD_RECIPIENT.SUBMITED,
            whiteListRemarks: null,
            rejectReason: "",
            addressType: value?.addressType || '',
            relationCode: value?.relationCode || "",
            walletType: "",
            status: "Active",
            accountType: props?.accountType?.toLowerCase(),
            businessName: value?.businessName || encryptAES(value?.firstName),
            firstName: encryptAES(value?.firstName),
            lastName: encryptAES(value?.lastName),
            fullName: `${value?.firstName} ${value?.lastName}`.trim(),
            email: encryptAES(value?.email),
            phoneNumber: encryptAES(value?.phoneNumber),
            middleName: value?.middleName || "",
            country: value?.country,
            state: value?.state,
            city: value?.city,
            postalCode: encryptAES(value?.postalCode),
            // birthDate: value?.dob || value?.birthDate || null,
            // bankName: value?.bankName || "",
            line1: value?.street || value?.line1 || "",
            documentType: value?.stableCoinPayout && value?.documentType?.toUpperCase() || "",
            documentNumber: value?.stableCoinPayout && encryptAES(value?.documentNumber) || "",
            businessRegistrationNo: value?.stableCoinPayout && value?.businessRegistrationNo || "",
            businessType: value?.stableCoinPayout && value?.businessType || "",
            paymentType: value?.paymentType,
            transferType: value?.transferType || "",
            modifiedBy: userinfo?.name,
            businessRegistrationNumber: value?.stableCoinPayout && value?.businessRegistrationNo || "",
            iban: value?.iban ? encryptAES(value?.iban) : "",
            walletSource: value?.walletSource || "",
            bankBranch: "",
            phoneCode: encryptAES(value?.phoneCode?.toString()),
            swiftOrBicCode: value?.swiftBIC || "",
            ukShortCode: value?.ukShortCode || "",
            paymentAccountType: value?.paymentType,
            relation: value?.relation,
            metadata: value?.metadata || "",
            stableCoinPayout: value?.stableCoinPayout,
            IsOnTheGo: (props?.screenName == 'fiatWithdraw' || props?.screenName == 'Payout' || props?.screenName == 'payoutEditPayee') ? true : false,
            accountNumber: paymentInfo?.accountNumber || "",
            bankAccountType: paymentInfo?.bankAccountType || "",
            routeNumber: paymentInfo?.routeNumber || "",
            swiftBIC: paymentInfo?.swiftBIC || "",
            bankCountry: paymentInfo?.bankCountry || "",
            bankName: paymentInfo?.bankName || "",
            branchCode: paymentInfo?.branchCode || "",
            bankAddress: paymentInfo?.bankAddress || "",
            bankCity: paymentInfo?.bankCity || "",
            bankPostalCode: paymentInfo?.bankPostalCode || "",
            sortCode: paymentInfo?.sortCode || "",
            paymentInfo
        };
        if (props?.accountType?.toLowerCase() == ADD_RECIPIENT.PERSONAL && value?.stableCoinPayout == true) {
            obj.documentType = value?.documentType;
            obj.documentNumber = encryptAES(value?.documentNumber);
            obj.frontImage = {
                name: frontImage?.fileName || frontImage?.name || frontImage,
                url: frontImage?.uri || frontImage?.url,
            };
            obj.backImage = {
                name: backImage?.fileName || backImage?.name,
                url: backImage?.uri || backImage?.url,
            };
        }
        try {
            let res;
            if (props?.id) {
                res = await AddressbookService.updatePaymentFiat(obj);
            } else {
                res = await AddressbookService.savePaymentFiat(obj);
            }
            if (res?.ok) {
                setBtnDisabled(false);
                setLoading(false);
                if (props?.screenName == "Payout" || props?.screenName == "fiatWithdraw") {
                    navigation?.goBack()
                } else {
                    navigation.navigate(ADD_RECIPIENT.ADDRESS_BOOK_FIAT_LIST)
                }
            }
            else {
                setErrormsg(isErrorDispaly(res));
                setBtnDisabled(false);
                setLoading(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setBtnDisabled(false);
            setLoading(false);
        }
    };

    const handleValidationSave = (validateForm: any) => {
        validateForm().then(async (a: any) => {
            if (Object.keys(a).length > 0) {
                ref?.current?.scrollTo({ y: 0, animated: true });
                setErrormsg('Please check and provide the valid information for all fields highlighted in red color.');
            }
        })
    };
    const handleUpdateValues = (updatedValues: any, setFieldValue: any) => {
        Object.entries(updatedValues).forEach(([key, value]) => {
            setFieldValue(key, value);
        });
    };

    const handlePhoneCode = (item: any, setFieldValue: any) => {
        setFieldValue("phoneCode", item?.code)
    };

    const handlePaymentType = (value: any, setFieldValue: any, currentValues?: any) => {
        setFieldValue('paymentType', value);

        // Clear previous payment type fields
        if (fieldsForSelectedPaymentType?.length > 0) {
            fieldsForSelectedPaymentType.forEach((field: any) => {
                if (field?.field && field.field !== 'paymentType') {
                    setFieldValue(field.field, '');
                }
            });
        }

        // Load fields for selected payment type
        if (currentValues?.currency) {
            getPaymentTypeFieds(value, currentValues.currency);
        }
    };

    const getLookupData = (key: string, field?: any) => {
        // Use dynamic lookup data if available
        if (dynamicLookupData?.[key]) {
            let data = [];
            // Check if it's a direct array or has a data property
            if (Array.isArray(dynamicLookupData[key])) {
                data = dynamicLookupData[key];
            } else if (dynamicLookupData[key]?.data && Array.isArray(dynamicLookupData[key].data)) {
                data = dynamicLookupData[key].data;
            }

            // Format data for CustomPicker (ensure name and value properties)
            return data.map((item: any) => {
                // For branch code, show and use the code
                if (key === 'branchCode') {
                    return {
                        name: item.code,
                        value: item.code
                    };
                }
                // For other fields like bankName, show and use the name
                return {
                    name: item.name || item.code,
                    value: item.name || item.code
                };
            });
        }

        return [];
    };

    const handleBusinessType = (setFieldValue: any) => {
        setFieldValue("businessRegistrationNo", "")
    };

    const handleAddressChange = (text: string, setFieldValue: any) => {
        setFieldValue('address', text);
    };

    const renderDynamicFields = (fields: any[], values: any, setFieldValue: any) => {
        return fields.map((field) => {
            const fieldKey = field.key;
            const fieldValue = values[fieldKey] || field.value || '';

            return {
                ...field,
                currentValue: fieldValue,
                onChange: (value: string) => setFieldValue(fieldKey, value),
                isRequired: field.isMandatory === 'true'
            };
        });
    };
    const getUserProfile = async (type: any) => {
        setErrormsg('');
        try {
            const response: any = await AddressbookService.getProfileInfo(type);
            if (response?.data) {
                const profileData = response?.data;
                if (profileData) {
                    return profileData;
                }
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }
    };


    return {
        getCurrencies,
        getPayeesFiatLookup,
        getPaymentFeilds,
        getAddressbookDetails,
        handleSave,
        getValidationSchema,
        validateImages,
        handleValidationSave,
        handlePhoneCode,
        handlePaymentType,
        handleBusinessType,
        handleUpdateValues,
        formatState,
        getLookupData,
        handleAddressChange,
        renderDynamicFields,
        loadBankData,
        loadBranchData,
        handleCountryChange,
        getUserProfile,
        setDynamicValidationSchema,
        dynamicValidationSchema
    };
};
