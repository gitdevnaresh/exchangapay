import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { s } from '../../../constants/styels/scale';
import { isErrorDispaly } from '../../../utils/helpers';
import 'moment-timezone';
import ErrorComponent from '../../../components/errorDisplay/errorDisplay';
import NoDataComponent from '../../../components/noData/noData';
import CreateAccountService from '../../../apiServices/bank/createAccount';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Container from '../../../components/container/container';
import Loadding from '../../../components/skelton/skeltons';
import { SvgUri } from 'react-native-svg';
import { CONSTS, Notification } from './interfaces';
import FlatListComponent from '../../../components/flatList/flatList';
import PageHeader from '../../../components/pageHeader/pageHeader';
import CustomRBSheet from '../../../components/models/commonBottomSheet';
import TextMultiLangauge from '../../../components/textComponets/multiLanguageText/textMultiLangauge';
import { homeNotifications } from '../../../skeletons/skeleton_views';
import { useThemeColors } from '../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../components/CommonStyles';
import DashboardLoader from '../../../components/loader';
import ViewComponent from '../../../components/view/view';
import { notificationIconsLists } from '../../../constants/coinsList/coinsLIst';
import ScrollViewComponent from '../../../components/scrollView/scrollView';
import SafeAreaViewComponent from '../../../components/safeArea/safeArea';
import ButtonComponent from '../../../components/buttons/button';
import { FormattedDateText } from '../../../components/textComponets/dateTimeText/dateTimeText';
import ParagraphComponent from '../../../components/textComponets/paragraphText/paragraph';
import { useHardwareBackHandler } from '../../../hooks/backHandleHook';

