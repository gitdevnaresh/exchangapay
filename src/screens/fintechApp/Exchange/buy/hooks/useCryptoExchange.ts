import { useState, useCallback } from "react";
import ExchangeCommonService from "../../../../../apiServices/exchange/common/exchangeCommonService";
import ExchangeBuyService from "../../../../../apiServices/exchange/buy/exchangeBuyService";
import { isErrorDispaly } from "../../../../../utils/helpers";
import { ConvertValueResponse, CryptoAsset, CryptoBalanceResponse, DropDownObj, FiatAsset, MinMaxResponse, SummaryResponse } from "../../interface";


export const useCryptoExchange = () => {
  const [cryptoCoinData, setCryptoCoinData] = useState<CryptoAsset[]>([]);
  const [dropDownList, setDropDownList] = useState<FiatAsset[]>([]);
  const [coinDataLoading, setCoinDataLoading] = useState(false);
  const [getDropDownObj, setDropDownObj] = useState<DropDownObj>({} as DropDownObj);
  const [oneCoinValLoader, setOneCionValLoder] = useState(false);
  const [changeAmountLoader, setChangeAmountLoader] = useState(false);
  const [summaryData, setSummaryData] = useState<unknown>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [error, setError] = useState("");

  const getMinAxDetails = useCallback(async (selectedCryptoCoin: string) => {
    if (!selectedCryptoCoin) return;
    setOneCionValLoder(true);
    setError("");

    try {
      const response = await ExchangeBuyService.getSelecteMinMaxValue(selectedCryptoCoin) as MinMaxResponse;
      if (response?.ok) {
        setDropDownObj({ 
          buyMin: response?.data?.min , 
          buyMax: response?.data?.max , 
          amount: response?.data?.amount || 0,
          id: response?.data?.id ,
          code: response?.data?.code ,
          name: response?.data?.name ,
          image: response?.data?.image || ""
        });
      } else {
        const selectedCrypto = cryptoCoinData.find((crypto) => crypto.code === selectedCryptoCoin);
        setDropDownObj({ 
          buyMin: 0.0001, 
          buyMax: 10000, 
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
      const response = await ExchangeCommonService.getSelecteCryptoBalance() as CryptoBalanceResponse;
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
      const response = await ExchangeCommonService.getSelecteCryptoBalance() as CryptoBalanceResponse;
      if (response?.ok && response.data?.fiatAssets?.length > 0) {
        const fiatAssets = response.data.fiatAssets;
        setDropDownList(fiatAssets);
        return fiatAssets;
      } else {
        setError(isErrorDispaly(response));
        return [];
      }
    } catch (error) {
      setError(isErrorDispaly(error));
      return [];
    }
  }, []);

  const getSummaryDetails = useCallback(async (amount: number | string, selectedValue: string, fiatSeletedVal: string) => {
    if (!amount || !selectedValue || !fiatSeletedVal) return null;
    
    try {
      const payload = {
        fromAsset: fiatSeletedVal,
        toAsset: selectedValue,
        assetValue: Number(amount)
      };
      
      const response = await ExchangeBuyService.getsummaryDetails(payload) as SummaryResponse;
      if (response?.ok) {
        setSummaryData(response.data);
        setShowSummary(true);
        return response.data; // Return the data
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
        "buy"
      ) as ConvertValueResponse;
      if (response?.ok) {
        const convertedValue = response?.data?.toAssetValue?.toFixed(2) || 0;
        setCryptoConvertVal(convertedValue);
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