import { useIsFocused, useNavigation } from "@react-navigation/native";
import { getThemedCommonStyles } from "../../../../assets/styles/CommonStyles";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import Container from "../../../../newComponents/container/container";
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import ViewComponent from "../../../../newComponents/view/view"
import { useHardwareBackHandler } from "../../../../hooks/HardwareBackHandler";
import { useCallback, useEffect, useState, useMemo } from "react";
import ErrorComponent from "../../../../newComponents/errorDisplay/errorDisplay";
import TextMultiLanguage from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import CustomSwitch from "../../../../newComponents/switch";
import { Formik } from "formik";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import FormikTextInput from "../../../../newComponents/textInputComponents/formik/textInput";
import ButtonComponent from "../../../../newComponents/buttons/button";
import { s } from "../../../../constants/theme/scale";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import ProfileService from "../../../../services/profile";
import { isErrorDispaly } from "../../../../utils/helpers";
import { showAppToast } from "../../../../newComponents/ToasterMessages/ShowMessage";
import { Keyboard } from "react-native";
import { useSelector } from "react-redux";
import useEncryptDecrypt from "../../../../hooks/encDecHook";
import { LowBalanceAlertRequest, LowBalanceAlertResponse, validationSchema } from "./constants";
import SwokipayDashboardLoader from "../../../../newComponents/swokipayloader";
import { useLngTranslation } from "../../../../hooks/useLngTranslation";
import KycVerifyPopup from "../../../commonScreens/kycVerify"; 
const LowbalanceAlert = () => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const navigation = useNavigation<any>();
    const [error, setError] = useState<string>("");
    const [preferredEnabled, setPreferredEnabled] = useState<boolean>(false);
    const [initialEnabled, setInitialEnabled] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [lowBalanceData, setLowBalanceData] = useState<LowBalanceAlertResponse | null>(null);
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const { decryptAES, encryptAES } = useEncryptDecrypt();
    const createdBy = decryptAES(userInfo?.userName);
    const [screenLoading, setScreenLoading] = useState<boolean>(false);
    const { t } = useLngTranslation();
    const isFocused = useIsFocused();
    const [kycModelVisible, setKycModelVisible] = useState<boolean>(false); 
    useEffect(() => {
        setError("");
        getLowbalanceAlertSettings();
    }, [isFocused]);

    const handleBackPress = () => {
        navigation.goBack();
    }

    useHardwareBackHandler(() => {
        handleBackPress();
    });
    const closekycModel = useCallback(() => { setKycModelVisible(false); }, []);
    const handleLowbalanceSwitch = (value: boolean) => {
        if (!userInfo.isKYC) {
            setKycModelVisible(true);
            return;
        }
        setPreferredEnabled(value);
    };

    const getLowbalanceAlertSettings = async () => {
        setScreenLoading(true);
        try {
            const response = await ProfileService.getLowbalanceAlert();
            if (response.status === 200) {
                setLowBalanceData(response?.data as LowBalanceAlertResponse);
                const isEnabled = (response?.data as LowBalanceAlertResponse)?.isEnable || false;
                setPreferredEnabled(isEnabled);
                setInitialEnabled(isEnabled);
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error: any) {
            setError(isErrorDispaly(error));
        }
        finally {
            setScreenLoading(false);
        }
    };

    const handleSubmit = async (values: { thresholdAmount: string }) => {
        const amount = preferredEnabled ? values.thresholdAmount : (lowBalanceData?.amount ? lowBalanceData.amount.toFixed(2) : "0.00");
        const hasToggleChanged = preferredEnabled !== initialEnabled;
        const isAmountUpdate = !hasToggleChanged && preferredEnabled && initialEnabled;
        await saveSettings({ thresholdAmount: amount }, preferredEnabled, isAmountUpdate);
    };

    const saveSettings = async (values: { thresholdAmount: string }, switchValue?: boolean, isAmountUpdate?: boolean) => {
        Keyboard.dismiss();
        setError("");
        setLoading(true);
        try {
            const isEnabled = switchValue !== undefined ? Boolean(switchValue) : Boolean(preferredEnabled);
            const body: LowBalanceAlertRequest = {
                IsEnable: isEnabled,
                Amount: parseFloat(values.thresholdAmount) || 0,
                CreatedBy: encryptAES(createdBy) || null,
                ModifiedBy: encryptAES(createdBy) || null
            };
            const response = await ProfileService.saveLowbalanceAlert(body);
            if (response?.status === 200) {
                getLowbalanceAlertSettings();
                let message;
                if (isAmountUpdate) {
                    message = "GLOBAL_CONSTANTS.LOW_BALANCE_ALERT_AMOUNT_UPDATED_SUCCESSFULLY";
                } else {
                    message = isEnabled
                        ? "GLOBAL_CONSTANTS.LOW_BALANCE_ALERT_ENABLED_SUCCESSFULLY"
                        : "GLOBAL_CONSTANTS.LOW_BALANCE_ALERT_DISABLED_SUCCESSFULLY";
                }
                showAppToast(t(message), "success");
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error: any) {
            setError(isErrorDispaly(error));
        } finally {
            setLoading(false);
        }
    };
    const handlechange = () => {
        setError("");
    }
    const currency = useMemo(() => (
        <ParagraphComponent
            text={lowBalanceData?.currency || userInfo?.currency}
            style={[commonStyles.textGrey, commonStyles.fs18, commonStyles.fw400]}
        />
    ), [lowBalanceData?.currency, userInfo?.currency]);
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container>
                <PageHeader title={"GLOBAL_CONSTANTS.LOW_BALANCE_ALERT"} onBackPress={handleBackPress} />
                {screenLoading && <SwokipayDashboardLoader />}
                {!screenLoading && <ViewComponent style={[commonStyles.flex1]}>
                    {error && <ErrorComponent message={error} screen={true} />}
                    <ViewComponent style={[commonStyles.sectionGap, commonStyles.rounded12, commonStyles.preferredPayment]}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.mb8, commonStyles.gap16]}>
                            <ViewComponent style={[commonStyles.flex1]}>
                                <ViewComponent style={[]}>
                                    <TextMultiLanguage style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} text={"GLOBAL_CONSTANTS.LOW_BALANCE_ALERT"} />
                                    <ViewComponent style={[commonStyles.mb8]} />
                                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.WE_WILL_EMAIL_YOU_IF_YOUR_BALANCE_DROPS_BELOW_THE_SET_THRESHOLD"} style={[commonStyles.textGrey, commonStyles.fs12, commonStyles.fw400]} />
                                </ViewComponent>
                            </ViewComponent>
                            <ViewComponent style={[]}>
                                <CustomSwitch value={preferredEnabled} onValueChange={handleLowbalanceSwitch} />
                            </ViewComponent>
                        </ViewComponent>
                    </ViewComponent>
 
                    <Formik
                        initialValues={{ thresholdAmount: lowBalanceData?.amount ? lowBalanceData.amount.toFixed(2) : "" }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize={false}
                        key={lowBalanceData?.amount ? lowBalanceData.amount.toFixed(2) : '0.00'}
                    >
                        {({ handleSubmit: formikSubmit, dirty, isValid, values }) => {
                            const hasToggleChanged = preferredEnabled !== initialEnabled;
                            const hasAmount = values.thresholdAmount && parseFloat(values.thresholdAmount) > 0;
                            return (
                                <ViewComponent style={[commonStyles.flex1]}>
                                    <KeyboardAwareScrollView
                                        contentContainerStyle={[{ flexGrow: 1 }]}
                                        keyboardShouldPersistTaps="handled"
                                        showsVerticalScrollIndicator={false}
                                        enableOnAndroid={true}
                                    >
                                        {preferredEnabled && (
                                            <FormikTextInput
                                                name="thresholdAmount"
                                                label={"GLOBAL_CONSTANTS.LOW_BALANCE_THRESHOLD"}
                                                placeholder={"0.00"}
                                                keyboardType="decimal-pad"
                                                maxLength={15}
                                                onChangeText={handlechange}
                                                editable={preferredEnabled}
                                                custInput={[commonStyles.fs18, commonStyles.fw400, { height: s(52) }]}
                                                rightIcon={currency}
                                                isNumber={true}
                                                isDecimal={true}
                                                maxIntegerLength={10}
                                            />
                                        )}
                                        <ViewComponent style={[commonStyles.flex1]} />
                                        <ButtonComponent
                                            title={"GLOBAL_CONSTANTS.SAVE"}
                                            onPress={formikSubmit}
                                            disable={(!dirty && !hasToggleChanged) || (preferredEnabled && (!isValid || !hasAmount)) || loading}
                                            loading={loading}
                                        />
                                    </KeyboardAwareScrollView>
                                </ViewComponent>
                            );
                        }}
                    </Formik>
 
                    <ViewComponent style={[commonStyles.sectionGap]} />
                </ViewComponent>}
                {kycModelVisible && <KycVerifyPopup closeModel={closekycModel} addModelVisible={kycModelVisible} />}
            </Container>

        </ViewComponent>
    )
}



export default LowbalanceAlert;