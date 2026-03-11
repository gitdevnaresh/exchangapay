export interface Loaders {
    signUpLoader: boolean;
    loginLoader: boolean;
    googleLoader: boolean;
    socialSignupLoader:boolean;
};
export interface LoginValues {
    email: string;
    password: string;
};
export interface SignupFormValues {
    email: string;
    referralCode?: string;
    termsAccepted: boolean;
}
export interface Auth0SignupFormValues {
    password: string;
    confirmPassword: string;
};

export interface ReferralInfo {
    isValidReferral: boolean | null;
    customerName: string;
    referralCode: string;
}