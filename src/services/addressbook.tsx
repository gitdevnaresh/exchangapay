import { get, post, put } from '../utils/ApiService';
const AddressbookService = {
  getAllCryptoPayees: async (searchQuery: any, page: any, pageSize: any) => {
    return get(`api/v1/Common/CryptoPayees?favoriteName=${searchQuery}&page=${page}&pageSize=${pageSize}`);
  },
  savePayee: async (body: any) => {
    return post(`api/v1/Common/SaveCryptoPayee`, body);
  },
  getPayeeDetails: async (id: any) => {
    return get(`api/v1/Common/Payees/Crypto/${id}`);
  },
  inActivePayee: async (type: any, id: any, body: any) => {
    if (type !== "active") {
      return put(`/api/v1/Common/Payees/${id}/disable`, body)
    } else {
      return put(`/api/v1/Common/Payees/${id}/enable`, body)
    }
  },
  activePayee: async (id: any, body: any) => {
    return put(`/api/v1/Common/Payees/${id}/enable`, body)
  },
  getCryptoPayees: async (coin: any, network: any) => {
    return get(`api/v1/Common/GetCryptoPayees?coin=${coin}&network=${network}`);

  }, emailVerification: async (body: any) => {
    return post(`api/v1/Common/PayeeVerifyEmail`, body);
  }, resendPayeeEmailOtp: async (body: any) => {
    return post(`api/v1/Common/PayeeResendEmail`, body);
  }
};

export default AddressbookService;