import { getThemedCommonStyles } from "../../../../../../components/CommonStyles";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from "react-redux";
import React from "react";
import CommonTouchableOpacity from "../../../../../../components/touchableComponents/touchableOpacity";
import { s } from "../../../../../../constants/styels/scale";
import ViewComponent from "../../../../../../components/view/view";
import Container from "../../../../../../components/container/container";
import TextMultiLanguage from "../../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ButtonComponent from "../../../../../../components/buttons/button";
import { useThemeColors } from "../../../../../../hooks/themedHook/useThemeColors";

const PaymentNotAvailable = React.memo(({ onBackPress }: { onBackPress: () => void }) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={[commonStyles.container]}>
                {/* <PageHeader
                    title="Payment Status"
                    onBackPress={onBackPress}
                /> */}
                <ViewComponent style={[commonStyles.myAuto, commonStyles.alignCenter]}>
                    <CommonTouchableOpacity onPress={onBackPress} style={[commonStyles.mb20]}>
                        <MaterialIcons
                            name="error-outline"
                            size={s(100)}
                            color={NEW_COLOR.TEXT_YELLOW}
                        />
                    </CommonTouchableOpacity>
                    <TextMultiLanguage
                        text={`Payments are not available in your ${userInfo?.countryOfResidence || ""} country at the moment.`}
                        style={[commonStyles.nodatascreentitle]}
                    />
                </ViewComponent>
                <ViewComponent style={[commonStyles.titleSectionGap]}>
                    <ButtonComponent
                        title="GLOBAL_CONSTANTS.BACK"
                        onPress={onBackPress}
                    />
                </ViewComponent>
            </Container>
        </ViewComponent>
    );
});

export default PaymentNotAvailable;