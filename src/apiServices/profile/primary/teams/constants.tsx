export const TEAMS_CONSTANTS = {
  TEAMS_MEMBERS: (status: string, search: string | null, page: number, pageSize: number) => `api/v1/teams/members?status=${status}&search=${search}&page=${page}&pageSize=${pageSize}`,
  TEAMS_MEMBER_ACTION: (memberId: string, action: string) => `api/v1/teams/members/${memberId}/${action}`,
  TEAMS_KPI: 'api/v1/teams/kpi',
  TEAMS_LOOKUP: 'api/v1/teams/lookup',
  TEAMS_INVITE: 'api/v1/teams/invite',
  KYC_LOOKUP: 'api/v1/kyc/lookup',
  TEAMS_MEMBER_DETAILS: (memberId: string) => `api/v1/teams/members/${memberId}`,
  TEAMS_MEMBER_CARDS: (memberId: string, search: string | null, page: number, pageSize: number) => `api/v1/teams/members/${memberId}/cards?search=${search}&page=${page}&pageSize=${pageSize}`,
  MEMBER_CARDS_KPI: (memberId: string) => `api/v1/members/id/cards/kpi?id=${memberId}`,
  CARD_DETAILS: (cardId: string) => `api/v1/cards/${cardId}`,
  CARD_TRANSACTIONS: (cardId: string, page: number, pageSize: number) => `api/v1/teams/member/cards/${cardId}/transactions?page=${page}&pageSize=${pageSize}`,
  CARD_HISTORY: (page: number, pageSize: number, cardId: string) => `api/v1/teams/member/cards/history/all/${cardId}?page=${page}&pageSize=${pageSize}`,
  MEMBER_TRANSACTIONS: (memberId: string, type: string, search: string | null, page: number, pageSize: number, fromDateParam: string, toDateParam: string, statusParam: string) => `api/v1/teams/members/${memberId}/transactions?type=${type}&search=${search}&page=${page}&pageSize=${pageSize}${fromDateParam}${toDateParam}${statusParam}`,
  MEMBER_TRANSACTIONS_SIMPLE: (memberId: string, page: number, pageSize: number) => `api/v1/teams/members/${memberId}/transactions?page=${page}&pageSize=${pageSize}`,
  TRANSACTION_DETAILS: (transactionId: string) => `api/v1/transactions/${transactionId}`,
  MEMBER_TRANSACTION_DETAILS: (transactionId: string) => `api/v1/teams/member/${transactionId}/transactions`,
  TRANSACTION_DOWNLOAD: (transactionId: string) => `api/v1/transaction/download?id=${transactionId}`
};
