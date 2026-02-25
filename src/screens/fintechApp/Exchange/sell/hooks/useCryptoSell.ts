import { useState, useCallback } from "react";
import ExchangeCommonService from "../../../../../apiServices/exchange/common/exchangeCommonService";
import ExchangeSellService from "../../../../../apiServices/exchange/sell/exchangeSellService";
import { isErrorDispaly } from "../../../../../utils/helpers";

interface CryptoAsset {
  id: string;
  code: string;
  name: string;
  amount: number;
  image?: string;
}

interface FiatAsset {
  id: string;
  code: string;
  name: string;
  amount: number;
  image?: string;
}

interface DropDownObj {
  min: number | null;
  max: number | null;
  amount: number;
  id: string;
  code?: string;
  name?: string;
  image?: string;
}

interface SummaryData {
  assetValue: number;
  fee: number;
  totalAmount: number;
  oneCoinValue?: number;
}

interface ApiResponse<T> {
  ok: boolean;
  data: T;
}

interface MinMaxResponse {
  min: number | null;
  max: number | null;
  amount: number;
  id: string;
  code: string;
  name: string;
  image: string;
}

interface CryptoBalanceResponse {
  cryptoAssets: CryptoAsset[];
  fiatAssets: FiatAsset[];
}

interface AssetValueResponse {
  toAssetValue: number;
}

export const useCryptoSell = () => {
  const [cryptoCoinData, setCryptoCoinData] = useState<CryptoAsset[]>([]);
  const [dropDownList, setDropDownList] = useState<FiatAsset[]>([]);
  const [coinDataLoading, setCoinDataLoading] = useState<boolean>(false);
  const [getDropDownObj, setDropDownObj] = useState<DropDownObj>({ min: null, max: null, amount: 0, id: '' });
  const [oneCoinValLoader, setOneCionValLoder] = useState<boolean>(false);
  const [changeAmountLoader, setChangeAmountLoader] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const getMinAxDetails = useCallback(async (selectedCryptoCoin: string) => {
    if (!selectedCryptoCoin) return;
    setOneCionValLoder(true);
    setError("");

    try {
      const response = await ExchangeSellService.getSelectesSellMinMaxValue(selectedCryptoCoin) as ApiResponse<MinMaxResponse>;
      if (response?.ok) {
        setDropDownObj({ 
          min: response?.data?.min , 
          max: response?.data?.max , 
          amount: response?.data?.amount || 0,
          id: response?.data?.id ,
          code: response?.data?.code ,
          name: response?.data?.name ,
          image: response?.data?.image || ""
        });
      } else {
        const selectedCrypto = cryptoCoinData.find((crypto: CryptoAsset) => crypto.code === selectedCryptoCoin);
        setDropDownObj({ 
          min: 0.0001, 
          max: 10000, 
          amount: selectedCrypto?.amount || 0,
          id: selectedCrypto?.id || selectedCryptoCoin 
        });
      }
    } catch (error) {
      setError(isErrorDispaly(error));
    } finally {
      setOneCionValLoder(false);
    }
  }, [cryptoCoinData]);

  const getCryptoCoins = useCallback(async () => {
    setCoinDataLoading(true);
    setError("");
    try {
      const response = await ExchangeSellService.getSelectedsellCryptoBalance() as ApiResponse<CryptoBalanceResponse>;
      if (response?.ok) {
        setCryptoCoinData(response?.data?.cryptoAssets || []);
      } else {
        setError(isErrorDispaly(response));
      }
    } catch (error) {
      setError(isErrorDispaly(error));
    } finally {
      setCoinDataLoading(false);
    }
  }, []);

  const getFiatAssetsData = useCallback(async () => {
    setError("");
    try {
      const response = await ExchangeSellService.getSelectedsellCryptoBalance() as ApiResponse<CryptoBalanceResponse>;
      if (response?.ok && response.data?.fiatAssets?.length > 0) {
        const fiatAssets = response.data.fiatAssets;
        setDropDownList(fiatAssets);
        return fiatAssets;
      } else {
        setError(isErrorDispaly(response));
      }
    } catch (error) {
      setError(isErrorDispaly(error));
    }
  }, []);

  const getSummaryDetails = useCallback(async (amount: number | string, selectedValue: string, fiatSeletedVal: string) => {
    if (!amount || !selectedValue || !fiatSeletedVal) return null;
    
    try {
      const payload = {
        fromAsset: selectedValue,
        toAsset: fiatSeletedVal,
        assetValue: Number(amount)
      };
      
      const response = await ExchangeSellService.getsummarysellDetails(payload) as ApiResponse<SummaryData>;
      if (response?.ok) {
        setSummaryData(response.data);
        setShowSummary(true);
        return response.data; // Return the data
      }
      else{
        setError(isErrorDispaly(response));
      }
      return null;
    } catch (error) {
        setError(isErrorDispaly(error));
        return null;
    }
  }, []);

  const getFromAssetValue = useCallback(async (changeAmount: number | string, selectedValue: string, fiatSeletedVal: string, setCryptoConvertVal: (value: string) => void) => {
    if (!changeAmount || changeAmount === 0) {
      setCryptoConvertVal("");
      setSummaryData(null);
      setShowSummary(false);
      return;
    }
    if (!selectedValue || !fiatSeletedVal) return;
    setChangeAmountLoader(true);
    setError("");
    
    try {
      const response = await ExchangeCommonService.getEnteredCryptoFiatValue(
        selectedValue,
        fiatSeletedVal,
        Number(changeAmount),
        "sell"
      ) as ApiResponse<AssetValueResponse>;
      if (response?.ok) {
        setCryptoConvertVal(response?.data?.toAssetValue?.toFixed(2) || 0);
      } else {
        setError(isErrorDispaly(response));
      }
    } catch (error) {
      setError(isErrorDispaly(error));
    } finally {
      setChangeAmountLoader(false);
    }
  }, []);

  const clearSummary = useCallback(() => {
    setSummaryData(null);
    setShowSummary(false);
  }, []);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  return {
    cryptoCoinData,
    dropDownList,
    coinDataLoading,
    getDropDownObj,
    oneCoinValLoader,
    changeAmountLoader,
    summaryData,
    showSummary,
    error,
    getMinAxDetails,
    getCryptoCoins,
    getFiatAssetsData,
    getSummaryDetails,
    getFromAssetValue,
    clearSummary,
    clearError,
    setDropDownObj
  };
};