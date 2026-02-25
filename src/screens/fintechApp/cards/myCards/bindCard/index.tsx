import React, { useEffect, useRef, useState } from "react";
import { Formik } from "formik";
import {KeyboardAvoidingView, Platform } from "react-native";
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import ViewComponent from "../../../../../components/view/view";
import ButtonComponent from "../../../../../components/buttons/button";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import PageHeader from "../../../../../components/pageHeader/pageHeader";
import Container from "../../../../../components/container/container";
import CardsModuleService from "../../../../../apiServices/cards";
import useEncryptDecrypt from "../../../../../hooks/encDecHook";
import ErrorComponent from "../../../../../components/errorDisplay/errorDisplay";
import { isErrorDispaly } from "../../../../../utils/helpers";
import { useHardwareBackHandler } from "../../../../../hooks/backHandleHook";
import BindCardSuccess from "./BindCardSuccess";
import CustomRBSheet from "../../../../../components/models/commonBottomSheet";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import TextMultiLanguage from "../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import SafeAreaViewComponent from "../../../../../components/safeArea/safeArea";
import ScrollViewComponent from "../../../../../components/scrollView/scrollView";
import { BindCardProps, cardDynamicFeildRenderLoader, createDynamicValidationSchema, getPlaceholder } from "../../dashoard/constants";
import Loadding from "../../../../../components/skelton/skeltons";
import CardDynamicFieldRenderer from "../../common/cardDynamicFieldRenderer";

