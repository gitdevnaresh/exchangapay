import React, { useRef, useState } from 'react';
import { StyleSheet, Animated, PanResponder, Modal, TouchableOpacity, Dimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import { NEW_COLOR } from '../../constants/theme/variables';
import { s } from '../../constants/theme/scale';
import KommoChatScreen from './chatscreen';
import { useSelector } from 'react-redux';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import { commonStyles } from '../../components/CommonStyles';
const ICON_DIAMETER = 50;
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const DraggableChatIcon: React.FC = (props) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const [chatVisible, setChatVisible] = useState<boolean>(false);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const insets = useSafeAreaInsets();
    const messagecount = useSelector((state: any) => state.UserReducer?.supportMessgaeCount);
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
            },
            onPanResponderGrant: () => {
                setIsDragging(true);
                pan.setOffset({
                    x: (pan.x as any)._value,
                    y: (pan.y as any)._value,
                });
            },
            onPanResponderMove: Animated.event(
                [
                    null,
                    { dx: pan.x, dy: pan.y }
                ],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: () => {
                setIsDragging(false);
                pan.flattenOffset();
                const currentTranslateX = (pan.x as any)._value;
                const currentTranslateY = (pan.y as any)._value;
                const initialStyledRight = 20;
                const initialStyledBottom = 50;
                const initialCssX = SCREEN_WIDTH - ICON_DIAMETER - initialStyledRight;
                const initialCssY = SCREEN_HEIGHT - ICON_DIAMETER - initialStyledBottom;
                let finalAbsoluteX = initialCssX + currentTranslateX;
                let finalAbsoluteY = initialCssY + currentTranslateY;
                const minX = insets.left;
                const maxX = SCREEN_WIDTH - insets.right - ICON_DIAMETER;
                const minY = insets.top;
                const maxY = SCREEN_HEIGHT - insets.bottom - ICON_DIAMETER;
                finalAbsoluteX = Math.max(minX, Math.min(finalAbsoluteX, maxX));
                finalAbsoluteY = Math.max(minY, Math.min(finalAbsoluteY, maxY));
                const newTranslateX = finalAbsoluteX - initialCssX;
                const newTranslateY = finalAbsoluteY - initialCssY;
                Animated.spring(pan, {
                    toValue: { x: newTranslateX, y: newTranslateY },
                    useNativeDriver: false,
                }).start();
            },
        })
    ).current;

    const handleChatIconPress = async () => {
        if (isDragging) return;
        setChatVisible(true);
    };
    const handleCloseModel = () => {
        setChatVisible(false);
    };


    return (
        <>
            <Animated.View
                style={[styles.chatIcon, { transform: pan.getTranslateTransform() }]}
                {...panResponder.panHandlers}
            >
                <View style={{ position: "absolute", right: 5, top: s(-10) }} >
                    {messagecount > 0 && <ParagraphComponent text={messagecount} style={[styles.notifyBg, commonStyles.textBlack, commonStyles.dflex, commonStyles.alignCenter, commonStyles.textCenter, commonStyles.justifyCenter, commonStyles.fs10, { width: s(18), height: s(18), borderRadius: s(10) }]} />}
                </View>
                <TouchableOpacity
                    style={styles.fullTouchable}
                    activeOpacity={0.7}
                    onPress={handleChatIconPress}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    delayPressIn={0}
                >

                    <AntDesignIcon name="message1" size={s(26)} color="white" />

                </TouchableOpacity>
            </Animated.View>
            <Modal
                visible={chatVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={handleCloseModel}
                statusBarTranslucent={true}
                hardwareAccelerated={true}
            >
                <KommoChatScreen
                    onClose={handleCloseModel}
                    isChatVisible={chatVisible} />
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    chatIcon: {
        position: 'absolute',
        bottom: 70,
        right: 20,
        width: ICON_DIAMETER,
        height: ICON_DIAMETER,
        borderRadius: ICON_DIAMETER / 2,
        backgroundColor: NEW_COLOR.BG_ORANGE,
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: s(44),
        maxHeight: s(44),
        zIndex: 9999,
        elevation: 5,
    }, fullTouchable: {
        width: ICON_DIAMETER,
        height: ICON_DIAMETER,
        borderRadius: ICON_DIAMETER / 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notifyBg: {
        backgroundColor: NEW_COLOR.NOTIFiCATIONS_BG,
    }
});

export default DraggableChatIcon;