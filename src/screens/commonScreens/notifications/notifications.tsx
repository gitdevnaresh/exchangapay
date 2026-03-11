import React, { useEffect, useRef, useState } from 'react';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import { TouchableOpacity } from 'react-native';
import { ms, s } from '../../../constants/theme/scale';
import { formatDateTimes, isErrorDispaly } from '../../../utils/helpers';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SvgUri } from 'react-native-svg';
import { Icons, Notification } from './interfaces';
import FlatListComponent from '../../../newComponents/flatList/flatList';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import RBSheet from 'react-native-raw-bottom-sheet';
import TextMultiLangauge from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { useThemeColors } from '../../../hooks/useThemeColors';
import ViewComponent from '../../../newComponents/view/view';
import { iconsLists } from '../../../constants/coinsList/coinsLIst';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import { MainStackParamList } from '../../profile/profileTypes';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import Container from '../../../newComponents/container/container';
import NoDataComponent from '../../../newComponents/noData/noData';
import NotificationService from '../../../services/notificationService';
import SwokipayDashboardLoader from '../../../newComponents/swokipayloader';
import PopupOrSheet from '../../../newComponents/models/PopupOrSheet';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import { COMMON_SVG_URLS } from '../../../assets/blobUrls';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';
import notifee from '@notifee/react-native';
// Extracted ItemSeparatorComponent
const NotificationItemSeparator = React.memo(() => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    return <ViewComponent style={[commonStyles.menuitemspace]} />;
});

