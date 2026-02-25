import { useEffect, useCallback, useMemo, useState } from "react"
import { dateFormates, isErrorDispaly } from "../../../../utils/helpers";
import { Alert } from "react-native";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import { s } from "../../../../constants/styels/scale";
import { REFERRAL_CONST } from "./membersConstants";
import ErrorComponent from "../../../../components/errorDisplay/errorDisplay";
import CopyCard from "../../../../components/copyIcon/CopyCard";
import ViewComponent from "../../../../components/view/view";
import CommonTouchableOpacity from "../../../../components/touchableComponents/touchableOpacity";
import ImageUri from "../../../../components/imageComponents/image";
import { FormattedDateText } from "../../../../components/textComponets/dateTimeText/dateTimeText";
import MapComponent from "../../../../components/dataRenderCopmonents/mapComponent";
import { Referrals } from "./interFaces";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { ProfilePrimaryServices } from "../../../../apiServices/profile/primary";
import { getAppName } from "../../../../../Environment";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import Clipboard from "@react-native-clipboard/clipboard";
import { statusColor } from "../../../../components/theme/commonStyles";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";

const RecentMemberList = (props: any) => {
  const [state, setState] = useState<Referrals>({ listLoading: false, error: "", listData: [], });
  const navigation = useNavigation<any>();
  const Appname = getAppName();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const isFocused = useIsFocused();
  useEffect(() => {
    referralDetails();
  }, [isFocused]);
  const referralDetails = async () => {
    setState((prev) => ({ ...prev, listLoading: true }));
    try {
      let response: any;
      response = await ProfilePrimaryServices.getReferralsList("All", "null", 1, 5)
      if (response.ok) {
        props?.Data(response?.data?.data || [])
        setState((prev) => ({ ...prev, listData: response?.data?.data }));
        setState((prev) => ({ ...prev, listLoading: false }));
      } else {
        setState((prev) => ({ ...prev, error: isErrorDispaly(response) }));
        setState((prev) => ({ ...prev, listLoading: false }));
      }
    } catch (error) {

      setState((prev) => ({ ...prev, error: isErrorDispaly(error) }));
      setState((prev) => ({ ...prev, listLoading: false }));
    }
  };
  const copyToClipboard = useCallback(async (text: any) => {
    try {
      Clipboard.setString(text);
    } catch (error: any) {
      Alert.alert(REFERRAL_CONST.FAILED_TO_COPY, error);
    }
  }, []);

  const handleDetails = useCallback((item: any) => {
    const routeName = Appname === "arthaPay" ? "ReferralDetails" : REFERRAL_CONST.REFERRAL_DETAILS;
    navigation.navigate(routeName, {
      id: item?.id,
      code: item?.refId,
      name: item?.name
    });
  }, [Appname, navigation]);

  const renderItem = useCallback((item: any, index: any) => (
    <CommonTouchableOpacity
      key={item?.id}
      activeOpacity={0.9}
      onPress={() => { handleDetails(item) }}
      style={[commonStyles.cardsbannerbg]}
    >
      <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter,]}>
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
          <ViewComponent style={{ minHeight: s(30), minWidth: s(30) }}>
            <ImageUri uri={item?.profileImage ? item?.profileImage : (item?.profilePic ?? 'https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/default_user_image.jpg')} width={s(30)} height={s(30)} style={[{ borderRadius: s(30) / 2 }]} />

          </ViewComponent>
          <ViewComponent>
            <ParagraphComponent text={item.name?.length > 25
              ? `${item.name.slice(0, 8)}...${item.name.slice(-8)}`
              : item.name || '--'

            } style={[commonStyles.primarytext]} />
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
              <ParagraphComponent text={item.refId?.length > 15
                ? `${item.refId.slice(0, 5)}...${item.refId.slice(-5)}`
                : item.refId || '--'

              } style={[commonStyles.secondarytext]} />
              <ViewComponent><CopyCard onPress={() => copyToClipboard(item?.refId)} size={s(14)} /></ViewComponent>
            </ViewComponent>
          </ViewComponent>
        </ViewComponent>
        <ViewComponent>
          <ParagraphComponent text={item?.status} style={[commonStyles.colorstatus, commonStyles.textRight, { color: statusColor[item?.status?.toLowerCase()] ?? NEW_COLOR.TEXT_GREEN }]} />
          <FormattedDateText value={item?.registeredDate} dateFormat={dateFormates?.dateTime} style={[commonStyles.secondarytext]} />
        </ViewComponent>
      </ViewComponent>
    </CommonTouchableOpacity>
  ), [commonStyles, NEW_COLOR, handleDetails, copyToClipboard]);

  const ItemSeparator = useMemo(() => (
    <ViewComponent style={[commonStyles.listGap]} />
  ), [commonStyles.listGap]);

  return (
    <ViewComponent>
      {state.error !== "" && <ErrorComponent message={state.error} onClose={() => setState((prev) => ({ ...prev, error: "" }))} />}
      {!state?.listLoading && <ViewComponent style={[]}>
        <MapComponent
          data={state?.listData || []}
          ItemSeparatorComponent={<ViewComponent style={[commonStyles.transactionsListGap]} />}
          keyExtractor={(item: any) => item?.id?.toString()}
          renderItem={renderItem}
          style={{ overflow: "visible" }}
          loader={state.listLoading}
        />
      </ViewComponent>}
    </ViewComponent>
  )
}

export default RecentMemberList

