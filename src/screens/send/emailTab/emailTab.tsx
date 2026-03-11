import React, { useEffect, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import ViewComponent from "../../../newComponents/view/view";
import FormikTextInput from "../../../newComponents/textInputComponents/formik/textInput";
import ButtonComponent from "../../../newComponents/buttons/button";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";
import SendServices from "../../../services/send";
import { isErrorDispaly } from "../../../utils/helpers";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import useEncryptDecrypt from "../../../hooks/encDecHook";
import { setFromReceive, setSendEmailAddress } from "../../../redux/actions/sendActions"; // 2. Import your action creator
import { useDispatch, useSelector } from "react-redux";
import { Keyboard } from "react-native";
import { useLngTranslation } from "../../../hooks/useLngTranslation";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const emailValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('GLOBAL_CONSTANTS.INVALID_EMAIL_ADDRESS')
    .matches(emailRegex, 'GLOBAL_CONSTANTS.INVALID_EMAIL_ADDRESS')
    .required("")
});
interface EmailTabProps {
    tabKey?: string;
    onError?: (error: string) => void;
}
const EmailTab = ({ tabKey, onError }: EmailTabProps) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [loading, setLoading] = useState(false);
    const { encryptAES,decryptAES } = useEncryptDecrypt();
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();
    const {t}=useLngTranslation();
    const isFocused = useIsFocused();
    const formikRef = React.useRef<any>(null);
    const fromReceive = useSelector((state: any) => state?.sendReducer?.toFromReceive);
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);

    useEffect(() => {
        if (fromReceive && formikRef.current) {
            formikRef.current?.resetForm({ values: { email: "" } });
            dispatch(setFromReceive(false));
            dispatch(setSendEmailAddress(""));
        }
    }, [isFocused, fromReceive])

    const handleVerifyEmail = async (values: { email: string }) => {
        onError?.("");
        // Check if user is trying to send to their own email
        if (userInfo?.email && values.email.toLowerCase() === decryptAES(userInfo.email).toLowerCase()) {
            Keyboard.dismiss();
            onError?.(t("GLOBAL_CONSTANTS.YOU_CANNOT_SEND_YOURSELF"));
            return;
        }
        const obj:any={
            email:encryptAES(values?.email)
        }
        
        setLoading(true);
        try {
            const response: any = await SendServices.saveEmailVerification(obj);
            if (response.status === 200) {
                navigation.navigate("TransferAmount", { Details: response?.data, RecipientName: values?.email, actionType: "EMAIL" });
            }
            else {
                onError?.(isErrorDispaly(response));
            }

        } catch (error) {
            onError?.(isErrorDispaly(error));
        } finally {
            setLoading(false);
            Keyboard.dismiss();
        }
    };

    return (
        <ViewComponent style={[commonStyles.mt32]}>
            <Formik
                key={tabKey || 'email'}
                initialValues={{ email: "" }}
                validationSchema={emailValidationSchema}
                onSubmit={handleVerifyEmail}
                innerRef={formikRef} // <-- add this
            >
                {({ handleSubmit, setFieldValue, values }) => {
                    return (

                        <ViewComponent>
                            <FormikTextInput
                                name="email"
                                label="GLOBAL_CONSTANTS.EMAIL_ADDRESS_LABEL"
                                isRequired
                                placeholder="GLOBAL_CONSTANTS.ENTER_EMAIL_ADDRESS"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                custInput={commonStyles.inputStyle}
                                onChangeText={(text) => {
                                    onError?.("");
                                    setFieldValue("email", text); // Update Formik's state
                                    dispatch(setSendEmailAddress(text)); // Dispatch to Redux
                                }}
                                value={values.email}
                                editable={!loading}
                            />
                            <ViewComponent style={[commonStyles.sectionGap]} />
                            <ButtonComponent
                                title="GLOBAL_CONSTANTS.CONTINUE"
                                onPress={handleSubmit}
                                loading={loading}
                                disable={loading || !values.email || !emailRegex.test(values?.email)}
                            />
                        </ViewComponent>
                    )
                }}
            </Formik>
        </ViewComponent>
    );
};
export default EmailTab;