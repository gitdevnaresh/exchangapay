import React, { useCallback, useEffect, useState } from "react"
import { ProfilePrimaryServices } from "../../../../apiServices/profile/primary";
import { dateFormates, isErrorDispaly } from "../../../../utils/helpers";
import { Alert } from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { getThemedCommonStyles, statusColor } from "../../../../components/CommonStyles";
import { s } from "../../../../constants/styels/scale";
import { cryptoCurrencies, KpiItem, MemberDetailsProps, TransactionDetailItem, UserProfile } from "./interFaces";
import CopyCard from "../../../../components/copyIcon/CopyCard";
import { REFERRAL_CONST } from "./membersConstants";
import ErrorComponent from "../../../../components/errorDisplay/errorDisplay";
import ImageUri from "../../../../components/imageComponents/image";
import ViewComponent from "../../../../components/view/view";
import FlatListComponent from "../../../../components/flatList/flatList";
import Container from "../../../../components/container/container";
import PageHeader from "../../../../components/pageHeader/pageHeader";
import { FormattedDateText } from "../../../../components/textComponets/dateTimeText/dateTimeText";
import { CurrencyText } from "../../../../components/textComponets/currencyText/currencyText";
import TextMultiLangauge from "../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import CommonTouchableOpacity from "../../../../components/touchableComponents/touchableOpacity";
import useEncryptDecrypt from "../../../../hooks/encDecHook";
import NoDataComponent from "../../../../components/noData/noData";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import DashboardLoader from "../../../../components/loader";
import { ApiResponse } from "apisauce";
import Clipboard from "@react-native-clipboard/clipboard";
import KpiComponent from "../../../../components/kpiComponent/kpiComponent";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";
import { RefreshControl } from "react-native";
const ItemSeparator = React.memo(() => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return <ViewComponent style={[commonStyles.listGap]} />;
});



