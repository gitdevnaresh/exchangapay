import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View, ScrollView, SafeAreaView, Switch, BackHandler } from "react-native";
import { useIsFocused } from "@react-navigation/core";
import { Container } from '../../components';
import { ms } from "../../constants/theme/scale";
import { NEW_COLOR } from "../../constants/theme/variables";
import AntDesign from "react-native-vector-icons/AntDesign";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import DefaultButton from "../../components/DefaultButton";
import LabelComponent from "../../components/Paragraph/label";
import ErrorComponent from "../../components/Error";
import { Field, Formik } from "formik";
import CustomPickerAcc from "../../components/CustomPicker";
import InputDefault from '../../components/DefaultFiat';
import { SecurityQuestionSchema } from "./SecurityQuestionSchema";
import { isErrorDispaly } from "../../utils/helpers";
import ProfileService from "../../services/profile";
import Loadding from "../../components/skeleton";
import { securityCEnterVerify } from "./skeleton_views";
import { commonStyles } from "../../components/CommonStyles";

const SecurityQuestion = (props: any) => {
    const nameRef = useRef();
    const isFocused = useIsFocused();
    const securityVerifySk = securityCEnterVerify(1);
    const [errormsg, setErrormsg] = useState<string>('');
    const [questionsSaveLoading, setQuestionsSaveLoading] = useState(false);
    const [questionsLoading, setQuestionsLoading] = useState(false);
    const [myQuestionsData, setMyQuestionsData] = useState<any>([]);
    const [myQuestion2Data, setMyQuestion2Data] = useState<any>([]);
    const [myQuestion3Data, setMyQuestion3Data] = useState<any>([]);
    const [questiionsInfo, setquestiionsInfo] = useState<any>(null);
    const [initValues, setInitValues] = useState({
        question1: "",
        answer: "",
        question2: "",
        answer2: "",
        question3: "",
        answer3: "",
    });
    useEffect(() => {
        fetchSecurityQuestions();
        fetchSecurityQuestionsList();
    }, [isFocused]);

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

    const onSubmit = async (values: any) => {
        setQuestionsSaveLoading(true)
        let obj = [...questiionsInfo];
        if (obj.length > 0) {
            obj[0].question = values.question1;
            obj[0].answer = values.answer;
            obj[1].question = values.question2;
            obj[1].answer = values.answer2;
            obj[2].question = values.question3;
            obj[2].answer = values.answer3;
        } else {
            obj = [{ question: values.question1, answer: values.answer }, { question: values.question2, answer: values.answer2 }, { question: values.question3, answer: values.answer3 }]
        }
        let verifedRes;
        try {
            if (questiionsInfo && questiionsInfo.length > 0 && questiionsInfo[0]?.id) {
                verifedRes = await ProfileService.updateSecurityQuestionsdata(obj);
            } else {
                verifedRes = await ProfileService.saveSecurityQuestionsdata(obj);
            }
            if (verifedRes.status === 200) {
                if (props.route.params.isEnable) {
                    const obj = {
                        "type": "SecurityQuestions",
                        "isEnable": true
                    }
                    await ProfileService.setSequrityQuationsSwitch(obj);
                    props.navigation.goBack();
                    setQuestionsSaveLoading(false)
                } else {
                    props.navigation.goBack();
                    setQuestionsSaveLoading(false)
                }
            } else {
                setQuestionsSaveLoading(false)
                setErrormsg(isErrorDispaly(verifedRes));

            }
        } catch (err) {
            setQuestionsSaveLoading(false)
            setErrormsg(isErrorDispaly(verifedRes));
        }
    };
    const fetchSecurityQuestions = async () => {
        try {
            setQuestionsLoading(true);
            const response: any = await ProfileService.getSecurityQuestionsdata();
            if (response.data && response.data.length > 0) {
                setInitValues({
                    question1: response.data[0]?.question || null,
                    answer: response.data[0]?.answer || null,
                    question2: response.data[1]?.question || null,
                    answer2: response.data[1]?.answer || null,
                    question3: response.data[2]?.question || null,
                    answer3: response.data[2]?.answer || null
                })
            }
            setquestiionsInfo(response.data)
            setErrormsg('');
            setQuestionsLoading(false);
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setQuestionsLoading(false);
        }
    };
    const fetchSecurityQuestionsList = async () => {
        try {
            setQuestionsLoading(true);
            const response = await ProfileService.getSecurityQuestions();
            const list = response.data?.map(item => {
                return { id: item.id, name: item.question };
            })
            setMyQuestionsData(list);
            setMyQuestion2Data(list);
            setMyQuestion3Data(list);
            setErrormsg('');
            setQuestionsLoading(false);
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setQuestionsLoading(false);
        }
    };

    return (
        <>
            <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
                <ScrollView>
                    <Container style={commonStyles.container}>

                        <View style={[commonStyles.dflex, commonStyles.mb32, commonStyles.alignCenter, commonStyles.gap10]}>
                            <TouchableOpacity style={[styles.px8]} onPress={() => handleGoBack()}><View>
                                <View>
                                    <AntDesign name="arrowleft" size={22} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
                                </View>
                            </View>
                            </TouchableOpacity>
                            <ParagraphComponent text={"Set Security Question"} style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800]} />
                        </View>
                        {errormsg && <ErrorComponent message={errormsg} onClose={() => setErrormsg("")} />}
                        {questionsLoading && <Loadding contenthtml={securityVerifySk} />}
                        <View >
                            <Formik
                                initialValues={initValues}
                                onSubmit={onSubmit}
                                validationSchema={SecurityQuestionSchema}
                                enableReinitialize
                            >
                                {(formik) => {
                                    const { touched, handleSubmit, errors, handleChange, handleBlur, values, setFieldTouched, setFieldValue } = formik;
                                    return (
                                        <View >
                                            <>
                                                <View style={[commonStyles.dflex, commonStyles.gap8, commonStyles.alignCenter]}>
                                                    <ParagraphComponent text={"Q1"} style={[commonStyles.fs24, commonStyles.textBlack, commonStyles.fw500, styles.labelWidth]} />
                                                    <View style={commonStyles.flex1}>
                                                        <Field
                                                            activeOpacity={0.9}
                                                            touched={touched.question1}
                                                            name="question1"
                                                            error={errors.question1}
                                                            handleBlur={handleBlur}
                                                            data={myQuestionsData}
                                                            placeholder={"Select Question"}
                                                            placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                                                            component={CustomPickerAcc}
                                                            Children={<LabelComponent text=" *" style={commonStyles.textError} />}
                                                        />
                                                    </View>
                                                </View>
                                                <View style={[commonStyles.mb14]} />
                                                <View style={[commonStyles.dflex, commonStyles.gap8,]}>
                                                    <ParagraphComponent text={"A :"} style={[commonStyles.fs24, commonStyles.textBlack, commonStyles.fw500, styles.labelWidth]} />
                                                    <View style={commonStyles.flex1}>
                                                        <Field
                                                            multiline={true}
                                                            touched={touched.answer}
                                                            name='answer'
                                                            error={errors.answer}
                                                            handleBlur={handleBlur}
                                                            customContainerStyle={{
                                                                placeholder: styles.placeholder,

                                                            }}
                                                            placeholder={'Enter Answer'}
                                                            component={InputDefault}
                                                            innerRef={nameRef}
                                                            inputContainerStyle={{ height: 70 }}
                                                            Children={<LabelComponent text=" *" style={commonStyles.textError} />}
                                                        />
                                                    </View>
                                                </View>
                                                <View style={[commonStyles.mb24]} />
                                                <View style={[commonStyles.mb24]} />

                                                <View style={[commonStyles.dflex, commonStyles.gap8, commonStyles.alignCenter]}>
                                                    <ParagraphComponent text={"Q2"} style={[commonStyles.fs24, commonStyles.textBlack, commonStyles.fw500, styles.labelWidth]} />
                                                    <View style={commonStyles.flex1}>
                                                        <Field
                                                            activeOpacity={0.9}
                                                            style={{
                                                                color: "#b1b1b1",
                                                                backgroundColor: "#1A171D",
                                                            }}
                                                            touched={touched.question2}
                                                            name="question2"
                                                            error={errors.question2}
                                                            handleBlur={handleBlur}
                                                            data={myQuestion2Data}
                                                            placeholder={"Select Question2"}
                                                            placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                                                            component={CustomPickerAcc}
                                                            inputContainerStyle={{ height: 70 }}
                                                            Children={<LabelComponent text=" *" style={commonStyles.textError} />}
                                                        />
                                                    </View>
                                                </View>
                                                <View style={[commonStyles.mb14]} />
                                                <View style={[commonStyles.dflex, commonStyles.gap8,]}>
                                                    <ParagraphComponent text={"A :"} style={[commonStyles.fs24, commonStyles.textBlack, commonStyles.fw500, styles.labelWidth]} />
                                                    <View style={commonStyles.flex1}>
                                                        <Field
                                                            touched={touched.answer2}
                                                            name='answer2'
                                                            error={errors.answer2}
                                                            handleBlur={handleBlur}
                                                            customContainerStyle={{
                                                                placeholder: styles.placeholder,
                                                            }}
                                                            placeholder={'Enter Answer'}
                                                            inputContainerStyle={{ height: 70 }}
                                                            component={InputDefault}
                                                            innerRef={nameRef}
                                                            Children={<LabelComponent text=" *" style={commonStyles.textError} />}
                                                        /></View>
                                                </View>
                                                <View style={[commonStyles.mb28]} />
                                                <View style={[commonStyles.dflex, commonStyles.gap8, commonStyles.alignCenter, commonStyles.mt16]}>
                                                    <ParagraphComponent text={"Q3"} style={[commonStyles.fs24, commonStyles.textBlack, commonStyles.fw500, styles.labelWidth]} />
                                                    <View style={commonStyles.flex1}>
                                                        <Field
                                                            activeOpacity={0.9}
                                                            style={{
                                                                color: "#b1b1b1",
                                                                backgroundColor: "#1A171D",
                                                            }}
                                                            touched={touched.question3}
                                                            name="question3"
                                                            error={errors.question3}
                                                            handleBlur={handleBlur}
                                                            data={myQuestion3Data}
                                                            placeholder={"Select Question"}
                                                            placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                                                            component={CustomPickerAcc}
                                                            Children={<LabelComponent text=" *" style={commonStyles.textError} />}
                                                        />
                                                    </View>
                                                </View>
                                                <View style={[commonStyles.mb14]} />
                                                <View style={[commonStyles.dflex, commonStyles.gap8,]}>
                                                    <ParagraphComponent text={"A :"} style={[commonStyles.fs24, commonStyles.textBlack, commonStyles.fw500, styles.labelWidth]} />
                                                    <View style={commonStyles.flex1}>
                                                        <Field
                                                            touched={touched.answer3}
                                                            name='answer3'
                                                            error={errors.answer3}
                                                            handleBlur={handleBlur}
                                                            customContainerStyle={{
                                                                placeholder: styles.placeholder,
                                                            }}
                                                            placeholder={'Enter Answer'}
                                                            component={InputDefault}
                                                            inputContainerStyle={{ height: 70 }}
                                                            innerRef={nameRef}
                                                            Children={<LabelComponent text=" *" style={commonStyles.textError} />}
                                                        />
                                                    </View>
                                                </View>
                                            </>
                                            <View style={[commonStyles.mb43]} />
                                            <View style={[commonStyles.mb43]} />
                                            <DefaultButton
                                                title='Save'
                                                style={undefined}
                                                loading={questionsSaveLoading}
                                                disable={questionsSaveLoading}
                                                onPress={handleSubmit}
                                            />
                                            <View style={[commonStyles.mb24]} />
                                        </View>
                                    );
                                }}
                            </Formik>
                        </View>

                    </Container>
                </ScrollView>
            </SafeAreaView>
        </>
    );
};

export default SecurityQuestion;

const styles = StyleSheet.create({
    px8: { paddingVertical: 8 },
    mb14: { marginBottom: 14 },
    title: { fontSize: 18, fontWeight: "500", lineHeight: 21 },
    alignCenter: { alignItems: "center", },
    dflex: { flexDirection: "row" },
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: "#fff",
    },
    gap8: { gap: 8 },
    fw800: {
        fontWeight: "800",
    },
    fw500: {
        fontWeight: "500",
    },
    mb28: { marginBottom: 28, },
    textBlack: {
        color: NEW_COLOR.TEXT_BLACK
    },
    fs16: {
        fontSize: ms(16)
    },
    placeholder: {
        fontSize: 13,
        color: "#000",
    },
    labelWidth: { minWidth: 35 }
});
