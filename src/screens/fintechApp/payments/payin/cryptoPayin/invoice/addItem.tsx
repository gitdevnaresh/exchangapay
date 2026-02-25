import React, { useEffect, useRef, useState } from "react";
import { Field, Formik, FormikProps } from "formik";
import { KeyboardAvoidingView, Platform } from "react-native";
import { getThemedCommonStyles } from "../../../../../../components/CommonStyles";
import InputDefault from '../../../../../../components/textInputComponents/DefaultFiat';
import { useThemeColors } from "../../../../../../hooks/themedHook/useThemeColors";
import { ItemDetailForm, ItemDetailFormInterface, ItemDetailsProps } from "../../../interface";
import { invoiceAddItemDetailsSchema } from "../../../schema";
import { PAYMENT_LINK_CONSTENTS } from "../../../constants";
import { s } from "../../../../../../constants/styels/scale";
import ViewComponent from "../../../../../../components/view/view";
import ScrollViewComponent from "../../../../../../components/scrollView/scrollView";
import Container from "../../../../../../components/container/container";
import LabelComponent from "../../../../../../components/textComponets/lableComponent/lable";
import ButtonComponent from "../../../../../../components/buttons/button";
import ParagraphComponent from "../../../../../../components/textComponets/paragraphText/paragraph";
import { CurrencyText } from "../../../../../../components/textComponets/currencyText/currencyText";
import PageHeader from "../../../../../../components/pageHeader/pageHeader";
import AmountInput from "../../../../../../components/amountInput/amountInput";

/**
 * A pure function to calculate amounts based on form values.
 * This is moved outside the component for better separation of concerns and reusability.
 */
const calculateAllAmounts = (values: ItemDetailForm) => {
    const quantity = parseFloat(values?.quantity) || 0;
    const unitPrice = parseFloat(values?.unitPrice) || 0;
    const discountPercentage = parseFloat(values?.discountPercentage) || 0;
    const taxPercentage = parseFloat(values?.taxPercentage) || 0;

    const total = quantity * unitPrice;
    const discountAmount = (discountPercentage / 100) * total;
    const amountAfterDiscount = total - discountAmount;
    const taxAmount = (taxPercentage / 100) * amountAfterDiscount;
    const finalAmount = amountAfterDiscount + taxAmount;

    return {
        discountAmount,
        taxAmount,
        totalAmount: finalAmount
    };
};

