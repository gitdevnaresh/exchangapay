import React, { useEffect, useState, useRef } from 'react';
import { StyleService, useStyleSheet } from "@ui-kitten/components";
import { Container } from "../../components";
import { View, ScrollView, SafeAreaView, TouchableOpacity, BackHandler, TextInput } from "react-native";
import { Formik, Field } from "formik";
import { s } from "../../constants/theme/scale";
import { NEW_COLOR } from "../../constants/theme/variables";
import DefaultButton from "../../components/DefaultButton";
import { isErrorDispaly, trimValues } from '../../utils/helpers';
import CustomPicker from "../../components/CustomPicker";
import ErrorComponent from '../../components/Error';
import OnBoardingService from '../../services/onBoardingservice';
import { useSelector } from 'react-redux';
import { useNavigation } from "@react-navigation/native";
import { commonStyles } from '../../components/CommonStyles';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import LabelComponent from '../../components/Paragraph/label';
import PhoneCodePicker from '../../components/PhoneCodeSelect';
import CardsModuleService from '../../services/card';
import InputDefault from '../../components/DefaultFiat';
import AuthService from '../../services/auth';
import { SvgUri } from 'react-native-svg';
import { Loaders, RegVals } from './rigistrationInterfaces';
import { EditIcon } from '../../assets/svg';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { REGISTRATION_CONSTATNTS } from './constants';
import useMemberLogin from '../../hooks/useMemberLogin';

