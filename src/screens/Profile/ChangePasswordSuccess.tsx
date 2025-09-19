import React, { useEffect } from 'react';
import { View, SafeAreaView, ScrollView, TouchableOpacity, Image, ImageBackground, Platform, BackHandler } from 'react-native';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import { Container } from '../../components';
import { NEW_COLOR } from '../../constants/theme/variables';
import AntDesign from "react-native-vector-icons/AntDesign";
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import DefaultButton from '../../components/DefaultButton';
import Feather from "react-native-vector-icons/Feather";
import checkmark from '../../assets/images/cards/submitted.png'
import { commonStyles } from '../../components/CommonStyles';
import { useSelector } from 'react-redux';
import useEncryptDecrypt from '../../hooks/useEncryption_Decryption';
const ChangePasswordSuccess = React.memo((props: any) => {
    const styles = useStyleSheet(themedStyles);
    const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);
    const { decryptAES } = useEncryptDecrypt();
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleBackToHome(); return true; }
        );
        return () => backHandler.remove();
    }, []);
    const handleBackToHome = () => {
        props?.navigation?.navigate("Security")
    }
    return (

        <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
            <ScrollView>
                <Container style={[commonStyles.container,]}>
                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.justifyContent, commonStyles.mb43]}>
                        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                            <TouchableOpacity onPress={() => handleBackToHome()}>
                                <View>
                                    <AntDesign name="arrowleft" size={22} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3, }} />
                                </View>
                            </TouchableOpacity>
                            <ParagraphComponent text="Reset Password " style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800]} />
                        </View>
                    </View>
                    <View style={[commonStyles.mb16]} />
                    <ImageBackground source={require("../../assets/images/cards/light-purplebg.png")} resizeMode='contain' style={[{ position: "relative", height: 385, }]} >
                        <View style={[commonStyles.mb16]} />
                        <View style={[]}>
                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.mb16, commonStyles.mt10, { height: 196, }]}>
                                <View style={[commonStyles.flex1, commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter,]}>
                                    <View>
                                        <Image source={checkmark} style={[commonStyles.mxAuto,]} />
                                        <ParagraphComponent text="Success !" style={[commonStyles.fs20, commonStyles.fw600, commonStyles.textCenter, { color: NEW_COLOR.TEXT_BLACK }]} />
                                    </View>
                                </View>
                            </View>
                            <View style={[styles.border]} />
                            <View style={[commonStyles.mb16]} />
                            <View style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter,]}>
                                <View style={[commonStyles.flex1,]}>
                                    <ParagraphComponent text="Password reset instructions sent to " style={[commonStyles.fs14, commonStyles.textGrey, commonStyles.fw500, styles.textCenter, commonStyles.px24]}
                                        children={<ParagraphComponent text={` ${decryptAES(userInfo.email) || " "} `} style={[commonStyles.fs14, commonStyles.textBlack, commonStyles.fw700, styles.textCenter, commonStyles.mb24]}
                                            children={<ParagraphComponent text="Please check your inbox." style={[commonStyles.fs14, commonStyles.textGrey, commonStyles.fw500, styles.textCenter, commonStyles.mb24]} />}
                                        />}
                                    />
                                </View>
                            </View>
                            <View style={[commonStyles.mb16]} />
                        </View>
                    </ImageBackground>
                    {Platform.OS === 'ios' ? (
                        <View style={[]}>
                            <View style={[styles.px44, { position: "absolute", bottom: -40, width: "100%" }]}>
                                <DefaultButton
                                    customContainerStyle={{}}
                                    title='Back'
                                    style={undefined}
                                    icon={<Feather
                                        name="check"
                                        color={NEW_COLOR.TEXT_ALWAYS_WHITE}
                                        size={22}
                                        style={styles.mr8} />}
                                    loading={undefined}
                                    disable={undefined}
                                    onPress={handleBackToHome}
                                />
                            </View>
                        </View>
                    ) :
                        (
                            <View style={commonStyles.mt16}>
                                <View>
                                    <DefaultButton
                                        title='Back'
                                        style={undefined}
                                        loading={undefined}
                                        disable={undefined}
                                        onPress={handleBackToHome}
                                    />
                                </View>
                            </View>
                        )}
                </Container>
            </ScrollView>
        </SafeAreaView>

    )
});

export default ChangePasswordSuccess;

const themedStyles = StyleService.create({
    mb32: {
        marginBottom: 32,
    },
    mr8: { marginRight: 8 },
    w318: { width: 318, marginTop: -24 },
    textCenter: { textAlign: 'center' },
    textPurple: {
        color: NEW_COLOR.TEXT_PINK
    },
    px44: {
        paddingHorizontal: 44,
    },
    textDARKGreen: { color: NEW_COLOR.TEXT_DARKGREEN, borderBottomWidth: 1, borderBottomColor: '#D4DADA', borderStyle: 'dashed', paddingBottom: 34, marginBottom: 42, },
    textSubmitgray: { color: NEW_COLOR.TEXT_SUBMITGRAY },
    textLightGrey: {
        color: NEW_COLOR.TEXT_LIGHTGREY
    },
    p16: {
        padding: 16
    },
    mt16: {
        marginTop: 16
    },
    mb8: {
        marginBottom: 8,
    },
    mb16: {
        marginBottom: 16,
    },
    textPink: {
        color: NEW_COLOR.TEXT_PINK
    },
    arrowRotate: {
        transform: [{ rotate: "45deg" }]
    },
    mt14: {
        marginTop: 14
    },
    border: {
        borderTopWidth: 2,
        marginTop: 0, marginBottom: 16, opacity: 0.2, width: '96%'
    },
});