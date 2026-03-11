import React, { useRef, useState, useMemo, useEffect } from 'react';
import { View, TouchableOpacity, FlatList, BackHandler } from 'react-native';
import Container from '../../newComponents/container/container';
import FlatListComponent from '../../newComponents/flatList/flatList';
import { useThemeColors } from '../../hooks/useThemeColors';
import ParagraphComponent from '../../newComponents/textComponets/paragraphText/paragraph';
import SearchComponent from '../../newComponents/searchComponents/searchComponent';
import ViewComponent from '../../newComponents/view/view';
import PageHeader from '../../newComponents/pageHeader/pageHeader';
import { showAppToast } from "../../newComponents/ToasterMessages/ShowMessage";
import ProfileService from "../../services/profile";
import { isErrorDispaly } from '../../utils/helpers';
import { s } from '../../newComponents/theme/scale';
import { allTransactionList } from '../commonScreens/transactions/skeltonViews';
import Loadding from '../commonScreens/skeltons';
import { Currency, CurrencyListProps, CurrencyLUResponse, FlatListItem, ViewableItem } from './currency.types';
import { useLngTranslation } from '../../hooks/useLngTranslation';
import AntDesign from '@expo/vector-icons/AntDesign';
// --- Add logging hook import ---
import { useActionLogging } from '../../hooks/loggingHook';
import { useNavigation } from '@react-navigation/native';
import { useHardwareBackHandler } from '../../hooks/HardwareBackHandler';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';
import LiveSearchComponent from '../../newComponents/searchComponents/liveSearch';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const HEADER_HEIGHT = s(40);

