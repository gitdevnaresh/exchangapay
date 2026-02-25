/**
 * Validation Schema for Fiat Payee Forms
 * 
 * Handles dynamic field validation based on currency and payment type selection.
 * Includes regex pattern fixing for server-side validation rules.
 * 
 * @author Development Team
 * @version 2.0.0
 */

import * as Yup from "yup";
import { ADD_RECIPIENT } from '../../addRecipient/constant';
import { validateAccountNumber, validateDocummentNumber } from "../../../commonRecipientFunction";
// import { validateAccountNumber, validateDocummentNumber } from "../../../CommonRecipientFunction";

// Regex patterns for input sanitization
const HTML_REGEX = /<[^>]*>?/g; // Detects HTML tags
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FAB0}-\u{1FAB6}\u{1FAC0}-\u{1FAC2}\u{1FAD0}\u{200D}\u{2640}\u{200D}\u{2642}]/gu; // Detects emojis

/**
 * Main validation schema function for fiat payee forms
 * 
 * @param accountType - Type of account (personal/business)
 * @param fieldsForSelectedCurrency - Dynamic fields from selected currency
 * @param fieldsForSelectedPaymentType - Fields for selected payment type
 * @param values - Current form values for conditional validation
 * @param recipentFeilds - Dynamic recipient field configuration
 * @param addressFeilds - Dynamic address field configuration
 * @returns Yup validation schema
 */
