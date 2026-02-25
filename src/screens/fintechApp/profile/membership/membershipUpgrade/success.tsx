import React, { useCallback, useEffect } from 'react';
import Container from "../../../../../components/container/container";
import { View, ScrollView, SafeAreaView, BackHandler, ImageBackground } from 'react-native';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import { s } from '../../../../../constants/styels/scale';
import { WINDOW_HEIGHT } from '../../../../../constants/styels/variables';
import { SvgUri } from 'react-native-svg';
import { useLngTranslation } from '../../../../../hooks/languagesHook/useLngTranslation';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import ButtonComponent from '../../../../../components/buttons/button';

const UpgradeMemberShipSuccess = React.memo((props: any) => {
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                backArrowButtonHandler();
                return true;
            });
        return () => backHandler.remove();

    }, []);

    const backArrowButtonHandler = useCallback(() => {
        props.navigation.navigate("UpgradeFees");
    }, [props.navigation]);
    return (
        <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
            <ImageBackground style={{ width: "100%", height: "100%" }} source={{ uri: "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/mobile-success_animation.gif" }}>
                <Container style={[commonStyles.containerBgTransparent]}>
                    <ScrollView >
                        <View style={{ marginTop: WINDOW_HEIGHT * 0.1 }}>
                            <View style={[commonStyles.mb32]} />
                            <View >
                                <SvgUri height={s(130)} width={s(130)} uri='https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/success_image.svg' style={[commonStyles.mxAuto]} />
                            </View>
                            <View style={[commonStyles.mt24]} />
                            <ParagraphComponent style={[commonStyles.fs24, commonStyles.fw600, commonStyles.textCenter, commonStyles.textWhite]} text={"GLOBAL_CONSTANTS.THANK_YOU!"} />
                            <View style={[commonStyles.mt16]} />
                            <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textGrey, commonStyles.textCenter]} text={"GLOBAL_CONSTANTS.MEMBERSHIP_SUCCUSS"} />
                            <View style={[commonStyles.mb8]} />
                            <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textGrey, commonStyles.textCenter]} text={"GLOBAL_CONSTANTS.MEMBERSHIP_NOTE"} />
                        </View>
                    </ScrollView>
                    <View >
                        <ButtonComponent
                            title={"GLOBAL_CONSTANTS.OK"}
                            customTitleStyle={undefined}
                            icon={undefined}
                            style={undefined}
                            customButtonStyle={undefined}
                            customContainerStyle={undefined}
                            backgroundColors={undefined}
                            disable={undefined}
                            loading={undefined}
                            colorful={undefined}
                            onPress={backArrowButtonHandler}
                            transparent={undefined} />
                        <View style={[commonStyles.sectionGap]}>
                        </View>
                    </View>
                </Container>
            </ImageBackground>
        </SafeAreaView>
    );
});

export default UpgradeMemberShipSuccess;


