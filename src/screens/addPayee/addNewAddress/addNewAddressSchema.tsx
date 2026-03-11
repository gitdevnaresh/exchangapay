import * as Yup from 'yup';
import { getaddressFormat } from '../../../utils/addressValidation';


export const addNewAddressSchema = Yup.object().shape({
    walletAddress: Yup.string()
        .required("")
        .test("valid-address", "GLOBAL_CONSTANTS.INVALID_WALLET_ADDRESS", function(value) {
            const { selectedNetworkCode } = this.parent; // Access selectedNetworkCode from form values
            return getaddressFormat(selectedNetworkCode, value) !== null;
        }),
});