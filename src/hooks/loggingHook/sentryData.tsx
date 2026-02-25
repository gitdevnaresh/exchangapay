import React, { useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
import { useSelector } from 'react-redux';
import useEncryptDecrypt from '../encDecHook';

export const SentryUserSetup = () => {
  const userInfo = useSelector(
    (state: { userReducer: { userDetails: any } }) => state.userReducer?.userDetails
  );
  const { decryptAES } = useEncryptDecrypt();

  useEffect(() => {
    if (userInfo) {
      Sentry.setUser({
        id: userInfo?.id?.toString(),
        username: userInfo?.name,
        email: userInfo?.email ? decryptAES(userInfo.email) : undefined,
      });
    } else {
      Sentry.setUser(null); // clear user on logout
    }
  }, [userInfo, decryptAES]);

  return null; // no UI rendered
};
