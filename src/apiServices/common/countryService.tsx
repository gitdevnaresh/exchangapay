import { get } from "../ApiService";
import { isErrorDispaly } from "../../utils/helpers";
import TransactionService from "./transaction";

// Cache with timestamps
let countryCache: { data: any[], timestamp: number } | null = null;
let countryWithStatesCache: { data: any[], timestamp: number } | null = null;
let phoneCodesCache: { data: any[], timestamp: number } | null = null;
let verificationCache: { data: any, timestamp: number } | null = null;
let genderCache: { data: any[], timestamp: number } | null = null;
// Cache duration (24 hours) - countries/states rarely change
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Get countries only
export const getCountries = async () => {
  // Check if cache exists and is not expired
  if (countryCache && (Date.now() - countryCache.timestamp) < CACHE_DURATION) {
    return { ok: true, data: countryCache.data };
  }
  
  try {
    const response: any = await get('api/v2/countries/lookup');
    if (response.ok && (response.data as any)?.Country) {
      countryCache = { data: response.data.Country, timestamp: Date.now() };
      return { ok: true, data: countryCache.data };
    }
    return { ok: false, error: isErrorDispaly(response) };
  } catch (error: any) {
    return { ok: false, error: isErrorDispaly(error) };
  }
};

// Get countries with states only
export const getCountriesWithStates = async () => {
  // Check if cache exists and is not expired
  if (countryWithStatesCache && (Date.now() - countryWithStatesCache.timestamp) < CACHE_DURATION) {
    return { ok: true, data: countryWithStatesCache.data };
  }
  
  try {
    const response: any = await get('api/v2/countryWithStates/lookup');
    if (response.ok && (response.data as any)?.countryWithStates) {
      countryWithStatesCache = { data: (response.data as any).countryWithStates, timestamp: Date.now() };
      return { ok: true, data: countryWithStatesCache.data };
    }
    return { ok: false, error: isErrorDispaly(response) };
  } catch (error: any) {
    return { ok: false, error: isErrorDispaly(error) };
  }
};

// Get phone codes only
export const getPhoneCodes = async () => {
  // Check if cache exists and is not expired
  if (phoneCodesCache && (Date.now() - phoneCodesCache.timestamp) < CACHE_DURATION) {
    return { ok: true, data: phoneCodesCache.data };
  }
  
  try {
    const response: any = await get('api/v2/PhoneCodes/lookup');
    if (response.ok && (response.data as any)?.PhoneCodes) {
      phoneCodesCache = { data: response.data.PhoneCodes, timestamp: Date.now() };
      return { ok: true, data: phoneCodesCache.data };
    }
    return { ok: false, error: isErrorDispaly(response) };
  } catch (error: any) {
    
    return { ok: false, error: isErrorDispaly(error) };
  }
};

// Get gender lookup
export const getGenderLookup = async () => {
  // Check if cache exists and is not expired
  if (genderCache && (Date.now() - genderCache.timestamp) < CACHE_DURATION) {
    return { ok: true, data: genderCache.data };
  }
  
  try {
    const response: any = await get('api/v1/registration/gender');
    if (response.ok && response.data) {
      genderCache = { data: response.data?.Gender, timestamp: Date.now() };
      return { ok: true, data: genderCache.data };
    }
    return { ok: false, error: isErrorDispaly(response) };
  } catch (error: any) {
    return { ok: false, error: isErrorDispaly(error) };
  }
};

// Transform for picker
export const transformForPicker = (data: any[]) => {
  return data.map(item => ({
    id: item.id,
    name: item.name,
    code: item.code 
  }));
};

// Get states for country
export const getStatesForCountry = (countryId: string, countriesWithStates: any[]) => {
  const country = countriesWithStates.find(c => c.id === countryId);
  return country?.details || [];
};


// Get verification data
export const getVerificationData = async () => {
  // Check if cache exists and is not expired
  if (verificationCache && (Date.now() - verificationCache.timestamp) < CACHE_DURATION) {
    return { ok: true, data: verificationCache.data };
  }
  
  try {
    const response: any = await TransactionService.getVerficationData();
    if (response?.ok) {
      verificationCache = { data: response.data, timestamp: Date.now() };
      return { ok: true, data: verificationCache.data };
    }
    return { ok: false, error: isErrorDispaly(response) };
  } catch (error: any) {
    return { ok: false, error: isErrorDispaly(error) };
  }
};

// Clear cache
export const clearCache = () => {
  countryCache = null;
  countryWithStatesCache = null;
  phoneCodesCache = null;
  genderCache = null;
};
export const clearVerificationCache =()=>{
  verificationCache = null;

}