
const EMOJI_REGEX = /\p{Extended_Pictographic}/u; // Emoji regex
const DISALLOWED_TAG_REGEX = /<[^>]*>/g;
const DISALLOWED_CHARACTERS = /[<>]/;

export const validateName = (name: string) => {
    const trimmedName = name.trim();
    const namePattern = /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/;
    return namePattern.test(trimmedName) && trimmedName.length <= 40;
};

export const validateFirastName = (name: string) => {
    const trimmedName = name.trim();
    const namePattern = /^(?=.*[A-Za-z])[A-Za-z0-9]+(?:\s+[A-Za-z0-9]+)*$/;
    return namePattern.test(trimmedName) && trimmedName.length <= 40;
};
export const validateBusinessName = (name: string) => {
    const trimmedName = name.trim();
    const namePattern = /^[A-Za-z0-9&,\-.\s]+$/; // Allow letters, numbers, spaces, & , - . characters
    return namePattern.test(trimmedName) && trimmedName.length >= 3 && trimmedName.length <= 100;
};
export const validateLastName = (name: string) => {
    const trimmedName = name.trim();
    const namePattern = /^(?=.*[A-Za-z])[A-Za-z0-9]+(?:\s+[A-Za-z0-9]+)*$/;
    return namePattern.test(trimmedName) && trimmedName.length <= 40;
};

export const validateMidleName = (name: string) => {
    const trimmedName = name.trim();
    const namePattern = /^(?=.*[A-Za-z])[A-Za-z0-9]+(?:\s+[A-Za-z0-9]+)*$/;
    return namePattern.test(trimmedName) && trimmedName.length <= 45;
};
export const validateEmail = (email: string) => {
    const trimmedEmail = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(trimmedEmail) && trimmedEmail.length <= 254;
};

export const validateIBAN = (iban: string) => {
    const ibanPattern = /^[A-Z]{2}[0-9A-Z]{15,35}$/;
    return ibanPattern.test(iban);
};

export const validateAndFormatIBAN = (iban: string) => ({
    isValid: /^[A-Z]{2}[0-9A-Z]{8,34}$/.test(iban),
    formattedIban: iban.length > 34 ? `${iban.slice(0, 34)}...` : iban
});
export const validateAddress = (address: string) => {
    if (!address) return true;
    if (DISALLOWED_CHARACTERS.test(address)) {
        return false;
    }
    if (DISALLOWED_TAG_REGEX.test(address)) {
        return false;
    }
    return (
        !EMOJI_REGEX.test(address) &&
        address.trim().length <= 400
    );
};

export const validateCity = (city: string) => {
    const trimmedCity = city.trim();
    const cityPattern = /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/;
    return cityPattern.test(trimmedCity) && trimmedCity.length <= 35;
};
export const validateAccountNumber = (acc: any) => {
    const accountRegex = /^[A-Za-z0-9]{10,34}$/;
    return accountRegex.test(acc);
};
export const validateAlphaNumaric = (acc: any) => {
    const accountRegex = /^[A-Za-z0-9]{5,40}$/;
    return accountRegex.test(acc);
};
export const validateBank = (acc: any) => {
    const accountRegex = /^[A-Za-z\s]{1,20}$/;
    return accountRegex.test(acc);
};
export const validateSwiftCode = (swiftCode: string) => {
    const cleanedSwiftCode = swiftCode.replace(/\s+/g, '');
    const swiftPattern = /^[a-zA-Z0-9]{1,50}$/;
    return swiftPattern.test(cleanedSwiftCode);
};
export const validateCableCode = (cableCode: string) => {
    const cableNumberPattern = /^\d{18}$/; // Exactly 18 digits
    return cableNumberPattern.test(cableCode);
};
export const postalCodePatterns: RegExp[] = [
    /^[a-zA-Z0-9]{4,8}$/
];
export const postalPhonePatterns: RegExp[] = [
    /^\d{6,13}$/
];
export const documentNumber: RegExp[] = [
    /^[A-Za-z0-9\s\-\/]*$/
];
export const validateDocummentNumber = (documentNo: any) => {
    const documentNumberRegex = /^[A-Za-z0-9\s\-\/]*$/;
    return documentNumberRegex.test(documentNo);
};
export const validatePostalCode = (postalCode: string) => {
    return postalCodePatterns.some((pattern) => pattern.test(postalCode));
};
export const validatePhoneNumber = (phone: string) => {
    return postalPhonePatterns.some((pattern) => pattern.test(phone));
};
export const validateDateOfBirth = (dateOfBirth: string): boolean => {
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) return false; // Ensure valid date format

    const today = new Date();

    const age = today.getFullYear() - dob.getFullYear();

    const isBirthdayPassed =
        today.getMonth() > dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
    return age > 18 || (age === 18 && isBirthdayPassed);
};