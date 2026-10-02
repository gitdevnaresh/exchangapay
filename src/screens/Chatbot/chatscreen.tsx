import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, TouchableWithoutFeedback, Image } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useDispatch, useSelector } from 'react-redux';
import useEncryptDecrypt from '../../hooks/useEncryption_Decryption';
import { KommoChatAPI } from '../../services/chatService';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import { NEW_COLOR } from '../../constants/theme/variables';
import { s } from '../../constants/theme/scale';
import { commonStyles } from '../../components/CommonStyles';
import ErrorComponent from '../../components/Error';
import { formatTimestamp, isErrorDispaly } from '../../utils/helpers';
import { ChatIcon, SendIcon } from '../../assets/svg';
import { updateChatCount } from '../../redux/Actions/UserActions';
import { Container } from '../../components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import ProfileService from '../../services/profile';
import { PROFILE_CONSTANTS } from '../Profile/constants';
import { downloadImage } from '../../utils/tools';
import { LIST_PERF_CHAT } from '../../constants/listPerformance';

const SUPPORT_DISPLAY_NAME = 'Exchanga Pay Support';
const SUPPORT_AMOJO_ID = '3e580f1e-99e4-48e1-b95c-3ba4850bee86';
const IMAGE_RETRY_LIMIT = 5;
const IMAGE_RETRY_DELAY_MS = 3000;

// Image never retries on its own after a failed load, and freshly sent media can
// 404 briefly while Kommo processes it. Remounting via `key` re-requests it.
const ChatImage = ({ uri, style }: { uri: string, style: any }) => {
    const [attempt, setAttempt] = useState(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        setAttempt(0);
    }, [uri]);
    useEffect(() => () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);
    const handleError = () => {
        if (attempt >= IMAGE_RETRY_LIMIT) return;
        timerRef.current = setTimeout(() => setAttempt(a => a + 1), IMAGE_RETRY_DELAY_MS);
    };
    return <Image key={`${uri}-${attempt}`} style={style} source={{ uri }} onError={handleError} />;
};


