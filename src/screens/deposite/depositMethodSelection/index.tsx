import React, { useCallback, useEffect } from 'react';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { s } from '../../../newComponents/theme/scale';
import Container from '../../../newComponents/container/container';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import ViewComponent from '../../../newComponents/view/view';
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused, useNavigation } from '@react-navigation/native';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import { useLngTranslation } from '../../../hooks/useLngTranslation';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import { ActionLogParams, useActionLogging } from '../../../hooks/loggingHook';
import { CRYPTO_CONSTANTS } from '../constants';
import { BackHandler } from 'react-native';
import { DepositMethodSelectNavigation, DepositMethodSelectProps } from '../interface';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import ImageUri from '../../../newComponents/imageComponents/image';


const DepositMethodSelect = React.memo((props: DepositMethodSelectProps) => {
    const navigation = useNavigation<DepositMethodSelectNavigation>();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { t } = useLngTranslation();
    const { logEvent } = useActionLogging();
    const isFocused = useIsFocused();
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { backArrowAddressbookHandler(); return true; }
        );
        return () => backHandler.remove();
    }, []);
    useEffect(() => {
        if (isFocused) {
            const screenViewData: ActionLogParams = {
                screename: 'DepositMethodSelect',
                actionName: 'Screen Loaded',
                actionType: 'View',
            };
            logEvent('screen_view', screenViewData);
        }
    }, [isFocused]);

    const backArrowAddressbookHandler = useCallback(() => {
        navigation.goBack();
    }, []);

    const handleAdressbookCryptoCoinSlct = () => {
        const actionData: ActionLogParams = {
            screename: 'DepositMethodSelect',
            actionName: 'Select On-Chain Deposit',
            actionType: 'Button',
            nextScreenName: 'DepositNetworkSelection',
            actionObj: {
                postObj: { walletCode: props?.route?.params?.walletCode, walletId: props?.route?.params?.walletId }
            }
        };
        logEvent('navigation_action', actionData);
        navigation.navigate(CRYPTO_CONSTANTS.DEPOSIT_NETWORK_SELECT_NAVIGATION, {
            walletCode: props?.route?.params?.walletCode,
            walletId: props?.route?.params?.walletId,
        })
    };
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={[commonStyles.container]}>
                <PageHeader title={"GLOBAL_CONSTANTS.SELECT_METHOD"} onBackPress={backArrowAddressbookHandler} isrefresh={false} />
                <CommonTouchableOpacity style={[commonStyles.list]} onPress={() => handleAdressbookCryptoCoinSlct()}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                        <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
                            <ImageUri uri={props?.route?.params?.logo} height={s(25)} width={s(25)} />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap10]}>
                                <ViewComponent>
                                    <ParagraphComponent text={`${props?.route?.params?.walletCode} ${t("GLOBAL_CONSTANTS.ON_CHAIN_DEPOSIT")}`} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite, commonStyles.mb2]} />
                                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.EXPECTED_TIME"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textGrey]} />
                                </ViewComponent>
                            </ViewComponent>
                        </ViewComponent>
                        <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
                    </ViewComponent>
                </CommonTouchableOpacity>
            </Container>
        </ViewComponent>
    )
})

export default DepositMethodSelect;
