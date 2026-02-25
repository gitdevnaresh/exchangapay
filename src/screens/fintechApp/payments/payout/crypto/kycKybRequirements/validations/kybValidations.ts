import * as Yup from 'yup';

export const REQUIRED_FIELDS = {
    Ubo: [
        'firstName',
        'lastName',
        'dob',
        'phoneNumber',
        'email',
        'country',
        'docDetails.docNumber',
        'docDetails.docExpiryDate',
        'docDetails.documentFront',
        'docDetails.documentBack'
    ]
};

export const createKybValidationSchema = (kycRequirements: any, t: any) => {
    const requiredMessage = t('GLOBAL_CONSTANTS.IS_REQUIRED') ;
    const registrationNumberMessage =  t('GLOBAL_CONSTANTS.PAYMENTS_INVALID_REGISTRATION_NUMBER') ;
    
    const schema: any = {
        businessName: Yup.string().required(requiredMessage),
        RegistrationNo: Yup.string()
            .required(requiredMessage)
            .matches(/^[A-Za-z0-9]{8,34}$/, registrationNumberMessage),
        registrationDate: Yup.string().required(requiredMessage),
        chooseBusinessTrype: Yup.string().required(requiredMessage)
    };
    
    // Add conditional validations based on requirements
    if (kycRequirements?.kyb?.requirement?.includes('Address')) {
        schema.address = Yup.string().required(requiredMessage);
    }
    
    if (kycRequirements?.kyb?.requirement?.includes('Documents')) {
        schema.docType = Yup.string().required(requiredMessage);
        schema.frontId = Yup.string().required(requiredMessage);
        schema.businessRegistrationProofType = Yup.string().required(requiredMessage);
        schema.businessRegistrationProof = Yup.string().required(requiredMessage);
    }
    
    return Yup.object().shape(schema);
};

// Add regex constants
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
const HTML_REGEX = /<[^>]*>/;
const POSTAL_CODE_REGEX = /^[a-zA-Z0-9\s\-]+$/;

