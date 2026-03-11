import React, { useState, useMemo } from 'react';
import { FlatList } from 'react-native';
import { useThemeColors } from '../../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../../assets/styles/CommonStyles';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ViewComponent from '../../../../../newComponents/view/view';
import Container from '../../../../../newComponents/container/container';
import PageHeader from '../../../../../newComponents/pageHeader/pageHeader';
import ParagraphComponent from '../../../../../newComponents/textComponets/paragraphText/paragraph';
import { FormattedDateText } from '../../../../../newComponents/textComponets/dateTimeText/dateTimeText';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { s } from '../../../../../constants/theme/scale';
import SwokipayDashboardLoader from '../../../../../newComponents/swokipayloader';
import ErrorComponent from '../../../../../newComponents/errorDisplay/errorDisplay';
import { isErrorDispaly, dateFormates } from '../../../../../utils/helpers';
import SupportService from '../../../../../services/profile/SupportTicket';
import ButtonComponent from '../../../../../newComponents/buttons/button';
import TextMultiLanguage from '../../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import FilePreviewWithId from '../../../../../newComponents/fileUpload/filePreviewWithId';
import { useHardwareBackHandler } from '../../../../../hooks/HardwareBackHandler';


const SupportChat = (props: any) => {
  const NEW_COLOR = useMemo(() => useThemeColors(), []);
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  const navigation = useNavigation<any>();
  const [data, setData] = useState<any>({ ticket: null, messages: [], loader: false, error: '' });



  useFocusEffect(
    React.useCallback(() => {
      if (props.route.params.ticketData.id) {
        getTicketMessages(props.route.params.ticketData.id);
      }
    }, [props.route.params.ticketData.id])
  );
  const onRefresh = (() => {
    if (props.route.params.ticketData.id) {
      getTicketMessages(props.route.params.ticketData.id);
    }
  });
  useHardwareBackHandler(() => {
    backArrowButtonHandler();
    return true;
  });
  const backArrowButtonHandler = () => {
    navigation.goBack();
  };
  const getTicketMessages = async (ticketId: string) => {
    setData((prev: any) => ({ ...prev, loader: true, error: '' }));
    try {
      const response: any = await SupportService.getSupportTicketById(ticketId);
      if (response.ok) {
        const ticket = response.data.ticket;
        const comments = ticket.comments || [];
        const sortedComments = comments.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        setData((prev: any) => ({ 
          ...prev, 
          loader: false, 
          ticket: ticket,
          messages: sortedComments 
        }));
      } else {
        setData((prev: any) => ({ ...prev, loader: false, error: isErrorDispaly(response) }));
      }
    } catch (error) {
      setData((prev: any) => ({ ...prev, loader: false, error: isErrorDispaly(error) }));
    }
  };

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
    const messages = data?.messages || [];
    if (messages.length === 0) {
      return [];
    }

    const grouped: any = [];
    let lastDate: string | null = null;

    messages.forEach((message: any) => {
      const messageDate = message.created_at.split('T')[0];

      if (messageDate !== lastDate) {
        grouped.push({
          id: `date-${messageDate}`,
          type: 'date',
          date: message.created_at,
        });
        lastDate = messageDate;
      }
      grouped.push({
        ...message,
        type: 'message',
      });
    });

    return grouped;
  }, [data?.messages]);

  const getDateLabel = (dateString: string) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (messageDateOnly.getTime() === todayOnly.getTime()) {
      return 'GLOBAL_CONSTANTS.TODAY';
    } else if (messageDateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'GLOBAL_CONSTANTS.YESTERDAY';
    } else {
      return null;
    }
  };

  const handleSendReply = () => {
    navigation.navigate('SupportChatReplay', {
      item: data.ticket,
      ticketId: data.ticket?.id
    });
  };

  const renderMessage = ({ item }: any) => {
    if (item?.type === 'date') {
      const dateLabel = getDateLabel(item?.date);
      return (
        <ViewComponent style={[commonStyles.alignCenter, commonStyles.mb16]}>
          {dateLabel ? (
            <TextMultiLanguage text={dateLabel} style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textWhite]} />
          ) : (
            <FormattedDateText value={item?.date} dateFormat={dateFormates.date} style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textWhite]} />
          )}
        </ViewComponent>
      );
    }

    const isCustomer = item.isAdminZendesk;
    return (
      <ViewComponent style={[
        commonStyles.dflex,
        commonStyles.alignStart,
        commonStyles.gap16,
        commonStyles.mb16,
        { flexDirection: isCustomer ? "row-reverse" : "row", overflow: 'visible' }
      ]}>
        <ViewComponent style={[
          { width: s(30), height: s(30) },
          { backgroundColor: NEW_COLOR.CIRCLE_BG },
          commonStyles.dflex,
          commonStyles.alignCenter,
          commonStyles.justifyCenter,
          commonStyles.rounded100
        ]}>
          <ParagraphComponent
            style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.fw600]}
            text={item?.author_name ? item.author_name.substring(0, 2).toUpperCase() : (isCustomer ? "U" : "S")}
          />
          {isCustomer ? (
            <ViewComponent style={{ position: "absolute", right: s(24), top: s(-13) }}>
              <MaterialIcons name="arrow-right" size={s(40)} color={NEW_COLOR.BANNER_BG} />
            </ViewComponent>
          ) : (
            <ViewComponent style={{ position: "absolute", left: s(24), top: s(-13) }}>
              <MaterialIcons name="arrow-left" size={s(40)} color={NEW_COLOR.CHAT_BG} />
            </ViewComponent>
          )}
        </ViewComponent>

        <ViewComponent style={[
          commonStyles.p12,
          commonStyles.flex1,
          {
            backgroundColor: isCustomer ? NEW_COLOR.BANNER_BG : NEW_COLOR.CHAT_BG,
            ...getBubbleRadius(isCustomer),
          },
        ]}>
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mb6]}>
            <ParagraphComponent
              style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}
              text={item?.author_name}
            />
            {item?.created_at && (
              <FormattedDateText
                conversionType={"UTC-to-local"}
                value={item?.created_at}
                dateFormat={dateFormates?.time}
                style={[commonStyles.fs10, commonStyles.fw400, commonStyles.textWhite]}
              />
            )}
          </ViewComponent>
          <ParagraphComponent
            text={item.body}
            style={[commonStyles.fs14, commonStyles.textWhite]}
          />
          {item.attachments && item.attachments.length > 0 && (
            <ViewComponent style={[commonStyles.mt8]}>
              <FilePreviewWithId
                label={""}
                uploadedImageUri={item.attachments[0].contentUrl}
                fileName={item.attachments[0].fileName}
                showImage={true}
              />
            </ViewComponent>
          )}
        </ViewComponent>
      </ViewComponent>
    );
  };
  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container>
        <PageHeader 
          title={"GLOBAL_CONSTANTS.SUPPORT_CHAT"} 
          onBackPress={backArrowButtonHandler}
          onRefresh={onRefresh} isrefresh={true}
        />
        {data.loader && <SwokipayDashboardLoader />}
        {!data.loader && (
          <>
            {data.error && <ErrorComponent message={data.error} screen={true} />}
          {/* Ticket Summary */}
          <ViewComponent 
            style={[
              commonStyles.mb16,
              commonStyles.p12,
                { backgroundColor: NEW_COLOR.CIRCLE_BG , borderRadius: s(8) }
            ]}
          >
            {/* Subject */}
            <ViewComponent style={[commonStyles.mb12]}>
              <TextMultiLanguage 
                text="GLOBAL_CONSTANTS.SUBJECT" 
                style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textGrey, commonStyles.mb4]} 
              />
              <ParagraphComponent 
                text={data.ticket?.subject || "N/A"} 
                style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} 
              />
            </ViewComponent>

            {/* Ticket Details */}
            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.mb12]}>
              <ViewComponent style={[commonStyles.flex1]}>
                <TextMultiLanguage 
                  text="GLOBAL_CONSTANTS.TICKET_NUMBER"
                  style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textGrey, commonStyles.mb4]} 
                />
                <ParagraphComponent 
                  text={data.ticket?.id?.toString() || "N/A"} 
                  style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} 
                />
              </ViewComponent>
              <ViewComponent style={[commonStyles.flex1]}>
                <TextMultiLanguage 
                  text="GLOBAL_CONSTANTS.PRIORITY" 
                  style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textGrey, commonStyles.mb4]} 
                />
                <ParagraphComponent 
                  text={data.ticket?.priority || "N/A"} 
                  style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} 
                />
              </ViewComponent>
              <ViewComponent style={[commonStyles.flex1]}>
                <TextMultiLanguage 
                  text="GLOBAL_CONSTANTS.STATUS" 
                  style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textGrey, commonStyles.mb4]} 
                />
                <ParagraphComponent 
                  text={data.ticket?.status || "N/A"} 
                  style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} 
                />
              </ViewComponent>
            </ViewComponent>
            {/* Created Date */}
            <ViewComponent>
              <TextMultiLanguage 
                text="GLOBAL_CONSTANTS.CREATED_DATE" 
                style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textGrey, commonStyles.mb4]} 
              />
              <FormattedDateText 
                conversionType="UTC-to-local" 
                value={data.ticket?.created_at} 
                style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} 
              />
            </ViewComponent>
          </ViewComponent>

          {/* Messages */}
          <ViewComponent style={[commonStyles.flex1]}>
            {/* Conversation Header */}
            {groupedData.length > 0 && (
              <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.mb16]}>
                
                <ViewComponent style={[commonStyles.dflex,commonStyles.gap10,commonStyles.alignCenter]}>
                  <Ionicons name="headset-outline" size={s(24)} color={NEW_COLOR.TEXT_WHITE} />
                <TextMultiLanguage 
                  text="GLOBAL_CONSTANTS.CONVERSATION" 
                  style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite]} 
                />
                </ViewComponent>
                <ParagraphComponent 
                  text={`${data?.messages?.length || 0} messages`} 
                  style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]} 
                />
              </ViewComponent>
            )}
          
              <FlatList
                inverted={true}
                style={[commonStyles.flex1]}
                data={groupedData.slice().reverse()}
                renderItem={renderMessage}
                keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[commonStyles.p16]}
              />
          </ViewComponent>

          {/* Reply Input */}
         <ViewComponent style={[commonStyles.mt30]}>
              <ButtonComponent title={"GLOBAL_CONSTANTS.REPLY"} onPress={() => handleSendReply()} />
              <ViewComponent style={[commonStyles.mb32]} />
            </ViewComponent>
          </>

        )}
      </Container>
    </ViewComponent>
  );
};

export default SupportChat;