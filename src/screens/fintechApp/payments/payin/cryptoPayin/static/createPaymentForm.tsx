import React, { useEffect, useRef } from 'react';
import CustomPicker from '../../../../../../components/customPicker/CustomPicker';
import { Field } from 'formik';
import InputDefault from '../../../../../../components/textInputComponents/DefaultFiat';
import { isErrorDispaly } from '../../../../../../utils/helpers';
import PaymentService from '../../../../../../apiServices/payments';
import { useThemeColors } from '../../../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../../../components/CommonStyles';
import { PAYMENT_LINK_CONSTENTS } from '../../../constants';
import ViewComponent from '../../../../../../components/view/view';
import LabelComponent from '../../../../../../components/textComponets/lableComponent/lable';
import TextMultiLanguage from '../../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import AmountInput from '../../../../../../components/amountInput/amountInput';
import DatePickerComponent from '../../../../../../components/datePickers/formik/datePicker';

const CreatePaymentForm = (props: any) => {
    const nameRef = useRef();
    const { values, touched, errors, handleBlur, setFieldValue } = props.formik;
    const { lookups } = props.localState;

    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const idExists = values?.id;

    const displayAmount = idExists
        ? (values?.amount !== null ? values.amount.toString() : '0')
        : (values?.amount !== null ? values.amount : 0);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    useEffect(() => {
        initialize();
    }, []);

    useEffect(() => {
        if (idExists && lookups?.merchantLookup?.length > 0) {
            const selectedCombination = lookups.merchantLookup.find((item:any) =>
                // item.merchantId === values.merchantId &&
                item.currency === values.currency &&
                item.networkName === values.networkName
            );
            if (selectedCombination) {
                setFieldValue('selectedVaultCombination', selectedCombination.id);
            }
        }
    }, [idExists, lookups.merchantLookup, values.merchantId, values.currency, values.networkName]);

    const setErrorMessages = (error: any) => {
        let _obj = { ...props.localState.errors };
        _obj.errors = error;
        props?.handleErrorCallBack(_obj);
    }

    const initialize = async () => {
        props.localDispatch({ type: PAYMENT_LINK_CONSTENTS.SETIS_LOADING, payload: PAYMENT_LINK_CONSTENTS.INITIAL_LOADING });
        try {
            const response: any = await PaymentService.paymentCoins();
            if (response.ok) {
                const flattenedData = response.data.flatMap((merchant: any) =>
                    merchant.merchantsDetails.flatMap((coin: any) =>
                        coin.networks.map((network: any) => ({
                            id: `${merchant.id}-${coin.code}-${network.code}`,
                            name: response.data?.length > 1 && `${coin.code}(${network.code})` || `${coin.code}-${network.code}`,
                            // merchantId: merchant.id,
                            merchantName: merchant.name,
                            currency: coin.code,
                            networkName: network.code,
                            customerWalletId: network.customerWalletId
                        }))
                    )
                );
                let _obj = { ...props.localState.lookups, merchantLookup: flattenedData };
                props.localDispatch({ type: PAYMENT_LINK_CONSTENTS.SET_LOOKUPS, payload: _obj });
            } else {
                setErrorMessages(isErrorDispaly(response));
            }
        } catch (error) {
            setErrorMessages(isErrorDispaly(error));
        }
    };

    return (
        <ViewComponent>
            <ViewComponent>
                {values?.invoiceType !== PAYMENT_LINK_CONSTENTS.INVOICE_TITLE && <>
                    <Field
                        name={'selectedVaultCombination'}
                        activeOpacity={0.9}
                        label={`${"GLOBAL_CONSTANTS.VAULT"}`}
                        touched={touched?.merchantId}
                        error={errors?.merchantId}
                        handleBlur={handleBlur}
                        data={lookups?.merchantLookup}
                        placeholder={"GLOBAL_CONSTANTS.SELECT_VAULT"}
                        placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                        onChange={(selectedId: any) => {
                            const selectedCombination = lookups?.merchantLookup?.find((item: any) => item.id === selectedId);
                            if (selectedCombination) {
                                setFieldValue('selectedVaultCombination', selectedId);
                                setFieldValue(PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.MERCHANT, selectedCombination.merchantId);
                                setFieldValue(PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_PLACEHOLDER.MERCHANT_NAME, selectedCombination.merchantName);
                                setFieldValue(PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.COIN, selectedCombination.currency);
                                setFieldValue(PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.NETWORK, selectedCombination.networkName);
                                setFieldValue(PAYMENT_LINK_CONSTENTS.CUSTOMER_WALLET_ID, selectedCombination.customerWalletId);
                                props.formik.setFieldError(PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.MERCHANT, '');
                                props.formik.setFieldTouched(PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.MERCHANT, false);
                            }
                        }}
                        selectionType="id"
                        component={CustomPicker}
                        isCurrencyLogo={true}
                        disabled={!!props?.formik?.values?.id}
                        modalTitle={"GLOBAL_CONSTANTS.SELECT_VAULT"}
                        requiredMark={<LabelComponent text={" *"} style={[commonStyles.textRed]} />}
                    />
                    <LabelComponent multiLanguageAllows={true} text={"GLOBAL_CONSTANTS.THE_FUNDS_PAID_BY_CLIENT_WILL"} style={[commonStyles.mt8,]} />
                    <ViewComponent style={[commonStyles.formItemSpace]} />
                    <Field
                        touched={touched?.orderId}
                        name={PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.ORDER_ID}
                        label={`${"GLOBAL_CONSTANTS.ORDER_ID"}`}
                        error={errors?.orderId}
                        handleBlur={handleBlur}
                        placeholder={"GLOBAL_CONSTANTS.ENTER_ORDER_ID"}
                        component={InputDefault}
                        innerRef={nameRef}
                        editable={!props?.formik?.values?.id}
                    // requiredMark={<LabelComponent text={" *"} style={[commonStyles.textRed]} />}
                    />
                    {!errors?.orderId && <LabelComponent multiLanguageAllows={true} text={"GLOBAL_CONSTANTS.HELP_TO_UNDERSTAND_WHAT_IS_YOUR_CLIENT_PAYING"} style={commonStyles.mt20} />}
                    <ViewComponent style={[commonStyles.sectionGap]} />

                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.ENTER_AMOUNT_TITLE"} style={[commonStyles.sectionTitle]} />
                    <ViewComponent style={[commonStyles.titleSectionGap]} />
                    <ViewComponent style={[commonStyles.titleSectionGap]} />
                    <AmountInput
                        value={displayAmount}
                        label={`${"GLOBAL_CONSTANTS.AMOUNT"}`}
                        touched={touched?.amount}
                        showError={errors?.amount}
                        maxLength={23}
                        placeholder={"GLOBAL_CONSTANTS.ENTER_AMOUNT"}
                        editable={!idExists}
                        isRequired={true}
                        maxDecimals={4}
                        onChangeText={(text) => { setFieldValue(PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.AMOUNT, text) }}
                    />
                    <ViewComponent style={[commonStyles.formItemSpace]} />

                    <DatePickerComponent
                        name={PAYMENT_LINK_CONSTENTS.INVOICE_FORM_CONSTENTS.DUE_DATE}
                        label={"GLOBAL_CONSTANTS.DUE_DATE"}
                        placeholder={"GLOBAL_CONSTANTS.SELECT_DUE_DATE"}
                        minimumDate={tomorrow}
                        mode="date"
                        required={true}
                        iconColor={NEW_COLOR.TEXT_WHITE}
                    />

                    <ViewComponent style={[commonStyles.formItemSpace]} />
                    <ViewComponent style={[commonStyles.formItemSpace]} />
                </>}
            </ViewComponent>
        </ViewComponent>
    );
}
export default CreatePaymentForm;
