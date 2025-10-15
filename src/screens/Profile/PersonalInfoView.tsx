import { BackHandler, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { commonStyles } from '../../components/CommonStyles'
import { Container } from '../../components'
import { NEW_COLOR } from '../../constants/theme/variables'
import ParagraphComponent from '../../components/Paragraph/Paragraph'
import { ms, s } from '../../constants/theme/scale'
import AntDesign from "react-native-vector-icons/AntDesign";
import CardsModuleService from '../../services/card'
import ErrorComponent from '../../components/Error'
import Loadding from '../../components/skeleton'
import { personalInfoLoader } from './skeleton_views'
import { useIsFocused } from '@react-navigation/native'
import { ACCOUNT_INFORMATION_CONSTANTS } from './constants'
import NoDataComponent from '../../components/nodata'
import useEncryptDecrypt from '../../hooks/useEncryption_Decryption'


const PersonalInfoView = (props: any) => {
    const [userInfo, setUserInfo] = useState<any>({});
    const [errorMsg, setErrorMsg] = useState<any>("");
    const isFocused = useIsFocused();
    const CardAvailableBalance = personalInfoLoader(10);
    const [isDataloading, setIsDataLoading] = useState<boolean>(false);
    const { decryptAES } = useEncryptDecrypt();
    useEffect(() => {
        getUserInfo();
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleBack(); return true; }
        );
        return () => backHandler.remove();
    }, [isFocused])

    const getUserInfo = async () => {
        setIsDataLoading(true);
        try {
            const response: any = await CardsModuleService.getPersonalInfo();
            if (response?.data) {
                const decryptedUserInfo = {
                    ...response.data,
                    firstName: response.data.firstName ? decryptAES(response.data.firstName) : null,
                    lastName: response.data.lastName ? decryptAES(response.data.lastName) : null,
                    mobilenumber: response.data.mobilenumber ? decryptAES(response.data.mobilenumber) : null,
                    userName: response.data.userName ? decryptAES(response.data.userName) : null,
                    email: response.data.email ? decryptAES(response.data.email) : null,
                };
                setUserInfo(decryptedUserInfo);
                setIsDataLoading(false);
            } else {
                setIsDataLoading(false);
                setErrorMsg(response);
            }

        } catch (error) {
            setErrorMsg(error);
            setIsDataLoading(false);

        }
    }

    const handleBack = () => {
        props.navigation.goBack()
    };
    const handleCloseErrorMsg = () => {
        setErrorMsg("")
    }
    return (
        <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Container style={[commonStyles.container,]}>
                    <View>
                        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap20]}>
                            <TouchableOpacity style={[]} onPress={() => handleBack()} >
                                <View>
                                    <AntDesign name={ACCOUNT_INFORMATION_CONSTANTS.ARROW_LEFT} size={s(22)} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
                                </View>
                            </TouchableOpacity>
                            <ParagraphComponent text={ACCOUNT_INFORMATION_CONSTANTS.ACCOUNT_INFORMATION} style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw700]} />
                        </View>
                        <View style={[commonStyles.mb43]} />
                        {isDataloading && <Loadding contenthtml={CardAvailableBalance} />}
                        {errorMsg && (<>
                            <ErrorComponent
                                message={errorMsg}
                                onClose={handleCloseErrorMsg}
                            />
                            <View style={commonStyles.mt8} />
                        </>
                        )}
                        {!isDataloading && userInfo && <View style={[styles.darkBg, styles.p16,]}>



                            <View>
                                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap16]}>
                                    <ParagraphComponent text={ACCOUNT_INFORMATION_CONSTANTS.FIRST_NAME} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textLightGrey, { width: ms(120) }]} />
                                    <ParagraphComponent text={userInfo?.firstName || "--"} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textBlack, commonStyles.flex1, commonStyles.textRight]} />

                                </View>
                                <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.2 }]} />

                            </View>
                            <View>
                                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap16]}>
                                    <ParagraphComponent text={ACCOUNT_INFORMATION_CONSTANTS.LAST_NAME} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textLightGrey, { width: ms(120) }]} />
                                    <ParagraphComponent text={userInfo?.lastName || "--"} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textBlack, commonStyles.flex1, commonStyles.textRight]} />

                                </View>
                                <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.2 }]} />

                            </View>
                            <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap16]}>
                                <ParagraphComponent text={ACCOUNT_INFORMATION_CONSTANTS.MOBILE_NUMBER} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textLightGrey, { width: ms(120) }]} />
                                <ParagraphComponent text={userInfo?.mobilenumber || ""} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textBlack, commonStyles.flex1, commonStyles.textRight]} />

                            </View>
                            {/* <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.2 }]} />

                            <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap16]}>
                                <ParagraphComponent text={ACCOUNT_INFORMATION_CONSTANTS.USER_NAME} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textLightGrey, { width: ms(120) }]} />
                                <ParagraphComponent text={userInfo?.userName || "--"} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textBlack, commonStyles.flex1, commonStyles.textRight]} />

                            </View> */}
                            <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.2 }]} />
                            <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap16]}>
                                <ParagraphComponent text={ACCOUNT_INFORMATION_CONSTANTS.EMAIL} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textLightGrey, { width: ms(120) }]} />
                                <ParagraphComponent text={userInfo?.email || " "} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textBlack, commonStyles.flex1, commonStyles.textRight]} />

                            </View>
                            <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.2 }]} />
                            <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap16]}>
                                <ParagraphComponent text={ACCOUNT_INFORMATION_CONSTANTS.COUNTRY} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textLightGrey, { width: ms(120) }]} />
                                <ParagraphComponent text={userInfo?.country || ""} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textBlack, commonStyles.flex1, commonStyles.textRight]} />

                            </View>
                        </View>}
                        {!isDataloading && !userInfo &&
                            <NoDataComponent />
                        }

                    </View>
                    <View style={[commonStyles.mb43]} />
                    <View style={[commonStyles.mb32]} />
                </Container>
            </ScrollView>
        </SafeAreaView>
    )
}

export default PersonalInfoView

const styles = StyleSheet.create({
    darkBg: {
        backgroundColor: NEW_COLOR.MENU_CARD_BG,
        borderRadius: 16,
    },
    p16: {
        padding: 16
    }
})