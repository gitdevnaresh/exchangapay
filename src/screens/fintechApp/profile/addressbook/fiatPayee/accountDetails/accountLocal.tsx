import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Formik } from "formik";
import ErrorComponent from '../../../../../../components/errorDisplay/errorDisplay';
import { addressBookFiatCryptoGridSk } from '../../../../../../skeletons/payeesSkeltons';
import { useLngTranslation } from '../../../../../../hooks/languagesHook/useLngTranslation';
import useEncryptDecrypt from '../../../../../../hooks/encDecHook';
import { useThemeColors } from '../../../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../../../components/CommonStyles';
import { homeTotalAmtCard } from '../../../../../../skeletons/skeleton_views';
import ViewComponent from '../../../../../../components/view/view';
import ScrollViewComponent from '../../../../../../components/scrollView/scrollView';
import RecipientDetailsSection from './components/recipientDetailsSection';
import AddressSection from './components/addressSection';
import DocumentUploadSection from './components/documentUploadSection';
import { useAccountLocalState } from './components/initialValues';
import { useAccountLocalLogic } from './components/setInitialValues';
import { useImageHandling } from './components/uploadeFileUseState';
import ButtonComponent from '../../../../../../components/buttons/button';
import DashboardLoader from '../../../../../../components/loader';
import SafeAreaViewComponent from '../../../../../../components/safeArea/safeArea';
import { isErrorDispaly } from '../../../../../../utils/helpers';
import CommonCheckbox from '../../../../../../components/checkBoxes/formik/checkBox';
import { HOME_CONST } from '../../../../Dashboard/constant';

import useCountryData from '../../../../../../hooks/countryDataHook/useCountryData';
import PermissionModel from '../../../../../commonScreens/permissionPopup';
import CurrencyPaymentSection from './components/currencyPaymentSection';
import AddressbookService from '../../../../../../apiServices/profile/general/addressbook';

