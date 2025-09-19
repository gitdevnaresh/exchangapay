import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, ScrollView, TouchableOpacity, Image, ImageBackground, BackHandler } from 'react-native';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import { Container } from '../../components';
import { NEW_COLOR } from '../../constants/theme/variables';
import AntDesign from "react-native-vector-icons/AntDesign";
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import DefaultButton from '../../components/DefaultButton';
import { commonStyles } from '../../components/CommonStyles';
import { formatDateTimeAPI, isErrorDispaly } from '../../utils/helpers';
import { useSelector } from 'react-redux';
import ErrorComponent from '../../components/Error';
import CardsModuleService from '../../services/card';
import useEncryptDecrypt from '../../hooks/useEncryption_Decryption';

const FreezeComponent = React.memo((props: any) => {
    const styles = useStyleSheet(themedStyles);
    const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);
    const [errormsg, setErrormsg] = useState<any>("");
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const { decryptAES, encryptAES } = useEncryptDecrypt();
    const userName = decryptAES(userInfo.userName);



    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleGoBack(); return true; }
        );
        return () => backHandler.remove();
    }, []);
    const handleGoBack = () => {
        props.navigation.goBack()
    };

    const handleCardFreezUnFreeze = async () => {
        if (!props?.route?.params?.isFreezEnable) {
            return setErrormsg("Please contact administrator for freeze / unfreeze");
        }
        setBtnLoading(true)
        const cardId = props?.route?.params?.cardId;
        let Obj = {
            "id": props?.route?.params?.cardId,
            "status": 1,
            "actionBy": props?.route?.params?.status === 'Freezed' ? "unfreezed" : "Freezed",
            "createdBy": encryptAES(userName),
            "createdDate": formatDateTimeAPI(new Date())
        }
        try {
            const res: any = await CardsModuleService.saveFreezeUnFreeze(cardId, Obj);
            if (res.status === 200) {
                props.navigation.goBack()
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

    return (
        <>
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
                                <ParagraphComponent text="Card Freeze/Unfreeze" style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800]} />
                            </View>
                        </View>
                        <View style={[commonStyles.mb43]} />
                        {errormsg && <View style={styles.px16}><ErrorComponent message={errormsg} onClose={() => setErrormsg('')} /></View>}
                        <ImageBackground source={require("../../assets/images/cards/light-purplebg.png")} resizeMode='contain' style={[{ position: "relative", height: 385, }]}  >
                            <View >
                                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { height: 238, paddingTop: 16 }]}>
                                    <View>
                                        <Image style={[commonStyles.mxAuto, commonStyles.mt16,]} source={require("../../assets/images/cards/free.png")} resizeMode="cover" />
                                        <ParagraphComponent text={props?.route?.params?.status === 'Freezed' ? `Unfreeze card` : `Freeze card`} style={[commonStyles.fs24, commonStyles.fw700, commonStyles.textBlack, commonStyles.textCenter,]} />
                                    </View>
                                </View>

                                <View style={[styles.border, commonStyles.mxAuto]} />

                                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { paddingTop: 16, paddingBottom: 16 }]}>
                                    <View>
                                        <ParagraphComponent text='Are you sure you want to' style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textGrey, commonStyles.textCenter]} />
                                        <ParagraphComponent text={props?.route?.params?.status === 'Freezed' ? `Unfreeze the card?` : `Freeze the card?`} style={[commonStyles.fs14, commonStyles.fw700, commonStyles.textBlack, commonStyles.textCenter, commonStyles.mb24]} />
                                    </View>
                                </View>

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
                                onPress={handleCardFreezUnFreeze}
                                transparent={undefined}
                            />
                            <View style={[commonStyles.mb16]} />
                            <DefaultButton
                                title={"No"}
                                customTitleStyle={undefined}
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
        </>
    )
});

export default FreezeComponent;

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
        marginBottom: 16, opacity: 0.2, width: '95%'
    },
    mt44: { marginTop: 44 }

});