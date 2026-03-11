import React, { useState } from 'react';
import { TouchableOpacity, View, StyleSheet, Dimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { useThemeColors } from '../../../hooks/useThemeColors';
import ViewComponent from '../../../newComponents/view/view';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import ImageUri from '../../../newComponents/imageComponents/image';
import { s } from '../../../constants/theme/scale';
import { useNavigation } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { t } from 'i18next';
import { ActionLogParams, useActionLogging } from '../../../hooks/loggingHook';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import NoDataComponent from '../../../newComponents/noData/noData';
import { Image } from 'react-native';
import { SvgUri } from 'react-native-svg';

// --- Data for the carousel ---
// This data is identical to your original component.
const swokipayCard1 = require('../../../assets/imageAssets/swokipayCard.png');
const swokipayCard2 = require('../../../assets/imageAssets/getStartedCards.png');
const swokipayCard3 = require('../../../assets/imageAssets/swokipayCard.png');

const advertisements = [
    {
        id: '1',
        title: 'Limitless spending made possible.',
        image: swokipayCard1,
    },
    {
        id: '2',
        title: 'Seamless payments, secure transactions.',
        image: swokipayCard2,
    },
    {
        id: '3',
        title: 'Your financial journey starts here.',
        image: swokipayCard3,
    },
];

interface Advertisement {
    isTitleDisplayed?: boolean;
    learnList?: any;
}

const { width } = Dimensions.get('window');
const AdvertisementCarousel: React.FC = ({ isTitleDisplayed, learnList }: Advertisement) => {
    // The activeIndex state is still useful for other purposes, like external pagination dots, so we keep it.
    const [activeIndex, setActiveIndex] = useState(0);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const navigation = useNavigation<any>();
    const { logEvent } = useActionLogging();


    const handleLearnMorePress = (item: any) => {
        const actionData: ActionLogParams = {
            screename: 'AdvertisementCarousel',
            actionName: `Learn More - Ad ID: ${item?.id}`,
            actionType: 'Button',
            nextScreenName: 'LearnMoreView',
            actionObj: { id: item?.id }
        };
        logEvent('navigation_action', actionData);
        navigation.navigate('LearnMoreView', { id: item?.id });
    };
    const renderImage = (imageURL: string) => {
        if (imageURL?.endsWith('.svg')) {
            return <SvgUri width={s(150)} height={s(100)} uri={imageURL} style={{ marginLeft: s(16), marginTop: s(10) }} />;
        } else {
            return <Image source={{ uri: imageURL }} style={{ minWidth: s(150), minHeight: s(100), marginLeft: s(16), marginTop: s(10) }} />;
        }
    };
    return (
        <ViewComponent style={[commonStyles?.flex1]}>
            {isTitleDisplayed && <TextMultiLanguage text={"GLOBAL_CONSTANTS.LEARN"} style={[commonStyles.sectionTitle, commonStyles?.mb10]} />
            }
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                {learnList?.length > 0 && <Carousel
                    data={learnList || []}
                    width={width * 0.91}
                    height={s(160)}
                    loop
                    autoPlay={true}
                    autoPlayInterval={5000}
                    scrollAnimationDuration={500}

                    onSnapToItem={(index) => setActiveIndex(index)}
                    renderItem={({ item, index }) => ( // <-- Grab the item's own index here
                        <TouchableOpacity style={[styles.cardContainer, commonStyles.dashboardbannerbg]} onPress={() => handleLearnMorePress(item)}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                                <ViewComponent>
                                    <ParagraphComponent text={item?.heading || ""} style={[commonStyles.textWhite, commonStyles.fs18, commonStyles.fw600, { width: s(165) }]} numberOfLines={2} />
                                </ViewComponent>
                                {item?.imageURL ? renderImage(item.imageURL) : <ViewComponent style={{ minWidth: s(150), minHeight: s(100), marginLeft: s(16), marginTop: s(10) }} />}
                            </ViewComponent>

                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                                <CommonTouchableOpacity onPress={() => handleLearnMorePress(item)}>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                                        <ParagraphComponent text={t("GLOBAL_CONSTANTS.LEARN_MORE")} style={[commonStyles.fs14, commonStyles.fw400, { color: NEW_COLOR.BG_YELLOW }]} />
                                        <AntDesign name="arrowright" size={s(16)} color={NEW_COLOR.BG_YELLOW} style={[commonStyles.mt3]} />
                                    </ViewComponent>
                                </CommonTouchableOpacity>

                                {/* The page counter now uses the renderItem's "index", not the component's "activeIndex" state */}
                                <ParagraphComponent text={`${index + 1}/${learnList?.length}`} style={[commonStyles.textWhite, commonStyles.fs12]} />
                            </ViewComponent>
                        </TouchableOpacity>
                    )}
                /> || <NoDataComponent
                    />}
            </View>
        </ViewComponent>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        flex: 1,
        borderRadius: s(20),
        padding: s(20),
        marginHorizontal: s(5), // Adds consistent spacing between cards
    },
});

export default AdvertisementCarousel;