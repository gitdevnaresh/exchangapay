import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    TouchableOpacity,
    View,
    BackHandler,
    Dimensions,
    ScrollView,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { Container } from "../../components";
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
import { EditIcon, LocationIcon } from "../../assets/svg"; // Import EditIcon
import useEncryptDecrypt from "../../hooks/useEncryption_Decryption";
import { ADDRRESS_CONSTANTS, PROFILE_CONSTANTS } from "./constants";
import { SafeAreaView } from "react-native-safe-area-context";




const UserAddressListScreen = (props: any) => {
    const [personalInfoLoading, setPersonalInfoLoading] = useState(false);
    const [personalInfoAddress, setPersonalInfoAddress] = useState<any>([]);
    const [errormsg, setErrormsg] = useState<string>('');
    const PersonalInfoLoader = personalInfoLoader(10);
    const { width } = Dimensions.get('window');
    const isPad = width > 600;
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const { decryptAES } = useEncryptDecrypt();

    const fetchAddresses = async () => {
        setPersonalInfoLoading(true);
        setErrormsg("");
        try {
            const response: any = await CardsModuleService.getPersonalCustomerInfoAddress();
            if (response?.ok && response?.data) {
                setPersonalInfoAddress(response.data);
            } else {
                setErrormsg(isErrorDispaly(response) || ADDRRESS_CONSTANTS.FAILED_TO_FETCH_ADDRESSES);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error) || ADDRRESS_CONSTANTS.SOMETHING_WENT_WRONG);
        } finally {
            setPersonalInfoLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            fetchAddresses();
        }
    }, [isFocused]);

    useEffect(() => {
        const backAction = () => {
            handleGoBack();
            return true;
        };
        const backHandler = BackHandler.addEventListener(PROFILE_CONSTANTS.HARDWARE_BACKPRESS, backAction);
        return () => backHandler.remove();
    }, []);

    const handleGoBack = () => {
        navigation.goBack();
    };

    const handleAddAddress = () => {
        navigation.navigate("AddPersonalInfo");
    };

    const handleEditAddress = (item: any) => {
        navigation.navigate("AddPersonalInfo", { id: item.id });
    };
    const handleNavigateView = (item: any) => {
        navigation.navigate("addressDetails", { id: item.id });
    };
    const handleCloseError = () => {
        setErrormsg("");
    };

    return (

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
                            {errormsg && <ErrorComponent message={errormsg} onClose={handleCloseError} />}
                            <View>
                                <View>
                                    {personalInfoAddress?.map((item: any, index: any) => (
                                        <>
                                            <View key={index} style={[commonStyles.dflex, commonStyles.justify, styles.flexcol, styles.profileEdit, commonStyles.mb16, commonStyles.relative]}>
                                                {<TouchableOpacity activeOpacity={0.6} style={[commonStyles.flex1,]} onPress={() => handleNavigateView(item)}>
                                                    <View style={[commonStyles.flex1, commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, { marginTop: index === 0 ? 16 : 0 }]}>
                                                        <View >
                                                            <View style={[styles.userBg, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter,]}>

                                                                <LocationIcon height={s(23)} width={s(23)} style={{ marginTop: 2 }} />

                                                            </View>

                                                        </View>

                                                        <View style={[commonStyles.flex1, { marginTop: item?.isDefault && isPad ? 24 : 0 }]}>

                                                            <View style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.gap8, commonStyles.mb8,]}>
                                                                <View>
                                                                    <ParagraphComponent style={[styles.fs12, commonStyles.fw400, commonStyles.textBlack]} text={`${item?.addressLine1 || ""}  ${", "} ${item?.addressLine2 || ""}  ${", "}${item?.state || " "} ${", "}`} />
                                                                    <ParagraphComponent style={[styles.fs12, commonStyles.fw400, commonStyles.textBlack, commonStyles.mb4]} text={`${item?.city || " "} ${", "} ${decryptAES(item?.postalCode) || " "} ${"."}`} />
                                                                </View>
                                                            </View>
                                                        </View>
                                                        <TouchableOpacity activeOpacity={0.6} onPress={() => handleEditAddress(item)}>
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

                    onPress={handleAddAddress}
                    disable={undefined}
                    loading={undefined}
                    style={undefined}
                />
            </View>

        </SafeAreaView>


    );
};

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
export default UserAddressListScreen;