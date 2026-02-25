import React, { useCallback } from "react";
import ViewComponent from "../../../../components/view/view";
import CommonTouchableOpacity from "../../../../components/touchableComponents/touchableOpacity";
import TextMultiLangauge from "../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import { AntDesign, Feather } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { s } from "../../../../constants/styels/scale";
import TransactionIcon from "../../../../components/svgIcons/mainmenuicons/transactionIcon";
import PayeesIconImage from "../../../../components/svgIcons/mainmenuicons/payees";
import KycIcon from "../../../../components/svgIcons/mainmenuicons/kycicon";
import ReferralsIcon from "../../../../components/svgIcons/mainmenuicons/referrals";
import SecurityIcon from "../../../../components/svgIcons/mainmenuicons/securityicon";
import LocationIconImage from "../../../../components/svgIcons/mainmenuicons/location";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainStackParamList } from "."; // Assuming MainStackParamList is exported from index.tsx
import ProfileSupportIcon from "../../../../components/svgIcons/mainmenuicons/support";
import ProfileFeeIconImage from "../../../../components/svgIcons/mainmenuicons/profilefeex";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";
import { useSelector } from "react-redux";
import { PROFILE_CONSTANTS } from "./constants";
import { getTabsConfigation } from "../../../../../configuration";
interface ProfileMenuItemsProps {
    navigation: NativeStackNavigationProp<MainStackParamList>;
    commonStyles: any;
    NEW_COLOR: any;
    handleKycKybProfile: () => void;
    userInfo?: any
}

