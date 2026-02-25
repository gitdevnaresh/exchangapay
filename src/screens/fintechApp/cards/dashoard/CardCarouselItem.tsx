import React from "react";
import { View, TouchableOpacity, ImageBackground, Animated, Image } from "react-native";
import { s } from "../../../../constants/styels/scale";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import ViewComponent from "../../../../components/view/view";
import TextMultiLangauge from "../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";
import ImageUri from "../../../../components/imageComponents/image";
import AntDesign from '@expo/vector-icons/AntDesign';
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import { CardList } from "../interface";
import { hideDigitBeforLast } from '../../../../utils/helpers';
import { ITEM_WIDTH, CAROUSEL_HEIGHT, HORIZONTAL_ITEM_SPACING } from './cardsInfoConfig';

interface CardsInfoData {
    name?: string;
    type?: string;
    number?: string;
    state?: string;
    cardcurrency?: string;
    image?: string;
}

interface CardsDetails {
    number?: string;
    expireDate?: string;
    cvv?: string;
}

interface CardCarouselItemProps {
    item: CardList;
    isActive: boolean;
    flipCardHandler?: () => void;
    frontAnimatedStyle: Animated.AnimatedProps<unknown>;
    backAnimatedStyle: Animated.AnimatedProps<unknown>;
    CardsInfoData: CardsInfoData;
    cardsDetails: CardsDetails;
    decryptAES: (text?: string) => string;
}

const convertCardNumberStyle = (cardNumber?: string | number): string => {
    if (!cardNumber) return '';
    const cardNumberStr = cardNumber.toString().replace(/\D/g, '');
    if (!cardNumberStr) return '';
    return cardNumberStr.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};

const CardCarouselItem: React.FC<CardCarouselItemProps> = ({
    item, isActive, flipCardHandler, frontAnimatedStyle, backAnimatedStyle,
    CardsInfoData, cardsDetails, decryptAES
}) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    const cardNameToCompare = CardsInfoData?.name?.toLowerCase()?.replaceAll(" ", "");
    const itemImage = CardsInfoData?.image || item.image;

    return (
        <View style={{ width: ITEM_WIDTH, height: CAROUSEL_HEIGHT, marginHorizontal: HORIZONTAL_ITEM_SPACING / 2, justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => { if (isActive && flipCardHandler) flipCardHandler(); }} activeOpacity={1} style={{ flex: 1, width: '100%', height: '100%' }}>
                <Animated.View style={frontAnimatedStyle}>
                    <ImageBackground source={{ uri: itemImage }} resizeMode="cover" imageStyle={[commonStyles.rounded12]} style={[commonStyles.rounded12, { width: "100%", height: "100%" }]}>
                        <View style={[commonStyles.flex1, commonStyles.justifyContent, commonStyles.p16]}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent]}>
                                {cardNameToCompare === 'abcvirtualcard' ?
                                    <ImageUri width={s(60)} height={s(25)} uri='https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/cardslogo.svg' />
                                    : <Image source={require("../../../../assets/images/registration/cardlogo.png")} style={{ width: s(62), height: s(19) }} />
                                }
                                <ParagraphComponent text={CardsInfoData?.type} style={[commonStyles.fs14, commonStyles.fw400, cardNameToCompare === 'abcvirtualcard' ? commonStyles.textWhite : commonStyles.textBlack, commonStyles.textRight]} />
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.mt16]}>
                                <ViewComponent>
                                    <ParagraphComponent text={CardsInfoData?.name} numberOfLines={1} style={[commonStyles.fs16, commonStyles.fw500, cardNameToCompare === 'abcvirtualcard' ? commonStyles.textWhite : commonStyles.textBlack, commonStyles.textLeft]} />
                                    <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw500, cardNameToCompare === 'abcvirtualcard' ? commonStyles.textWhite : commonStyles.textBlack, commonStyles.textLeft]} text={CardsInfoData?.number && hideDigitBeforLast(CardsInfoData?.number?.replace(/\d{4}(?=.)/g, "$& "))} />
                                </ViewComponent>
                                {CardsInfoData?.state &&
                                    <View style={[commonStyles.rounded50, commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.badgeStyle,]}>
                                        <ParagraphComponent text={CardsInfoData?.state === "Approved" ? <AntDesign name="checkcircle" size={20} color={NEW_COLOR.BG_GREEN} /> : CardsInfoData?.state} style={[commonStyles.fs10, commonStyles.fw600, cardNameToCompare === 'abcvirtualcard' ? commonStyles.textGrey2 : commonStyles.textAlwaysWhite]} />
                                    </View>}
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignEnd]}>
                                <ViewComponent>
                                    <TextMultiLangauge text={"GLOBAL_CONSTANTS.CURRENCY"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textCardLabel]} />
                                    <ParagraphComponent text={CardsInfoData?.cardcurrency} style={[commonStyles.fs12, commonStyles.fw400, cardNameToCompare === 'abcvirtualcard' ? commonStyles.textWhite : commonStyles.textBlack]} />
                                </ViewComponent>
                                <ImageUri width={s(60)} height={s(25)} uri={cardNameToCompare === 'abcvirtualcard' ? 'https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/cardvisalogo.svg' : 'https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/card_visa_logo.svg'} />
                            </ViewComponent>
                        </View>
                    </ImageBackground>
                </Animated.View>

                <Animated.View style={backAnimatedStyle}>
                    <ImageBackground source={{ uri: itemImage }} resizeMode="cover" imageStyle={[commonStyles.rounded12]} style={[commonStyles.rounded12, { width: "100%", height: "100%" }]}>
                        <View style={[commonStyles.flex1, commonStyles.justifyContent, commonStyles.p16]}>
                            <ParagraphComponent text={CardsInfoData?.name} numberOfLines={1} style={[commonStyles.fs14, commonStyles.fw500, cardNameToCompare === 'abcvirtualcard' ? commonStyles.textWhite : commonStyles.textAlwaysWhite, commonStyles.textLeft]} />
                            <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw500, cardNameToCompare === 'abcvirtualcard' ? commonStyles.textWhite : commonStyles.textAlwaysWhite, commonStyles.textLeft, commonStyles.mt30]} text={convertCardNumberStyle(decryptAES(cardsDetails?.number))} />
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mt24]}>
                                <ViewComponent style={{ flex: 1 }} ><TextMultiLangauge style={[commonStyles.fw400, commonStyles.fs12, commonStyles.textCardLabel, commonStyles.mb2]} text={"GLOBAL_CONSTANTS.EXP_DATE"} /><ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, cardNameToCompare === 'abcvirtualcard' ? commonStyles.textWhite : commonStyles.textAlwaysWhite]} text={decryptAES(cardsDetails?.expireDate)} /></ViewComponent>
                                <ViewComponent style={{ flex: 1 }}><TextMultiLangauge style={[commonStyles.fw400, commonStyles.fs12, commonStyles.textCardLabel, commonStyles.mb2]} text={"GLOBAL_CONSTANTS.CVV"} /><ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, cardNameToCompare === 'abcvirtualcard' ? commonStyles.textWhite : commonStyles.textAlwaysWhite]} text={decryptAES(cardsDetails?.cvv)} /></ViewComponent>
                            </ViewComponent>
                        </View>
                    </ImageBackground>
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
};

export default React.memo(CardCarouselItem);