import { useEffect, useCallback, useMemo, useRef, useState } from "react"
import { dateFormates, isErrorDispaly } from "../../../../utils/helpers";
import { Alert, TouchableOpacity } from "react-native";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import { s } from "../../../../constants/styels/scale";
import CustomRBSheet from "../../../../components/models/commonDrawer";
import Loadding from "../../../../components/skelton/skeltons";
import { transactionCard } from "../../../../skeletons/skeltonViews";
import { REFERRAL_CONST } from "./membersConstants";
import ErrorComponent from "../../../../components/errorDisplay/errorDisplay";
import CopyCard from "../../../../components/copyIcon/CopyCard";
import ViewComponent from "../../../../components/view/view";
import CommonTouchableOpacity from "../../../../components/touchableComponents/touchableOpacity";
import ImageUri from "../../../../components/imageComponents/image";
import { FormattedDateText } from "../../../../components/textComponets/dateTimeText/dateTimeText";
import FlatListComponent from "../../../../components/flatList/flatList";
import Container from "../../../../components/container/container";
import PageHeader from "../../../../components/pageHeader/pageHeader";
import SearchCompApi from "../../../../components/searchComponents/searchCompApi";
import CustomPicker from "../../../../components/pickerComponents/basic/customPickerNonFormik";
import ButtonComponent from "../../../../components/buttons/button";
import { Referral, Referrals, Status } from "./interFaces";
import { ProfilePrimaryServices } from "../../../../apiServices/profile/primary";
import { getAppName } from "../../../../../Environment";
import NoDataComponent from "../../../../components/noData/noData";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import DashboardLoader from "../../../../components/loader";
import Clipboard from "@react-native-clipboard/clipboard";
import FilterIconImage from "../../../../components/svgIcons/mainmenuicons/transactionfilter";
import { statusColor } from "../../../../components/theme/commonStyles";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";
import { RefreshControl } from "react-native";

