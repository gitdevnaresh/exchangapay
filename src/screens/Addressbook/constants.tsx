import * as Yup from 'yup';
import { validateCryptoAddress } from '../../utils/helpers';

export const validationSchema = Yup.object().shape({
    favoriteName: Yup.string()
        .min(3, 'Favorite name must be at least 3 characters')
        .max(50, 'Favorite name must be at most 50 characters')
        .matches(
            /^(?=.*[A-Za-z])[A-Za-z0-9_'\-](?:[A-Za-z0-9 _'\-]*[A-Za-z0-9_'\-])?$/,
            "Please enter valid favourite name"
        )
        .required('Is required'),
    coin: Yup.string().required("Is required"),
    network: Yup.string().required("Is required"),

    walletAddress: Yup.string()
        .required("Is required")
        .test(
            'no-leading-trailing-spaces',
            'Please enter or scan valid address.',
            value => value === undefined || (value === value?.trim())
        )
        .test('is-valid-for-network', 'Please enter or scan valid address.', function (value) {
            const { network } = this.parent; // Get the value of the 'network' field
            if (!value || !network) {
                // If either address or network is missing, let the 'required' rule handle it or consider it invalid.
                return true; // Or false, depending on how you want to handle this intermediate state. True defers to other rules.
            }
            return validateCryptoAddress(network, value);
        }),
});


export interface FormValues {
    favoriteName: string;
    coin: string;
    network: string;
    walletAddress: string;
}

export interface CryptoPayee {
    currency: string;
    favoriteName: string;
    id: string;
    network: string;
    state: string;
    status: string;
    type: string;
    walletAddress: string;
    isEmailVerified: boolean;
};

export interface PayeeViewLoaders {
    isBtnLoading: boolean,
    isCloseLoading: boolean
}