const KommoChatScreen = (props: any) => {
    const [chatAPI, setChatAPI] = useState(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState<any>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSending, setIsSending] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<any>(null);
    const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);
    const messagecount = useSelector((state: any) => state.UserReducer?.supportMessgaeCount);
    const flatListRef = useRef<FlatList>(null);
    // Set once /Chats has answered. History waits for it: /Chats creates the
    // customer's row on the backend, and the poll closes over a stale currentChatId.
    const chatIdRef = useRef<string | null>(null);
    // Messages we sent that history hasn't returned yet. Kommo processes media
    // asynchronously, so a fresh image is missing from the next history call and
    // would vanish from the list until the following refresh.
    const pendingRef = useRef<any[]>([]);
    // Server message id -> the URL we uploaded. Kommo re-hosts the picture and
    // its copy 404s for a few seconds, so our own uploads keep our URL.
    const localImageByIdRef = useRef<Map<string, string>>(new Map());
    // Every message id history has returned so far.
    const seenIdsRef = useRef<Set<string>>(new Set());
    const { decryptAES } = useEncryptDecrypt();
    const [inputKey, setInputKey] = useState(0);
    const dispatch = useDispatch();
    const [filePreview, setFilePreview] = useState<{ uri: string, type: string } | null>(null);
    const user = {
        id: userInfo?.id || 'user123',
        name: decryptAES(userInfo?.userName) || 'John Doe',
        email: decryptAES(userInfo?.email) || 'john@example.com',
        phone: decryptAES(userInfo?.phoneNo) || '+1234567890',
        profile: userInfo?.imageURL || ""
    };
    const api = new KommoChatAPI();

    useEffect(() => {
        // initializeChat loads the history once /Chats has answered.
        initializeChat();
        updateMessageCount();
    }, []);
    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval> | null = null;
        if (props?.isChatVisible) {
            intervalId = setInterval(() => {
                if (props?.isChatVisible) {
                    getChatHistory();
                }
            }, 60000);
        }
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [props?.isChatVisible]);

    useEffect(() => {
        if (props?.isChatVisible) {
            getChatHistory();
        }
    }, [messagecount, props?.isChatVisible]);

    useEffect(() => {
        if (flatListRef.current && messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 500);
        }
    }, [messages]);
    const updateMessageCount = async () => {
        dispatch(updateChatCount(0));
        await AsyncStorage.setItem('supportMessageCount', '0');

    };
    const handleSend = async () => {
        if (selectedImage) {
            await sendImageMessage();
        } else if (inputText.trim()) {
            await sendMessage();
        }
    };

    const initializeChat = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await api.connectChannel();
            setIsConnected(true);
            const chatResponse = await api.createChat(user);
            chatIdRef.current = chatResponse?.id || null;
            setCurrentChatId(chatResponse.id);
            setChatAPI(api);
            await getChatHistory();
        } catch (error: any) {
            setError(error.message);
            Alert.alert('Connection Error', error.message, [
                { text: 'Retry', onPress: initializeChat },
                { text: 'Cancel', onPress: props?.close || props?.onClose }
            ]);
        } finally {
            setIsLoading(false);
        }
    };
    const sendImageMessage = async () => {
        if (!selectedImage || isSending || !chatAPI || !currentChatId) return;
        const tempId = Date.now().toString();
        const tempMessage = {
            id: tempId,
            text: inputText.trim(),
            timestamp: new Date(),
            isOutgoing: true,
            isTemp: true,
            isIncoming: false,
            sender: { name: decryptAES(userInfo?.userName) || 'You' },
            type: 'picture',
            image: selectedImage,
            media: selectedImage,
        };

        setMessages(prev => [...prev, tempMessage]);
        setIsSending(true);
         setInputText('');
        setInputKey(prev => prev + 1);
        try {
            const messageConfig = {
                type: 'picture',
                text: inputText.trim(),
                media: selectedImage, // Send the public URL to Kommo
                name: decryptAES(userInfo?.firstName)+" " + decryptAES(userInfo?.lastName) || decryptAES(userInfo?.email) || 'You',
                imageUrl: decryptAES(userInfo?.imageUrl) || user.profile,
                phone: decryptAES(userInfo?.phoneNo) || user.phone,
                email: decryptAES(userInfo?.email) || user.email,
                senderId: userInfo?.id,
            };
            setSelectedImage(null);
            const result: any = await api.sendUserMessage(messageConfig);
            if (result?.success) {
                if (result?.data.new_message && result.data?.new_message.conversation_id) {
                    setMessages(prev => prev?.map(msg =>
                        msg?.id === tempMessage?.id
                            ? {
                                ...msg,
                                conversation_id: result?.data?.new_message?.conversation_id || currentChatId,
                                ref_id: result.data?.new_message.ref_id,
                                sender_id: result.data?.new_message.sender_id,
                                isTemp: false
                            }
                            : msg
                    ));
                };
                trackPending(tempMessage, result);
                await getChatHistory();
                setIsSending(false);
            } else {
                setIsSending(false);
                setMessages(prev => prev.filter(msg => msg.id !== tempId));
                setError(isErrorDispaly(result.error));
            }

        } catch (error: any) {
            setIsSending(false);
            setMessages(prev => prev.filter(msg => msg.id !== tempId));
            setError(isErrorDispaly(error.message));
        }
    };


    const formatApiMessage = (apiMessage: any) => {
        const message = apiMessage.message || {};
        const sender = apiMessage.sender || {};
        const receiver = apiMessage.receiver || {};
        const isUserMessage = !!userInfo?.id && sender?.client_id === userInfo?.id;
        // Trust is decided by server-assigned identity, never by the display name
        // (VAPT L-19): amojo stamps client_id on every message sent through a
        // client channel, so only Kommo-side agents/bots come back without one.
        const isSupportMessage = !isUserMessage && (
            sender?.id === SUPPORT_AMOJO_ID ||
            (typeof sender?.id === 'string' && sender.id.length > 0 && !sender?.client_id)
        );
        const hasContent = message.text || message.media;
        if (!hasContent) return null;
        return {
            id: message.id || apiMessage.id || `msg_${Date.now()}_${Math.random()}`,
            text: message.text,
            image: message.media || message.thumbnail,
            timestamp: new Date(
                apiMessage.timestamp ? apiMessage.timestamp * 1000 : apiMessage.msec_timestamp || Date.now()
            ),
            isOutgoing: isUserMessage,
            isIncoming: isSupportMessage,
            sender,
            receiver,
            avatar: sender?.avatar || "",
            type: message.type || 'text',
        };
    };

    const PENDING_TTL_MS = 5 * 60 * 1000;
    const trackPending = (tempMessage: any, result: any) => {
        pendingRef.current.push({
            ...tempMessage,
            isTemp: false,
            msgId: result?.data?.new_message?.msgid,
            // Ids already in history when this was sent can't be its echo. Used
            // instead of timestamps, which break when the device clock is off.
            seenIds: new Set(seenIdsRef.current),
        });
    };

    // Pictures ignore text: Kommo may rewrite a picture's text.
    const isSameMessage = (server: any, local: any) =>
        (!!local.msgId && server.id === local.msgId) || (
            server.isOutgoing &&
            server.type === local.type &&
            (local.type === 'picture' || (server.text || '').trim() === (local.text || '').trim()) &&
            !local.seenIds.has(server.id)
        );

    const mergePendingMessages = (serverMessages: any[]) => {
        const now = Date.now();
        const stillPending: any[] = [];
        const matchedIds = new Set<string>();
        for (const local of pendingRef.current) {
            const match = serverMessages.find(m => !matchedIds.has(m.id) && isSameMessage(m, local));
            if (match) {
                matchedIds.add(match.id);
                if (local.image) localImageByIdRef.current.set(match.id, local.image);
            } else if (now - new Date(local.timestamp).getTime() < PENDING_TTL_MS) {
                stillPending.push(local);
            }
        }
        pendingRef.current = stillPending;
        const withLocalImages = serverMessages.map(m => {
            const localImage = localImageByIdRef.current.get(m.id);
            return localImage ? { ...m, image: localImage } : m;
        });
        return [...withLocalImages, ...stillPending];
    };

    const getChatHistory = async () => {
        try {
            // The backend reads the conversation from its own table, so history
            // loads straight after login and nothing is stored on the device.
            if (!chatIdRef.current) return;
            const chatHistory = await api.sendSignedGetRequest();
            if (chatHistory?.success) {
                // amojo answers 204 with an empty body when the conversation
                // has no messages, so `messages` can be missing.
                const apiMessages = Array.isArray(chatHistory.data?.messages) ? chatHistory.data.messages : [];
                const formattedMessages = apiMessages.map(formatApiMessage).filter(Boolean);
                const merged = mergePendingMessages(formattedMessages);
                formattedMessages.forEach((m: any) => seenIdsRef.current.add(m.id));
                merged.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                setMessages(merged);
                updateMessageCount();
            } else {
                setError(isErrorDispaly(chatHistory.error));
                setMessages([]);
            }
        } catch (error: any) {
            setError(isErrorDispaly(error.message));
        }
    };

    const sendMessage = async () => {
        if (!inputText.trim() || isSending || !chatAPI || !currentChatId) return;
        const messageText = inputText.trim();
        const tempMessage = {
            id: Date.now().toString(),
            text: messageText,
            timestamp: new Date(),
            isOutgoing: true,
            isIncoming: false,
            isTemp: true,
            sender: { name: decryptAES(userInfo?.userName) || 'You', id: userInfo?.id || 'user123' },
            type: 'text'
        };
        setInputText('');
        setInputKey(prev => prev + 1);
        setIsSending(true);
        const messageConfig = {
            text: messageText,
            type: 'text',
            name: decryptAES(userInfo?.firstName) +" "+ decryptAES(userInfo?.lastName) || decryptAES(userInfo?.email) || 'You',
            imageUrl: decryptAES(userInfo?.imageUrl) || user.profile,
            phone: decryptAES(userInfo?.phoneNo) || user.phone,
            email: decryptAES(userInfo?.email) || user.email,
            senderId: userInfo?.id
        }
        try {
            const result: any = await api.sendUserMessage(messageConfig);
            if (result?.success) {
                setMessages(prev => [...prev, tempMessage]);
                if (result?.data.new_message && result.data?.new_message.conversation_id) {
                    setMessages(prev => prev?.map(msg =>
                        msg?.id === tempMessage?.id
                            ? {
                                ...msg,
                                conversation_id: result?.data?.new_message?.conversation_id || currentChatId,
                                ref_id: result.data?.new_message.ref_id,
                                sender_id: result.data?.new_message.sender_id,
                                isTemp: false
                            }
                            : msg
                    ));
                }
                trackPending(tempMessage, result);
                getChatHistory();
            } else {
                setError(isErrorDispaly(result.error));
            }
        } catch (error: any) {
            setInputText(messageText);
            setError(isErrorDispaly(error.message));
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e: any) => {
        if (e.nativeEvent.key === 'Enter') {
           handleSend();
        }
    };



    const renderMessage = ({ item }: { item: any }) => {
        const hasText = item.text && item.text.trim().length > 0;
        const isImage = (item.type === "picture" || item?.sender.type === "picture") && item.image;
        if (!hasText && !isImage) return null;

        const isOutgoing = item.isOutgoing === true;
        // The support label comes from the verified flag, not the sender-supplied name.
        const senderLabel = isOutgoing ? item.sender?.name : item.isIncoming ? SUPPORT_DISPLAY_NAME : 'Unverified sender';

        return (
            <View style={[styles.messageContainer, isOutgoing ? styles.incomingMessage : styles.outgoingMessage, item.isTemp && styles.tempMessage, { alignSelf: isOutgoing ? 'flex-end' : 'flex-start' }]} >
                <View >
                    <ParagraphComponent text={senderLabel} style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textAlwaysWhite]} />
                    <View>
                        {hasText && (
                            <ParagraphComponent text={item.text} style={[styles.messageText, commonStyles.textAlwaysWhite]} />
                        )}
                        {isImage && (
                            <TouchableOpacity onPress={() => setFilePreview({ uri: item.image || item.avatar, type: 'image' })}>
                                <ChatImage style={[commonStyles.mt10, { minWidth: s(150), minHeight: s(150), borderRadius: s(8) }]} uri={item.image || item.avatar} />
                            </TouchableOpacity>
                        )}
                        <View style={styles.messageFooter}>
                            <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
                            {item.isTemp && (
                                <ActivityIndicator
                                    size="small"
                                    color={isOutgoing ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)'}
                                    style={styles.sendingIndicator}
                                />
                            )}
                        </View>
                    </View>
                </View>
            </View>
        );
    };
    if (isLoading) {
        return (
            <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
                <View style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <ParagraphComponent text={"Connecting to chat... "} style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textAlwaysWhite]} />
                    {error && <ParagraphComponent style={[styles.errorText]} text={error} />}
                </View>
            </SafeAreaView>
        );
    };
    const handleCloseError = () => {
        setError(null);
    };

    const handleClosePreview = () => {
        setFilePreview(null);
    };

    const acceptedExtensions = ['.jpg', '.jpeg', '.png'];
    const verifyFileTypes = (fileName: string) => {
        const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
        return acceptedExtensions.includes(extension);
    };

    const verifyFileSize = (fileSize: any) => {
        const maxSizeInBytes = 20 * 1024 * 1024;
        return fileSize <= maxSizeInBytes;
    };
    const handleChooseImage = async () => {
        try {
            setIsUploading(true);
            const result = await launchImageLibrary({ mediaType: 'photo' });

            if (result.didCancel || !result.assets || result.assets.length === 0) {
                setIsUploading(false);
                return;
            }

            const asset = result.assets[0];
            const isValid = verifyFileTypes(asset.fileName);
            const isValidSize = verifyFileSize(asset.fileSize);

            if (isValid && isValidSize) {
                let formData = new FormData();
                formData.append('document', {
                    uri: asset.uri,
                    type: asset.type,
                    name: asset.fileName,
                });
                const uploadRes = await ProfileService.uploadFile(formData);
                if (uploadRes.status === 200 && uploadRes.data && uploadRes.data.length > 0) {
                    setSelectedImage(uploadRes.data[0]);
                } else {
                    setError(isErrorDispaly(uploadRes));
                }
            } else {
                if (!isValid) {
                    setError(PROFILE_CONSTANTS.ACCEPTS_ONLY_JPG_OR_PNG_FPRMAT);
                } else if (!isValidSize) {
                    setError(PROFILE_CONSTANTS.IMAGE_SIZE_SHOULD_BE_LESS_THAN_20MB);
                }
            }
        } catch (err) {
            setError(isErrorDispaly(err));
        } finally {
            setIsUploading(false);
        }
    };
    const handleDownload = async (uri: string) => {
        setIsDownloading(true);
        try {
            await downloadImage(uri);
            setIsDownloading(false);
        } catch (e) {
            setError(isErrorDispaly(e));
            setIsDownloading(false);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
            <KeyboardAvoidingView style={[commonStyles.flex1, commonStyles.screenBg]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
                <View style={[commonStyles.orangeSection, commonStyles.p12, commonStyles.mb14,]}>
                    <View style={[commonStyles.dflex, commonStyles.justifyContent]}>
                        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                            <ChatIcon width={s(24)} height={s(24)} />
                            <View style={[]}>
                                <ParagraphComponent style={[commonStyles.fs18, commonStyles.fw700, commonStyles.textAlwaysWhite]} text={SUPPORT_DISPLAY_NAME} />
                                <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textAlwaysWhite]} text={isConnected ? 'Connected' : 'Offline'} />
                            </View>

                        </View>
                        <TouchableOpacity onPress={props?.onClose || props?.close} style={styles.closeButton}>
                            <AntDesign name="close" size={22} color={NEW_COLOR.TEXT_ALWAYS_WHITE} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View>
                    {error && <ErrorComponent message={error} onClose={handleCloseError} />}
                </View>
                {messages && messages?.length > 0 && (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(item, index) => item.id || index.toString()}
                        contentContainerStyle={{ paddingHorizontal: s(10), paddingBottom: s(16) }}
                        showsVerticalScrollIndicator={false}
                        onContentSizeChange={() => {
                            if (messages.length > 0) {
                                flatListRef.current?.scrollToEnd({ animated: true });
                            }
                        }}
                        // Message bubbles are variable height (text vs
                        // image), so window capping only — no getItemLayout.
                        // Clipping stays off: this list is auto-scrolled to the
                        // end and clipped cells show up as blank bubbles.
                        {...LIST_PERF_CHAT}
                    />
                ) || (
                        <View style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                            <ParagraphComponent style={[commonStyles.fs18, commonStyles.mt16, commonStyles.fw600, commonStyles.textGrey]} text={"No messages yet"} />
                        </View>
                    )}
                <View style={styles.inputContainer}>
                    {selectedImage && (
                        <View style={styles.previewContainer}>
                            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                            <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.previewCloseButton} >
                                <AntDesign name="closecircle" size={s(22)} color="white" style={styles.previewCloseIcon} />
                            </TouchableOpacity>
                        </View>
                    )}
                    <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap10]}>
                        <View style={[styles.inputWrapper, commonStyles.flex1, {
                            borderWidth: 1, borderColor: NEW_COLOR.DASHED_BORDER_STYLE,
                            borderRadius: s(8), paddingLeft: s(16),padding: Platform.OS === 'ios' ? 10 : 0
                        }]}>
                            <TouchableOpacity onPress={handleChooseImage} disabled={isUploading || isSending || !!selectedImage} style={styles.clipButton}>
                                {isUploading
                                    ? <ActivityIndicator size="small" color="#ccc" />
                                    : <AntDesign name="paperclip" size={s(22)} color={!!selectedImage ? "#ccc" : "#fff"} />
                                }
                            </TouchableOpacity>
                            <TextInput
                            style={[commonStyles.fs16,commonStyles.textAlwaysWhite,styles.chatInput]}
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder="Type a message..."
                                placeholderTextColor="#999"
                                multiline
                                maxLength={1000}
                                key={inputKey}
                                editable={!isSending && !isUploading}
                                onKeyPress={handleKeyPress}
                            />
                        </View>
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={!isConnected || (!inputText.trim() && !selectedImage) || isSending}
                            style={[styles.sendButton, (!inputText.trim() && !selectedImage) && styles.sendButtonDisabled]}
                        >
                            {isSending ? <ActivityIndicator size="small" color="white" /> : <SendIcon width={s(22)} height={s(22)} />}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
            <Modal visible={!!filePreview} onRequestClose={handleClosePreview} animationType="slide" transparent={true}>
                <SafeAreaProvider>
                <Container style={[commonStyles.container]}>
                    <TouchableWithoutFeedback>
                        <View style={[commonStyles.screenBg, commonStyles.flex1]}>
                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap16,commonStyles.mt30]}>
                                <AntDesign name="close" size={22} color={NEW_COLOR.TEXT_ALWAYS_WHITE} onPress={handleClosePreview} />
                                <TouchableOpacity onPress={() => handleDownload(filePreview?.uri)}>
                                <View style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter, { width: s(36), height: s(36) }, commonStyles.bgCard, commonStyles.rounded24]}>
                                    {isDownloading ? (
                                        <ActivityIndicator size="small" color={NEW_COLOR.TEXT_ALWAYS_WHITE} />
                                    ) : (
                                        <AntDesign name="download" size={16} color={NEW_COLOR.TEXT_ALWAYS_WHITE}  />
                                    )}
                                </View>
                                </TouchableOpacity>
                            </View>
                            <View style={[commonStyles.flex1, commonStyles.screenBg, commonStyles.justifyCenter, commonStyles.alignCenter]}>
                                {filePreview?.type === 'image' && (
                                    <Image source={{ uri: filePreview.uri }} style={{ width: "90%", height: "90%", resizeMode: 'contain' }} />
                                )}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Container>
                </SafeAreaProvider>
            </Modal>
        </SafeAreaView>
    );
};



