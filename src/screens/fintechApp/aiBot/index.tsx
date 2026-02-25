import React, { useState, useEffect, useCallback } from 'react';
import { GiftedChat, IMessage, InputToolbar, Send } from 'react-native-gifted-chat';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { sendMessageToDialogflow } from "../../../apiServices/restApi/googleDialogflowService";
import SafeAreaViewComponent from '../../../components/safeArea/safeArea';
import { useThemeColors } from '../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../components/CommonStyles';
import Container from '../../../components/container/container';
import ViewComponent from '../../../components/view/view';
import WithdrawIcon from '../../../components/svgIcons/mainmenuicons/dashboardwithdraw';


const BOT_USER = {
  _id: 2,
  name: 'Support Bot',
  avatar: 'https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg',
};

const USER = {
  _id: 1,
  name: 'User',
};

const ChatBot = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  useEffect(() => {
    const initialMessage: IMessage = {
      _id: 'initial-message',
      text: 'Hello! I am your assistant. How can I help you?',
      createdAt: new Date(),
      user: BOT_USER,
    };
    setMessages([initialMessage]);
  }, []);

  const handleSend = useCallback(async (newMessages: IMessage[] = []) => {
    const userMessage = newMessages[0];
    if (!userMessage?.text?.trim()) return;

    setMessages(prevMessages => GiftedChat.append(prevMessages, newMessages));
    setIsTyping(true);

    try {
      const fulfillmentText = await sendMessageToDialogflow(userMessage.text);

      const botMessage: IMessage = {
        _id: `bot-${Date.now()}-${Math.random()}`,
        text: fulfillmentText || 'I didn\'t understand that. Can you please rephrase?',
        createdAt: new Date(),
        user: BOT_USER,
      };

      setMessages(prevMessages => GiftedChat.append(prevMessages, [botMessage]));
    } catch (error) {
      const errorMessage: IMessage = {
        _id: `error-${Date.now()}`,
        text: 'Sorry, I encountered an error. Please try again.',
        createdAt: new Date(),
        user: BOT_USER,
      };
      setMessages(prevMessages => GiftedChat.append(prevMessages, [errorMessage]));
    } finally {
      setIsTyping(false);
    }
  }, []);

  const renderInputToolbar = (props: any) => (
    <ViewComponent style={[commonStyles.mt30]}>
      <InputToolbar
        {...props}
        containerStyle={[
          commonStyles.bgBlack,


        ]}

        textInputStyle={[commonStyles.textWhite, commonStyles.mt10]}
      />
    </ViewComponent>
  );

  // Remove border/background from send button
  const renderSend = (props: any) => (
    <Send {...props}>
      <ViewComponent style={{
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        width: 40,
        marginRight: 4,
        borderWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
      }}>
        <ViewComponent style={{ transform: [{ rotate: '90deg' }] }}>
          <WithdrawIcon />
        </ViewComponent>

      </ViewComponent>
    </Send>
  );

  return (
    <SafeAreaViewComponent style={commonStyles.screenBg}>
      <KeyboardAvoidingView
        style={commonStyles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <Container style={commonStyles.screenBg}>
          <GiftedChat
            messages={messages}
            onSend={handleSend}
            user={USER}
            isTyping={isTyping}
            showAvatarForEveryMessage
            renderAvatarOnTop
            alwaysShowSend
            renderSend={renderSend}
            keyboardShouldPersistTaps="handled"
            placeholder="Type a message..."
            scrollToBottomComponent={() => null}
            renderInputToolbar={renderInputToolbar}
          />
        </Container>
      </KeyboardAvoidingView>
    </SafeAreaViewComponent>
  );
};

const screenStyles = (NEW_COLOR: any) => StyleSheet.create({
  inputPrimary: {

    fontSize: 16,
    minHeight: 40,
    alignItems: 'center',
  },
  sendButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 40,
    marginRight: 4,
    backgroundColor: 'transparent',
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
});

export default ChatBot;
