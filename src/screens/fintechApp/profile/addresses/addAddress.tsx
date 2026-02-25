import { KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors'
import { getThemedCommonStyles } from '../../../../components/CommonStyles'
import Container from '../../../../components/container/container'
import PageHeader from '../../../../components/pageHeader/pageHeader'
import { useHardwareBackHandler } from '../../../../hooks/backHandleHook'
import CommonAddress, { AddressFormValues } from '../../onboarding/kyc/commonAddAdress'
import { ProfilePrimaryServices } from '../../../../apiServices/profile/primary';
import useEncryptDecrypt from '../../../../hooks/encDecHook'
import { useSelector } from 'react-redux'
import { t } from 'i18next'
import { showAppToast } from '../../../../components/toasterMessages/ShowMessage'
import { KYB_INFO_CONSTANTS } from '../../onboarding/kyb/constants'

const AddProfileAddress = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [loading, setLoading] = useState<boolean>(false);
    const [errormsg, setErrormsg] = useState<string>("");
    const { encryptAES } = useEncryptDecrypt();
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const [initValues, setInitValues] = useState<AddressFormValues>({
        firstName: "",
        lastName: "",
        favoriteName: "",
        addressType: "",
        country: "",
        state: "",
        city: "",
        phoneNumber: "",
        addressLine1: "",
        addressLine2: "",
        postalCode: "",
        email: "",
        phoneCode: "",
        town: "",
        isDefault: false,
    });
    // useMemo: Memoize isEditing to prevent recalculation on every render
    const isEditing = useMemo(() => !!props?.route?.params?.value, [props?.route?.params?.value]);

    // useMemo: Memoize default empty address object to prevent recreation on every render
    const defaultAddressValues = useMemo(() => ({
        firstName: "",
        lastName: "",
        favoriteName: "",
        addressType: "",
        country: "",
        state: "",
        city: "",
        phoneNumber: "",
        addressLine1: "",
        addressLine2: "",
        postalCode: "",
        email: "",
        phoneCode: "",
        town: "",
        isDefault: false,
    }), []);

    useEffect(() => {
        if (isEditing) {
            setInitValues(props.route.params.value);
        } else {
            setInitValues(defaultAddressValues);
        }
    }, [props?.route?.params?.value, isEditing, defaultAddressValues]);

    // useCallback: Memoize handleGoBack to prevent recreation on every render
    const handleGoBack = useCallback(() => {
        props?.navigation?.goBack()
    }, [props?.navigation]);

    useHardwareBackHandler(handleGoBack);

    // useCallback: Memoize handleUpdate to prevent recreation on every render
    const handleUpdate = useCallback(async (values: any) => {
        const updateObj = {
            "id": props?.route?.params?.value?.id,
            "favoriteName": values?.favoriteName?.trim() || "",
            "addressType": values?.addressType?.trim() || "",
            "email": values?.email ? encryptAES(values?.email) : "",
            "country": values?.country,
            "state": values?.state?.trim() || "",
            "phoneNumber": values?.phoneNumber ? encryptAES(values?.phoneNumber) : "",
            "phoneCode": values?.phoneCode ? encryptAES(values?.phoneCode) : "",
            "isDefault": values?.isDefault || false,
            "addressLine1": values?.addressLine1?.trim() || "",
            "addressLine2": values?.addressLine2?.trim() || "",
            "city": values?.city?.trim() || "",
            "postalCode": values?.postalCode ? encryptAES(values?.postalCode) : "",
            "createdBy": userInfo?.userName ? encryptAES(userInfo?.userName) : "",
            "modifiedBy": userInfo?.userName ? encryptAES(userInfo?.userName) : "",
            "createdDate": new Date(),
            "town": values?.town || "",
            "modifiedDate": new Date(),
            "metadata": null
        };
        try {
            const response: any = await ProfilePrimaryServices.cardsAddressPut(updateObj);
            if (response.ok) {
                showAppToast(t("GLOBAL_CONSTANTS.YOUR_ADDRESS_HAS_BEEN_UPDATED"), 'success');
                handleGoBack()
            }
            return response;
        } catch (error: any) {
            return error;
        }
    }, [props?.route?.params?.value?.id, encryptAES, userInfo?.userName, handleGoBack]);

    // useCallback: Memoize handleSave to prevent recreation on every render
    const handleSave = useCallback(async (values: AddressFormValues) => {
        try {
            if (props?.route?.params?.value?.id) {
                return await handleUpdate(values);
            } else {
                const obj = {
                    id: KYB_INFO_CONSTANTS.GUID_FORMATE,
                    customerId: userInfo?.id,
                    favoriteName: values?.favoriteName?.trim() || "",
                    addressType: values?.addressType?.trim() || "",
                    country: values?.country || "",
                    state: values?.state?.trim() || "",
                    city: values?.city?.trim() || "",
                    addressLine1: values?.addressLine1?.trim() || "",
                    addressLine2: values?.addressLine2?.trim() || "",
                    postalCode: values?.postalCode ? encryptAES(values?.postalCode) : "",
                    phoneNumber: values?.phoneNumber ? encryptAES(values?.phoneNumber) : "",
                    phoneCode: values?.phoneCode ? encryptAES(values?.phoneCode) : "",
                    email: values?.email ? encryptAES(values?.email) : "",
                    isDefault: values?.isDefault || false,
                    createdBy: userInfo?.userName || "",
                    town: values?.town || "",
                    createdDate: new Date(),
                }
                const repsone = await ProfilePrimaryServices.cardsAddressPost(obj);
                if (repsone.ok) {
                    showAppToast(t("GLOBAL_CONSTANTS.YOUR_ADDRESS_HAS_BEEN_ADDED"), 'success');
                    handleGoBack()
                }
                return repsone;



            }
        } catch (error) {
            return error
        }
    }, [props?.route?.params?.value?.id, handleUpdate, encryptAES, userInfo?.id, userInfo?.userName, handleGoBack]);

    // useMemo: Memoize page title to prevent recalculation on every render
    const pageTitle = useMemo(() => 
        props?.route?.params?.value ? "GLOBAL_CONSTANTS.EDIT_ADDRESS" : "GLOBAL_CONSTANTS.ADD_ADDRESS",
        [props?.route?.params?.value]
    );

    // useMemo: Memoize keyboard avoiding view style to prevent recreation on every render
    const keyboardAvoidingStyle = useMemo(() => ({ flex: 1 }), []);

    // useMemo: Memoize keyboard behavior to prevent recalculation on every render
    const keyboardBehavior = useMemo(() => Platform.OS === 'ios' ? 'padding' : 'height', []);
    return (
        <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
            <KeyboardAvoidingView
                style={keyboardAvoidingStyle}
                behavior={keyboardBehavior}
            >
                <Container style={[commonStyles.container]}>
                    <PageHeader title={pageTitle} onBackPress={handleGoBack} />
                    <CommonAddress isAddAddress={true} screenName={'ProfileAddress'} initValues={initValues} handleSave={handleSave} loading={loading} errormsg={errormsg} handleGoBack={handleGoBack} />
                </Container>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default AddProfileAddress


