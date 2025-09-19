import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKey } from '../constants';

export const getAuthTokensFromStorage = async () => {
  const [
    [, accessToken],
    [, accessTokenExpirationDate],
    [, refreshToken],
  ] = await AsyncStorage.multiGet([
    StorageKey.authAccessToken,
    StorageKey.authAccessTokenExpirationDate,
    StorageKey.authRefreshToken,
  ]);

  let accessTokenExpired = false;
  if (accessTokenExpirationDate) {
    const now = dayjs();
    const expirationAt = dayjs(accessTokenExpirationDate);
    accessTokenExpired = expirationAt.diff(now) < 0;
  }

  return {
    accessToken,
    accessTokenExpirationDate,
    accessTokenExpired,
    refreshToken,
  };
};
export const getKeyEncrypt = async () => {
  const [[, memberId], [, keySK]] = await AsyncStorage.multiGet([StorageKey.memberId, StorageKey.keySK]);
  return {
    memberId,
    keySK,
  };
};

export const setAuthTokensToStorage = async (accessToken:any, accessTokenExpirationDate:any, refreshToken:any ) => {
  await AsyncStorage.multiSet([
    [StorageKey.authAccessToken, accessToken],
    [StorageKey.authAccessTokenExpirationDate, accessTokenExpirationDate],
    [StorageKey.authRefreshToken, refreshToken],
  ]);

  return {
    accessToken,
    accessTokenExpirationDate,
    refreshToken,
  };
};

export const removeAuthTokensFromStorage = async () => {
  await AsyncStorage.multiRemove([
    StorageKey.authAccessToken,
    StorageKey.authAccessTokenExpirationDate,
    StorageKey.authRefreshToken,
  ]);

  return null;
};

export const setEncryptKey = async ( memberId:any, keySK:any ) => {
  await AsyncStorage.multiSet([
    [StorageKey.memberId, memberId],
    [StorageKey.keySK, keySK],
  ]);
};