const MembersList = (props: any) => {
  const [state, setState] = useState<Referrals>({
    listLoading: false,
    error: "",
    listData: [],
  });
  const Appname = getAppName();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const rbSheetRef = useRef<any>(null);
  const [statusLu, setStatusLu] = useState<Status[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);
  const transactionCardContent = transactionCard(10);
  const [selectedStatus, setSelectedStatus] = useState<string>();
  const [refresh, setRefresh] = useState<boolean>(false);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  useEffect(() => {
    referralDetails(searchQuery, 1);
    statusLookup();
  }, []);

  const referralDetails = async (currentSearchTerm: string, pageNumber: number) => {
    setState((prev) => ({ ...prev, listLoading: true }));
    const pageSize = 10;
    try {
      let response: any;
      response = await ProfilePrimaryServices.getReferralsList(
        selectedStatus ?? "All",
        currentSearchTerm === "" ? "null" : currentSearchTerm,
        pageNumber,
        pageSize
      );
      const moreData = response?.data?.data?.length === pageSize;
      if (response.ok) {
        const newReferrals = response?.data?.data;
        setState(prev => ({
          ...prev,
          listData: pageNumber === 1 ? newReferrals : [...prev.listData, ...newReferrals],
          listLoading: false,
          error: pageNumber === 1 ? "" : prev.error
        }));
      }
      else {
        setState((prev) => ({ ...prev, error: isErrorDispaly(response), listLoading: false }));
      }
      setHasMoreData(moreData)
    } catch (error) {
      setState((prev) => ({ ...prev, error: isErrorDispaly(error) }));
      setState((prev) => ({ ...prev, listLoading: false }));
    }
  };

  const statusLookup = async () => {
    try {
      let response: any;
      response = await ProfilePrimaryServices.getStatusLu();
      if (response.ok) {
        setStatusLu(response.data?.ReferralStatus);
      } else {
        setState((prev) => ({ ...prev, error: isErrorDispaly(response) }));
      }
    } catch (error) {
      setState((prev) => ({ ...prev, error: isErrorDispaly(error) }));
    }
  };

  const handleDetails = useCallback((item: any) => {
    const routeName = Appname === "arthaPay" ? "ReferralDetails" : REFERRAL_CONST.REFERRAL_DETAILS;
    props.navigation.navigate(routeName, {
      id: item?.id,
      code: item?.refId,
      name: item?.name,
    });
  }, [Appname, props.navigation]);

  const openSheet = useCallback(() => {
    rbSheetRef.current?.open();
  }, []);

  const filterIcon = useMemo(() => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={openSheet}
      style={[commonStyles.roundediconbg]}
    >
      <FilterIconImage width={s(20)} height={s(20)} />
    </TouchableOpacity>
  ), [commonStyles.roundediconbg, openSheet]);

  const handleSearch = useCallback((newSearchTerm: string) => {
    setSearchQuery(newSearchTerm);
    setPage(1);
    referralDetails(newSearchTerm?.toLowerCase(), 1);
  }, []);

  const copyToClipboard = useCallback(async (text: any) => {
    try {
      Clipboard.setString(text);
    } catch (error: any) {
      Alert.alert(REFERRAL_CONST.FAILED_TO_COPY, error);
    }
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasMoreData && !state?.listLoading) {
      setPage((prevPage) => {
        const nextPage = prevPage + 1;
        referralDetails(searchQuery, nextPage);
        return nextPage;
      });
    }
  }, [hasMoreData, state?.listLoading, searchQuery]);

  const renderFooter = () => {
    if (!state?.listLoading) {
      return null;
    }
    else {
      return (
        <Loadding contenthtml={transactionCardContent} />
      );
    }
  };

  const backArrowButtonHandler = () => {
    props.navigation.goBack();
  }

  const onRefresh = async () => {
    setRefresh(true);
    try {
      setPage(1);
      await referralDetails(searchQuery, 1);
    } finally {
      setRefresh(false);
    }
  };

  const handleSelectStatus = (selected: any) => {
    setSelectedStatus(selected?.code);
  };

  const handleApplyFilter = () => {
    setPage(1);
    referralDetails(searchQuery, 1); 
    rbSheetRef.current?.close();
  }

  const filterData = (
    <ViewComponent>
      <CustomPicker
        label="GLOBAL_CONSTANTS.SELECT_STATUS"
        data={statusLu || []}
        value={selectedStatus ?? "All"}
        onChange={handleSelectStatus}
        modalTitle="GLOBAL_CONSTANTS.SELECT_STATUS"
        placeholder="GLOBAL_CONSTANTS.SELECT_STATUS"
      />
      <ViewComponent style={[commonStyles.formItemSpace]} />
      <ViewComponent style={[commonStyles.mb16]} />
      <ButtonComponent multiLanguageAllows={true} title={"GLOBAL_CONSTANTS.APPLY_BUTTON"} onPress={handleApplyFilter} />
    </ViewComponent>
  );

  const renderItem = useCallback(({ item, index }: any) => (
    <CommonTouchableOpacity
      key={item?.id}
      activeOpacity={0.9}
      onPress={() => { handleDetails(item) }}
      style={[commonStyles.cardsbannerbg]}
    >
      <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
          <ViewComponent style={{ minHeight: s(36), minWidth: s(36) }}>
            <ImageUri uri={item?.profileImage ? item?.profileImage : (item?.profilePic ?? 'https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/default_user_image.jpg')} width={s(30)} height={s(30)} style={[{ borderRadius: s(30) / 2 }]} />
          </ViewComponent>
          <ViewComponent>
            <ParagraphComponent text={item.name?.length > 25
              ? `${item.name.slice(0, 8)}...${item.name.slice(-8)}`
              : item.name || '--'
            } style={[commonStyles.primarytext]} />
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8,]}>
              <ParagraphComponent text={item.refId?.length > 15
                ? `${item.refId.slice(0, 5)}...${item.refId.slice(-5)}`
                : item.refId || '--'
              } style={[commonStyles.secondarytext]} />
              <ViewComponent><CopyCard onPress={() => copyToClipboard(item?.refId)} size={s(14)} /></ViewComponent>
            </ViewComponent>
          </ViewComponent>
        </ViewComponent>
        <ViewComponent>
          <ParagraphComponent text={item?.status || ""} style={[commonStyles.colorstatus, commonStyles.textRight, { color: statusColor[item?.status?.toLowerCase()] ?? NEW_COLOR.TEXT_GREEN }]} />
          <FormattedDateText value={item?.registeredDate} dateFormat={dateFormates?.dateTime} style={[commonStyles.secondarytext]} />
        </ViewComponent>
      </ViewComponent>
    </CommonTouchableOpacity>
  ), [commonStyles, NEW_COLOR, handleDetails, copyToClipboard]);

  const ItemSeparator = useMemo(() => (
    <ViewComponent style={[commonStyles.transactionsListGap]} />
  ), [commonStyles.transactionsListGap]);

  const renderListHeader = () => (
    <ViewComponent>
      {!!state.error && <ErrorComponent message={state.error} onClose={() => setState((prev) => ({ ...prev, error: "" }))} />}
      <ViewComponent style={[commonStyles.dflex, commonStyles.sectionGap]}>
        <ViewComponent style={commonStyles.flex1}>
          <SearchCompApi placeholder={"GLOBAL_CONSTANTS.SEARCH_REFERRAL"} onSearch={handleSearch} inputStyle={[commonStyles.textWhite]} />
        </ViewComponent>
      </ViewComponent>
    </ViewComponent>
  );

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      {page === 1 && state?.listLoading ? (
        <DashboardLoader />
      ) : (
        <Container style={[commonStyles.container, { paddingBottom: 0 }]}>
          <PageHeader title={"GLOBAL_CONSTANTS.MEMBERS"} onBackPress={backArrowButtonHandler} rightActions={filterIcon} />
          <FlatListComponent
            ListHeaderComponent={renderListHeader}
            data={state?.listData}
            keyExtractor={(item: Referral, index: number) => item?.id?.toString() ?? index.toString()}
            renderItem={renderItem}
            ItemSeparatorComponent={ItemSeparator}
            NoData={NoDataComponent}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderFooter}
            refreshControl={<RefreshControl tintColor={NEW_COLOR.BUTTON_BG} refreshing={refresh}
              onRefresh={onRefresh} />}
          />
          <CustomRBSheet refRBSheet={rbSheetRef} title="GLOBAL_CONSTANTS.FILTER_TITLE" height={"Small"}>
            {filterData}
          </CustomRBSheet>
        </Container>)}
    </ViewComponent>
  )
}

export default MembersList