const CurrencyList: React.FC<CurrencyListProps> = (props) => {
    // Accept navigation params
    const { onSelect, from, cardId, selectedCurrencyCode: selectedCurrencyParam } = props?.route?.params || {};
    const [allCurrencies, setAllCurrencies] = useState<Currency[]>([]);
    const [filteredData, setFilteredData] = useState<Currency[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCurrency, setSelectedCurrency] = useState(selectedCurrencyParam ?? null);
    const [activeLetter, setActiveLetter] = useState(alphabet[0]);
    const [overlayLetter, setOverlayLetter] = useState<string | null>(null);
    const [showLetterOverlay, setShowLetterOverlay] = useState(false);
    const [showStickyHeader, setShowStickyHeader] = useState(false);
    const flatListRef = useRef<FlatList<FlatListItem>>(null);
    const navigation = useNavigation<any>()
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    // --- Logging hook ---
    const { logEvent } = useActionLogging();

    // Log screen view on mount
    useEffect(() => {
        logEvent('screen_view', {
            screename: 'CurrencyList',
            actionName: 'View Currency List Screen',
            actionType: 'Screen',
        });
    }, [logEvent]);

    useEffect(() => {
        setSelectedCurrency(selectedCurrencyParam ?? null);
    }, [selectedCurrencyParam]);

    useEffect(() => {
        fetchCurrencies();
    }, []);
    const fetchCurrencies = async () => {
        setLoading(true);
        try {
            const response = await ProfileService.currencyLu();
            if (response?.ok) {
                const data = response.data as CurrencyLUResponse;
                setAllCurrencies(data.CurrencyLU);
                setFilteredData(data.CurrencyLU);
            } else {
                setAllCurrencies([]);
                setFilteredData([]);
            }
        } catch (error) {
            setAllCurrencies([]);
            setFilteredData([]);
            showAppToast(isErrorDispaly(error), 'error');
        }
        setLoading(false);
    };

    const sectionedData = useMemo(() => {
        const grouped = filteredData.reduce((acc, item) => {
            const firstLetter = (item.name ?? '').charAt(0).toUpperCase();
            if (!acc[firstLetter]) acc[firstLetter] = [];
            acc[firstLetter].push(item);
            return acc;
        }, {} as { [key: string]: any[] });

        return Object.keys(grouped)
            .sort((a, b) => a.localeCompare(b))
            .map(letter => ({
                title: letter,
                data: grouped[letter]
            }));
    }, [filteredData]);

    const flatData = useMemo(() =>
        sectionedData.flatMap(section => [
            { type: 'header', title: section.title },
            ...section.data.map(item => ({ ...item, type: 'item' }))
        ]),
        [sectionedData]
    );

    const getHeaderIndex = (letter: string) => {
        return flatData.findIndex(item => item.type === 'header' && item.title === letter);
    };

    // --- Log alphabet tap ---
    const handleAlphabetTap = (letter: string) => {
        logEvent('button_press', {
            screename: 'CurrencyList',
            actionName: `Tap Alphabet: ${letter}`,
            actionType: 'Button',
            tappedLetter: letter,
        });
        const idx = getHeaderIndex(letter);
        if (idx !== -1 && flatListRef.current) {
            flatListRef.current.scrollToIndex({ index: idx, animated: true });
        }
        setActiveLetter(letter);
        setOverlayLetter(letter);
        setShowLetterOverlay(true);
        setTimeout(() => setShowLetterOverlay(false), 700);
    };

    // --- Log search result ---
    const handleSearchResult = (result: Currency[]) => {
        logEvent('search', {
            screename: 'CurrencyList',
            actionName: 'Search Currency',
            actionType: 'Search',
            resultCount: result.length,
        });
        setFilteredData(result);
        setActiveLetter(alphabet[0]);
        if (flatListRef.current) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: false });
        }
    };

    // --- Log currency select (not API) ---
    const handleCurrencySelect = async (item: Currency) => {
        logEvent('button_press', {
            screename: 'CurrencyList',
            actionName: `Select Currency: ${item.code}`,
            actionType: 'Button',
            selectedCurrency: item.code,
        });
        setSelectedCurrency(item.code);
        // If navigated from SecuritySettings, use the callback
        if (from === "SecuritySettings" && typeof onSelect === "function" && cardId) {
            await onSelect(item.code); // Await in case it's async
            navigation.goBack();
            return;
        }
        // Otherwise, use the default profile update logic
        const obj = {
            currency: item.code,
            image: item.logo
        };
        try {
            const response = await ProfileService?.updateCurrencySelection(obj);
            if (response.ok) {
                showAppToast(t('GLOBAL_CONSTANTS.CURRENCY_UPDATED_SUCCESSFULLY'), 'success');
                props.navigation.navigate('Settings');
            } else {
                showAppToast(isErrorDispaly(response), 'error');
            }
        } catch (error) {
            showAppToast(isErrorDispaly(error), 'error');
        }
    };
    // --- Log back press ---
    const handleBack = () => {
        logEvent('navigation_action', {
            screename: 'CurrencyList',
            actionName: 'Back Press',
            actionType: 'Button',
            nextScreenName: 'Previous',
        });
        props.navigation?.goBack?.();
    };

    // --- Optionally log overlay view ---
    useEffect(() => {
        if (showLetterOverlay && overlayLetter) {
            logEvent('info_box_view', {
                screename: 'CurrencyList',
                actionName: `Show Letter Overlay: ${overlayLetter}`,
                actionType: 'InfoBox',
            });
        }
    }, [showLetterOverlay, overlayLetter, logEvent]);

    // Update activeLetter as user scrolls
    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewableItem[] }) => {
        let header = viewableItems.find((v) => v.item.type === 'header');
        if (!header) {
            const firstItem = viewableItems[0]?.item;
            if (firstItem && firstItem.type === 'item') {
                const idx = flatData.findIndex(i => i === firstItem);
                const prevHeader = flatData
                    .slice(0, idx)
                    .reverse()
                    .find(i => i.type === 'header');
                if (prevHeader) {
                    header = { item: prevHeader as FlatListItem };
                }
            }
        }
        if (header && header.item.type === 'header') {
            setActiveLetter(header.item.title);
            setShowStickyHeader(header.item.title !== alphabet[0]);
        } else {
            setShowStickyHeader(false);
        }
    }).current;

    const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 10 }).current;

    const renderItem = ({ item }: { item: any; index: number }) => {
        if (item.type === 'header') {
            return (
                <ViewComponent >
                    <ParagraphComponent text={item.title} style={commonStyles.alphabetHeaderText} />
                </ViewComponent>
            );
        }
        const isSelected = selectedCurrency && selectedCurrency.toUpperCase() === item.code.toUpperCase();

        return (
            <>
                <TouchableOpacity
                    style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.list, commonStyles.p8, commonStyles.rounded11,
                    commonStyles.currencyListItem,
                    { width: s(340) }
                    ]}
                    onPress={() => handleCurrencySelect(item)} >
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                        <ViewComponent>
                            <ParagraphComponent
                                text={item.code}
                                style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400,]}
                            />
                            <ParagraphComponent
                                text={item.name}
                                style={[commonStyles.textlinkgrey, commonStyles.fs12, commonStyles.mt2, commonStyles.fw400]}
                            />
                        </ViewComponent>
                        {isSelected && (
                            <ViewComponent style={[commonStyles.flex1, commonStyles.dflex, commonStyles.justifyend]}>
                                <AntDesign name="checkcircle" size={20} color={NEW_COLOR.BG_YELLOW} />
                            </ViewComponent>
                        )}
                    </ViewComponent>
                </TouchableOpacity>
                <ViewComponent style={commonStyles.mb16} />
            </>
        );
    };

    const ALPHABET_TOP_PADDING = s(10);
    useHardwareBackHandler(() => {
        handleBack()
    })
    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            <Container>
                <PageHeader title={props?.route?.params?.pageHeaderTitle || "GLOBAL_CONSTANTS.SELECT_CURRENCY"} onBackPress={handleBack} />
              { props?.route?.params?.cardNumber&&<ParagraphComponent style={[commonStyles.textGrey, commonStyles.fs14_24, commonStyles.mb8]} numberOfLines={1} text={`${t('GLOBAL_CONSTANTS.MANAGE_TRANSACTION_CURRENCIES_FOR_CARD')} ****${(props?.route?.params?.cardNumber ? props?.route?.params?.cardNumber.slice(-4) : '')}`} />}

                <LiveSearchComponent
                    data={allCurrencies}
                    customBind={"code"}
                    onSearchResult={handleSearchResult}
                    placeholder={`Search Currency`}
                    style={[{ backgroundColor: NEW_COLOR.SEARCHBOX, borderRadius: 8 }]}
                    placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                    inputColor={commonStyles.textWhite}

                />
                <ViewComponent style={{ flex: 1 }}>
                    {/* Sticky Section Header */}
                    {!loading && showStickyHeader && (
                        <View
                            style={{
                                backgroundColor: NEW_COLOR.ALPHABET_HEADER_BG,
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: s(HEADER_HEIGHT),
                                justifyContent: 'center',
                                zIndex: 15,
                                paddingVertical: s(8),
                                paddingHorizontal: s(16),
                            }}
                            pointerEvents="none"
                        >
                            <ParagraphComponent text={activeLetter} style={{
                                color: NEW_COLOR.ALPHABET_HEADER_TEXT,
                                fontSize: s(16),
                                fontWeight: '600',
                            }}
                            />
                        </View>
                    )}
                    {/* Overlay for tapped letter */}
                    {!loading && showLetterOverlay && (
                        <ViewComponent
                            style={{ position: 'absolute', top: '40%', left: 0, right: 0, alignItems: 'center', zIndex: 100, }}
                        >
                            <ViewComponent style={commonStyles.letterOverlayBox}>
                                <ParagraphComponent
                                    text={overlayLetter ?? ''}
                                    style={commonStyles.letterOverlayText}
                                />
                            </ViewComponent>
                        </ViewComponent>
                    )}
                    {/* Loader or List */}
                    {loading ? (
                        <Loadding contenthtml={allTransactionList(10)} />
                    ) : (
                        <>
                            {/* List with NO extra padding above or below */}
                            <FlatListComponent
                                data={flatData}
                                renderItem={renderItem}
                                keyExtractor={(item, idx) =>
                                    item.type === 'header' ? `header-${item.title}` : `${item.name}-${idx}`
                                }
                                contentContainerStyle={{ paddingBottom: 0, paddingTop: s(HEADER_HEIGHT), }}
                                ref={flatListRef}
                                onViewableItemsChanged={onViewableItemsChanged}
                                viewabilityConfig={viewabilityConfig}
                                NodeDataDescription={"GLOBAL_CONSTANTS.NO_CURRENCIES_FOUND"}
                            />
                            {/* Alphabet index */}
                            {flatData.length > 0 && (
                                <ViewComponent
                                    style={[
                                        commonStyles.alphabetSection,
                                        { top: s(HEADER_HEIGHT), paddingVertical: ALPHABET_TOP_PADDING }
                                    ]}
                                >
                                    {alphabet.map(letter => (
                                        <TouchableOpacity
                                            key={letter}
                                            onPress={() => handleAlphabetTap(letter)}
                                            activeOpacity={0.7}
                                        >
                                            <ParagraphComponent
                                                text={letter}
                                                style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.fw400]}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </ViewComponent>
                            )}
                        </>
                    )}
                </ViewComponent>
            </Container>
        </ViewComponent>
    );
};

export default CurrencyList;