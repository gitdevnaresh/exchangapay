import React, { useEffect, useReducer, useRef } from 'react';
import { Formik } from 'formik';
import CreatePaymentForm from './createPaymentForm';
import { formatCurrency, formatDateTimeForAPI, isErrorDispaly, toLocalStringWithoutZone } from '../../../../../../utils/helpers';
import { useSelector } from 'react-redux';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import PaymentService from '../../../../../../apiServices/payments';
import { getTabsConfigation } from '../../../../../../../cofiguration';
import { useHardwareBackHandler } from '../../../../../../hooks/backHandleHook';
import { useThemeColors } from '../../../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../../../components/CommonStyles';
import { PAYMENT_LINK_CONSTENTS } from '../../../constants';
import { CreatePaymentObj } from '../../../interface';
import { validationSchema } from '../../../schema';
import StaticPreview from './staticPreview';
import ViewComponent from '../../../../../../components/view/view';
import { CreatePaymentReducer, formState } from '../View/componetns/createPaymentReducer';
import PageHeader from '../../../../../../components/pageHeader/pageHeader';
import ButtonComponent from '../../../../../../components/buttons/button';
import ErrorComponent from '../../../../../../components/errorDisplay/errorDisplay';
import Container from '../../../../../../components/container/container';
import SafeAreaViewComponent from '../../../../../../components/safeArea/safeArea';
import DashboardLoader from '../../../../../../components/loader';
import CustomRBSheet from '../../../../../../components/models/commonBottomSheet';
import { s } from '../../../../../../components/theme/scale';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { logEvent } from '../../../../../../hooks/loggingHook';
import ParagraphComponent from '../../../../../../components/textComponets/paragraphText/paragraph';