const Notifications = React.memo(() => {
    const [allNotificationsList, setAllNotificationsList] = useState<any>([]);
    const [errormsg, setErrormsg] = useState<string>("");
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();
    const [notificationDetails, setNotificationDetails] = useState<Notification>();
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const rbSheetRef = useRef<any>()
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const notificationIcons = notificationIconsLists(commonStyles);

    useEffect(() => {
        updateNotificationsCount();
    }, []);
    const updateNotificationsCount = async () => {
        const response: any = await CreateAccountService.putNotificationCount();
        if (response.ok) {
            // Successfully updated notification count
        }
    }
    const fetchNotifications = useCallback(async (pageNumber: number) => {
        if (pageNumber === 1) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }
        try {
            const response: any = await CreateAccountService.getAllNotifications(10, pageNumber, "All");
            if (response.ok) {
                if (pageNumber === 1) {
                    setAllNotificationsList(response?.data || []);
                } else {
                    setAllNotificationsList((prev: any) => [...prev, ...(response?.data || [])]);
                }
                setErrormsg("");
            } else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        if (isFocused) {
            fetchNotifications(1);
            setPage(1);
        }
    }, [isFocused, fetchNotifications]);

    const loadMoreNotifications = () => {
        if (!loadingMore && allNotificationsList.length >= page * 10) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchNotifications(nextPage);
        }
    };

    const selectedNotification = (item: Notification) => {
        rbSheetRef.current.open()
        setNotificationDetails(item);
    };
    useHardwareBackHandler(() => {
        navigation.goBack();
        return true;
    });
    const handleDashBoard = () => {
        navigation.goBack();
    };
    const renderNotificationItem = ({ item, index }: { item: Notification, index: number }) => (
        <ViewComponent key={index}>
            <ViewComponent>
                <TouchableOpacity onPress={() => selectedNotification(item)} style={[commonStyles.cardsbannerbg]}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignStart]}>
                        <ViewComponent style={{ minHeight: s(30), minWidth: s(30) }}>
                            {notificationIcons[item?.action?.toLowerCase()?.replace(/[\s-]/g, '') as keyof typeof notificationIcons] ||
                                <SvgUri style={[commonStyles.mxAuto]} width={s(30)} height={s(30)}
                                    uri='https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/notification_purchase.svg' />
                            }
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mb6, commonStyles.gap8]}>
                                <ParagraphComponent
                                    style={[commonStyles.fs14, commonStyles.textWhite, commonStyles.fw500, { width: s(160) }]}
                                    text={item?.action}
                                    numberOfLines={1}
                                />
                                <FormattedDateText value={item?.date || "--"} conversionType='UTC-to-local' style={[commonStyles.fs12, commonStyles.textlinkgrey, commonStyles.fw400, commonStyles.flex1]} />
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

    const renderFooter = () => {
        if (loadingMore) {
            return <Loadding contenthtml={homeNotifications(10)} />;
        }
        return null;
    };

    const handleCloseDetails = () => {
        rbSheetRef?.current?.close()
    };

    const notificationDetailsContent = (
        <ViewComponent style={[commonStyles.flex1]}>
            <ViewComponent style={[commonStyles.flex1]}>
                <ViewComponent style={[commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mb8, commonStyles.gap6]}>
                    <ViewComponent style={{ minHeight: s(30), minWidth: s(30) }}>
                        {(notificationDetails?.action
                            ? notificationIcons[notificationDetails?.action?.toLowerCase()?.replace(/[\s-]/g, '') as keyof typeof notificationIcons]
                            : undefined) ||
                            <SvgUri width={s(30)} height={s(50)}
                                uri='https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/notification_purchase.svg' />
                        }
                    </ViewComponent>
                    <ParagraphComponent
                        text={notificationDetails?.action || ""}
                        style={[commonStyles.textWhite, commonStyles.fs16, commonStyles.fw600]}
                    />
                </ViewComponent>
                <ViewComponent>
                    <ParagraphComponent
                        text={notificationDetails?.message || ""}
                        style={[commonStyles.textlinkgrey, commonStyles.textCenter, commonStyles.fs14, commonStyles.fw400]} numberOfLines={2}
                    />
                    <ViewComponent style={[commonStyles.sectionGap]} />
                    <ParagraphComponent
                        text={CONSTS.ADD_DETAILS}
                        style={[commonStyles.textWhite, commonStyles.mb4, commonStyles.fs20, commonStyles.fw600, commonStyles.titleSectionGap]}
                    />
                    <ViewComponent style={[commonStyles.dflex, commonStyles.mb8, commonStyles.justifyContent, commonStyles.gap2, commonStyles.flexWrap]}>
                        <TextMultiLangauge
                            text={"GLOBAL_CONSTANTS.DATE"}
                            style={[commonStyles.listsecondarytext]}
                        />

                        <FormattedDateText value={notificationDetails?.date || "--"} conversionType='UTC-to-local' style={[commonStyles.listprimarytext]} />
                    </ViewComponent>
                </ViewComponent>
            </ViewComponent>
            <ViewComponent style={[commonStyles.sectionGap]}>
                <ButtonComponent title={"GLOBAL_CONSTANTS.CLOSE"} solidBackground={true} onPress={handleCloseDetails} />
            </ViewComponent>
        </ViewComponent>
    );

    const handleCloseError = () => {
        setErrormsg("")
    }
    const onRefresh = async () => {
        fetchNotifications(1);
        setPage(1);
    }
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={commonStyles.container}>
                <PageHeader title={"GLOBAL_CONSTANTS.NOTIFICATIONS"} onBackPress={handleDashBoard} />
                {(loading && page) === 1 && (
                    <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles?.alignCenter, commonStyles?.justifyCenter]}>
                        <DashboardLoader />
                    </SafeAreaViewComponent>
                )}
                {!loading && <ScrollViewComponent showsVerticalScrollIndicator={false} refreshing={loading} onRefresh={onRefresh}>
                    {errormsg && <ErrorComponent message={errormsg} onClose={handleCloseError} />}
                    {allNotificationsList.length === 0 ? (
                        <ViewComponent >
                            <NoDataComponent Description={CONSTS.NO_DATA_AVAILABLE} />
                        </ViewComponent>
                    ) : (
                        <FlatListComponent
                            data={allNotificationsList}
                            renderItem={renderNotificationItem}
                            keyExtractor={(index: any) => index.toString()}
                            onEndReached={loadMoreNotifications}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={renderFooter}
                            ItemSeparatorComponent={() => <ViewComponent style={[commonStyles.transactionsListGap]} />}
                        />
                    )}

                    <CustomRBSheet title="GLOBAL_CONSTANTS.DETAILS" refRBSheet={rbSheetRef} height={'Medium'}>
                        {notificationDetailsContent}
                    </CustomRBSheet>
                </ScrollViewComponent>}
            </Container>
        </ViewComponent>
    );
});

export default Notifications;

