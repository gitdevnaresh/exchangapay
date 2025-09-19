import React, { useEffect, useState } from 'react';
import { View, ScrollView, useWindowDimensions } from 'react-native';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import { Overlay } from 'react-native-elements';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import { commonStyles } from '../../components/CommonStyles';
import RenderHtml from 'react-native-render-html';
import { NEW_COLOR, WINDOW_HEIGHT, WINDOW_WIDTH } from '../../constants/theme/variables';
import OnBoardingService from '../../services/onBoardingservice';
import crashlytics from '@react-native-firebase/crashlytics';
import DefaultButton from '../../components/DefaultButton';
import { ms } from '../../constants/theme/scale';

interface Notify {
    id: string | null,
    tittle: string | null,
    content: string | null
}
const NotifyAlerts = React.memo<{ customerId: string }>(({ customerId }) => {
    const styles = useStyleSheet(themedStyles);
    const { width } = useWindowDimensions();
    const [notifyList, setNotifyList] = useState<Notify[]>([]);
    const [currentNotifyIndex, setCurrentNotifyIndex] = useState(0);
    const [visible, setVisible] = useState<boolean>(false);
    useEffect(() => {
        getNotifies();
    }, [])
    const getNotifies = async () => {
        try {
            const response: any = await OnBoardingService.notifyAlert();
            if (response?.status === 200) {
                if (Array.isArray(response.data) && response.data.length > 0) {
                    setNotifyList(response.data);
                    setVisible(true);
                }
            }
        } catch (err: any) {
            crashlytics().recordError(err);
        }
    };
    const verifiedNotify = async (notifyId: string) => {
        try {
            const notifyObj = {
                "NoteIds": [
                    notifyId
                ]
            }
            const response: any = await OnBoardingService.notifyAlertShowned(notifyObj);

        } catch (err: any) {
            crashlytics().recordError(err);
        }
    };
    const handleNextNotify = (notifyId: string) => {
        if (currentNotifyIndex < notifyList.length - 1) {
            setCurrentNotifyIndex(currentNotifyIndex + 1);
            verifiedNotify(notifyId);
        } else {
            setVisible(false);
            verifiedNotify(notifyId);
        }
    };


    const currentNotify = notifyList.length > 0 ? notifyList[currentNotifyIndex] : [];

    return (
        <>
            {visible && <Overlay
                overlayStyle={[styles.overlayContent, { width: WINDOW_WIDTH - 50, maxHeight: WINDOW_HEIGHT - 100 }]}
                isVisible={visible}
            >
                <ParagraphComponent text='Notes' style={[commonStyles.fs16, commonStyles.fw700, commonStyles.textWhite, commonStyles.textCenter]} />
                <View style={[commonStyles.mb24]} />
                <ParagraphComponent text={currentNotify?.tittle} style={[commonStyles.fs14, commonStyles.fw700, commonStyles.mb8, commonStyles.textWhite]} />

                <ScrollView>
                    {currentNotify.content ? (<>
                        <RenderHtml
                            contentWidth={width}
                            source={{ html: currentNotify.content }}
                            tagsStyles={{ body: { color: NEW_COLOR.TEXT_WHITE, fontSize: ms(12), fontFamily: "PlusJakartaSans-Regular", } }}
                        />
                    </>
                    ) : (
                        <ParagraphComponent text="No content available" style={[commonStyles.fs14, commonStyles.textWhite, commonStyles.fw500, commonStyles.textCenter, commonStyles.mt16, commonStyles.mb16]} />
                    )}
                </ScrollView>
                <View style={[commonStyles.mt22]} />
                <DefaultButton
                    title="Ok"
                    style={undefined}
                    iconArrowRight={false}
                    iconCheck={true}
                    loading={false}
                    disable={undefined}
                    onPress={() => handleNextNotify(currentNotify.id)}
                />
            </Overlay>}
        </>
    );
});

export default NotifyAlerts;

const themedStyles = StyleService.create({
    overlayContent: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderRadius: 10,
        backgroundColor: NEW_COLOR.TEXT_ALWAYS_WHITE,
    },
    readbtn: {
        marginTop: 16,
        padding: 12,
        backgroundColor: NEW_COLOR.BG_ORANGE,
        borderRadius: 8,
        alignItems: 'center',
    },
});
