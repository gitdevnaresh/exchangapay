import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { isErrorDispaly } from "../../../../utils/helpers";
import ProfileService from "../../../../services/profile";
import { BackHandler, FlatList, ScrollView, SafeAreaView, View, TouchableOpacity } from "react-native";
import { NEW_COLOR } from "../../../../constants/theme/variables";
import ErrorComponent from "../../../../components/Error";
import { commonStyles, statusColor } from "../../../../components/CommonStyles";
import PageHeader from "../../../../components/pageHeader/pageHeader";
import NoDataComponent from "../../../../components/nodata";
import { personalInfoLoader } from "../../skeleton_views";
import Loadding from "../../../../components/skeleton";
import { Container } from "../../../../components";
import useEncryptDecrypt from "../../../../hooks/useEncryption_Decryption";
import Ionicons from "react-native-vector-icons/Ionicons";
import ParagraphComponent from "../../../../components/Paragraph/Paragraph";
import { s } from "../../../../constants/theme/scale";
import AntDesign from "react-native-vector-icons/AntDesign";


interface ItemCommonModelInterface {
  title: string,
  value: string,
  isChecked: boolean
}
const ItemSeparator = React.memo(() => {
  return <View style={[commonStyles.mb8]} />;
});

const SupportCaseView = (props: any) => {
  const navigation = useNavigation<any>();
  const [data, setData] = useState<any>({ isExpanded: false, caseDetails: null, loader: false, error: '' });
  const { decryptAES } = useEncryptDecrypt();
  const ENCRYPTED_KEYS = ['Email', 'Account Number/IBAN'];
  const [error, setError] = useState<string>("");
  const PersonalInfoLoader = personalInfoLoader(10);
  const isFocused = useIsFocused();
  useEffect(() => {
    if (props?.route?.params?.id) {
      getCaseDetails(props?.route?.params?.id);
    }
  }, [props?.route?.params?.id, isFocused]);

  const getCaseDetails = async (id: string) => {
    setError("");
    setData((prev: any) => ({ ...prev, loader: true, error: '' }));
    try {
      const response = await ProfileService.getCaseDetails(id);
      if (response.ok) {
        setData((prev: any) => ({ ...prev, loader: false, caseDetails: response.data }));
      } else {
        setData((prev: any) => ({ ...prev, loader: false, caseDetails: null }));
        setError(isErrorDispaly(response));
      }
    } catch (error) {
      setData((prev: any) => ({ ...prev, loader: false }));
      setError(isErrorDispaly(error));

    }
  };


  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => { backArrowButtonHandler(); return true; }
    );
    return () => backHandler.remove();
  }, []);

  const backArrowButtonHandler = () => {
    if (props?.route?.params?.screenName == "Home") {
      navigation.navigate('Dashboard', { animation: 'slide_from_left', initialTab: "GLOBAL_CONSTANTS.HOME" });

    } else {
      navigation.navigate('support', { animation: 'slide_from_left' });

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
  };
  const handleCloseError = () => {
    setError("")
  };
  const handleRefresh = () => {
    getCaseDetails(props?.route?.params?.id);
  };
  return (
    <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>

      <Container style={[commonStyles.container]}>
        <PageHeader title={data?.caseDetails?.number || "Case Details"} onBackPress={backArrowButtonHandler} isrefresh={true} onRefresh={handleRefresh} />
        {data?.loader && (<Loadding contenthtml={PersonalInfoLoader} />)}
        {error && <ErrorComponent message={error} onClose={handleCloseError} />}

        {!data?.loader && (!data?.caseDetails || data?.error || Object.keys(data?.caseDetails || {}).length === 0) && (
          <View style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter]}>
            <NoDataComponent />
          </View>
        )}
        {!data?.loader && data?.caseDetails && !data?.error && Object.keys(data?.caseDetails || {}).length > 0 && (

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={[commonStyles.listdarkBg]}>
              <View style={[]}>
                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap8, commonStyles.flexWrap]}>
                  <ParagraphComponent text={"Case Number"} style={[commonStyles.listsecondarytext]} />
                  <ParagraphComponent text={data?.caseDetails?.number} style={[commonStyles.listprimarytext]} />
                </View>
                <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.2 }]} />
              </View>
              <View >
                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap8, commonStyles.flexWrap]}>
                  <ParagraphComponent text={"Case Title"} style={[commonStyles.listsecondarytext]} />
                  <ParagraphComponent text={data?.caseDetails?.customerCaseTitle} style={[commonStyles.listprimarytext]} />
                </View>
                <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.2 }]} />
              </View>
              <View >
                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap8, commonStyles.flexWrap]}>
                  <ParagraphComponent text={"Case State"} style={[commonStyles.listsecondarytext]} />
                  <ParagraphComponent text={data?.caseDetails?.state} style={[commonStyles.fs14, commonStyles.fw500, { color: statusColor[data?.caseDetails?.state?.toLowerCase()] }]} />
                </View>
                <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.2 }]} />

              </View>
              <View>
                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap8, commonStyles.flexWrap]}>
                  <ParagraphComponent text={"Remarks"} style={[commonStyles.listsecondarytext]} />
                  <ParagraphComponent text={data?.caseDetails?.remarks} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textAlwaysWhite, data?.caseDetails?.remarks?.length > 30 && { marginTop: s(8) }]} numberOfLines={13} />
                </View>
                <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.2 }]} />

              </View>
              {visiblePairs?.map((item: any, index) => {
                const displayValue = ENCRYPTED_KEYS.includes(item?.title)
                  ? decryptAES(item?.value)
                  : item?.value;
                return (
                  <View key={`${item?.title}-${index}`}>
                    <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap8, commonStyles.flexWrap]}>
                      <ParagraphComponent text={item?.title} style={[commonStyles.listsecondarytext]} />
                      <ParagraphComponent text={displayValue} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textAlwaysWhite]} />
                    </View>
                    <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.2 }]} />

                  </View>
                );
              })}
              {showReadMore && (
                <TouchableOpacity onPress={handleExpand} >
                  <Ionicons name="chevron-down" size={s(24)} style={[commonStyles.mxAuto, commonStyles.textCenter, { transform: [{ rotate: data?.isExpanded ? "180deg" : "0deg" }] }]} color={NEW_COLOR.TEXT_ALWAYS_WHITE} />
                  <ParagraphComponent style={[commonStyles.textCenter, commonStyles.fs12, commonStyles.fw500, commonStyles.textOrange]}>
                    {data?.isExpanded ? "Less" : "Read More"}
                  </ParagraphComponent>
                </TouchableOpacity>
              )}
            </View>
            <View style={[commonStyles.sectionGap]} />
            {data?.caseDetails &&
              <View>
                <ParagraphComponent text={"Request for Document"} style={[commonStyles.sectiontitle]} />
                <View style={[commonStyles.mb12]} />
              </View>}
            <FlatList
              data={data?.caseDetails?.details?.filter((item: ItemCommonModelInterface) => item?.isChecked)}
              renderItem={({ item, index }) => (
                <TouchableOpacity onPress={() => handleSelectCaseView(item)} style={[commonStyles.listdarkBg]}>
                  <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap8, commonStyles.flexWrap]}>
                    <View style={[commonStyles.flex1]}>
                      <ParagraphComponent text={item?.documentName} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textAlwaysWhite]} numberOfLines={3} />
                    </View>

                    {data?.caseDetails?.state != 'Approved' ? (<ParagraphComponent text={item?.state} style={[commonStyles.fs12, commonStyles.fw400, { color: statusColor[item?.state?.toLowerCase()] }]} />) :
                      <AntDesign name="arrowright" size={s(18)} color={NEW_COLOR.TEXT_BLACK} />}
                  </View>

                </TouchableOpacity>
              )}
              ItemSeparatorComponent={ItemSeparator}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: s(70) }}
              nestedScrollEnabled={true}
            />
            <View style={[commonStyles.sectionGap]} />
          </ScrollView>

        )}
      </Container>
    </SafeAreaView>
  )
}
export default SupportCaseView;