const Notifications = React.memo(() => {
    const styles = useStyleSheet(themedStyles);
    const [allNotificationsList, setAllNotificationsList] = useState<Notification[]>([]);
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const isFocused = useIsFocused();
    const [notificationDetails, setNotificationDetails] = useState<Notification | undefined>();
    const [loading, setLoading] = useState<boolean>(true);
    const rbSheetRef = useRef<RBSheet | null>(null);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [iconsList, setIconsList] = useState<Icons[]>([]);
    const REVERSE_NEW_COLOR = useThemeColors(true);
    const reverseCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
    const [isIconsLoading, setIsIconsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        setError("");
        if (isFocused) {
            getAllIcons();
            fetchNotifications();
        }
    }, [isFocused]);

    useHardwareBackHandler(() => {
        handleDashBoard();
        return true;
    });

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response: any = await NotificationService.getAllNotifications();
            if (response.status === 200) {
                setAllNotificationsList(response?.data ?? []);
                await getPutNotificationCounts();
            } else {
                setError(isErrorDispaly(response));
                setAllNotificationsList([]);
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        } finally {
            setLoading(false);

        }
    };

    const getPutNotificationCounts = async () => {
        let obj = {
            "isRead": true,
            "readDate": new Date()
        }
        try {
            const res: any = await NotificationService.putNotification(obj);
            if (res.status == 200) {
                await notifee.setBadgeCount(0);
            } else {
                setError(isErrorDispaly(res));

            }
        }
        catch (error) {
            setError(isErrorDispaly(error));
        }
    };

    const selectedNotification = (item: Notification) => {
        rbSheetRef?.current && rbSheetRef?.current?.open();
        setNotificationDetails(item);
    };

    const handleDashBoard = () => {
        navigation.goBack();
    };
    const getAllIcons = async () => {
        setIsIconsLoading(true);
        try {
            const response: any = await NotificationService.customerTransactionTypes();
            if (response?.ok) {
                setIconsList(response?.data?.CustomerTransactionTypes);
                setIsIconsLoading(false);
            } else {
                setIsIconsLoading(false);
                setError(isErrorDispaly(response));
            }

        } catch (error: any) {
            setIsIconsLoading(false);
            setError(isErrorDispaly(error));

        }
    };
    const getIconUrl = (action: any) => {
        let actionKey = action?.trim()
        const icon = iconsList?.find(iconItem => actionKey?.toLowerCase()?.includes(iconItem.name?.toLowerCase()));
        return icon && icon.logo || COMMON_SVG_URLS.WITHDRAW_ICON;
    };
    const renderNotificationItem = ({ item, index }: { item: Notification, index: number }) => (
        <ViewComponent key={index}>
            <ViewComponent style={[commonStyles.transactionsCard]}>
                <TouchableOpacity onPress={() => selectedNotification(item)}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                        <ViewComponent style={styles.notifyIcon}>
                            {iconsLists[item?.action?.toLowerCase()?.replaceAll(" ", "") as keyof typeof iconsLists] ||
                                <SvgUri style={[commonStyles.mxAuto]} width={s(40)} height={s(40)}
                                    uri={getIconUrl(item?.actionBy)} />
                            }
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.mb2, commonStyles.justifyContent, commonStyles.gap8]}>
                                <ParagraphComponent
                                    style={[commonStyles.fs14, commonStyles.textWhite, commonStyles.fw500, commonStyles.flex1]}
                                    text={item?.actionBy}
                                    numberOfLines={1}
                                />
                                <ParagraphComponent
                                    style={[commonStyles.fs12, commonStyles.textlinkgrey, commonStyles.fw400]}
                                    text={formatDateTimes(item?.notifiedDate)}
                                />
                            </ViewComponent>
                            <ParagraphComponent
                                style={[commonStyles.fs12, commonStyles.textlinkgrey, commonStyles.fw400]}
                                text={item?.message}
                            />
                        </ViewComponent>
                    </ViewComponent>
                </TouchableOpacity>
            </ViewComponent>
        </ViewComponent>
    );

    const notificationDetailsContent = (
        <ViewComponent>
            <ViewComponent style={[reverseCommonStyles.justifyCenter, reverseCommonStyles.alignCenter, reverseCommonStyles.mb8, reverseCommonStyles.gap6]}>
                <ViewComponent style={{ minHeight: s(50), minWidth: s(50) }}>
                    {(notificationDetails?.action
                        ? iconsLists[notificationDetails?.action?.toLowerCase()?.replaceAll(" ", "") as keyof typeof iconsLists]
                        : undefined) ||
                        <SvgUri style={[reverseCommonStyles.mxAuto]} width={s(50)} height={s(50)}
                            uri={getIconUrl(notificationDetails?.actionBy)} />
                    }
                </ViewComponent>
                <ParagraphComponent
                    text={notificationDetails?.actionBy ?? ""}
                    style={[reverseCommonStyles.textWhite, reverseCommonStyles.fs16, reverseCommonStyles.fw600]}
                />
            </ViewComponent>
            <ViewComponent>
                <ParagraphComponent
                    text={notificationDetails?.message ?? ""}
                    style={[reverseCommonStyles.textAlwaysBlack, reverseCommonStyles.textCenter, reverseCommonStyles.fs14, reverseCommonStyles.fw400]}
                />
                <ViewComponent style={[reverseCommonStyles.mb10]} />
                <TextMultiLangauge
                    text={"GLOBAL_CONSTANTS.ADDITIONAL_DETAILS"}
                    style={[reverseCommonStyles.textAlwaysBlack, reverseCommonStyles.textCenter, reverseCommonStyles.mb4, reverseCommonStyles.fs14, reverseCommonStyles.fw600]}
                />
                {/* <ViewComponent style={[reverseCommonStyles.mb4, reverseCommonStyles.justifyCenter, reverseCommonStyles.gap2]}>
                    <TextMultiLangauge
                        text={"GLOBAL_CONSTANTS.TRANSACTION_ID"}
                        style={[reverseCommonStyles.textlinkgrey, reverseCommonStyles.textCenter, reverseCommonStyles.fs14, reverseCommonStyles.fw400]}
                    />
                    <ParagraphComponent
                        text={notificationDetails?.transactionId ?? notificationDetails?.id ?? ""}
                        style={[reverseCommonStyles.textAlwaysBlack, reverseCommonStyles.textCenter, reverseCommonStyles.fs14, reverseCommonStyles.fw500]}
                    />
                </ViewComponent> */}
                <ViewComponent style={[reverseCommonStyles.dflex, reverseCommonStyles.mb8, reverseCommonStyles.justifyCenter, reverseCommonStyles.gap2]}>
                    <TextMultiLangauge
                        text={"GLOBAL_CONSTANTS.DATE"}
                        style={[reverseCommonStyles.textlinkgrey, reverseCommonStyles.textCenter, reverseCommonStyles.fs14, reverseCommonStyles.fw400]}
                    />
                    <ParagraphComponent
                        text={formatDateTimes(notificationDetails?.notifiedDate) || ""}
                        style={[reverseCommonStyles.textGrey, reverseCommonStyles.textCenter, reverseCommonStyles.fs14, reverseCommonStyles.fw400]}
                    />
                </ViewComponent>
            </ViewComponent>
        </ViewComponent>
    );

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container>
                <PageHeader title={"GLOBAL_CONSTANTS.NOTIFICATIONS"} onBackPress={handleDashBoard} />
                {error && <ErrorComponent message={error} screen={true} />}
                {(() => {
                    if (loading || isIconsLoading) {
                        return <SwokipayDashboardLoader />;
                    } else if (!loading && allNotificationsList?.length === 0) {
                        return <NoDataComponent />;
                    } else {
                        return (
                            <FlatListComponent
                                data={allNotificationsList}
                                renderItem={renderNotificationItem}
                                keyExtractor={(item: Notification) => item.id}
                                onEndReachedThreshold={0.5}
                                contentContainerStyle={{ paddingBottom: 100 }}
                                ItemSeparatorComponent={NotificationItemSeparator}
                            />
                        );
                    }
                })()}
                <PopupOrSheet title="GLOBAL_CONSTANTS.DETAILS" ref={rbSheetRef} height={s(350)} >
                    {notificationDetailsContent}
                </PopupOrSheet>
            </Container>
        </ViewComponent>
    );
});

export default Notifications;

const themedStyles = StyleService.create({
    notifyIcon: { width: ms(36), height: ms(36) },
});