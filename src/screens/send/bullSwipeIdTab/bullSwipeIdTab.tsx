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
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { setBullSwipeIdAddress } from "../../../redux/actions/sendActions"; // 2. Import your action creator
import useEncryptDecrypt from "../../../hooks/encDecHook";
import { Keyboard } from "react-native";
import { useLngTranslation } from "../../../hooks/useLngTranslation";
const idValidationSchema = Yup.object().shape({
    bullswipeId: Yup.string()
        .required("")
              .test(
            'referral-required-if-present',
            'GLOBAL_CONSTANTS.INVALID_BULLSWIPE_ID',
            value => !value || value.length === 0 || value.length >= 10
        )
});

interface BullSwipeIdTabProps {
    tabKey?: string;
    onError?: (error: string) => void;
}

const BullSwipeIdTab = ({ tabKey, onError }: BullSwipeIdTabProps) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();
    const isFocused = useIsFocused();
    const formikRef = React.useRef<any>(null);
    const fromReceive = useSelector((state: any) => state?.sendReducer?.toFromReceive);
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const { decryptAES } = useEncryptDecrypt();
    const {t}=useLngTranslation();

    useEffect(() => {
        if (fromReceive && formikRef.current) {
            dispatch(setBullSwipeIdAddress(""))
            formikRef.current?.resetForm({ values: { bullswipeId: "" } });
        }
    }, [isFocused, fromReceive])

    const handleVerifyId = async (values: { bullswipeId: string }) => {
        onError?.("");
        if (userInfo?.depositReference && values.bullswipeId.toLowerCase() === decryptAES(userInfo.depositReference).toLowerCase()) {
            Keyboard.dismiss();
            onError?.(t("GLOBAL_CONSTANTS.YOU_CANNOT_SEND_YOURSELF"));
            return;
        }
        setLoading(true);
        try {
            const response: any = await SendServices.bullSwipeIdVerification(values?.bullswipeId);
            if (response.status === 200) {
                navigation.navigate("TransferAmount", { Details: response?.data, RecipientName: values?.bullswipeId, actionType: "BULLSWIPE_ID" });
            }
            else {
            onError?.(isErrorDispaly(response));
            }
        } catch (error) {
            onError?.(isErrorDispaly(error));
        } finally {
            Keyboard.dismiss();
            setLoading(false);
        }
    };

    return (
        <ViewComponent style={[commonStyles.pt32]}>
            <Formik
                key={tabKey || 'bullswipe'}
                initialValues={{ bullswipeId: "" }}
                validationSchema={idValidationSchema}
                onSubmit={handleVerifyId}
                innerRef={formikRef}
            >
                {({ handleSubmit, setFieldValue, values }) => (
                    <ViewComponent>
                        <FormikTextInput
                            name="bullswipeId"
                            label="GLOBAL_CONSTANTS.BULLSWIPE_ID"
                            isRequired
                            placeholder="GLOBAL_CONSTANTS.ENTER_BULLSWIPE_ID"
                            autoCapitalize="none"
                            keyboardType="phone-pad"
                            custInput={commonStyles.inputStyle}
                            maxLength={10}
                            onChangeText={(text) => {
                                setFieldValue("bullswipeId", text); // Update Formik's state
                                dispatch(setBullSwipeIdAddress(text));
                                onError?.(""); // Clear error when user types
                            }}
                            value={values.bullswipeId}
                            editable={!loading}
                        />
                        <ViewComponent style={[commonStyles.sectionGap]} />
                        <ButtonComponent
                            title="GLOBAL_CONSTANTS.CONTINUE"
                            onPress={handleSubmit}
                            loading={loading}
                            disable={loading || !values.bullswipeId || values.bullswipeId.length !== 10}
                        />
                    </ViewComponent>
                )}
            </Formik>
        </ViewComponent>
    );
};

export default BullSwipeIdTab;