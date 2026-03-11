import { useState, useCallback } from "react";
import TransactionService from "../../services/transaction";
import { dateFilter, isErrorDispaly } from "../../utils/helpers";
import { MemberShip, StatusItem, Transaction } from "../commonScreens/transactions/interface";

interface UseTransactionDataProps {
    initialModule?: string;
    screenName?: string;
}

export const useTransactionData = (props: UseTransactionDataProps) => {
    const [pageNo, setPageNo] = useState<number>(1);
    const [transactionListLoading, setTransactionListLoading] = useState<boolean>(true);
    const [hasMoreData, setHasMoreData] = useState<boolean>(false);
    const [errormsg, setErrormsg] = useState<string>("");
    const [transactionsList, setTransactionData] = useState<Transaction[]>([]);
    const [stateLu, setStateLu] = useState<StatusItem[]>();
    const [memberShip, setMemberShips] = useState<MemberShip[]>();

    const getAllTransactionsList = useCallback(
        async (
            currentPage: number,
            currentSearchQuery: string,
            selectedTransactionType?: string,
            selectedCurrency?: string,
            selectedStartDate?: Date,
            selectedEndDate?: Date
        ) => {
            setTransactionListLoading(true);
            const pageSize = 10;
             

            // Apply transaction type filter - use selected type or fallback to "All"
            const transactionTypeFilter = selectedTransactionType && selectedTransactionType !== 'All' ? selectedTransactionType : "All";

            // Apply currency filter - use selected currency or fallback to search query
            const currencyOrCardFilter = selectedCurrency && selectedCurrency !== 'All' ? selectedCurrency : currentSearchQuery;
            try {
                const response: any = await TransactionService.getAllTransactionsList(
                    currencyOrCardFilter.trim() === "" ? "All" : currencyOrCardFilter.trim(),
                    transactionTypeFilter,
                    selectedStartDate== undefined ? "" : dateFilter(selectedStartDate),
                    selectedEndDate== undefined ? "" : dateFilter(selectedEndDate),
                    currentPage,
                    pageSize,
                    props?.screenName,
                );
                 setErrormsg("");
                if (response.status==200) {
                    const newTransactions = response?.data?.data || [];
                    setTransactionData(prevData => currentPage === 1 ? newTransactions : [...prevData, ...newTransactions]);
                    setHasMoreData(newTransactions.length === pageSize);
                    setErrormsg("");
                } else {
                    setErrormsg(isErrorDispaly(response));
                    if (currentPage === 1) setTransactionData([]); // Clear data on error for first page
                    setHasMoreData(false);
                }
            } catch (error) {
                setErrormsg(isErrorDispaly(error));
                if (currentPage === 1) setTransactionData([]);
                setHasMoreData(false);
            } finally {
                setTransactionListLoading(false);
            }
        },
        [props.initialModule]
    );

    const loadMoreData = useCallback((searchQuery: string, appliedSelectedState?: string, appliedAccountMemberName?: string, startDate?: Date | null, endDate?: Date | null, selectedTransactionType?: string, selectedCurrency?: string) => {
        if (hasMoreData && !transactionListLoading) {
            const nextPage = pageNo + 1;
            setPageNo(nextPage);
            getAllTransactionsList(nextPage, searchQuery, selectedTransactionType, selectedCurrency);
        }
    }, [hasMoreData, transactionListLoading, pageNo, getAllTransactionsList]);
    return {
        pageNo, setPageNo,
        transactionListLoading,
        hasMoreData,
        errormsg, setErrormsg,
        transactionsList, setTransactionData,
        stateLu, memberShip,
        getAllTransactionsList,
        loadMoreData,
    };
};