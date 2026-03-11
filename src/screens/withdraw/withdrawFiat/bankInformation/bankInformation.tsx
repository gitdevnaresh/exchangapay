import React, { useEffect, useState, useRef } from 'react';
import { Formik, Field } from 'formik';
import { Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import Container from '../../../../newComponents/container/container';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import ViewComponent from '../../../../newComponents/view/view';
import FormikTextInput from '../../../../newComponents/textInputComponents/formik/textInput';
import CustomPickerModal from '../../../../newComponents/pickerComponents/formik/customPicker';
import TextAreaInput from '../../../../newComponents/textInputComponents/formik/TextAreaInput';
import ButtonComponent from '../../../../newComponents/buttons/button';
import { isErrorDispaly } from '../../../../utils/helpers';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';
import { useHardwareBackHandler } from '../../../../hooks/HardwareBackHandler';
import { s } from '../../../../constants/theme/scale';
import SwokipayDashboardLoader from '../../../../newComponents/swokipayloader';
import { setBankInfoData } from '../../../../redux/actions/withdrawActions';
import ConfirmationPopup from '../../../commonScreens/confirmationPopup/ConfirmationPopup';
import { getPaymentMethodFields } from './paymentMethodsConfig';
import { WithDrawServices } from '../../../../apiServices/withdrawApis/withdrawServices';

const BankInformation = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();
    const beneficiaryData = useSelector((state: any) => state.withdrawReducer.beneficiaryData);
    const withdrawFormData = props?.route?.params?.values || {};
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [formFields, setFormFields] = useState<any[]>([]);
    const rbSheetRef = useRef<any>(null);
    const [initialValues, setInitialValues] = useState({});
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

    useEffect(() => {
        loadFields();
        if (withdrawFormData?.receiveCurrency) {
            fetchPaymentMethods(withdrawFormData.receiveCurrency);
        }
    }, []);
    const fetchPaymentMethods = async (currency: string) => {
        try {
            const response: any = await WithDrawServices.fetchPaymentMethods(currency);
            if (response.status === 200) {
                setPaymentMethods(response.data.paymentMethod || []);
            }
        } catch (error) {
            console.error('Error fetching payment methods:', error);
        }
    };

    const loadFields = () => {
        try {
            setLoading(true);
            const paymentMethod = withdrawFormData?.paymentMethod || '';
            const transferType = withdrawFormData?.transferType || '';
            const fields = getPaymentMethodFields(paymentMethod);
            setFormFields(fields);
            
            console.log('=== Beneficiary Data from Redux ===');
            console.log('beneficiaryData:', JSON.stringify(beneficiaryData, null, 2));
            console.log('withdrawFormData:', JSON.stringify(withdrawFormData, null, 2));
            console.log('===================================');
            
            const values = fields.reduce((acc: any, field: any) => {
                const fieldName = field.name;
                if (field.readonly) {
                    if (fieldName === 'targetFirstName' || fieldName === 'recipientName') acc[fieldName] = beneficiaryData?.firstName || '';
                    else if (fieldName === 'targetLastName') acc[fieldName] = beneficiaryData?.lastName || '';
                    else if (fieldName === 'targetEmail') acc[fieldName] = beneficiaryData?.email || '';
                    else if (fieldName === 'targetIdentificationDocument') acc[fieldName] = beneficiaryData?.documentNumber || '';
                    else if (fieldName === 'recipientAddress') acc[fieldName] = beneficiaryData?.addressLine1 || '';
                    else acc[fieldName] = beneficiaryData?.[fieldName] || '';
                } else {
                    acc[fieldName] = beneficiaryData?.[fieldName] || '';
                }
                return acc;
            }, {});
            values.transferType = transferType;
            values.paymentMethod = paymentMethod;
            values.sendAmount = beneficiaryData?.sendAmount || withdrawFormData?.sendAmount || '';
            values.receiveAmount = beneficiaryData?.receiveAmount || withdrawFormData?.receiveAmount || '';
            values.sendCurrency = beneficiaryData?.sendCurrency || withdrawFormData?.sendCurrency || '';
            values.receiveCurrency = beneficiaryData?.receiveCurrency || withdrawFormData?.receiveCurrency || '';
            
            console.log('=== Bank Information Page Loaded ===');
            console.log('Initial Values:', JSON.stringify(values, null, 2));
            console.log('====================================');
            
            setInitialValues(values);
        } catch (error) {
            setError(isErrorDispaly(error));
        } finally {
            setLoading(false);
        }
    };

    useHardwareBackHandler(() => {
        confirmCancel();
        return true;
    });

    const handleSubmit = async (values: any) => {
        console.log('=== FINAL BANK INFORMATION SUBMISSION ===');
        console.log('Complete Submission Data:', JSON.stringify(values, null, 2));
        console.log('\nBeneficiary Data from Redux:', JSON.stringify(beneficiaryData, null, 2));
        console.log('=========================================');
        setError('');
        Keyboard.dismiss();
        setLoading(true);
        try {
            dispatch(setBankInfoData(values));
            // navigation.goBack();
        } catch (err: any) {
            setError(isErrorDispaly(err));
        } finally {
            setLoading(false);
        }
    };

    const handleBackPress = () => {
        Keyboard.dismiss();
        confirmCancel();
    };

    const confirmCancel = () => {
        rbSheetRef.current?.open();
    };

    const handleCancel = () => {
        rbSheetRef.current?.close();
        navigation.goBack();
    };

    const closePopup = () => {
        rbSheetRef.current?.close();
    };

    const isFormComplete = (values: any) => {
        return formFields.every(field => {
            if (!field.required) return true;
            const value = values[field.name];
            return value && value.toString().trim() !== '';
        });
    };

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container>
                <PageHeader title={'GLOBAL_CONSTANTS.BANK_ACCOUNT_INFORMATION'} onBackPress={handleBackPress} />
                {loading && <SwokipayDashboardLoader />}
                {error && <ErrorComponent message={error} screen={true} />}
                {!loading && (formFields.length > 0 || Object.keys(initialValues).length > 0) && (
                    <KeyboardAwareScrollView
                        contentContainerStyle={[{ flexGrow: 1 }]}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        enableOnAndroid={true}
                        extraScrollHeight={s(150)}
                        enableAutomaticScroll={true}
                    >
                        <ViewComponent>
                            <Formik
                                initialValues={initialValues}
                                onSubmit={handleSubmit}
                                enableReinitialize
                            >
                                {({ handleSubmit, values }) => {
                                    const isButtonEnabled = isFormComplete(values) && !loading;
                                    return (
                                    <>
                                        {/* Payment Method - Non-editable */}
                                        <Field
                                            name="paymentMethod"
                                            component={CustomPickerModal}
                                            data={paymentMethods}
                                            label={'GLOBAL_CONSTANTS.PAYMENT_METHOD'}
                                            isRequired={false}
                                            disabled={true}
                                            selectionType="name"
                                        />
                                        <ViewComponent style={commonStyles.formItemSpace} />

                                        {formFields.map((field: any, index: number) => (
                                            <React.Fragment key={field.name}>
                                                {field.type === 'dropdown' ? (
                                                    <Field
                                                        name={field.name}
                                                        component={CustomPickerModal}
                                                        data={field.options || []}
                                                        label={field.label}
                                                        isRequired={field.required}
                                                        placeholder={field.placeholder || `Select ${field.label}`}
                                                        // searchPlaceholder={`Search ${field.label}`}
                                                        disabled={field.readonly}
                                                    />
                                                ) : field.type === 'textarea' ? (
                                                    <TextAreaInput
                                                        label={field.label}
                                                        name={field.name}
                                                        placeholder={field.placeholder}
                                                        isRequired={field.required}
                                                        editable={!field.readonly}
                                                    />
                                                ) : (
                                                    <FormikTextInput
                                                        label={field.label}
                                                        name={field.name}
                                                        placeholder={field.placeholder}
                                                        isRequired={field.required}
                                                        keyboardType={field.type === 'email' ? 'email-address' : field.type === 'phone' ? 'phone-pad' : 'default'}
                                                        editable={!field.readonly}
                                                    />
                                                )}
                                                <ViewComponent style={commonStyles.formItemSpace} />
                                            </React.Fragment>
                                        ))}

                                        <ViewComponent style={[commonStyles.dflex, { gap: s(12), marginTop: s(30), marginBottom: s(30) }]}>
                                            <ViewComponent style={{ flex: 1 }}>
                                                <ButtonComponent
                                                    title={'GLOBAL_CONSTANTS.BACK'}
                                                    onPress={handleBackPress}
                                                    solidBackground={true}
                                                />
                                            </ViewComponent>
                                            <ViewComponent style={{ flex: 1 }}>
                                                <ButtonComponent
                                                    title={'GLOBAL_CONSTANTS.SUBMIT'}
                                                    onPress={handleSubmit}
                                                    loading={loading}
                                                    disable={!isButtonEnabled}
                                                />
                                            </ViewComponent>
                                        </ViewComponent>
                                    </>
                                );
                                }}
                            </Formik>
                        </ViewComponent>
                    </KeyboardAwareScrollView>
                )}
            </Container>
            <ConfirmationPopup
                rbSheetRef={rbSheetRef}
                title="GLOBAL_CONSTANTS.ARE_YOU_SURE_YOU_WANT_TO_GO_BACK"
                message="GLOBAL_CONSTANTS.ANY_UNSAVED_DETAILS_MAY_BE_LOST"
                cancelButtonText="GLOBAL_CONSTANTS.STAY_ON_PAGE"
                confirmButtonText="GLOBAL_CONSTANTS.GO_BACK"
                onCancel={closePopup}
                onConfirm={handleCancel}
            />
        </ViewComponent>
    );



};

export default BankInformation;
