export interface Address {
    id: string | number;
    isDefault: boolean;
    favoriteName: string;
    phoneCode?: string | number;
    phoneNumber: string | number;
    addressLine1: string;
    addressLine2?: string;
    town?: string;
    city: string;
    state: string;
    country: string;
}

export interface SuccessApiResponse<T> {
    ok: true;
    data: { data: T };
    [key: string]: any;
}

export interface ErrorApiResponse {
    ok: false;
    data?: unknown;
    [key: string]: any;
}
