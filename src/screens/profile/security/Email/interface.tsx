export interface ChangeEmailInterface {
  email: string;
  action: "changeemail";
}

export interface EmailAuthenticationScreenProps {
  navigation: {
    navigate: (route: string, params?: Record<string, any>) => void;
  };
}