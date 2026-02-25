import { get, post, put, cardsGet } from "../../../ApiService";
import { TEAMS_CONSTANTS } from "./constants";

const TeamsService = {
    // Teams List
    getTeamsList: async (status = "All", search: string | null = null, page = 1, pageSize = 20) => {
        return await get(TEAMS_CONSTANTS.TEAMS_MEMBERS(status, search, page, pageSize));
    },
    toggleMemberStatus: async (memberId: string, action: string) => {
        return await put(TEAMS_CONSTANTS.TEAMS_MEMBER_ACTION(memberId, action), {});
    },
    getTeamsKpis: async () => {
        return await get(TEAMS_CONSTANTS.TEAMS_KPI);
    },
    getTeamsLu: async () => {
        return await get(TEAMS_CONSTANTS.TEAMS_LOOKUP);
    },
    // Invite Member
    inviteMember: async (memberData: any) => {
        return await post(TEAMS_CONSTANTS.TEAMS_INVITE, memberData);
    },
    getKycLookup: async () => {
        return await get(TEAMS_CONSTANTS.KYC_LOOKUP);
    },

    // Member Details
    getMemberDetails: async (memberId: string) => {
        return await get(TEAMS_CONSTANTS.TEAMS_MEMBER_DETAILS(memberId));
    },

    // Cards Management
    getMemberCards: async (memberId: string, search = "", page = 1, pageSize = 10) => {
        const searchValue = search && search.trim() !== '' ? search : null;
        return await get(TEAMS_CONSTANTS.TEAMS_MEMBER_CARDS(memberId, searchValue, page, pageSize));
    },
    getMemberCardsKpi: async (memberId: string) => {
        return await get(TEAMS_CONSTANTS.MEMBER_CARDS_KPI(memberId));
    },

    // Card Details
    getCardDetails: async (cardId: string) => {
        return await cardsGet(TEAMS_CONSTANTS.CARD_DETAILS(cardId));
    },

    // Card Transactions
    getCardTransactions: async (cardId: string, page = 1, pageSize = 10) => {
        return await get(TEAMS_CONSTANTS.CARD_TRANSACTIONS(cardId, page, pageSize));
    },

    // Card History
    getCardHistory: async (page = 1, pageSize = 10, cardId: string) => {
        return await get(TEAMS_CONSTANTS.CARD_HISTORY(page, pageSize, cardId));
    },

    // Member Transactions
    getMemberTransactions: async (memberId: string, type = "All", search: string | null = null, fromDate = "", toDate = "", status = "All", page = 1, pageSize = 10) => {
        const searchValue = search || null;
        const fromDateParam = fromDate ? `&fromdate=${fromDate}` : '';
        const toDateParam = toDate ? `&todate=${toDate}` : '';
        const statusParam = status && status !== 'All' ? `&status=${status}` : '';
        return await get(TEAMS_CONSTANTS.MEMBER_TRANSACTIONS(memberId, type, searchValue, page, pageSize, fromDateParam, toDateParam, statusParam));
    },

    getselectedEmployeesTransactions: async (memberId: string, page = 1, pageSize = 10) => {
        return await get(TEAMS_CONSTANTS.MEMBER_TRANSACTIONS_SIMPLE(memberId, page, pageSize));
    },

    // Transaction Details
    getTransactionDetails: async (transactionId: string) => {
        return await get(TEAMS_CONSTANTS.TRANSACTION_DETAILS(transactionId));
    },
    getselectedEmployeesTransactionDetails: async (transactionId: string) => {
        return await get(TEAMS_CONSTANTS.MEMBER_TRANSACTION_DETAILS(transactionId));
    },
    // Download Transaction
    downloadTransaction: async (transactionId: string) => {
        return await get(TEAMS_CONSTANTS.TRANSACTION_DOWNLOAD(transactionId));
    },
};

export default TeamsService;