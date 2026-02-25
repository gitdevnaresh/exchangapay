
export interface KpiItem {
    currencyCode: string;
    balance: string | number;
    id?: string;
    name?: string;
    iconUrl?: string;
    progressPercentage?: number;
    progressText?: string;
    targetValue?: string | number;
    currentValue?: string | number;
    isIncrease?: boolean;
}
export interface UserInfo {
    id: string;
    depositReference?: string;
    name?: string;
}

export interface QuestStep {
    stepId: string;
    description: string;
    targetCount: number;
    currentCount: number;
    isCompleted: boolean;
    triggerEvent: string;
    completed?:any,
    inProgress?:any,
}

export interface ActiveQuest {
    questId: string;
    questName: string;
    questDescription: string;
    isCompleted: boolean;
    rewardTierPoints: string;
    rewardCurrencyCode: string;
    rewardAmount: number;
    mysteryBoxRewardId: string | null;
    mysteryBoxRewardName: string | null;
    steps: QuestStep[];
    available?:any,
    description?:string,
    name?:string
    completed?:any,
    inProgress?:any,
    isActive?:any,
}

export const SECTION_TYPES = {
    KPI: 'KPI',
    ADVERTISEMENT: 'ADVERTISEMENT',
    TABS: 'TABS',
    QUESTST_HEADER: 'QUESTST_HEADER',
    GENEALOGY: 'GENEALOGY',
    MYSTERY_BOX: 'MYSTERY_BOXES',
};