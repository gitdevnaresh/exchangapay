import React, { useEffect } from 'react';
import { BackHandler, useColorScheme } from 'react-native';
import SafeAreaViewComponent from '../../../components/safeArea/safeArea';
import ViewComponent from '../../../components/view/view';
import ImageUri from '../../../components/imageComponents/image';
import TextMultiLangauge from '../../../components/textComponets/multiLanguageText/textMultiLangauge';
import ButtonComponent from '../../../components/buttons/button';
import { s } from '../../../constants/styels/scale';
import { getThemedCommonStyles, SUCCESS_IMG } from '../../../components/CommonStyles';
import { useLngTranslation } from '../../../hooks/languagesHook/useLngTranslation';
import { CurrencyText } from '../../../components/textComponets/currencyText/currencyText';
import { useThemeColors } from '../../../hooks/themedHook/useThemeColors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SvgUri } from 'react-native-svg';
import { useSelector } from 'react-redux';
import { isDecimalSmall } from '../../../../configuration';


interface CommonSuccessProps {
    navigation?: any;
    successMessage: string; // Success message passed as prop
    subtitle?: string;// Subtitle passed as prop
    buttonText: string; // Button text passed as prop
    buttonAction: () => void; // Button action passed as prop
    secondaryButtonText?: string;
    secondaryButtonAction?: () => void;
    backgroundImage?: string; // Image background URL passed as prop
    imageSrc?: string; // Image source URL passed as prop
    transactionId?: string;
    amount?: string | number;
    prifix?: string;
    cardName?: string
    isCardTopUp?: boolean,
    amountIsDisplay?: boolean,
    showDeductionMessage?: boolean,
    WithdrawMsg?: string,
    decimals?: number;
    note?: string;
    isSuccessMessage?: boolean;
}

const CommonSuccess = React.memo((props: CommonSuccessProps) => {
    const {
        navigation,
        successMessage,
        subtitle,
        note,
        buttonText,
        buttonAction,
        secondaryButtonText,
        secondaryButtonAction,
        backgroundImage = "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/mobile-success_animation.gif",
        imageSrc = 'https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/applysuccessimg.svg',
        transactionId,
        amount,
        prifix,
        cardName,
        isCardTopUp = false,
        amountIsDisplay = true,
        showDeductionMessage = false,
        WithdrawMsg,
        decimals = 2,
        isSuccessMessage = true
    } = props;
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { backArrowHomeButtonHandler(); return true; }
        );
        return () => backHandler.remove();
    }, []);

    const backArrowHomeButtonHandler = () => {
        navigation?.navigate("Dashboard");
    };
    const appThemeSetting = useSelector((state: any) => state.userReducer?.appTheme);
    const colorScheme = useColorScheme();

    const isDarkTheme =
        appThemeSetting !== 'system'
            ? appThemeSetting === 'dark'
            : colorScheme === 'dark';

    const uri = isDarkTheme ? SUCCESS_IMG.dark : SUCCESS_IMG.light;

    return (
        <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.screenBg, { backgroundColor: "transparent" }]}>
            <ViewComponent>
                <ViewComponent style={[{ width: s(110), height: s(110) }, commonStyles.mxAuto]}>
                    <SvgUri height={s(120)} width={s(120)} uri={uri} />
                </ViewComponent>
                <ViewComponent style={[commonStyles.mt24]} />
                {isSuccessMessage && <TextMultiLangauge style={[commonStyles.successtitletext, commonStyles.textCenter, !amountIsDisplay && commonStyles.titleSectionGap]} text={successMessage} />}
                {WithdrawMsg && <TextMultiLangauge text={WithdrawMsg || ''} style={[commonStyles.Successpara, commonStyles.textCenter]} />
                }
                {amountIsDisplay &&
                    <ViewComponent style={[]}>
                        <CurrencyText
                            value={amount || 0}
                            currency={prifix}
                            decimalPlaces={decimals}
                            smallDecimal={isDecimalSmall}
                            style={[
                                commonStyles.transactionamounttext,
                            ]}

                        />
                    </ViewComponent>}
                {showDeductionMessage && <TextMultiLangauge text="GLOBAL_CONSTANTS.HAS_BEEN_DEDUCTED_FROM_YOUR_ACCOUNT" style={[commonStyles.sectionsubtitlepara, commonStyles.textCenter, commonStyles.sectionGap]} />}
                {isCardTopUp && <TextMultiLangauge text={`${t("GLOBAL_CONSTANTS.YOUR")} ${cardName},`} style={[commonStyles.Successpara, commonStyles.textCenter]} />}
                {note &&
                    <ViewComponent style={[commonStyles.bgnote]}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                            <MaterialIcons name="info-outline" size={s(18)} color={NEW_COLOR.NOTE_ICON} />
                            <TextMultiLangauge text={t(note)} style={[commonStyles.bgNoteText, commonStyles.flex1]} />
                        </ViewComponent>
                    </ViewComponent>
                }
                {subtitle && <TextMultiLangauge text={subtitle} style={[commonStyles.Successpara, commonStyles.textCenter]} />}
                {transactionId && (
                    <ViewComponent style={[commonStyles.mt30]}>
                        <TextMultiLangauge
                            text={`${t("GLOBAL_CONSTANTS.TRANSACTIONS_ID")}: ${transactionId}`}
                            style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textlinkgrey, commonStyles.textCenter]}
                        />
                    </ViewComponent>
                )}
            </ViewComponent>

            <ViewComponent style={[commonStyles.sectionGap]} />
            {/* </ScrollViewComponent> */}
            <ViewComponent style={[commonStyles.mt30]}>
                <ButtonComponent
                    title={buttonText}
                    customTitleStyle={undefined}
                    multiLanguageAllows={true}
                    onPress={buttonAction}
                    disable={false}
                    loading={false}
                    icon={undefined}
                    customButtonStyle={undefined}
                />
                {secondaryButtonText && (
                    <ViewComponent style={[commonStyles.buttongap]}>
                        <ButtonComponent
                            title={secondaryButtonText}
                            onPress={secondaryButtonAction}
                            solidBackground={true}
                            multiLanguageAllows={true}
                        />
                    </ViewComponent>
                )}
            </ViewComponent>
        </SafeAreaViewComponent>
    );
});

export default CommonSuccess;

