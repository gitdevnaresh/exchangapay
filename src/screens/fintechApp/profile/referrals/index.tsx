import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Platform, SafeAreaView, Share, RefreshControl, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import Container from "../../../../components/container/container";
import { s } from "../../../../constants/styels/scale";
import CopyCard from "../../../../components/copyIcon/CopyCard";
import { isErrorDispaly } from "../../../../utils/helpers";
import { REFERRAL_CONST } from "./membersConstants";
import { useLngTranslation } from "../../../../hooks/languagesHook/useLngTranslation";
import KpiComponent from "../../../../components/kpiComponent/kpiComponent";
import { ProfilePrimaryServices } from '../../../../apiServices/profile/primary';
import ViewComponent from "../../../../components/view/view";
import TextMultiLangauge from "../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import CommonTouchableOpacity from "../../../../components/touchableComponents/touchableOpacity";
import FlatListComponent from "../../../../components/flatList/flatList";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import DashboardLoader from "../../../../components/loader";
import { NavigationProp, ParamListBase, useIsFocused } from "@react-navigation/native";
import ErrorComponent from "../../../../components/errorDisplay/errorDisplay";
import RecentMemberList from "./recentMemberList";
import Clipboard from "@react-native-clipboard/clipboard";
import CustomRBSheet from "../../../../components/models/commonDrawer";
import ButtonComponent from "../../../../components/buttons/button";
import GenealogyTree from "./genologyTree/GenealogyTree";
import { Feather } from "@expo/vector-icons";
import { useHardwareBackHandler } from "../../../../hooks/backHandleHook";
import PageHeader from "../../../../components/pageHeader/pageHeader";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";
import { ReferralsBannerImage } from "../../../../assets/svg";
import LabelComponent from "../../../../components/textComponets/lableComponent/lable";
import { Referral } from "./interFaces";
import { getTabsConfigation } from "../../../../../cofiguration";
import { getAllEnvData } from "../../../../../Environment";

interface MembersDashBoardProps {
    navigation: NavigationProp<ParamListBase>;
}
interface KpiItem {
    name: string;
    value: string | number;
    isCount?: boolean;
    isShowReferral?: boolean;
}
interface UserInfo {
    id: string;
    depositReference?: string;
}

const SECTION_TYPES = {
    KPI: 'KPI',
    ADVERTISEMENT: 'ADVERTISEMENT',
    TABS: 'TABS',
    MEMBERS_HEADER: 'MEMBERS_HEADER',
    GENEALOGY: 'GENEALOGY',
};

