import React from 'react';
import { View, SafeAreaView, ScrollView, TouchableOpacity, Image, ImageBackground, Platform, Dimensions } from 'react-native';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import { Container, Text } from '../../components';
import { NEW_COLOR } from '../../constants/theme/variables';
import { s } from '../../constants/theme/scale';
import AntDesign from "react-native-vector-icons/AntDesign";
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import DefaultButton from '../../components/DefaultButton';
import { commonStyles } from '../../components/CommonStyles';
const { width } = Dimensions.get('window');
const isPad = width > 600;
const DepositSubmitted = React.memo((props: any) => {
    const styles = useStyleSheet(themedStyles);
    const handleBackToHome = () => {
        props?.navigation?.navigate("CardDetails", {
            cardId: props?.route?.params?.cardId,
        })
    }
    return (
        <>
            <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
                <ScrollView>
                    <Container style={[commonStyles.container,]}>
                        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap20, commonStyles.justifyContent, commonStyles.mb43]}>
                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                                <TouchableOpacity style={[]} onPress={handleBackToHome}>
                                    <View>
                                        <AntDesign name="arrowleft" size={22} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3, }} />
                                    </View>
                                </TouchableOpacity>
                                <ParagraphComponent text="Deposit Submitted" style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800]} />
                            </View>
                        </View>
                        <View style={[commonStyles.mb16]} />
                        <ImageBackground source={require("../../assets/images/cards/light-purplebg.png")} resizeMode='contain' style={[{ height: 380, }]}  >
                            <View >
                                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { height: isPad ? s(232) : 232, paddingTop: 16, }]}>
                                    <View>
                                        <Image style={commonStyles.mxAuto} source={require("../../assets/images/cards/submitted.png")} />
                                        <View style={[commonStyles.mt16]} />
                                        <ParagraphComponent text="Deposit Submitted" style={[commonStyles.fs20, commonStyles.fw600, commonStyles.textCenter, commonStyles.textBlack]} />
                                        <ParagraphComponent text={`You will recive `} style={[commonStyles.fs14, commonStyles.fw200, commonStyles.textCenter, commonStyles.textBlack]} >
                                            <Text style={[commonStyles.fs12, commonStyles.fw600, commonStyles.textCenter, commonStyles.textBlack]}>{` ${props.route.params.reciveAmount}.`}</Text>
                                        </ParagraphComponent>
                                    </View>
                                </View>
                                <View style={[styles.hline,]} />
                                <View style={[commonStyles.px16, { marginTop: 16, }]}>
                                    <ParagraphComponent text="It is expected to arrive in " style={[commonStyles.fs14, commonStyles.textGrey, commonStyles.fw400, styles.textCenter, commonStyles.mb24]}
                                        children={<ParagraphComponent text=" 24 Hours " style={[commonStyles.fs14, commonStyles.textBlack, commonStyles.fw700, styles.textCenter, commonStyles.mb24]}
                                            children={<ParagraphComponent text=" in working days, and if ecounter holidays, it will be postponed" style={[commonStyles.fs14, commonStyles.textGrey, commonStyles.fw400, styles.textCenter, commonStyles.mb24]} />}
                                        />}
                                    />
                                </View>
                            </View>
                        </ImageBackground>
                        <View style={[commonStyles.mb24]} />
                        {Platform.OS === 'ios' ? (
                            <View style={[]}>
                                <View style={[{ width: "100%" }]}>
                                    <DefaultButton
                                        customContainerStyle={{}}
                                        title='Confirm'
                                        style={undefined}

                                        loading={undefined}
                                        disable={undefined}
                                        onPress={handleBackToHome}
                                        iconCheck={true}
                                        iconArrowRight={false}
                                    />
                                </View>
                            </View>
                        ) :
                            (
                                <View style={[]}>
                                    <View >
                                        <DefaultButton
                                            customContainerStyle={[]}
                                            title='Confirm'
                                            style={undefined}

                                            loading={undefined}
                                            disable={undefined}
                                            onPress={handleBackToHome}
                                            iconCheck={true}
                                            iconArrowRight={false}
                                        />
                                    </View>
                                </View>
                            )}
                    </Container>
                </ScrollView>
            </SafeAreaView>
        </>
    )
});

export default DepositSubmitted;

const themedStyles = StyleService.create({
    hline: {
        borderTopWidth: 2,
        marginTop: 0, marginBottom: 0, opacity: 0.2, width: '95%'
    },
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
});