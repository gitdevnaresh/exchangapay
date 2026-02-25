import { useState, useCallback }
    from "react";
import moment from "moment";
import TransactionService from "../../../apiServices/common/transaction";
import { isErrorDispaly } from "../../../utils/helpers";
import { MemberShip, StatusItem, Transaction } from "../../commonScreens/transactions/interface";

interface UseTransactionDataProps {
    initialModule?: string;
}

export const useTransactionData = (props: UseTransactionDataProps) => {
    const [pageNo, setPageNo] = useState<number>(1);
    const [transactionListLoading, setTransactionListLoading] = useState<boolean>(true);
    const [hasMoreData, setHasMoreData] = useState<boolean>(false);
    const [errormsg, setErrormsg] = useState<string>("");
    const [transactionsList, setTransactionData] = useState<Transaction[]>([]);
    const [stateLu, setStateLu] = useState<StatusItem[]>();
    const [memberShip, setMemberShips] = useState<MemberShip[]>();

    const getTranscationLookups = useCallback(async () => {
        const allowed = ["All", "Cards", "Vaults"]; // TODO: Consider making this configurable or dynamic
        try {
            const response: any = await TransactionService.transactionStatusLu();
            if (response.ok) {
                setStateLu(response?.data?.TransactionStatus as StatusItem[]);
                const filteredTransactionScreens = response?.data.TransactionScreens?.filter((item: any) =>
                    allowed.includes(item.code) || allowed.includes(item.name)
                );
                setMemberShips(filteredTransactionScreens);
            } else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }
    }, []);

    const getAllTransactionsList = useCallback(
        async (
            currentPage: number,
            currentSearchQuery: string,
            currentSelectedState?: string,
            currentAccountMemberName?: string,
            currentStartDate?: string | null,
            currentEndDate?: string | null,
            vaultId?: string | null,
            cardId?: string | null,
            currency?: string | null,
            id?: string | null
        ) => {
            setTransactionListLoading(true);
            const pageSize = 10;
            try {
                const moduleToUse = currentAccountMemberName || props.initialModule || "All";
                const response: any = await TransactionService.getAllTransactionsList(
                    moduleToUse,
                    currentSearchQuery.trim() === "" ? null : currentSearchQuery.trim(),
                    currentSelectedState || "All",
                    currentPage,
                    pageSize,
                    currentStartDate,
                    currentEndDate,
                    vaultId ?? "00000000-0000-0000-0000-000000000000",
                    cardId,
                    currency,
                    id ?? null
                );

                if (response.ok) {
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

    const loadMoreData = useCallback((searchQuery: string, appliedSelectedState?: string, appliedAccountMemberName?: string, startDate?: Date | null, endDate?: Date | null, vaultId?: string | null, cardId?: string | null, currency?: string | null, id?: string | null) => {
        if (hasMoreData && !transactionListLoading) {
            const nextPage = pageNo + 1;
            setPageNo(nextPage);
            const formattedStartDate = startDate ? moment(startDate).format("YYYY-MM-DD") : null;
            const formattedEndDate = endDate ? moment(endDate).format("YYYY-MM-DD") : null;
            getAllTransactionsList(nextPage, searchQuery, appliedSelectedState, appliedAccountMemberName, formattedStartDate, formattedEndDate, vaultId, cardId, currency, id ?? null);
        }
    }, [hasMoreData, transactionListLoading, pageNo, getAllTransactionsList]);

    return {
        pageNo, setPageNo,
        transactionListLoading,
        hasMoreData,
        errormsg, setErrormsg,
        transactionsList, setTransactionData,
        stateLu, memberShip,
        getTranscationLookups,
        getAllTransactionsList,
        loadMoreData,
    };
};