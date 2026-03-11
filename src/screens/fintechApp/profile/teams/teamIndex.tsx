import React, { useCallback, useEffect, useState, useRef } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { getThemedCommonStyles, statusColor } from '../../../../components/CommonStyles';
import { s } from '../../../../constants/styels/scale';
import FlatListComponent from '../../../../components/flatList/flatList';
import ViewComponent from '../../../../components/view/view';
import CommonTouchableOpacity from '../../../../components/touchableComponents/touchableOpacity';
import ParagraphComponent from '../../../../components/textComponets/paragraphText/paragraph';
import Container from '../../../../components/container/container';
import PageHeader from '../../../../components/pageHeader/pageHeader';
import ErrorComponent from '../../../../components/errorDisplay/errorDisplay';
import { FormattedDateText } from '../../../../components/textComponets/dateTimeText/dateTimeText';
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import DashboardLoader from '../../../../components/loader';
import SafeAreaViewComponent from '../../../../components/safeArea/safeArea';
import { isErrorDispaly } from '../../../../utils/helpers';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import TeamsService from '../../../../apiServices/profile/primary/teams';
import KycVerifyPopup from '../../../commonScreens/kycVerify';
import CustomRBSheet from '../../../../components/models/commonBottomSheet';
import ButtonComponent from '../../../../components/buttons/button';
import TextMultiLanguage from '../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import KpiComponent from '../../../../components/kpiComponent/kpiComponent';
import Feather from 'react-native-vector-icons/Feather';
import NoDataComponent from '../../../../components/noData/noData';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import TeamMembersIcon from '../../../../components/svgIcons/mainmenuicons/teamamembers';
import { TeamMember, KpiItem, TeamsListResponse, TeamsKpisResponse } from './utils';
import { STATUS, SCREENS, PAGINATION, UI, MEMBER_ACTIONS } from './constants';
import ImageUri from '../../../../components/imageComponents/image';