const MembersDashBoard: React.FC<MembersDashBoardProps> = (props) => {
    const [kpiData, setKpiData] = useState<KpiItem[]>([]);
    const [kpiDataLoading, setKpiDataLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [refresh, setRefresh] = useState<boolean>(false);
    const userInfo = useSelector((state: { userReducer: { userDetails: UserInfo } }) => state.userReducer?.userDetails);
    const configuration = getTabsConfigation('REFERRALS');
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [referralCode, setReferralCode] = useState<KpiItem[]>([]);
    const [referralLinkData, setReferralLinkData] = useState<KpiItem | null>(null);
    const [listSections, setListSections] = useState<Array<{ id: string, type: string }>>([]);
    const [activeTab, setActiveTab] = useState('Affiliates');
    const isInviteNowModalVisableRef = useRef<any>()
    const { oAuthConfig } = getAllEnvData();
    const truncatedBaseUrl = oAuthConfig?.sumsubWebUrl
    const baseUrl = oAuthConfig?.sumsubWebUrl
    const playStoreUrl = oAuthConfig?.playStoreUrl
    const appStore = oAuthConfig?.appStoreUrl
    const [referalLink, setReferalLink] = useState<string | null>(null);
    const [isGeneratingLinkLoader, setIsGeneratingLinkLoader] = useState(false);
    const [memberData, setMemberData] = useState<Referral[]>([]);

    const isFocused = useIsFocused();
    useEffect(() => {
        getReferralKpis();
    }, [isFocused]);

    const handleReferalLink = useCallback(async () => {
        setErrorMsg('')
        setIsGeneratingLinkLoader(true);
        try {
            const response: any = await ProfilePrimaryServices.getGenerateshortlink();
            if (response) {
                setReferalLink(response?.data);
                setIsGeneratingLinkLoader(false);
            } else {
                setErrorMsg(isErrorDispaly(response))
                setIsGeneratingLinkLoader(false);
            }
        } catch (error) {
            setErrorMsg(isErrorDispaly(error))
            setIsGeneratingLinkLoader(false);
        } finally {
            setIsGeneratingLinkLoader(false);
        }
    }, []);


    useEffect(() => {
        const sectionsArray = [];
        sectionsArray.push({ id: SECTION_TYPES.KPI, type: SECTION_TYPES.KPI });

        if (configuration.ADVERTISEMENT) {
            sectionsArray.push({ id: SECTION_TYPES.ADVERTISEMENT, type: SECTION_TYPES.ADVERTISEMENT });
        }
        sectionsArray.push({ id: SECTION_TYPES.TABS, type: SECTION_TYPES.TABS });

        if (activeTab === 'Affiliates') {
            sectionsArray.push({ id: SECTION_TYPES.MEMBERS_HEADER, type: SECTION_TYPES.MEMBERS_HEADER });
        } else if (activeTab === 'Network') {
            sectionsArray.push({ id: SECTION_TYPES.GENEALOGY, type: SECTION_TYPES.GENEALOGY });
        }
        setListSections(sectionsArray);
    }, [configuration.ADVERTISEMENT, activeTab]);

    const onRefresh = useCallback(async () => {
        setRefresh(true);
        try {
            await getReferralKpis();
        } finally {
            setRefresh(false);
        }
    }, []);
    const copyToClipboard = useCallback(async (text: any) => {
        try {
            Clipboard.setString(text);
        } catch (error: any) {
            Alert.alert(REFERRAL_CONST.FAILED_TO_COPY, error);
        }
    }, []);
    const referalCopyToClipboard = useCallback(async (text: any) => {
        try {
            Clipboard.setString(text);
        } catch (error: any) {
            Alert.alert(REFERRAL_CONST.FAILED_TO_COPY, error);
        }
    }, []);
    const onShare = useCallback(async () => {
        try {
            const code = referralCode[0]?.value;
            const referralUrl = `${baseUrl}/app?referralCode=${code}`;
            await Share.share({
                message: `${t("GLOBAL_CONSTANTS.HELLO_I_WOULD_LIKE_TO_INVITE")}${referralCode[0]?.value}.\n${t("GLOBAL_CONSTANTS.IAM_USING_ARTHAPAYMENTS")}${referralUrl}\n${t("GLOBAL_CONSTANTS.DOWNLOAD_APP_LINK")}\n${Platform.OS == 'android' ? playStoreUrl : appStore}`
            });
        } catch (error: any) {
            Alert.alert(error.message);
        }
    }, [referralCode, baseUrl, playStoreUrl, appStore, t]);
    const generateLinkOnShare = useCallback(async () => {
        try {

            await Share.share({
                message: `${t("GLOBAL_CONSTANTS.HELLO_JOIN_FAST_XE_USING_MY_REFERRAL_CODE")}\n${t("GLOBAL_CONSTANTS.REFERAL_LINK_SIGN_UP_HERE")}\n${referalLink}`
            });
        } catch (error: any) {
            Alert.alert(error.message);
        }
    }, [referalLink, t]);

    const getReferralKpis = async () => {
        setErrorMsg('')
        setKpiDataLoading(true);
        try {
            const response = await ProfilePrimaryServices.getReferralKPis();
            if (response.ok) {
                let filteredKpiData: KpiItem[];
                let ReferalCode: KpiItem[];
                let ReferralLinkItem: KpiItem | undefined;
                const responseData = response.data as KpiItem[];
                filteredKpiData = responseData.filter((item: KpiItem) => item.name !== "Referral Code" && item.name !== "Referral Link");
                ReferalCode = responseData.filter((item: KpiItem) => item.name == "Referral Code");
                ReferralLinkItem = responseData.find((item: KpiItem) => item.name === "Referral Link" && item.isShowReferral);
                setKpiData(filteredKpiData);
                setReferralCode(ReferalCode);
                setReferralLinkData(ReferralLinkItem || null);
                if (ReferralLinkItem?.isShowReferral) {
                    setReferalLink(ReferralLinkItem.value as string);
                }
                setKpiDataLoading(false);
            }
            else {
                setKpiDataLoading(false);
                setErrorMsg(isErrorDispaly(response))
            }
        }
        catch (error) {
            setKpiDataLoading(false);
            setErrorMsg(isErrorDispaly(error))
        }
    };
    const backArrowButtonHandler = useCallback(() => {
        props.navigation.goBack();
    }, [props.navigation]);

    const handleAllmembersList = useCallback(() => {
        props.navigation.navigate("MembersList");
    }, [props.navigation]);

    const closeInviteSheet = useCallback(() => {
        isInviteNowModalVisableRef.current?.close();
    }, []);

    useHardwareBackHandler(backArrowButtonHandler);
    const renderSectionItem = ({ item }: { item: { id: string, type: string } }) => {
        switch (item.type) {
            case SECTION_TYPES.KPI:
                return (
                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap10, commonStyles.sectionGap]}>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <KpiComponent
                                data={kpiData ?? []}
                            />
                        </ViewComponent>
                    </ViewComponent>
                );

            case SECTION_TYPES.ADVERTISEMENT:
                return (
                    <ViewComponent style={[commonStyles.bgnote, commonStyles.dflex, commonStyles.gap10, commonStyles.sectionGap]}>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <ParagraphComponent text={"GLOBAL_CONSTANTS.INVITE_FRIENDS_AND_GET_CRYPTO"} style={[commonStyles.RefeeralsectionTitle]} />
                            <ViewComponent >
                                <ViewComponent>
                                    <ParagraphComponent text={"GLOBAL_CONSTANTS.REFERRALS_CODE"} style={[commonStyles.referralcodetextlabel]} />
                                </ViewComponent>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.gap8, commonStyles.alignCenter, commonStyles.mt4, commonStyles.mb10]}>
                                    <ViewComponent style={[commonStyles.bgBlack]}>
                                        <ParagraphComponent text={referralCode[0]?.value} style={[commonStyles.referralcodetext, commonStyles.fw500]} />
                                    </ViewComponent>
                                    <ViewComponent style={[{ backgroundColor: NEW_COLOR.BG_BLACK }, commonStyles.rounded6, commonStyles.py10,]}>
                                        <CopyCard onPress={() => copyToClipboard(referralCode[0]?.value)} copyIconColor={NEW_COLOR.TEXT_PRIMARY} />
                                    </ViewComponent>

                                    <ViewComponent>
                                        <CommonTouchableOpacity onPress={onShare} style={[commonStyles.bgBlack]}>
                                            <Feather name="share-2" size={s(18)} color={NEW_COLOR.TEXT_PRIMARY} />
                                        </CommonTouchableOpacity>
                                    </ViewComponent>
                                </ViewComponent>
                                {referralLinkData?.isShowReferral && (<ViewComponent>
                                    {(referralLinkData?.isShowReferral && !referalLink) && (<CommonTouchableOpacity onPress={handleReferalLink} disabled={isGeneratingLinkLoader}>
                                        {<ViewComponent style={{
                                            backgroundColor: NEW_COLOR.TEXT_PRIMARY,
                                            padding: s(2),
                                            borderRadius: s(8),
                                            width: s(172),
                                            height: s(36)
                                        }}>

                                            {isGeneratingLinkLoader ? (
                                                <ActivityIndicator size="small" color={NEW_COLOR.TEXT_ALWAYS_WHITE} style={[commonStyles.mt4]} />
                                            ) : (
                                                <ParagraphComponent text={'GLOBAL_CONSTANTS.GET_REFERRAL_LINK'} style={[commonStyles.referralbuttontext, commonStyles.mt6]} />
                                            )}
                                        </ViewComponent>}
                                    </CommonTouchableOpacity>)}


                                    {(referralLinkData?.isShowReferral && referalLink) && (
                                        <ViewComponent>
                                            <ViewComponent>
                                                <ParagraphComponent text={"GLOBAL_CONSTANTS.REFERRALS_LINK"} style={[commonStyles.referralcodetextlabel]} />
                                            </ViewComponent>
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.gap8, commonStyles.alignCenter]}>
                                                <ViewComponent style={[commonStyles.bgBlack,]}>
                                                    <LabelComponent style={[commonStyles.referralcodetext]} selectable={true}>
                                                        {referalLink}
                                                    </LabelComponent>
                                                </ViewComponent>
                                                <ViewComponent style={[{ backgroundColor: NEW_COLOR.BG_BLACK }, commonStyles.rounded6, commonStyles.py10,]}>
                                                    <CopyCard onPress={() => referalCopyToClipboard(referalLink)} copyIconColor={NEW_COLOR.TEXT_PRIMARY} />
                                                </ViewComponent>

                                                <ViewComponent>
                                                    <CommonTouchableOpacity onPress={generateLinkOnShare} style={[commonStyles.bgBlack]}>
                                                        <Feather name="share-2" size={s(18)} color={NEW_COLOR.TEXT_PRIMARY} />
                                                    </CommonTouchableOpacity>
                                                </ViewComponent>
                                            </ViewComponent>
                                        </ViewComponent>
                                    )}
                                </ViewComponent>)}
                            </ViewComponent>
                        </ViewComponent>
                        <ViewComponent>
                            <ReferralsBannerImage
                                width={s(140)}
                                height={s(120)}
                            />
                        </ViewComponent>
                    </ViewComponent>



                );

            case SECTION_TYPES.MEMBERS_HEADER:
                return (
                    <ViewComponent>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.listGap]}>
                            <TextMultiLangauge text={"GLOBAL_CONSTANTS.MEMBERS"} style={[commonStyles.sectionTitle]} />
                            {memberData?.length >= 1 && <CommonTouchableOpacity onPress={handleAllmembersList} style={[commonStyles.dflex, commonStyles.alignCenter,]} >
                                <ParagraphComponent text={"GLOBAL_CONSTANTS.SEE_ALL"} style={[commonStyles.sectionLink, commonStyles.fw500]} />
                            </CommonTouchableOpacity>}
                        </ViewComponent>
                        <RecentMemberList Data={setMemberData} />
                        <ViewComponent style={[commonStyles.sectionGap]} />
                        <ViewComponent style={[commonStyles.sectionGap]} />
                    </ViewComponent>
                );
            case SECTION_TYPES.GENEALOGY:
                return (
                    <ViewComponent style={[commonStyles.sectionGap]}>
                        <GenealogyTree />
                        <ViewComponent style={[commonStyles.sectionGap]} />
                        <ViewComponent style={[commonStyles.sectionGap]} />
                    </ViewComponent>
                );
            default:
                return null;
        }
    };

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {kpiDataLoading && (
                <SafeAreaView style={[commonStyles.flex1]}>
                    <DashboardLoader /></SafeAreaView>)}
            {!kpiDataLoading && (
                <Container style={[commonStyles.flex1, commonStyles.container, { paddingBottom: 0 }]}>
                    <PageHeader title={"GLOBAL_CONSTANTS.REFERRALS"} onBackPress={backArrowButtonHandler} />

                    <FlatListComponent
                        data={listSections}
                        renderItem={renderSectionItem}
                        keyExtractor={item => item.id}
                        ListHeaderComponent={errorMsg ? <ErrorComponent message={errorMsg} onClose={() => setErrorMsg("")} /> : null}
                        contentContainerStyle={{ paddingBottom: s(16) }}
                        refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} />}
                    />
                    <CustomRBSheet
                        refRBSheet={isInviteNowModalVisableRef} // Use the ref here
                        height={"Small"}
                        closeOnPressMask={true}
                        onClose={() => { }}
                        customStyles={{ container: { borderTopLeftRadius: s(30), borderTopRightRadius: s(30), backgroundColor: NEW_COLOR.BACKGROUND_MODAL } }}
                    >
                        <ViewComponent>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.mb16]}>
                                <TextMultiLangauge
                                    text={"GLOBAL_CONSTANTS.REFERRAL_CODE"}
                                    style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw500, commonStyles.flex1]}
                                />
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                                    <ParagraphComponent
                                        text={referralCode[0]?.value ?? userInfo?.depositReference ?? 'N/A'}
                                        style={[commonStyles.textWhite, commonStyles.fs16, commonStyles.fw500]}
                                        numberOfLines={1}
                                    />
                                    <CopyCard onPress={() => copyToClipboard(referralCode[0]?.value ?? userInfo?.depositReference)} copyIconColor={NEW_COLOR.TEXT_WHITE} />
                                </ViewComponent>
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.listGap]} />
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.mb16]}>
                                <TextMultiLangauge
                                    text={"Referral Link"}
                                    style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw500, commonStyles.flex1]}
                                />
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                                    <ParagraphComponent
                                        text={truncatedBaseUrl}
                                        style={[commonStyles.textWhite, commonStyles.fs16, commonStyles.fw500]}
                                        numberOfLines={1}
                                    />
                                    <CopyCard onPress={() => copyToClipboard(baseUrl)} copyIconColor={NEW_COLOR.TEXT_WHITE} />
                                </ViewComponent>
                            </ViewComponent>

                            <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.mt24, commonStyles.sectionGap]}>
                                <ViewComponent style={[commonStyles.flex1]}>
                                    <ButtonComponent
                                        title={"GLOBAL_CONSTANTS.CLOSE"}
                                        onPress={closeInviteSheet}
                                        solidBackground={true}
                                    />
                                </ViewComponent>
                                <ViewComponent style={[commonStyles.flex1]}>
                                    <ButtonComponent
                                        title={"GLOBAL_CONSTANTS.SHARE"}
                                        onPress={onShare}
                                    />
                                </ViewComponent>
                            </ViewComponent>
                        </ViewComponent>
                    </CustomRBSheet>

                </Container>)}
        </ViewComponent>
    );
};

export default MembersDashBoard;
