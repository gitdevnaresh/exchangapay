/**
 * Utility functions for building KYC form payloads and transforming API responses
 */

interface FormData {
  firstName?: string;
  lastName?: string;
  addressLine1?: string;
  addressLine2?: string;
  country?: string;
  city?: string;
  pincode?: string;
  dob?: Date | null | string;
  phoneCode?: string;
  phoneNumber?: string;
  email?: string;
  occupationCountry?: string;
  occupation?: string;
  annualSalary?: string;
  estimatedMonthlyValue?: string;
  [key: string]: any;
}

/**
 * Transform API response data to form values
 * @param apiData - Raw data from API response
 * @param decryptFunction - Optional decrypt function for encrypted fields
 * @param existingFormData - Existing form data to merge with
 * @returns Transformed form values
 */
export const transformApiDataToFormValues = (
  apiData: any,
  decryptFunction?: (encryptedValue: string) => string,
  existingFormData?: FormData
): FormData => {
  try {
    const transformed: FormData = {
      ...existingFormData,
    };

    if (!apiData) {
      return transformed;
    }

    // Map Screen 1 fields
    if (apiData.firstName) {
      transformed.firstName = apiData.firstName;
    }
    if (apiData.lastName) {
      transformed.lastName = apiData.lastName;
    }
    if (apiData.addressLine1) {
      transformed.addressLine1 = apiData.addressLine1;
    }
    if (apiData.addressLine2) {
      transformed.addressLine2 = apiData.addressLine2;
    }
    if (apiData.country) {
      transformed.country = apiData.country;
    }
    if (apiData.city) {
      transformed.city = apiData.city;
    }
    if (apiData.pincode) {
      transformed.pincode = apiData.pincode;
    }
    if (apiData.dob) {
      transformed.dob = new Date(apiData.dob);
    }

    // Map Screen 2 fields
    if (apiData.phoneCode) {
      transformed.phoneCode = apiData.phoneCode;
    }
    if (apiData.phoneNumber) {
      transformed.phoneNumber = decryptFunction
        ? decryptFunction(apiData.phoneNumber)
        : apiData.phoneNumber;
    }
    if (apiData.email) {
      transformed.email = decryptFunction
        ? decryptFunction(apiData.email)
        : apiData.email;
    }

    // Map Screen 3 fields
    if (apiData.employmentStatus) {
      transformed.employmentStatus = apiData.employmentStatus;
    }
    if (apiData.occupation) {
      transformed.occupation = apiData.occupation;
    }
    if (apiData.annualSalary) {
      transformed.annualSalary = apiData.annualSalary;
    }
    if (apiData.estimatedMonthlyValue) {
      transformed.estimatedMonthlyValue = apiData.estimatedMonthlyValue;
    }

    return transformed;
  } catch (error) {
    console.error('Error transforming API data:', error);
    return existingFormData || {};
  }
};

/**
 * Build KYC payload for API submission
 * Encrypts sensitive fields (email, phone) before sending
 * @param formData - Complete form data from all 3 screens
 * @param encryptFunction - Encrypt function for sensitive fields
 * @returns Formatted payload ready for API
 */
export const buildKycPayload = (
  formData: FormData,
  encryptFunction?: (plainValue: string) => string
): any => {
  try {
    const payload: any = {};

    // Screen 1: Personal & Address Information
    if (formData.firstName) {
      payload.firstName = formData.firstName.trim();
    }
    if (formData.lastName) {
      payload.lastName = formData.lastName.trim();
    }
    if (formData.addressLine1) {
      payload.addressLine1 = formData.addressLine1.trim();
    }
    if (formData.addressLine2) {
      payload.addressLine2 = formData.addressLine2?.trim() || '';
    }
    if (formData.country) {
      payload.country = formData.country;
    }
    if (formData.city) {
      payload.city = formData.city.trim();
    }
    if (formData.pincode) {
      payload.pincode = formData.pincode.trim();
    }
    if (formData.dob) {
      // Format date as YYYY-MM-DD or ISO string
      const dobDate = new Date(formData.dob);
      payload.dob = dobDate.toISOString().split('T')[0];
    }

    // Screen 2: Contact Information (with encryption for sensitive fields)
    if (formData.phoneCode) {
      payload.phoneCode = formData.phoneCode;
    }
    if (formData.phoneNumber) {
      payload.phoneNumber = encryptFunction
        ? encryptFunction(formData.phoneNumber)
        : formData.phoneNumber;
    }
    if (formData.email) {
      payload.email = encryptFunction
        ? encryptFunction(formData.email)
        : formData.email;
    }

    // Screen 3: Financial Information
    if (formData.employmentStatus) {
      payload.employmentStatus = formData.employmentStatus;
    }
    if (formData.occupation) {
      payload.occupation = formData.occupation;
    }
    if (formData.annualSalary) {
      payload.annualSalary = formData.annualSalary;
    }
    if (formData.estimatedMonthlyValue) {
      payload.estimatedMonthlyValue = formData.estimatedMonthlyValue;
    }

    return payload;
  } catch (error) {
    console.error('Error building KYC payload:', error);
    return formData;
  }
};

/**
 * Validate if all required fields are filled
 * @param formData - Form data to validate
 * @returns Boolean indicating if all required fields are present
 */
export const isKycFormComplete = (formData: FormData): boolean => {
  return !!(
    formData.firstName?.trim() &&
    formData.lastName?.trim() &&
    formData.addressLine1?.trim() &&
    formData.country &&
    formData.city?.trim() &&
    formData.pincode?.trim() &&
    formData.dob &&
    formData.phoneCode &&
    formData.phoneNumber?.trim() &&
    formData.email?.trim() &&
    formData.employmentStatus &&
    formData.occupation?.trim() &&
    formData.annualSalary &&
    formData.estimatedMonthlyValue
  );
};

/**
 * Get missing fields from entire form
 * @param formData - Form data to check
 * @returns Array of missing required fields
 */
export const getMissingFields = (formData: FormData): string[] => {
  const missing: string[] = [];

  // Screen 1 fields
  if (!formData.firstName?.trim()) missing.push('firstName');
  if (!formData.lastName?.trim()) missing.push('lastName');
  if (!formData.addressLine1?.trim()) missing.push('addressLine1');
  if (!formData.country) missing.push('country');
  if (!formData.city?.trim()) missing.push('city');
  if (!formData.pincode?.trim()) missing.push('pincode');
  if (!formData.dob) missing.push('dob');

  // Screen 2 fields
  if (!formData.phoneCode?.trim()) missing.push('phoneCode');
  if (!formData.phoneNumber?.trim()) missing.push('phoneNumber');
  if (!formData.email?.trim()) missing.push('email');

  // Screen 3 fields
  if (!formData.employmentStatus?.trim()) missing.push('employmentStatus');
  if (!formData.occupation?.trim()) missing.push('occupation');
  if (!formData.annualSalary) missing.push('annualSalary');
  if (!formData.estimatedMonthlyValue) missing.push('estimatedMonthlyValue');

  return missing;
};
