import { useState } from 'react';
import { useSelector } from 'react-redux';
import ProfileService from '../services/profile';
import { log } from '../utils/logger';

const useSendUserWebhook = () => {
  const [loading, setLoading] = useState(false);
  const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);
  const sendWebhook = async (queryType: string) => {
    if (!userInfo) return;
    // The backend's CustomerEvent route reads the customer from the token and
    // forwards to Make.com, so no personal data is decrypted or sent from the
    // device and the webhook address never ships in the bundle.
    try {
      setLoading(true);
      const response: any = await ProfileService.sendCustomerEvent(queryType);
      if (!response?.ok) {
        // A side effect of an action that already succeeded: never block the
        // user, but do not swallow the failure either.
        log.warn('Customer event failed', { queryType, status: response?.status });
      }
      return response;
    } finally {
      setLoading(false);
    }
  };

  return { sendWebhook, loading };
};

export default useSendUserWebhook;
