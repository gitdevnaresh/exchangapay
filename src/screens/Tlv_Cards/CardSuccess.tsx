import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, ScrollView, TouchableOpacity, Image, ImageBackground, BackHandler } from 'react-native';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import { Container } from '../../components';
import { NEW_COLOR } from '../../constants/theme/variables';
import { ms, s } from '../../constants/theme/scale';
import AntDesign from "react-native-vector-icons/AntDesign";
import Feather from "react-native-vector-icons/Feather";
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import DefaultButton from '../../components/DefaultButton';
import checkmark from '../../assets/images/checkmark.png';
import { useNavigation } from '@react-navigation/native';
import { commonStyles } from '../../components/CommonStyles';

const CardSuccess = React.memo((props: any) => {
    const navigation = useNavigation();
    const styles = useStyleSheet(themedStyles);
    const [visible, setVisible] = useState(false);

    const handleBackToHome = () => {
        props.navigation.navigate("Dashboard", {
            screen: 'Cards'
        });
    }

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleGoBack(); return true; }
        );
        return () => backHandler.remove();
    }, []);
    const handleGoBack = () => {
        props.navigation.navigate("Dashboard")
    };

    return (
        <>
            <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1,]}>
                <ScrollView contentContainerStyle={[commonStyles.flex1,]}>
                    <View style={[commonStyles.container,]}>
                        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.justifyContent]}>
                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                                <TouchableOpacity style={[]} onPress={() => handleGoBack()}>
                                    <View>
                                        <AntDesign name="arrowleft" size={22} color={NEW_COLOR.TEXT_BLACK} />
                                    </View>
                                </TouchableOpacity>
                                <ParagraphComponent text="Exchange Card" style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800]} />
                            </View>
                        </View>
                        <View style={commonStyles.mb43} />
                        <View style={commonStyles.mb43} />
                        <View style={[commonStyles.flex1, commonStyles.relative]}>
                            <ImageBackground resizeMode='cover' style={styles.bglightgreen} imageStyle={{ minHeight: 385 }} source={require("../../assets/images/cards/light-greenbg.png")}>
                                <View>
                                    <Image source={checkmark} style={commonStyles.mxAuto} />
                                    <View style={commonStyles.mt16} />

                                    <ParagraphComponent text="Created Card Successfully" style={[commonStyles.fs24, commonStyles.fw700, commonStyles.textCenter]} />
                                    <View style={[commonStyles.dashedBorder, commonStyles.DashedGreen]} />
                                    <View style={commonStyles.mt16} />
                                    <ParagraphComponent text={`You recive ${props.route.params.reciveAmount}.`} style={[commonStyles.fs16, commonStyles.fw700, commonStyles.textCenter]} />
                                </View>
                            </ImageBackground>
                            <View style={[styles.px32]}>
                                <DefaultButton
                                    customContainerStyle={{ marginTop: 30 }}
                                    title='Ok'
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

                    </View>
                </ScrollView>
            </SafeAreaView>
        </>
    )
});

export default CardSuccess;

const themedStyles = StyleService.create({
    px32: {
        paddingHorizontal: 32,
    },
    mb32: {
        marginBottom: 32,
    },
    mr8: { marginRight: 8 },
    w318: { width: "100%", marginTop: -24 },
    textCenter: { textAlign: 'center' },
    textPurple: {
        color: NEW_COLOR.TEXT_PINK
    },
    readbtn: {
        padding: 13,
        backgroundColor: "#303030",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 15,
    },
    overlayContent: {
        paddingHorizontal: s(28),
        paddingVertical: s(24),
        borderRadius: 25
    },
    bglightgreen: { padding: 32, borderRadius: 24, },
});