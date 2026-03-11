import { get, post } from "../../utils/ApiService";




export const Verification = {

    getVerificationData: async (customerId: any) => {
        return await get(`api/v1/Security/Verificationfields/${customerId}`);
    },
    getNetworkLu: async (coinCode: any, customerId: any, merchantId: any, actiontype: any) => {
        return await get(`api/v1/Affiliate/Vaults/NetWorkLU//api/v1/Affiliate/Vaults/NetWorkLU/${coinCode}/${customerId}/${merchantId}/${actiontype}`)
    },
    couponSummery: async (body: any) => {
        return await post(`api/v1/Affiliate/couponsummary`, body)
    },

}