const TeamIndex = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errormsg, setErrormsg] = useState<string>("");
  const [teamsList, setTeamsList] = useState<TeamMember[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [selectedTeam, setSelectedTeam] = useState<TeamMember | null>(null);
  const dotsSheetRef = useRef<any>(null);
  const confirmSheetRef = useRef<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [toggleLoading, setToggleLoading] = useState<boolean>(false);
  const [kpiData, setKpiData] = useState<KpiItem[]>([]);
  const [allDataLoaded, setAllDataLoaded] = useState(false);
  const navigation = useNavigation<any>();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const [kycModelVisible, setKycModelVisible] = useState(false);
  const { decryptAES } = useEncryptDecrypt();
  useFocusEffect(
    useCallback(() => {
      loadInitialData();
    }, [])
  );
  const loadInitialData = async (resetFilters: boolean = false) => {
    setAllDataLoaded(false);
    setLoading(true);
    setErrormsg("");
    try {
      await Promise.all([
        getTeamsList(resetFilters ? STATUS.ALL : "", resetFilters ? "" : ""),
        getTeamsKpis(),
      ]);
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    } finally {
      setLoading(false);
      setAllDataLoaded(true);
    }
  };
  useEffect(() => {
    if (allDataLoaded && searchQuery !== "") {
      setTeamsList([]);
      getTeamsList(selectedStatus, searchQuery);
    }
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        backArrowButtonHandler();
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription?.remove();
    }, [])
  );

  const getTeamsList = async (status?: string, search?: string) => {
    setLoading(true);
    setErrormsg("");

    try {
      const statusParam = status || selectedStatus || STATUS.ALL;
      const searchParam = search !== undefined ? search : searchQuery;
      const response = await TeamsService.getTeamsList(statusParam, searchParam || null, PAGINATION.DEFAULT_PAGE, PAGINATION.SMALL_PAGE_SIZE) as TeamsListResponse;

      if (response?.data || response?.ok !== false) {
        const data = response.data?.data || [];
        setTeamsList(data);
        setTotal(response.data?.total || data.length);
      } else {
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    } finally {
      setLoading(false);
    }
  };

  const getTeamsKpis = async () => {
    try {
      const response = await TeamsService.getTeamsKpis() as TeamsKpisResponse;
      if (response?.ok) {
        setKpiData(response.data || []);
      } else {
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    }
  };



  const handleRefresh = useCallback(() => {
    setSearchQuery("");
    setSelectedStatus("");
    setTeamsList([]);
    setErrormsg("");
    loadInitialData(true);
  }, []);

  const backArrowButtonHandler = useCallback(() => {
    navigation.navigate(SCREENS.NEW_PROFILE, { animation: 'slide_from_left' });
  }, [navigation]);

  const handleMenuPress = useCallback((item: TeamMember) => {
    setSelectedTeam(item);
    dotsSheetRef?.current?.open();
  }, []);

  const handleSeeAllPress = useCallback(() => {
    navigation.navigate(SCREENS.TEAM_LIST);
  }, [navigation]);

  const handleToggleStatusConfirm = useCallback(() => {
    dotsSheetRef?.current?.close();
    setTimeout(() => {
      confirmSheetRef?.current?.open();
    }, 500);
  }, []);

  const handleToggleStatus = async () => {
    if (!selectedTeam) return;

    setToggleLoading(true);
    try {
      const action = selectedTeam.status === STATUS.ACTIVE ? MEMBER_ACTIONS.DISABLE : MEMBER_ACTIONS.ENABLE;
      const response = await TeamsService.toggleMemberStatus(selectedTeam.id, action);

      if (response?.ok) {
        setTeamsList([]);
        await Promise.all([
          getTeamsList(selectedStatus, searchQuery),
          getTeamsKpis()
        ]);
        confirmSheetRef?.current?.close();
      } else {
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    } finally {
      setToggleLoading(false);
    }
  };

  const handleInviteMember = useCallback(() => {
    if (userInfo?.kycStatus?.toLowerCase() !== "approved") {
      setKycModelVisible(true);
    } else {
      navigation.navigate(SCREENS.INVITE_MEMBER);
    }
  }, [userInfo?.kycStatus, navigation]);

  const closekycModel = useCallback(() => {
    setKycModelVisible(false);
  }, []);

  const handleMemberPress = useCallback((item: TeamMember) => {
    navigation.navigate(SCREENS.TEAM_CARDS_VIEW, { memberId: item.id, memberData: item });
  }, [navigation]);



  const renderItem = useCallback(({ item }: { item: TeamMember; index: number }) => {
    return (
      <CommonTouchableOpacity
        activeOpacity={0.8}
        key={item.id}
        onPress={() => handleMemberPress(item)}
        style={[


          { backgroundColor: NEW_COLOR.CARD_BG, borderRadius: s(12) }
        ]}
      >
        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap16, commonStyles.cardsbannerbg]}>
          <ViewComponent style={[commonStyles.alignCenter, commonStyles.justifyCenter, { minHeight: s(34), minWidth: s(34) }]}>
            <ImageUri uri={item?.image ? item?.image : "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/default_user_image.jpg"} width={s(30)} height={s(30)} style={{ borderRadius: s(30) / 2 }} />
          </ViewComponent>
          <ViewComponent style={[commonStyles.dflex, commonStyles.flex1, commonStyles.justifyContent, commonStyles.gap10, commonStyles.alignCenter]}>
            <ViewComponent style={[]}>
              <ParagraphComponent
                style={[commonStyles.primarytext]}
                text={(() => {
                  const name = item.fullName || `${item.firstName} ${item.lastName}` || "";
                  return name.length > UI.MAX_NAME_LENGTH
                    ? `${name.slice(0, UI.NAME_TRUNCATE_START)}...${name.slice(-UI.NAME_TRUNCATE_END)}`
                    : name;
                })()}
                numberOfLines={1}
              />
              <ParagraphComponent
                style={[commonStyles.secondarytext]}
                text={`ID: ${item.refId}`}
                numberOfLines={1}
              />
              <ParagraphComponent
                style={[commonStyles.secondarytext]}
                text={(() => {
                  const email = decryptAES(item.email) || "";
                  return email.length > UI.MAX_NAME_LENGTH
                    ? `${email.slice(0, UI.EMAIL_TRUNCATE_START)}...${email.slice(-UI.EMAIL_TRUNCATE_END)}`
                    : email;
                })()}
                numberOfLines={1}
              />
              <FormattedDateText
                value={item.registeredDate}
                conversionType='UTC-to-local'
                style={[commonStyles.secondarytext, commonStyles.mt4]}
              />
            </ViewComponent>
            <ViewComponent style={[]}>
              <ParagraphComponent
                style={[commonStyles.colorstatus, { color: statusColor[item.customerState?.toLowerCase()] }]}
                text={item.customerState}
                numberOfLines={1}
              />
              <ParagraphComponent
                style={[commonStyles.colorstatus, {
                  color: statusColor[item.status?.toLowerCase()]
                }]}
                text={item.status}
              />
            </ViewComponent>
            <ViewComponent>
              <CommonTouchableOpacity
                onPress={() => handleMenuPress(item)}
                activeOpacity={0.8}
                style={[commonStyles.alignCenter, commonStyles.justifyCenter]}
              >
                <Feather
                  name="more-vertical"
                  size={s(16)}
                  color={NEW_COLOR.TEXT_WHITE}
                />
              </CommonTouchableOpacity>
            </ViewComponent>
          </ViewComponent>

        </ViewComponent>
      </CommonTouchableOpacity>
    );
  }, [commonStyles, statusColor, NEW_COLOR, handleMemberPress, handleMenuPress, decryptAES]);

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      {!allDataLoaded ? (
        <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
          <DashboardLoader />
        </SafeAreaViewComponent>
      ) : (
        <Container style={commonStyles.container}>
          <PageHeader
            title={"GLOBAL_CONSTANTS.TEAMS"}
            onBackPress={backArrowButtonHandler}
            isrefresh={true}
            onRefresh={handleRefresh}
          />
          {errormsg !== "" && (
            <ErrorComponent message={errormsg} onClose={() => setErrormsg("")} />
          )}
          <FlatListComponent
            ListHeaderComponent={
              <ViewComponent>
                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap10, commonStyles.sectionGap]}>
                  <ViewComponent style={[commonStyles.flex1]}>
                    <KpiComponent
                      data={kpiData}
                    />
                  </ViewComponent>
                </ViewComponent>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.titleSectionGap]}>
                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                    <TextMultiLanguage
                      style={[commonStyles.sectionTitle]}
                      text="GLOBAL_CONSTANTS.TEAM_MEMBERS"
                    />
                    <ViewComponent style={[commonStyles.actioniconbg]}>
                      <MaterialIcons name="add" size={s(22)} color={NEW_COLOR.DARK_TEXT_WHITE} onPress={handleInviteMember} />
                    </ViewComponent>
                  </ViewComponent>
                  {total > 0 && (
                    <CommonTouchableOpacity onPress={handleSeeAllPress}>
                      <TextMultiLanguage
                        style={[commonStyles.sectionLink]}
                        text="GLOBAL_CONSTANTS.SEE_ALL"
                      />
                    </CommonTouchableOpacity>
                  )}
                </ViewComponent>
              </ViewComponent>
            }
            data={teamsList ?? []}
            keyExtractor={(item: TeamMember, index: number) => `${item.id}-${index}`}
            ItemSeparatorComponent={() => <ViewComponent style={[commonStyles.transactionsListGap]} />}
            renderItem={renderItem}

            showsVerticalScrollIndicator={false}
            removeClippedSubviews={false}
            contentContainerStyle={{ paddingBottom: s(100) }}
            ListEmptyComponent={
              !loading ? (
                <ViewComponent style={[commonStyles.alignCenter, commonStyles.mt20]}>
                  <NoDataComponent Description={"GLOBAL_CONSTANTS.NO_MEMBERS_MSG"} />
                </ViewComponent>
              ) : null
            }
          />
          <CustomRBSheet refRBSheet={dotsSheetRef} title={selectedTeam?.status === 'Active' ? "GLOBAL_CONSTANTS.CONFIRM_DISABLE" : "GLOBAL_CONSTANTS.CONFIRM_ENABLE"} height={"Small"}>
            <ViewComponent >
              {selectedTeam && (
                <ViewComponent>
                  <CommonTouchableOpacity onPress={handleToggleStatusConfirm}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                        <ViewComponent style={[commonStyles.bottomsheeticonbg]}>
                          <Feather name={selectedTeam.status === 'Active' ? 'user-x' : 'user-check'} size={s(22)} color={NEW_COLOR.TEXT_WHITE} />
                        </ViewComponent>
                        <TextMultiLanguage style={[commonStyles.bottomsheetprimarytext]} text={selectedTeam.status === 'Active' ? 'GLOBAL_CONSTANTS.DISABLE' : 'GLOBAL_CONSTANTS.ENABLE'} />
                      </ViewComponent>
                      <SimpleLineIcons name="arrow-right" size={s(16)} color={NEW_COLOR.TEXT_WHITE} />
                    </ViewComponent>
                  </CommonTouchableOpacity>
                  <ViewComponent style={[commonStyles.sectionGap]} />
                  <ViewComponent style={[commonStyles.titleSectionGap]} />

                  <ButtonComponent
                    multiLanguageAllows={true}
                    title="GLOBAL_CONSTANTS.CANCEL"
                    onPress={() => dotsSheetRef?.current?.close()}
                    solidBackground={true}
                  />
                </ViewComponent>
              )}
            </ViewComponent>
          </CustomRBSheet>


          <CustomRBSheet refRBSheet={confirmSheetRef} title={selectedTeam?.status === 'Active' ? "GLOBAL_CONSTANTS.CONFIRM_DISABLE" : "GLOBAL_CONSTANTS.CONFIRM_ENABLE"} height={"Small"}>
            <ViewComponent>
              {selectedTeam && (
                <ViewComponent>
                  <ViewComponent style={[commonStyles.mxAuto, commonStyles.titleSectionGap, { width: s(80), height: s(80) }]}>
                    <TeamMembersIcon width={s(90)} height={s(90)} />
                  </ViewComponent>
                  <TextMultiLanguage
                    style={[commonStyles.bottomsheetsectiontitle, commonStyles.sectionGap, commonStyles.textCenter]}
                    text={selectedTeam.status === 'Active' ? "GLOBAL_CONSTANTS.CONFIRM_DISABLE_MESSAGE" : "GLOBAL_CONSTANTS.CONFIRM_ENABLE_MESSAGE"}
                  />
                  <ViewComponent style={[commonStyles.dflex, commonStyles.gap12]}>
                    <ViewComponent style={[commonStyles.flex1]}>
                      <ButtonComponent
                        multiLanguageAllows={true}
                        title="GLOBAL_CONSTANTS.NO"
                        onPress={() => confirmSheetRef?.current?.close()}
                        solidBackground={true}
                      />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.flex1]}>
                      <ButtonComponent
                        multiLanguageAllows={true}
                        title="GLOBAL_CONSTANTS.YES"
                        onPress={handleToggleStatus}
                        loading={toggleLoading}
                      />
                    </ViewComponent>
                  </ViewComponent>
                </ViewComponent>
              )}
            </ViewComponent>
          </CustomRBSheet>
          {kycModelVisible && <KycVerifyPopup closeModel={closekycModel} addModelVisible={kycModelVisible} />}
        </Container>
      )}
    </ViewComponent>
  );
};

export default TeamIndex;
