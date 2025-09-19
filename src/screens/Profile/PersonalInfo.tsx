import { StyleSheet, TouchableOpacity, View, ScrollView, SafeAreaView, BackHandler, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import { Container } from '../../components';
import { useDispatch } from "react-redux";
import { ms, s } from "../../constants/theme/scale";
import { NEW_COLOR } from "../../constants/theme/variables";
import AntDesign from "react-native-vector-icons/AntDesign";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import DefaultButton from "../../components/DefaultButton";
import { isErrorDispaly } from "../../utils/helpers";
import CardsModuleService from "../../services/card";
import { commonStyles } from "../../components/CommonStyles";
import Loadding from "../../components/skeleton";
import { personalInfoLoader } from "./skeleton_views";
import NoDataComponent from "../../components/nodata";
import ErrorComponent from "../../components/Error";
import { EditIcon, LocationIcon } from "../../assets/svg";
import { setPersonalInfo } from "../../redux/Actions/UserActions";
import { useIsFocused } from "@react-navigation/core";
import useEncryptDecrypt from "../../hooks/useEncryption_Decryption";


const PersonalInfo = (props: any) => {
    const dispatch = useDispatch();
    const [personalInfoLoading, setPersonalInfoLoading] = useState(false);
    const [personalInfoAddress, setPersonalInfoAddress] = useState<any>([]);
    const [errormsg, setErrormsg] = useState<string>('');
    const PersonalInfoLoader = personalInfoLoader(10);
    const { width } = Dimensions.get('window');
    const isPad = width > 600;
    const isFocus = useIsFocused();
    const { decryptAES } = useEncryptDecrypt();

    useEffect(() => {
        getPersonlCustomerDetailsInfo();

    }, [props?.route?.params?.cardId, isFocus]);
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleGoBack(); return true; }
        );
        return () => backHandler.remove();
    }, [isFocus]);
    const getPersonlCustomerDetailsInfo = async () => {
        try {
            setPersonalInfoLoading(true);
            const response: any = await CardsModuleService?.getPersonalCustomerInfoAddress();
            if (response?.ok) {
                setPersonalInfoAddress(response?.data);
                setErrormsg('');
                setPersonalInfoLoading(false);
            } else {
                setErrormsg(isErrorDispaly(response));
                setPersonalInfoLoading(false);
            }

        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setPersonalInfoLoading(false);
        }
    };
    const handleRedirectToAddPersolForm = (val: any) => {
        props.navigation.push("AddPersonalInfo", {
            ...props.route.params,
            id: val?.id,
            cardId: props?.route?.params?.cardId,
            logo: props?.route?.params?.logo,

        });
    };
    const handleRedirectToExchangeCard = (val: any) => {

        if (props?.route?.params?.cardId) {
            dispatch(setPersonalInfo({
                id: val?.id,
                fullName: val?.fullname,
                address: val?.addressLine1,
                phoneNo: val?.phoneNumber,
                country: val?.country,
                state: val?.state,
                city: val?.city
            }));
            props.navigation.push("ApplyExchangaCard", {
                cardId: props?.route?.params?.cardId,
                logo: props?.route?.params?.logo
            });
        } else {
            props.navigation.push("AddPersonalInfo", {
                ...props.route.params,
                id: val?.id,
                cardId: props?.route?.params?.cardId,
                logo: props?.route?.params?.logo,

            });
        }
    };
    const handleGoBack = () => {
        if (props?.route?.params?.cardId) {
            props.navigation.push("ApplyExchangaCard", {
                cardId: props?.route?.params?.cardId,
                logo: props?.route?.params?.logo
            })
        } else if (props?.route?.params?.returnScreen) {
            props.navigation.push(props?.route?.params?.returnScreen, props?.route?.params?.returnParams)
        } else {
            props.navigation.navigate("DrawerModal")
        }
    };

    return (
        <>
            <SafeAreaView style={[commonStyles.screenBg, commonStyles.relative, commonStyles.flex1]}>
                <ScrollView >
                    <Container style={[commonStyles.container,]}>
                        <View style={[commonStyles.dflex, commonStyles.mb36, commonStyles.alignCenter, commonStyles.gap16]}>
                            <TouchableOpacity style={[styles.px8]} onPress={handleGoBack}><View>
                                <View>
                                    <AntDesign name="arrowleft" size={s(22)} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 4 }} />
                                </View>
                            </View></TouchableOpacity>
                            <ParagraphComponent style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw700]} text='Personal Information' />
                        </View>
                        {personalInfoLoading && (
                            <View style={[commonStyles.flex1]}>
                                <Loadding contenthtml={PersonalInfoLoader} />
                            </View>
                        )}

                        {!personalInfoLoading && personalInfoAddress && personalInfoAddress.length > 0 && (
                            <>
                                {errormsg && <ErrorComponent message={errormsg} onClose={() => setErrormsg("")} />}
                                <View>
                                    <View>
                                        {personalInfoAddress?.map((item: any, index: any) => (
                                            <>
                                                <View key={index} style={[commonStyles.dflex, commonStyles.justify, styles.flexcol, styles.profileEdit, commonStyles.mb16, commonStyles.relative]}>
                                                    {<TouchableOpacity activeOpacity={0.6} style={[commonStyles.flex1,]} onPress={() => handleRedirectToExchangeCard(item)}>
                                                        <View style={[commonStyles.flex1, commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, { marginTop: index === 0 ? 16 : 0 }]}>
                                                            <View >
                                                                <View style={[styles.userBg, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter,]}>

                                                                    <LocationIcon height={s(23)} width={s(23)} style={{ marginTop: 2 }} />

                                                                </View>

                                                            </View>

                                                            <View style={[commonStyles.flex1, { marginTop: item?.isDefault && isPad ? 24 : 0 }]}>

                                                                <View style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.gap8, commonStyles.mb8,]}>
                                                                    <View>
                                                                        <ParagraphComponent style={[styles.fs12, commonStyles.fw400, commonStyles.textBlack]} text={`${decryptAES(item?.postalCode) || ""}  ${", "} ${item?.addressLine1 || ""}  ${", "}`} />
                                                                        <ParagraphComponent style={[styles.fs12, commonStyles.fw400, commonStyles.textBlack, commonStyles.mb4]} text={`${item?.city || " "} ${", "} ${item?.state || " "} ${"."}`} />
                                                                    </View>
                                                                </View>
                                                            </View>
                                                            <TouchableOpacity activeOpacity={0.6} onPress={() => handleRedirectToAddPersolForm(item)}>
                                                                <View>
                                                                    <EditIcon height={s(24)} width={s(24)} />
                                                                </View>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </TouchableOpacity>}
                                                </View>
                                                {item?.isDefault && <View style={styles.bgpurple}>
                                                    <ParagraphComponent style={[commonStyles.fs10, commonStyles.fw500, commonStyles.textCenter, commonStyles.textAlwaysWhite, { marginBottom: 1 }]} text={'Default'} />
                                                </View>}

                                            </>
                                        ))}
                                    </View>
                                </View>
                            </>)}

                        {!personalInfoLoading && (!personalInfoAddress || personalInfoAddress.length === 0) && (
                            <NoDataComponent />
                        )}
                        <View style={[commonStyles.mb43]} />
                        <View style={[commonStyles.mb43]} />
                    </Container>
                </ScrollView>
                <View style={[styles.btnFixed, commonStyles.px24]}>
                    <DefaultButton title='Add Address'

                        onPress={handleRedirectToAddPersolForm}
                        disable={undefined}
                        loading={undefined}
                        style={undefined}
                    />
                </View>

            </SafeAreaView>

        </>
    );
};

