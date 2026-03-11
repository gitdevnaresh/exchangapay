import React from 'react';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ViewComponent from '../../../newComponents/view/view';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { useNavigation } from '@react-navigation/native';
import { s } from '../../../constants/theme/scale';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import { LinearGradient } from 'expo-linear-gradient';
import { copyToClipboard } from '../../../newComponents/copyToClipBoard/copy ToClopBoard';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import { CommunityProfile, FaceBook, Instagram, LinkedIn, YouTube } from '../../../assets/vectorAssets';
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import ImageBackgroundWrapper from '../../../newComponents/imageComponents/ImageBackground';
import ScrollViewComponent from '../../../newComponents/scrollView/scrollView';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import CopyCard from '../../../newComponents/copyComponent/CopyCard';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';

const Community = () => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const navigation = useNavigation<any>();

    const handleBackPress = () => {
        navigation.goBack();
    };

    const profileLogos = (
        <CommunityProfile width={s(100)} height={s(100)} style={commonStyles.alignCenter} />
    );
  useHardwareBackHandler(()=>{
        handleBackPress();
    })
    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            <ScrollViewComponent
                contentContainerStyle={[commonStyles.flexGrow1]}
                showsVerticalScrollIndicator={false}
            >
                {/* --- START OF CORRECTED SECTION --- */}
                <ImageBackgroundWrapper
                    source={require("../../../assets/imageAssets/community.png")}
                    style={{
                        height: s(360),
                        width: '100%',
                    }}
                    imageStyle={{
                        resizeMode: 'cover',
                    }}
                >
                    <LinearGradient
                        // Updated colors for a fade-to-transparent effect
                        colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.2)', 'transparent']}
                        // Control where the colors transition to create a smooth fade-out
                        locations={[0, 0.6, 1.0]}
                        style={{
                            width: '100%',
                            height: '100%',
                            justifyContent: 'center', // Center the main text vertically
                            alignItems: 'center',     // Center the main text horizontally
                        }}
                    >
                        {/* Position the header absolutely to keep it at the top */}
                        <ViewComponent style={{ position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: s(16) }}>
                            <PageHeader
                                title="GLOBAL_CONSTANTS.COMMUNITY"
                                onBackPress={handleBackPress}
                                rightActions={profileLogos}
                                // Ensure header text and icons are white to be visible
                                titleStyle={commonStyles.textAlwaysWhite}
                            />
                        </ViewComponent>

                        {/* This content is now correctly centered by the LinearGradient's style */}
                        <ViewComponent style={[commonStyles.alignCenter]}>
                            <TextMultiLanguage
                                text="GLOBAL_CONSTANTS.WELCOME_TO"
                                style={[commonStyles.textAlwaysWhite, commonStyles.fs36, commonStyles.fw700]}
                            />
                            <TextMultiLanguage
                                text={"GLOBAL_CONSTANTS.THE_BULLSWIPE"}
                                style={[commonStyles.textAlwaysWhite, commonStyles.fs36, commonStyles.fw700]}
                            />
                            <TextMultiLanguage
                                text={"GLOBAL_CONSTANTS.COMMUNITY"}
                                style={[commonStyles.textAlwaysWhite, commonStyles.fs36, commonStyles.fw700]}
                            />
                        </ViewComponent>
                    </LinearGradient>
                </ImageBackgroundWrapper>
                {/* --- END OF CORRECTED SECTION --- */}


                <ViewComponent style={[commonStyles.p16,commonStyles.mt24]}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap12, commonStyles.flex1, commonStyles.justifyCenter]}>
                        <CommonTouchableOpacity style={[commonStyles.dflex, commonStyles.gap16, commonStyles.list_p14, commonStyles.alignCenter, commonStyles.px16, commonStyles.py8, commonStyles.rounded12,]}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.communityiconbg]}>
                                <FaceBook width={s(16)} height={s(16)} />
                            </ViewComponent>
                            <ViewComponent>
                                <TextMultiLanguage text="GLOBAL_CONSTANTS.FACEBOOK" style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} />
                                <ParagraphComponent text="@swokipay" style={[commonStyles.textGrey, commonStyles.fs12, commonStyles.fw400]} />
                            </ViewComponent>
                        </CommonTouchableOpacity>

                        <CommonTouchableOpacity style={[commonStyles.dflex, commonStyles.gap16, commonStyles.list_p14, commonStyles.px16, commonStyles.py8, commonStyles.rounded12]}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.communityiconbg]}>
                                <LinkedIn width={s(16)} height={s(16)} />
                            </ViewComponent>
                            <ViewComponent>
                                <TextMultiLanguage text="GLOBAL_CONSTANTS.LINKEDIN" style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} />
                                <ParagraphComponent text="@swokipay" style={[commonStyles.textGrey, commonStyles.fs12, commonStyles.fw400]} />
                            </ViewComponent>
                        </CommonTouchableOpacity>
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap12, commonStyles.justifyCenter, commonStyles.mt10]}>
                        <CommonTouchableOpacity style={[commonStyles.dflex, commonStyles.gap16, commonStyles.list_p14, commonStyles.alignCenter, commonStyles.px16, commonStyles.py8, commonStyles.rounded12]}>

                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.communityiconbg]}>
                                <Instagram width={s(16)} height={s(16)} />
                            </ViewComponent>
                            <ViewComponent>
                                <TextMultiLanguage text="GLOBAL_CONSTANTS.INSTAGRAM" style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} />
                                <ParagraphComponent text="@swokipay" style={[commonStyles.textGrey, commonStyles.fs12, commonStyles.fw400]} />
                            </ViewComponent>

                        </CommonTouchableOpacity>
                        <CommonTouchableOpacity style={[commonStyles.dflex, commonStyles.gap16, commonStyles.list_p14, commonStyles.p16, commonStyles.px16, commonStyles.py8, commonStyles.rounded12]}>

                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.communityiconbg]}>
                                <YouTube width={s(16)} height={s(16)} />
                            </ViewComponent>
                            <ViewComponent>
                                <TextMultiLanguage text="GLOBAL_CONSTANTS.YOUTUBE" style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} />
                                <ParagraphComponent text="@swokipay" style={[commonStyles.textGrey, commonStyles.fs12, commonStyles.fw400]} />
                            </ViewComponent>

                        </CommonTouchableOpacity>
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.sectionGap]} />
                    <ViewComponent style={[commonStyles.applycardbg, commonStyles.p16, commonStyles.rounded12]}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent]}>
                            <TextMultiLanguage text="GLOBAL_CONSTANTS.OFFICIAL_WEBSITE" style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} />
                            <CopyCard
                                onPress={() => copyToClipboard("https://swokipay.com")}
                                copyIconColor={NEW_COLOR.TEXT_GREEN}
                                size={s(24)}
                            />
                        </ViewComponent>
                        <ParagraphComponent text="https://swokipay.com" style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} />

                    </ViewComponent>
                    <ViewComponent style={[commonStyles.applycardbg, commonStyles.p16, commonStyles.rounded12, commonStyles.mt10]}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent]}>
                            <TextMultiLanguage text="GLOBAL_CONSTANTS.AFFILIATE_PROGRAMME" style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} />
                            <CopyCard
                                onPress={() => copyToClipboard("affiliates@swokipay.com")}
                                copyIconColor={NEW_COLOR.TEXT_GREEN}
                                size={s(24)}
                            />
                        </ViewComponent>
                        <ParagraphComponent text="affiliates@swokipay.com" style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} />

                    </ViewComponent>
                </ViewComponent>

            </ScrollViewComponent>

        </ViewComponent>
    );
};

export default Community;