import {
    Alert,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View, Image, ScrollView
} from "react-native";
import React, { useEffect, useState } from "react";
import Modal from "react-native-modal";
import Icon from "react-native-vector-icons/Feather";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, CommonActions } from "@react-navigation/core";
import { Container } from '../../components';
import { SafeAreaView } from "react-native-safe-area-context";
import DefaultButton from "../../components/DefaultButton";

const UpdateLater = (props: any) => {
    const [reffInfo, setReffInfo] =useState<any>(null)
    const { show } = props;
    return (
        <>
            <Container style={styles.container}>
                        <View style={[styles.content]}>
                            <View>
                           <Image style={[styles.imgCenter]} source={require("../../assets/images/later-update.png")} />
                           <Text style={[styles.pageTitle,styles.mx10]}>later update</Text>
                           <Text style={[styles.textNormal]}>We added lots of new features and fix some bugs to make your experience as smooth as possible</Text>
                           <View style={styles.mt26}>
                            <DefaultButton
                                title={"Update"}
                                customTitleStyle={styles.btnConfirmTitle}
                                icon={undefined}
                                style={undefined}
                                customButtonStyle={undefined}
                                customContainerStyle={undefined}
                                backgroundColors={undefined}
                                colorful={undefined}
                                transparent={undefined}

                            />
                            <View style={[styles.mt26]}><TouchableOpacity><View style={styles.cancelbtn}><Text style={[styles.cancelText]}>Cancel</Text></View></TouchableOpacity></View>
                        </View>
                        </View>
                        </View>
            </Container>
        </>
    );
};

export default UpdateLater;

const styles = StyleSheet.create({
    cancelText: { textAlign: "center", color: "#0F85EE", fontSize: 18, fontWeight: "500" },
    cancelbtn: {
        borderWidth: 1, borderColor: "#0F85EE", borderRadius: 5, padding: 12,
    },
    mx10:{marginVertical:10},
    content:{flexDirection:"row",alignItems:"center",justifyContent:"center",flex:1},
    imgCenter:{marginLeft:"auto",marginRight:"auto"},
    btnConfirmTitle: {
        fontWeight: "500",
        fontSize: 18, color: "#000000"
    },
    blue:{
        color:"#0F85EE",
    },
    textWhite: { color: "#fff" },
    textNormal: {
        fontSize: 16, fontWeight: "400", lineHeight: 25,color:"#B1B1B1",textAlign:"center"
    },
    mt26: { marginTop: 26 },
    colorSecondary: { color: "#B1B1B1" },
    title: { fontSize: 18, fontWeight: "500", lineHeight: 21 },
    justify: { justifyContent: "space-between" },
    pr16: { paddingRight: 16, },
    alignCenter: { alignItems: "center", },
    dflex: { flexDirection: "row" },
    pageTitle: {
        fontSize: 24, fontWeight: "600", lineHeight: 29, color: "#fff",textAlign:"center"
    },
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#000",
    },
});
