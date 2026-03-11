import React, { useEffect, useMemo, useState } from "react";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import ViewComponent from "../../../../newComponents/view/view";
import Container from "../../../../newComponents/container/container";
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import { dateFormates, isErrorDispaly } from "../../../../utils/helpers";
import ProfileService from "../../../../services/profile";
import { FlatList } from "react-native-gesture-handler";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import { FormattedDateText } from "../../../../newComponents/textComponets/dateTimeText/dateTimeText";
import ButtonComponent from "../../../../newComponents/buttons/button";
import { s } from "../../../../newComponents/theme/scale";
import { useNavigation } from "@react-navigation/native";
import SafeAreaViewComponent from "../../../../newComponents/safeArea/safeArea";
import { getThemedCommonStyles } from "../../../../assets/styles/CommonStyles";
import FilePreviewWithId from "../../../../newComponents/fileUpload/filePreviewWithId";
import { useHardwareBackHandler } from "../../../../hooks/HardwareBackHandler";
import SwokipayDashboardLoader from "../../../../newComponents/swokipayloader";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import TextMultiLanguage from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import NoDataComponent from "../../../../newComponents/noData/noData";
import ErrorComponent from "../../../../newComponents/errorDisplay/errorDisplay";

const ItemSeparator = React.memo(() => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return <ViewComponent style={[commonStyles.listGap]} />;
});

const CaseViewDetails: React.FC<any> = (props) => {
  const NEW_COLOR = useThemeColors();
  const [data, setData] = useState<any>({ caseDetails: null, loader: false, error: '' });
  const navigation = useNavigation<any>();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

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
      if (response.status==200) {
        const sortedData = response.data.sort((a: any, b: any) => new Date(a.repliedDate).getTime() - new Date(b.repliedDate).getTime());
        setData((prev: any) => ({ ...prev, loader: false, caseDetails: sortedData }));
      } else {
        setData((prev: any) => ({ ...prev, loader: false, error: isErrorDispaly(response), caseDetails: null }));
      }
    } catch (error) {
      setData((prev: any) => ({ ...prev, loader: false, error: isErrorDispaly(error) }));
    }
  };

  useHardwareBackHandler(() => {
    backArrowButtonHandler();
  });



  const backArrowButtonHandler = () => {
    navigation?.navigate("SupportCaseView", {
      id: props?.route?.params?.customerDetails?.id,
      animation: 'slide_from_left',
      screenName: props?.route?.params?.screenName
    })
  }




  const getBubbleRadius = (isCustomer: boolean) => {
    if (isCustomer) {
      return {
        borderTopLeftRadius: s(10),
        borderBottomLeftRadius: s(10),
        borderBottomRightRadius: s(10),
      };
    }

    return {
      borderTopRightRadius: s(10),
      borderBottomRightRadius: s(10),
      borderBottomLeftRadius: s(10),
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
  }
  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      {data.loader && <SafeAreaViewComponent><SwokipayDashboardLoader /></SafeAreaViewComponent>}
      {!data.loader && (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
          <Container style={[commonStyles.container]}>
            <PageHeader title={props?.route?.params?.item?.documentName} onBackPress={backArrowButtonHandler}  isrefresh={true}  onRefresh={handleRefresh}/>
            {data?.error && <ErrorComponent message={data?.error} screen={true} />}
            <ViewComponent style={[commonStyles.flex1]}>
               { groupedData.length === 0 ?(
                <ViewComponent style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter]}>
                  <MaterialIcons name="chat-bubble-outline" size={s(60)} color={NEW_COLOR.TEXT_GREY} />
                  <TextMultiLanguage 
                    text={"GLOBAL_CONSTANTS.START_THE_CONVERSATION"} 
                    style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textlinkgrey, commonStyles.mt16]} 
                  />
                  <TextMultiLanguage 
                    text={"GLOBAL_CONSTANTS.SEND_YOUR_FIRST_MESSAGE"}
                    style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textlinkgrey, commonStyles.mt8, commonStyles.textCenter]} 
                  />
                </ViewComponent>
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
                      <ViewComponent style={[commonStyles.alignCenter]}>
                        {dateLabel ? (
                          <ParagraphComponent text={dateLabel} style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textWhite]} />
                        ) : (
                          <FormattedDateText value={item?.date} dateFormat={dateFormates.date} style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textWhite]} />
                        )}
                      </ViewComponent>
                    );
                  }
                  return (
                    <ViewComponent
                      style={[
                        commonStyles.dflex,
                        commonStyles.alignStart,
                        commonStyles.gap16,
                        { flexDirection: item?.isCustomer ? "row-reverse" : "row" },
                      ]}
                    >
                      <ViewComponent
                        style={[
                          { width: s(30), height: s(30) },
                          { backgroundColor: item?.isCustomer ? NEW_COLOR.CIRCLE_BG : NEW_COLOR.CIRCLE_BG },
                          commonStyles.dflex,
                          commonStyles.alignCenter,
                          commonStyles.justifyCenter,
                          commonStyles.rounded100,
                        ]}
                      >
                        <ParagraphComponent
                          style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.fw600]}
                          text={item?.repliedBy ? item.repliedBy.substring(0, 2).toUpperCase() : ""}
                        />

                        {item?.isCustomer ? (
                          <ViewComponent style={{ position: "absolute", right: s(20), top: s(-16), }}>
                            <MaterialIcons name="arrow-right" size={s(50)} color={NEW_COLOR.BANNER_BG} />
                          </ViewComponent>
                        ) : (
                          <ViewComponent style={{ position: "absolute", left: s(20), top: s(-16), }}>
                            <MaterialIcons name="arrow-left" size={s(50)} color={NEW_COLOR.CHAT_BG} />
                          </ViewComponent>
                        )}
                      </ViewComponent>

                      <ViewComponent
                        style={[
                          commonStyles.p12,
                          {
                            width: s(320),
                            backgroundColor: item?.isCustomer
                              ? NEW_COLOR.BANNER_BG
                              : NEW_COLOR.CHAT_BG,
                            ...getBubbleRadius(!!item?.isCustomer),
                          },
                        ]}
                      >
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mb6]}>
                          <ParagraphComponent
                            style={[
                              commonStyles.fs14,
                              commonStyles.fw500,
                              commonStyles.textWhite,
                            ]}
                            text={item?.repliedBy}
                          />
                          {item?.repliedDate && (
                            <FormattedDateText
                              conversionType={"UTC-to-local"}
                              value={item?.repliedDate as string}
                              dateFormat={dateFormates?.time}
                              style={[commonStyles.fs10, commonStyles.fw400, commonStyles.textWhite]}
                            />
                          )}
                        </ViewComponent>
                        <FilePreviewWithId
                          label={item?.reply}
                          files={item?.repositories?.map((repo: any) => ({
                            id: repo.id,
                            fileName: repo.fileName,
                            uri: repo.uri
                          }))}
                          showImage={false}
                        />
                      </ViewComponent>
                    </ViewComponent>
                  );
                }}
                  showsVerticalScrollIndicator={false}
                  ItemSeparatorComponent={ItemSeparator}
                />
              )}
            </ViewComponent>
            {props?.route?.params?.customerDetails?.state !== "Approved" && <ViewComponent style={[commonStyles.mt30]}>
              <ButtonComponent title={"GLOBAL_CONSTANTS.REPLY"} onPress={() => handleSendReply()} />
              <ViewComponent style={[commonStyles.mb32]} />
            </ViewComponent>}


          </Container>


        </ViewComponent>
      )}
    </ViewComponent>
  )
}

export default CaseViewDetails;