export interface FormValues {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  country: string;
  state?: string;
  city: string;
  pincode: string;
  dob: Date | null;
  phoneCode?: string;
  phoneNumber?: string;
  email?: string;
  employmentStatus?: string;
  occupation?: string;  
  annualSalary?: string;
  estimatedMonthlyValue?: string;
  accountPurpose?: string;
}
export interface Country {
  name: string;
  code: string;
  isCountryRestrict: boolean;
  flag: string;
  mobileCode: string;
  length: number;
  [key: string]: any;
}