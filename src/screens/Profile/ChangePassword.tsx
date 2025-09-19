import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, BackHandler, View, ScrollView, ImageBackground } from "react-native";
import * as Yup from "yup";
import { Formik } from "formik";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/core";
import { Container } from '../../components';
import { SafeAreaView } from "react-native-safe-area-context";
import DefaultButton from "../../components/DefaultButton";
import { encryptValue, isErrorDispaly } from '../../utils/helpers';
import ErrorComponent from '../../components/Error';
import { commonStyles } from '../../components/CommonStyles';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { NEW_COLOR } from '../../constants/theme/variables';
import SecurityServices from "../../services/security";

const ChangePassword = (props: any) => {
    const { sk } = useSelector((state: any) => state.UserReducer?.userInfo);
    const navigation = useNavigation();
    const [errormsg, setErrormsg] = useState(null);
    const [btnDtlLoading, setBtnDtlLoading] = useState(false);
    const [btnDisabled, setBtnDisabled] = useState(false);
    const [pwdLoading, setPwdLoading] = useState(false);


    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleGoBack(); return true; }
        );
        return () => backHandler.remove();
    }, []);
    const handleGoBack = () => {
        props.navigation.navigate("Security")
    };

    const CreateAccSchema = Yup.object().shape({
        currentPassword: Yup.string().required('Please enter current password'),
        newPassword: Yup.string()
            .required('Please enter new password')
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?=.{8,})/,
                'Password must be at least 8 Characters long one uppercase with one lowercase, one numeric & special character',
            ),
        confirmPassword: Yup.string()
            .required('Please enter confirm password')
            .oneOf([Yup.ref('newPassword'), ''], 'Password does not match'),
    });

    const initValues = {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    };
    const onSubmit = async (value: any) => {
        setBtnDtlLoading(true);
        setBtnDisabled(true);
        const password = value?.newPassword && encryptValue(value.newPassword, sk) || '';
        let obj = {
            password: password,
        }
        const res: any = await SecurityServices.changePassword(obj);
        if (res?.status === 200) {
            setBtnDtlLoading(false);
            setBtnDisabled(false);
            navigation.goBack();
        }
        else {
            setErrormsg(isErrorDispaly(res));
            setBtnDtlLoading(false);
            setBtnDisabled(false);
        }
    }
    const fetchResetPassword = async () => {
        try {
            setPwdLoading(true);
            const response: any = await SecurityServices.getResetPassword();
            if (response.status === 200) {
                props.navigation.navigate("ChangePasswordSucess");
            } else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        } finally {
            setPwdLoading(false);
        }
    }
    return (

        <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
            <ScrollView>
                <Container style={commonStyles.container}>

                    <>
                        {errormsg && <ErrorComponent message={errormsg} onClose={() => setErrormsg(null)} />}
                        <TouchableOpacity onPress={() => handleGoBack()} activeOpacity={0.7}>
                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                <AntDesign name="arrowleft" size={22} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3, }} />

                                <ParagraphComponent style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800]} text={"Change Password"} />
                            </View>
                        </TouchableOpacity>
                        <View style={[commonStyles.mb43]} />
                        <View >
                            <Formik
                                initialValues={initValues}
                                onSubmit={onSubmit}
                                validationSchema={CreateAccSchema}
                                enableReinitialize
                            >
                                {(formik) => {
                                    const { values } =
                                        formik;
                                    return (
                                        <View>
                                            <ImageBackground resizeMode='contain' style={{ position: "relative", height: 385 }} source={require("../../assets/images/cards/light-purplebg.png")}>

                                                <View >
                                                    <View style={{ height: 240, paddingTop: 16, paddingBottom: 16, alignItems: "center", flexDirection: "row", }}>
                                                        <View style={[commonStyles.flex1, commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter,]}>
                                                            <ParagraphComponent text={"You have requested to reset your password for your account. To proceed with the password reset process, please click on the  Reset button :"} style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textGrey, commonStyles.textCenter, commonStyles.px24,]} />
                                                        </View>
                                                    </View>
                                                    <View style={[styles.border]}></View>
                                                    <View style={{ height: 115, flexDirection: "row", alignItems: "center", paddingTop: 10, paddingBottom: 10 }}>
                                                        <View style={[commonStyles.flex1, commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter,]}>
                                                            <ParagraphComponent text={"If you did not initiate this request, you can safely ignore this email. Your account security is important to us, and no action will be taken."} style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textGrey, commonStyles.textCenter, commonStyles.px24]} />
                                                        </View>
                                                    </View>
                                                </View>
                                            </ImageBackground>
                                            <View style={[commonStyles.mb28]} />
                                            <DefaultButton
                                                title={"Reset"}
                                                customTitleStyle={styles.btnConfirmTitle}
                                                onPress={fetchResetPassword}
                                                style={undefined}
                                                customButtonStyle={undefined}
                                                customContainerStyle={undefined}
                                                backgroundColors={undefined}
                                                disable={btnDisabled}
                                                loading={pwdLoading}
                                                colorful={undefined}
                                                transparent={undefined}
                                                iconArrowRight={false}
                                                iconCheck={true}
                                            />
                                            <View style={[commonStyles.mb20]} />
                                            <DefaultButton
                                                title={"Cancel"}
                                                style={undefined}
                                                backgroundColors={undefined}
                                                colorful={undefined}
                                                loading={undefined}
                                                disable={undefined}
                                                onPress={() => handleGoBack()}
                                                transparent={true}
                                                iconArrowRight={false}
                                                closeIcon={true}
                                            />
                                            <View style={[commonStyles.mb20]} />
                                        </View>
                                    );
                                }}
                            </Formik>
                        </View>
                    </>

                </Container>
            </ScrollView>
        </SafeAreaView>

    );
};

export default ChangePassword;

const styles = StyleSheet.create({
    btnConfirmTitle: {
        color: NEW_COLOR.TEXT_ALWAYS_WHITE
    },
    container: {
        paddingVertical: 0,
    },
    text: {
        fontSize: 16,
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    border: {
        borderTopWidth: 2,
        opacity: 0.2, width: '96%'
    },
    mt48: { marginTop: 48 }
});