const BindCard: React.FC<BindCardProps> = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [isBtnLoading, setIsBtnLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<any>("");
    const { encryptAES } = useEncryptDecrypt();
    const succussRbRef = useRef<any>();
    const [bindCardInfo, setBindCardInfo] = useState<any>({})
    const isFocused = useIsFocused();
    const navigation = useNavigation<any>(null);
    const [bindcardValues, setBindcardValues] = useState<any>([]);
    const [activeCardLoader, setActiveCardLoader] = useState(false);

    useEffect(() => {
        getBindCardDetails();
        getActiveCardsDynamicFeilds()
    }, [isFocused])
    const getBindCardDetails = async () => {
        try {
            const res: any = await CardsModuleService.getBindCardData();
            if (res.ok) {
                setBindCardInfo(res?.data[0]);
            } else {
                setErrorMsg(isErrorDispaly(res));
            }
        } catch (error) {
            setErrorMsg(isErrorDispaly(error));
        }
    }
    const getActiveCardsDynamicFeilds = async () => {
        setActiveCardLoader(true);
        try {
            const res: any = await CardsModuleService.getActiveCardDynamicFeilds(props?.route?.params?.programId);
            if (res.ok) {
                setBindcardValues(Array.isArray(res?.data) ? res?.data : []);
                setActiveCardLoader(false);

            } else {
                setErrorMsg(isErrorDispaly(res));
                setActiveCardLoader(false);

            }
        } catch (error) {
            setErrorMsg(isErrorDispaly(error));
            setActiveCardLoader(false);

        }
    }

    const handleSave = (values: any) => {
        setIsBtnLoading(true);
        const obj: any = {
            cardId: props?.route?.params?.cardId,
        };
        bindcardValues.forEach((field: any) => {

            if (field?.field?.toLowerCase() === "cardLastfourdigits" || field?.field?.toLowerCase() === "expirydate" || field.field?.toLowerCase() == "envelopenumber" || field.field?.toLowerCase() == "linkcardnumber") {
                obj[field.field.charAt(0).toLowerCase() + field.field.slice(1)] = encryptAES(values[field.field]) || "";
            } else {
                obj[field.field] = values[field.field] || null;
            }
        });

        CardsModuleService.postQuickLinks(obj).then((response) => {
            if (response.ok) {
                setIsBtnLoading(false);
                // if (!bindCardInfo?.kycRequiredWhileApplyCard) {
                //     props.navigation.navigate("KycForm", {
                //         cardId: bindCardInfo?.cardId,
                //         screenName: "BindCard",
                //     })
                // }
                // else {
                succussRbRef?.current?.open();
                // }
            } else {
                setErrorMsg(isErrorDispaly(response))
                setIsBtnLoading(false);
            }
        }).catch((error) => {
            setErrorMsg(isErrorDispaly(error))
            setIsBtnLoading(false);
        });
    };

    useHardwareBackHandler(() => {
        handleBack();
    })

    const handleCloseError = () => {
        setErrorMsg("");

    };
    const handleBack = () => {
        props?.navigation.goBack();
    };
    const onBindSuccessDone = () => {
        succussRbRef.current?.close();
        navigation.reset({
            index: 0,
            routes: [{
                name: 'Dashboard',
                params: { initialTab: "GLOBAL_CONSTANTS.CARDS" },
                animation: 'slide_from_left'
            }],
        });
    }

    const createInitialValues = (fields: any[]) => {
        const values: any = {};
        fields.forEach(f => {
            values[f.field] = "";
        });
        return values;
    };

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}  >
            <SafeAreaViewComponent style={[]}>
                <Container style={[commonStyles.container]}>
                    <PageHeader
                        title={"GLOBAL_CONSTANTS.BIND_CARD"}
                        onBackPress={handleBack}
                    />
                    {errorMsg && <ErrorComponent message={errorMsg} onClose={handleCloseError} />}
                    <ScrollViewComponent  >
                        <Formik
                            initialValues={createInitialValues(bindcardValues)}
                            onSubmit={handleSave}
                            validationSchema={createDynamicValidationSchema(bindcardValues)}
                            validateOnBlur={true}
                            validateOnChange={true}
                            enableReinitialize
                        >
                            {(formik) => {
                                const { touched, handleSubmit, errors, setFieldValue, handleChange, handleBlur, values } = formik;
                                return (
                                    <KeyboardAvoidingView
                                        style={commonStyles.flex1}
                                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                                        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
                                    >
                                        <ViewComponent >

                                            <ViewComponent>
                                                <TextMultiLanguage style={[commonStyles.sectionSubTitleText]} text={"GLOBAL_CONSTANTS.WHAT_IS_QUICK_CARD_LINKING_SERVICE"} />
                                                <TextMultiLanguage style={[commonStyles.textsecondarypara]} text={"GLOBAL_CONSTANTS.WHAT_IS_QUICK_CARD_LINKING_SERVICE_DESCRIPTION"} />
                                            </ViewComponent>
                                            <ViewComponent style={[commonStyles.formItemSpace]} />
                                            {activeCardLoader &&
                                                <Loadding contenthtml={cardDynamicFeildRenderLoader(bindcardValues.length)} />
                                            }

                                            <CardDynamicFieldRenderer
                                                fields={bindcardValues}
                                                values={values}
                                                errors={errors}
                                                touched={touched}
                                                setFieldValue={setFieldValue}
                                                handleChange={handleChange}
                                                handleBlur={handleBlur}
                                                getPlaceholder={getPlaceholder}
                                            />


                                            <ViewComponent>
                                                <ViewComponent style={[commonStyles.formItemSpace]} />
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]} >
                                                    <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.LINKING_CARD_NAME"} />
                                                    <TextMultiLanguage style={[commonStyles.listprimarytext]} text={bindCardInfo?.name || ""} />
                                                </ViewComponent>
                                            </ViewComponent>
                                            <ViewComponent style={[commonStyles.formItemSpace]} />

                                            <ViewComponent style={[]}>
                                                <ViewComponent
                                                    style={[
                                                        commonStyles.dflex,
                                                        commonStyles.alignCenter,
                                                        commonStyles.justifyContent,

                                                    ]}
                                                >
                                                    <TextMultiLanguage
                                                        style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]}
                                                        text={"GLOBAL_CONSTANTS.INSTRUCTIONS"}
                                                    />
                                                </ViewComponent>
                                                <TextMultiLanguage
                                                    style={[
                                                        commonStyles.sectionSubTitleText,
                                                        commonStyles.mb6
                                                    ]}
                                                    text={"GLOBAL_CONSTANTS.QUICK_CARD_LINKING"}
                                                />


                                                <TextMultiLanguage
                                                    style={[
                                                        commonStyles.textsecondarypara,
                                                        commonStyles.mb6
                                                    ]}
                                                    text={"GLOBAL_CONSTANTS.INSTRRUVTION_POINT_1"}
                                                />
                                                <TextMultiLanguage
                                                    style={[
                                                        commonStyles.textsecondarypara
                                                    ]}
                                                    text={"GLOBAL_CONSTANTS.INSTRRUVTION_POINT_2"}
                                                />
                                            </ViewComponent>
                                            {/* <ViewComponent style={[commonStyles.mb43]} /> */}
                                            <ViewComponent style={[commonStyles.sectionGap]} />
                                            {/* !bindCardInfo?.kycRequiredWhileApplyCard &&"GLOBAL_CONSTANTS.CONTINUE" */}

                                            <ButtonComponent
                                                title={"GLOBAL_CONSTANTS.SUBMIT"}
                                                loading={isBtnLoading}
                                                onPress={handleSubmit}
                                            />

                                        </ViewComponent>
                                    </KeyboardAvoidingView>
                                );
                            }}
                        </Formik>
                        <CustomRBSheet
                            refRBSheet={succussRbRef}
                            height={'Medium'}
                            draggable={false} closeOnPressMask={false}
                        >
                            <BindCardSuccess onDone={onBindSuccessDone} ref={succussRbRef} />

                        </CustomRBSheet>
                    </ScrollViewComponent>

                </Container>
            </SafeAreaViewComponent>

        </ViewComponent>
    );
};

export default BindCard;