import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import Container from "../../../../components/container/container";
import { isErrorDispaly } from "../../../../utils/helpers";
import { ProfileGeneralServices } from '../../../../apiServices/profile/general';
import ViewComponent from "../../../../components/view/view";
import FlatListComponent from "../../../../components/flatList/flatList";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import DashboardLoader from "../../../../components/loader";
import ErrorComponent from "../../../../components/errorDisplay/errorDisplay";
import { useHardwareBackHandler } from "../../../../hooks/backHandleHook";
import { KpiItem, SECTION_TYPES, UserInfo } from "./interface";
import { useNavigation } from "@react-navigation/native";
import RewardsHeader from "./rewardsDashboard/header";
import RewardsKPI from "./rewardsDashboard/walletsSection";
import MysteryBoxSection from "./rewardsDashboard/mystryBoxTab";
import RedeemModal from "./rewardsDashboard/redeemModel";
import MysteryBoxModal from "./rewardsDashboard/tapToOpenRewardModel";
import AddToWalletModal from "./rewardsDashboard/addToWalletModel";
import QuestsSection from "./rewardsDashboard/questTabsSection";
import CommonTouchableOpacity from "../../../../components/touchableComponents/touchableOpacity";
import { s } from "../../../../constants/styels/scale";
import Foundation from '@expo/vector-icons/Foundation';
import PageHeader from "../../../../components/pageHeader/pageHeader";
import { getTabsConfigation } from "../../../../../configuration";

