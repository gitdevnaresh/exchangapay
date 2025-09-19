import {
    Alert,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View, Image, Platform
} from "react-native";
import React, { useEffect, useState } from "react";
import Modal from "react-native-modal";
import { Container } from '../../components';
import DefaultButton from "../../components/DefaultButton";

const ForceUpdate = (props: any) => {
    const { show, forceUpdate } = props;
    const platformUrls: any = {
        ios: "https://apps.apple.com/app/exchanga-pay/id6480390257",
        // android: "https://play.google.com/apps/internaltest/4701194528402245605",
        android: "https://play.google.com/store/apps/details?id=com.exchanga"
    };
    return (
        <>
            <Modal isVisible={show} style={{ flex: 1, margin: 0 }}>
                <Container style={styles.container}>
                    <View style={[styles.content]}>
                        <View>
                            <Image style={[styles.imgCenter]} source={require("../../assets/images/force-update.png")} />
                            {/* <Text style={[styles.pageTitle,styles.mx10]}>Force update</Text> */}
                            {forceUpdate && <Text style={[styles.textNormal]}>We added new features and fix some bugs to make your experience as smooth as possible</Text>}
                            {!forceUpdate && <Text style={[styles.textNormal]}>We recommend you to update your app. you can keep using the app while we downloaded the update in background.</Text>}
                            <View style={styles.mt26}>
                                <DefaultButton
                                    title={"Update Now"}
                                    customTitleStyle={styles.btnConfirmTitle}
                                    icon={undefined}
                                    style={undefined}
                                    customButtonStyle={undefined}
                                    customContainerStyle={undefined}
                                    backgroundColors={undefined}
                                    colorful={undefined}
                                    transparent={undefined}
                                    onPress={() => Linking.openURL(platformUrls[Platform.OS])}
                                />
                                {!forceUpdate && <View style={[styles.mt26]}><TouchableOpacity onPress={() => { props.updateLatter(); }}><View style={styles.cancelbtn}><Text style={[styles.cancelText]}>No, I will update later</Text></View></TouchableOpacity></View>}
                            </View>
                        </View>
                    </View>
                </Container>
            </Modal>
        </>
    );
};

export default ForceUpdate;

const styles = StyleSheet.create({
    mx10: { marginVertical: 10 },
    cancelText: { textAlign: "center", color: "#0F85EE", fontSize: 18, fontWeight: "500" },
    cancelbtn: {
        borderWidth: 1, borderColor: "#0F85EE", borderRadius: 5, padding: 12,
    },
    content: { flexDirection: "row", alignItems: "center", justifyContent: "center", flex: 1 },
    imgCenter: { marginLeft: "auto", marginRight: "auto" },
    btnConfirmTitle: {
        fontWeight: "500",
        fontSize: 18, color: "#000000"
    },
    blue: {
        color: "#0F85EE",
    },
    textWhite: { color: "#fff" },
    textNormal: {
        fontSize: 16, fontWeight: "400", lineHeight: 25, color: "#B1B1B1", textAlign: "center"
    },
    mt26: { marginTop: 26 },
    colorSecondary: { color: "#B1B1B1" },
    title: { fontSize: 18, fontWeight: "500", lineHeight: 21 },
    justify: { justifyContent: "space-between" },
    pr16: { paddingRight: 16, },
    alignCenter: { alignItems: "center", },
    dflex: { flexDirection: "row" },
    pageTitle: {
        fontSize: 24, fontWeight: "600", lineHeight: 29, color: "#fff", textAlign: "center"
    },
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#000",
    },
});
