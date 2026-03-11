// src/navigation/types.ts
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Defines the parameters for each screen in the stack
export type RootStackParamList = {
  Login: undefined; // No params expected for Login screen
  Mfa: { mfaToken: string }; // Mfa screen requires an mfaToken
  MfaEnrollment: { mfaToken: string }; // MfaEnrollment screen also requires an mfaToken
  Home: undefined; // No params expected for Home screen
};

// This exports a typed version of the props for each screen
export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type MfaScreenProps = NativeStackScreenProps<RootStackParamList, 'Mfa'>;
export type MfaEnrollmentScreenProps = NativeStackScreenProps<RootStackParamList, 'MfaEnrollment'>;
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;