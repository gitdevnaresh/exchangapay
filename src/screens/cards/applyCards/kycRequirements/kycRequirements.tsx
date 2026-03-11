import React, { useEffect, useRef, useState } from 'react';
import Container from '../../../../newComponents/container/container';
import ViewComponent from '../../../../newComponents/view/view';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import ButtonComponent from '../../../../newComponents/buttons/button';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { s } from '../../../../constants/theme/scale';
import { useHardwareBackHandler } from '../../../../hooks/HardwareBackHandler';
import ImageBackgroundWrapper from '../../../../newComponents/imageComponents/ImageBackground';
import { VisaHorizontalImage } from '../../../../assets/vectorAssets';
import { Dimensions, Platform } from 'react-native';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';
import { cardsService } from '../../../../apiServices/cardsApis/cardsApiServices';
import { formatDateTimeDatePicker, isErrorDispaly, isUSDateFormat } from '../../../../utils/helpers';
import { Formik } from 'formik';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import { CREATE_KYC_ADDRESS_CONST, generateValidationSchema } from './constants';
import * as Yup from 'yup';
import { t } from 'i18next';
import moment from 'moment';
import { setApplyCardData } from '../../../../redux/actions/actions';
import { useDispatch, useSelector } from 'react-redux';
import SwokipayDashboardLoader from '../../../../newComponents/swokipayloader';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import KycAddress from './kycFields';
const CardKycRequirements = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const route = useRoute();
    const navigation = useNavigation<any>();
    const cardDetails = (route.params as any)?.cardDetails;
    const [applyBtnloading, setApplyBtnloading] = useState<boolean>(false);
    const screenWidth = Dimensions.get("window").width;
    const { decryptAES, encryptAES } = useEncryptDecrypt();
    const [kycReqList, setKycReqList] = useState<string[]>([
    ]
    );
    const [applyCardsLoading, setApplyCardsLoading] = useState<boolean>(false);
    const [errormsg, setErrormsg] = useState<string>("");
    const [initialValues, setInitialValues] = useState<any>({
        firstName: "",
        lastName: "",
        country: "",
        state: "",
        dob: "",
        gender: "",
        city: "",
        addressCountry: "",
        // town: "",
        addressLine1: "",
        mobile: "",
        mobileCode: "",
        email: "",
        idType: "",
        idNumber: "",
        docExpiryDate: "",
        postalCode: "",
        faceImage: "",
        signature: "",
        // profilePicBack: "",
        profilePicFront: "",
        handHoldingIDPhoto: "",
        biometric: "",
        emergencyContactName: "",
        kycRequirements: "",
        occupation: "",
        annualSalary: null,
        accountPurpose: null,
        expectedMonthlyVolume: null,
        docissueDate: null
    })
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const [keyRequirements, setKeyRequirements] = useState("");
    const dispatch = useDispatch();
    const scrollRef = useRef<any>(null);
    const [formData, setFormData] = useState<any>({
        firstName: "",
        lastName: "",
        country: "",
        state: "",
        dob: "",
        gender: "",
        city: "",
        // town: "",
        addressLine1: "",
        mobile: "",
        mobileCode: "",
        email: "",
        idType: "",
        idNumber: "",
        docExpiryDate: "",
        postalCode: "",
        faceImage: "",
        signature: "",
        // profilePicBack: "",
        profilePicFront: "",
        handHoldingIDPhoto: "",
        biometric: "",
        emergencyContactName: "",
        kycRequirements: "",
        occupation: "",
        annualSalary: "",
        accountPurpose: "",
        expectedMonthlyVolume: "",
        docissueDate: "",
        addressCountry: "",
    });

    useEffect(() => {
        getApplyCardDeatilsInfo();
    }, []);

    const getApplyCardDeatilsInfo = async () => {
        setApplyCardsLoading(true);
        try {
            const response: any = await cardsService.getKycRequirements(cardDetails?.id)
            if (response?.status === 200) {
                setErrormsg('');

                const kycResponse = response.data;
                const kycRequirements = kycResponse?.kycRequirements;
                const mappedKycRequirements = kycRequirements
                    ? kycRequirements?.split(',')?.map((req: any) => req.toLowerCase())
                    : [];
                setKycReqList(mappedKycRequirements);
                setKeyRequirements(kycRequirements)

                if (props?.route?.params?.kycFormData) {
                    setFormData(prevData => ({
                        ...prevData,
                        ...props?.route?.params?.kycFormData,
                        firstName: decryptAES(props?.route?.params?.kycFormData?.firstName),
                        lastName: decryptAES(props?.route?.params?.kycFormData?.lastName),
                        country: props?.route?.params?.kycFormData?.country || "",
                        occupation: props?.route?.params?.kycFormData?.occupation || "",
                        idNumber: decryptAES(props?.route?.params?.kycFormData?.idNumber),
                        email: decryptAES(props?.route?.params?.kycFormData?.email),
                        mobile: decryptAES(props?.route?.params?.kycFormData?.mobile),
                        postalCode: decryptAES(props?.route?.params?.kycFormData?.postalCode),
                        mobileCode: decryptAES(props?.route?.params?.kycFormData?.mobileCode),
                        docExpiryDate: decryptAES(props?.route?.params?.kycFormData?.docExpiryDate) && new Date(decryptAES(props?.route?.params?.kycFormData?.docExpiryDate)) || null,
                        emergencyContactName: decryptAES(props?.route?.params?.kycFormData?.emergencyContactName) || null,
                        docissueDate: decryptAES(props?.route?.params?.kycFormData?.docissueDate) && new Date(decryptAES(props?.route?.params?.kycFormData?.docissueDate)) || null,
                        expectedMonthlyVolume: props?.route?.params?.kycFormData?.expectedMonthlyVolume ? props?.route?.params?.kycFormData?.expectedMonthlyVolume?.toString() : "",
                        annualSalary: props?.route?.params?.kycFormData?.annualSalary ? props?.route?.params?.kycFormData?.annualSalary?.toString() : "",
                    }));
                    setInitialValues(prevData => ({
                        ...prevData,
                        ...props?.route?.params?.kycFormData,
                        firstName: decryptAES(props?.route?.params?.kycFormData?.firstName),
                        lastName: decryptAES(props?.route?.params?.kycFormData?.lastName),
                        country: props?.route?.params?.kycFormData?.country || "",
                        occupation: props?.route?.params?.kycFormData?.occupation || "",
                        idNumber: decryptAES(props?.route?.params?.kycFormData?.idNumber),
                        email: decryptAES(props?.route?.params?.kycFormData?.email),
                        mobile: decryptAES(props?.route?.params?.kycFormData?.mobile),
                        postalCode: decryptAES(props?.route?.params?.kycFormData?.postalCode),
                        mobileCode: decryptAES(props?.route?.params?.kycFormData?.mobileCode),
                        emergencyContactName: decryptAES(props?.route?.params?.kycFormData?.emergencyContactName) || null,
                        docissueDate: decryptAES(props?.route?.params?.kycFormData?.docissueDate) && new Date(decryptAES(props?.route?.params?.kycFormData?.docissueDate)) || null,
                        expectedMonthlyVolume: props?.route?.params?.kycFormData?.expectedMonthlyVolume ? props?.route?.params?.kycFormData?.expectedMonthlyVolume?.toString() : "",
                        annualSalary: props?.route?.params?.kycFormData?.annualSalary ? props?.route?.params?.kycFormData?.annualSalary?.toString() : "",

                    }))
                } else {
                    setFormData(prevData => ({
                        ...prevData,
                        ...kycResponse,
                        firstName: decryptAES(kycResponse?.firstName),
                        lastName: decryptAES(kycResponse?.lastName),
                        gender: kycResponse?.gender?.toLowerCase() || "",
                        country: kycResponse?.country || "",
                        addressCountry: kycResponse?.country || "",
                        state: kycResponse?.state || "",
                        city: kycResponse?.city || "",
                        addressLine1: kycResponse?.addressLine1 || "",
                        occupation: kycResponse?.occupation || "",
                        idNumber: decryptAES(kycResponse?.idNumber),
                        email: decryptAES(kycResponse?.email),
                        mobile: decryptAES(kycResponse?.mobile),
                        postalCode: decryptAES(kycResponse?.postalCode),
                        mobileCode: decryptAES(kycResponse?.mobileCode),
                        dob: isUSDateFormat(decryptAES(kycResponse?.dob)) && formatDateTimeDatePicker(decryptAES(kycResponse?.dob)) || decryptAES(kycResponse?.dob),
                        emergencyContactName: decryptAES(response.data?.emergencyContactName) || null,
                        docExpiryDate: decryptAES(response.data?.docExpiryDate) && decryptAES(response.data?.docExpiryDate) || null,
                        idType: kycResponse?.idType === null && "passport" || kycResponse?.idType,
                        docissueDate: decryptAES(kycResponse?.docissueDate) && new Date(decryptAES(response.data?.docissueDate)) || null,
                        expectedMonthlyVolume: kycResponse?.expectedMonthlyVolume ? kycResponse?.expectedMonthlyVolume?.toString() : "",
                        annualSalary: kycResponse?.annualSalary ? kycResponse?.annualSalary?.toString() : "",
                        // town: ""
                    }));
                    setInitialValues((prev: any) => ({
                        ...prev, ...kycResponse,
                        firstName: decryptAES(kycResponse?.firstName),
                        lastName: decryptAES(kycResponse?.lastName),
                        gender: kycResponse?.gender?.toLowerCase() || "",
                        country: kycResponse?.country || "",
                        addressCountry: kycResponse?.country || "",
                        state: kycResponse?.state || "",
                        city: kycResponse?.city || "",
                        addressLine1: kycResponse?.addressLine1 || "",
                        occupation: kycResponse?.occupation || "",
                        idNumber: decryptAES(kycResponse?.idNumber),
                        email: decryptAES(kycResponse?.email),
                        mobile: decryptAES(kycResponse?.mobile),
                        postalCode: decryptAES(kycResponse?.postalCode),
                        mobileCode: decryptAES(kycResponse?.mobileCode),
                        dob: response.data?.dob && new Date(response.data?.dob) || null,
                        emergencyContactName: decryptAES(response.data?.emergencyContactName) || null,
                        docExpiryDate: isUSDateFormat(decryptAES(response.data?.docExpiryDate)) && formatDateTimeDatePicker(decryptAES(response.data?.docExpiryDate)) || decryptAES(response.data?.docExpiryDate),
                        docissueDate: isUSDateFormat(decryptAES(kycResponse?.docissueDate)) && formatDateTimeDatePicker(decryptAES(kycResponse?.docissueDate)) || decryptAES(kycResponse?.docissueDate),

                        idType: kycResponse?.idType === null && "passport" || kycResponse?.idType,
                        expectedMonthlyVolume: response.data?.expectedMonthlyVolume ? response.data?.expectedMonthlyVolume?.toString() : "",
                        annualSalary: response.data?.annualSalary ? response.data?.annualSalary?.toString() : "",
                        // town: ""
                    }))
                }
                setApplyCardsLoading(false);
            } else {
                setErrormsg(isErrorDispaly(response));
                setApplyCardsLoading(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setApplyCardsLoading(false);
        }
    };



    const handleBackPress = () => {
        navigation.goBack();
    };
    useHardwareBackHandler(() => {
        handleBackPress()
    });
    const prepareKycData = (formValues: any) => ({
        KycUpdateModel: KycUpdateModel(formValues),

    });
    const KycUpdateModel = (formattedValues: any) => {
        return {
            customerId: userInfo?.id ?? "",
            cardId: props?.route?.params?.cardId ?? "",
            firstName: encryptAES(formattedValues?.firstName) ?? "",
            lastName: encryptAES(formattedValues?.lastName) ?? "",
            addressLine1: formattedValues?.addressLine1 ?? "",
            city: formattedValues?.city ?? "",
            state: formattedValues?.state ?? "",
            country: formattedValues?.country ?? "",
            addressCountry: formattedValues?.addressCountry ?? "",
            // town: formattedValues?.town ?? "",
            idType: formattedValues?.idType ?? "",
            idNumber: encryptAES(formattedValues?.idNumber) ?? "",
            docIssueDate: formattedValues?.idType?.toLowerCase()?.replace(/\s+/g, '').trim() == "hongkongid" ? null : (formattedValues?.docIssueDate ? encryptAES(formattedValues.docIssueDate.toString()) : null),
            profilePicFront: formattedValues?.profilePicFront ?? "",
            profilePicBack: formattedValues?.profilePicFront ?? "",
            signature: formattedValues?.signature ?? "",
            docExpiryDate: formattedValues?.idType?.toLowerCase()?.replace(/\s+/g, '').trim() == "hongkongid" ? null : (encryptAES(formattedValues?.docExpiryDate) || ""),
            dob: formattedValues?.dob ?? "",
            biometric: formattedValues?.biometric ?? "",
            backDocImage: formattedValues?.idType?.toLowerCase()?.replace(/\s+/g, '')?.trim() === "passport" ? formattedValues?.profilePicFront ?? "" : formattedValues?.profilePicFront ?? "",
            gender: formattedValues?.gender ?? "",
            email: encryptAES(formattedValues?.email) ?? "",
            mobileCode: encryptAES(formattedValues?.mobileCode) ?? "",
            mobile: encryptAES(formattedValues?.mobile) ?? "",
            faceImage: formattedValues?.faceImage ?? "",
            handHoldingIDPhoto: formattedValues?.handHoldingIDPhoto ?? "",
            emergencyContactName: encryptAES(formattedValues?.emergencyContactName) ?? "",
            postalCode: encryptAES(formattedValues?.postalCode) ?? "",
            cardHandHoldingIDPhoto: formattedValues?.cardHandHoldingIDPhoto ?? "",
            occupation: formattedValues?.occupation ?? "",
            ipAddress: formattedValues?.ipAddress ?? "",
            annualSalary: formattedValues?.annualSalary ?? 0,
            accountPurpose: formattedValues?.accountPurpose ?? "",
            expectedMonthlyVolume: formattedValues?.expectedMonthlyVolume ?? 0,
            requirement: keyRequirements || "",
            addressId: formattedValues?.addressId ?? null,
            addressLine2: formattedValues?.addressLine2 ?? "",
        };
    };
    const handleSaveKycData = async (values: any) => {
        setApplyBtnloading(true);
        if (kycReqList) {
            if (values?.dob && moment().diff(moment(values.dob), 'years') < 18) {
                setApplyBtnloading(false);
                setErrormsg(CREATE_KYC_ADDRESS_CONST.EXPIRY_DATE_VALIDATION_VALIDATION);
                scrollRef.current?.scrollToPosition(0, 0, true);
                return;
            }
            if (values?.docExpiryDate && values?.docissueDate && moment(values.docExpiryDate).isSameOrBefore(moment(values.docissueDate))) {
                setApplyBtnloading(false);
                setErrormsg(CREATE_KYC_ADDRESS_CONST.ISSUE_DATE_VALIDATION_VALIDATION);
                scrollRef.current?.scrollToPosition(0, 0, true);
                return;
            }
            const formattedValues = {
                ...values,
                dob: values?.dob ? moment(values.dob).format('YYYY-MM-DD') : null,
                docExpiryDate: values?.docExpiryDate ? moment(values.docExpiryDate).toISOString() : null,
                docIssueDate: values?.docissueDate ? moment(values.docissueDate).toISOString() : null,
                faceImage: values?.faceImage ?? null,
                signature: values?.signature ?? null,
                profilePicBack: values?.profilePicFront ?? null,
                profilePicFront: values?.profilePicFront ?? null,
                handHoldingIDPhoto: values?.handHoldingIDPhoto ?? null,
                biometric: values?.biometric ?? null,
                emergencyContactName: values?.emergencyContactName ?? "",
            };
            const applycardData = prepareKycData(formattedValues);

            try {
                dispatch(setApplyCardData(applycardData));
                navigation.navigate('FeeStep', {
                    cardId: cardDetails?.id,
                    kycUpdateModel: applycardData,
                    cardDetails: cardDetails,
                });

            } catch (error) {
                setApplyBtnloading(false);
                setErrormsg(isErrorDispaly(error));
                scrollRef.current?.scrollToPosition(0, 0, true);
            }
        }
        setApplyBtnloading(false);
    };


    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            <Container>
                <PageHeader
                    title={"GLOBAL_CONSTANTS.CARD_APPLICATION_ORDER"}
                    onBackPress={handleBackPress}
                    disable={applyBtnloading}
                />

                {applyCardsLoading && <SwokipayDashboardLoader />}

                {!applyCardsLoading && (
                    <>
                        {errormsg && <ErrorComponent message={errormsg} screen={true} />}

                        <Formik
                            initialValues={initialValues}
                            enableReinitialize
                            validationSchema={Yup.lazy((values) => generateValidationSchema(kycReqList, values))}
                            onSubmit={handleSaveKycData}
                            validateOnBlur={false}
                            validateOnChange={true}
                            validateOnMount={true}
                        >
                            {(formik) => {
                                const {
                                    touched,
                                    handleSubmit,
                                    errors,
                                    handleBlur,
                                    setFieldValue,
                                    values,
                                    validateForm,
                                    isValid,
                                    dirty
                                } = formik;

                                return (

                                    <KeyboardAwareScrollView
                                        ref={scrollRef}
                                        keyboardShouldPersistTaps="handled"
                                        // contentContainerStyle={{ paddingBottom: s(100) }}
                                        extraScrollHeight={Platform.OS === 'ios' ? 100 : 150}
                                        enableOnAndroid={true}
                                        showsVerticalScrollIndicator={false}
                                        enableResetScrollToCoords={false}

                                    >
                                        <ImageBackgroundWrapper
                                            source={{ uri: cardDetails?.logo }}
                                            style={[
                                                commonStyles.rounded12,
                                                { width: screenWidth * 0.80, height: s(186), alignSelf: 'center', overflow: 'hidden', borderRadius: s(12), }
                                            ]}
                                            resizeMode="cover"
                                            imageStyle={[commonStyles.rounded12, { width: '100%', height: '100%', borderRadius: s(16) }
                                            ]}
                                        >
                                            <ViewComponent style={[commonStyles.flex1, commonStyles.p16, { justifyContent: 'flex-end', alignItems: 'flex-end', }]}>
                                                <VisaHorizontalImage />
                                            </ViewComponent>
                                        </ImageBackgroundWrapper>
                                        <ViewComponent style={[commonStyles.sectionGap]} />
                                        {kycReqList?.length > 0 && (
                                            <KycAddress
                                                touched={touched}
                                                errors={errors}
                                                handleBlur={handleBlur}
                                                values={values}
                                                setFieldValue={setFieldValue}
                                                kycReqList={kycReqList}
                                                cardId={cardDetails?.id}
                                                formData={formData}
                                                setFormData={setFormData}
                                                applyBtnloading={applyBtnloading}
                                                setApplyBtnloading={setApplyBtnloading}
                                                setError={setErrormsg}
                                            />
                                        )}
                                        {/* <ViewComponent style={[commonStyles.sectionGap]} /> */}
                                        <ButtonComponent
                                            title={"GLOBAL_CONSTANTS.REVIEW_PAY"}
                                            loading={applyBtnloading}
                                            disable={!isValid || Object.keys(errors).length > 0 || applyBtnloading}
                                            onPress={async () => {
                                                const validationErrors = await validateForm();

                                                if (Object.keys(validationErrors).length > 0) {
                                                    formik.setTouched(
                                                        Object.keys(validationErrors).reduce((acc: any, key: string) => {
                                                            acc[key] = true;
                                                            return acc;
                                                        }, {})
                                                    );
                                                    scrollRef.current?.scrollToPosition(0, 0, true);
                                                    setErrormsg(t("GLOBAL_CONSTANTS.PLEASE_CHECK_BELLOW_ALL_FEILD"));
                                                    return;
                                                }
                                                handleSubmit();
                                            }}
                                        //         Object.keys(errors).reduce((acc: any, key: string) => {
                                        //             acc[key] = true;
                                        //             return acc;
                                        //         }, {})
                                        //     );
                                        //     scrollRef.current?.scrollToPosition(0, 0, true);
                                        //     setErrormsg(t("GLOBAL_CONSTANTS.PLEASE_CHECK_BELLOW_ALL_FEILD"));
                                        //     return;
                                        // }
                                        // handleSubmit();
                                        // }}
                                        />
                                    </KeyboardAwareScrollView>
                                );
                            }}
                        </Formik>
                    </>
                )}
            </Container>
        </ViewComponent>
    );
};

export default CardKycRequirements;
