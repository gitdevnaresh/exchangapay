import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { StyleService, useStyleSheet } from "@ui-kitten/components";
import { useDispatch } from 'react-redux';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useAuth0 } from "react-native-auth0";
import { isLogin, loginAction, setLogin, setUserInfo } from '../../../redux/actions/actions';
import Container from '../../../newComponents/container/container';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import AntDesign from '@expo/vector-icons/AntDesign';
import { s } from '../../../newComponents/theme/scale';
import ViewComponent from '../../../newComponents/view/view';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ButtonComponent from '../../../newComponents/buttons/button';
import ConfirmLogout from '../../commonScreens/confirmLogout/comfirmLogout';
import { store } from '../../../redux/reducers';
import { getTabsConfigation } from '../../../../configuration';
import { isErrorDispaly, userDetails } from '../../../utils/helpers';
import { FrontEggService } from '../../../apiServices/fronteggApiServices/fronteggServices';
import { showAppToast } from '../../../newComponents/ToasterMessages/ShowMessage';
import Keychain from 'react-native-keychain';
import { logout } from "@frontegg/react-native";

const ActionRestricted = () => {

    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const navigation = useNavigation<any>();
    const Configuration: any = useMemo(
        () => getTabsConfigation("IDENITY_CONFIG"),
        []
    );
    const dispatch = useDispatch();
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [isLogoutLoading, setIsLogoutLoading] = useState<boolean>(false);
    const handleLgout = async () => {
        setIsLogoutLoading(true);
        store.dispatch(setLogin(''))
        dispatch(loginAction(null))
        if (Configuration.FFRONTEGG?.enabled === true) {
            if (Configuration.FFRONTEGG?.manualForm) {
                try {
                    const refresh = await userDetails();
                    const reponse = await FrontEggService.userLogOut({
                        refreshId: refresh
                    });
                } catch (e) {
                    const errorMessage = isErrorDispaly(e);
                    showAppToast(errorMessage, "error");
                    return;
                }
            } else {
                await logout();//sdk
            }

        };
        await Keychain.resetGenericPassword({ service: 'authTokens' });
        setIsLogoutLoading(false);
        setTimeout(() => {
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [{ name: "SplaceScreen" }],
                })
            );
        }, 1000);
    };
    const handleClose = () => {
        setIsVisible(false)
    };
    const handleConfirm = () => {
        setIsVisible(false);
        handleLgout();
    };






    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            <Container >
                <ViewComponent style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mt60]}>
                    <ViewComponent style={[commonStyles.alignCenter]}>
                        <ViewComponent style={[commonStyles.sectionGap]}>
                            <AntDesign name={"exclamationcircleo"} color={"yellow"} size={s(50)} style={[commonStyles.mxAuto]} />
                        </ViewComponent>

                        <TextMultiLanguage
                            style={[
                                commonStyles.textCenter,
                                commonStyles.textWhite,
                                commonStyles.fs24,
                                commonStyles.fw700,
                                commonStyles.mb16
                            ]}
                            text={"GLOBAL_CONSTANTS.ACTION_RESTRICTED"}
                        />

                        <ViewComponent>
                            <TextMultiLanguage
                                style={[
                                    commonStyles.textGrey,
                                    commonStyles.textCenter,
                                    commonStyles.fw400,
                                    commonStyles.fs14
                                ]}
                                text={"GLOBAL_CONSTANTS.ADMIN_ACCOUNTS_CAN_NOT_SWITCH_TO_USER_ACCOUNT"}
                            />
                        </ViewComponent>
                    </ViewComponent>
                </ViewComponent>
                <ViewComponent style={[commonStyles.sectionGap]}>

                    <ButtonComponent
                        title={"GLOBAL_CONSTANTS.LOG_OUT"}
                        solidBackground={true}
                        onPress={handleConfirm}
                        customButtonStyle={[{ backgroundColor: NEW_COLOR.LOGIN_BTN }]}
                        loading={isLogoutLoading}
                    />
                </ViewComponent>
            </Container>
            <ConfirmLogout
                isVisible={isVisible}
                onClose={handleClose}
                onConfirm={handleLgout} />
        </ViewComponent>
    );
};

export default ActionRestricted;


