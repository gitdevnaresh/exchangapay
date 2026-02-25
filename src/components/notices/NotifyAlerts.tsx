import React, { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity,  useWindowDimensions, Dimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import { useSelector } from 'react-redux';
import { AltertNotificationImage } from '../../assets/svg';
import { getThemedCommonStyles } from '../CommonStyles';
import { useNoticesManager } from '../../hooks/notifications/useNoticesManager';
import ButtonComponent from '../buttons/button';
import { s } from '../theme/scale';
import ViewComponent from '../view/view';
import NoticesService from '../../apiServices/common/noticesService';
import CustomOverlay from '../models/commonOverlay';
import NoDataComponent from '../noData/noData';
import ScrollViewComponent from '../scrollView/scrollView';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';
import TextMultiLanguage from '../textComponets/multiLanguageText/textMultiLangauge';

interface Notice {
    id: string | null;
    tittle: string | null;
    content: string | null;
}

interface NotifyAlertsProps {
    onNoticesLoaded?: () => void;
    onLoadingChange?: (isLoading: boolean) => void;
}

/**
 * DEV: Notices System - Component for displaying app-wide notifications
 * 
 * PURPOSE:
 * - Show critical announcements, updates, or alerts to users
 * - Ensure users acknowledge important information before proceeding
 * - Display notices in a modal overlay that blocks other interactions
 * 
 * BEHAVIOR:
 * - Fetches notices from API with timeout protection
 * - Shows notices one by one if multiple exist
 * - Calls onNoticesLoaded when all notices are processed
 * - Integrates with useNoticesManager for state management
 * - Can be disabled via configuration
 */
const NotifyAlerts = React.memo(({ onNoticesLoaded, onLoadingChange }: NotifyAlertsProps) => {
    const { width } = useWindowDimensions();
    const safeWidth = width || Dimensions.get('window').width;
    const [noticesList, setNoticesList] = useState<Notice[]>([]);
    const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [isVisible, setIsVisible] = useState(false);
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const appUpdateVisible = useSelector((state: any) => state.userReducer?.appUpdateVisible);
    const [currentNotice, setCurrentNotice] = useState<Notice | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [completedNoticeIds, setCompletedNoticeIds] = useState<string[]>([]);
    const isLoggedIn = useSelector((state: any) => state.userReducer?.login);
    
    const { shouldShowNotices, markNoticesProcessed, showNotices } = useNoticesManager();
    
    const CHARACTER_LIMIT = 250; // Optimal for fintech notices - shows key regulatory info while maintaining readability
    const shouldShowMore = currentNotice?.content && currentNotice.content.length > CHARACTER_LIMIT;
    
    useEffect(() => {
        // If notices are disabled, immediately call onNoticesLoaded
        if (!showNotices) {
            setIsLoading(false);
            onLoadingChange?.(false);
            onNoticesLoaded?.();
            return;
        }

        if (isLoggedIn && userInfo?.id && !appUpdateVisible && shouldShowNotices) {
            setIsLoading(true);
            onLoadingChange?.(true);
            getNotices();
        } else if (!shouldShowNotices) {
            setNoticesList([]);
            setCurrentNoticeIndex(0);
            setIsVisible(false);
            setIsLoading(false);
            onLoadingChange?.(false);
            onNoticesLoaded?.();
        }
    }, [isLoggedIn, userInfo?.id, appUpdateVisible, shouldShowNotices, showNotices]);

    useEffect(() => {
        if (noticesList.length > 0) {
            setCurrentNotice(noticesList[currentNoticeIndex]);
            setIsExpanded(false); // Reset expansion for new notice
        } else {
            setCurrentNotice(null);
        }
    }, [noticesList, currentNoticeIndex]);

    const handleClose = () => {
        setIsVisible(false);
    };

    const getNotices = useCallback(async () => {
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 8000)
            );

            const response: any = await Promise.race([
                NoticesService.getNotices(),
                timeoutPromise
            ]);

            if (response?.ok && Array.isArray(response.data) && response.data.length > 0) {
                const uncompletedNotices = response.data.filter((notice: any) => !completedNoticeIds.includes(notice.id));

                if (uncompletedNotices.length > 0) {
                    setNoticesList(uncompletedNotices);
                    setCurrentNoticeIndex(0);
                    setIsVisible(true);
                    setIsLoading(false);
                    onLoadingChange?.(false);
                } else {
                    setIsLoading(false);
                    onLoadingChange?.(false);
                    markNoticesProcessed();
                    onNoticesLoaded?.();
                }
            } else {
                setIsLoading(false);
                onLoadingChange?.(false);
                markNoticesProcessed();
                onNoticesLoaded?.();
            }
        } catch (error) {
            setIsLoading(false);
            onLoadingChange?.(false);
            markNoticesProcessed();
            onNoticesLoaded?.();
        }
    }, [completedNoticeIds, onNoticesLoaded, markNoticesProcessed]);

    const handleNextNotice = useCallback(() => {
        const notice = noticesList[currentNoticeIndex];
        if (notice?.id) {
            setCompletedNoticeIds(prev => [...prev, notice.id!]);
        }

        if (currentNoticeIndex < noticesList.length - 1) {
            setCurrentNoticeIndex(currentNoticeIndex + 1);
            setIsExpanded(false); // Reset expansion for next notice
        } else {
            handleClose();
            markNoticesProcessed();
            onNoticesLoaded?.();
        }
    }, [noticesList, currentNoticeIndex, onNoticesLoaded, markNoticesProcessed]);

    const getDisplayContent = () => {
        if (!currentNotice?.content) return '';
        if (!shouldShowMore || isExpanded) return currentNotice.content;
        return currentNotice.content.substring(0, CHARACTER_LIMIT) + '...';
    };

    // Don't render anything if notices are disabled
    if (!showNotices) {
        return null;
    }

    return (
        <CustomOverlay
            isVisible={isVisible && !appUpdateVisible && !isLoading}
            showHeader={false}
            crossIcon={false}
            overlayStyle={{
                width: safeWidth - 50,
                maxHeight: isExpanded ? Dimensions.get('window').height - 50 : Dimensions.get('window').height - 100
            }}
        >
            {currentNotice && (
                <ViewComponent style={[]}>
                    <ParagraphComponent
                        text={currentNotice?.tittle || ""}
                        style={[commonStyles.fs16, commonStyles.textWhite, commonStyles.fw600, commonStyles.titleSectionGap]}
                    />
                    <ViewComponent style={[commonStyles.mxAuto]}>
                        <AltertNotificationImage width={s(150)} height={s(120)} />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.titleSectionGap]}>
                        <ScrollViewComponent style={{ maxHeight: isExpanded ? 350 : 200 }}>
                            {currentNotice?.content ? (
                                <RenderHtml
                                    contentWidth={safeWidth - 60}
                                    source={{ html: getDisplayContent() }}
                                    tagsStyles={{
                                        body: {
                                            textAlign: 'center',
                                            color: NEW_COLOR.TEXT_WHITE,
                                        },
                                        p: {
                                            textAlign: 'center',
                                            color: NEW_COLOR.TEXT_WHITE,
                                            fontSize: s(16)
                                        },
                                        a: {
                                            color: NEW_COLOR.LINKPRIMARY_COLOR,
                                            textDecorationLine: 'underline'
                                        }
                                    }}
                                />
                            ) : (
                                <NoDataComponent />
                            )}
                        </ScrollViewComponent>
                        {shouldShowMore && !isExpanded && (
                            <TouchableOpacity onPress={() => setIsExpanded(true)} style={{ alignSelf: 'center', marginTop: 10 }}>
                                <TextMultiLanguage 
                                    text="GLOBAL_CONSTANTS.SHOW_MORE_DOTS"
                                    style={{ 
                                        color: NEW_COLOR.LINKPRIMARY_COLOR, 
                                        fontSize: s(14)
                                    }}
                                />
                            </TouchableOpacity>
                        )}
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.sectionGap]} />
                    <ViewComponent>
                        <ButtonComponent
                            title="GLOBAL_CONSTANTS.OKEY"
                            onPress={handleNextNotice}
                        />
                    </ViewComponent>
                </ViewComponent>
            )}
        </CustomOverlay>
    );
});

export default NotifyAlerts;