export default PersonalInfo;

const styles = StyleSheet.create({
    btnFixed: {
        position: "absolute", bottom: 20,
        width: "100%",
    },
    px8: { paddingVertical: 8 },
    mb4: { marginBottom: 4 },
    title: { fontSize: 18, fontWeight: "500", lineHeight: 21 },
    justify: { justifyContent: "space-between" },
    alignCenter: { alignItems: "center", },
    dflex: { flexDirection: "row" },
    bgpurple: {
        backgroundColor: NEW_COLOR.BG_ORANGE,
        paddingHorizontal: 10,
        paddingBottom: 3,
        position: "absolute",
        top: 0, left: "70%",
        borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
    },
    flexcol: {
        flexDirection: 'column',
        flex: 1,
        borderRadius: 16,
        padding: 14
    },
    mb8: { marginBottom: 8, },
    fw700: {
        fontWeight: "700",
    },
    fw400: {
        fontWeight: "400",
    },
    fw500: {
        fontWeight: "500",
    },
    gap8: {
        gap: 8
    },
    textBlack: {
        color: NEW_COLOR.TEXT_BLACK
    },
    fs10: {
        fontSize: ms(10)
    },
    fs12: {
        fontSize: ms(12)
    },
    fs16: {
        fontSize: ms(16)
    },
    userBg: {
        backgroundColor: NEW_COLOR.USER_ICON_BG,
        height: s(42),
        width: s(42),
        borderRadius: s(42) / 2,
    },
    profileEdit: {
        backgroundColor: NEW_COLOR.MENU_CARD_BG,

    }
});
