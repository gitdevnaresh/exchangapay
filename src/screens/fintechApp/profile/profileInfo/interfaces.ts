import { ImageSourcePropType } from "react-native";

export interface UserProfileData {
    id?: string; // Added to fix property 'id' does not exist error
    accountType?: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
    email?: string; // Assuming email is part of userDetails from service
    reference?: string;
    image?: string;
    website?: string; // Added for website reference
    kycLevel?: string | null; // Added from usage in handleKycKybProfile
    name?: string; // Added from usage in JSX
    isBusiness?: boolean; // Added for PersonalInfo.tsx
    idIssuranceCountry?: string;
    country?: string;
    incorporationDate?: string;
    phonecode?: string;
    phoneNumber?: string;
    countryOfResidence?: string;
    customerState?: string; // Used in PersonalInfo.tsx via userInfo from Redux
    kycType?:string;
    phoneCode?: string;
    referralLogo?:string;

}

export interface RootState {
    userReducer: {
        userDetails: UserProfileData | null;
        userProfileDetails:UserProfileData|null
        // Add other properties of userReducer if any
    };
}
export type MainStackParamList = {
    KybCompanyData: undefined;
    KybUboList: undefined;
    KybDirectorDetailsList: undefined;
    KybInfoPreview: { navigation: string };
    KycProfile: { navigation: string };
    KycProfileStep2: { navigation: string };
    KycProfilePreview: { navigation: string };
    PersonalInfo: { userDetails: UserProfileData | undefined };
    EditPersonalInfo: { isEdit: boolean };
    Dashboard: { initialTab?: string } | undefined; // From cardsApp_AppContainer.tsx
    ComingSoon: undefined;
    SplaceScreenW2: undefined; // For CommonActions.reset
    NewProfile: { userInfo?: UserProfileData; blockFocusEffects?: boolean; currentTabTitle?: string } | undefined;
    // Screens from ProfileMenuItems
    MembersDashBoard: undefined;
    CardsTransactions: { trasactionType?: string; cardId?: string; currency?: string; } | undefined; // Added params based on recentTransactions.tsx
    AllPersonalInfo: undefined;
    Security: undefined;
    Addressbook: undefined;
    Settings: undefined;
    UpgradeFees: undefined;
    HelpCenter: undefined;
    // ... Add other screens from your RootStack defined in cardsApp_AppContainer.tsx
};
export interface NewProfileCustomProps {
    blockFocusEffects?: boolean;
}

export interface AvatarItem {
    id: string;
    source: ImageSourcePropType; 
    type: 'network' | 'local_asset'; // To help differentiate
}