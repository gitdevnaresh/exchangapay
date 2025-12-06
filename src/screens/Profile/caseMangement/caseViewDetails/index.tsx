import React, { useEffect, useMemo, useState } from "react";
import { formatDateLocal, isErrorDispaly } from "../../../../utils/helpers";
import ProfileService from "../../../../services/profile";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { commonStyles } from "../../../../components/CommonStyles";
import ErrorComponent from "../../../../components/Error";
import NoDataComponent from "../../../../components/nodata";
import { NEW_COLOR } from "../../../../constants/theme/variables";
import Loadding from "../../../../components/skeleton";
import { personalInfoLoader } from "../../skeleton_views";
import { BackHandler, FlatList, SafeAreaView, View } from "react-native";
import { s } from "../../../../constants/theme/scale";
import { Container } from "../../../../components";
import PageHeader from "../../../../components/pageHeader/pageHeader";
import ParagraphComponent from "../../../../components/Paragraph/Paragraph";
import DefaultButton from "../../../../components/DefaultButton";
import { ChatIcon } from "../../../../assets/svg";
import FilePreviewWithId from "../../../../components/FileUpload/filePreviewWithId";

const ItemSeparator = React.memo(() => {
  return <View style={[commonStyles.mb20]} />;
});

const CaseViewDetails: React.FC<any> = (props) => {
  const [data, setData] = useState<any>({ caseDetails: null, loader: false, error: '' });
  const navigation = useNavigation<any>();
  const PersonalInfoLoader = personalInfoLoader(10);

  useEffect(() => {
    if (props?.route?.params?.item?.id) {
      getCaseDetails(props?.route?.params?.item?.id);
    }
  }, [props?.route?.params?.item?.id]);

  // Listen for refresh parameter changes
  useEffect(() => {
    if (props?.route?.params?.refresh && props?.route?.params?.item?.id) {
      getCaseDetails(props?.route?.params?.item?.id);
    }
  }, [props?.route?.params?.refresh, props?.route?.params?.refreshTimestamp]);

  const getCaseDetails = async (id: string) => {
    setData((prev: any) => ({ ...prev, loader: true, error: '' }));
    try {
      const response: any = await ProfileService.getCaseDetailsMessages(id);
      if (response.status == 200) {
        const sortedData = response.data.sort((a: any, b: any) => new Date(a.repliedDate).getTime() - new Date(b.repliedDate).getTime());
        setData((prev: any) => ({ ...prev, loader: false, caseDetails: sortedData }));
      } else {
        setData((prev: any) => ({ ...prev, loader: false, error: isErrorDispaly(response), caseDetails: null }));
      }
    } catch (error) {
      setData((prev: any) => ({ ...prev, loader: false, error: isErrorDispaly(error) }));
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
    navigation?.navigate("supportCaseView", {
      id: props?.route?.params?.customerDetails?.id,
      animation: 'slide_from_left',
      screenName: props?.route?.params?.screenName
    })
  }




  const getBubbleRadius = (isCustomer: boolean) => {
    if (isCustomer) {
      return {
        borderTopLeftRadius: s(16),
        borderBottomLeftRadius: s(16),
        borderBottomRightRadius: s(16),
      };
    }

    return {
      borderTopRightRadius: s(16),
      borderBottomRightRadius: s(16),
      borderBottomLeftRadius: s(16),
    };
  };



  const groupedData = useMemo(() => {
    const messages = data?.caseDetails || [];
    if (messages.length === 0) {
      return [];
    }

    const grouped: any = [];
    let lastDate: string | null = null;

    messages.forEach((message: any) => {
      const messageDate = message.repliedDate.split('T')[0];

      if (messageDate !== lastDate) {
        grouped.push({
          id: `date-${messageDate}`,
          type: 'date',
          date: message.repliedDate,
        });
        lastDate = messageDate;
      }

      grouped.push({
        ...message,
        type: 'message',
      });
    });

    return grouped;
  }, [data?.caseDetails]);
  const getDateLabel = (dateString: string) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    // Reset time to compare only dates
    const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (messageDateOnly.getTime() === todayOnly.getTime()) {
      return 'Today';
    } else if (messageDateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Yesterday';
    } else {
      return null; // Return null to use FormattedDateText
    }
  };

  const handleSendReply = () => {
    navigation.navigate('SendReplay', {
      item: props?.route?.params?.item,
      customerDetails: props?.route?.params?.customerDetails,
      screenName: props?.route?.params?.screenName
    });
  }

  const handleRefresh = () => {
    getCaseDetails(props?.route?.params?.item?.id);
  };
  return (
    <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>


      <View style={[commonStyles.flex1, commonStyles.screenBg]}>
        <Container style={[commonStyles.container]}>

          <PageHeader title={props?.route?.params?.item?.documentName} onBackPress={backArrowButtonHandler} isrefresh={true} onRefresh={handleRefresh} />
          {data.loader && (<Loadding contenthtml={PersonalInfoLoader} />)}
          {data?.error && <ErrorComponent message={data?.error} onClose={() => { }} />}

          {!data.loader && (<View style={[commonStyles.flex1]}>
            {groupedData.length === 0 ? (
              <View style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter]}>
                <ChatIcon color={NEW_COLOR.TEXT_GREY} />
                <ParagraphComponent
                  text={"Start the conversation"}
                  style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textAlwaysWhite, commonStyles.mt16]}
                />
                <ParagraphComponent
                  text={"Send your first message"}
                  style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textAlwaysWhite, commonStyles.mt8, commonStyles.textCenter]}
                />
              </View>
            ) : (
              <FlatList
                inverted={true}
                style={[commonStyles.flex1]}
                data={groupedData.slice().reverse()}
                keyExtractor={(item) => item?.id}
                renderItem={({ item }) => {
                  if (item?.type === 'date') {
                    const dateLabel = getDateLabel(item?.date);
                    return (
                      <View style={[commonStyles.alignCenter]}>
                        {dateLabel ? (
                          <ParagraphComponent text={dateLabel} style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textAlwaysWhite]} />
                        ) : (
                          <ParagraphComponent text={formatDateLocal(item?.date)} style={[commonStyles.fs12, commonStyles.fw500, commonStyles.mb8, commonStyles.textAlwaysWhite]} numberOfLines={1} />

                        )}
                      </View>
                    );
                  }
                  return (
                    <View
                      style={[
                        commonStyles.dflex,
                        commonStyles.alignStart,
                        commonStyles.gap16,
                        { flexDirection: item?.isCustomer ? "row-reverse" : "row" },
                      ]}
                    >
                      <View
                        style={[
                          { width: s(30), height: s(30) },
                          { backgroundColor: item?.isCustomer ? NEW_COLOR.TEXT_ORANGE : '#3F3356' },
                          commonStyles.dflex,
                          commonStyles.alignCenter,
                          commonStyles.justifyCenter,
                          commonStyles.rounded24,

                        ]}
                      >
                        <ParagraphComponent
                          style={[commonStyles.textAlwaysWhite, commonStyles.fs12, commonStyles.fw600]}
                          text={item?.repliedBy ? item.repliedBy.substring(0, 2).toUpperCase() : ""}
                        />


                      </View>

                      <View
                        style={[
                          commonStyles.p12,
                          {
                            width: s(280),
                            backgroundColor: item?.isCustomer
                              ? NEW_COLOR.MENU_CARD_BG
                              : NEW_COLOR.SECTION_BG,
                            ...getBubbleRadius(!!item?.isCustomer),
                          },
                        ]}
                      >
                        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mb8]}>
                          <ParagraphComponent
                            style={[
                              commonStyles.listprimarytext
                            ]}
                            text={item?.repliedBy}
                          />

                          {item?.repliedDate && <ParagraphComponent text={formatDateLocal(item?.repliedDate ?? item?.createdDate)} style={[commonStyles.fs14, commonStyles.textAlwaysWhite]} numberOfLines={1} />}

                        </View>
                        <FilePreviewWithId
                          label={item?.reply}
                          files={item?.repositories?.map((repo: any) => ({
                            id: repo.id,
                            fileName: repo.fileName,
                            uri: repo.uri
                          }))}
                          showImage={true}
                        />
                      </View>
                    </View>
                  );
                }}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={ItemSeparator}
                contentContainerStyle={{ paddingBottom: 100 }}
              />
            )}
            <View style={[commonStyles.mb24]} />
          </View>)}
          {props?.route?.params?.customerDetails?.state?.toLowerCase() !== "approved" && <View style={[commonStyles.mt30]}>
            <DefaultButton title={"Replay"} onPress={() => handleSendReply()} />
            <View style={[commonStyles.mb32]} />
          </View>}


        </Container>


      </View>

    </SafeAreaView>
  )
}

export default CaseViewDetails;