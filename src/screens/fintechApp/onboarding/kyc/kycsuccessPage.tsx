import React, { useEffect } from 'react';
import { StyleService } from '@ui-kitten/components';
import { View, ScrollView, BackHandler } from 'react-native';
import Container from '../../../../components/container/container';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import { useSelector } from 'react-redux';
import { SvgUri } from 'react-native-svg';
import { s } from '../../../../constants/styels/scale';
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import ButtonComponent from '../../../../components/buttons/button';
import ViewComponent from '../../../../components/view/view';
import ParagraphComponent from '../../../../components/textComponets/paragraphText/paragraph';

const CompleteKyc = React.memo((props: any) => {
    const userinfo = useSelector((state: any) => state.userReducer?.userDetails);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { backArrowHomeButtonHandler(); return true; }
        );
        return () => backHandler.remove();

    }, [])
    const backArrowHomeButtonHandler = () => {
        props?.navigation?.navigate("Dashboard", {})
    };
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={[commonStyles.containerBgTransparent]}>
                <ScrollView contentContainerStyle={[commonStyles.justifyCenter, { flexGrow: 1 }]}>
                    <ViewComponent style={[commonStyles.myAuto]}>
                        <View>
                            <View >
                                <SvgUri height={s(130)} width={s(130)} uri='https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/applysuccessimg.svg' style={[commonStyles.mxAuto]} />
                            </View>
                            <View style={[commonStyles.mt24]} />
                            <ParagraphComponent style={[commonStyles.fs20, commonStyles.fw600, commonStyles.textCenter, commonStyles.textWhite]} text={"GLOBAL_CONSTANTS.SUCCESS"} />
                            <View style={[commonStyles.mb8]} />
                            <ParagraphComponent text={`${userinfo?.accountType != "Business" && "GLOBAL_CONSTANTS.KYC_SUCCESS_MESSAGE" || "GLOBAL_CONSTANTS.KYB_SUCCESS_MESSAGE"}`} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textlinkgrey, commonStyles.textCenter]} />
                            <View style={[commonStyles.mt40]}>
                                <ButtonComponent
                                    title="GLOBAL_CONSTANTS.GO_TO_HOME"
                                    onPress={backArrowHomeButtonHandler}
                                />
                            </View>

                        </View>


                    </ViewComponent>



                </ScrollView>

            </Container>
        </ViewComponent>
    );
});

export default CompleteKyc;

const themedStyles = StyleService.create({

});

