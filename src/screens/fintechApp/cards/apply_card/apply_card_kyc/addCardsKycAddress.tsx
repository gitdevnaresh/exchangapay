
import { KeyboardAvoidingView, Platform, Modal, StatusBar, SafeAreaView } from 'react-native'
import React, { useEffect, useState } from 'react'
import ViewComponent from '../../../../../components/view/view'
import { s } from '../../../../../components/theme/scale'
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors'
import { getThemedCommonStyles } from '../../../../../components/CommonStyles'
import Container from '../../../../../components/container/container'
import PageHeader from '../../../../../components/pageHeader/pageHeader'
import CommonAddress, { AddressFormValues } from '../../../onboarding/kyc/commonAddAdress'
import CardsModuleService from '../../../../../apiServices/cards'
import { KYB_INFO_CONSTANTS } from '../../../onboarding/kyb/constants'
import { useSelector } from 'react-redux'
import useEncryptDecrypt from '../../../../../hooks/encDecHook'
import { showAppToast } from '../../../../../components/toasterMessages/ShowMessage'
import { t } from 'i18next'
import { AddCardsAddressModalProps, ApiResponse, CreateAddressObj, ReduxState, UpdateAddressObj } from '../interface'
// Additional interfaces for type safety

const AddCardsAddress = (props: AddCardsAddressModalProps) => {
    const { isVisible, onClose, onSaveSuccess, value } = props;
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { encryptAES } = useEncryptDecrypt();
    const userInfo = useSelector((state:ReduxState ) => state.userReducer?.userDetails);
    const [initValues, setInitValues] = useState<AddressFormValues>({
        firstName: "", lastName: "", favoriteName: "", addressType: "",
        country: "", state: "", city: "", phoneNumber: "", addressLine1: "",
        addressLine2: "", postalCode: "", email: "", phoneCode: "",
        town: "", isDefault: false,
    });
    const isEditing = !!value;



    useEffect(() => {
        if (isVisible) {
            if (isEditing && value) {
                setInitValues(value);
            } else {
                setInitValues({
                    firstName: "", lastName: "", favoriteName: "", addressType: "",
                    country: "", state: "", city: "", phoneNumber: "", addressLine1: "",
                    addressLine2: "", postalCode: "", email: "", phoneCode: "",
                    town: "", isDefault: false,
                });
            }
        }
    }, [isVisible, isEditing, value]);

    const handleUpdate = async (formValues: AddressFormValues): Promise<ApiResponse> => {
        const updateObj: UpdateAddressObj = {
            "id": value?.id,
            "favoriteName": formValues?.favoriteName?.trim() || "",
            "addressType": formValues?.addressType?.trim() || "",
            "email": formValues?.email ? encryptAES(formValues.email) : "",
            "country": formValues?.country || "",
            "state": formValues.state?.trim(),
            "phoneNumber": formValues?.phoneNumber ? encryptAES(formValues.phoneNumber) : "",
            "phoneCode": formValues?.phoneCode ? encryptAES(formValues.phoneCode) : "",
            "isDefault": formValues?.isDefault || false,
            "addressLine1": formValues?.addressLine1?.trim(),
            "addressLine2": formValues?.addressLine2?.trim(),
            "city": formValues?.city?.trim(),
            "postalCode": formValues?.postalCode ? encryptAES(formValues.postalCode) : "",
            "createdBy": userInfo?.userName ? encryptAES(userInfo.userName) : "",
            "modifiedBy": userInfo?.userName ? encryptAES(userInfo.userName) : "",
            "createdDate": new Date(),
            "town": formValues?.town,
            "modifiedDate": new Date(),
            "metadata": null
        };
        try {
            const response = await CardsModuleService.cardsAddressPut(updateObj) as ApiResponse;
            if (response.ok) {
                onClose();
                showAppToast(t("GLOBAL_CONSTANTS.YOUR_ADDRESS_HAS_BEEN_ADDED"), 'success');

            }
            return response

        } catch (error: unknown) {
            return error as ApiResponse;
        }
    }

    const handleSave = async (formValues: AddressFormValues): Promise<ApiResponse | unknown> => {
        try {
            if (isEditing) {
                await handleUpdate(formValues);
            } else {
                const obj: CreateAddressObj = {
                    id: KYB_INFO_CONSTANTS.GUID_FORMATE,
                    customerId: userInfo.id,
                    favoriteName: formValues?.favoriteName?.trim(),
                    addressType: formValues?.addressType?.trim() || "",
                    country: formValues.country,
                    state: formValues.state?.trim(),
                    city: formValues.city?.trim(),
                    addressLine1: formValues.addressLine1?.trim(),
                    addressLine2: formValues.addressLine2?.trim(),
                    postalCode: formValues?.postalCode ? encryptAES(formValues.postalCode) : "",
                    phoneNumber: formValues?.phoneNumber ? encryptAES(formValues.phoneNumber) : "",
                    phoneCode: formValues?.phoneCode ? encryptAES(formValues.phoneCode) : "",
                    email: formValues?.email ? encryptAES(formValues.email) : "",
                    isDefault: formValues?.isDefault || false,
                    createdBy: userInfo?.userName,
                    town: formValues?.town,
                    createdDate: new Date(),
                }
                const response = await CardsModuleService.cardsAddressPost(obj) as ApiResponse;
                if (response.ok) {
                    showAppToast(t("GLOBAL_CONSTANTS.YOUR_ADDRESS_HAS_BEEN_ADDED"), 'success');
                    onSaveSuccess();
                }
                return response;

            }
        } catch (error: unknown) {
            return error
        }
    }

    return (
        <Modal
            visible={isVisible}
            onRequestClose={onClose}
            animationType="slide"
            presentationStyle="fullScreen"
        >
            <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
                <StatusBar barStyle="light-content" backgroundColor={NEW_COLOR.SCREENBG_BLACK || '#000'} />
                <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={s(64)}
                    >
                        <Container style={[commonStyles.container]}>
                            <PageHeader
                                title={isEditing ? "GLOBAL_CONSTANTS.EDIT_ADDRESS" : "GLOBAL_CONSTANTS.ADD_ADDRESS"}
                                onBackPress={onClose}
                            />
                            <CommonAddress
                                isAddAddress={true}
                                screenName={'ProfileAddress'}
                                initValues={initValues}
                                handleSave={handleSave}
                                handleGoBack={onClose}
                            />
                        </Container>
                    </KeyboardAvoidingView>
                </ViewComponent>
            </SafeAreaView>
        </Modal>
    )
}

export default AddCardsAddress


