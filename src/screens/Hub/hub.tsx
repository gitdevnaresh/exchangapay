import React, { useState } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { s } from '../../newComponents/theme/scale';
import { useThemeColors } from '../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';
import ViewComponent from '../../newComponents/view/view';
import CommonTouchableOpacity from '../../newComponents/touchableComponents/touchableOpacity';
import Container from '../../newComponents/container/container';
import { AntDesign, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { SvgUri } from 'react-native-svg';
import { HUB_SVG_URLS } from '../../assets/blobUrls';
import KycVerifyPopup from '../commonScreens/kycVerify';
import { useSelector } from 'react-redux';
import TextMultiLanguage from '../../newComponents/textComponets/multiLanguageText/textMultiLangauge';

const Hub = () => {
    const navigation = useNavigation<any>();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [kycModelVisible, setKycModelVisible] = useState<boolean>(false);
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);

    const getHubSections = (iconColor: string) => [
        {
            title: 'GLOBAL_CONSTANTS.POPULAR',
            items: [
                { label: 'GLOBAL_CONSTANTS.REFERRAL', icon: <AntDesign name="swap" size={s(24)} color={iconColor} />, navigateTo: 'ComingSoon', params: {}, isKycRequired: false },
                { label: 'GLOBAL_CONSTANTS.GIFT', icon: <Feather name="gift" size={s(24)} color={iconColor} />, navigateTo: 'ComingSoon', params: {}, isKycRequired: false },
                {
                    label: 'GLOBAL_CONSTANTS.VOUCHERS', icon:
                        <ViewComponent>
                            <SvgUri width={s(24)} height={s(24)} uri={HUB_SVG_URLS.vouchers} />
                        </ViewComponent>, navigateTo: 'ComingSoon', params: {}, isKycRequired: false
                },
                {
                    label: 'GLOBAL_CONSTANTS.CREDIT', icon:
                        <ViewComponent>
                            <SvgUri width={s(24)} height={s(24)} uri={HUB_SVG_URLS.credit} />
                        </ViewComponent>, navigateTo: 'ComingSoon', isKycRequired: false, params: {}
                },
            ],
        },
        {
            title: 'GLOBAL_CONSTANTS.CARDS',
            items: [
                { label: 'GLOBAL_CONSTANTS.APPLY', icon: <MaterialCommunityIcons name="credit-card-plus-outline" size={s(24)} color={iconColor} />, navigateTo: 'ChooseCard', isKycRequired: true, params: { pageHeader: false, customHeader: { title: "Apply Card", showBackButton: true } } },
                {
                    label: 'GLOBAL_CONSTANTS.PRIORITY', icon:
                        <ViewComponent>
                            <SvgUri width={s(24)} height={s(24)} uri={HUB_SVG_URLS.priority} />
                        </ViewComponent>,
                    navigateTo: 'PaymentPriority', isKycRequired: false, params: {}
                },
                { label: 'GLOBAL_CONSTANTS.STATEMENT', icon: <Feather name="file-text" size={s(24)} color={iconColor} />, navigateTo: 'ComingSoon', isKycRequired: false, params: {} },
                {
                    label: 'GLOBAL_CONSTANTS.SECURITY', icon:
                        <ViewComponent>
                            <SvgUri width={s(24)} height={s(24)} uri={HUB_SVG_URLS.security} />
                        </ViewComponent>,
                    navigateTo: 'Security', isKycRequired: false, params: {}
                },
            ],
        },
        {
            title: 'GLOBAL_CONSTANTS.TRANSACTIONS',
            items: [
                {
                    label: 'GLOBAL_CONSTANTS.DEPOSIT', icon:
                        <ViewComponent>
                            <SvgUri width={s(24)} height={s(24)} uri={HUB_SVG_URLS.deposit} />
                        </ViewComponent>,
                    navigateTo: 'DepositCurrencySelect',
                    isKycRequired: true,
                    params: {}
                },
                {
                    label: 'GLOBAL_CONSTANTS.SEND',
                    icon: <ViewComponent>
                        <SvgUri width={s(24)} height={s(24)} uri={HUB_SVG_URLS.send} />
                    </ViewComponent>,
                    navigateTo: 'ComingSoon', isKycRequired: true, params: {}
                },
                {
                    label: 'GLOBAL_CONSTANTS.WITHDRAW',
                    icon: <ViewComponent>
                        <SvgUri width={s(24)} height={s(24)} uri={HUB_SVG_URLS.withdraw} />
                    </ViewComponent>,
                    navigateTo: 'WithdrawSelectCurrency',
                    isKycRequired: true,
                    params: {
                        isFromHub: true
                    }
                },
                {
                    label: 'GLOBAL_CONSTANTS.RECEIVE',
                    icon: <ViewComponent>
                        <SvgUri width={s(24)} height={s(24)} uri={HUB_SVG_URLS.receive} />
                    </ViewComponent>,
                    navigateTo: 'ComingSoon',
                    isKycRequired: true,
                    params: {}
                },
                {
                    label: 'GLOBAL_CONSTANTS.SCAN',
                    icon:
                        <ViewComponent>
                            <SvgUri width={s(24)} height={s(24)} uri={HUB_SVG_URLS.scan} />
                        </ViewComponent>,
                    navigateTo: 'ComingSoon',
                    isKycRequired: true,
                    params: {}
                },
                {
                    label: 'GLOBAL_CONSTANTS.ALERT',
                    icon: <Feather name="alert-triangle" size={s(24)} color={iconColor} />,
                    navigateTo: 'ComingSoon',
                    isKycRequired: false,
                    params: {}
                },
                {
                    label: 'GLOBAL_CONSTANTS.ANALYTICS',
                    icon: <ViewComponent>
                        <SvgUri width={s(24)} height={s(24)} uri={HUB_SVG_URLS.anylatics} />
                    </ViewComponent>
                    , navigateTo: 'ComingSoon',
                    isKycRequired: false,
                    params: {}
                },
            ],
        },
        {
            title: 'GLOBAL_CONSTANTS.SUPPORT',
            items: [
                { label: 'GLOBAL_CONSTANTS.LEARN', icon: <Feather name="info" size={s(24)} color={iconColor} />, navigateTo: 'ComingSoon', isKycRequired: false, params: {} },
                { label: 'GLOBAL_CONSTANTS.COMMUNITY', icon: <Feather name="users" size={s(24)} color={iconColor} />, navigateTo: 'ComingSoon', isKycRequired: true, params: {} },
                {
                    label: 'GLOBAL_CONSTANTS.CHAT', icon:
                        <ViewComponent>
                            <SvgUri width={s(24)} height={s(24)} uri={HUB_SVG_URLS.chat} />
                        </ViewComponent>,
                    navigateTo: 'ComingSoon', isKycRequired: false, params: {}
                },
            ],
        },
    ];

    const hubSections = getHubSections(NEW_COLOR.TEXT_GREY);

    const handleNavigation = (item: any) => {
        if (item.isKycRequired && !userInfo?.isKYC) {
            setKycModelVisible(true);
        } else {
            navigation.navigate(item?.navigateTo || 'ComingSoon', item?.params);
        }
    };

    const renderHubContent = () => (
        <Container style={[commonStyles.screenBg]}>
            {hubSections?.map((section, sectionIndex) => (
                <ViewComponent key={sectionIndex} style={[commonStyles.titleSectionGap]}>
                    <TextMultiLanguage style={[commonStyles.fs14, commonStyles.fw700, commonStyles.textWhite, commonStyles.mb12]} text={section.title} />

                    <ViewComponent style={[commonStyles.dflex, { gap: s(52) }, commonStyles.flexWrap]}>
                        {section?.items?.map((item, itemIndex) => (
                            item.label ? (
                                <CommonTouchableOpacity
                                    key={itemIndex}

                                    onPress={() => handleNavigation(item)}
                                >
                                    <ViewComponent style={[styles.quickLinkIconCircle, commonStyles?.quick_Link_Icon_Bg]}>
                                        {item.icon}
                                    </ViewComponent>
                                    <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textCenter, commonStyles.textGrey]} text={item.label} />
                                </CommonTouchableOpacity>
                            ) : (
                                <ViewComponent key={itemIndex} style={[commonStyles.sectionGap]} />
                            )
                        ))}
                    </ViewComponent>
                    {sectionIndex < hubSections.length - 1 && <ViewComponent style={[commonStyles.hLine, commonStyles.mt16]} />}
                </ViewComponent>
            ))}
        </Container>
    );

    const closekycModel = () => {
        setKycModelVisible(false);
    };

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <FlatList
                ListHeaderComponent={renderHubContent}
                data={[]}
                keyExtractor={(item, index) => `hub-dummy-${index}`}
                renderItem={() => null}
                showsVerticalScrollIndicator={false}
            />
            <ViewComponent style={[commonStyles.sectionGap]}>
                {kycModelVisible && <KycVerifyPopup closeModel={closekycModel} addModelVisible={kycModelVisible} />}
            </ViewComponent>
        </ViewComponent>
    );
};

export default Hub;

const styles = StyleSheet.create({
    quickLinkIconCircle: {
        borderRadius: s(24),
        width: s(48),
        height: s(48),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
});