export const createPersonalKycValidationSchema = (t: any) => {
    const getRequiredMessage = (key: string, fallback: string) => {
        const translated = t(key);
        return translated === key ? fallback : translated;
    };
    
    return Yup.object().shape({
              firstName: Yup.string()
                .required("GLOBAL_CONSTANTS.IS_REQUIRED")
                .matches(/^[a-zA-Z0-9 ]*$/, "GLOBAL_CONSTANTS.INVALID_FIRST_NAME")  // Allow letters, numbers, and spaces
                .test('no-only-numbers', "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", value => {
                    if (!value) return true;
                    return /[a-zA-Z]/.test(value); 
                })
                .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", value => {
                    if (!value) return true;
                    return !EMOJI_REGEX.test(value);
                })
                .test('no-html', "GLOBAL_CONSTANTS.INVALID_FIRST_NAME", value => {
                    if (!value) return true;
                    return !HTML_REGEX.test(value);
                })
                .max(50, "GLOBAL_CONSTANTS.FIRST_NAME_MUST_50CHARACTER"),
 lastName: Yup.string()
    .required("GLOBAL_CONSTANTS.IS_REQUIRED")
    .matches(/^[a-zA-Z0-9 ]*$/, "GLOBAL_CONSTANTS.INVALID_LAST_NAME")
    .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_LAST_NAME", value => {
        if (!value) return true;
        return !EMOJI_REGEX.test(value);
    })
    .test('no-only-numbers', "GLOBAL_CONSTANTS.INVALID_LAST_NAME", value => {
        if (!value) return true;
        return /[a-zA-Z]/.test(value); 
    })
    .test('no-html', "GLOBAL_CONSTANTS.INVALID_LAST_NAME", value => {
        if (!value) return true;
        return !HTML_REGEX.test(value);
    })
    .max(50, "GLOBAL_CONSTANTS.LAST_NAME_MUST_50CHARACTER"),
     email: Yup.string()
        .email("GLOBAL_CONSTANTS.INVALID_EMAIL")
        .required('GLOBAL_CONSTANTS.IS_REQUIRED')
        .matches(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, "GLOBAL_CONSTANTS.INVALID_EMAIL"),
        phoneCode: Yup.string()
            .required(getRequiredMessage('GLOBAL_CONSTANTS.IS_REQUIRED', 'is required')),
        phoneNumber: Yup.string()
            .required(getRequiredMessage('GLOBAL_CONSTANTS.IS_REQUIRED', 'is required'))
            .matches(/^\d{6,12}$/, getRequiredMessage('GLOBAL_CONSTANTS.INVALID_PHONE', 'Invalid phone number')),
        birthDate: Yup.string().required(getRequiredMessage('GLOBAL_CONSTANTS.IS_REQUIRED', 'is required')).test(
            "is-18-years-old",
            getRequiredMessage('GLOBAL_CONSTANTS.AT_LEAST_18_YEARS', 'Must be at least 18 years old'),
            (value) => {
                if (!value) return true;
                const today = new Date();
                const dob = new Date(value);
                const age = today.getFullYear() - dob.getFullYear();
                const monthDiff = today.getMonth() - dob.getMonth();
                const dayDiff = today.getDate() - dob.getDate();
                return (
                    age > 18 ||
                    (age === 18 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)))
                );
            }
        ),
        occupation: Yup.string().required(getRequiredMessage('GLOBAL_CONSTANTS.IS_REQUIRED', 'is required')),
        country: Yup.string().required(getRequiredMessage('GLOBAL_CONSTANTS.IS_REQUIRED', 'is required')),
        address: Yup.string().required(getRequiredMessage('GLOBAL_CONSTANTS.IS_REQUIRED', 'is required')),
                      docNumber: Yup.string()
                            .required("GLOBAL_CONSTANTS.IS_REQUIRED")
                            .test('valid-format', "GLOBAL_CONSTANTS.INVALID_DOCUMENT_NUMBER", value => {
                                if (!value) return true;
                                return POSTAL_CODE_REGEX.test(value);
                            })
                            .test('no-emojis', "GLOBAL_CONSTANTS.INVALID_DOCUMENT_NUMBER", value => {
                                if (!value) return true;
                                return !EMOJI_REGEX.test(value);
                            })
                            .test('no-html', "GLOBAL_CONSTANTS.INVALID_DOCUMENT_NUMBER", value => {
                                if (!value) return true;
                                return !HTML_REGEX.test(value);
                            })
                            .min(6, "GLOBAL_CONSTANTS.INVALID_DOCUMENT_NUMBER")
                            .max(30, "GLOBAL_CONSTANTS.INVALID_DOCUMENT_NUMBER"),
        expiryDate: Yup.string().nullable(),
        frontId: Yup.string().required(getRequiredMessage('GLOBAL_CONSTANTS.IS_REQUIRED', 'is required')),
        backId: Yup.string().required(getRequiredMessage('GLOBAL_CONSTANTS.IS_REQUIRED', 'is required'))
    });
};



export const validateUboFields = (ubo: any, t?: any, isDcoumentExpDate: boolean = true) => {
    const requiredMessage = t ? t('GLOBAL_CONSTANTS.IS_REQUIRED') : 'is required';
    const errors: any = {};
    
    // Filter out docExpiryDate if isDcoumentExpDate is false
    let fieldsToValidate = isDcoumentExpDate 
        ? REQUIRED_FIELDS.Ubo 
        : REQUIRED_FIELDS.Ubo.filter(field => field !== 'docDetails.docExpiryDate');
    
    // For Tax ID and National ID, don't require front/back images
    const docType = ubo?.docDetails?.type?.toLowerCase().replace(/\s+/g, '_');
    if (docType === 'tax_id' || docType === 'national_id') {
        fieldsToValidate = fieldsToValidate.filter(field => 
            field !== 'docDetails.documentFront' && field !== 'docDetails.documentBack'
        );
    }
    
    fieldsToValidate.forEach(field => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            let actualChild = child;
            // Map validation field names to actual object field names
            if (child === 'documentFront') actualChild = 'frontImage';
            if (child === 'documentBack') actualChild = 'backImage';
            if (child === 'docNumber') actualChild = 'docNumber';
            if (child === 'docExpiryDate') actualChild = 'docExpiryDate';
            
            if (!ubo[parent] || (!ubo[parent][actualChild] && ubo[parent][actualChild] !== 0)) {
                errors[field] = `${field} ${requiredMessage}`;
            }
        } else {
            if (!ubo[field] && ubo[field] !== 0) {
                errors[field] = `${field} ${requiredMessage}`;
            }
        }
    });
    
    return errors;
};