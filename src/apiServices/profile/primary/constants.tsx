export const PROFILE_PRIMARY_SERVICE_CONSTANTS = {
    API_V1_REFERRALS_LIST: (type: any, search: any, page: any, pageSize: any) => `api/v1/referrals?status=${type}&search=${search}&startDate=${""}&endDate=${""}&page=${page}&pageSize=${pageSize}`,
    API_V1_REFERRALS_LOOKUP: 'api/v1/referrals/lookup',
    API_V1_CASES_KPI: 'api/v1/Cases/kpi',
    API_V1_CASES_LIST: (page: any, pageSize: any) => `api/v1/cases/?page=${page}&pageSize=${pageSize}`,
    API_V1_CASE_DETAILS: (id: any) => `api/v1/cases/${id}`,
    API_V1_CASE_MESSAGES: (id: any) => `api/v1/cases/${id}/messages`,
    API_V1_REFERRALS_KPI: 'api/v1/referrals/kpi',
    API_V1_REFERRERS_KPI: (id: string) => `api/v1/referrers/${id}/kpi`,
    API_V1_REFERRAL_DETAILS: (refID: any) => `api/v1/referrals/${refID}`,
    API_V1_CUSTOMER_ADDRESSES: (page: any, pageSize: any) => `api/v1/customer/addresses?page=${page}&pageSize=${pageSize}`,
    API_V1_CUSTOMER_ADDRESS: 'api/v1/customer/address',
    API_V1_REFERRAL_CUSTOMER: (refID: any, page: any, pageSize: any) => `api/v1/referral/customer/${refID}/transactions/?page=${page}&pageSize=${pageSize}`,
    API_V1_CASES_ALERTS: 'api/v1/cases/alerts',
    API_V1_CASES_UPLOAD_FILE: 'api/v1/casesuploadfile',
    API_V1_CASE: (id: any) => `api/v1/case/${id}/message`,
    GENERATE_SHORT_LINK: 'api/v1/Generateshortlink',

}