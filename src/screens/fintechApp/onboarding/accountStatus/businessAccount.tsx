import React, { useState } from 'react';
import { s } from '../../../../constants/styels/scale';
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import ViewComponent from '../../../../components/view/view';
import Container from '../../../../components/container/container';
import ButtonComponent from '../../../../components/buttons/button';
import TextMultiLanguage from '../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import CardLogoComponent from '../../../../components/arthacardlogo/cardlogo';
import { BusinessRegisterSuccessfull } from '../../../../assets/svg';
import { getAllEnvData } from '../../../../../Environment';
import ConfirmLogout from '../../../commonScreens/logout/comfirmLogout';
import { Linking } from 'react-native';
import CommonTouchableOpacity from '../../../../components/touchableComponents/touchableOpacity';
import useLogout from '../../../../hooks/logout/useLogout';

const BusinessLogin = React.memo(() => {
    const [logoutLoader, setLogoutLoder] = useState<boolean>(false);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { oAuthConfig } = getAllEnvData();
    const AppUrl = oAuthConfig?.sumsubWebUrl
    const [isVisible, setIsVisible] = useState(false);
    const { logout } = useLogout();
    const handleLgout = async () => {
        setLogoutLoder(true);
        await logout();
        setLogoutLoder(false);
    };
    const handleClose = () => {
        setIsVisible(false)
    }
    const handleConfirm = async () => {
        setIsVisible(false)
        handleLgout();
    }
    const handleLogoutBtn = () => {
        setIsVisible(true)
    }
    const handleRedirectWeb = () => {
        Linking.canOpenURL(AppUrl)
            .then((supported) => {
                if (supported) {
                    return Linking.openURL(AppUrl);
                }
            })
            .catch((err) => {
            });

    };
    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            <Container style={[commonStyles.container]}>
                <ViewComponent style={[commonStyles.titleSectionGap]} />
                <ViewComponent style={[commonStyles.mxAuto]}>
                    <CardLogoComponent />
                </ViewComponent>
                <ViewComponent style={[commonStyles.flex1]}>
                    <ViewComponent style={[commonStyles.myAuto]}>
                        <ViewComponent style={[commonStyles.mxAuto]}>
                            <BusinessRegisterSuccessfull width={s(300)} height={s(200)} />
                        </ViewComponent>
                        <TextMultiLanguage
                            text={"GLOBAL_CONSTANTS.LOGIN_WITH_BUSINESS_DESCRIPTION"}
                            style={[
                                commonStyles.sectiontitlepara, commonStyles.textCenter
                            ]}
                        />
                        <CommonTouchableOpacity onPress={handleRedirectWeb} >
                        </CommonTouchableOpacity>
                    </ViewComponent>

                </ViewComponent>
                <ViewComponent >
                    <ButtonComponent
                        title={"GLOBAL_CONSTANTS.CONTINUE_PROCESS"}
                        onPress={handleRedirectWeb}
                    />
                </ViewComponent>
                <ViewComponent style={[commonStyles.buttongap]} />
                <ViewComponent style={[commonStyles.sectionGap]}>
                    <ButtonComponent
                        title={"GLOBAL_CONSTANTS.LOGOUT"}
                        onPress={handleLogoutBtn}
                        solidBackground={true}
                        loading={logoutLoader}
                    />
                </ViewComponent>
                <ConfirmLogout
                    isVisible={isVisible}
                    onClose={handleClose}
                    onConfirm={handleConfirm} />

            </Container>
        </ViewComponent>

    );
});

export default BusinessLogin; 
