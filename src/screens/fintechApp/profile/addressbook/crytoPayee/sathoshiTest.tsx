// ProofVerificationSheetContent.tsx
import React, { useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import { s } from '../../../../../constants/styels/scale';
import { Field, Formik } from 'formik';
import { formatDateTimeAPI, isErrorDispaly } from '../../../../../utils/helpers';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import InputDefault from "../../../../../components/textInputComponents/DefaultFiat";
import AddressbookService from '../../../../../apiServices/profile/general/addressbook';
import { setScreenInfo } from '../../../../../redux/actions/actions';
import { SEND_CONST } from './sendConstant';
import { transactionIdSchema } from './addContactSchema';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import ButtonComponent from '../../../../../components/buttons/button';
import ViewComponent from '../../../../../components/view/view';
import { showAppToast } from '../../../../../components/toasterMessages/ShowMessage';
import { useLngTranslation } from '../../../../../hooks/languagesHook/useLngTranslation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { FormattedDateText } from '../../../../../components/textComponets/dateTimeText/dateTimeText';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import CopyCard from '../../../../../components/copyIcon/CopyCard';
import { copyToClipboard } from '../../../../../components/copyToClipBoard/copy ToClopBoard';
import { useNavigation } from '@react-navigation/native';
import LabelComponent from '../../../../../components/textComponets/lableComponent/lable';

interface ProofVerificationSheetContentProps {
    sathosiTestDetails: any;
    payeeDeatils?: any;
    onClose?: () => void;
    navigation?: any;
    routeParams?: any;
    scrollRef?: any;
}

const ProofVerification = React.memo((props: ProofVerificationSheetContentProps) => {
    const { sathosiTestDetails, payeeDeatils, onClose, routeParams } = props;
    const styles = useStyleSheet(themedStyles);
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const userinfo = useSelector((state: any) => state.userReducer?.userDetails);
    const [currentProofStep, setCurrentProofStep] = useState(1);
    const [transactionId, setTransactionId] = useState("");
    const [errormsg, setErrormsg] = useState<string>("");
    const [submitedLoader, setSubmitLoader] = useState<boolean>(false);
    const navigation = useNavigation<any>();
    const scrollViewRef = useRef<KeyboardAwareScrollView>(null);
    const handleNextProofStep = useCallback(() => {
        setErrormsg("");
        if (currentProofStep < 3) {
            setCurrentProofStep(currentProofStep + 1);
        }
    }, [currentProofStep]);
    const handlePreviousProofStep = useCallback(() => {
        setErrormsg("");
        if (currentProofStep > 1) {
            setCurrentProofStep(currentProofStep - 1);
        }
    }, [currentProofStep]);
    const handleSaveSathoshiTest = async (values: { transactionId: string }) => {
        const { transactionId } = values;
        setSubmitLoader(true);
        const body = {
            "coin": payeeDeatils?.token,
            "amount": sathosiTestDetails?.amount,
            "customerId": userinfo?.id,
            "iframId": null,
            "network": sathosiTestDetails?.asset,
            "proofType": sathosiTestDetails?.proofType,
            "status": sathosiTestDetails?.status,
            "transactionDate": formatDateTimeAPI(sathosiTestDetails?.createdDate),
            "hash": transactionId,
            "walletAddress": sathosiTestDetails?.fromAddress,
            "createdBy": userinfo?.name
        }
        try {
            const response = await AddressbookService.saveSathoshiTest(body)
            if (response?.ok) {
                setSubmitLoader(false);
                if (routeParams === SEND_CONST.ADDRESS_BOOK || routeParams === "dynamicTabs") {
                    navigation?.navigate(SEND_CONST.ADDRESS_BOOK, { screenName: routeParams });
                } else if (routeParams === "Withdraw") {
                    navigation?.goBack();
                }
                else {
                    navigation?.navigate(SEND_CONST.ADDRESS_BOOK, { screenName: routeParams });
                }
            } else {
                setErrormsg(isErrorDispaly(response));
                scrollViewRef.current?.scrollToPosition(0, 0, true);
                setSubmitLoader(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            scrollViewRef.current?.scrollToPosition(0, 0, true);
            setSubmitLoader(false);
        }
    };

    const StepHeader = ({ stepNumber, title, isActive, isCompleted }: any) => (
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
            <ViewComponent style={[
                styles.stepIndicator,
                isActive ? { backgroundColor: NEW_COLOR.PRIMARY_BLUE } :
                    isCompleted ? { backgroundColor: NEW_COLOR.PRIMARY_BLUE } :
                        { backgroundColor: NEW_COLOR.GRAY_BACKGROUND }
            ]}>
                {isCompleted ? (
                    <AntDesign name="check" size={s(20)} color={NEW_COLOR.TEXT_GREEN} style={{
                        width: s(32),
                        height: s(32),
                        backgroundColor: NEW_COLOR.QUICK_LINKS,
                        borderRadius: s(100) / s(2),
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: s(6)
                    }} />
                ) : (
                    <ViewComponent style={{
                        width: s(32),
                        height: s(32),
                        borderRadius: s(100) / 2,
                        backgroundColor: isActive ? NEW_COLOR.TEXT_PRIMARY : NEW_COLOR.QUICK_LINKS,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw700, commonStyles.textWhite, { color: isActive ? NEW_COLOR.TEXT_ALWAYS_WHITE : NEW_COLOR.TEXT_WHITE, }]} text={stepNumber.toString()} />
                    </ViewComponent>
                )}
            </ViewComponent>
            <ParagraphComponent
                style={[
                    commonStyles.fs16,
                    commonStyles.fw400,
                    isActive ? commonStyles.textWhite : commonStyles.textlinkgrey,
                ]}
                text={title}
            />
        </ViewComponent>
    );
    const handleCloseError = () => {
        setErrormsg("");
    };

    const handleOrderIdCopyToClipboard = () => {
        copyToClipboard(sathosiTestDetails?.toAddress)
    }
    const handleWalletAddressClipboard = () => {
        copyToClipboard(sathosiTestDetails?.fromAddress)
    }
    return (
        <KeyboardAwareScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            ref={scrollViewRef}
        >
            <ViewComponent style={[]}>
                {errormsg !== '' && <ErrorComponent message={errormsg} onClose={handleCloseError} />}

                <ViewComponent style={[commonStyles?.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap10, commonStyles.flexWrap]}>
                    <ParagraphComponent
                        style={[commonStyles.listsecondarytext]}
                        text={t("GLOBAL_CONSTANTS.PROOF")}
                    />
                    <ParagraphComponent
                        style={[commonStyles.listprimarytext]}
                        text={sathosiTestDetails?.id || ''}
                    />
                </ViewComponent>
                <ViewComponent style={[commonStyles.listitemGap]} />
                <ViewComponent style={[commonStyles?.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap10, commonStyles.flexWrap]}>
                    <ParagraphComponent
                        style={[commonStyles.listsecondarytext]}
                        text={t("GLOBAL_CONSTANTS.PROOF_TYPE")}
                    />
                    <ParagraphComponent
                        style={[commonStyles.listprimarytext]}
                        text={sathosiTestDetails?.proofType || ''}
                    />
                </ViewComponent>
                <ViewComponent style={[commonStyles.listitemGap]} />
                <ViewComponent style={[commonStyles?.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap10, commonStyles.flexWrap]}>
                    <ParagraphComponent
                        style={[commonStyles.listsecondarytext]}
                        text={t("GLOBAL_CONSTANTS.WALLET_ADDRESS")}
                    />
                    {sathosiTestDetails?.fromAddress && (<CopyCard onPress={handleWalletAddressClipboard} />)}

                    <ParagraphComponent
                        style={[commonStyles.listprimarytext]}
                        text={sathosiTestDetails?.fromAddress || ''}
                    />

                </ViewComponent>
                <ViewComponent style={[commonStyles.listitemGap]} />
                <ViewComponent style={[commonStyles?.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap10, commonStyles.flexWrap]}>
                    <ParagraphComponent
                        style={[commonStyles.listsecondarytext]}
                        text={t("GLOBAL_CONSTANTS.NETWORK")}
                    />
                    <ParagraphComponent
                        style={[commonStyles.listprimarytext]}
                        text={sathosiTestDetails?.asset || ''}
                    />
                </ViewComponent>
                <ViewComponent style={[commonStyles.listitemGap]} />
                <ViewComponent style={[commonStyles?.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap10, commonStyles.flexWrap]}>
                    <ParagraphComponent
                        style={[commonStyles.listsecondarytext]}
                        text={t("GLOBAL_CONSTANTS.CREATED_DATE")}
                    />
                    <FormattedDateText value={sathosiTestDetails?.createdDate} style={[commonStyles.listprimarytext]} conversionType='UTC-to-local' />
                </ViewComponent>
                <ViewComponent style={[commonStyles.sectionGap]} />
                <ViewComponent style={[]}>
                    <ParagraphComponent style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} text={t("GLOBAL_CONSTANTS.PROOF_VERIFICATION")} />

                    {/* Step Headers */}
                    <ViewComponent style={[commonStyles.sectionGap, commonStyles.dflex, commonStyles.justifyAround, commonStyles.gap4]}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4]}>
                            <StepHeader
                                stepNumber={1}
                                title={"Step"}
                                isActive={currentProofStep === 1}
                                isCompleted={currentProofStep > 1}
                            />
                            <ViewComponent style={[commonStyles.hLine, { width: s(40) }]} />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                            <StepHeader
                                stepNumber={2}
                                title={"Step "}
                                isActive={currentProofStep === 2}
                                isCompleted={currentProofStep > 2}
                            />
                            <ViewComponent style={[commonStyles.hLine, { width: s(40) }]} />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                            <StepHeader
                                stepNumber={3}
                                title={"Step "}
                                isActive={currentProofStep === 3}
                                isCompleted={currentProofStep > 3}
                            />
                        </ViewComponent>
                    </ViewComponent>



                    {/* Step Content */}
                    {currentProofStep === 1 && (
                        <ViewComponent style={[styles.proofCard, commonStyles.sectionGap]}>
                            <ParagraphComponent style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} text={"Please Send "} />
                            <ViewComponent style={[commonStyles?.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={t("GLOBAL_CONSTANTS.AMOUNT")} />
                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={`${sathosiTestDetails?.amount || ''} ${sathosiTestDetails?.code || ''} ${sathosiTestDetails?.asset ? `(${sathosiTestDetails.asset})` : ''}`} />
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.listitemGap]} />
                            <ViewComponent style={[]}>
                                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={t("GLOBAL_CONSTANTS.FROM_ADDRESS")} />
                                <ParagraphComponent style={[commonStyles.listprimarytext, commonStyles.mt4]} text={sathosiTestDetails?.fromAddress || ''} />
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.listitemGap]} />
                            <ViewComponent style={[]}>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={t("GLOBAL_CONSTANTS.TO_THE_FOLLOWING_ADDRESS")} />
                                    <CopyCard onPress={handleOrderIdCopyToClipboard} />
                                </ViewComponent>
                                <ParagraphComponent style={[commonStyles.listprimarytext, commonStyles.mt4, commonStyles.flex1]} multiLanguageAllows text={sathosiTestDetails?.toAddress || ''} />
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.listitemGap]} />
                            <ViewComponent style={[]}>
                                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={t("GLOBAL_CONSTANTS.BEFORE_TIME_LINE")} />
                                <ParagraphComponent style={[commonStyles.listprimarytext, commonStyles.mt4]} text={t("GLOBAL_CONSTANTS.TO_PROVE_YOUR_CONTROL_OVER_THE_ADDRESS")} />
                            </ViewComponent>
                        </ViewComponent>

                    )}

                    {currentProofStep === 2 && (
                        <ViewComponent style={[styles.proofCard, commonStyles.sectionGap]}>
                            <ViewComponent >
                                <ParagraphComponent style={[commonStyles.listsecondarytext, commonStyles.mb6]} text={t("GLOBAL_CONSTANTS.PLEASE_INSPECT_THE_BLOCK_EXPLORER_PAGE_FOR_THIS_DEPOSIT_ADDRESS")} />
                                <ParagraphComponent style={[commonStyles.listprimarytext, commonStyles.mb6]} text={sathosiTestDetails?.fromAddress || ''} />
                            </ViewComponent>
                            <ParagraphComponent style={[commonStyles.listsecondarytext, commonStyles.mb6]} text={t("GLOBAL_CONSTANTS.PLEASE_INSPECT_THE_BLOCK_EXPLORER_PAGE_FOR_THIS_DEPOSIT_ADDRESS")} />

                            <ParagraphComponent style={[commonStyles.listprimarytext]} text={`${t("GLOBAL_CONSTANTS.LOOK_FOR_A_TRANSACTION_OF")} ${sathosiTestDetails?.amount || ''} ${sathosiTestDetails?.code || ''} ${sathosiTestDetails?.asset ? `(${sathosiTestDetails.asset})` : ''} ${t("GLOBAL_CONSTANTS.TO_CONFIRM_OWNERSHIP")}`} />
                        </ViewComponent>
                    )}

                    {currentProofStep === 3 && (
                        <ViewComponent style={[commonStyles.sectionGap]}>
                            <Formik
                                initialValues={{ "transactionId": transactionId }}
                                validationSchema={transactionIdSchema}
                                onSubmit={handleSaveSathoshiTest}
                                enableReinitialize={true}
                                validateOnChange={true}
                                validateOnBlur={true}
                            >
                                {(formikProps) => {
                                    const { values, touched, errors, handleChange, handleSubmit: submitTransactionIdForm } = formikProps;
                                    return (
                                        <ViewComponent style={[styles.proofCard, commonStyles.sectionGap]}>

                                            <ViewComponent style={{}}>
                                                <ViewComponent style={[]}>
                                                    <Field
                                                        label={"GLOBAL_CONSTANTS.TRANSACTION_ID_OR_HASH"}
                                                        name="transactionId"
                                                        touched={touched.transactionId}
                                                        error={errors.transactionId}
                                                        placeholder={t("GLOBAL_CONSTANTS.ENTER_TRANSATION_ID_HASH")}
                                                        placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                                        onChangeText={(text: string) => {
                                                            handleChange('transactionId')(text);
                                                            setTransactionId(text);
                                                        }}
                                                        value={values.transactionId}
                                                        autoCapitalize="none"
                                                        component={InputDefault}
                                                        requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                                                    />
                                                    <ViewComponent style={[commonStyles.formItemSpace]} />
                                                </ViewComponent>
                                            </ViewComponent>


                                            {/* Navigation Buttons for Step 3 */}
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap10]}>
                                                <ViewComponent style={[commonStyles.flex1]}>
                                                    <ButtonComponent
                                                        title={"GLOBAL_CONSTANTS.PREVIOUS"}
                                                        onPress={handlePreviousProofStep}
                                                        solidBackground={true}
                                                    />
                                                </ViewComponent>
                                                <ViewComponent style={[commonStyles.flex1]}>
                                                    <ButtonComponent
                                                        title={"GLOBAL_CONSTANTS.SUBMIT"}
                                                        loading={submitedLoader}
                                                        onPress={submitTransactionIdForm}
                                                    />
                                                </ViewComponent>
                                            </ViewComponent>
                                        </ViewComponent>
                                    );
                                }}
                            </Formik>
                        </ViewComponent>
                    )}

                    {/* Navigation Buttons for other steps */}
                    {currentProofStep !== 3 && (
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap10]}>
                            {currentProofStep === 2 && (
                                <ViewComponent style={[commonStyles.flex1]}>
                                    <ButtonComponent
                                        title={"GLOBAL_CONSTANTS.PREVIOUS"}
                                        onPress={handlePreviousProofStep}
                                        solidBackground={true}
                                    />
                                </ViewComponent>
                            )}
                            {currentProofStep < 3 && (
                                <ViewComponent style={[commonStyles.flex1]}>
                                    <ButtonComponent
                                        title={"GLOBAL_CONSTANTS.NEXT"}
                                        onPress={handleNextProofStep}
                                    />
                                    {currentProofStep == 1 && <ViewComponent />}
                                </ViewComponent>
                            )}
                        </ViewComponent>
                    )}

                </ViewComponent>


            </ViewComponent>
        </KeyboardAwareScrollView>
    );
});

export default ProofVerification;

const themedStyles = StyleService.create({
    stepIndicator: {
        width: s(24),
        height: s(24),
        borderRadius: s(12),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundcolor: "red"
    },
    proofCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: s(12),
        padding: s(12)
    },
});