const styles = StyleSheet.create({
    errorText: {
        marginTop: s(12),
        fontSize: s(14),
        color: '#FF3B30',
        textAlign: 'center',
        paddingHorizontal: s(20),
    },
    closeButton: {
        padding: s(8),
        paddingRight: s(16),
        borderRadius: s(20),
    },

    messageContainer: {
        maxWidth: '80%',
        padding: s(12),
        marginVertical: s(4),
        borderRadius: s(8),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    outgoingMessage: {
        backgroundColor: NEW_COLOR.MENU_CARD_BG,
        alignSelf: 'flex-end',
        minWidth: s(200)
    },
    incomingMessage: {
        backgroundColor: NEW_COLOR.SECTION_BG,
        alignSelf: 'flex-start', minWidth: s(200)
    },
    tempMessage: {
        opacity: 0.7,
    },
    messageText: {
        fontSize: s(14),
        lineHeight: 22,
        fontWeight: '400',
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: s(4),
        alignSelf: 'flex-end',
    },
    timestamp: {
        fontSize: s(10),
        fontWeight: '500',
        color: '#ffffff',
    },
    sendingIndicator: {
        marginLeft: s(6),
    },
    inputContainer: {
        backgroundColor: '#1A051D',
        paddingHorizontal: s(10),
        paddingVertical: s(12),
        borderTopWidth: 1,
        borderTopColor: NEW_COLOR.DASHED_BORDER_STYLE,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    // Fixed width (flex: 1) so the input doesn't resize on every keystroke
    // while the text is still on the first line — that resize was the flicker.
    chatInput: {
        flex: 1,
        marginLeft: s(10),
        maxHeight: s(120),
    },
    textInput: {
        color: '#ffffff',
        fontSize: s(16),
        textAlign:"center"
    },
    sendButton: {
        width: s(44),
        height: s(44),
        borderRadius: s(44) / 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#007AFF', 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    clipButton: {
        alignSelf: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#555'
    },
    previewContainer: {
        paddingLeft: s(8),
        paddingBottom: s(8),
        position: 'relative',
        alignSelf: 'flex-start'
    },
    previewImage: {
        width: s(80),
        height: s(80),
        borderRadius: s(8)
    },
    previewCloseButton: {
        position: 'absolute',
        top: -s(4),
        right: -s(4),
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: s(12)
    },
    previewCloseIcon: {
        padding: s(2)
    },
});

export default KommoChatScreen;