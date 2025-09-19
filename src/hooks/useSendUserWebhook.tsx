import { useState } from 'react';
import { formatDateTimeAPI } from '../utils/helpers';

import { useSelector } from 'react-redux';
import useEncryptDecrypt from './useEncryption_Decryption';
import ProfileService from '../services/profile';
import { getAllEnvData } from '../../Environment';

const useSendUserWebhook = () => {
  const [loading, setLoading] = useState(false);
  const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);
const {decryptAES}=useEncryptDecrypt();
  const sendWebhook = async (queryType: string) => {
   const environment=getAllEnvData()
   if(environment.envName!=="prod"){
    return;
   }
    if (!userInfo) return;
    const payLoad = {
      customerId: userInfo?.id || '',
      customerName:
        decryptAES(userInfo?.firstName) + ' ' + decryptAES(userInfo?.lastName) || '',
      country: userInfo?.country || '',
      phoneNumber: decryptAES(userInfo?.phonecode)+ decryptAES(userInfo?.phoneNumber)|| '',      email: decryptAES(userInfo?.email) || '',
      phoneVerified: userInfo?.isPhoneNumberVerified || false,
      emailVerified: userInfo?.isEmailVerified || false,
      kycVerified: userInfo?.isKYC || false,
      Querytype: queryType,
      createdDate: formatDateTimeAPI(userInfo?.createdDate) || '',
    };
    try {
      setLoading(true);
      const response = await ProfileService.sendUserWebhook(payLoad);
      return response;
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return { sendWebhook, loading };
};

export default useSendUserWebhook;