const RigisterCustomer = (props: any) => {
    const fname = useRef(null);
    const lname = useRef(null);
    const phno = useRef(null);
    const cname = useRef(null);
    const bhname = useRef(null);
    const styles = useStyleSheet(themedStyles);
    const [countries, setCountries] = useState<any>([]);
    const [errormsg, setErrormsg] = useState(null);
    const [regVals, setRegVals] = useState<RegVals>({ firstName: '', lastName: '', phoneNumber: '', country: '', referralCode: '', isBusiness: '', businessName: '', type: 'Personal', phoneCode: "", phoneOTP: "" });
    const userprofile = useSelector((state: any) => state.UserReducer?.userInfo);
    const navigation = useNavigation<any>();
    const [saveLoading, setSaveLoading] = useState<boolean>(false)
    const [countryCodelist, setCountryCodelist] = useState<any>([]);
    const [resendTimer, setResendTimer] = useState<number>(0);
    const timerInterval = useRef(null);
    const [loaders, setLoaders] = useState<Loaders>({
        isPhoneNoEditable: true,
        isOTPButtonDisable: false,
        isOTPEditable: false,
        isPhoneNoEditVisible: false,
        isTimerShow: false,
        actionBtnName: REGISTRATION_CONSTATNTS.GET_OTP
    })
    const { getMemDetails } = useMemberLogin();

    const HTML_REGEX = /<[^>]*>?/g;
    const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FAB0}-\u{1FAB6}\u{1FAC0}-\u{1FAC2}\u{1FAD0}\u{200D}\u{2640}\u{200D}\u{2642}]/gu;
    const ONLY_NUMBERS_REGEX = /^\d+$/;
    const SPACE_NUMBERS_REGEX = /^(?=.*\S).+$/;
    const ONLY_ALPHABETS = /^[a-zA-Z ]*$/;
    const [isValid, setIsValid] = useState<any>(null);
    const [phoneOTP, setPhoneOTP] = useState<string | number>("");

    useEffect(() => {
        getListOfCountryDetails();
        getListOfCountryCodeDetails();
        if (userprofile) {
            setRegVals((prevState) => ({
                ...prevState,
                firstName: userprofile.firstName || '',
                lastName: userprofile.lastName || '',
                phoneNumber: userprofile.phoneNumber || '',
                country: userprofile.country || '',
                referralCode: '',
                isBusiness: userprofile.isBusiness ? REGISTRATION_CONSTATNTS.BUSINESS : REGISTRATION_CONSTATNTS.PERSONAL,
                businessName: userprofile.businessName || '',
                type: userprofile.isBusiness ? REGISTRATION_CONSTATNTS.BUSINESS : REGISTRATION_CONSTATNTS.PERSONAL,
                phoneCode: userprofile.phonecode || ''
            }));
        };
        const backHandler = BackHandler.addEventListener(
            REGISTRATION_CONSTATNTS.HARDWARE_BACK_PRESS,
            () => {
                handleGoBack();
                return true;
            }
        );
        return () => {
            backHandler.remove();
        };

    }, []);
    useEffect(() => {
        if (resendTimer > 0) {
            timerInterval.current = setInterval(() => {
                setResendTimer((prevTimer) => {
                    if (prevTimer <= 1) {
                        clearInterval(timerInterval.current);
                        setLoaders((prev: any) => ({ ...prev, actionBtnName: phoneOTP ? REGISTRATION_CONSTATNTS.VERIFY : REGISTRATION_CONSTATNTS.RESEND_OTP, isOTPButtonDisable: false, isTimerShow: false, isOTPEditable: true }));
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);

            return () => clearInterval(timerInterval.current);
        }
    }, [resendTimer]);

    const onChangeText = (value: any) => {
        const cleanedValue = value.replace(/[^0-9]/g, "");
        setIsValid(null);
        setErrormsg("");
        setLoaders((prev: any) => ({ ...prev, isOTPButtonDisable: false, actionBtnName: (value || loaders?.isTimerShow) ? REGISTRATION_CONSTATNTS.VERIFY : REGISTRATION_CONSTATNTS.RESEND_OTP }));
        setPhoneOTP(cleanedValue);
    };

    const getListOfCountryDetails = async () => {
        const response: any = await CardsModuleService.getCountries();
        if (response?.status === 200) {
            setCountries(response?.data);
            setErrormsg(null)
        } else {
            setErrormsg(isErrorDispaly(response));
        }
    };

    const getListOfCountryCodeDetails = async () => {
        try {
            const response: any = await CardsModuleService.getPersonalAddressLu();
            if (response?.status === 200) {
                setCountryCodelist(response?.data?.PhoneCodes);
                setErrormsg(null)
            } else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));

        }

    };

    const handleSubmit = async (values: any) => {
        const trimedValues = trimValues(values);
        let userObj = {
            "userId": userprofile.userId,
            "userName": userprofile.userName,
            "firstName": trimedValues.firstName,
            "lastName": trimedValues.lastName,
            "isEmialVerified": true,
            "isbusines": trimedValues.type === 'Personal' ? false : true,
            "phoneNo": trimedValues.phoneNumber,
            "PhoneCode": trimedValues.phoneCode,
            "country": trimedValues.country,
            "email": trimedValues.email || null,
            "businessName": trimedValues.businessName,
            "accountManager": null,
            "isAdmin": false,
            "referralCode": "",
            "accountType": "Corporate"
        }
        setSaveLoading(true);
        try {
            const saveRes: any = await OnBoardingService.saveUserInfo(userObj);
            if (saveRes.status === 200) {
                getMemDetails({});
            } else {
                setErrormsg(isErrorDispaly(saveRes));
                setSaveLoading(false);
            }

        } catch (err) {
            setErrormsg(isErrorDispaly(err));
            setSaveLoading(false);
        }
    }



    const handleGoBack = () => {
        navigation.goBack()
    }

    const validate = (values: any) => {
        let errors: any = {};
        if (values.type === REGISTRATION_CONSTATNTS.PERSONAL) {

            if (!values.lastName) {
                errors.lastName = REGISTRATION_CONSTATNTS.IS_REQUIRED;
            } else if (!ONLY_ALPHABETS.test(values.lastName)) {
                errors.lastName = REGISTRATION_CONSTATNTS.LAST_NAME_MUST_CONTAIN_ONLY_CHARECTERS;
            } else if (HTML_REGEX.test(values.lastName)) {
                errors.lastName = REGISTRATION_CONSTATNTS.LAST_NAME_CANNOT_CONTAIN_HTML_TAGS;
            } else if (EMOJI_REGEX.test(values.lastName)) {
                errors.lastName = REGISTRATION_CONSTATNTS.LAST_NAME_CANNOT_CONTAIN_EMOJIS;
            }
            else if (!SPACE_NUMBERS_REGEX.test(values.lastName)) {
                errors.lastName = REGISTRATION_CONSTATNTS.IS_REQUIRED;
            }
            else if (values.lastName.length > 50) {
                errors.lastName = REGISTRATION_CONSTATNTS.LAST_NAME_MUST_BE_AT_MOST_50_CHARACTERS;
            }

            if (!values.firstName) {
                errors.firstName = REGISTRATION_CONSTATNTS.IS_REQUIRED;
            } else if (!ONLY_ALPHABETS.test(values.firstName)) {
                errors.firstName = REGISTRATION_CONSTATNTS.FIRST_NAME_MUST_CONTAIN_ONLY_CHARACTERS;
            } else if (HTML_REGEX.test(values.firstName)) {
                errors.firstName = REGISTRATION_CONSTATNTS.FIRST_NAME_CANNOT_CONTAIN_HTML_TAGS;
            } else if (EMOJI_REGEX.test(values.firstName)) {
                errors.firstName = REGISTRATION_CONSTATNTS.FIRST_NAME_CANNOT_CONTAIN_EMOJIS;
            }
            else if (!SPACE_NUMBERS_REGEX.test(values.firstName)) {
                errors.firstName = REGISTRATION_CONSTATNTS.IS_REQUIRED;
            }
            else if (values.firstName.length > 50) {
                errors.firstName = REGISTRATION_CONSTATNTS.FIRST_NAME_MUST_BE_AT_MOST_50_CHARACTERS;
            }
        } else {
            if (!values.businessName) {
                errors.businessName = REGISTRATION_CONSTATNTS.BUSINESS_NAME_IS_REQUIRED;
            }
        }
        if (!values.phoneNumber) {
            errors.phoneNumber = REGISTRATION_CONSTATNTS.IS_REQUIRED;
        } else if (!ONLY_NUMBERS_REGEX.test(values.phoneNumber)) {
            errors.phoneNumber = REGISTRATION_CONSTATNTS.INVALID_PHONE_NUMBER;
        } else if (values.phoneNumber.length < 5 || values.phoneNumber.length > 15) {
            errors.phoneNumber = REGISTRATION_CONSTATNTS.PLEASE_ENTER_A_VALID_MOBILE_NUMBER;
        }
        if (!values.country) {
            errors.country = REGISTRATION_CONSTATNTS.IS_REQUIRED;
        }
        if (!values.phoneCode) {
            errors.phoneCode = REGISTRATION_CONSTATNTS.PHPONE_CODE_IS_REQUIRED;
        } if (userprofile?.isPhoneNumberverfiyWhileSignup && !phoneOTP) {
            errors.phoneOTP = REGISTRATION_CONSTATNTS.OTP_IS_REQUIRED;
        } if (userprofile?.isPhoneNumberverfiyWhileSignup && !isValid && phoneOTP) {
            errors.phoneOTP = REGISTRATION_CONSTATNTS.PLEASE_VERIFY_OTP;
        }
        return errors;
    };

    const handleGetOTP = async (phoneNumber: any, phoneCode: any) => {
        setErrormsg("")
        if ((!phoneNumber || !phoneCode)) {
            setErrormsg(REGISTRATION_CONSTATNTS.PHONE_NUMBER_IS_REQUIRED)
            return;
        } else if (phoneNumber.length < 5 || phoneNumber.length > 15) {
            setErrormsg(REGISTRATION_CONSTATNTS.PLEASE_ENTER_A_VALID_MOBILE_NUMBER)

        } else if (loaders?.actionBtnName === REGISTRATION_CONSTATNTS.GET_OTP) {
            const obj = {
                "phoneCode": phoneCode,
                "phoneNumber": phoneNumber,
                "isResendOTP": true
            }
            try {
                const response = await AuthService.getPhoneNumberOtp(obj);
                if (response?.ok) {
                    if (response?.data === true) {
                        setResendTimer(120);
                        setLoaders((prev: any) => ({ ...prev, isPhoneNoEditable: false, isOTPEditable: true, isPhoneNoEditVisible: true, isTimerShow: true, actionBtnName: REGISTRATION_CONSTATNTS.VERIFY, isOTPButtonDisable: true }));

                    }
                } else {
                    setErrormsg(isErrorDispaly(response))

                }

            } catch (error) {
                setErrormsg(isErrorDispaly(error))
            }
        } else if ((phoneOTP && phoneOTP.length >= 6) && loaders?.actionBtnName === REGISTRATION_CONSTATNTS.VERIFY) {
            setLoaders((prev: any) => ({
                ...prev,
                isPhoneNoEditable: false,
                isOTPEditable: true,
                isPhoneNoEditVisible: true,
                isTimerShow: false
            }));
            try {
                const Obj = {
                    "code": phoneOTP,
                    "phoneCode": phoneCode,
                    "phoneNumber": phoneNumber,
                    "isChangePhoneNumber": false
                }
                const response = await AuthService.verifyPhoneNumberOtp(Obj);
                if (response?.ok) {
                    if (response?.data === true) {
                        setIsValid(true);
                        setLoaders((prev: any) => ({ ...prev, isOTPEditable: false }));

                    } else {
                        setIsValid(null);
                        setLoaders((prev: any) => ({ ...prev, actionBtnName: REGISTRATION_CONSTATNTS.VERIFY }));

                    }
                } else {
                    setErrormsg(isErrorDispaly(response))
                    setLoaders((prev: any) => ({ ...prev, actionBtnName: REGISTRATION_CONSTATNTS.VERIFY, isOTPEditable: true }));

                }

            } catch (error) {
                setErrormsg(isErrorDispaly(error))
            }

            clearInterval(timerInterval.current);

        } else if (loaders?.actionBtnName === REGISTRATION_CONSTATNTS.RESEND_OTP) {
            setLoaders((prev: any) => ({
                ...prev,
                isPhoneNoEditable: false,
                isOTPEditable: true,
                isPhoneNoEditVisible: true,
                isTimerShow: true,
                actionBtnName: REGISTRATION_CONSTATNTS.VERIFY,
                isOTPButtonDisable: true
            }));
            setPhoneOTP("")
            setIsValid(null);
            setResendTimer(120);
            try {
                const obj = {
                    "phoneCode": phoneCode,
                    "phoneNumber": phoneNumber,
                    "isResendOTP": true
                }
                const response = await AuthService.getPhoneNumberOtp(obj);
                if (response.ok) {
                } else {
                    setErrormsg(isErrorDispaly(response));
                }


            } catch (error) {
            }
        }

    };

    const handleEditPhoneNumber = () => {
        setLoaders((prev: any) => ({ ...prev, isPhoneNoEditable: true, isOTPEditable: false, isPhoneNoEditVisible: false, isTimerShow: false, actionBtnName: REGISTRATION_CONSTATNTS.GET_OTP, isOTPButtonDisable: false }));
        setIsValid(null);
        setPhoneOTP("")
    };


    const formattedTimer = `${Math.floor(resendTimer / 60)}:${(resendTimer % 60)
        .toString()
        .padStart(2, '0')}`;

    const handleCloseError = () => {
        setErrormsg(null)
    };

    return (
        <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
            <ScrollView keyboardShouldPersistTaps="handled">
                <Container style={commonStyles.container}>
                    <View style={[commonStyles.mb24, commonStyles.mt8]}>
                        <View>
                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mxAuto]}>
                                <View >
                                    <SvgUri
                                        uri={"https://swokistoragespace.blob.core.windows.net/images/logox_orange.svg"}
                                        width={s(61)}
                                        height={s(55)}
                                    />
                                </View>
                                <ParagraphComponent text={REGISTRATION_CONSTATNTS.EXCHANGA_PAY} style={[commonStyles.fs32, commonStyles.fw800, commonStyles.textOrange, commonStyles.textCenter]} />
                            </View>
                        </View>
                    </View>
                    <View >
                        <ParagraphComponent style={[commonStyles.fs24, commonStyles.textBlack, commonStyles.fw600, commonStyles.textCenter]} text={REGISTRATION_CONSTATNTS.COMPLETE_YOUR_PROFILE} />
                    </View>
                    <View style={[commonStyles.mb32]} />
                    {errormsg && <ErrorComponent message={errormsg} onClose={handleCloseError} />}
                    <View >
                        <Formik
                            initialValues={regVals}
                            onSubmit={handleSubmit}
                            validate={validate}
                            validateOnChange={false}
                            validateOnBlur={false}
                            enableReinitialize
                        >
                            {({ touched, handleSubmit, handleBlur, values, errors, setFieldValue }) => (
                                <>
                                    <View style={[commonStyles.p16, commonStyles.bgBlack]}>
                                        {props.route?.params?.accountType !== REGISTRATION_CONSTATNTS.BUSINESS && (
                                            < >
                                                <Field
                                                    activeOpacity={0.9}
                                                    innerRef={fname}
                                                    name='firstName'
                                                    label={REGISTRATION_CONSTATNTS.FIRST_NAME}
                                                    touched={touched.firstName}
                                                    error={errors.firstName}
                                                    handleBlur={handleBlur}
                                                    customContainerStyle={{}}
                                                    placeholder={REGISTRATION_CONSTATNTS.ENTER_FIRST_NAME}
                                                    component={InputDefault}
                                                    Children={<LabelComponent text={REGISTRATION_CONSTATNTS.REQUIRED_STAR} style={commonStyles.textError} />}
                                                />
                                                <View style={[commonStyles.mb24]} />
                                                <Field
                                                    activeOpacity={0.9}
                                                    innerRef={lname}
                                                    name='lastName'
                                                    label={REGISTRATION_CONSTATNTS.LASt_NAME}
                                                    touched={touched.lastName}
                                                    error={errors.lastName}
                                                    handleBlur={handleBlur}
                                                    customContainerStyle={{}}
                                                    placeholder={REGISTRATION_CONSTATNTS.ENTER_LASt_NAME}
                                                    component={InputDefault}
                                                    Children={<LabelComponent text={REGISTRATION_CONSTATNTS.REQUIRED_STAR} style={commonStyles.textError} />}
                                                />
                                                <View style={[commonStyles.mb24]} />
                                            </>
                                        )}
                                        {values.type == REGISTRATION_CONSTATNTS.BUSINESS && (
                                            <>
                                                <Field
                                                    activeOpacity={0.9}
                                                    innerRef={bhname}
                                                    name='businessName'
                                                    label={REGISTRATION_CONSTATNTS.BUSINESS_NAME}
                                                    touched={touched.businessName}
                                                    error={errors.businessName}
                                                    handleBlur={handleBlur}
                                                    customContainerStyle={{}}
                                                    placeholder={REGISTRATION_CONSTATNTS.ENTER_BUSINESS_NAME}
                                                    component={InputDefault}
                                                    Children={<LabelComponent text={REGISTRATION_CONSTATNTS.REQUIRED_STAR} style={commonStyles.textError} />}
                                                />
                                                <View style={[commonStyles.mb24]} />
                                            </>
                                        )}
                                        <LabelComponent text={REGISTRATION_CONSTATNTS.PHONE_NUMBER} Children={<LabelComponent style={[commonStyles.textError]} text={REGISTRATION_CONSTATNTS.REQUIRED_STAR} />} />
                                        <View style={[commonStyles.flex1, commonStyles.relative, commonStyles.dflex, commonStyles.gap8]}>
                                            <PhoneCodePicker
                                                containerStyle={{ backgroundColor: !loaders.isPhoneNoEditable ? NEW_COLOR.DISABLED_INPUTBG : NEW_COLOR.SCREENBG_WHITE }}
                                                customBind={['name', '(', 'code', ')']}
                                                data={countryCodelist}
                                                value={values.phoneCode}
                                                placeholder="Select"
                                                onChange={(item) => setFieldValue('phoneCode', item.code)}
                                                disable={!loaders.isPhoneNoEditable}
                                            />
                                            <Field
                                                activeOpacity={0.9}
                                                innerRef={phno}
                                                name='phoneNumber'
                                                label={''}
                                                touched={touched.phoneNumber}
                                                handleBlur={handleBlur}
                                                customContainerStyle={{ flex: 1, }}
                                                placeholder={REGISTRATION_CONSTATNTS.ENTER_PHONE_NUMBER}
                                                component={InputDefault}
                                                keyboardType={REGISTRATION_CONSTATNTS.PHONE_PAD}
                                                editable={loaders.isPhoneNoEditable}
                                            />
                                            {loaders.isPhoneNoEditVisible && (
                                                <TouchableOpacity activeOpacity={0.7} style={styles.input}
                                                    onPress={handleEditPhoneNumber}>
                                                    <View >
                                                        <EditIcon height={s(20)} width={s(20)} />
                                                    </View>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                        {(errors.phoneCode || errors.phoneNumber) && <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textError, { marginTop: 4 }]} text={(errors.phoneNumber || errors.phoneCode)} />}
                                        <View style={[commonStyles.mb24]} />
                                        {userprofile?.isPhoneNumberverfiyWhileSignup && <View>
                                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { paddingRight: 4 }]}>
                                                <LabelComponent text={REGISTRATION_CONSTATNTS.PHONE_OTP} Children={<LabelComponent style={[commonStyles.textError]} text={REGISTRATION_CONSTATNTS.REQUIRED_STAR} />} />
                                                {loaders.isTimerShow && <LabelComponent
                                                    style={[commonStyles.fs14, commonStyles.fw400, NEW_COLOR.TEXT_ALWAYS_WHITE]}
                                                    text={formattedTimer === '0:00' ? '' : `${formattedTimer}s`}
                                                />}

                                            </View>
                                            <View style={[commonStyles.flex1, commonStyles.relative, commonStyles.dflex, commonStyles.gap8,]}>
                                                <View style={[commonStyles.relative, commonStyles.flex1]}>
                                                    <TextInput
                                                        onChangeText={onChangeText}
                                                        value={phoneOTP}
                                                        maxLength={6}
                                                        editable={loaders.isOTPEditable}
                                                        keyboardType="numeric"
                                                        placeholder="Enter code"
                                                        placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                                        style={[styles.input, commonStyles.flex1,
                                                        {
                                                            borderColor: NEW_COLOR.SEARCH_BORDER,
                                                            backgroundColor: NEW_COLOR.SCREENBG_WHITE,
                                                            borderRadius: 8,
                                                        }]}
                                                        color={NEW_COLOR.TEXT_ALWAYS_WHITE}
                                                    />
                                                    <View style={[styles.referralCheck, commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                                                        {!isValid &&
                                                            <TouchableOpacity activeOpacity={0.7}
                                                                onPress={() => handleGetOTP(values.phoneNumber, values.phoneCode)}
                                                                disabled={loaders.isOTPButtonDisable}>
                                                                <View >
                                                                    <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textOrange]} text={loaders?.actionBtnName} />
                                                                </View>
                                                            </TouchableOpacity>
                                                        }
                                                        {isValid === true &&
                                                            <View >
                                                                <AntDesign name={REGISTRATION_CONSTATNTS.CHECK_CIRCLE} size={20} color={NEW_COLOR.BG_GREEN} />
                                                            </View>
                                                        }
                                                        {isValid === false &&
                                                            <View >
                                                                <AntDesign name={REGISTRATION_CONSTATNTS.CLOSE_CIRCLEO} size={20} color={NEW_COLOR.TEXT_RED} />
                                                            </View>
                                                        }
                                                    </View>
                                                </View>

                                            </View>
                                            {(errors.phoneOTP) && <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textError, { marginTop: 4 }]} text={errors.phoneOTP} />}
                                            <View style={[commonStyles.mb24]} />
                                        </View>}
                                        <LabelComponent text={values.type == REGISTRATION_CONSTATNTS.PERSONAL ? REGISTRATION_CONSTATNTS.COUNTRY : REGISTRATION_CONSTATNTS.COUNTRY_OF_BUSINESS} Children={<LabelComponent style={[commonStyles.textError]} text={REGISTRATION_CONSTATNTS.REQUIRED_STAR} />} />
                                        <Field
                                            activeOpacity={0.9}
                                            innerRef={cname}
                                            style={{
                                                color: REGISTRATION_CONSTATNTS.TRANSAPARENT,
                                                backgroundColor: REGISTRATION_CONSTATNTS.TRANSAPARENT,
                                            }}
                                            touched={touched.country}
                                            name="country"
                                            error={errors.country}
                                            data={countries}
                                            placeholder={REGISTRATION_CONSTATNTS.SELECT_COUNTRY}
                                            placeholderTextColor={NEW_COLOR.PLACEHOLDER_STYLE}
                                            component={CustomPicker}
                                            modalTitle={REGISTRATION_CONSTATNTS.SELECT_COUNTRY}
                                        />
                                    </View>
                                    <View style={[commonStyles.mb24]} />
                                    <View >
                                        <DefaultButton
                                            title={REGISTRATION_CONSTATNTS.CONFIRM_AND_CONTINUE}
                                            customTitleStyle={{ color: NEW_COLOR.TEXT_ALWAYS_WHITE }}
                                            onPress={handleSubmit}
                                            style
                                            disable={saveLoading}
                                            loading={saveLoading}
                                        />
                                    </View>
                                    <View style={[commonStyles.mb20]} />
                                    <View >
                                    </View>
                                </>
                            )}
                        </Formik>
                    </View>
                    <View style={[commonStyles.mb43]} />
                </Container>
            </ScrollView>
        </SafeAreaView>
    );
};

export default RigisterCustomer;

const themedStyles = StyleService.create({
    ml12: {
        marginLeft: 12,
    },
    arrowposition: {
        position: "absolute", right: 8, top: 30,
    },
    ml8: {
        marginLeft: 8
    },
    mb6: {
        marginBottom: 6,
    },
    inputStyle: {
        borderColor: NEW_COLOR.INPUT_BORDER,
        borderWidth: 1,
        color: NEW_COLOR.TEXT_BLACK, borderRadius: 12,
        paddingLeft: 14, paddingRight: 14,
        minHeight: 54
    }, input: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'space-between',
        padding: 10, zIndex: 5, alignItems: "center",
        borderWidth: 1, borderColor: NEW_COLOR.SEARCH_BORDER,
        borderRadius: 8, minHeight: 46,

    }, referralCheck: {
        position: "absolute",
        right: 14, top: 10.5, zIndex: 10,
    },
});
