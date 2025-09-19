import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View, Image, ScrollView, SafeAreaView, BackHandler, ImageBackground, Dimensions } from "react-native";
import { Container } from '../../components';
import DefaultButton from "../../components/DefaultButton";
import AntDesign from "react-native-vector-icons/AntDesign";
import { NEW_COLOR } from "../../constants/theme/variables";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import { s } from "../../constants/theme/scale";
import { commonStyles } from "../../components/CommonStyles";
import Ionicons from 'react-native-vector-icons/Ionicons';
import CardsModuleService from "../../services/card";
import { isErrorDispaly } from "../../utils/helpers";
import ErrorComponent from "../../components/Error";
import Loadding from "../../components/skeleton";
import { ToBeReViewLoader } from "../cards/CardsSkeleton_views";
const { width } = Dimensions.get('window');
const isPad = width > 600;

const ApplicatoionReview = (props: any) => {
    const [statusInfo, setStatusInfo] = useState<any>([]);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [statusLoading, setStatusLoading] = useState<boolean>(false);
    const ExchangeCardSkeleton = ToBeReViewLoader();




    useEffect(() => {

        getCardStatus();
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleBack(); return true; }
        );
        return () => backHandler.remove();
    }, []);


    const handleBack = () => {
        props.navigation.navigate("Dashboard", {
            screen: 'Cards',


        })
    };

    const getCardStatus = async () => {
        const cardId = props?.route?.params?.cardId;
        try {
            setStatusLoading(true)
            const response: any = await CardsModuleService?.getApplyCardStatus(cardId);
            if (response.status === 200) {
                setStatusInfo(response?.data);
                setStatusLoading(false)
                setErrorMsg('');

            }
        } catch (error) {
            setStatusLoading(false)
            setErrorMsg(isErrorDispaly(error));

        }
    };

    const handleCloseError = () => {
        setErrorMsg('');
    };


    return (
        <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
            <ScrollView>
                <Container style={commonStyles.container}>
                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mb43, commonStyles.gap16, commonStyles.justifyContent]}>
                        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                            <TouchableOpacity style={[]} onPress={handleBack}>
                                <View>
                                    <AntDesign name="arrowleft" size={s(22)} color={NEW_COLOR.TEXT_BLACK} />
                                </View>
                            </TouchableOpacity>
                            <ParagraphComponent text="Application Review" style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800]} />
                        </View>

                    </View>
                    {statusLoading && (
                        <View style={[commonStyles.flex1]}>
                            <Loadding contenthtml={ExchangeCardSkeleton} />
                        </View>
                    )}
                    {errorMsg && (<>
                        <ErrorComponent
                            message={errorMsg}
                            onClose={handleCloseError}
                        />
                        <View style={commonStyles.mt8} />
                    </>
                    )}

                    {!statusLoading && <View>
                        <ImageBackground source={require("../../assets/images/cards/light-purplebg.png")} resizeMode='contain' style={[{ height: isPad ? s(360) : 360, }]}  >
                            <View style={[commonStyles.p24, { height: isPad ? s(210) : "auto", }]}>
                                <View style={{ marginBottom: "auto", marginTop: "auto" }}>
                                    <Image style={[commonStyles.mxAuto, styles.clockImg]} source={require("../../assets/images/cards/clock.png")} />
                                    <ParagraphComponent text={`Application Review Process Will Take 24-48 Hours.`} style={[commonStyles.fs18, commonStyles.fw600, commonStyles.textCenter, commonStyles.textBlack]} />
                                </View>
                            </View>

                            <View style={[styles.hline,]} />
                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap20, commonStyles.mxAuto, commonStyles.p16, { height: isPad ? s(70) : "auto", }]}>
                                {!statusLoading && statusInfo && statusInfo.map((item: any, index: any) =>
                                    <>
                                        <View>
                                            <View style={[commonStyles.relative, commonStyles.mxAuto]}>
                                                {index !== (statusInfo.length - 1) && <View style={{ height: 1, width: isPad ? s(45) : 60, backgroundColor: item?.status ? NEW_COLOR.TEXT_GREEN : NEW_COLOR.TEXT_BLACK, position: "absolute", top: 13, left: 22, }} />}
                                                <Ionicons name="checkmark-circle" size={24} color={item?.status ? NEW_COLOR.TEXT_GREEN : NEW_COLOR.TEXT_BLACK} />
                                            </View>
                                            <ParagraphComponent text={item.action} style={[commonStyles.fs12, commonStyles.textBlack, commonStyles.fw500, commonStyles.textCenter]} />
                                        </View>
                                    </>
                                )}

                            </View>
                        </ImageBackground>
                        <View style={[commonStyles.mb43,]} />
                        <View style={[commonStyles.mb43,]} />
                        <DefaultButton
                            title='Back TO Home'
                            style={undefined}
                            onPress={handleBack}
                            iconArrowRight={false}
                            iconCheck={true}
                        />
                        <View style={[commonStyles.mb24,]} />
                    </View>}
                </Container>
            </ScrollView>
        </SafeAreaView>

    );
};

export default ApplicatoionReview;

const styles = StyleSheet.create({
    clockImg: {
        width: s(88),
        marginBottom: 8
    },
    hline: {
        borderTopWidth: 2,
        marginTop: 26, marginBottom: 36, opacity: 0.2, width: '95%'
    },
});
