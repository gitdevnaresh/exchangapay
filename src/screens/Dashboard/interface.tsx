import { CardItem } from "../commonScreens/cards/smartCardCarousel";

export interface HomeProps {
  navigation: any; // Replace 'any' with specific navigation prop type if available from @react-navigation
  // Add other props if Home component receives any
}

export interface UserInfo {
  kycStatus?: string | null;
  currency?: string | undefined; // Changed to required string
  // Add other properties from userDetails
  [key: string]: any; // Keep this for now if userDetails structure is complex or varies
}

export interface MyCardsState {
  myCards: CardItem[]; // Use CardItem here
  myCradsLoader: boolean;
}

export interface Asset {
  code: string;
  amount: number;
  // Add other properties of an asset item
}

export interface VerificationField {
  isEmailVerification?: boolean | null;
  isPhoneVerified?: boolean | null;
  // Add other verification fields
}

export interface ApiCallsCompletedState {
  balance: boolean;
  assets:boolean;
}

export interface RBSheetRef {
  open: () => void;
  close: () => void;

}

interface Configuration {
  VERIFY_IDENTITY?: boolean;
}

export interface UserInfo {
  kycStatus?: string | null;
  accountType?: string;
  isKYC?: boolean;
}

export interface CommonStyles {
  // Define specific style properties, e.g., applycardbg: object, rounded5: object, etc.
  // Replace with actual style definitions
  [key: string]: any;
}

export interface KycVerificationBannerProps {
  Configuration: Configuration;
  userInfo: UserInfo;
  commonStyles: CommonStyles;
  handleRedirectToApplyCard: () => void; // Function to handle redirect to apply card
  duration?: number; // Optional duration prop for carousel
  myCards?: CardItem[]; // Optional prop for myCards, if needed
}

export interface CryptoCoinInterface {
    id: string;
    code: string;
    logo: string;
    details: any; // Consider refining if structure is known
    walletCode: string;
    name: string;
}
export interface AlertItem {
  id: string;
  title: string;
  message: string;
  typeId: string;
}
