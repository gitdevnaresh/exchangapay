import { get, post, put, rewardsget, rewardspost } from "../../ApiService";
import { PROFILE_GENERAL_SERVICE_CONSTANTS } from "./constants";

export const ProfileGeneralServices = {
    // Security APIs
    updateSecurity: async (security: any) => {
        return put(PROFILE_GENERAL_SERVICE_CONSTANTS.API_V1_SECURITY_VERIFICATIONS, security);
    },
    update2faSecurity: async (security: any) => {
        return put(PROFILE_GENERAL_SERVICE_CONSTANTS.API_V1_SECURITY_2FA, security);
    },
    verificationFields: async () => {
        return get(PROFILE_GENERAL_SERVICE_CONSTANTS.API_V1_SECURITY_SETTINGS);
    },
    resetPassword: async () => {
        return post(PROFILE_GENERAL_SERVICE_CONSTANTS.API_V1_SECURITY_PASSWORD_RESET, {});
    },

    // Help Center APIs
    getHelpCenterContent: async () => {
        return get(PROFILE_GENERAL_SERVICE_CONSTANTS.API_V1_HELP_CENTER);
    },

    // Membership/Fees APIs
    getFeesData: async () => {
        return get(PROFILE_GENERAL_SERVICE_CONSTANTS.API_V1_FEES);
    },
    getUpgradeFeeChargesData: async (id: any, module: any) => {
        return get(PROFILE_GENERAL_SERVICE_CONSTANTS.API_V1_UPGRADE_FEES_DETAILS(id, module));
    },

    // Rewards APIs
    getRewardsData: async (id: any) => {
        return rewardsget(PROFILE_GENERAL_SERVICE_CONSTANTS.API_V1_REWARDS_DASHBOARD(id));
    },
    getAvailableComplteRewardsData: async (id: any) => {
        return rewardsget(PROFILE_GENERAL_SERVICE_CONSTANTS.API_V1_REWARDS_QUESTS(id));
    },
    getActiveRewardsData: async (action: string, id: string) => {
        return rewardsget(PROFILE_GENERAL_SERVICE_CONSTANTS.API_V1_REWARDS_QUESTS_ACTION(action, id));
    },
    getMysteryBoxData: async (id: string) => {
        return rewardsget(PROFILE_GENERAL_SERVICE_CONSTANTS.API_V1_REWARDS_MYSTERY_BOXES(id));
    },
    postQuestAction: async (questId: string, id: string) => {
        return rewardspost(PROFILE_GENERAL_SERVICE_CONSTANTS.API_V1_REWARDS_QUESTS_JOIN(questId, id), {});
    },
    postOpenBoxAction: async (questId: string, id: string) => {
        return rewardspost(PROFILE_GENERAL_SERVICE_CONSTANTS.API_V1_REWARDS_MYSTERY_BOXES_OPEN(questId, id), {});
    },
    getYourRewardsData: async (id: string) => {
        return rewardsget(PROFILE_GENERAL_SERVICE_CONSTANTS.API_V1_REWARDS_RULES(id));
    },
    getRedeemData: async () => {
        return rewardsget(PROFILE_GENERAL_SERVICE_CONSTANTS.API_V1_REWARDS_REDEMPTION_CONFIG);
    },
    postReddemWallet: async (body: any) => {
        return rewardspost(PROFILE_GENERAL_SERVICE_CONSTANTS.API_V1_REWARDS_MYSTERY_BOXES_OPEN_BASE, body);
    },
    rewardsTransactions: async (id: any, sourceType: any, page: any, pageSize: any) => {
        return rewardsget(PROFILE_GENERAL_SERVICE_CONSTANTS.API_V1_REWARDS_LEDGER(id, sourceType, page, pageSize));
    },
    getUpgradeFeesData: async () => {
        return get(PROFILE_GENERAL_SERVICE_CONSTANTS.API_V1_MEMBERSHIPS_UPGRADE);
    },
    getVaultsData: async () => {
        return get(PROFILE_GENERAL_SERVICE_CONSTANTS.API_V1_MEMBERSHIPS_UPGRADE_VAULTS)
    },
    getMembershipConfirm: async (body: any) => {
        return post(PROFILE_GENERAL_SERVICE_CONSTANTS.API_V1_MEMBERSHIPS_UPGRADE_FEE, body)
    },
    getAmountData: async (fromCoin: any, toCoin: any, amount: any) => {
        return get(PROFILE_GENERAL_SERVICE_CONSTANTS.API_V1_EXCHANGE_RATE(fromCoin, toCoin, amount))
    },
    getMembershipUpgrade: async (body: any) => {
        return post(PROFILE_GENERAL_SERVICE_CONSTANTS.API_V1_MEMBERSHIPS_UPGRADE_PAYMENT, body)
    }, deleteAccount: async (body: any) => {
        return put(PROFILE_GENERAL_SERVICE_CONSTANTS.API_V1_CUSTOMERS_ACCOUNT_CLOSE, body);
    },
}