const AccountLocal = React.memo((props: any) => {
    const userinfo = useSelector((state: any) => state.userReducer?.userDetails);
    const nameRef = useRef<any>();
    const ref = useRef<any>();
    const isFocused = useIsFocused();
    const navigation = useNavigation<any>();
    const { t } = useLngTranslation();
    const { encryptAES, decryptAES } = useEncryptDecrypt();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const menuItemsFromStore = useSelector((state: any) => state.userReducer?.menuItems);
    const tabs = menuItemsFromStore?.filter((tab: any) => tab?.isEnabled);
    const showPaymentsSection = tabs?.some((tab: any) => tab?.featureName?.toLowerCase() === HOME_CONST.PAYMENTS);
    const {
        errormsg,
        setErrormsg,
        btnDisabled,
        setBtnDisabled,
        loading,
        setLoading,
        createAddressbookListLoading,
        setAddressbookListLoading,
        initialDataLoading,
        setInitialDataLoading,
        currentCountry,
        countryStates,
        setCountryStates,
        documentType,
        setDocumentType,
        walletCode,
        setWalletCode,
        paymentFields,
        setPaymentFields,
        fieldsForSelectedCurrency,
        setFieldsForSelectedCurrency,
        fieldsForSelectedPaymentType,
        setFieldsForSelectedPaymentType,
        paymentFeildsLoader,
        setPaymentFeildsLoader,
        payeeEditData,
        setPayeeEditData,
        paymentFeildInfo,
        setPaymentFeildInfo,
        accountTypesLu,
        setAccountTypesLu,
        bankLookupData,
        setBankLookupData,
        businessType,
        setBusinessType,
        relationTypes,
        setRelationTypes,
        serviceProviders,
        setServiceProviders,
        dynamicLookupData,
        setDynamicLookupData,
        loadedUrls,
        setLoadedUrls,
        initValues,
        setInitValues,
        setLookUpData,
        lookUpData
    } = useAccountLocalState(props);
    const {
        countryPickerData,
        phoneCodePickerData,
        loading: countryLoading,
        error: countryError,
        clearCache
    } = useCountryData({
        loadCountries: true,
        loadPhoneCodes: true,
    });
    const {
        backImage,
        setBackSideImg,
        frontImage,
        setFrontImage,
        uploading,
        backImgFileLoader,
        uploadedFrontIdFileName,
        uploadedBackIdFileName,
        uploadError,
        setUploadError,
        pickImage,
        FrondpickImage,
        deleteFrontIdImages,
        setPermissionModel,
        permissionModel,
        closePermissionModel,
        permissionTitle,
        permissionMessage

    } = useImageHandling(ref, setErrormsg);
    const {
        getCurrencies,
        getPayeesFiatLookup,
        getDynamicLookupData,
        getPaymentTypeFieds,
        getAddressbookDetails,
        handleSave,
        getValidationSchema,
        validateImages,
        handleValidationSave,
        handlePhoneCode,
        // handleCurrency,
        handlePaymentType,
        handleBusinessType,
        handleUpdateValues,
        formatState,
        getLookupData,
        loadBankData,
        loadBranchData,
        getUserProfile,
        dynamicValidationSchema,
        setDynamicValidationSchema

    } = useAccountLocalLogic({
        props,
        userinfo,
        setErrormsg,
        setWalletCode,
        setDocumentType,
        setAccountTypesLu,
        setBusinessType,
        setRelationTypes,
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
        serviceProviders,
        setServiceProviders,
        setDynamicLookupData,
        setLoadedUrls,
        dynamicLookupData,
        loadedUrls,
        paymentFields,
        setBackSideImg,
        setFrontImage,
        dynamicValidationSchema,
        setDynamicValidationSchema,
        setLookUpData,
        lookUpData,
        walletCode
    });

    const addressBookFiatSk = addressBookFiatCryptoGridSk(12);
    const dynamicPaymentFeildsSkelton = homeTotalAmtCard();
    const [recepientDynamicFeieldDetails, setRecepientDynamicFeieldDetails] = useState<any>({})

    useEffect(() => {
        if (!isFocused) return;

        setErrormsg('');
        setInitialDataLoading(true);
        getRecepientDynamicFeieldDetails();
        const loadInitialData = async () => {
            try {
                if (props?.id) {
                    await getAddressbookDetails();
                } else {
                    await Promise.all([
                        getPayeesFiatLookup(),
                        getCurrencies()
                    ]);
                }
                setInitialDataLoading(false);
            } catch (error) {
                setErrormsg(isErrorDispaly(error));
                setInitialDataLoading(false);
            }
        };

        loadInitialData();
    }, [isFocused, props?.id]);

    const handleError = useCallback(() => {
        setErrormsg("");
        if (countryError) {
            clearCache();
        }
    }, [countryError, clearCache])


    const getRecepientDynamicFeieldDetails = useCallback(async () => {
        setErrormsg('');
        try {
            const response: any = await AddressbookService?.getRecipientDynamicFeildsFiat();
            if (response?.ok) {
                const parsedDetails =
                    typeof response?.data === "string"
                        ? JSON?.parse(response?.data)
                        : response?.data;
                setRecepientDynamicFeieldDetails(parsedDetails);
            } else {
                setErrormsg(isErrorDispaly(response));

            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }
    }, []);





    return (
        <ViewComponent style={[commonStyles.flex1]}>
            <ScrollViewComponent
                ref={ref}
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {(errormsg || countryError) && (
                    <>
                        <ErrorComponent message={errormsg || countryError || ''} onClose={handleError} />
                        <ViewComponent style={[commonStyles.mb16]} />
                    </>
                )}

                {(createAddressbookListLoading || initialDataLoading || countryLoading) && (
                    <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                        <DashboardLoader />
                    </SafeAreaViewComponent>
                )}

                {!createAddressbookListLoading && !initialDataLoading && !countryLoading && (
                    <ViewComponent>
                        <Formik
                            initialValues={initValues}
                            onSubmit={(values) => {
                                validateImages();
                                handleSave(values);
                            }}
                            validationSchema={dynamicValidationSchema}
                            enableReinitialize
                            validateOnBlur={true}
                            validateOnChange={true}
                        >
                            {(formik) => {
                                const { touched, handleSubmit, errors, handleBlur, values, setFieldValue, validateForm, handleChange, setFieldError, setErrors } = formik;
                                useEffect(() => {

                                    if (recepientDynamicFeieldDetails?.recipient || recepientDynamicFeieldDetails?.address) {
                                        setDynamicValidationSchema(getValidationSchema(values, recepientDynamicFeieldDetails, recepientDynamicFeieldDetails?.address, recepientDynamicFeieldDetails?.account));
                                    }

                                    if (props?.isStableCoinPayout) {
                                        setFieldValue('stableCoinPayout', true);
                                    }
                                }, [values.addressType, values.stableCoinPayout, props?.isStableCoinPayout, recepientDynamicFeieldDetails?.recipient, recepientDynamicFeieldDetails?.address, values.currency, values.paymentType]);
                                return (
                                    <ViewComponent>
                                        <RecipientDetailsSection
                                            values={values}
                                            touched={touched}
                                            errors={errors}
                                            handleBlur={handleBlur}
                                            handleChange={handleChange}
                                            setFieldValue={setFieldValue}
                                            nameRef={nameRef}
                                            countryCodelist={phoneCodePickerData}
                                            relationTypes={relationTypes}
                                            NEW_COLOR={NEW_COLOR}
                                            commonStyles={commonStyles}
                                            t={t}
                                            handlePhoneCode={handlePhoneCode}
                                            props={props}
                                            userProfile={getUserProfile}
                                            countries={countryPickerData}
                                            setCountryStates={setCountryStates}
                                            setInitValues={setInitValues}
                                            lookUpData={lookUpData}
                                            setRelationTypes={setRelationTypes}
                                            dynamicValidationSchema={dynamicValidationSchema}
                                            setDynamicValidationSchema={setDynamicValidationSchema}
                                            setFieldError={setFieldError}
                                            dynamicRecipientDetails={recepientDynamicFeieldDetails?.recipient}
                                            setErrors={setErrors}
                                            setPaymentFeildInfo={setPaymentFeildInfo}
                                            dynamicAddressTypeDetails={recepientDynamicFeieldDetails?.account}
                                        />

                                        <AddressSection
                                            values={values}
                                            touched={touched}
                                            errors={errors}
                                            handleBlur={handleBlur}
                                            setFieldValue={setFieldValue}
                                            nameRef={nameRef}
                                            countries={countryPickerData}
                                            countryStates={countryStates}
                                            NEW_COLOR={NEW_COLOR}
                                            commonStyles={commonStyles}
                                            formik={formik}
                                            currentCountry={currentCountry}
                                            setCountryStates={setCountryStates}
                                            getCurrencies={getCurrencies}
                                            formatState={formatState}
                                            dynamicAddressDetails={recepientDynamicFeieldDetails?.address}
                                        />

                                        <CurrencyPaymentSection
                                            values={values}
                                            touched={touched}
                                            errors={errors}
                                            handleBlur={handleBlur}
                                            setFieldValue={setFieldValue}
                                            setFieldError={setFieldError}
                                            walletCode={walletCode}
                                            countries={countryPickerData}
                                            paymentFields={paymentFields}
                                            fieldsForSelectedCurrency={fieldsForSelectedCurrency}
                                            fieldsForSelectedPaymentType={paymentFields}
                                            paymentFeildsLoader={paymentFeildsLoader}
                                            paymentFeildInfoView={paymentFeildInfo}
                                            NEW_COLOR={NEW_COLOR}
                                            commonStyles={commonStyles}
                                            t={t}
                                            props={props}
                                            dynamicPaymentFeildsSkelton={dynamicPaymentFeildsSkelton}
                                            handlePaymentType={handlePaymentType}
                                            handleUpdateValues={handleUpdateValues}
                                            getLookupData={getLookupData}
                                            getDynamicLookupData={getDynamicLookupData}
                                            loadBankData={loadBankData}
                                            getPaymentTypeFieds={getPaymentTypeFieds}
                                            loadBranchData={loadBranchData}
                                            getCurrencies={getCurrencies}
                                            setDynamicValidationSchema={setDynamicValidationSchema}
                                            setFieldsForSelectedCurrency={setFieldsForSelectedCurrency}
                                            setPaymentFeildInfo={setPaymentFeildInfo}
                                            setErrors={setErrors}

                                        />
                                        {showPaymentsSection && (<>
                                            <ViewComponent style={[commonStyles.sectionGap]} />
                                            <CommonCheckbox
                                                label={"GLOBAL_CONSTANTS.PLEASE_SELECT_THIS_CHECKBOX_TO_ADD_ADDITIONAL_INFO_FOR_FIAT_PAYOUTS"}
                                                name={'stableCoinPayout'}
                                                labelStyle={[commonStyles.dflex]}
                                                customStyle={[commonStyles.alignStart]}
                                                disabled={(props?.id && !props?.screenName) ? true : false}


                                            />
                                        </>)}

                                        {values.stableCoinPayout && (
                                            <DocumentUploadSection
                                                values={values}
                                                touched={touched}
                                                errors={errors}
                                                handleBlur={handleBlur}
                                                nameRef={nameRef}
                                                documentType={documentType}
                                                businessType={businessType}
                                                uploading={uploading}
                                                backImgFileLoader={backImgFileLoader}
                                                frontImage={frontImage}
                                                backImage={backImage}
                                                uploadError={uploadError}
                                                uploadedFrontIdFileName={uploadedFrontIdFileName}
                                                uploadedBackIdFileName={uploadedBackIdFileName}
                                                NEW_COLOR={NEW_COLOR}
                                                commonStyles={commonStyles}
                                                FrondpickImage={FrondpickImage}
                                                pickImage={pickImage}
                                                deleteFrontIdImages={deleteFrontIdImages}
                                                handleBusinessType={handleBusinessType}
                                                setFieldValue={setFieldValue}
                                                props={props}
                                                setErrormsg={setErrormsg}
                                                ref={ref}
                                            />)}

                                        <ViewComponent style={[commonStyles.sectionGap]} />
                                        <ButtonComponent
                                            title={"GLOBAL_CONSTANTS.SAVE"}
                                            customTitleStyle={undefined}
                                            onPress={() => {
                                                handleValidationSave(validateForm);
                                                handleSubmit();
                                            }}
                                            icon={undefined}
                                            disable={btnDisabled}
                                            loading={loading}
                                        />

                                        <ViewComponent style={[commonStyles.sectionGap]} />
                                    </ViewComponent>
                                );
                            }}
                        </Formik>
                    </ViewComponent>
                )}
            </ScrollViewComponent>
            <PermissionModel permissionDeniedContent={permissionMessage} title={permissionTitle} closeModel={closePermissionModel} addModelVisible={permissionModel} />
        </ViewComponent>
    );
});

export default AccountLocal;
