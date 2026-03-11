import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export interface ProfileMenuItemsProps {
    navigation: NativeStackNavigationProp<MainStackParamList>;
    commonStyles: CommonStylesType;
    NEW_COLOR: ThemeColors;
    handleKycKybProfile: () => void;
    securityLevel?: string;
    securityLevelLoading?: boolean;
    setError?: (error: string) => void;
    isLogoutLoading?: boolean;
    setIsLogoutLoading?: (value: boolean) => void;
}

// User profile data interface
export interface UserProfileData {
    accountType?: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
    email?: string;
    reference?: string;
    image?: string;
    imageURL?: string;
    website?: string;
    kycLevel?: string | null;
    name?: string;
    isBusiness?: boolean;
    idIssuranceCountry?: string;
    country?: string;
    incorporationDate?: string;
    phonecode?: string;
    phoneNumber?: string;
    countryOfResidence?: string;
    customerState?: string;
    nickName?: string;
    id?: string;
    isKYC?: boolean;
    Community: string;
    ShareScreen?: string;
    userName?: string

}

// Redux root state interface
export interface RootState {
    userReducer: {
        userDetails: UserProfileData | null;
        // Add other properties of userReducer if any
    };
}

// Security level details interface
export interface SecurityLevelDetails {
    level?: string;
}

// Referral details interface
export interface ReferralDetails {
    referralCode?: string;
}

export interface NewProfileCustomProps {
    blockFocusEffects?: boolean;
}
// MainStackParamList type for navigation
export type MainStackParamList = {
    KybCompanyData: undefined;
    KybUboList: undefined;
    KybDirectorDetailsList: undefined;
    KybInfoPreview: { navigation: string };
    KycProfile: { navigation: string };
    KycProfileStep2: { navigation: string };
    KycProfilePreview: { navigation: string };
    PersonalInfo: {
        userDetails: UserProfileData | null;
        referralDetails: { referralCode?: string } | null;
    };
    EditPersonalInfo: { isEdit: boolean };
    Dashboard: { initialTab?: string } | undefined;
    ComingSoon: undefined;
    SplaceScreen: undefined;
    NewProfile: { userInfo?: UserProfileData; blockFocusEffects?: boolean } | undefined;
    MembersDashBoard: undefined;
    CardsTransactions: { trasactionType?: string; cardId?: string; currency?: string; } | undefined;
    AllPersonalInfo: undefined;
    Security: { securityLevel?: string };
    DeleteAccount: undefined;
    EmailAuthenticationScreen: {
        email: string;
        isVerifyOldEmail?: boolean;
        isVerifyNewEmail?: boolean;
    };
    EmailOtpVericication: {
        email: string;
        isVerifyOldEmail?: boolean;
        isVerifyNewEmail?: boolean;
    };
    EmailChange: {
        email: string;
        isVerifyOldEmail?: boolean;
        isVerifyNewEmail?: boolean;
    };
    Addressbook: undefined;
    Settings: undefined;
    UpgradeFees: undefined;
    HelpCenter: undefined;
    CurrencyList: undefined;
    SelectCountry: undefined;
    // ... Add other screens as needed
};
export interface ProfileMenuItemsProps {
    navigation: NativeStackNavigationProp<MainStackParamList>;
    commonStyles: CommonStylesType;
    NEW_COLOR: ThemeColors;
    handleKycKybProfile: () => void;
    securityLevel?: string;
    securityLevelLoading?: boolean;
}

export interface CommonStylesType {
    sectionGap?: object;
    titleSectionGap?: object;
    hLine?: object;
    profileMenuSectionTitle?: object;
    profileMenuItemRow?: object;
    profileMenuItemLeft?: object;
    quicklinks?: object;
    profileMenuIconContainer?: object;
    profileMenuItemText?: object;
    profileMenuItemRight?: object;
    profileMenuSecurityLevel?: object;
    listGap?: object;
    profileMenuVersionText?: object;
    profileMenulistGap?: object;
    mb24?: object;
    mb32?: object;
    fs12?: object;
    mb10?: object;
    menuitemspace?: object;

    // ...add other style keys as needed
}

export interface ThemeColors {
    TEXT_WHITE: string;
    LOGIN_BTN: string;
    TEXT_GREEN: string;
    TEXT_YELLOW: string;
    ICON_GREY: string;

    // ...add other color keys as needed
}

export type PersonalInfoScreenRouteProp = RouteProp<MainStackParamList, 'PersonalInfo'>;

export interface PersonalInfoProps {
    route: PersonalInfoScreenRouteProp;
}