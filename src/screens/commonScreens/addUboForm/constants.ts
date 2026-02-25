export const UBO_FORM_CONSTANTS = {
  // Position types
  DIRECTOR: "Director",
  REPRESENTATIVE: "Representative", 
  UBO: "Ubo",
  
  // Account types
  BUSINESS: "business",
  
  // Document types that don't require expiry date
  DOCUMENT_TYPES_NO_EXPIRY: ["ID Card", "National Id", "Resident Card"],
  
  // File constraints
  MAX_FILE_SIZE_MB: 15,
  MAX_FILE_SIZE_BYTES: 15 * 1024 * 1024,
  
  // File types
  FILE_TYPE_PDF: "pdf",
  FILE_TYPE_APPLICATION: "application",
  FILE_TYPE_IMAGE: "image",
  
  // MIME types
  MIME_TYPE_PDF: "application/pdf",
  
  // File extensions
  PDF_EXTENSION: ".pdf",
  
  // Redux action types
  REDUX_ACTIONS: {
    SET_CARDS_DIRECTOR_FORM_DATA: "SET_CARDS_DIRECTOR_FORM_DATA",
    SET_CARDS_REPRESENTATIVE_FORM_DATA: "SET_CARDS_REPRESENTATIVE_FORM_DATA", 
    SET_CARD_UBO_FORM_DATA: "SET_CARD_UBO_FORM_DATA"
  },
  
  // Platform types
  PLATFORM_IOS: "ios",
  
  // Keyboard behavior
  KEYBOARD_BEHAVIOR: {
    PADDING: "padding",
    HEIGHT: "height"
  },
  
  // Image picker options
  PICKER_OPTIONS: {
    CAMERA: "camera" as const,
    LIBRARY: "library" as const,
    DOCUMENTS: "documents" as const
  },
  
  // Image picker settings
  IMAGE_PICKER_SETTINGS: {
    ALLOWS_EDITING: false,
    ASPECT_RATIO: [1, 1] as [number, number],
    QUALITY: 0.5,
    MEDIA_TYPES: "images" as const
  },
  
  // Document picker types
  DOCUMENT_PICKER_TYPES: ["image/*", "application/pdf"],
  
  // Age constraints
  MIN_AGE_YEARS: 18,
  
  // Field names for file uploads
  FILE_FIELDS: {
    FRONT_ID: "frontId",
    BACK_IMG_ID: "backImgId", 
    SELFI: "selfi"
  },
  
  // Default file names
  DEFAULT_FILE_NAMES: {
    frontId: null,
    backImgId: null,
    selfi: null
  },
  
  // Loading states
  DEFAULT_LOADING_STATES: {
    frontId: false,
    backImgId: false,
    selfi: false
  },
  
  // Form field max lengths
  MAX_LENGTHS: {
    FIRST_NAME: 50,
    LAST_NAME: 50,
    EMAIL: 50,
    DOC_NUMBER: 50,
    NOTE: 249,
    PHONE_NUMBER: 13
  },
  
  // Keyboard types
  KEYBOARD_TYPES: {
    EMAIL: "email-address" as const,
    NUMERIC: "numeric" as const,
    PHONE_PAD: "phone-pad" as const
  },
  
  // Scroll settings
  SCROLL_SETTINGS: {
    X: 0,
    Y: 0,
    ANIMATED: true
  },
  
  // Timeout values
  TIMEOUTS: {
    SCROLL_DELAY: 100
  },
  
  // Container styles
  CONTAINER_STYLES: {
    FLEX: 1,
    FLEX_GROW: 1
  },
  
  // Picker settings
  PICKER_SETTINGS: {
    HEIGHT: 80,
    ACTIVE_OPACITY: 0.9
  }
};

export const UBO_FORM_LABELS = {
  COUNTRY: "Country",
  SELECT_COUNTRY: "Select Country"
};

export const UBO_FORM_PLACEHOLDERS = {
  ENTER_DOCUMENT_NUMBER: "Enter document number"
};

export const UBO_FORM_MESSAGES = {
  PERMISSION_DENIED: "Permission Denied",
  ENABLE_PERMISSIONS: "You need to enable permissions to use this feature.",
  ONLY_IMAGES_ACCEPTED: "Only image files are accepted"
};

export const UBO_FORM_FIELD_NAMES = {
  FIRST_NAME: "firstName",
  LAST_NAME: "lastName",
  MIDDLE_NAME: "middleName",
  EMAIL: "email",
  SHARE_HOLDER_PERCENTAGE: "shareHolderPercentage",
  DOB: "dob",
  GENDER: "gender",
  COUNTRY: "country",
  PHONE_CODE: "phoneCode",
  PHONE_NUMBER: "phoneNumber",
  NOTE: "note",
  DOC_TYPE: "docType",
  DOC_NUMBER: "docNumber",
  DOC_ISSUE_DATE: "docIssueDate",
  DOC_EXPIRY_DATE: "docExpiryDate",
  FRONT_ID: "frontId",
  BACK_IMG_ID: "backImgId",
  SELFI: "selfi",
  ADDRESS_TYPE: "addressType"
};