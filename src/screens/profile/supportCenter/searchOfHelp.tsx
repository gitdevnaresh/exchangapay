import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, useWindowDimensions, LayoutAnimation, UIManager, Platform, ActivityIndicator, Keyboard } from 'react-native';
import ViewComponent from '../../../newComponents/view/view';
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import { Feather, Ionicons } from '@expo/vector-icons';
import { s } from '../../../newComponents/theme/scale';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import { useActionLogging } from '../../../hooks/loggingHook';
import LiveSearchComponent from '../../../newComponents/searchComponents/liveSearch';
import ProfileService from '../../../services/profile';
import { isErrorDispaly } from '../../../utils/helpers';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import SwokipayDashboardLoader from '../../../newComponents/swokipayloader';
import Container from '../../../newComponents/container/container';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import NoDataComponent from '../../../newComponents/noData/noData';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import { t } from 'i18next';
import RenderHTML from 'react-native-render-html';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Types
interface SupportTopic {
    id: string | number;
    name: string;
    title?: string;
    description?: string;
    category?: string;
    heading?: string; // Kept for LiveSearch compatibility
    [key: string]: any;
};


const SearchForHelp = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { logEvent } = useActionLogging();
    const { width } = useWindowDimensions();
    const [supportTopics, setSupportTopics] = useState<SupportTopic[]>([]);
    const [filteredTopics, setFilteredTopics] = useState<SupportTopic[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [totalCollections, setTotalCollections] = useState<number>(0);
    const [expandedTopicId, setExpandedTopicId] = useState<string | number | null>(null);
    const [accordionContent, setAccordionContent] = useState<string>('');
    const [isAccordionLoading, setIsAccordionLoading] = useState<boolean>(false);
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();
    const chatOption = props.route?.params?.chatOption;
    const [error,setError]=useState<string>("");
 
    useEffect(() => {
        if (isFocused) {
            fetchSupportTopics();
        }
    }, [isFocused]);

    useHardwareBackHandler(() => {
        handleGoBack();
        return true;
    });

    // API call to fetch the list of support topics
    const fetchSupportTopics = useCallback(async () => {
         setError("");
        try {
            setLoading(true);
            const response: any = await ProfileService.getSupportTopics(chatOption);
            if (response.status === 200) {
                const data = response.data;
                setTotalCollections(data.totalCollections);
                setSupportTopics(data.collections);
                setFilteredTopics(data.collections);
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (err: any) {
            setError(isErrorDispaly(err));
            logEvent('api_error', {
                screename: 'SearchForHelp',
                actionName: 'Fetch Support Topics Error',
                actionType: 'API',
            });
        } finally {
            setLoading(false);
        }
    }, [chatOption, logEvent]);


    // API call to fetch details for a single accordion item
    const fetchTopicDetails = useCallback(async (topicId: string | number) => {
        setError("");
        try {
            setIsAccordionLoading(true);
            setAccordionContent('');
            const response: any = await ProfileService.getSupportTopicDetails(topicId);
            if (response.status === 200) {
                Keyboard.dismiss();
                setAccordionContent(response.data);
                setIsAccordionLoading(false);
            } else {
                 setError(isErrorDispaly(response));
                setIsAccordionLoading(false);
                setExpandedTopicId(null); // Close accordion on error
            }
        } catch (err: any) {
            setError(isErrorDispaly(err));
            setIsAccordionLoading(false);
            setExpandedTopicId(null); // Close accordion on error
        }
    }, []);


    // Handle search results from LiveSearchComponent
    const handleSearchResult = useCallback((results: SupportTopic[]) => {
        logEvent('search', {
            screename: 'SearchForHelp',
            actionName: 'Search Support Topics',
            actionType: 'Search',
            resultCount: results.length,
        });
        setFilteredTopics(results);
    }, [logEvent]);


    // Handle topic item press to toggle the accordion
    const handleTopicPress = useCallback((topic: SupportTopic) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const isAlreadyOpen = expandedTopicId === topic.id;

        if (isAlreadyOpen) {
            setExpandedTopicId(null); // Close the accordion
            setAccordionContent('');
            Keyboard.dismiss();
        } else {
            setExpandedTopicId(topic.id); // Open the new accordion
            logEvent('accordion_toggle', {
                screename: 'SearchForHelp',
                actionName: 'Open Support Topic',
                actionType: 'UI_Interaction',
                topicId: topic.id,
            });
            fetchTopicDetails(topic.id); // Fetch content for it
        }
    }, [expandedTopicId, fetchTopicDetails, logEvent]);


    // Render individual support topic accordion item
    const renderTopicItem = (({ item }: { item: SupportTopic; }) => {
        const isExpanded = expandedTopicId === item.id;
        return (
            <ViewComponent style={[commonStyles.profileMenulistGap]}>
                <CommonTouchableOpacity
                    onPress={() => handleTopicPress(item)}
                    activeOpacity={0.95}
                >
                    <ViewComponent style={[commonStyles.helpborder]}>
                        {/* Header row */}
                        <ViewComponent style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <ViewComponent style={[commonStyles.flex1]}>
                                <ParagraphComponent
                                    text={item.heading || item.title || ''}
                                    style={[commonStyles.profileMenuItemText]}
                                    multiLanguageAllows={false}
                                />
                                {item?.description && !isExpanded && (
                                    <ViewComponent style={{ marginTop: s(4) }}>
                                        <ParagraphComponent
                                            text={item.description}
                                            style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]}
                                            multiLanguageAllows={false}
                                            numberOfLines={2}
                                        />
                                    </ViewComponent>
                                )}
                            </ViewComponent>

                            <ViewComponent>
                                {isExpanded ?
                                    <Feather name="chevron-down"  size={s(26)} color={NEW_COLOR.ICON_GREY} />
                                    : <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
                                }

                            </ViewComponent>
                        </ViewComponent>

                        {/* Inline expanded content (inside same card) */}
                        {isExpanded && (
                            <ViewComponent style={{ marginTop: s(16) }}>
                                {isAccordionLoading ? (
                                    <ActivityIndicator size="small" color={NEW_COLOR.PRIMARY} style={{ marginVertical: s(20) }} />
                                ) : (
                                    <RenderHTML
                                        contentWidth={width - s(48)}
                                        source={{ html: accordionContent }}
                                        tagsStyles={{
                                            body: { color: NEW_COLOR.TEXT_WHITE, },
                                            a: { color: NEW_COLOR.PRIMARY, textDecorationLine: 'none' }
                                        }}
                                    />
                                )}
                                {!accordionContent && (!isAccordionLoading) && (
                                    <NoDataComponent />
                                )}
                            </ViewComponent>
                        )}
                    </ViewComponent>
                </CommonTouchableOpacity>
            </ViewComponent>
        )
    });

    // Render empty state
    const renderEmptyComponent = useCallback(() => (
        <ViewComponent style={[commonStyles.container, { marginTop: s(60) }]}>
            <NoDataComponent />
        </ViewComponent>
    ), [commonStyles]);

    //function to handle back navigation
    const handleGoBack = () => {
        navigation.goBack();
        logEvent('navigation_action', {
            screename: 'SearchForHelp',
            actionName: 'Go Back',
            actionType: 'Button',
        });
    };


    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container>
                <PageHeader title={t("GLOBAL_CONSTANTS.SEARCH_FOR_HELP")} onBackPress={handleGoBack} />
                {error&&<ErrorComponent message={error} screen={true}/>}
                <LiveSearchComponent<SupportTopic>
                    data={supportTopics}
                    customBind="heading"
                    onSearchResult={handleSearchResult}
                    placeholder={t("GLOBAL_CONSTANTS.SEARCH")}
                    style={[{ backgroundColor: NEW_COLOR.SEARCHBOX, borderRadius: 8 }]}
                    placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                    inputColor={commonStyles.textWhite}
                    isSearchIconShow={true}
                />

                <ViewComponent style={[commonStyles.flex1, commonStyles.mt12]}>
                    {loading ? (
                        <SwokipayDashboardLoader />
                    ) : (
                        <ViewComponent style={commonStyles.flex1}>
                            <ParagraphComponent
                                text={`${filteredTopics?.length || 0}  ${t("GLOBAL_CONSTANTS.COLLECTIONS")}`}
                                style={[commonStyles.profileMenuItemText, commonStyles.fw500, commonStyles.mb16]}
                                multiLanguageAllows={false}
                            />
                            <FlatList
                                data={filteredTopics}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={renderTopicItem}
                                ListEmptyComponent={renderEmptyComponent}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={[
                                    commonStyles.sectionGap,
                                    filteredTopics?.length === 0 && commonStyles.flex1
                                ]}
                                extraData={expandedTopicId} // Ensures re-render on accordion state change
                                removeClippedSubviews={true}
                            />
                        </ViewComponent>
                    )}
                </ViewComponent>
            </Container>
        </ViewComponent>
    );
};

export default SearchForHelp;