export interface AddressInterface {
    firstname?: string;
    lastname?: string;
    country?: string;
    lastName?: string;
    state?: string;
    firstName?:string;
    city?: string;
    phoneNumber?: string;
    phoneCode?: string;
    addressLine1?: string;
    addressLine2?: string;
    postalCode?: string;
    town?: string;
    email?: string;
    isDefault?: boolean;
    addressDetails?: {
      firstName?: string;
      lastName?: string;
      country?: string;
      state?: string;
      city?: string;
      phoneNumber?: string;
      phoneCode?: string;
      addressLine1?: string;
      addressLine2?: string;
      postalCode?: string;
      town?: string;
      email?: string;
      isDefault?: boolean;
      line1?:string,
      line2?:string
  
    };
    name?: string;
    towns?: string[];
  }
  export interface KycProfileFormValues {
      firstName: string;
      lastName: string;
      gender: string;
      dob: string | Date;
    }

    export interface KycStepPostObject {
        id: string;
        firstName: string;
        lastName: string;
        gender: string;
        dob: string ,    
    }
    