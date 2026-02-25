

import React, { useState, useCallback } from 'react';
import { Field } from "formik";
import CustomPicker from '../../../../../../../components/customPicker/CustomPicker';
import ViewComponent from '../../../../../../../components/view/view';
import DynamicFieldRenderer from '../applyForBankFields/bankPayeeFields';
import Loadding from '../../../../../../../components/skelton/skeltons';
import { ADD_RECIPIENT } from '../../addRecipient/constant';
import { useThemeColors } from '../../../../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../../../../components/CommonStyles';
import { FiatPayeeValidationSchema } from './validationSchema';
import { useFocusEffect } from '@react-navigation/native';
import useEncryptDecrypt from '../../../../../../../hooks/encDecHook';
import LabelComponent from '../../../../../../../components/textComponets/lableComponent/lable';
import ParagraphComponent from '../../../../../../../components/textComponets/paragraphText/paragraph';
import CommonTouchableOpacity from '../../../../../../../components/touchableComponents/touchableOpacity';
import { s } from '../../../../../../../components/theme/scale';
import { ADD_BOOK_CONST } from '../../../constants';

interface CurrencyPaymentSectionProps {
    values: any;
    touched: any;
    errors: any;
    handleBlur: any;
    setFieldValue: any;
    setFieldError: any;
    walletCode: any;
    paymentFields: any;
    fieldsForSelectedCurrency: any;
    fieldsForSelectedPaymentType: any;
    paymentFeildsLoader: boolean;
    t: any;
    props: any;
    dynamicPaymentFeildsSkelton: any;
    handlePaymentType: (value: any, setFieldValue: any) => void;
    handleUpdateValues: (updatedValues: any, setFieldValue: any) => void;
    getLookupData: (key: string, field?: any) => any[];
    getDynamicLookupData: (url: string, fieldKey: string) => void;
    loadBankData: (country: string) => void;
    getPaymentTypeFieds: (paymentType?: string, currency?: string) => void;
    loadBranchData: (bankName: string) => void;
    countries: any;
    getCurrencies: (value: any, setFieldValue: any) => void;
    getValidationSchema: (values: any) => any;
    setDynamicValidationSchema: React.Dispatch<React.SetStateAction<any>>;
    setFieldsForSelectedCurrency: any;
    paymentFeildInfoView: any;
    setPaymentFeildInfo?: (value: any) => void;
    setErrors: React.Dispatch<React.SetStateAction<any>>;
}

/**
 * Main component function for handling currency selection and payment type tabs
 */
