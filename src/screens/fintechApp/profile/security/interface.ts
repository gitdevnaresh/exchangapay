export interface ResetPasswordFormValues {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }
  export interface DeleteAccount {
  customerId:string;
  state:string
  }
export interface SaveObjectInterface {
  customerId: string,
  isEmailVerification: any,
  isPhoneVerified: any,
  isMfaEnabled: any,
  isLiveVerification: any,
  securityType: any,
}