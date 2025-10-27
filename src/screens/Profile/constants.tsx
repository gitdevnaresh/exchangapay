export const PROFILE_CONSTANTS = {
    ADD_YOUR_SIGNATURE: "Add Your Signature",
    UPLOAD_YOUR_SIGNATURE: "Upload Your Signature",
    CLOSE: "close",
    DRAW_YOUR_SIGNATURE: "Draw Your Signature",
    CLOUD_UPLOAD_OUTLINE: "cloud-upload-outline",
    DD_MM_YYYY: "DD-MM-YYYY",
    HANDLED: "handled",
    ARROW_LEFT: "arrowleft",
    NOTE_PLEASE_WRITE_IN_ENGLISH: "Note : Please Write In English",
    ADD_KYC_INFORMATION: "Complete KYC Information",
    EDIT_KYC_INFORMATION: " KYC Information",
    DATE: "date",
    DARK: "dark",
    CALENDER: "calendar",
    WHITE_COLOR: "#FFF",
    TRANSPARENT: "transparent",
    CENTER: "center",
    LARGE: "large",
    INFO: "info",
    SLIDE: "slide",
    SIGN_HERE: "Sign Here",
    SAVE: "Save",
    RESET: "Reset",
    IS_REQUIRED: "Is required",
    ACCEPTS_ONLY_JPG_OR_PNG_FPRMAT: 'Accepts only jpg or png format.',
    IMAGE_SIZE_SHOULD_BE_LESS_THAN_20MB: 'Image size should be less than 20MB.',
    PHOTO: 'photo',
    DOCUMENT: 'document',
    IMAGE_BYTES: "imageBytes",
    HARDWARE_BACK_PRESSS: 'hardwareBackPress',
    APPLY_EXCHANGE_CARD: "ApplyExchangaCard",
    IOS: 'ios',
    PERMISSION: "Permission Denied",
    CAMERA_ACCESS_IS_NEEDED_TO_TAKE_A_SELFIE: "Camera access is needed to take a selfie.",
    PERMISSION_BLOCKED: "Permission Blocked",
    PLEASE_ENABLE_CAMERA_ACCESS_IN_YOUR_DEVICE_SETTINGS: "Please enable camera access in your device settings.",
    HARDWARE_BACKPRESS: "hardwareBackPress",
    ARROW: "arrowleft",
    REFERRALS_S: "Referral's",
    REFERRAL_CODE: 'Referral Code',
    MY_REFERRALS: 'My Referral',
    CUSTOMER_NAME: "Customer Name",
    JOIN_DATE: "Join Date",
};

export const FORMIK_CONSTANTS = {
    REAL_FIRST_NAME: "realfirstName",
    REAL_LAST_NAME: "reallastName",
    ID_ISSURANCE_COUNTRY: "idIssuranceCountry",
    DOCUMENT_TYPE: "documentType",
    DOCUMENT_NUMBER: "documentNumber",
    EMERGENCY_CONTACT_NAME: "emergencyContactName"
};

export const FIELD_CONSTANTS = {
    FIRST_NAME: "First Name",
    LAST_NAME: "Last Name",
    GENDER: "Gender",
    NAME: 'name',
    DATE_OF_BIRTH: "Date Of Birth ",
    ID_ISSUEANCE_COUNTRY: "ID Issuance Country",
    DOCUMENT_TYPE: "Document Type",
    DOCUMNET_NUMBER: "Document Number",
    DOCUMNET_EXPIRY_DATE: "Document Expiry Date",
    UPLOAD_YOUR_FORNT_PHOTO_ID_20MB: "Upload Your Front Photo ID (20 MB)",
    UPLOAD_YOUR_BACK_PHOTO_ID: "Upload Your Back Photo ID (20 MB)",
    UPLOAD_YOUR_HAND_HOLDING_PHOTO_ID: "Upload Your Hand Holding  Photo ID",
    UPLOAD_YOUR_FACE_PHOTO_20MB: "Upload Your Face Photo(20 MB)",
    SIGNATURE_PHOTO_20MB: "Signature Photo (20 MB)",
    EMERGENCY_CONTACT_NAME: "Emergency Contact Name "

};
export const PLACEHOLDER_CONSTANTS = {
    ENTER_FIRST_NAME: "Enter First Name",
    REQUIRED_STAR: " *",
    ENTER_LAST_NAME: "Enter Last Name",
    GENDER: 'gender',
    SELECT_COUNRY: "Select Country",
    SELECT_DOCUMENT_TYPE: "Select Document Type",
    ENTER_DOCUMENT_NUMBER: "Enter Document Number",
    UPLOAD_YOUR_FRONT_PHOTO_ID: "Upload Your Front Photo ID",
    PLEASE_UPLOAD_THE_A_PHOTO_OF_THE_INFORMATION_PAGE_ALONG_WITH_YOUR_PRIFILE_PICTURE: "Please upload a photo of the information page along with your profile picture.",
    ENSURE_THAT_THE_ID_FRAME_IS_FULLY_VISIBLE_THE_FRONT_IS_CLEAR_AND_THE_BRIGHTNESS_IS_UNIFORM: "Ensure that the ID frame is fully visible, the front is clear, and the brightness is uniform.",
    UPLOAD_YOUR_BACK_PHOTO_ID: "Upload Your Back Photo ID",
    UPLOAD_YOUR_HAND_HOLDING_PHOTO_ID_20MB: "Upload Your Hand Holding  Photo ID (20 MB)",
    UPLOAD_YOUR_FACE_PHOTO: "Upload Your Face Photo",
    ENTER_EMERGENCY_CONTACT_NAME: " Enter Emergency Contact Name",
    TAKE_SELFIE: "Take Selfie",
    UPLOAD_FROM_GALLERY: "Upload From Gallery"
};

