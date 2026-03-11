import {useNavigation } from "@react-navigation/native";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import ViewComponent from "../../../../newComponents/view/view"
import React, { useEffect, useState } from "react";
import CommonTouchableOpacity from "../../../../newComponents/touchableComponents/touchableOpacity";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import TextMultiLangauge from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import { s } from "../../../../newComponents/theme/scale";
import { isErrorDispaly } from "../../../../utils/helpers";
import ProfileService from "../../../../services/profile";
import Ionicons from '@expo/vector-icons/Ionicons';
import useEncryptDecrypt from "../../../../hooks/encDecHook";
import { SimpleLineIcons } from "@expo/vector-icons";
import { FlatList } from "react-native";
import ScrollViewComponent from "../../../../newComponents/scrollView/scrollView";
import Container from "../../../../newComponents/container/container";
import { getThemedCommonStyles, statusColor } from "../../../../assets/styles/CommonStyles";
import { useHardwareBackHandler } from "../../../../hooks/HardwareBackHandler";
import SwokipayDashboardLoader from "../../../../newComponents/swokipayloader";
import NoDataComponent from "../../../../newComponents/noData/noData";
import { NEW_COLOR } from "../../../../constants/theme/variables";
import ErrorComponent from "../../../../newComponents/errorDisplay/errorDisplay";

// Background styles for detail rows
const getDetailRowStyles = (colors: any) => ({
  rowContainer: {
    backgroundColor: NEW_COLOR.BANNER_BG,
    paddingHorizontal: s(14),
    paddingVertical: s(14),
    borderRadius: s(12),
    marginBottom: s(8),
  },
  rowContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: s(12),
    flexWrap: "wrap"
  },
  headerText: {
    marginBottom: s(16),
    marginLeft: s(4),
  }
});

