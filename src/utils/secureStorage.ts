import Keychain from 'react-native-keychain';
import { Logger } from './Logger';

const setItem = async (key: string, value: string): Promise<void> => {
  try {
    await Keychain.setGenericPassword(key, value, { service: key });
  } catch (error) {
    Logger.error(`Error storing ${key} in Keychain:`, error);
    throw error;
  }
};

const getItem = async (key: string): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({ service: key });
    return credentials ? credentials.password : null;
  } catch (error) {
    Logger.error(`Error retrieving ${key} from Keychain:`, error);
    return null;
  }
};

const removeItem = async (key: string): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({ service: key });
  } catch (error) {
    Logger.error(`Error removing ${key} from Keychain:`, error);
    throw error;
  }
};

const multiGet = async (keys: string[]): Promise<Array<[string, string | null]>> => {
  const results: Array<[string, string | null]> = [];
  for (const key of keys) {
    const value = await getItem(key);
    results.push([key, value]);
  }
  return results;
};

const multiSet = async (keyValuePairs: Array<[string, string]>): Promise<void> => {
  for (const [key, value] of keyValuePairs) {
    await setItem(key, value);
  }
};

const multiRemove = async (keys: string[]): Promise<void> => {
  for (const key of keys) {
    await removeItem(key);
  }
};

export const SecureStorage = {
  setSecureItem: setItem,
  getSecureItem: getItem,
  removeSecureItem: removeItem,
  multiGetSecure: multiGet,
  multiSetSecure: multiSet,
  multiRemoveSecure: multiRemove,
};