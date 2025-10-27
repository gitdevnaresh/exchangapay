import React, { useEffect, useState } from "react";
import { StyleService, useStyleSheet } from "@ui-kitten/components";
import { View, ScrollView, TouchableOpacity, BackHandler } from "react-native";
import { commonStyles } from "../../../components/CommonStyles";
import { NEW_COLOR, WINDOW_WIDTH } from "../../../constants/theme/variables";
import ParagraphComponent from "../../../components/Paragraph/Paragraph";
import AntDesign from "react-native-vector-icons/AntDesign";
import CardsModuleService from "../../../services/card";
import { s } from "../../../constants/theme/scale";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Container } from "../../../components";
import ErrorComponent from "../../../components/Error";
import Loadding from "../../../components/skeleton";
import { personalInfoLoader } from "../skeleton_views";
import NoDataComponent from "../../../components/nodata";
import useEncryptDecrypt from "../../../hooks/useEncryption_Decryption";
import { PERSONAL_INFORMATION } from "../constants";


const AddressDetails = (props: any) => {
    const styles = useStyleSheet(themedStyles);
    const [errorMsg, setErrorMsg] = useState<any>("");
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const skeltons = personalInfoLoader(10);
    const [addressDetails, setAddressDetails] = useState<any>({
        state: "",
        city: "",
        addressLine1: "",
        addressLine2: "",
        postalCode: "",
        isDefault: false,
    });
    const { decryptAES } = useEncryptDecrypt();

    useEffect(() => {
        getAddressDetails();
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                navigation.goBack();
                return true;
            }
        );
        return () => backHandler.remove();
    }, [])

    const getAddressDetails = async () => {
        const addressId = props.route.params?.id;
        try {
            const response: any = await CardsModuleService?.getPersonalCustomerViewDetails(addressId)
            if (response?.data) {
                setAddressDetails({
                    state: response?.data?.state || "",
                    city: response?.data?.city || "",
                    addressLine1: response?.data?.addressLine1 || "",
                    addressLine2: response?.data?.addressLine2 || "",
                    postalCode: decryptAES(response?.data?.postalCode) || "",
                    isDefault: response?.data?.isDefault || false,
                })
            } else {
                setErrorMsg(response);
            }
        } catch (error) {
            setErrorMsg(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const handleCloseError = () => {
        setErrorMsg("");
    };



    return (

        <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
            <ScrollView>
                <Container style={[commonStyles.container]}>
                    <View>
                        {isLoading && (<Loadding contenthtml={skeltons} />)}
                        {(!isLoading && addressDetails) && <>
                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.justifyContent]}>
                                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                    <TouchableOpacity style={[]} onPress={handleBack}>
                                        <View>
                                            <AntDesign name={PERSONAL_INFORMATION.ARROW_LEFT} size={s(22)} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
                                        </View>
                                    </TouchableOpacity>
                                    <ParagraphComponent text={PERSONAL_INFORMATION?.PERSONAL_INFORMATION} style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw700]} />
                                </View>
                            </View>
                            {errorMsg && <ErrorComponent message={errorMsg} onClose={handleCloseError} />}
                            <View style={[commonStyles.mb43]} />
                            <View style={[styles.darkBg, styles.p16]}>
                                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap12]}  >
                                    <ParagraphComponent text={PERSONAL_INFORMATION?.ADDRESS_LINE_ONE} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textLightGrey, styles.labelStyle]} />
                                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flex1]}  >
                                        <ParagraphComponent text={addressDetails?.addressLine1 || '--'} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textBlack, commonStyles.flex1, commonStyles.textRight]} />

                                    </View>
                                </View>
                                <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.2 }]} />
                                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap12]}  >
                                    <ParagraphComponent text={PERSONAL_INFORMATION?.ADDRESS_LINE_TWO} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textLightGrey, styles.labelStyle]} />
                                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flex1]}  >
                                        <ParagraphComponent text={addressDetails?.addressLine2 || '--'} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textBlack, commonStyles.flex1, commonStyles.textRight]} />

                                    </View>
                                </View>
                                <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.2 }]} />
                                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap12]}  >
                                    <ParagraphComponent text={PERSONAL_INFORMATION?.PROVINCE_STATE} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textLightGrey, styles.labelStyle]} />
                                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flex1]}  >
                                        <ParagraphComponent text={addressDetails?.state || '--'} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textBlack, commonStyles.flex1, commonStyles.textRight]} />

                                    </View>
                                </View>
                                <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.2 }]} />
                                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap12]}  >
                                    <ParagraphComponent text={PERSONAL_INFORMATION?.CITY} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textLightGrey, styles.labelStyle]} />
                                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flex1]}  >
                                        <ParagraphComponent text={addressDetails?.city || '--'} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textBlack, commonStyles.flex1, commonStyles.textRight]} />

                                    </View>
                                </View>
                                <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.2 }]} />
                                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap12]}  >
                                    <ParagraphComponent text={PERSONAL_INFORMATION?.POSTAL_CODE} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textLightGrey, styles.labelStyle]} />
                                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flex1]}  >
                                        <ParagraphComponent text={addressDetails?.postalCode || '--'} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textBlack, commonStyles.flex1, commonStyles.textRight]} />

                                    </View>
                                </View>
                                {addressDetails?.isDefault && <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.2 }]} />}
                                {addressDetails?.isDefault && <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles?.mb10]}>
                                    <ParagraphComponent text={PERSONAL_INFORMATION?.STATUS} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textLightGrey, styles.labelStyle]} />
                                    <View style={[styles.badge]}>
                                        <ParagraphComponent
                                            text={PERSONAL_INFORMATION?.DEFAULT}
                                            style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textBlack, commonStyles.flex1, commonStyles.textRight]}
                                        />
                                    </View>

                                </View>}
                            </View>
                        </>}
                        {!isLoading && !addressDetails && <NoDataComponent />}
                    </View>
                </Container>

            </ScrollView>

        </SafeAreaView>

    );
};
export default AddressDetails;

const themedStyles = StyleService.create({
    labelStyle: {
        width: (WINDOW_WIDTH * 30) / 100,
    },

    pending: {
        backgroundColor: NEW_COLOR.BG_ORANGE
    }, darkBg: {
        backgroundColor: NEW_COLOR.MENU_CARD_BG,
        borderRadius: 16,
    },
    p16: {
        padding: 16
    }, badge: {
        borderRadius: s(8),
        paddingHorizontal: s(8),
        paddingVertical: s(4),
        marginLeft: s(8),
        backgroundColor: NEW_COLOR.BG_ORANGE,
    },
});
