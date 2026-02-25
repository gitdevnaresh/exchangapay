import * as Yup from "yup";

export const withdrawSchema = Yup.object().shape({
    amount: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    currency: Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED"),
    bankName: Yup.string().when('$bankDataLength', {
        is: (length: number) => length > 1,
        then: (schema) => schema.required("GLOBAL_CONSTANTS.IS_REQUIRED"),
        otherwise: (schema) => schema.optional(),
    }),
});

export const createDynamicValidationSchema = (dynamicFields: any[]) => {
    const dynamicValidation: any = {};
    
    dynamicFields.forEach((field: any) => {
        if (field.isMandatory === 'true') {
            dynamicValidation[field.key] = Yup.string().required("GLOBAL_CONSTANTS.IS_REQUIRED");
        } else {
            dynamicValidation[field.key] = Yup.string().optional();
        }
    });
    
    return withdrawSchema.shape(dynamicValidation);
};