const CreateStaticPayment = (props: any) => {
    const [localState, localDispatch] = useReducer(CreatePaymentReducer, formState);
    const customerInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const isFocused = useIsFocused();
    const navigation = useNavigation<any>();
    const NEW_COLOR = useThemeColors();
    const refRBSheet = useRef<any>();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const isPreviewTemplate = getTabsConfigation(PAYMENT_LINK_CONSTENTS.PAYMENTS_QUICK);
    useHardwareBackHandler(() => {
        backArrowButtonHandler();
    })
    const backArrowButtonHandler = () => {
        const returnTab = props?.route?.params?.returnTab ?? 1;
        navigation.navigate(PAYMENT_LINK_CONSTENTS.PAY_IN_GRID, { animation: 'slide_from_left', initialTab: returnTab })
    }
    useEffect(() => {
        if (props?.route?.params?.id) {
            getPaymentDetails()
        }
    }, [isFocused])
    const handleErrorCallBack = (error: any) => {
        if (error) {
            localDispatch({ type: PAYMENT_LINK_CONSTENTS.SET_ERRORS, payload: isErrorDispaly(error) })

        }
    }
    const getPaymentDetails = async () => {
        localDispatch({ type: PAYMENT_LINK_CONSTENTS.SET_DATA_LOADINGl, payload: true })
        try {
            const response: any = await PaymentService.paymentLinkDetails('static', props?.route?.params?.id);
            const formValues = {
                merchantId: response.data.merchantId ?? '',
                invoiceType: response.data.paymentType ?? 'Static',
                orderId: response.data.orderId ?? '',
                amount: response.data.amount ?? null,
                currency: response.data.currency ?? '',
                networkName: response.data.networkName ?? '',
                dueDate: response.data.dueDate ?? "",
                customerWalletId: response.data.customerWalletId ?? "",
                id: response.data.id,
                invoiceNo: response.data.invoiceNumber
            };
            if (response.ok) {
                localDispatch({ type: PAYMENT_LINK_CONSTENTS.SETVALUES, payload: formValues })
                localDispatch({ type: PAYMENT_LINK_CONSTENTS.SET_DATA_LOADINGl, payload: false })
            }
        }
        catch (error) {
            localDispatch({ type: PAYMENT_LINK_CONSTENTS.SET_ERRORS, payload: isErrorDispaly(error) })
            localDispatch({ type: PAYMENT_LINK_CONSTENTS.SET_DATA_LOADINGl, payload: false })
        }
    }
    const handleErrorclear = () => {
        localDispatch({ type: PAYMENT_LINK_CONSTENTS.SET_ERRORS, payload: null })

    }
    interface PaymentResponse {
        walletAddress?: string;
        amountInUsd: number;
        merchantName: string;
        id: string;
        status: string;
        commission: number;
        isPayCommission: boolean;
        paymentLink: string;
        dueDate: string;
        invoiceNo?: string;
    }
    const paymentLinkButton = (props?.route?.params?.id) && "GLOBAL_CONSTANTS.UPDATE_PAYMENT_BUTTON" || "GLOBAL_CONSTANTS.CREATE_PAYMENT_BUTTON";
    const handlePreviewModelClose = () => {
        localDispatch({ type: PAYMENT_LINK_CONSTENTS.SET_PREVIEW_TEMPLATE_MODEL, payload: false })
    }
    const onSubmit = async (values: any) => {
        logEvent("Button Pressed", { action: "Create static paymentslink", currentScreen: "Static paymentslink", nextScreen: "Static paymentslink view" })
        const _objData: CreatePaymentObj = {
            ...values,
            amount: values.amount || 0,
            dueDate: formatDateTimeForAPI(values?.dueDate),
        }
        const updateObj = {
            dueDate: formatDateTimeForAPI(values?.dueDate),
            id: props?.route?.params?.id,
            invoiceNumber: props?.route?.params?.invoiceNo,
            modifiedBy: customerInfo?.userName,
            modifiedDate: formatDateTimeForAPI(new Date())
        }
        localDispatch({ type: PAYMENT_LINK_CONSTENTS.STATIC_BUTTON_LOADER, payload: true });
        try {
            let response;
            if (props?.route?.params?.id) {
                response = await PaymentService.updateInvoice(updateObj);
            } else {
                response = await PaymentService.createPaymentSave(_objData);
            }
            if (response.ok) {
                const responseData = response.data as PaymentResponse;
                let _obj = {
                    ...values,
                    walletAddress: responseData?.walletAddress,
                    amountInUsd: responseData.amountInUsd,
                    // merchantName: responseData.merchantName,
                    id: responseData.id,
                    status: responseData.status,
                    commission: responseData.commission,
                    isPayCommission: responseData.isPayCommission,
                    paymentLink: responseData?.paymentLink,
                    dueDate: formatDateTimeForAPI(responseData?.dueDate),
                    invoiceNo: responseData?.invoiceNo,

                }
                localDispatch({ type: PAYMENT_LINK_CONSTENTS.STATIC_BUTTON_LOADER, payload: false });
                handleErrorCallBack("")
                const returnTab = props?.route?.params?.returnTab ?? 1;
                props.navigation.navigate(PAYMENT_LINK_CONSTENTS.STATIC_PAYMENT_LINK_CONSTANTS.STATIC_PAYMENT_LINK_REDIRECT, { id: _obj?.id || props?.route.params.id, action: props?.route?.params?.id && "Edit" || "Add", invoiceNo: _obj?.invoiceNo, returnTab });
            }
            else {
                handleErrorCallBack(response);
                return;
            }
        }
        catch (error) {
            handleErrorCallBack(error)
        }
        finally {
            localDispatch({ type: PAYMENT_LINK_CONSTENTS.STATIC_BUTTON_LOADER, payload: false });
        }
    }
    const handleCancel = () => {
        backArrowButtonHandler();
    }
    return (
        <ViewComponent style={[commonStyles.flex1]}>
            {props?.route?.params?.id && localState?.dataLoading && (
                <SafeAreaViewComponent><DashboardLoader /></SafeAreaViewComponent>
            )}
            {!(props?.route?.params?.id && localState?.dataLoading) && <Container style={[commonStyles.container]}>
                <PageHeader title={`${!props?.route?.params?.id ? "GLOBAL_CONSTANTS.CREATE_STATIC" : "GLOBAL_CONSTANTS.UPDATE_STATIC_PAYMENT_LINK"}`} onBackPress={backArrowButtonHandler} />
                <KeyboardAwareScrollView
                    contentContainerStyle={[{ flexGrow: 1 }]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    enableOnAndroid={true}
                >
                    {localState?.errors && <ErrorComponent message={localState?.errors} onClose={handleErrorclear} />}
                    {!(props?.route?.params?.id && localState?.dataLoading) && <Formik
                        initialValues={localState.values}
                        onSubmit={onSubmit}
                        validationSchema={validationSchema}
                        enableReinitialize
                        validateOnChange={true}
                        validateOnBlur={true}
                    >
                        {(formik) => {
                            const { touched, handleSubmit, errors, handleBlur, setFieldValue } =
                                formik;
                            return (
                                <ViewComponent>
                                    <CreatePaymentForm touched={touched} errors={errors} setFieldValue={setFieldValue} handleBlur={handleBlur} formik={formik} handleErrorCallBack={handleErrorCallBack} localDispatch={localDispatch} localState={localState} />
                                    <><ButtonComponent title={paymentLinkButton} onPress={handleSubmit} loading={localState?.isBtnLoading} />
                                        <ViewComponent style={[commonStyles.buttongap]} />
                                        <ButtonComponent title={"GLOBAL_CONSTANTS.CANCEL"} onPress={handleCancel} solidBackground={true} disable={localState?.isBtnLoading} />
                                        <ViewComponent style={[commonStyles.formItemSpace]} /></>
                                </ViewComponent >
                            );
                        }}
                    </Formik>}
                    <CustomRBSheet height={"Small"} refRBSheet={refRBSheet} >
                        <ViewComponent>
                            {localState?.isPreviewData?.merchantName && <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.VAULT"} />
                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} text={localState?.isPreviewData?.merchantName || ""} />
                            </ViewComponent>}
                            {localState?.isPreviewData?.merchantName && <ViewComponent style={[commonStyles.listGap]} />}
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.ORDER_ID"} />
                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite, commonStyles.textRight, { width: s(180) }]} text={localState?.isPreviewData?.orderId || ""} />
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.listGap]} />
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.AMOUNT"} />
                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} text={formatCurrency(localState?.isPreviewData?.amount || 0)} />
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.listGap]} />
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.COIN"} />
                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} text={localState?.isPreviewData?.currency || ""} />
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.listGap]} />
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.NETWORK"} />
                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} text={localState?.isPreviewData?.networkName || ""} />
                            </ViewComponent>
                        </ViewComponent>


                    </CustomRBSheet>
                    {localState.isPreviewTemplateVisibile && <StaticPreview visible={localState?.isPreviewTemplateVisibile} data={localState?.previewTemplate} onClose={handlePreviewModelClose} />
                    }
                </KeyboardAwareScrollView>
            </Container>}
        </ViewComponent >
    );
};
export default CreateStaticPayment;