const ItemDetails: React.FC<ItemDetailsProps> = (props) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const nameRef = useRef<any>();
    const item: ItemDetailFormInterface | undefined = props.route.params.item;

    const handleBack = (): void => {
        props.navigation.goBack();
    };

    const uuidv4 = (): string => {
        return PAYMENT_LINK_CONSTENTS.PAYMENTS_SCHEMA.GUID_FORMATE.replace(/x/g, function (c: string): string {
            const randumnumberval: number = Math.random() * 16 | 0;
            return c === 'x' ? randumnumberval.toString(16) : (randumnumberval & 0x3 | 0x8).toString(16);
        });
    };

    // This state is now ONLY for setting the initial values for Formik.
    // It does not get updated on every keypress.
    const [initialFormValues, setInitialFormValues] = useState<ItemDetailForm>({
        id: uuidv4(),
        itemName: '',
        quantity: '',
        unitPrice: '',
        discountPercentage: '',
        taxPercentage: '',
        amount: 0,
    });

    // This effect correctly sets the initial values when editing an item.
    // It runs only when the `item` prop changes.
    useEffect(() => {
        if (item) {
            setInitialFormValues({
                id: item.id,
                itemName: item.itemName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discountPercentage: item.discountPercentage,
                taxPercentage: item.taxPercentage,
                amount: item.amount,
            });
        }
    }, [item]);

    const onSubmit = (values: ItemDetailForm): void => {
        // Recalculate amounts on submit to ensure data is correct and self-contained.
        const { discountAmount, taxAmount, totalAmount } = calculateAllAmounts(values);

        const itemDetailsPayload = {
            ...values,
            amount: totalAmount, // Ensure the final amount is updated
            discountAmount,
            taxAmount
        };
        props.route.params.onGoBack(itemDetailsPayload);
        props.navigation.goBack();
    };

    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            <Container style={commonStyles.container}>
                <PageHeader
                    title={props?.route?.params?.item ? "GLOBAL_CONSTANTS.EDIT_ITEM_DETAILS_TITLE" : "GLOBAL_CONSTANTS.ADD_ITEM_DETAILS"}
                    onBackPress={handleBack}
                />
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <ScrollViewComponent
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ flexGrow: 1 }}
                    >

                        <ViewComponent style={[commonStyles.mb8]} />
                        <Formik
                            initialValues={initialFormValues}
                            validationSchema={invoiceAddItemDetailsSchema}
                            onSubmit={onSubmit}
                            enableReinitialize // This is necessary to populate the form when editing an item
                            validateOnChange={true}
                            validateOnBlur={true}
                        >
                            {(formik: FormikProps<ItemDetailForm>) => {
                                const { touched, handleSubmit, errors, handleBlur, values, setFieldValue } = formik;
                                const { discountAmount, taxAmount, totalAmount } = calculateAllAmounts(values);
                                return (
                                    <ViewComponent style={[commonStyles.sectionGap]}>
                                        <Field
                                            touched={touched?.itemName}
                                            name={PAYMENT_LINK_CONSTENTS.INVOICE_FORM_CONSTENTS.FIELD_NAME_ITEM_NAME}
                                            label={"GLOBAL_CONSTANTS.ITEM_NAME"}
                                            error={errors?.itemName}
                                            handleBlur={handleBlur}
                                            onHandleChange={(text: string) => setFieldValue("itemName", text)}
                                            placeholder={"GLOBAL_CONSTANTS.ENTER_ITEM_NAME"}
                                            component={InputDefault}
                                            innerRef={nameRef}
                                            editable={!props?.formik?.values?.id}
                                            requiredMark={<LabelComponent text={" *"} style={[commonStyles.textRed]} />}
                                            maxLength={30}
                                        />
                                        <ViewComponent style={[commonStyles.formItemSpace]} />
                                        <Field
                                            touched={touched?.quantity}
                                            keyboardType={PAYMENT_LINK_CONSTENTS.NUMARIC}
                                            error={errors?.quantity}
                                            name={PAYMENT_LINK_CONSTENTS.INVOICE_FORM_CONSTENTS.FIELD_NAME_QUANTITY}
                                            label={"GLOBAL_CONSTANTS.QUANTITY"}
                                            handleBlur={handleBlur}
                                            onHandleChange={(text: string) => {
                                                // Remove minus sign, decimals, commas, and non-numeric characters
                                                const cleanText = text.replace(/^-/, '').replace(/\./g, '').replace(/,/g, '').replace(/[^0-9]/g, '');
                                                // Add comma separation for display only if valid number (Indian format)
                                                const formattedText = cleanText && !isNaN(Number(cleanText)) ? Number(cleanText).toLocaleString('en-IN') : '';
                                                setFieldValue("quantity", formattedText);
                                            }}
                                            placeholder={"GLOBAL_CONSTANTS.ENTER_QUANTITY"}
                                            component={InputDefault}
                                            innerRef={nameRef}
                                            editable={!props?.formik?.values?.id}
                                            requiredMark={<LabelComponent text={" *"} style={[commonStyles.textRed]} />}
                                            maxLength={10}
                                        />

                                        <ViewComponent style={[commonStyles.formItemSpace]} />
                                        <AmountInput
                                            value={values?.unitPrice}
                                            label={"GLOBAL_CONSTANTS.UNIT_PRICE"}
                                            showError={errors?.unitPrice}
                                            touched={touched?.unitPrice}
                                            maxLength={10}
                                            placeholder={"GLOBAL_CONSTANTS.ENTER_AMOUNT"}
                                            onChangeText={(text: string) => setFieldValue("unitPrice", text)}
                                            editable={!props?.formik?.values?.id}
                                            isRequired={true}
                                        />
                                        <ViewComponent style={[commonStyles.formItemSpace]} />
                                        <LabelComponent text={"GLOBAL_CONSTANTS.DISCOUNT"} style={[commonStyles.inputLabel]} multiLanguageAllows={true}>
                                            <LabelComponent text={"*"} style={commonStyles.textError} />
                                        </LabelComponent>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.Inputbg, {
                                            borderWidth: 1, borderColor: (touched.discountPercentage && errors.discountPercentage) ? NEW_COLOR.TEXT_RED : NEW_COLOR.INPUT_BORDER, borderTopRightRadius: s(8),   // top right corner
                                            borderBottomRightRadius: s(8),
                                            borderTopLeftRadius: s(8),   // top right corner
                                            borderBottomLeftRadius: s(8)
                                        }]}>
                                            <ViewComponent style={[{ width: s(80), borderRightWidth: 1, borderRightColor: NEW_COLOR.INPUT_BORDER, justifyContent: 'center', height: s(48), borderTopLeftRadius: s(5), borderBottomLeftRadius: s(5) }]}>
                                                <ParagraphComponent text={"%"} style={[commonStyles.fs16, commonStyles.fw400, commonStyles.textGrey2, commonStyles.textCenter]} />
                                            </ViewComponent>
                                            <ViewComponent style={[commonStyles.flex1, { minWidth: s(60) }]}>
                                                <Field
                                                    keyboardType={PAYMENT_LINK_CONSTENTS.NUMARIC}
                                                    touched={touched?.discountPercentage}
                                                    name={PAYMENT_LINK_CONSTENTS.INVOICE_FORM_CONSTENTS.FIELD_NAME_DISCOUNT}
                                                    placeholder={"GLOBAL_CONSTANTS.ENTER_DISCOUNT"}
                                                    handleBlur={handleBlur}
                                                    onHandleChange={(text: string) => {
                                                        // Limit to 5 chars and 2 decimals
                                                        let limitedText = text.slice(0, 5);
                                                        const decimalIndex = limitedText.indexOf('.');
                                                        if (decimalIndex !== -1 && limitedText.length - decimalIndex - 1 > 2) {
                                                            limitedText = limitedText.slice(0, decimalIndex + 3);
                                                        }
                                                        setFieldValue("discountPercentage", limitedText);
                                                    }}
                                                    customContainerStyle={{ flex: 1, minHeight: 30 }}
                                                    component={InputDefault}
                                                    inputStyleChange={{ borderWidth: 0, borderBottomWidth: 0, flex: 1 }}
                                                    editable={!props?.formik?.values?.id}
                                                    maxLength={5}
                                                    errorStyle={{ display: 'none' }}
                                                    borderStyle={{ borderWidth: 0, borderBottomWidth: 0 }}
                                                />
                                            </ViewComponent>
                                            <ViewComponent style={[{ minWidth: s(100), borderLeftWidth: 1, borderLeftColor: NEW_COLOR.INPUT_BORDER, justifyContent: 'center', height: s(48), paddingHorizontal: 14 }]}>
                                                <CurrencyText value={discountAmount} decimalPlaces={4} style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textWhite, commonStyles.textCenter]} />
                                            </ViewComponent>
                                        </ViewComponent>



                                        {touched.discountPercentage && errors.discountPercentage && <ParagraphComponent style={[commonStyles.inputrequirederrormessage, { marginTop: 4 }]} text={errors.discountPercentage} multiLanguageAllows={true} />}

                                        <ViewComponent style={[commonStyles.formItemSpace]} />
                                        <LabelComponent text={"GLOBAL_CONSTANTS.TAX"} style={[commonStyles.inputLabel]} multiLanguageAllows={true}>
                                            <LabelComponent text={"*"} style={commonStyles.textError} />
                                        </LabelComponent>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.Inputbg, {
                                            borderWidth: 1, borderColor: (touched.taxPercentage && errors.taxPercentage) ? NEW_COLOR.TEXT_RED : NEW_COLOR.INPUT_BORDER, borderTopRightRadius: s(8),   // top right corner
                                            borderBottomRightRadius: s(8),
                                            borderTopLeftRadius: s(8),   // top right corner
                                            borderBottomLeftRadius: s(8)
                                        }]}>
                                            <ViewComponent style={[{ width: s(80), borderRightWidth: 1, borderRightColor: NEW_COLOR.INPUT_BORDER, justifyContent: 'center', height: s(48) }]}>
                                                <ParagraphComponent text={"%"} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey2, commonStyles.textCenter]} />
                                            </ViewComponent>
                                            <ViewComponent style={[commonStyles.flex1, { minWidth: s(60) }]}>
                                                <Field
                                                    touched={touched?.taxPercentage}
                                                    keyboardType={PAYMENT_LINK_CONSTENTS.NUMARIC}
                                                    name={PAYMENT_LINK_CONSTENTS.INVOICE_FORM_CONSTENTS.FIELD_NAME_TAX}
                                                    onHandleChange={(text: string) => {
                                                        // Limit to 5 chars and 2 decimals
                                                        let limitedText = text.slice(0, 5);
                                                        const decimalIndex = limitedText.indexOf('.');
                                                        if (decimalIndex !== -1 && limitedText.length - decimalIndex - 1 > 2) {
                                                            limitedText = limitedText.slice(0, decimalIndex + 3);
                                                        }
                                                        setFieldValue("taxPercentage", limitedText);
                                                    }}
                                                    handleBlur={handleBlur}
                                                    customContainerStyle={{ flex: 1, minHeight: 30 }}
                                                    inputStyleChange={{ borderWidth: 0, borderBottomWidth: 0, flex: 1 }}
                                                    errorStyle={{ display: 'none' }}
                                                    placeholder={"GLOBAL_CONSTANTS.ENTER_TAX"}
                                                    component={InputDefault}
                                                    editable={!props?.formik?.values?.id}
                                                    maxLength={5}
                                                    borderStyle={{ borderWidth: 0, borderBottomWidth: 0 }}
                                                />
                                            </ViewComponent>
                                            <ViewComponent style={[{ minWidth: s(100), borderLeftWidth: 1, borderLeftColor: NEW_COLOR.INPUT_BORDER, justifyContent: 'center', height: s(48), paddingHorizontal: 14 }]}>
                                                <CurrencyText value={taxAmount} decimalPlaces={4} style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textWhite, commonStyles.textCenter]} />
                                            </ViewComponent>
                                        </ViewComponent>
                                        {touched.taxPercentage && errors.taxPercentage && <ParagraphComponent style={[commonStyles.inputrequirederrormessage, { marginTop: 4 }]} text={errors.taxPercentage} multiLanguageAllows={true} />}

                                        <ViewComponent style={[commonStyles.formItemSpace]} />
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                                            <LabelComponent text={"GLOBAL_CONSTANTS.AMOUNT"} style={[commonStyles.listsecondarytext]} multiLanguageAllows={true} />
                                            <CurrencyText value={totalAmount} decimalPlaces={4} style={[commonStyles.listprimarytext]} />
                                        </ViewComponent>

                                        <ViewComponent style={[commonStyles.formItemSpace, commonStyles.formItemSpace]} />
                                        <ButtonComponent title={"GLOBAL_CONSTANTS.OK"} onPress={handleSubmit} disable={false} />
                                        <ViewComponent style={[commonStyles.buttongap]} />
                                        <ButtonComponent title={"GLOBAL_CONSTANTS.CANCEL"} onPress={handleBack} solidBackground={true} />
                                        <ViewComponent style={[commonStyles.sectionGap, commonStyles.mb10]} />
                                    </ViewComponent>
                                );
                            }}
                        </Formik>
                    </ScrollViewComponent>
                </KeyboardAvoidingView>
            </Container>
        </ViewComponent>
    );
};

export default ItemDetails;
