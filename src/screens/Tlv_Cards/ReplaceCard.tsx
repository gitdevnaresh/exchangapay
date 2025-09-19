import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput, ImageBackground } from 'react-native';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import { Container } from '../../components';
import { NEW_COLOR } from '../../constants/theme/variables';
import AntDesign from "react-native-vector-icons/AntDesign";
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import DefaultButton from '../../components/DefaultButton';
import { commonStyles } from '../../components/CommonStyles';
import { useSelector } from 'react-redux';
import { isErrorDispaly } from '../../utils/helpers';
import ErrorComponent from '../../components/Error';
import { BackHandler } from 'react-native';
import CardsModuleService from '../../services/card';

const ReplaceCardComponent = React.memo((props: any) => {
    const styles = useStyleSheet(themedStyles);
    const [errormsg, setErrormsg] = useState("");
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    useEffect(() => {
    }, [props?.route?.params?.cardId])
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleGoBack(); return true; }
        );
        return () => backHandler.remove();
    }, []);
    const handleGoBack = () => {
        props.navigation.navigate("CardDetails", {
            cardId: props?.route?.params?.cardId
        })
    };
    const handleReplaceCard = async () => {
        setBtnLoading(true)
        const cardId = props?.route?.params?.cardId;
        let Obj = {
            "id": props?.route?.params?.cardId,
            "status": 1,
            "actionBy": "Replace Card"
        }
        try {
            const res: any = await CardsModuleService.saveReplacecard(cardId, Obj);
            if (res.status === 200) {
                props.navigation.navigate("CardDetails", {
                    cardId: props?.route?.params?.cardId
                });
                setBtnLoading(false)
                setErrormsg('');
            } else {
                setBtnLoading(false)
                setErrormsg(isErrorDispaly(res));
            }
        }
        catch (error) {
            setErrormsg(isErrorDispaly(error));
            setBtnLoading(false)
        }
    };

    const handleCloseError = () => {
        setErrormsg("");
    };

    return (
        <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
            <ScrollView >
                <Container style={[commonStyles.container,]}>
                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.justifyContent]}>
                        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                            <TouchableOpacity style={[]} onPress={handleGoBack} >
                                <View>
                                    <AntDesign name="arrowleft" size={22} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
                                </View>
                            </TouchableOpacity>
                            <ParagraphComponent text="Replace Card" style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800]} />
                        </View>
                    </View>
                    <View style={[commonStyles.mb43]} />
                    {errormsg && <View style={styles.px16}><ErrorComponent message={errormsg} onClose={handleCloseError} /></View>}
                    <ImageBackground source={require("../../assets/images/cards/light-purplebg.png")} resizeMode="contain" style={[{ position: "relative", height: 385, }]}  >
                        <View style={[commonStyles.relative]}>
                            <View style={[commonStyles.mt16]} />
                            <Image style={[commonStyles.mxAuto, styles.mt44]} source={require("../../assets/images/cards/replace.png")} resizeMode="contain" />
                            <View style={[commonStyles.mb8]} />
                            <ParagraphComponent text='Replace Card' style={[commonStyles.fs24, commonStyles.fw700, commonStyles.textBlack, commonStyles.textCenter]} />
                            <View style={[commonStyles.mb24]} />
                            <View style={[styles.border, commonStyles.mxAuto]} />
                            <ParagraphComponent text='Are you sure  you want' style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textGrey, commonStyles.textCenter]} />
                            <ParagraphComponent text='Replace Card?' style={[commonStyles.fs14, commonStyles.fw700, commonStyles.textBlack, commonStyles.textCenter, commonStyles.mb24]} />

                        </View>
                    </ImageBackground>
                    <View style={[styles.btnsBottom]}>
                        <DefaultButton
                            title={"Yes"}
                            customTitleStyle={[]}
                            style={undefined}
                            customButtonStyle={[]}
                            customContainerStyle={undefined}
                            backgroundColors={undefined}
                            colorful={undefined}
                            loading={btnLoading}
                            disable={undefined}
                            onPress={handleReplaceCard}
                            transparent={undefined}
                        />
                        <View style={[commonStyles.mb16]} />
                        <DefaultButton
                            title={"No"}
                            style={undefined}
                            backgroundColors={undefined}
                            colorful={undefined}
                            loading={undefined}
                            disable={undefined}
                            onPress={handleGoBack}
                            transparent={true}
                            iconArrowRight={false}
                            closeIcon={true}
                        />
                    </View>
                    <View style={[commonStyles.mb43]} />
                </Container>
            </ScrollView>
        </SafeAreaView>

    )
});

export default ReplaceCardComponent;

const themedStyles = StyleService.create({
    p30: {
        padding: 30
    },
    btnsBottom: {
        marginTop: 24,
    },
    px16: {
        paddingVertical: 16
    },
    border: {
        borderTopWidth: 2,
        marginTop: 30, marginBottom: 36, opacity: 0.2, width: '95%'
    },
    mt44: { marginTop: 44 }
});