import dayjs from 'dayjs';
import { StorageKey } from '../constants';
import { SecureStorage } from './secureStorage';
import { Logger } from './Logger';

export const getAuthTokensFromStorage = async () => {
  try{
  const [
    [, accessToken],
    [, accessTokenExpirationDate],
    [, refreshToken],
  ] = await SecureStorage.multiGetSecure([
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
  }
   catch (error) {
    Logger.error("Error retrieving auth tokens from storage", {
      originalError: error.message,
      context: "AUTH_TOKEN_STORAGE_RETRIEVAL"
    });
    
    // Throw error to halt execution (fail-closed)
    throw new Error("SECURE_SESSION_FAILED");
  }
};
export const getKeyEncrypt = async () => {
  try{
  const [[, memberId], [, keySK]] = await SecureStorage.multiGetSecure([StorageKey.memberId, StorageKey.keySK]);
    if (!memberId || !keySK) {
      throw new Error("ENCRYPTION_KEYS_MISSING");
    }
  return {
    memberId,
    keySK,
  };
}
  catch (error) {
    Logger.error("Error retrieving encryption keys from storage", {
      originalError: error.message,
      context: "ENCRYPTION_KEY_RETRIEVAL"
    });
    
    // Throw error to halt execution (fail-closed)
    throw new Error("SECURE_SESSION_FAILED");
  }
};

export const setAuthTokensToStorage = async (accessToken:any, accessTokenExpirationDate:any, refreshToken:any ) => {
  await SecureStorage.multiSetSecure([
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
  await SecureStorage.multiRemoveSecure([
    StorageKey.authAccessToken,
    StorageKey.authAccessTokenExpirationDate,
    StorageKey.authRefreshToken,
  ]);

  return null;
};

export const setEncryptKey = async ( memberId:any, keySK:any ) => {
  await SecureStorage.multiSetSecure([
    [StorageKey.memberId, memberId],
    [StorageKey.keySK, keySK],
  ]);
};

