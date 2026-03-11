
import { useNavigation, CommonActions } from "@react-navigation/native"
import { PendingPayments } from "../../../../../../../assets/svg"
import { getThemedCommonStyles } from "../../../../../../../components/CommonStyles"
import Container from "../../../../../../../components/container/container"
import { useThemeColors } from "../../../../../../../hooks/themedHook/useThemeColors"
import ButtonComponent from "../../../../../../../components/buttons/button"
import TextMultiLanguage from "../../../../../../../components/textComponets/multiLanguageText/textMultiLangauge"
import { s } from "../../../../../../../components/theme/scale"
import ViewComponent from "../../../../../../../components/view/view"
import { useHardwareBackHandler } from "../../../../../../../hooks/backHandleHook"
import PageHeader from "../../../../../../../components/pageHeader/pageHeader"
import { useSelector } from "react-redux"
import ParagraphComponent from "../../../../../../../components/textComponets/paragraphText/paragraph"
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TouchableOpacity, Linking } from 'react-native'
import { useLngTranslation } from "../../../../../../../hooks/languagesHook/useLngTranslation"
import { supportMail, getTabsConfigation, walletsTabsNavigation } from '../../../../../../../../configuration'

const PaymentPending = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const navigation = useNavigation<any>()
    const status = props.route.params?.status || 'pending';
    const remarks = props.route.params?.remarks;
    const hasAccountCreationFee = props.route.params?.hasAccountCreationFee;
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const { t } = useLngTranslation();
    const isRejected = status?.toLowerCase() === 'rejected';
    const walletsConfig = getTabsConfigation('WALLETS');
    const canShowBRLReapply = walletsConfig?.BRL_Reapply;
    useHardwareBackHandler(() => {
        handleDashBoard();
    });

    const handleDashBoard = () => {
        const sourceScreen = props.route.params?.sourceScreen;
        if (props.route.params?.screenName === "Wallets") {
            if (sourceScreen === "WalletsAllCoinsList") {
                navigation.navigate(walletsTabsNavigation, { initialTab: 1, animation: "slide_from_left" });
            } else if (sourceScreen === "WalletsAssetsSelector") {
                navigation.navigate("WalletsAssetsSelector", {
                    screenType: 'deposit',
                    title: 'GLOBAL_CONSTANTS.SELECT_ASSET_FOR_DEPOSIT',
                    animation: "slide_from_left"
                });
            } else {
                navigation.navigate("Dashboard", { screen: "GLOBAL_CONSTANTS.WALLETS", animation: "slide_from_left" });
            }
        } else if (props.route.params?.screenName === "banks") {
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{
                        name: 'Dashboard',
                        params: {
                            initialTab: "GLOBAL_CONSTANTS.WALLETS",
                            animation: "slide_from_left"
                        }
                    }],
                })
            );
        } else {
            navigation.navigate("Dashboard", { screen: "GLOBAL_CONSTANTS.PAYMENTS" });
        }
    }

    const handleClickMail = () => {
        const url = `mailto:${userInfo?.metadata?.AdminEmail || supportMail}`;
        Linking.openURL(url)
    }
    return (

        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={commonStyles.container}>
                <PageHeader
                    title={props.route.params?.screenName === "Wallets" ? (isRejected ? "Rejected" : "Pending") :
                        props.route.params?.screenName === "banks" ? "GLOBAL_CONSTANTS.BANK_ACCOUNT" :
                            isRejected ? "Rejected" : "Pending"}
                    onBackPress={handleDashBoard}
                />
                <ViewComponent style={[commonStyles.myAuto]}>
                    <ViewComponent style={[commonStyles.mxAuto, commonStyles.sectionGap]}>
                        {isRejected ? (
                            <Ionicons
                                name="close-circle-outline"
                                size={s(140)}
                                color={NEW_COLOR.TEXT_RED}
                                style={[commonStyles.mxAuto]}
                            />
                        ) : (
                            <PendingPayments width={s(140)} height={s(140)} />
                        )}
                    </ViewComponent>
                    <TextMultiLanguage
                        text={isRejected ? "GLOBAL_CONSTANTS.REJECTED" :
                            status === 'submitted' ? "GLOBAL_CONSTANTS.SUBMITTED" : "GLOBAL_CONSTANTS.PENDING"}
                        style={[commonStyles.sectionTitle, commonStyles.mb6, commonStyles.textCenter]}
                    />
                    {isRejected ? (
                        <>
                            <TextMultiLanguage
                                text="GLOBAL_CONSTANTS.REJECTED_INFO"
                                style={[commonStyles.sectionsubtitlepara, commonStyles.textCenter, commonStyles.mb6]}
                            />
                            {remarks && (
                                <ParagraphComponent
                                    text={`Due to ${remarks}`}
                                    style={[commonStyles.sectionsubtitlepara, commonStyles.textCenter, commonStyles.mb6]}
                                />
                            )}
                            <TextMultiLanguage
                                text="GLOBAL_CONSTANTS.PLEASE_CONTACT"
                                style={[commonStyles.sectionsubtitlepara, commonStyles.textCenter]}
                            />
                            <TouchableOpacity onPress={handleClickMail}>
                                <ParagraphComponent
                                    text={userInfo?.metadata?.AdminEmail || supportMail}
                                    style={[commonStyles.textlinks, commonStyles.textCenter, commonStyles.mt4]}
                                />
                            </TouchableOpacity>
                            <TextMultiLanguage
                                text="GLOBAL_CONSTANTS.FOR_MORE_DETAILS"
                                style={[commonStyles.sectionsubtitlepara, commonStyles.textCenter, commonStyles.mt4]}
                            />
                        </>
                    ) : (
                        <>
                            <TextMultiLanguage
                                style={[commonStyles.secondarytext, commonStyles.textCenter]}
                                text={`${t("GLOBAL_CONSTANTS.YOUR_ACCOINT")}${props.route.params?.screenName === "Wallets" ? "BRL" : ''}${t("GLOBAL_CONSTANTS.BRL_ACCOUNT_CREATION_NOTE")}`}
                            />
                            <TouchableOpacity onPress={handleClickMail}>
                                <ParagraphComponent
                                    style={[
                                        commonStyles.textCenter,
                                        commonStyles.textlinks,
                                        commonStyles.mt8
                                    ]}
                                    text={userInfo?.metadata?.AdminEmail || supportMail}
                                />
                            </TouchableOpacity>
                        </>
                    )}
                    {hasAccountCreationFee && parseFloat(String(hasAccountCreationFee)) > 0 && (
                        <TextMultiLanguage
                            style={[commonStyles.secondarytext, commonStyles.textCenter, commonStyles.mt8]}
                            text={"GLOBAL_CONSTANTS.ACCOUNT_OPENING_FEE"}
                        />
                    )}

                </ViewComponent>
                <ViewComponent style={[commonStyles.dflex]} />
                {isRejected && props.route.params?.screenName === "Wallets" && canShowBRLReapply ? (
                    <ButtonComponent
                        title="GLOBAL_CONSTANTS.BANK_REAPPLY"
                        onPress={() => {
                            navigation.navigate("EnableProvider", {
                                VaultData: props.route.params?.VaultData,
                                screenName: "Wallets",
                                isReApply: true
                            })
                        }}
                    />
                ) : (
                    <ButtonComponent
                        title={props.route.params?.screenName === "banks" || props.route.params?.screenName === "Wallets" ?
                            "GLOBAL_CONSTANTS.BACK_TO_WALLETS" : "GLOBAL_CONSTANTS.BACK_TO_DASHBOARD"}
                        onPress={() => {
                            if (props.route.params?.screenName === "banks" || props.route.params?.screenName === "Wallets") {
                                navigation.navigate("Dashboard", { screen: "GLOBAL_CONSTANTS.WALLETS", animation: "slide_from_left" });
                            } else {
                                handleDashBoard();
                            }
                        }}
                    />
                )}
                <ViewComponent style={[commonStyles.sectionGap]} />

            </Container>

        </ViewComponent>
    )
}
export default PaymentPending;