const ProfileMenuItems: React.FC<ProfileMenuItemsProps> = ({
    navigation,
    commonStyles,
    NEW_COLOR,
    handleKycKybProfile,
    userInfo
}) => {

    const navigateToMembersDashboard = useCallback(() => navigation.navigate('MembersDashBoard'), [navigation]);
    const navigateToCardsTransactions = useCallback(() => navigation.navigate("CardsTransactions"), [navigation]);
    const navigateToAllPersonalInfo = useCallback(() => navigation.navigate("AllPersonalInfo"), [navigation]);
    const navigateToSecurity = useCallback(() => navigation.navigate("SecurityDashboard"), [navigation]);
    const navigateToAddressbook = useCallback(() => navigation.navigate("Addressbook", { screenName: "InitialTab" }), [navigation]);
    const navigateToSettings = useCallback(() => navigation.navigate("Settings"), [navigation]);
    const navigateToUpgradeFees = useCallback(() => navigation.navigate("UpgradeFees"), [navigation]);
    const navigateToHelpCenter = useCallback(() => navigation.navigate("HelpCenter"), [navigation]);
    const navigateToSupport = useCallback(() => navigation.navigate("Support"), [navigation]);
    const navigateToTeams = useCallback(() => navigation.navigate("Teams"), [navigation]);
    const navigateToRewards = useCallback(() => navigation.navigate("RewaordsDashBoard"), [navigation]);
    const menuItems = useSelector((state: any) => state.userReducer?.menuItems);
    const EnableMenuItems = menuItems?.filter((tab: any) => tab?.isEnabled);
    const TransactionsPermissions = EnableMenuItems?.find((item: any) => item?.featureName?.toLowerCase() === PROFILE_CONSTANTS.TRANSACTIONS);
    const PayeesPermissions = EnableMenuItems?.find((item: any) => item?.featureName?.toLowerCase() === PROFILE_CONSTANTS.ADDRESS_BOOK || item?.featureName?.toLowerCase() === PROFILE_CONSTANTS.PAYEES);
    const TeamsPermissions = EnableMenuItems?.find((item: any) => item?.featureName?.toLowerCase() === PROFILE_CONSTANTS.TEAMS);
    const ReferralsPermissions = EnableMenuItems?.find((item: any) => item?.featureName?.toLowerCase() === PROFILE_CONSTANTS.REFERRALS);
    const SupportPermissions = EnableMenuItems?.find((item: any) => item?.featureName?.toLowerCase() === PROFILE_CONSTANTS.SUPPORT);
    const RewardsPermissions = EnableMenuItems?.find((item: any) => item?.featureName?.toLowerCase() === PROFILE_CONSTANTS.REWARDS);
    const menuTabs = getTabsConfigation('MENU_DRAWER_CONGIGURATION');
    return (
        <ViewComponent>
            <ViewComponent style={[commonStyles.sectionGap]} />
            <ViewComponent>
                <TextMultiLangauge text={"GLOBAL_CONSTANTS.PRIMARY"} style={[commonStyles.sectionTitle]} />
            </ViewComponent>
            <ViewComponent style={[commonStyles.titleSectionGap]} />

            <ViewComponent >
                {menuTabs?.KYC_INFORMATION && <ViewComponent>
                    <CommonTouchableOpacity onPress={handleKycKybProfile} >
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]} >
                            <ViewComponent style={[commonStyles.roundediconbg]} >
                                <KycIcon height={s(18)} width={s(18)} />
                            </ViewComponent>
                            <ViewComponent>
                                <ParagraphComponent text={userInfo?.accountType !== "Business" ? "GLOBAL_CONSTANTS.KYC" : "GLOBAL_CONSTANTS.KYB"} style={[commonStyles.profilemenutext]} />
                            </ViewComponent>
                        </ViewComponent>
                    </CommonTouchableOpacity>
                    <ViewComponent style={[commonStyles.listGap]} />
                </ViewComponent>}
                {menuTabs?.TRANSACTIONS && <CommonTouchableOpacity onPress={navigateToCardsTransactions}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]} >
                        <ViewComponent style={[commonStyles.roundediconbg]} >
                            <TransactionIcon width={s(16)} height={s(16)} />
                        </ViewComponent>
                        <ViewComponent >
                            <ParagraphComponent text={"GLOBAL_CONSTANTS.TRANSACTIONS"} style={[commonStyles.profilemenutext]} />
                        </ViewComponent>
                    </ViewComponent>
                </CommonTouchableOpacity>}
                {menuTabs?.TRANSACTIONS && (<ViewComponent style={[commonStyles.listGap]} />)}
                <CommonTouchableOpacity onPress={navigateToAllPersonalInfo}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]} >
                        <ViewComponent style={[commonStyles.roundediconbg]} >
                            <LocationIconImage width={s(18)} height={s(18)} />
                        </ViewComponent>
                        <ViewComponent >
                            <ParagraphComponent text={"GLOBAL_CONSTANTS.ADDRESS"} style={[commonStyles.profilemenutext]} />
                        </ViewComponent>
                    </ViewComponent>
                </CommonTouchableOpacity>
                <ViewComponent style={[commonStyles.listGap]} />
                {ReferralsPermissions && <CommonTouchableOpacity onPress={navigateToMembersDashboard}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]} >
                        <ViewComponent style={[commonStyles.roundediconbg]} >
                            <ReferralsIcon width={s(18)} height={s(18)} />

                        </ViewComponent>
                        <ViewComponent >
                            <ParagraphComponent text={"GLOBAL_CONSTANTS.REFERRALS"} style={[commonStyles.profilemenutext]} />
                        </ViewComponent>
                    </ViewComponent>
                </CommonTouchableOpacity>}
                {TeamsPermissions && (
                    <>
                        <ViewComponent style={[commonStyles.listGap]} />
                        <CommonTouchableOpacity onPress={navigateToTeams}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]} >
                                <ViewComponent style={[commonStyles.roundediconbg]} >
                                    <Feather name="users" size={s(16)} color={NEW_COLOR.PROFILE_ICON} />
                                </ViewComponent>
                                <ViewComponent >
                                    <ParagraphComponent text={"GLOBAL_CONSTANTS.TEAMS"} style={[commonStyles.profilemenutext]} />
                                </ViewComponent>
                            </ViewComponent>
                        </CommonTouchableOpacity>
                    </>
                )}
            </ViewComponent>
            <ViewComponent style={[commonStyles.listGap]} />
            {SupportPermissions && <CommonTouchableOpacity onPress={navigateToSupport} >
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]} >
                    <ViewComponent style={[commonStyles.roundediconbg]} >
                        <ProfileSupportIcon width={s(16)} height={s(16)} />
                    </ViewComponent>
                    <ViewComponent >
                        <ParagraphComponent text={"GLOBAL_CONSTANTS.SUPPORT"} style={[commonStyles.profilemenutext]} />
                    </ViewComponent>
                </ViewComponent>
            </CommonTouchableOpacity>}
            <ViewComponent style={[commonStyles.listGap]} />
            {RewardsPermissions && <CommonTouchableOpacity onPress={navigateToRewards} >
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]} >
                    <ViewComponent style={[commonStyles.roundediconbg]} >
                        <AntDesign name="gift" size={s(16)} color={NEW_COLOR.PROFILE_ICON} />
                    </ViewComponent>
                    <ViewComponent >
                        <ParagraphComponent text={"GLOBAL_CONSTANTS.REWARDS"} style={[commonStyles.profilemenutext]} />
                    </ViewComponent>
                </ViewComponent>
            </CommonTouchableOpacity>}
            <ViewComponent style={[commonStyles.titleSectionGap]}  >
                <ParagraphComponent text={"GLOBAL_CONSTANTS.GENERAL"} style={[commonStyles.sectionTitle]} />
            </ViewComponent>
            <ViewComponent>
                <CommonTouchableOpacity onPress={navigateToSecurity} >
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]} >
                        <ViewComponent style={[commonStyles.roundediconbg]} >
                            <SecurityIcon width={s(16)} height={s(16)} />
                        </ViewComponent>
                        <ViewComponent >
                            <ParagraphComponent text={"GLOBAL_CONSTANTS.ACCOUNT_SECURITY"} style={[commonStyles.profilemenutext]} />
                        </ViewComponent>
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.listGap]} />
                </CommonTouchableOpacity>
                {PayeesPermissions && <CommonTouchableOpacity onPress={navigateToAddressbook} >
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]} >
                        <ViewComponent style={[commonStyles.roundediconbg]} >
                            <PayeesIconImage width={s(18)} height={s(18)} />
                        </ViewComponent>
                        <ViewComponent >
                            <ParagraphComponent text={"GLOBAL_CONSTANTS.PAYEES"} style={[commonStyles.profilemenutext]} />
                        </ViewComponent>
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.listGap]} />
                </CommonTouchableOpacity>}
                <CommonTouchableOpacity onPress={navigateToSettings} >
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]} >
                        <ViewComponent style={[commonStyles.roundediconbg]} >
                            <Feather name="settings" size={s(18)} color={NEW_COLOR.PROFILE_ICON} /></ViewComponent>
                        <ViewComponent >
                            <ParagraphComponent text={"GLOBAL_CONSTANTS.SETTINGS"} style={[commonStyles.profilemenutext]} />
                        </ViewComponent>
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.listGap]} />
                </CommonTouchableOpacity>
                <CommonTouchableOpacity onPress={navigateToUpgradeFees} >
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]} >
                        <ViewComponent style={[commonStyles.roundediconbg]} >
                            <ProfileFeeIconImage width={s(18)} height={s(30)} />
                        </ViewComponent>
                        <ViewComponent >
                            <ParagraphComponent text={"GLOBAL_CONSTANTS.FEES"} style={[commonStyles.profilemenutext]} />
                        </ViewComponent>
                    </ViewComponent>
                </CommonTouchableOpacity>
                <ViewComponent style={[commonStyles.listGap]} />
                <CommonTouchableOpacity onPress={navigateToHelpCenter} >
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]} >
                        <ViewComponent style={[commonStyles.roundediconbg]} >
                            <FontAwesome name="question-circle-o" size={s(18)} color={NEW_COLOR.PROFILE_ICON} />
                        </ViewComponent>
                        <ViewComponent >
                            <ParagraphComponent text={"GLOBAL_CONSTANTS.HELP_CENTER"} style={[commonStyles.profilemenutext]} />
                        </ViewComponent>
                    </ViewComponent>
                </CommonTouchableOpacity>
            </ViewComponent>
        </ViewComponent>
    );
};

export default ProfileMenuItems;