interface ItemCommonModelInterface {
  title: string,
  value: string,
  isChecked: boolean
}
const SupportCaseView: React.FC<any> = (props) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const navigation = useNavigation<any>();
  const [data, setData] = useState<any>({ isExpanded: false, caseDetails: null, loader: false, error: '' });
  const { decryptAES } = useEncryptDecrypt();
  const ENCRYPTED_KEYS = ['Email', 'Account Number/IBAN'];
  const detailRowStyles = getDetailRowStyles(NEW_COLOR);
  const[error,setError]=useState<string>("");

  useEffect(() => {
   if(props?.route?.params?.id) {
    getCaseDetails(props?.route?.params?.id);
   }
  }, [props?.route?.params?.id]);

  const getCaseDetails = async (id: string) => {
    setError("");
    setData((prev: any) => ({ ...prev, loader: true, error: '' }));
    try {
      const response = await ProfileService.getCaseDetails(id);
      if (response.ok) {
        setData((prev: any) => ({ ...prev, loader: false, caseDetails: response.data }));
      } else {
        setData((prev: any) => ({ ...prev, loader: false,caseDetails: null}));
        setError(isErrorDispaly(response));
      }
    } catch (error) {
      setData((prev: any) => ({ ...prev, loader: false  }));
      setError(isErrorDispaly(error));

    }
  };


  useHardwareBackHandler(() => {
    backArrowButtonHandler();
  });
  const backArrowButtonHandler = () => {
    if (props?.route?.params?.screenName == "Home") {
      navigation.navigate('Dashboard', { animation: 'slide_from_left', initialTab: "GLOBAL_CONSTANTS.HOME" });

    } else {
      navigation.navigate('Support', { animation: 'slide_from_left' });

    }

  };
  const handleExpand = () => {
    setData((prev: any) => ({ ...prev, isExpanded: !prev.isExpanded }));
  };

  const caseDetails = data.caseDetails;
  const commonModel = caseDetails?.commonModel;

  // Convert the object into an array of key-value pairs
  const keyValuePairs = commonModel ? Object.entries(commonModel).map(([key, value]) => ({
    title: key,
    value: value,
  })) : [];
  const visiblePairs = data?.isExpanded ? keyValuePairs : keyValuePairs.slice(0, 0);
  const showReadMore = keyValuePairs.length > 0;
  const handleSelectCaseView = (item: string) => {
    navigation.navigate('CaseViewDetails', { item: item, customerDetails: data?.caseDetails, screenName: props?.route?.params?.screenName })
  }
  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container style={[commonStyles.container]}>
        <PageHeader title={data?.caseDetails?.number || "Case Details"} onBackPress={backArrowButtonHandler} />
        {error&&<ErrorComponent message={error} screen={true}/>}
        {data?.loader && (
            <ViewComponent style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter]}>
                <SwokipayDashboardLoader />
            </ViewComponent>
        )}
      
        {!data?.loader && (!data?.caseDetails || data?.error || Object.keys(data?.caseDetails || {}).length === 0) && (
          <ViewComponent style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter]}>
            <NoDataComponent />
          </ViewComponent>
        )}
        {!data?.loader && data?.caseDetails && !data?.error && Object.keys(data?.caseDetails || {}).length > 0 && (
          <>
        <ScrollViewComponent>
          <ViewComponent>     
            {/* Case Number */}
            <ViewComponent style={detailRowStyles.rowContainer}>
              <ViewComponent style={detailRowStyles.rowContent}>
                <TextMultiLangauge text={"GLOBAL_CONSTANTS.CASE_NUMBER"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} />
                <ParagraphComponent text={data?.caseDetails?.number} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} />
              </ViewComponent>
            </ViewComponent>
            
            {/* Case Title */}
            <ViewComponent style={detailRowStyles.rowContainer}>
              <ViewComponent style={detailRowStyles.rowContent}>
                <TextMultiLangauge text={"GLOBAL_CONSTANTS.CASE_TITLE"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} />
                <ParagraphComponent text={data?.caseDetails?.customerCaseTitle} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} />
              </ViewComponent>
            </ViewComponent>
            
            {/* Case State */}
            <ViewComponent style={detailRowStyles.rowContainer}>
              <ViewComponent style={detailRowStyles.rowContent}>
                <TextMultiLangauge text={"GLOBAL_CONSTANTS.CASE_STATE"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} />
                <ParagraphComponent text={data?.caseDetails?.state} style={[commonStyles.fs14, commonStyles.fw500,  { color: statusColor[data?.caseDetails?.state?.toLowerCase()] }]} />
              </ViewComponent>
            </ViewComponent>
            
            {/* Remarks */}
            <ViewComponent style={detailRowStyles.rowContainer}>
              <ViewComponent style={data?.caseDetails?.remarks?.length > 30 ? { flexDirection: 'column', alignItems: 'flex-start' } : detailRowStyles.rowContent}>
                <TextMultiLangauge text={"GLOBAL_CONSTANTS.REMARKS"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} />
                <ParagraphComponent text={data?.caseDetails?.remarks} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite, data?.caseDetails?.remarks?.length > 30 && { marginTop: s(8) }]} numberOfLines={13} />
              </ViewComponent>
            </ViewComponent>
            {visiblePairs?.map((item: any, index) => {
              const displayValue = ENCRYPTED_KEYS.includes(item?.title)
                ? decryptAES(item?.value)
                : item?.value;
              return (
                <ViewComponent key={`${item?.title}-${index}`} style={detailRowStyles.rowContainer}>
                  <ViewComponent style={detailRowStyles.rowContent}>
                    <ParagraphComponent text={item?.title} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} />
                    <ParagraphComponent text={displayValue} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite,]} />
                  </ViewComponent>
                </ViewComponent>
              );
            })}
            {showReadMore && (
              <CommonTouchableOpacity onPress={handleExpand} >
                <Ionicons name="chevron-down" size={s(28)} style={[commonStyles.mxAuto, commonStyles.textCenter, { transform: [{ rotate: data?.isExpanded ? "180deg" : "0deg" }] }]} color={NEW_COLOR.TEXT_WHITE} />
                <ParagraphComponent style={[commonStyles.textCenter, commonStyles.fs14, commonStyles.fw500, commonStyles.textlinkgrey]}>
                  {data?.isExpanded ? "GLOBAL_CONSTANTS.SHOW_LESS" : "GLOBAL_CONSTANTS.READ_MORE"}
                </ParagraphComponent>
              </CommonTouchableOpacity>
            )}
          </ViewComponent>
          <ViewComponent style={[commonStyles.listGap]} />
        { data?.caseDetails&&  
        <ViewComponent>
        <TextMultiLangauge text={"GLOBAL_CONSTANTS.REQUEST_FOR_DOCUMENT"} style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textWhite]} />
        <ViewComponent style={[commonStyles.listGap]} />
        </ViewComponent>}
          <FlatList
            data={data?.caseDetails?.details?.filter((item: ItemCommonModelInterface) => item?.isChecked)}
            renderItem={({ item }) => (
              <CommonTouchableOpacity onPress={() => handleSelectCaseView(item)} style={detailRowStyles.rowContainer}>
                <ViewComponent style={detailRowStyles.rowContent}>
                  <ViewComponent style={[commonStyles.flex1]}>
                    <ParagraphComponent text={item?.documentName} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} numberOfLines={3} />
                  </ViewComponent>
                  {data?.caseDetails?.state != 'Approved' ? (<ParagraphComponent text={item?.state} style={[commonStyles.fs12, commonStyles.fw400, { color: statusColor[item?.state?.toLowerCase()] }]} />) :
                    <SimpleLineIcons name="arrow-right" size={s(14)} color={NEW_COLOR.TEXT_WHITE} />}
                </ViewComponent>
              </CommonTouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            nestedScrollEnabled={true}
          />
          <ViewComponent style={[commonStyles.sectionGap]} />
        </ScrollViewComponent>
          </>
        )}
      </Container>
    </ViewComponent>
  )
}
export default SupportCaseView;


