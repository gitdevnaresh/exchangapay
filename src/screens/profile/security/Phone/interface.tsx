export interface PhoneNumberInterface {
  source: string;
  action: string;
  phonenumber: string;
  phonecode?: string;

}

export interface PhoneAuthenticationScreenProps {
  navigation: {
    navigate: (route: string, params?: Record<string, any>) => void;
  };
}


export interface CountryCodeItem {
  name?: string;
  code?: string;
  logo?: string | null;
  flag?: string;
  recorder?: number; // Represents an order or some numerical record
}


export interface CountryCodeDataState {
  countryCodeLoader?: boolean;
  countryCodelist?: CountryCodeItem[];
  PhoneCodes?: CountryCodeItem[] // Array of CountryCodeItem
}