const CurrencyPaymentSection: React.FC<CurrencyPaymentSectionProps> = ({
    values,
    touched,
    errors,
    handleBlur,
    setFieldValue,
    setFieldError,
    walletCode,
    paymentFields,
    fieldsForSelectedCurrency,
    fieldsForSelectedPaymentType,
    paymentFeildsLoader,
    paymentFeildInfoView,
    props,
    dynamicPaymentFeildsSkelton,
    handlePaymentType,
    handleUpdateValues,
    getLookupData,
    getDynamicLookupData,
    loadBankData,
    getPaymentTypeFieds,
    loadBranchData,
    countries,
    getCurrencies,
    getValidationSchema,
    setDynamicValidationSchema,
    setFieldsForSelectedCurrency,
    setPaymentFeildInfo: setParentPaymentFeildInfo, setErrors
}) => {
    // Theme and styling hooks
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    // State management for component functionality
    const [countriesForCurrency, setCountriesForCurrency] = useState<any[]>([]); // Available countries for selected currency
    const [paymentFeildInfo, setPaymentFeildInfo] = useState<any[]>([]); // Current tab's field configuration
    const [allTabFields, setAllTabFields] = useState<any[]>([]); // All fields from all payment types (for validation)
    const [paymentTypes, setPaymentTypes] = useState<any[]>([]); // Available payment types for selected currency
    const [activeTabIndex, setActiveTabIndex] = useState<number>(0); // Currently active tab index
    const [sharedFormData, setSharedFormData] = useState<any>({}); // Form data shared across tabs

    // Encryption/decryption utility for sensitive fields
    const { decryptAES } = useEncryptDecrypt();

    /**
     * Effect hook that runs when screen comes into focus
     * Initializes currency selection if currency value exists
     */
    useFocusEffect(
        React.useCallback(() => {
            if (values?.currency && walletCode) {
                handleCurrencySelect(values.currency);
            }
        }, [values?.currency, walletCode])
    );

    /**
     * Effect hook for automatic error navigation
     * Switches to the tab containing validation errors when errors occur
     */
    React.useEffect(() => {
        if (errors && Object.keys(errors).length > 0) {
            switchToTabWithErrors(errors);
        }
    }, [errors, paymentTypes]);

    /**
     * Handles currency selection from dropdown
     * Processes payment types, initializes tabs, and sets up form fields
     * 
     * @param currencyCode - Selected currency code (e.g., 'USD', 'EUR')
     */
    const handleCurrencySelect = useCallback((currencyCode: string) => {
        // Find selected currency from available wallet codes
        const selectedCurrency = walletCode?.find(
            (item: any) => item?.code?.toLowerCase() === currencyCode?.toLowerCase()
        );
        if (!selectedCurrency) return;

        // Set basic currency information in form
        setFieldValue('currencyCode', selectedCurrency?.code);
        setFieldValue('currencyName', selectedCurrency?.name);
        setCountriesForCurrency(selectedCurrency?.countries || []);
        setFieldValue('bankCountry', ''); // Reset bank country selection
        setErrors?.("");

        // Parse payment information (can be string or object)
        let fieldsArray: any[] = [];
        if (typeof selectedCurrency?.paymentInfo === "string") {
            try {
                fieldsArray = JSON.parse(selectedCurrency.paymentInfo);
            } catch (error) {
                fieldsArray = []; // Fallback to empty array if parsing fails
            }
        } else {
            fieldsArray = selectedCurrency?.paymentInfo || [];
        }

        // Initialize tab system
        setPaymentTypes(fieldsArray); // Set available payment types for tabs
        setActiveTabIndex(0); // Always start with first tab

        // Aggregate all fields from all payment types for validation schema
        const allFields: any[] = [];
        fieldsArray.forEach((paymentType: any) => {
            if (paymentType.fields) {
                allFields.push(...paymentType.fields);
            }
        });
        setAllTabFields(allFields);

        // Initialize first tab if payment types exist
        if (fieldsArray.length > 0) {
            setFieldValue(ADD_BOOK_CONST.PAYMENT_TYPE, fieldsArray[0]?.name || '');
            const dynamicFields = fieldsArray[0]?.fields || [];
            setPaymentFeildInfo(dynamicFields);
            setParentPaymentFeildInfo?.(dynamicFields);
            handleTabFieldsInit(dynamicFields, allFields);
        }
    }, [setErrors, setFieldValue, setParentPaymentFeildInfo, setPaymentFeildInfo, walletCode]);

    /**
     * Initializes form fields for the selected tab/payment type
     * Handles field pre-population, decryption, and validation setup
     * 
     * @param dynamicFields - Fields for the current tab
     * @param allFields - All fields from all tabs (for validation)
     */
    const handleTabFieldsInit = useCallback((dynamicFields: any[], allFields: any[] = []) => {
        // Initialize each field with existing values
        dynamicFields.forEach((field: any) => {
            const fieldName = field.field;
            let value = paymentFeildInfoView?.[fieldName] ?? '';

            // Decrypt sensitive fields (account numbers)
            if (fieldName === 'accountNumber' || fieldName === 'recipientAccountNumber') {
                try {
                    value = decryptAES(value);
                } catch {
                    /* leave as is if decryption fails */
                }
            }

            // Set field value without triggering validation (false parameter)
            setFieldValue(fieldName, value, false);
            // Clear any existing field errors
            setFieldError(fieldName, undefined);
        });

        // Update parent component with current fields
        setFieldsForSelectedCurrency(dynamicFields);

        // Generate and set validation schema for all fields
        const schema = FiatPayeeValidationSchema(
            props?.accountType,
            allFields, // Use all fields for comprehensive validation
            allFields,
            values
        );
        setDynamicValidationSchema(schema);
    }, [decryptAES, paymentFeildInfoView, props?.accountType, setDynamicValidationSchema, setFieldError, setFieldsForSelectedCurrency, setFieldValue, values]);

    /**
     * Automatically switches to the tab containing validation errors
     * Improves UX by showing users where errors need to be fixed
     * 
     * @param errors - Formik errors object
     */
    const switchToTabWithErrors = useCallback((errors: any) => {
        const errorFields = Object.keys(errors);

        if (errorFields.length === 0) return;

        // Find the first tab that contains any error fields
        for (let tabIndex = 0; tabIndex < paymentTypes.length; tabIndex++) {
            const tabFields = paymentTypes[tabIndex]?.fields || [];
            const hasError = tabFields.some((field: any) => errorFields.includes(field.field));

            if (hasError) {
                setActiveTabIndex(tabIndex); // Switch to error-containing tab
                break; // Stop at first tab with errors
            }
        }
    }, [paymentTypes]);

    /**
     * Handles manual tab switching by user
     * Preserves form data from current tab before switching
     * 
     * @param index - Target tab index
     */
    const handleTabChange = useCallback((index: number) => {
        // Save current tab's form data
        const currentFields = paymentFeildInfo;
        const currentTabData: any = {};
        currentFields.forEach((field: any) => {
            const fieldName = field.field;
            if (values[fieldName]) {
                currentTabData[fieldName] = values[fieldName];
            }
        });

        // Merge with existing shared data
        const updatedSharedData = { ...sharedFormData, ...currentTabData };
        setSharedFormData(updatedSharedData);

        // Switch to new tab
        setActiveTabIndex(index);
    }, [paymentFeildInfo, sharedFormData, values]);

    /**
     * Effect hook that responds to tab changes
     * Updates form fields and validation when active tab changes
     */
    React.useEffect(() => {
        if (paymentTypes.length === 0) return;

        const newTabType = paymentTypes[activeTabIndex];
        if (!newTabType) return;

        // Update payment type field with new tab's name
        setFieldValue(ADD_BOOK_CONST.PAYMENT_TYPE, newTabType?.name || '');

        // Set fields for the new active tab
        const newFields = newTabType?.fields || [];
        setPaymentFeildInfo(newFields);
        setParentPaymentFeildInfo?.(newFields);

        // Update validation schema with all available fields
        const schema = FiatPayeeValidationSchema(
            props?.accountType,
            allTabFields, // Use all fields for comprehensive validation
            allTabFields,
            values
        );
        setDynamicValidationSchema(schema);
        setFieldsForSelectedCurrency(allTabFields);
    }, [activeTabIndex, paymentTypes]);

    /**
     * Renders the tab bar for multiple payment types
     * Only shows when there are multiple payment types available
     * 
     * @returns JSX element or null
     */
    const renderTabBar = useCallback(() => {
        // Don't render tab bar if only one or no payment types
        if (paymentTypes.length <= 1) return null;

        return (
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.tabBarContainer, { overflow: 'hidden', marginBottom: s(16) }]}>
                {paymentTypes.map((paymentType: any, index: number) => {
                    const isActive = activeTabIndex === index;
                    const isFirstTab = index === 0;
                    const isLastTab = index === paymentTypes.length - 1;

                    // Build tab styling based on position and state
                    const tabStyleList: any[] = [
                        commonStyles.tabButton,
                        isActive ? commonStyles.activeTabButton : commonStyles.inactiveTabButton,
                    ];

                    if (isFirstTab) {
                        tabStyleList.push({
                            borderTopLeftRadius: s(30),
                            borderBottomLeftRadius: s(30),
                            ...(isLastTab && {
                                borderTopRightRadius: s(30),
                                borderBottomRightRadius: s(30),
                            }),
                        });
                    } else if (isLastTab) {
                        tabStyleList.push({
                            borderTopRightRadius: s(30),
                            borderBottomRightRadius: s(30),
                        });
                    }

                    return (
                        <CommonTouchableOpacity
                            key={`${paymentType.type || paymentType.name}-${index}`}
                            style={tabStyleList}
                            activeOpacity={0.8}
                            onPress={() => handleTabChange(index)}
                        >
                            <ParagraphComponent
                                style={[
                                    commonStyles.fs16,
                                    commonStyles.fw600,
                                    isActive ? commonStyles.textWhite : commonStyles.textGrey
                                ]}
                                text={paymentType.type || paymentType.name || `Tab ${index + 1}`}
                            />
                        </CommonTouchableOpacity>
                    );
                })}
            </ViewComponent>
        );
    }, [activeTabIndex, commonStyles, handleTabChange, paymentTypes]);

    return (
        <ViewComponent>
            <ViewComponent style={[commonStyles.sectionGap]} />

            <ViewComponent>
                <ParagraphComponent style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} text={"GLOBAL_CONSTANTS.BANK_ACCOUNT"} />
                <Field
                    modalTitle={"GLOBAL_CONSTANTS.SELECT_CURRENCY"}
                    activeOpacity={0.9}
                    label={"GLOBAL_CONSTANTS.CURRENCY"}
                    touched={touched.currency}
                    name={ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.WALLE_CODE}
                    error={errors.currency}
                    handleBlur={handleBlur}
                    data={walletCode || []}
                    placeholder={"GLOBAL_CONSTANTS.SELECT_CURRENCY"}
                    placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                    component={CustomPicker}
                    isOnlyCountry={true}
                    requiredMark={<LabelComponent text={" *"} style={[commonStyles.textRed]} />}
                    onChange={(value: any) => {
                        // Clear payment type when currency changes
                        setFieldValue(ADD_BOOK_CONST.PAYMENT_TYPE, '');
                        // Process new currency selection
                        handleCurrencySelect(value);
                    }}
                />
            </ViewComponent>
            <ViewComponent>
                <ViewComponent style={[commonStyles.formItemSpace]} />

                {renderTabBar()}

                {(values?.currency && values?.paymentType && paymentFeildsLoader) && (
                    <Loadding contenthtml={dynamicPaymentFeildsSkelton} />
                )}

                <DynamicFieldRenderer
                    fields={paymentFeildInfoView || []}
                    touched={touched}
                    errors={errors}
                    handleBlur={handleBlur}
                    setFieldValue={setFieldValue}
                    getLookupData={getLookupData}
                    getDynamicLookupData={getDynamicLookupData}
                    values={values}
                    handleUpdateValues={handleUpdateValues}
                    setFieldError={setFieldError}
                    paymentFeildInfo={paymentFeildInfoView}
                    mode={props?.id && "edit"}
                    loadBankData={loadBankData}
                    loadBranchData={loadBranchData}
                    selectedCurrencyCountries={countriesForCurrency}

                />
            </ViewComponent>
        </ViewComponent>
    );
};

export default CurrencyPaymentSection;


