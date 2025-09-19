import React, { useEffect, useState } from 'react';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import { View, ScrollView, SafeAreaView, TouchableOpacity, BackHandler, Modal } from 'react-native';
import { Container } from '../../components';
import Feather from "react-native-vector-icons/Feather";
import { NEW_COLOR, WINDOW_WIDTH } from '../../constants/theme/variables';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import { commonStyles } from '../../components/CommonStyles';
import DefaultButton from '../../components/DefaultButton';
import { Field, Formik } from 'formik';
import InputDefault from '../../components/DefaultFiat';
import AntDesign from "react-native-vector-icons/AntDesign";
import { isErrorDispaly } from '../../utils/helpers';
import ProfileService from '../../services/profile';
import ErrorComponent from '../../components/Error';
import { s } from '../../constants/theme/scale';
import LabelComponent from '../../components/Paragraph/label';

const Authentication = React.memo(({ isSucess, isClose, isVisable = true }): any => {
    const styles = useStyleSheet(themedStyles);
    const [errormsg, setErrormsg] = useState<string>("");
    const [saveLoading, setSaveLoading] = useState<boolean>(false)
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleGoBack(); return true; }
        );
        return () => backHandler.remove();
    }, []);

    const handleGoBack = () => {
        if (isClose && typeof isClose === 'function') { isClose() }
    };
    const verifyCode = async (value: any) => {
        if (value.code == "") {
            setErrormsg("Please enter verification code.");
            return;
        }
        try {
            setSaveLoading(true);
            const verifedRes = await ProfileService.varificationGoogleAuthenticate(value.code);
            if (verifedRes?.data) {
                if (isSucess && typeof isSucess === 'function') { isSucess() }
            } else {
                setErrormsg('Invalid code!');
                setSaveLoading(false);
            }
        } catch (err: any) {
            setErrormsg(isErrorDispaly(err));
            setSaveLoading(false);
        }
    }

    const handleCLoseError = () => {
        setErrormsg("")
    }
    return (

        <Modal
            transparent={false}
            visible={isVisable}
            onRequestClose={() => handleGoBack()}
            animationType="slide"
            style={{ flex: 1 }}
        >
            <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <Container style={commonStyles.container}>

                        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.mb32]}>
                            <TouchableOpacity activeOpacity={0.8} onPress={() => handleGoBack()}>
                                <AntDesign name="arrowleft" size={22} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
                            </TouchableOpacity>
                            <ParagraphComponent style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800,]} text={`Verify your Identity`} />
                        </View>
                        <View style={[commonStyles.mb32]} />
                        <View style={[commonStyles.sectionStyle, commonStyles.dflex, commonStyles.gap12]}>
                            <Feather name='info' size={s(16)} color={NEW_COLOR.TEXT_GREY} style={{ marginTop: 4 }} />
                            <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw600, styles.mr24, styles.pr16, commonStyles.textGrey]} text={"Check your preferred one-time password application for a code."} />
                        </View>
                        {errormsg && <ErrorComponent message={errormsg} onClose={handleCLoseError} />}
                        <View style={[commonStyles.mb24]} />
                        <Formik
                            initialValues={{ code: '' }}
                            onSubmit={verifyCode}
                            enableReinitialize
                        >
                            {(formik) => {
                                const { touched, handleSubmit, errors } = formik;
                                return (
                                    <View>
                                        <Field
                                            touched={touched.code}
                                            name='code'
                                            label={'Enter your one-time code '}
                                            error={errors.code}
                                            placeholder={'Enter Code'}
                                            component={InputDefault}
                                            maxLength={6}
                                            keyboardType="numeric"
                                            Children={
                                                <LabelComponent
                                                    text=" *"
                                                    style={commonStyles.textError}
                                                />
                                            }
                                        />
                                        <View style={[commonStyles.mb43]} />
                                        <View style={[commonStyles.mb43]} />
                                        <DefaultButton
                                            title='Verify'

                                            style={undefined}
                                            loading={saveLoading}
                                            disable={saveLoading}
                                            onPress={handleSubmit}
                                        />
                                    </View>
                                );
                            }}
                        </Formik>

                    </Container >
                </ScrollView>
            </SafeAreaView>
        </Modal>

    )

})

export default Authentication;

const themedStyles = StyleService.create({
    sectionStyle: {
        borderWidth: 1, borderColor: NEW_COLOR.BORDER_GREY,
        borderRadius: 16,
        backgroundColor: NEW_COLOR.SECTION_LIGHTORANGE_BG,
        paddingVertical: 18,
        paddingHorizontal: 20
    },
    flexWrap: {
        flexWrap: "wrap"
    },
    mr24: { marginRight: 24, },
    infoCard: { backgroundColor: NEW_COLOR.BG_LIGHTORANGE, paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12, marginTop: 16, },
    copyBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    mt34: { marginTop: 34 },
    w318: { marginHorizontal: 28, marginBottom: -32, zIndex: 9 },
    bgQR: { paddingHorizontal: 32, paddingVertical: 48, borderRadius: 24 },
    bgpurple: { backgroundColor: NEW_COLOR.BG_PURPLE, padding: 8, borderRadius: 100, width: (WINDOW_WIDTH * 48) / 100 },
    whiteCircle: { backgroundColor: NEW_COLOR.BACKGROUND_WHITE, padding: 8, borderRadius: 100, },
    px8: { paddingHorizontal: 8 },
    pr16: { paddingRight: 16, },
    mt42: { marginTop: 42 },
    borderCircle: { borderRadius: 100, paddingHorizontal: 24, borderWidth: 1, paddingVertical: 12, minWidth: (WINDOW_WIDTH * 26) / 100, maxWidth: (WINDOW_WIDTH * 40) / 100 },
    ml6: {
        marginLeft: 16
    },
    ml4: {
        marginLeft: 4
    },
    ml8: {
        marginLeft: 8,
    },
    mb32: {
        marginBottom: 32,
    },
    bgWhite: {
        backgroundColor: NEW_COLOR.BACKGROUND_WHITE, padding: 8, marginLeft: "auto", marginRight: "auto"
    },
    listItem: {
        marginVertical: 8,
        flexDirection: 'row', flex: 1, flexWrap: 'wrap', flexShrink: 1
    },
    mb20: {
        marginBottom: 20
    },
})