const MemberDetails: React.FC<MemberDetailsProps> = (props) => {
  const [error, setError] = useState<string>("")
  const [refDetails, setRefDetails] = useState<UserProfile>()
  const [refDetailsLoading, setRefDetailsLoading] = useState<boolean>(false)
  const [transactions, setTransactions] = useState<TransactionDetailItem[]>([])
  const navigation = useNavigation();
  const { decryptAES } = useEncryptDecrypt();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [kpiData, setKpiData] = useState<any>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  const isFocused = useIsFocused();


  useEffect(() => {
    getReferralDetails();
    getRefTrnsactions();
    getReferralKpis();
  }, [isFocused]);
  const getReferralDetails = async () => {
    setRefDetailsLoading(true);
    try {
      const response = await ProfilePrimaryServices.referralDetails(props.route.params.id);
      if (response.ok) {
        setRefDetails(response.data as UserProfile);
        setRefDetailsLoading(false);
      } else {
        setError(isErrorDispaly(response));
        setRefDetailsLoading(false);
      }
    } catch (error) {
      setError(isErrorDispaly(error));
      setRefDetailsLoading(false);
    }
  };
  const getReferralKpis = async () => {
    setError('')
    try {
      const response = await ProfilePrimaryServices.getDetailReferralKPis(props.route.params.id);
      if (response.ok) {
        let filteredKpiData: KpiItem[];
        const responseData = response.data as KpiItem[];
        filteredKpiData = responseData.filter((item: KpiItem) => item.name !== "Referral Code");
        setKpiData(filteredKpiData);
      }
      else {
        setError(isErrorDispaly(response))
      }
    }
    catch (error) {
      setError(isErrorDispaly(error))
    }
  };
  const getRefTrnsactions = async () => {
    try {
      const response: ApiResponse<any, any> = await ProfilePrimaryServices.referralTransactions(props?.route?.params.id, 1, 5);
      if (response.ok) {
        setTransactions(response.data?.data);
      } else {
        setError(isErrorDispaly(response));
      }
    } catch (error) {
      setError(isErrorDispaly(error));
    }
  };
  const backArrowButtonHandler = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleRefresh = useCallback(() => {
    getReferralDetails();
    getRefTrnsactions();
    getReferralKpis();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefresh(true);
    try {
      await Promise.all([
        getReferralDetails(),
        getRefTrnsactions(),
        getReferralKpis()
      ]);
    } finally {
      setRefresh(false);
    }
  }, []);

  const handleAllMemberTransactions = useCallback(() => {
    props?.navigation.navigate("MemberAllTransactions", {
      id: props?.route?.params?.id
    })
  }, [props?.navigation, props?.route?.params?.id]);

  const renderListHeader = () => (
    <>
      {error !== "" && <ErrorComponent message={error} onClose={() => setError("")} />}
      <ViewComponent style={[commonStyles.alignCenter, commonStyles.sectionGap]}>
        <ImageUri uri={refDetails?.image ?? 'https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/default_user_image.jpg'} width={s(130)} height={s(130)} style={[{ borderRadius: s(130) / 2 }, commonStyles.mb5]} />
        <ViewComponent style={commonStyles.flex1}>
          <ParagraphComponent text={refDetails?.fullName} style={[commonStyles.sectionTitle, commonStyles.textCenter, commonStyles.mb5]} />
        </ViewComponent>
      </ViewComponent>
      <KpiComponent data={kpiData ?? []} />
      <ViewComponent style={[commonStyles.sectionGap]} />
      <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.listitemGap, commonStyles.flexWrap, commonStyles.gap8, commonStyles.gap8]}>
        <TextMultiLangauge
          text={"GLOBAL_CONSTANTS.EMAIL"}
          style={[commonStyles.listsecondarytext]}
        />
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
          <ParagraphComponent
            text={decryptAES(refDetails?.email ?? '')}
            style={[commonStyles.listprimarytext]}
            numberOfLines={1}
          />
        </ViewComponent>
      </ViewComponent>
      <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.listitemGap, commonStyles.flexWrap, commonStyles.gap8]}>
        <TextMultiLangauge
          text={"GLOBAL_CONSTANTS.PHONE_NUMBER"}
          style={[commonStyles.listsecondarytext]}
        />
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
          <ParagraphComponent
            text={`${decryptAES(refDetails?.phoneCode)} ${decryptAES(refDetails?.phoneNo ?? refDetails?.phoneNumber ?? '')}`}
            style={[commonStyles.listprimarytext]}
            numberOfLines={1}
          />
        </ViewComponent>
      </ViewComponent>

      <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.listitemGap, commonStyles.flexWrap, commonStyles.gap8]}>
        <TextMultiLangauge
          text={"GLOBAL_CONSTANTS.REF_ID_WITHOUT_COLON"}
          style={[commonStyles.listsecondarytext]}
        />
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
          <ParagraphComponent
            text={decryptAES(refDetails?.refId ?? '') || ""}
            style={[commonStyles.listprimarytext]}
            numberOfLines={1}
          />
          <CopyCard onPress={async () => {
            try { Clipboard.setString(decryptAES(refDetails?.refId ?? '')); }
            catch (e: any) { Alert.alert(REFERRAL_CONST.FAILED_TO_COPY, e.message); }
          }} />
        </ViewComponent>
      </ViewComponent>
      <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.listitemGap, commonStyles.flexWrap, commonStyles.gap8]}>
        <TextMultiLangauge
          text={"GLOBAL_CONSTANTS.REG_DATE_WITHOUT_COLON"}
          style={[commonStyles.listsecondarytext]}
        />
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
          <FormattedDateText value={refDetails?.registeredDate ?? refDetails?.registrationDate ?? ''} dateFormat={dateFormates.dateTime} style={[commonStyles.listprimarytext]} conversionType='UTC-to-local' />
        </ViewComponent>


      </ViewComponent>

      {(!refDetailsLoading && !refDetails) && (<ViewComponent >
        <NoDataComponent />
      </ViewComponent>)}

      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.titleSectionGap]}>
        <TextMultiLangauge text={"GLOBAL_CONSTANTS.RECENT_ACTIVITIES"} style={[commonStyles.sectionTitle, commonStyles.textLeft]} />
        {transactions?.length > 0 && <CommonTouchableOpacity onPress={handleAllMemberTransactions} style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.sectionLink]} >
          <ParagraphComponent text={"GLOBAL_CONSTANTS.SEE_ALL"} style={[commonStyles.sectionLink]} />
        </CommonTouchableOpacity>}
      </ViewComponent>
    </>
  );
  const renderItem = ({ item, index }: any) => {

    const decimalPlaces = cryptoCurrencies.includes(
      (item?.currency || "").toUpperCase()
    )
      ? 4
      : 2;
    const handleViewDetails = (item: any) => {
      props?.navigation?.navigate("MemberTransactionViewDetails", { transactionData: item })
    }
    return (
      <CommonTouchableOpacity onPress={() => handleViewDetails(item)} style={[commonStyles.dflex, commonStyles.gap10, commonStyles.alignCenter]}>
        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flex1,]}>
          <ViewComponent>
            {(item?.type || item?.transactionType || item?.action) && <ParagraphComponent text={item?.type ?? item?.transactionType ?? item?.action} style={[commonStyles.primarytext]} />}
            {item?.status && <ParagraphComponent style={[commonStyles.colorstatus, { color: statusColor[item?.status !== null && item?.status?.toLowerCase()] ?? NEW_COLOR.TEXT_GREEN }]} text={item?.status} />}
          </ViewComponent>
          <ViewComponent >
            {(item?.referralAmount) && <CurrencyText value={Number(item?.referralAmount)} coinName="BTC" decimalPlaces={decimalPlaces} style={[commonStyles.primarytext, commonStyles.textRight]} />}
            {item?.wallet && (
              <ParagraphComponent
                text={`${item.wallet}${item.network || item.netWork ? `(${item.network || item.netWork})` : ''}`}
                style={[commonStyles.secondarytext, commonStyles.textRight]} />
            )}
          </ViewComponent>
        </ViewComponent>
      </CommonTouchableOpacity>
    )
  }
  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      {refDetailsLoading && <DashboardLoader />}
      {(!refDetailsLoading && refDetails) && (
        <Container style={[commonStyles.container, commonStyles.flex1] /* Adjust padding as needed */}>
          <ViewComponent style={[commonStyles.flex1]} >
            <PageHeader title={`${props.route.params?.name}`} onBackPress={backArrowButtonHandler} isrefresh={true} onRefresh={handleRefresh} />
            <FlatListComponent
              data={transactions ?? []}
              ItemSeparatorComponent={ItemSeparator}
              keyExtractor={(item, index) => item.transactionId ?? index.toString()} // Use a more stable key if available
              renderItem={renderItem}
              ListHeaderComponent={renderListHeader}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: s(100) }} // Adjust 's(20)' as needed
              refreshControl={<RefreshControl tintColor={NEW_COLOR.BUTTON_BG} refreshing={refresh}
                onRefresh={onRefresh} />}
            />
          </ViewComponent>
        </Container>)}
    </ViewComponent>

  )
}
export default MemberDetails;
