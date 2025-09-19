import { StyleSheet, Text, View, Image } from "react-native";
import React, { useState } from "react";
import { Container } from '../../components';
import DefaultButton from "../../components/DefaultButton";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import { commonStyles } from "../../components/CommonStyles";
import { NEW_COLOR } from "../../constants/theme/variables";
import useMemberLogin from "../../hooks/useMemberLogin";
import useLogout from "../../hooks/useLogOut";

interface Loding {
    isRefreshing: boolean,
    isLogout: boolean
}

const SomethingWentWrong = () => {
    const { getMemDetails } = useMemberLogin();
    const { logout } = useLogout();
    const [isoading, setIsLoading] = useState<Loding>({
        isRefreshing: false,
        isLogout: false
    })
    const handleRetryChanges = async () => {
        setIsLoading((prev) => ({ ...prev, isRefreshing: true }))
        await getMemDetails();
        setIsLoading((prev) => ({ ...prev, isRefreshing: false }))
    };
    const handleLgout = async () => {
        setIsLoading((prev) => ({ ...prev, isLogout: true }))
        await logout();
        setIsLoading((prev) => ({ ...prev, isLogout: false }))
    };
    return (

        <Container style={commonStyles.container}>
            <View style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.dflex]}>
                <View>
                    <Image style={[styles.imgCenter]} source={require("../../assets/images/went-wrong.png")} />
                    <Text style={[styles.pageTitle,]}></Text>
                    <ParagraphComponent style={[commonStyles.fs24, commonStyles.fw600, commonStyles.textBlack, commonStyles.mx10, commonStyles.textCenter]} text={"Something Went Wrong"} />
                    <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw400, commonStyles.textGrey, commonStyles.textCenter]} text={"Sorry we can’t process your request at the moment. Please try again later."} />
                    <View style={styles.mt26}>
                        <DefaultButton
                            title={"Retry"}
                            customTitleStyle={styles.btnConfirmTitle}
                            icon={undefined}
                            style={undefined}
                            customButtonStyle={undefined}
                            customContainerStyle={undefined}
                            backgroundColors={undefined}
                            colorful={undefined}
                            transparent={undefined}
                            disable={isoading.isRefreshing}
                            loading={isoading.isRefreshing}
                            onPress={handleRetryChanges}
                        />
                    </View>
                    <View style={[commonStyles.mb16]} />
                    <View>

                        <DefaultButton
                            title={"Logout"}
                            customTitleStyle={undefined}
                            icon={undefined}
                            style={undefined}
                            customButtonStyle={undefined}
                            customContainerStyle={undefined}
                            backgroundColors={undefined}
                            colorful={undefined}
                            transparent={true}
                            disable={isoading.isLogout}
                            loading={isoading.isLogout}
                            onPress={handleLgout}
                            iconArrowRight={false}
                            closeIcon={true}
                        />
                    </View>
                </View>
            </View>
        </Container>

    );
};

export default SomethingWentWrong;

const styles = StyleSheet.create({
    imgCenter: { marginLeft: "auto", marginRight: "auto" },
    btnConfirmTitle: {
        color: NEW_COLOR.TEXT_ALWAYS_WHITE
    },
    mt26: { marginTop: 26 },
    title: { fontSize: 18, fontWeight: "500", lineHeight: 21 },
    pageTitle: {
        fontSize: 24, fontWeight: "600", lineHeight: 29, color: "#fff", textAlign: "center"
    },

});
