import React, { useEffect, useState } from 'react';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import { Container, } from '../../components';
import { View, SafeAreaView, ScrollView, TouchableOpacity, BackHandler, Linking } from 'react-native';
import { NEW_COLOR, WINDOW_HEIGHT, WINDOW_WIDTH } from '../../constants/theme/variables';
import { commonStyles } from '../../components/CommonStyles';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import AntDesign from "react-native-vector-icons/AntDesign";
import { formatDateLocal, isErrorDispaly } from '../../utils/helpers';
import NotificationModuleService from '../../services/notification';
import { personalInfoLoader } from '../Profile/skeleton_views';
import Loadding from '../../components/skeleton';
import ErrorComponent from '../../components/Error';
import NoDataComponent from '../../components/nodata';
import { CONSTANTS, NotificationDetails } from './constants';
import RenderHTML from 'react-native-render-html';
import { Overlay } from 'react-native-elements';
import { s } from '../../constants/theme/scale';
import SvgFromUrl from '../../components/svgIcon';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import CardsModuleService from '../../services/card';

const Notifications = React.memo((props: any) => {
    const styles = useStyleSheet(themedStyles);
    const PersonalInfoLoader = personalInfoLoader(10);
    const [notePopVisble, setNotePopVisble] = useState<boolean>(false);
    const [noteHtml, setNoteHtml] = useState<string>("");
    const [allNttDetails, setAllNttDetails] = useState<NotificationDetails[]>([]);
    const [nttLoading, setNttLoading] = useState<boolean>(false);
    const [errormsg, setErrormsg] = useState<string | null>('');
    const navigation = useNavigation();
    const [iconsList, setIconsList] = useState<any>([]);
    const isFocused = useIsFocused();

    useEffect(() => {
        getAllIcons()
        getAllNotificationDetails();
        const backHandler = BackHandler.addEventListener(
            CONSTANTS.HARDWARE_BACK_PRESS, () => {
                handleGoBack();
                return true;
            }
        )
        return () => backHandler.remove();
    }, [isFocused]);


    const handleLinkPress = (href: any) => {
        if (href.startsWith('mailto:')) {
            setNotePopVisble(false);
            Linking.openURL(href).catch(err => console.error("Failed to open email:", err));
        } else if (href.startsWith('https:')) {
            setNotePopVisble(false);
            Linking.openURL(href).catch(err => console.error("Failed to open url:", err));
        } else {
            setNotePopVisble(false);
            navigation.navigate('EditProfile');
        }
    };

    const getAllNotificationDetails = async () => {
        try {
            setNttLoading(true)
            const res: any = await NotificationModuleService.getAllNotification();
            if (res.status === 200) {
                setAllNttDetails(res?.data);
                setNttLoading(false);
                setErrormsg('');
                getPutNotificationCounts();
            } else {
                setNttLoading(false);
                setErrormsg(isErrorDispaly(res));
            }
        } catch (error) {
            setNttLoading(false);
            setErrormsg(isErrorDispaly(error));
        }
    };

    const getPutNotificationCounts = async () => {
        setNttLoading(false)
        let obj = {
            "isRead": true,
            "readDate": new Date()
        }
        try {
            const res: any = await NotificationModuleService.putNotification(obj);
            if (res.status === 200) {
                setNttLoading(false)
                setErrormsg('');
            } else {
                setNttLoading(false)
                setErrormsg(isErrorDispaly(res));
            }
        }
        catch (error) {
            setErrormsg(isErrorDispaly(error));
            setNttLoading(false)
        }
    };

    const handleGoBack = () => {
        props?.navigation.goBack()
    };

    const handleCloseError = () => {
        setErrormsg('');
    };

    const handleOpenNotePopUp = (item: any) => {
        setNoteHtml(item);
        setNotePopVisble(!notePopVisble)
    };


    const truncateHTML = (html: string): string => {
        try {
            const match = html?.match(/<p[^>]*>(.*?)<\/p>/i);
            const text = match ? match[1]?.replace(/<\/?[^>]+(>|$)/g, "").trim() : "";
            return text?.length > 50 ? `${text?.slice(0, 50)}...` : text;
        } catch (error) {
            return "";
        }
    };

    const getAllIcons = async () => {
        try {
            const response = await CardsModuleService.customerTransactionTypes();
            if (response?.ok) {
                setIconsList(response?.data?.CustomerTransactionTypes)
            } else {
                setErrormsg(isErrorDispaly(response))
            }

        } catch (error: any) {
            setErrormsg(isErrorDispaly(error))

        }
    }

    const getIconUrl = (action: string) => {
        let actionKey = action?.trim()
        const icon = iconsList?.find(iconItem => actionKey?.toLowerCase()?.includes(iconItem.name?.toLowerCase()));
        return icon && icon.logo || "https://swokistoragespace.blob.core.windows.net/images/withdraw.svg";
    };

    return (
        <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
            <ScrollView>
                <Container style={commonStyles.container}>
                    <View>
                        <View style={[commonStyles.dflex, commonStyles.mb36, commonStyles.alignCenter, commonStyles.gap10]}>
                            <TouchableOpacity onPress={handleGoBack}>
                                <AntDesign name={CONSTANTS.ARROW_LEFT} size={22} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
                            </TouchableOpacity>
                            <ParagraphComponent style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800]} text={CONSTANTS.NOTIFICATIONS} />
                        </View>
                        {errormsg && <ErrorComponent message={errormsg} onClose={handleCloseError} />}
                        {nttLoading && (
                            <View style={[commonStyles.flex1]}>
                                <Loadding contenthtml={PersonalInfoLoader} />
                            </View>
                        )}
                        {!nttLoading && allNttDetails.length > 0 && (
                            <View style={commonStyles.sectionStyle}>
                                {allNttDetails?.map((item: any, index: any) => {
                                    const truncatedContent = item.notificationType === CONSTANTS.NOTICES && truncateHTML(item?.message);
                                    return (
                                        <View key={item.id} style={commonStyles.flex1}>
                                            {item.notificationType === CONSTANTS.NOTICES && (
                                                <TouchableOpacity style={commonStyles.flex1} onPress={() => handleOpenNotePopUp(item.message)}>
                                                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap12, commonStyles.flex1]}>
                                                        <View style={[styles.circle, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                                                            <SvgFromUrl
                                                                uri={"https://swokistoragespace.blob.core.windows.net/images/Notifications-icon.svg"}
                                                                width={s(26)}
                                                                height={s(24)}

                                                            />
                                                        </View>
                                                        <View style={commonStyles.flex1}>
                                                            <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flex1, commonStyles.gap10]}>
                                                                <ParagraphComponent
                                                                    style={[commonStyles.fs14, commonStyles.fw700, commonStyles.textBlack, commonStyles.flex1]}
                                                                    text={item?.actionBy}
                                                                    numberOfLines={2}
                                                                />
                                                            </View>
                                                        </View>
                                                    </View>
                                                    {index !== allNttDetails.length - 1 && (
                                                        <View style={[styles.hrLine, { marginVertical: 12 }]} />
                                                    )}
                                                </TouchableOpacity>
                                            ) || (
                                                    <View style={commonStyles.flex1}>
                                                        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap12, commonStyles.flex1]}>
                                                            <View>

                                                                <SvgFromUrl
                                                                    uri={getIconUrl(item?.actionBy)}
                                                                    width={s(42)}
                                                                    height={s(42)}
                                                                />
                                                            </View>
                                                            <View style={commonStyles.flex1}>
                                                                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flex1, commonStyles.gap10]}>
                                                                    <ParagraphComponent
                                                                        style={[commonStyles.fs14, commonStyles.fw700, commonStyles.textBlack, commonStyles.flex1]}
                                                                        text={item.actionBy}
                                                                        numberOfLines={2}
                                                                    />
                                                                    <ParagraphComponent
                                                                        style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]}
                                                                        text={formatDateLocal(item.notifiedDate)}
                                                                    />
                                                                </View>
                                                                <ParagraphComponent
                                                                    style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textGrey]}
                                                                    text={item.message}
                                                                />
                                                            </View>
                                                        </View>
                                                        {index !== allNttDetails.length - 1 && (
                                                            <View style={[styles.hrLine, { marginVertical: 12 }]} />
                                                        )}
                                                    </View>
                                                )}
                                        </View>
                                    )
                                })}
                            </View>
                        )}

                        {!nttLoading && allNttDetails.length < 1
                            && (<NoDataComponent Description={CONSTANTS.NO_NOTIFICATION_AVAILABLE} />)}
                    </View>
                </Container>
            </ScrollView>

            {notePopVisble && <Overlay onBackdropPress={handleOpenNotePopUp} overlayStyle={[styles.overlayContent, { width: WINDOW_WIDTH - 50, height: WINDOW_HEIGHT / 2 }]} isVisible={notePopVisble}>
                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.justifyContent, commonStyles.mb14]}>
                    <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw800, commonStyles.textBlack,]} text={CONSTANTS.NOTICE} />

                    <AntDesign onPress={handleOpenNotePopUp} name={CONSTANTS.CLOSE} size={22} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />

                </View>
                <ScrollView>
                    <View style={commonStyles.flex1}>
                        <RenderHTML
                            contentWidth={WINDOW_WIDTH}
                            source={{ html: noteHtml }}
                            tagsStyles={{
                                body: { color: NEW_COLOR.TEXT_BLACK },
                            }}
                            renderersProps={{
                                img: {
                                    enableExperimentalPercentWidth: true
                                }, a: {
                                    onPress: (event, href) => handleLinkPress(href),
                                },
                            }}
                            enableExperimentalMarginCollapsing={true}
                        />

                    </View>

                </ScrollView>


            </Overlay>}
        </SafeAreaView>
    );
});
export default Notifications;

const themedStyles = StyleService.create({
    circle: {
        borderRadius: 36 / 2,
        height: 36,
        width: 36,
        backgroundColor: NEW_COLOR.BG_BLACK
    },
    hrLine: {
        height: 1,
        backgroundColor: 'rgba(133, 133, 133, 0.20)'
    }, overlayContent: {
        paddingHorizontal: s(28),
        paddingVertical: s(24),
        borderRadius: 25, backgroundColor: NEW_COLOR.POP_UP_BG,
    },

});