export interface UserDetails {
    firstName: string;
    lastName: string;
    gender: string;
    dob: string;
    idIssuranceCountry: string;
    documentType: string;
    documentNumber: string;
    frontIdPhoto: string;
    handHoldingIdPhoto: string;
    singaturePhoto: string;
    emergencyContactName: string;
    expirationDate: string;
    profileImage: string;
    backDocImage: string;
}

export const ACCOUNT_INFORMATION_CONSTANTS = {
    ACCOUNT_INFORMATION: "Account Information",
    USER_NAME: "User Name",
    EMAIL: "Email",
    FIRST_NAME: "First Name",
    LAST_NAME: "Last Name",
    MOBILE_NUMBER: "Mobile Number",
    COUNTRY: "Country",
    COMPANY_NAME: "Company Name",
    ARROW_LEFT: "arrowleft",
    PHONE_NUMBER: "Phone Number",
    ENTER_USER_NAME: "Enter User Name",
    ENTER_EMAIL: "Enter Email",
    ENTER_FIRST_NAME: "Enter First Name",
    ENTER_LAST_NAME: "Enter Last Name",
    ENTER_PHONE_NUMBER: "Enter Phone Number",
    SELECT_COUNTRY: "Select Country",
    ADD_ACCOUNT_INFORMATION: "Add Account Information",
    NOTE_PLEASE_WRITE_IN_ENGLISH: "Note : Please Write In English",
    SAVE: "Save",
    PHONE_PAD: "phone-pad",
    SELECT_COUNTRY_CODE: "Select Country Code",
    EDIT_ACCOUNT_INFORMATION: "Edit Account Information",
    ENTER_COMPANY_NAME: "Enter Company Name"
};

export const PERSONAL_INFORMATION = {
    ADDRESS_LINE_ONE: "Address Line1",
    ADDRESS_LINE_TWO: "Address Line2",
    PROVINCE_STATE: "Province/State",
    CITY: "City",
    POSTAL_CODE: "Postal Code",
    EG_ROOM2_BUILDINGA_888XXXX_STREET_XX: "Eg.Room2,Building A,888XXX Street,XX",
    ENTER_PROVINCE_STATE: "Enter Province/State",
    ENTER_CITY: "Enter City",
    ENTER_POSTAL_CODE: "Enter Postal Code",
    SET_AS_DEFAULT: "Set as Default",
    SAVE: "Save",
    HANDLED: "handled",
    ARROW_LEFT: "arrowleft",
    EDIT_PERSONAL_INFORMATION: "Edit Personal Information",
    ADD_PERSONAL_INFORMATION: "Add Personal Information",
    NOTE_PLEASE_WRITE_IN_ENGLISH: "Note : Please Write In English",
    STATUS: "Status",
    DEFAULT: "Default",
    PERSONAL_INFORMATION: "Personal Information",
    UPDATE: "Update"
};

export const ADDRRESS_CONSTANTS = {
    ADDRESSES: "Personal Information",
    NO_ADDRESSES_FOUND: "No addresses found.",
    FAILED_TO_FETCH_ADDRESSES: "Failed to fetch addresses.",
    SOMETHING_WENT_WRONG: "Something went wrong.",
    PINCODE_LABEL: "Pincode",
    ADD_ADDRESS: "Add Address",
    ADD_PERSONALINFO: "AddPersonalInfo"
};
export const ADDRESS_TEXTS = {
    ADD_ADDRESS: "Add Address",
    EDIT_ADDRESS: "Edit Address",
    ADDRESS_LINE_1: "Address Line 1",
    PLACEHOLDER_ADDRESS_LINE_1: "Enter Address Line 1",
    COUNTRY: "Country",
    PLACEHOLDER_COUNTRY: "Enter Country",
    TOWN: "Town",
    PLACEHOLDER_TOWN: "Enter Town",
    PINCODE: "Pincode",
    PLACEHOLDER_PINCODE: "Enter Pincode",
    SET_AS_DEFAULT: "Set as Default",
    SAVE: "Save",

};