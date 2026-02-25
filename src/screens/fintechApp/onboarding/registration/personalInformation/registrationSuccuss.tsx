import React, { useState } from 'react';
import { s } from '../../../../../constants/styels/scale';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import ViewComponent from '../../../../../components/view/view';
import Container from '../../../../../components/container/container';
import ButtonComponent from '../../../../../components/buttons/button';
import TextMultiLanguage from '../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import CardLogoComponent from '../../../../../components/arthacardlogo/cardlogo';
import { RegisterSuccessfull, } from '../../../../../assets/svg';
import useLogout from '../../../../../hooks/logout/useLogout';
import { getTabsConfigation } from '../../../../../../configuration';

const RegistrationSuccess = React.memo(() => {
    const [loading, setLoading] = useState(false);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { logout } = useLogout();
    const identityConfig = getTabsConfigation("IDENITY_CONFIG");

    const handleLogout = async () => {
        setLoading(true);
        try {
            let navigationPath = identityConfig?.AUTH0 ? "Auth0Signin" : "";
            await logout(identityConfig?.AUTH0_SDK_LOGIN, navigationPath);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            <Container style={[commonStyles.container]}>
                <ViewComponent style={[commonStyles.titleSectionGap]} />
                <ViewComponent style={[commonStyles.mxAuto]}>
                    <CardLogoComponent />
                </ViewComponent>
                {/* <ViewComponent style={[commonStyles.titleSectionGap]} />
                <AlertsCarousel commonStyles={commonStyles} screenName='Onbaording' /> */}
                <ViewComponent style={[commonStyles.flex1]}>
                    <ViewComponent style={[commonStyles.myAuto]}>
                        <ViewComponent style={[commonStyles.mxAuto,]}>
                            <RegisterSuccessfull width={s(300)} height={s(200)} />
                        </ViewComponent>
                        <TextMultiLanguage
                            text={"GLOBAL_CONSTANTS.REGISTRATION_COMPLTED_MESSAGE"}
                            style={[
                                commonStyles.nodatascreentitle
                            ]}
                        />
                        <TextMultiLanguage
                            text={"GLOBAL_CONSTANTS.THANk_YOU_FOR_SIGNINGUP_PLEASE_LOG_IN_TO_CONTINUE_YOUR_ONBOARDING_PROCESS"}
                            style={[
                                commonStyles.nodatascreenPara
                            ]}
                        />
                    </ViewComponent>
                </ViewComponent>
                <ViewComponent style={[commonStyles.sectionGap]}>
                    <ButtonComponent
                        title={"GLOBAL_CONSTANTS.LOG_IN_NOW"}
                        onPress={handleLogout}
                    />
                </ViewComponent>

            </Container>
        </ViewComponent>
        // <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
        //     <Container style={[commonStyles.container]}>
        //         <ViewComponent>
        //             <ViewComponent style={[commonStyles.mxAuto]}>
        //                 <CardLogoComponent />
        //             </ViewComponent>
        //             <ViewComponent style={[commonStyles.mxAuto]}>
        //                 <RegisterSuccessfull width={s(300)} height={s(300)} />
        //             </ViewComponent>
        //         </ViewComponent>
        //     </Container>
        // </ViewComponent>







    );
});

export default RegistrationSuccess; 
