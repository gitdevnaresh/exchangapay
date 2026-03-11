import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";
import { useThemeColors } from "../../../hooks/useThemeColors";
import Container from "../../../newComponents/container/container";
import PageHeader from "../../../newComponents/pageHeader/pageHeader";
import ScrollViewComponent from "../../../newComponents/scrollView/scrollView";
import ViewComponent from "../../../newComponents/view/view";
import { useState } from "react";
import { useHardwareBackHandler } from "../../../hooks/HardwareBackHandler";
import CommonTouchableOpacity from "../../../newComponents/touchableComponents/touchableOpacity";
import { s } from "../../../constants/theme/scale";
import { Ionicons, Feather } from '@expo/vector-icons';
import TextMultiLanguage from "../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import InactiveAccountPopup from "../../commonScreens/inactiveSheet/accountInactive";
import { useSelector } from "react-redux";
import ImageUri from "../../../newComponents/imageComponents/image";
import { PROFILE_URLS } from "../../../assets/blobUrls";

const PaymentAlerts = ({ navigation }: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [isInactive, setIsInactive] = useState<boolean>(false);
    const userInfo = useSelector((state: any) => state.userReducer.userDetails);

    useHardwareBackHandler(() => {
        handleBackPress();
    });

    const handleBackPress = () => {
        navigation.navigate("NewProfile", { animation: 'slide_from_left' });
    };

    const handleClose = () => {
        setIsInactive(false);
    };
    const handlePaymentPriorityPress = () => {
        if (userInfo?.customerAccountStatus === false) {
            setIsInactive(true); // Open the inactive account popup
            return;
        }
        navigation.navigate('PaymentPriority');
    }

    const handleLowBalanceAlertPress = () => {
        if (userInfo?.customerAccountStatus === false) {
            setIsInactive(true); // Open the inactive account popup
            return;
        }
        navigation.navigate("LowbalanceAlert")
    }
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <ScrollViewComponent showsVerticalScrollIndicator={false}>
                <Container style={[commonStyles.container]}>
                    <PageHeader title={"GLOBAL_CONSTANTS.TRANSACTION_PREFERENCES"} onBackPress={handleBackPress} />
                    <CommonTouchableOpacity onPress={handlePaymentPriorityPress}>
                        <ViewComponent style={commonStyles.profileMenuItemRow} >
                            <ViewComponent style={commonStyles.profileMenuItemLeft} >
                                <ViewComponent style={[commonStyles.quicklinks, commonStyles.profileMenuIconContainer]} >
                                    <ImageUri uri={PROFILE_URLS.paymentPriority} height={s(16)} width={s(16)} />
                                </ViewComponent>
                                <TextMultiLanguage text={"GLOBAL_CONSTANTS.PAYMENTPRIORITY"} style={commonStyles.profileMenuItemText} />
                            </ViewComponent>
                            <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
                        </ViewComponent>
                    </CommonTouchableOpacity>
                    <ViewComponent style={[commonStyles.mb10]} />
                    <CommonTouchableOpacity onPress={handleLowBalanceAlertPress}>
                        <ViewComponent style={commonStyles.profileMenuItemRow} >
                            <ViewComponent style={commonStyles.profileMenuItemLeft} >
                                <ViewComponent style={[commonStyles.quicklinks, commonStyles.profileMenuIconContainer]} >
                                    <Feather name="alert-triangle" size={s(18)} color={NEW_COLOR.TEXT_WHITE} />
                                </ViewComponent>
                                <TextMultiLanguage text={"GLOBAL_CONSTANTS.LOWBALANCEALERT"} style={commonStyles.profileMenuItemText} />
                            </ViewComponent>
                            <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
                        </ViewComponent>
                    </CommonTouchableOpacity>
                </Container>
                {isInactive && (<InactiveAccountPopup isVisibleModel={isInactive} onClose={handleClose} />)}
            </ScrollViewComponent>
        </ViewComponent>
    );
};


export default PaymentAlerts;