import { useState, useCallback } from "react";
import { formatDateMonth, isErrorDispaly } from "../../../utils/helpers";
import TransactionService from "../../../services/transaction";

interface Transaction {
  id: string;
  merchantName: string;
  txDate: string;
  amount: string;
  state: string;
  currency: string;
}

interface TransactionData {
  data: Transaction[];
  total: number;
  aggregateResults: any;
  errors: any;
}

interface ApiResponse {
  status: number;
  data: TransactionData;
}

export const useTransactionData = ({ transactionType }: { transactionType: 'cryptoback' | 'referral' }) => {
  const [pageNo, setPageNo] = useState<number>(1);
  const [transactionListLoading, setTransactionListLoading] = useState<boolean>(false);
  const [errormsg, setErrormsg] = useState<string>("");
  const [transactionsList, setTransactionsList] = useState<ApiResponse | null>(null);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);

  const getAllTransactionsList = useCallback(
    async (
      currentPage: number,
      selectedTransactionType?: string,
      selectedStartDate?: Date,
      selectedEndDate?: Date,
      isInitialCall = false
    ) => {
      setTransactionListLoading(true);
      const pageSize = 10;
      try {
        const apiCall = transactionType === 'referral' 
          ? TransactionService.getReferralTransactions
          : TransactionService.getCryptobackRewardsAllTransactions;
        
        let filterType;
        if (isInitialCall) {
          filterType = "All";
        } else {
          filterType = selectedTransactionType === "All" ? "All" : selectedTransactionType;
        }
        
        const newTransactions: any = await apiCall(
          filterType,
          selectedStartDate && formatDateMonth(selectedStartDate) || "",
          selectedEndDate && formatDateMonth(selectedEndDate) || "",
          currentPage,
          pageSize
        );
        if (newTransactions?.status==200) {
          const newData = newTransactions.data.data || [];
          setTransactionsList((prevData: ApiResponse | null) =>
            currentPage === 1 ? newTransactions : { ...newTransactions, data: { ...newTransactions.data, data: [...(prevData?.data?.data || []), ...newData] } }
          );
          setHasMoreData(newData.length === pageSize);
          setErrormsg("");
        } else {
          setErrormsg(isErrorDispaly(newTransactions));
          setHasMoreData(false);
        }
      } catch(error)  {
        setErrormsg(isErrorDispaly(error));
        if (currentPage === 1) setTransactionsList(null);
        setHasMoreData(false);
      } finally {
        setTransactionListLoading(false);
      }
    },
    [transactionType]
  );

  const loadMoreData = useCallback(
    (selectedType: string, startDate: Date | null, endDate: Date | null) => {
      if (!hasMoreData || transactionListLoading) return;
      const nextPage = pageNo + 1;
      setPageNo(nextPage);
      getAllTransactionsList(nextPage, selectedType, startDate ?? undefined, endDate ?? undefined);
    },
    [hasMoreData, transactionListLoading, pageNo, getAllTransactionsList]
  );

  return {
    pageNo,
    setPageNo,
    transactionListLoading,
    errormsg,
    setErrormsg,
    transactionsList,
    setTransactionData: setTransactionsList,
    getAllTransactionsList,
    loadMoreData,
    hasMoreData,
  };
};