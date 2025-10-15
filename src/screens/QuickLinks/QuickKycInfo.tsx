import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View, ScrollView, SafeAreaView, BackHandler, Dimensions } from "react-native";
import { Container } from '../../components';
import DefaultButton from "../../components/DefaultButton";
import AntDesign from "react-native-vector-icons/AntDesign";
import { NEW_COLOR } from "../../constants/theme/variables";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import { s } from "../../constants/theme/scale";
import { commonStyles } from "../../components/CommonStyles";
import { formatDateTimeAPI, formateExpiryValidationDate, isErrorDispaly } from "../../utils/helpers";
import ErrorComponent from "../../components/Error";
import moment from "moment";
import CardsModuleService from "../../services/card";
import { useIsFocused } from "@react-navigation/native";
import Loadding from "../../components/skeleton";
import { ExchangeCardViewLoader } from "../cards/CardsSkeleton_views";
import QuickLinkStepComponent from "../../components/steps/QuicklinksSteps";
import { CREATE_KYC_ADDRESS_CONST, FormData, generateValidationSchema } from "../cards/constant";
import { Formik } from "formik";
import KycAddress from "../cards/kycAddress";
import useEncryptDecrypt from "../../hooks/useEncryption_Decryption";
const { width } = Dimensions.get('window');
const isPad = width > 600;
const QuickKYCInfo = (props: any) => {
    const ref = useRef<any>(null);
    const [feeCardsLoading, setFeeCardsLoading] = useState<boolean>(false);
    const [errormsg, setErrormsg] = useState<string>('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [userDetails, setUserDetails] = useState<any>({});
    const ExchangeCardSkeleton = ExchangeCardViewLoader();
    const isFocused = useIsFocused();
    const [kycReqList, setKycReqList] = useState([]);
    const { decryptAES, encryptAES } = useEncryptDecrypt();

    const stepContents = [
        <ParagraphComponent style={[commonStyles.fs12, commonStyles.textBlack, commonStyles.fw600]} text="Application information" />,
        <ParagraphComponent style={[commonStyles.fs12, commonStyles.textBlack, commonStyles.fw600]} text="KYC Information" />,
        <ParagraphComponent style={[commonStyles.fs12, commonStyles.textBlack, commonStyles.fw600,]} text="Status" />,
    ];
    const [initialValues, setIntialValues] = useState<FormData>({
        firstName: "",
        lastName: "",
        country: "",
        state: "",
        dob: "",
        gender: "",
        city: "",
        town: "",
        addressLine1: "",
        mobile: "",
        mobileCode: "",
        email: "",
        idType: "passport",
        idNumber: "",
        docExpiryDate: "",
        postalCode: "",
        faceImage: "",
        signature: "",
        profilePicBack: "",
        profilePicFront: "",
        handHoldingIDPhoto: "",
        biometric: "",
        emergencyContactName: "",
        kycRequirements: "",

    })

    const [formData, setFormData] = useState<FormData>({
        firstName: "",
        lastName: "",
        country: "",
        state: "",
        dob: "",
        gender: "",
        city: "",
        town: "",
        addressLine1: "",
        mobile: "",
        mobileCode: "",
        email: "",
        idType: "passport",
        idNumber: "",
        docExpiryDate: "",
        postalCode: "",
        faceImage: "",
        signature: "",
        profilePicBack: "",
        profilePicFront: "",
        handHoldingIDPhoto: "",
        biometric: "",
        emergencyContactName: "",
        kycRequirements: "",
    });

    useEffect(() => {
        getUserDetails();
    }, [isFocused]);
    const getUserDetails = async () => {
        try {
            setFeeCardsLoading(true);
            const response: any = await CardsModuleService?.getQuickLinkApplicationInfo(props?.route?.params?.cardId);
            if (response?.ok) {
                setUserDetails(response?.data);
                setErrormsg('');
                setFeeCardsLoading(false);
                const kycRequirements = response?.data?.kycRequirements;
                const mappedKycRequirements = kycRequirements ? kycRequirements.split(',')?.map((req: any) => req?.toLowerCase()) : [];
                setKycReqList(mappedKycRequirements);
                setFormData(prevData => ({
                    ...prevData,
                    ...response?.data,
                    firstName: decryptAES(response?.data?.firstName),
                    lastName: decryptAES(response?.data?.lastName),
                    idNumber: decryptAES(response?.data?.idNumber),
                    email: decryptAES(response?.data?.email),
                    mobile: decryptAES(response?.data?.mobile),
                    postalCode: decryptAES(response?.data?.postalCode),
                    mobileCode: decryptAES(response?.data?.mobileCode),
                    dob: response.data?.dob && new Date(response.data?.dob) || null,
                    docExpiryDate: decryptAES(response.data?.docExpiryDate) && (formateExpiryValidationDate(decryptAES(response.data?.docExpiryDate))) || null,
                    idType: response?.data?.idType === null && "passport" || response?.data?.idType,
                    emergencyContactName: decryptAES(response.data?.emergencyContactName) || null,

                }));
                setIntialValues(prevData => ({
                    ...prevData,
                    ...response?.data,
                    firstName: decryptAES(response?.data?.firstName),
                    lastName: decryptAES(response?.data?.lastName),
                    idNumber: decryptAES(response?.data?.idNumber),
                    email: decryptAES(response?.data?.email),
                    mobile: decryptAES(response?.data?.mobile),
                    postalCode: decryptAES(response?.data?.postalCode),
                    mobileCode: decryptAES(response?.data?.mobileCode),
                    dob: response.data?.dob && new Date(response.data?.dob) || null,
                    docExpiryDate: decryptAES(response.data?.docExpiryDate) && (formateExpiryValidationDate(decryptAES(response.data?.docExpiryDate))) || null,
                    emergencyContactName: decryptAES(response.data?.emergencyContactName) || null,

                    idType: response?.data?.idType === null && "passport" || response?.data?.idType,
                }))
            } else {
                setFeeCardsLoading(false);
                setErrormsg(isErrorDispaly(response));

            }
        } catch (error: any) {
            setErrormsg(isErrorDispaly(error));
            setFeeCardsLoading(false);
        }
    };


    const handleCustomerCardsWallet = async (values?: any) => {
        setBtnLoading(true);
        if (values?.docExpiryDate && (new Date(values?.docExpiryDate) < new Date())) {
            setBtnLoading(false);
            setErrormsg(CREATE_KYC_ADDRESS_CONST.EXPIRY_DATE_VALIDATION_VALIDATION);
            ref?.current?.scrollTo({ y: 0, animated: true });
            return;
        }
        const formattedValues = {
            ...values,
            dob: values?.dob !== null && moment(values?.dob).toISOString() || null,
            docExpiryDate: values?.docExpiryDate !== "" && moment(values?.docExpiryDate).toISOString() || null,
            faceImage: values?.faceImage !== "" && values?.faceImage || null,
            signature: values?.signature !== "" && values?.signature || null,
            profilePicBack: values?.profilePicFront !== "" && values?.profilePicFront || null,
            profilePicFront: values?.profilePicFront !== "" && values?.profilePicFront || null,
            handHoldingIDPhoto: values?.handHoldingIDPhoto !== "" && values?.handHoldingIDPhoto || null,
            biometric: values?.biometric !== "" && values?.biometric || null,

        };
        const formatedDob = formatDateTimeAPI(formattedValues?.dob);
        const formatedexpityDate = formatDateTimeAPI(formattedValues?.docExpiryDate)
        let Obj = {
            cardId: userDetails?.productId,
            firstName: encryptAES(formattedValues?.firstName),
            lastName: encryptAES(formattedValues?.lastName),
            dob: formatedDob || null,
            gender: formattedValues?.gender || null,
            docExpiryDate: encryptAES(formatedexpityDate) || null,
            handHoldingIDPhoto: formattedValues?.handHoldingIDPhoto,
            faceImage: formattedValues?.faceImage,
            profilePicFront: formattedValues?.profilePicFront || null,
            profilePicBack: formattedValues?.profilePicBack || null,
            backDocImage: formattedValues?.profilePicBack || null,
            signature: formattedValues?.signature || null,
            biometric: formattedValues?.biometric || null,
            addressLine1: formattedValues?.addressLine1,
            city: formattedValues?.city || null,
            country: formattedValues?.country || null,
            state: formattedValues?.state || null,
            town: formattedValues?.town || null,
            idNumber: encryptAES(formattedValues?.idNumber),
            idType: formattedValues?.idType,
            email: encryptAES(formattedValues?.email) || null,
            mobile: encryptAES(formattedValues?.mobile) || null,
            postalCode: encryptAES(formattedValues?.postalCode) || null,
            mobileCode: encryptAES(formattedValues?.mobileCode) || null,
            kycRequirements: userDetails.kycRequirements,
            emergencyContactName: encryptAES(formattedValues.emergencyContactName) || null,
        }
        let ApplyCardObj = {
            CardId: props?.route?.params?.cardId,
            kycUpdateModel: Obj
        }

        try {
            const res: any = await CardsModuleService.postKycInformation(ApplyCardObj);
            if (res?.ok) {
                props.navigation.push("ApplicatoionReview", {
                    cardId: res?.data
                })
                setBtnLoading(false)
            }
            else {
                setBtnLoading(false);
                setErrormsg(isErrorDispaly(res));
                ref?.current?.scrollTo({ y: 0, animated: true });
            }


        }
        catch (error) {
            setBtnLoading(false);
            setErrormsg(isErrorDispaly(error));
            ref?.current?.scrollTo({ y: 0, animated: true });
        }

    }

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleBack(); return true; }
        );
        return () => backHandler.remove();
    }, []);
    const handleBack = () => {
        props.navigation.goBack()

    };


    return (
        <>
            <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
                <ScrollView ref={ref}>
                    <Container style={commonStyles.container}>
                        {feeCardsLoading && (
                            <View style={[commonStyles.flex1]}>
                                <Loadding contenthtml={ExchangeCardSkeleton} />
                            </View>
                        )}
                        <View>
                            {!feeCardsLoading && (<><View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mb30, commonStyles.gap16]}>
                                <TouchableOpacity style={[]} onPress={() => handleBack()}>
                                    <View>
                                        <AntDesign name="arrowleft" size={s(22)} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
                                    </View>
                                </TouchableOpacity>
                                <ParagraphComponent text="Apply For Exchanga Pay Card" style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800]} />
                            </View>
                                {errormsg && (<>
                                    <ErrorComponent
                                        message={errormsg}
                                        onClose={() => setErrormsg("")}
                                    />
                                    <View style={commonStyles.mt8} />
                                </>
                                )}
                                <View style={commonStyles.mt8} />
                                {!feeCardsLoading && <QuickLinkStepComponent totalSteps={3} currentStep={2} stepContents={stepContents} />}
                                {isPad && <View style={[commonStyles.mb24]} />}

                                <Formik
                                    initialValues={formData}
                                    enableReinitialize
                                    validationSchema={generateValidationSchema(kycReqList)}
                                    onSubmit={handleCustomerCardsWallet}
                                    validateOnBlur={true}
                                    validateOnChange={false}


                                >
                                    {formikProps => {
                                        const { touched, errors, handleBlur, values, setFieldValue, handleChange, handleSubmit } = formikProps;

                                        return (
                                            <>
                                                <KycAddress
                                                    touched={touched}
                                                    errors={errors}
                                                    handleBlur={handleBlur}
                                                    values={values}
                                                    setFieldValue={setFieldValue}
                                                    handleChange={handleChange}
                                                    kycReqList={kycReqList}
                                                    formData={formData}
                                                    disableFields={initialValues}
                                                    cardId={props?.route?.params?.cardId}
                                                />

                                                <View style={[commonStyles.mb43]} />

                                                <DefaultButton
                                                    title='Save'
                                                    style={undefined}
                                                    disable={btnLoading}
                                                    loading={btnLoading}
                                                    onPress={() => {
                                                        ref?.current?.scrollTo({ y: 0, animated: true });
                                                        handleSubmit()
                                                    }}
                                                />
                                            </>
                                        );
                                    }}
                                </Formik>

                                <View style={[commonStyles.mb24,]} />
                            </>)}
                        </View>

                    </Container>
                </ScrollView>
            </SafeAreaView>
        </>
    );
};

export default QuickKYCInfo;

const styles = StyleSheet.create({
    sectionBg: {
        borderWidth: 1, borderColor: NEW_COLOR.DASHED_BORDER_STYLE,
        borderRadius: 24,
        padding: 16,
        backgroundColor: NEW_COLOR.BG_PURPLERDARK, borderStyle: "dashed"
    },
    opacity6: { opacity: 0.6, },
    mb8: { marginBottom: 8, },
    bgBlue: {
        padding: 16,
        backgroundColor: NEW_COLOR.BG_BLUE,
        borderRadius: 16,
    },
    mr8: { marginRight: 8 },
    mt48: { marginTop: 48 },
    ml10: {},
    passport: { width: '100%', borderRadius: 16, height: 250, borderWidth: 1, borderColor: NEW_COLOR.BORDER_LIGHT, overflow: "hidden" },

});