export const FiatPayeeValidationSchema = (accountType: string, fieldsForSelectedCurrency: any[] = [], fieldsForSelectedPaymentType: any[] = [], values: any = {}, recipentFeilds: any = {}, addressFeilds: any[] = [], addressTypeFeilds: any[] = []) => {
    /**
     * Fixes invalid regex patterns received from server
     * Common issues: double backslashes, incorrect dash positioning in character classes
     * 
     * @param pattern - Raw regex pattern from server
     * @returns Fixed regex pattern or original if valid
     */
    const fixRegexPattern = (pattern: string) => {
        if (!pattern || typeof pattern !== 'string') return pattern;

        // Test if pattern is already valid
        try {
            new RegExp(pattern);
            return pattern;
        } catch (error) {
            // Fix common regex issues from server data
            return pattern
                .replace(/\\\\s/g, '\\s') // Fix double-escaped whitespace
                .replace(/\\\\d/g, '\\d') // Fix double-escaped digits
                .replace(/\\\\-/g, '\\-') // Fix double-escaped hyphens
                .replace(/\[([^\]]*)\\-([^\]]*)\]/g, '[$1$2-]'); // Fix dash position in character classes
        }
    };

    /**
     * Build dynamic validation rules for payment fields
     * Based on currency configuration from server
     */
    const dynamicPaymentValidations: Record<string, any> = {};
    fieldsForSelectedCurrency.forEach((field: any) => {
        const fieldKey = field.field || field.key;
        if (!fieldKey) return;

        // Handle mandatory fields
        if (field.isMandatory === "true" || field.isMandatory === true) {
            let validation = Yup.string().required(ADD_RECIPIENT.IS_REQUIRED);

            // Apply server-provided regex validation if available
            if (field.validation) {
                const fixedPattern = fixRegexPattern(field.validation);
                try {
                    validation = validation.matches(new RegExp(fixedPattern), `Invalid ${field.label}`);
                } catch (error) {
                    // Skip regex validation if pattern is still invalid after fixing
                }
            }

            // Special handling for email fields
            if (fieldKey && typeof fieldKey === 'string' && fieldKey.includes('email')) {
                validation = validation.email("GLOBAL_CONSTANTS.INVALID_EMAIL")
                    .matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, "GLOBAL_CONSTANTS.INVALID_EMAIL");
            }

            dynamicPaymentValidations[fieldKey] = validation;
        } else {
            // Handle optional fields (still apply regex if provided)
            let validation = Yup.string();
            if (field.validation) {
                const fixedPattern = fixRegexPattern(field.validation);
                try {
                    validation = validation.matches(new RegExp(fixedPattern), `Invalid ${field.label}`);
                } catch (error) {
                    // Skip regex validation if pattern is invalid
                }
            }
            dynamicPaymentValidations[fieldKey] = validation;
        }
    });

    /**
     * Build dynamic recipient field validations
     */
    let recipientValidations: Record<string, any> = {};
    recipentFeilds?.recipient?.forEach((field: any) => {
        if (!field.isEnable) return;

        const fieldKey = field.field;
        let validation = Yup.string();

        // Check field conditions to determine if field should be validated
        const shouldValidateField = field.conditions?.every((condition: any) => {
            if (condition.source === 'context') {
                return values?.addressType === 'First Party' ? condition.equals === true : condition.equals === false;
            }
            if (condition.source === 'form') {
                if (condition.key === 'accountTypeDetails') {
                    return accountType?.toLowerCase() === condition.equals;
                }
                if (condition.key === 'addressTypeDetails') {
                    return values?.addressType === condition.equals;
                }
            }
            return true;
        }) ?? true;

        if (!shouldValidateField) return;

        // Apply field-specific validations
        if (fieldKey === 'firstName') {
            validation = validation
                .matches(/^[a-zA-Z\s]*$/, "GLOBAL_CONSTANTS.INVALID_FIRST_NAME")
                .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", value => {
                    if (!value) return true;
                    return !EMOJI_REGEX.test(value);
                })
                .test('no-html', "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", value => {
                    if (!value) return true;
                    return !HTML_REGEX.test(value);
                })
                .max(50, "GLOBAL_CONSTANTS.FIRST_NAME_MUST_50CHARACTER");
        } else if (fieldKey === 'lastName') {
            validation = validation
                .matches(/^[a-zA-Z\s]*$/, ADD_RECIPIENT.VALIDATION_CONSTANTS.LAST_NAME)
                .test('no-emojis', ADD_RECIPIENT.VALIDATION_CONSTANTS.LAST_NAME, value => {
                    if (!value) return true;
                    return !EMOJI_REGEX.test(value);
                })
                .test('no-html', ADD_RECIPIENT.VALIDATION_CONSTANTS.LAST_NAME, value => {
                    if (!value) return true;
                    return !HTML_REGEX.test(value);
                })
                .max(50, "GLOBAL_CONSTANTS.LAST_NAME_MUST_50CHARACTER");
        } else if (fieldKey === 'businessName') {
            validation = validation
                .matches(/^[a-zA-Z0-9\s]*$/, "GLOBAL_CONSTANTS.INVALID_BUSINESS_NAME")
                .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_BUSINESS_NAME", value => {
                    if (!value) return true;
                    return !EMOJI_REGEX.test(value);
                })
                .test('no-html', "GLOBAL_CONSTANTS.INVALID_BUSINESS_NAME", value => {
                    if (!value) return true;
                    return !HTML_REGEX.test(value);
                })
                .max(50, "GLOBAL_CONSTANTS.BUSINESS_NAME_MUST_50CHARACTER");
        } else if (fieldKey === 'email') {
            validation = validation
                .email("GLOBAL_CONSTANTS.INVALID_EMAIL")
                .matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, "GLOBAL_CONSTANTS.INVALID_EMAIL");
        } else if (fieldKey === 'phone') {
            let phoneValidation = Yup.string().matches(/^\d{6,12}$/, ADD_RECIPIENT.VALIDATION_CONSTANTS.PH_NUMBER);
            let phoneCodeValidation = Yup.string();

            if (field.isMandatory === "true" || field.isMandatory === true) {
                phoneValidation = phoneValidation.required(ADD_RECIPIENT.IS_REQUIRED);
                phoneCodeValidation = phoneCodeValidation.required(ADD_RECIPIENT.IS_REQUIRED);
            }

            recipientValidations['phoneNumber'] = phoneValidation;
            recipientValidations['phoneCode'] = phoneCodeValidation;
            return; // Skip adding phone to validations as we handle it separately
        }

        if (field.isMandatory === "true" || field.isMandatory === true) {
            validation = validation.required(fieldKey === 'firstName' ? "GLOBAL_CONSTANTS.IS_REQUIRED" : ADD_RECIPIENT.IS_REQUIRED);
        }

        recipientValidations[fieldKey] = validation;
    });

    let addressTypeValidations: Record<string, any> = {};
    addressTypeFeilds?.forEach((field: any) => {
        if (!field.isEnable) return;

        const fieldKey = field.field;
        if (fieldKey === 'addressType' && (field.isMandatory === "true" || field.isMandatory === true)) {
            addressTypeValidations[fieldKey] = Yup.string().required(ADD_RECIPIENT.IS_REQUIRED);
        }
    });

    /**
     * Build dynamic address field validations
     */
    let addressValidations: Record<string, any> = {};
    addressFeilds.forEach((field: any) => {
        if (!field.isEnable) return;
        const fieldKey = field.field;
        let validation = Yup.string();

        // Apply field-specific validations
        if (fieldKey === 'country' || fieldKey === 'state') {
            if (field.isMandatory === "true" || field.isMandatory === true) {
                validation = validation.required(ADD_RECIPIENT.IS_REQUIRED);
            }
        } else if (fieldKey === 'city') {
            validation = validation
                .matches(/^[A-Za-z\s]+$/, "GLOBAL_CONSTANTS.INVALID_CITY")
                .max(35, "GLOBAL_CONSTANTS.MUST_BE_35_CHARACTERS");
            if (field.isMandatory === "true" || field.isMandatory === true) {
                validation = validation.required("GLOBAL_CONSTANTS.IS_REQUIRED");
            }
        } else if (fieldKey === 'line1') {
            validation = validation
                .nullable()
                .matches(/^(?=.*[A-Za-z])[A-Za-z0-9\s!@#$%^&*(),.?":{}|<>/_-]*$/, "GLOBAL_CONSTANTS.INVALID_STREET")
                .max(35, "GLOBAL_CONSTANTS.MUST_BE_35_CHARACTERS");
            if (field.isMandatory === "true" || field.isMandatory === true) {
                validation = validation.required(ADD_RECIPIENT.IS_REQUIRED);
            }
            addressValidations['street'] = validation; // Map line1 to street
            return;
        } else if (fieldKey === 'postalCode') {
            validation = validation
                .matches(/^\d+$/, "GLOBAL_CONSTANTS.INVALID_POSTAL_CODE")
                .min(4, "GLOBAL_CONSTANTS.POSTAL_CODE_AT_LEAST")
                .max(9, "GLOBAL_CONSTANTS.POSTAL_CODE_MAX");
            if (field.isMandatory === "true" || field.isMandatory === true) {
                validation = validation.required("GLOBAL_CONSTANTS.IS_REQUIRED");
            }
        }

        addressValidations[fieldKey] = validation;
    });

    /**
     * Return complete validation schema combining static and dynamic rules
     */
    return Yup.object().shape({
        // Favourite name validation with comprehensive checks
        favouriteName: Yup.string()
            .required(ADD_RECIPIENT.IS_REQUIRED)
            .test(
                "no-only-special",
                ADD_RECIPIENT.VALIDATION_CONSTANTS.FAVOURITE_NAME,
                (value) => {
                    if (!value) return true;
                    const hasLetter = /[a-zA-Z]/.test(value);
                    const hasNumber = /[0-9]/.test(value);
                    return hasLetter || hasNumber;
                }
            )
            .test("no-emojis", ADD_RECIPIENT.VALIDATION_CONSTANTS.FAVOURITE_NAME, (value) => {
                if (!value) return true;
                return !EMOJI_REGEX.test(value);
            })
            .test("no-html", ADD_RECIPIENT.VALIDATION_CONSTANTS.FAVOURITE_NAME, (value) => {
                if (!value) return true;
                return !HTML_REGEX.test(value);
            })
            .max(50, "GLOBAL_CONSTANTS.FAVOURITE_NAME_MUST_50CHARACTER"),

        currency: Yup.string().required(ADD_RECIPIENT.IS_REQUIRED),
        // addressType: Yup.string().required(ADD_RECIPIENT.IS_REQUIRED),
        ...addressTypeValidations,

        // Dynamic recipient field validations
        ...recipientValidations,

        // Dynamic address field validations
        ...addressValidations,

        // Conditional validations
        ...(values?.addressType?.toLowerCase() === '3rd party' && {
            relation: Yup.string().required(ADD_RECIPIENT.IS_REQUIRED)
        }),

        ...(accountType?.toLowerCase() === 'personal' && {
            ...(values?.stableCoinPayout == true && {
                documentType: Yup.string().required(ADD_RECIPIENT.IS_REQUIRED),
                documentNumber: Yup.string()
                    .required(ADD_RECIPIENT.IS_REQUIRED)
                    .test(
                        "validate-document-number",
                        ADD_RECIPIENT.VALIDATION_CONSTANTS.DOCUMENT_NUMBER,
                        value => !value || validateDocummentNumber(value)
                    ),
                frontId: Yup.string().required(ADD_RECIPIENT.IS_REQUIRED),
                backId: Yup.string().required(ADD_RECIPIENT.IS_REQUIRED),
            }),
        }),

        ...(accountType?.toLowerCase() !== 'personal' && {
            ...(values?.stableCoinPayout === true && {
                businessRegistrationNo: Yup.string()
                    .required("GLOBAL_CONSTANTS.IS_REQUIRED")
                    .test("validate-business-registration", "GLOBAL_CONSTANTS.INVALID_BUSINESS_REGISTRATION_NUMBER", value => !value || validateAccountNumber(value)),
                businessType: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
            })
        }),

        // Merge dynamic payment field validations from currency configuration
        ...dynamicPaymentValidations,
    });
};