const RewardsDashboard: React.FC<any> = () => {
    const [kpiData, setKpiData] = useState<KpiItem[]>([]);
    const [kpiDataLoading, setKpiDataLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string>("")
    const userInfo = useSelector((state: { userReducer: { userDetails: UserInfo } }) => state.userReducer?.userDetails);
    const configuration = getTabsConfigation('REFERRALS');
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [listSections, setListSections] = useState<Array<{ id: string, type: string }>>([]);
    const reddemModalVisableRef = useRef<any>();
    const openBoxModalRef = useRef<any>();
    const [rewardsData, setRewardsData] = useState<any>(null);
    const [availableCompleteQuests, setAvailableCompleteQuests] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("home");
    const [activeQuestTab, setActiveQuestTab] = useState("available");
    const [mysteryBoxData, setMysteryBoxData] = useState<any>([]);
    const [activeQuestsDaata, setActiveQuestsData] = useState<any>([]);
    const navigation = useNavigation<any>();
    const [giftItemData, setGiftItemData] = useState<any>(null);
    const addToWalletModalRef = useRef<any>();
    const [amountToAdd, setAmountToAdd] = useState<string>('');
    const [topupBalanceInfo, setTopupBalanceInfo] = useState<any>(null);
    const [selectCurrency, setSelectCurrency] = useState<any>(null);
    const [addWalletErrors, setAddWalletErrors] = useState<any>();
    useEffect(() => {
        getAvailableComplteRewardsData();
        getReferralKpis();
        getMysteryBoxRewards();
        getActiveQuestData();
        getCovertWalletData();
    }, [userInfo?.id]);

    useEffect(() => {
        const sectionsArray = [];
        if (configuration.ADVERTISEMENT) {
            sectionsArray.push({ id: SECTION_TYPES.ADVERTISEMENT, type: SECTION_TYPES.ADVERTISEMENT });
        }
        if (activeTab === "home") {
            sectionsArray.push({ id: SECTION_TYPES.KPI, type: SECTION_TYPES.KPI });
            if (rewardsData) {
                sectionsArray.push({ id: SECTION_TYPES.QUESTST_HEADER, type: SECTION_TYPES.QUESTST_HEADER });
            }
        } else if (activeTab === "quests" && rewardsData) {
            sectionsArray.push({ id: SECTION_TYPES.QUESTST_HEADER, type: SECTION_TYPES.QUESTST_HEADER });
        } else if (activeTab === "mystery_box" && rewardsData) {
            sectionsArray.push({ id: SECTION_TYPES.MYSTERY_BOX, type: SECTION_TYPES.MYSTERY_BOX });
        }
        setListSections(sectionsArray);
    }, [configuration.ADVERTISEMENT, rewardsData, activeTab]);

    const getCovertWalletData = useCallback(async () => {
        try {
            const response: any = await ProfileGeneralServices.getRedeemData();
            if (response.ok) {
                setTopupBalanceInfo(response?.data || []);
            } else {
                setErrorMsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrorMsg(isErrorDispaly(error));
        }
    }, []);

    const getMysteryBoxRewards = useCallback(async () => {
        try {
            const response: any = await ProfileGeneralServices.getMysteryBoxData(userInfo?.id);
            if (response.ok) {
                setMysteryBoxData(response?.data || []);
            } else {
                setErrorMsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrorMsg(isErrorDispaly(error));
        }
    }, [userInfo?.id]);

    const getActiveQuestData = useCallback(async () => {
        try {
            const response: any = await ProfileGeneralServices.getActiveRewardsData('available', userInfo?.id);
            if (response.ok) {
                setActiveQuestsData(response?.data || []);
            } else {
                setErrorMsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrorMsg(isErrorDispaly(error));
        }
    }, [userInfo?.id]);

    const getReferralKpis = useCallback(async () => {
        setErrorMsg('');
        try {
            const response: any = await ProfileGeneralServices.getRewardsData(userInfo?.id);
            if (response.ok) {
                const responseData = response.data?.balances as KpiItem[];
                setRewardsData(response?.data);
                setKpiData(responseData);
            } else {
                setErrorMsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrorMsg(isErrorDispaly(error));
        }
    }, [userInfo?.id]);

    const getAvailableComplteRewardsData = useCallback(async () => {
        setKpiDataLoading(true);
        try {
            const response: any = await ProfileGeneralServices.getAvailableComplteRewardsData(userInfo?.id);
            if (response.ok) {
                setKpiDataLoading(false);
                setAvailableCompleteQuests(response?.data);
            } else {
                setKpiDataLoading(false);
                setErrorMsg(isErrorDispaly(response));
            }
        } catch (error) {
            setKpiDataLoading(false);
            setErrorMsg(isErrorDispaly(error));
        }
    }, [userInfo?.id]);

    const handleReload = useCallback(() => {
        getAvailableComplteRewardsData();
        getReferralKpis();
        getMysteryBoxRewards();
        getActiveQuestData();
    }, [getAvailableComplteRewardsData, getActiveQuestData, getMysteryBoxRewards, getReferralKpis]);

    const backArrowButtonHandler = useCallback(() => {
        navigation.navigate('NewProfile', { animation: 'slide_from_left' });
    }, [navigation]);

    const handleContinue = useCallback(async () => {
        if (!amountToAdd) {
            setAddWalletErrors('Is required')
            return;
        }
        const object = {}
        try {
            const response: any = await ProfileGeneralServices.postReddemWallet(object);
            if (response.ok) {
                addToWalletModalRef?.current?.close();
            } else {
                setAddWalletErrors(isErrorDispaly(response));
            }
        } catch (error) {
            setAddWalletErrors(isErrorDispaly(error));
        }
    }, [amountToAdd]);

    const handleTransactions = useCallback(() => {
        navigation?.navigate('RewardsTransactionList')
    }, [navigation]);

    const handleSelectCurrency = useCallback((item: any) => {
        setSelectCurrency(item);
        setAmountToAdd('');
        setAddWalletErrors('');
        addToWalletModalRef.current?.open();
    }, []);

    const handleCloseAddWallet = useCallback(() => {
        addToWalletModalRef.current?.close();
        setAmountToAdd('');
    }, []);

    useHardwareBackHandler(() => {
        backArrowButtonHandler();
        return true;
    });

    const renderSectionItem = useCallback(({ item }: { item: { id: string, type: string } }) => {
        switch (item.type) {
            case SECTION_TYPES.ADVERTISEMENT:
                return (
                    <RewardsHeader
                        userInfo={userInfo}
                        rewardsData={rewardsData}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        navigation={navigation}
                    />
                );

            case SECTION_TYPES.KPI:
                return (
                    <RewardsKPI
                        kpiData={kpiData}
                        onRedeem={() => reddemModalVisableRef.current?.open()}
                    />
                );

            case SECTION_TYPES.QUESTST_HEADER:
                return (
                    <QuestsSection
                        activeTab={activeTab}
                        activeQuestTab={activeQuestTab}
                        setActiveTab={setActiveTab}
                        setActiveQuestTab={setActiveQuestTab}
                        availableCompleteQuests={availableCompleteQuests}
                        activeQuestsDaata={activeQuestsDaata}
                        navigation={navigation}
                    />
                );

            case SECTION_TYPES.MYSTERY_BOX:
                return (
                    <MysteryBoxSection
                        mysteryBoxData={mysteryBoxData}
                        onOpenBox={async (item: any) => {
                            try {
                                const response: any = await ProfileGeneralServices.postOpenBoxAction(item?.id, userInfo?.id);
                                if (response.ok) {
                                    setGiftItemData(response?.data);
                                    openBoxModalRef.current?.open();
                                } else {
                                    setErrorMsg(isErrorDispaly(response));
                                    openBoxModalRef.current?.close();
                                }
                            } catch (error) {
                                setErrorMsg(isErrorDispaly(error));
                            }
                        }}
                    />
                );

            default:
                return null;
        }
    }, [activeQuestTab, activeQuestsDaata, activeTab, availableCompleteQuests, getMysteryBoxRewards, kpiData, mysteryBoxData, navigation, rewardsData, userInfo]);

    const handleCollectPrize = useCallback(() => {
        openBoxModalRef.current?.close();
        getMysteryBoxRewards();
    }, [getMysteryBoxRewards]);

    const transactions = (
        <CommonTouchableOpacity
            activeOpacity={0.8}
            onPress={handleTransactions}
        >
            <Foundation name="clipboard-notes" size={s(20)} color={NEW_COLOR.TEXT_PRIMARY} />
        </CommonTouchableOpacity>
    );
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {kpiDataLoading && (<DashboardLoader />)}
            {!kpiDataLoading && (
                <Container style={[commonStyles.container, { paddingBottom: 0 }]}>
                    <PageHeader
                        title={"GLOBAL_CONSTANTS.REWARDS"}
                        onBackPress={backArrowButtonHandler}
                        isrefresh={true}
                        onRefresh={handleReload}
                        rightActions={transactions}
                    />
                    <ViewComponent style={[commonStyles.flex1]}>
                        <FlatListComponent
                            showsVerticalScrollIndicator={false}
                            data={listSections}
                            renderItem={renderSectionItem}
                            keyExtractor={(item, index) => index?.toString()}
                            ListHeaderComponent={errorMsg ? <ErrorComponent message={errorMsg} onClose={() => setErrorMsg("")} /> : null}
                        />
                    </ViewComponent>
                    <RedeemModal
                        refRBSheet={reddemModalVisableRef}
                        kpiData={kpiData}
                        errorMsg={errorMsg}
                        setErrorMsg={setErrorMsg}
                        onSelectCurrency={handleSelectCurrency}
                    />

                    <MysteryBoxModal
                        refRBSheet={openBoxModalRef}
                        giftItemData={giftItemData}
                        onCollectPrize={handleCollectPrize}
                    />

                    <AddToWalletModal
                        refRBSheet={addToWalletModalRef}
                        selectCurrency={selectCurrency}
                        amountToAdd={amountToAdd}
                        setAmountToAdd={setAmountToAdd}
                        topupBalanceInfo={topupBalanceInfo}
                        addWalletErrors={addWalletErrors}
                        onContinue={handleContinue}
                        setAddWalletErrors={setAddWalletErrors} // <-- Add this line
                        onClose={handleCloseAddWallet}
                    />
                </Container>
            )}
        </ViewComponent>
    );
};

export default RewardsDashboard;
