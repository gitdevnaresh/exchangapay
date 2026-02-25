import React, { useState } from 'react';
import { s } from '../../../../constants/styels/scale';
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import ViewComponent from '../../../../components/view/view';
import Container from '../../../../components/container/container';
import ButtonComponent from '../../../../components/buttons/button';
import TextMultiLanguage from '../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import CardLogoComponent from '../../../../components/arthacardlogo/cardlogo';
import { AccessDinied } from '../../../../assets/svg';
import useLogout from '../../../../hooks/logout/useLogout';
import { useNavigation } from '@react-navigation/native';
import { AccessDeniedProps } from '../interface';

const AccessDenied = React.memo((props: AccessDeniedProps) => {
    const [loading, setLoading] = useState(false);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { logout } = useLogout();
    const navigation = useNavigation();

    const handleLogout = async () => {
        setLoading(true);
        await logout();
        setLoading(false);
    };
    const Title = props?.route?.params?.AccessDenied ? "GLOBAL_CONSTANTS.GO_BACK" : "GLOBAL_CONSTANTS.LOG_OUT";
    const Message = props?.route?.params?.AccessDenied ? "GLOBAL_CONSTANTS.NO_PERMISSION_TO_VIEW_PAGE" : "GLOBAL_CONSTANTS.ACCESS_DENIED_CONTENT";
    const buttonAction = () => {
        if (props?.route?.params?.AccessDenied) {
            navigation.goBack();
        }
        else {
            handleLogout();
        }
    }

    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            <Container style={[commonStyles.container]}>
                <ViewComponent style={[commonStyles.titleSectionGap]} />
                <ViewComponent style={[commonStyles.mxAuto]}>
                    <CardLogoComponent />
                </ViewComponent>
                <ViewComponent style={[commonStyles.flex1]}>
                    <ViewComponent style={[commonStyles.myAuto]}>
                        <ViewComponent style={[commonStyles.mxAuto, , commonStyles.sectionGap]}>
                            <AccessDinied width={s(300)} height={s(200)} />
                        </ViewComponent>
                        <TextMultiLanguage
                            text={"GLOBAL_CONSTANTS.ACCESS_DENIED"}
                            style={[
                                commonStyles.sectionTitle, commonStyles.textCenter, commonStyles.mb6
                            ]}
                        />
                        <TextMultiLanguage
                            text={Message}
                            style={[
                                commonStyles.sectionsubtitlepara, commonStyles.textCenter
                            ]}
                        />
                    </ViewComponent>
                </ViewComponent>
                <ViewComponent style={[commonStyles.sectionGap]}>
                    <ButtonComponent
                        title={Title}
                        onPress={buttonAction}
                        loading={loading}
                    />
                </ViewComponent>

            </Container>
        </ViewComponent>
    );
});

export default AccessDenied; 
