# KYC Multi-Step Form Implementation

## Overview
This implementation provides a three-screen KYC (Know Your Customer) form flow that guides users through collecting personal, address, and document information. The implementation follows the application's existing patterns and uses Redux for state management.

## Architecture

### Components

#### 1. **KycPersonalInfoScreen** - Screen 1
- Collects personal information from the user
- Fields:
  - First Name (required)
  - Last Name (required)
  - Email (required)
  - Country Code (from picker)
  - Mobile Number (required)
  - Date of Birth (required)
  - Gender (radio buttons: Male, Female, Others)
  - Nationality (country picker)
- Features:
  - Single API call on load to fetch pre-populated data
  - Data is transformed and stored in Redux state
  - Progress indicator showing 1/3

#### 2. **KycAddressInfoScreen** - Screen 2
- Collects address information
- Fields:
  - Address Line 1 (required)
  - Address Line 2 (optional)
  - City (required)
  - State (required)
  - Postal Code (required)
  - Country (country picker)
- Features:
  - Retrieves persisted state from Screen 1
  - Progress indicator showing 2/3
  - Back/Continue navigation

#### 3. **KycDocumentInfoScreen** - Screen 3
- Collects document and income information
- Fields:
  - ID Type (picker - loaded based on nationality)
  - ID Number (required)
  - Document Issue Date (optional)
  - Document Expiry Date (required)
  - Occupation (picker)
  - Annual Salary (optional, numeric)
  - Expected Monthly Volume (optional, numeric)
  - Account Purpose (picker)
- Features:
  - Final submission screen
  - Progress indicator showing 3/3
  - Builds complete payload and submits to API
  - Resets Redux state on success

## State Management

### Redux Store
- **Location**: `src/redux/reducers/cardReducer.js`
- **State Structure**:
  ```javascript
  {
    kycFormData: {
      // Screen 1 fields
      firstName: string,
      lastName: string,
      email: string,
      mobile: string,
      mobileCode: string,
      dob: Date | null,
      gender: string,
      nationality: string,
      
      // Screen 2 fields
      addressLine1: string,
      addressLine2: string,
      city: string,
      state: string,
      postalCode: string,
      country: string,
      
      // Screen 3 fields
      idType: string,
      idNumber: string,
      docIssueDate: Date | null,
      docExpiryDate: Date | null,
      occupation: string,
      annualSalary: string,
      expectedMonthlyVolume: string,
      accountPurpose: string,
    }
  }
  ```

### Actions
- `setKycFormData(data)` - Set complete form data
- `setKycFormField(fieldData)` - Set individual field
- `resetKycFormData()` - Clear all form data

## API Integration

### GET Request
- **Endpoint**: `GET /api/v1/Common/Customer/ApplyCard/{cardId}/info`
- **Trigger**: Automatically on first screen load
- **Purpose**: Fetch pre-populated user data
- **Response** includes:
  - Customer personal information (encrypted fields)
  - Address information
  - Document information
  - Occupation and income details

### POST Request
- **Endpoint**: `POST /api/v1/CardsWallet/CardApply`
- **Trigger**: On final screen submission
- **Payload**: Complete form data with:
  - All personal information
  - All address information
  - All document information
  - Encrypted sensitive fields (email, phone, ID number, postal code)
- **Response**: Success/failure with status code

## Form Features

### Validation
- Each screen has screen-specific validation using Yup schemas
- Validation triggers on field blur and form submission
- Error messages are displayed inline

### Field Components Used
- **Text Inputs**: FormikTextInput with support for:
  - Email validation
  - Numeric-only fields
  - Placeholder translation
- **Date Pickers**: DatePickerComponent with:
  - Min/max date restrictions
  - DOB max 18 years
  - Proper date formatting
- **Dropdowns**: CustomPickerModal with:
  - Search functionality
  - Dynamic data loading
  - Multi-field support
- **Radio Buttons**: FormikRadioButton for gender selection
- **Error Display**: ErrorComponent for screen-level errors

### Encryption/Decryption
- Uses `useEncryptDecrypt` hook for:
  - Encrypting sensitive data before sending to API
  - Decrypting API responses
  - Encrypted fields: firstName, lastName, email, mobile, mobileCode, idNumber, postalCode

## Navigation Flow

```
ChooseCard → KycPersonalInfo → KycAddressInfo → KycDocumentInfo → Dashboard
    ↑              ↓                  ↓                ↓
    └──────────────Back Navigation──────────────────┘
```

### Route Parameters
- `cardId`: Card identifier passed through navigation

### Navigation Screens
- `KycPersonalInfo`
- `KycAddressInfo`
- `KycDocumentInfo`

## File Structure

```
src/screens/cards/kycMultiStep/
├── KycPersonalInfoScreen.tsx      # Screen 1 component
├── KycAddressInfoScreen.tsx       # Screen 2 component
├── KycDocumentInfoScreen.tsx      # Screen 3 component
├── kycFormConstants.ts            # Form configuration and validation schemas
├── kycPayloadBuilder.ts           # API payload building utilities
├── index.ts                       # Barrel export
└── README.md                      # This file
```

## Usage

### Adding to Navigation
The screens are already registered in `src/navigations/cardsApp_AppContainer.tsx`:

```tsx
<Stack.Screen
  name="KycPersonalInfo"
  component={KycPersonalInfoScreen}
  options={{ headerShown: false }}
/>
<Stack.Screen
  name="KycAddressInfo"
  component={KycAddressInfoScreen}
  options={{ headerShown: false }}
/>
<Stack.Screen
  name="KycDocumentInfo"
  component={KycDocumentInfoScreen}
  options={{ headerShown: false }}
/>
```

### Triggering the Flow
Navigate to the first screen with cardId:

```typescript
navigation.navigate('KycPersonalInfo', { cardId: 'card-123' });
```

## Styling and Theming

- Uses `commonStyles` from `getThemedCommonStyles(NEW_COLOR)`
- Consistent padding, margins, and spacing
- Progress indicators with theme colors
- Responsive layout for different screen sizes

## Error Handling

- Try-catch blocks for all API calls
- User-friendly error messages via `showAppToast`
- Screen-level error display with `ErrorComponent`
- Field-level validation errors via Formik

## Key Features

1. **Single API Call**: Initial data fetch happens only once on first screen
2. **Persistent State**: Data persists across screen navigation (forward and backward)
3. **Partial Submission**: Users can go back and edit any field
4. **Encryption**: Sensitive fields are encrypted before sending
5. **Progress Tracking**: Visual progress indicator on each screen
6. **Flexible Validation**: Screen-specific validations
7. **Accessible**: Uses common application components for consistency
8. **Responsive**: Adapts to different screen sizes

## Dependencies

- `formik`: Form state management
- `yup`: Validation schemas
- `@react-navigation`: Navigation
- `react-redux`: State management
- Application's common components and hooks

## Future Enhancements

- File upload for document images
- Biometric capture
- Multi-language support for validation messages
- Offline form data persistence
- Form auto-save functionality
