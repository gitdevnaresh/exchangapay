import React, { useEffect, useState } from "react"
import ProfileService from "../../../services/profile"
import { formatDateLocal, isErrorDispaly } from "../../../utils/helpers";
import { ApiResponse } from "apisauce";
import { View, FlatList, BackHandler, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl } from "react-native";
import { Container } from "../../../components";
import PageHeader from "../../../components/pageHeader/pageHeader";
import ErrorComponent from "../../../components/Error";
import { personalInfoLoader } from "../skeleton_views";
import Loadding from "../../../components/skeleton";
import { commonStyles, statusColor } from "../../../components/CommonStyles";
import ParagraphComponent from "../../../components/Paragraph/Paragraph";
import KpiComponent from "../../../components/kpisComponent/kpis";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import NoDataComponent from "../../../components/nodata";
import { s } from "../../../constants/theme/scale";

const ItemSeparator = React.memo(() => {
  return <View style={[commonStyles.mb8]} />;
});

interface Item {
  title?: string;
  number?: string;
  createdDate?: string;
  state?: string;
  length?: any;
  id?: string;
}
interface KpiItem {
  name: string;
  value: string | number;
  isCount?: boolean; // Optional, based on ReferralData interface
}



const CaseManagement = (props: any) => {
  const [casesData, setCasesData] = useState<Item[]>([]);
  const [casesDataLoading, setCasesDataLoading] = useState<boolean>(false)
  const navigation = useNavigation<any>();
  const [kpiData, setKpiData] = useState<any>([]);
  const [error, setError] = useState<string | null>(null);
  const PersonalInfoLoader = personalInfoLoader(10);
  const isFocuses = useIsFocused();
  useEffect(() => {
    getCasesKpis();
    getRecentCases();
  }, [isFocuses]);
  const getCasesKpis = async () => {
    setError("");
    try {
      const response = await ProfileService.getCasesKPis();
      if (response?.ok && response?.data) {
        const responseData = response.data as KpiItem[];
        setKpiData(responseData);
      }
      else {
        setKpiData([]);
        setError(isErrorDispaly(response));
      }
    }
    catch (error) {
      setKpiData([]);
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
  const getRecentCases = async () => {
    setError("");
    setCasesDataLoading(true);
    try {
      const response: ApiResponse<any, any> = await ProfileService.getCasesList(1, 5);
      if (response.ok) {
        setCasesData(response.data?.data);
        setCasesDataLoading(false);
      } else {
        setError(isErrorDispaly(response));
        setCasesDataLoading(false);
        setCasesData([]);
      }
    } catch (error) {
      setError(isErrorDispaly(error));
      setCasesDataLoading(false);
    }
    finally {
      setCasesDataLoading(false);

    }
  };

  const backArrowButtonHandler = () => {
    navigation.navigate('DrawerModal', { animation: "slide_from_left" });
  };


  const handleViewCase = () => {
    navigation.navigate("SupportAllCases")
  }
  const handleCaseView = (item: Item) => {
    props?.navigation?.navigate("supportCaseView", { id: item.id })
  }
  const middleEllipsis = (text: string, maxLength = 30) => {
    if (!text || text.length <= maxLength) return text;

    const half = Math.floor((maxLength - 1) / 2);
    return text.slice(0, half) + '…' + text.slice(text.length - half);
  };
  const renderListHeader = () => (
    <>
      <KpiComponent data={kpiData || []} />
      <View style={[commonStyles.sectionGap]} />
      <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.titleSectionGap]}>
        <ParagraphComponent text={"Recent Cases"} style={[commonStyles.sectiontitle]} />
        {casesData?.length >= 1 && <TouchableOpacity onPress={handleViewCase} style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.sectionLink]} >
          <ParagraphComponent text={"View All"} style={[commonStyles.sectionlink]} />
        </TouchableOpacity>}
      </View>
    </>
  );
  const renderItem = ({ item, index }: any) => { // <-- Use a curly brace here
    const title = item?.title;
    let displayTitle = title;
    if (title && title.length > 30) {
      displayTitle = `${title.substring(0, 25)}......`;
    }
    return (
      <TouchableOpacity onPress={() => handleCaseView(item)} style={[commonStyles.sectionStyle]}>
        <View style={[commonStyles.dflex, commonStyles.gap10, commonStyles.alignCenter]}>
          <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flex1]}>
            <View>
              {(item?.number) && <ParagraphComponent text={item?.number} style={[commonStyles.fs14, commonStyles.textAlwaysWhite, commonStyles.mb4, commonStyles.fw600]} />}
              {displayTitle && <ParagraphComponent text={middleEllipsis(displayTitle)} numberOfLines={1} style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textAlwaysWhite]} />}
            </View>
            <View>
              {(item?.state) && <ParagraphComponent text={item?.state ?? item?.state} style={[commonStyles.fs12, commonStyles.fw700, commonStyles.textRight, commonStyles.mb8, { color: statusColor[item?.state?.toLowerCase()] }]} />}
              <ParagraphComponent text={formatDateLocal(item?.date ?? item?.createdDate)} style={[commonStyles.fs14, commonStyles.textpara, commonStyles.fw600]} numberOfLines={1} />

            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  const handleCloseError = () => {
    setError(null);
  };
  const handleRefresh = () => {
    getCasesKpis();
    getRecentCases();
  }
  return (
    <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
      <ScrollView >
        <Container style={[commonStyles.container]}>
          <View>
            <PageHeader
              onBackPress={backArrowButtonHandler}
              title={"Cases"}
              isrefresh={true}
              onRefresh={handleRefresh}
            />
          </View>
          {casesDataLoading && <Loadding contenthtml={PersonalInfoLoader} />}
          <View style={[commonStyles.mb10]}>
            {error && <ErrorComponent message={error} onClose={handleCloseError} />}
          </View>
          {!casesDataLoading && (<View>
            <FlatList
              contentContainerStyle={{ paddingBottom: s(70) }}
              data={casesData ?? []}
              ItemSeparatorComponent={ItemSeparator}
              keyExtractor={(item, index) => item.id ?? index.toString()} // Use a more stable key if available
              renderItem={renderItem}
              ListHeaderComponent={renderListHeader}
              scrollEnabled={false}   // 👈 disables FlatList scroll
              nestedScrollEnabled={true}
              ListEmptyComponent={() => <>{!casesDataLoading && <NoDataComponent />}</>}
            />
          </View>)}
        </Container>
      </ScrollView>

    </SafeAreaView>

  )
}
export default CaseManagement;

