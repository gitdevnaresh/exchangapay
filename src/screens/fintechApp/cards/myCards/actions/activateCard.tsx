

import React, { useState, useCallback } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { KeyboardAvoidingView, Platform } from "react-native";
import ViewComponent from "../../../../../components/view/view";
import ButtonComponent from "../../../../../components/buttons/button";
import CardDynamicFieldRenderer from "../../common/cardDynamicFieldRenderer";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import CardsModuleService from "../../../../../apiServices/cards";
import { isErrorDispaly } from "../../../../../utils/helpers";
import ErrorComponent from "../../../../../components/errorDisplay/errorDisplay";
import { showAppToast } from "../../../../../components/toasterMessages/ShowMessage";
import { ActivityIndicator } from "react-native";
import { t } from "i18next";
import useEncryptDecrypt from "../../../../../hooks/encDecHook";

const CardActionsSheetActivateCard = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>("");
    const { activateCardDetails = [], CardsInfoData, onClose, onSuccess, fieldsLoading } = props;
    const { encryptAES } = useEncryptDecrypt();
    const createInitialValues = useCallback((fields: any[]) => {
        const values: any = {};
        fields?.forEach(field => {
            values[field.field] = "";
        });
        return values;
    }, []);

    const createValidationSchema = useCallback((fields: any[]) => {
        const schemaFields: any = {};
        fields.forEach(field => {
            let fieldSchema = Yup.string();
            if (field.isMandatory === "true" || field.isMandatory === true) {
                fieldSchema = fieldSchema.required(t("GLOBAL_CONSTANTS.IS_REQUIRED"));
            }
            if (field.maxLength) {
                fieldSchema = fieldSchema.max(parseInt(field.maxLength), `Must be at most ${field.maxLength} characters`);
            }
            if (field.validation) {
                fieldSchema = fieldSchema.matches(new RegExp(field.validation), `Invalid ${field.label} format`);
            }
            schemaFields[field.field] = fieldSchema;
        });
        return Yup.object().shape(schemaFields);
    }, []);

    const handleActivateCard = useCallback(async (values: any) => {
        setIsLoading(true);
        setErrorMsg("");
        try {
            const obj: any = {
                cardId: CardsInfoData?.id,
                envelopeNumber: CardsInfoData?.envelopeNumber || null,
                pin: null,
                activationCode: null,
                handHoldingIdPhoto: CardsInfoData?.handHoldingIdPhoto || null
            };
            const requestData: any = { ...obj };
            // Add dynamic field values, overriding obj values if same key exists
            activateCardDetails.forEach((field: any) => {
                const value = values[field.field] || "";
                const fieldsToEncrypt = ['expirydate', 'cardlastfourdigits'];
                requestData[field.field] = fieldsToEncrypt.includes(field.field) ? encryptAES(value) : value;
            });
            const response: any = await CardsModuleService.postQuickLinks(requestData);
            if (response.ok) {
                setErrorMsg("");
                showAppToast(t("GLOBAL_CONSTANTS.CARD_ACTIVATED_SUCCESSFULLY"), "success");
                onSuccess?.(); // Refresh card data
                onClose();
            } else {
                setErrorMsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrorMsg(isErrorDispaly(error));
        } finally {
            setIsLoading(false);
        }
    }, [CardsInfoData, activateCardDetails, encryptAES, onSuccess, onClose]);

    const getPlaceholder = useCallback((fieldName: string) => {
        const placeholders: { [key: string]: string } = {
            pin: "GLOBAL_CONSTANTS.ENTER_PIN",
            activationcode: "GLOBAL_CONSTANTS.ENTER_ACTIVATION_CODE",
            cardlastfourdigits: "GLOBAL_CONSTANTS.ENTER_LAST_FOUR_DIGITS_OF_CARD",
            expirydate: t("GLOBAL_CONSTANTS.ENTER_EXPIRY_DATE_MM_YY"),
        };
        return placeholders[fieldName.toLowerCase()] || `GLOBAL_CONSTANTS.ENTER_${fieldName.toUpperCase()}`;
    }, []);

    const handleCloseError = useCallback(() => {
        setErrorMsg("");
    }, []);

    return (
        <ViewComponent style={[]}>
            {errorMsg && <ErrorComponent message={errorMsg} onClose={handleCloseError} />}

            <Formik
                initialValues={createInitialValues(activateCardDetails)}
                validationSchema={createValidationSchema(activateCardDetails)}
                onSubmit={handleActivateCard}
                validateOnBlur={true}
                validateOnChange={true}
                validateOnMount={false}
            >
                {({ values, errors, touched, setFieldValue, handleChange, handleBlur, handleSubmit, validateForm, setTouched }) => (
                    <KeyboardAvoidingView
                        style={commonStyles.flex1}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
                    >
                        <ViewComponent>
                            {fieldsLoading ? (
                                <ViewComponent
                                    style={[commonStyles.mt16]}
                                ><ActivityIndicator size={"large"} color={NEW_COLOR.BUTTON_BG} /></ViewComponent>
                            ) : (<>
                                <CardDynamicFieldRenderer
                                    fields={activateCardDetails}
                                    values={values}
                                    errors={errors}
                                    touched={touched}
                                    setFieldValue={setFieldValue}
                                    handleChange={handleChange}
                                    handleBlur={handleBlur}
                                    getPlaceholder={getPlaceholder}
                                    isLoading={fieldsLoading}
                                />

                                <ViewComponent style={[commonStyles.formItemSpace]} />

                                <ButtonComponent
                                    title="GLOBAL_CONSTANTS.ACTIVATE_CARD"
                                    loading={isLoading}
                                    onPress={async () => {
                                        const errors = await validateForm();
                                        if (Object.keys(errors).length > 0) {
                                            const touchedFields = Object.keys(createInitialValues(activateCardDetails)).reduce((acc, key) => ({ ...acc, [key]: true }), {});
                                            setTouched(touchedFields);
                                            return; // Don't submit if validation fails
                                        }
                                        handleSubmit();
                                    }}
                                    disable={isLoading}
                                />
                            </>)}
                        </ViewComponent>
                    </KeyboardAvoidingView>
                )}
            </Formik>
        </ViewComponent>
    );
};

export default CardActionsSheetActivateCard;