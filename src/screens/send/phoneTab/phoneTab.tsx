import React, { useState, useEffect, useRef } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import ViewComponent from "../../../newComponents/view/view";
import PhoneInputWithPicker from "../../../newComponents/pickerComponents/formik/phonePickerInput";
import ButtonComponent from "../../../newComponents/buttons/button";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";
import OnboardingService from "../../../services/onboarding";
import { isErrorDispaly } from "../../../utils/helpers";
import SendServices from "../../../services/send";
import useEncryptDecrypt from "../../../hooks/encDecHook";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { setFromReceive, setSendPhoneAddress, setSendPhoneCodeAddress } from "../../../redux/actions/sendActions";
import { useDispatch, useSelector } from "react-redux";
import { Keyboard } from "react-native";
import { useLngTranslation } from "../../../hooks/useLngTranslation";
interface PhoneCode {
    name: string;
    code: string;
    logo: string | null;
    flag: string;
    mobileCode: string;
    recorder: number;
    length?: number;
}

interface PhoneFormValues {
    phoneCode: string;
    phoneNumber: string;
}

interface PhoneTabProps {
    tabKey?: string;
    onError?: (error: string) => void;
}

const PhoneTab = ({ tabKey, onError }: PhoneTabProps) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [loading, setLoading] = useState(false);
    const [phoneCodesLIst, setPhoneCodesLIst] = useState<PhoneCode[]>([]);
    const [phoneNumberMaxLength, setPhoneNumberMaxLength] = useState<number>();
    const { encryptAES, decryptAES } = useEncryptDecrypt();
    const isFocused = useIsFocused();
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();
    const formikRef = React.useRef<any>(null);
    const fromReceive = useSelector((state: any) => state?.sendReducer?.toFromReceive);
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const { t } = useLngTranslation();

    useEffect(() => {
        if (fromReceive && formikRef?.current) {
            dispatch(setSendPhoneAddress(""))
            dispatch(setSendPhoneCodeAddress(""));
            formikRef.current?.resetForm({ values: { phoneCode: "", phoneNumber: "" } });
            dispatch(setFromReceive(false));
        }
    }, [isFocused, fromReceive])

    const phoneValidationSchema = (phoneLength: any) => {
        return Yup.object().shape({
            phoneCode: Yup.string().required(""),
            phoneNumber: Yup.string()
                .required("")
                .length(phoneLength, "GLOBAL_CONSTANTS.INVALID_PHONE_NUMBER_LENGTH")
        });
    };
    useEffect(() => {

    }, [isFocused])

    useEffect(() => {
        const fetchPhoneCodes = async () => {
            try {
                const response: any = await OnboardingService.countriesList();
                if (response.status === 200) {
                    setPhoneCodesLIst(response?.data ?? []);
                } else {
                    onError?.(isErrorDispaly(response));
                }
            } catch (error: any) {
                onError?.(isErrorDispaly(error));
            }
        };
        fetchPhoneCodes();
    }, []);

    const handleVerifyPhone = async (values: PhoneFormValues) => {
        onError?.("");
        if (userInfo?.phoneNo && userInfo?.phonecode) {
            const userPhone = decryptAES(userInfo.phoneNo);
            const userPhoneCode = decryptAES(userInfo.phonecode);
            if (values.phoneNumber === userPhone && values.phoneCode === userPhoneCode) {
                Keyboard.dismiss();
                onError?.(t("GLOBAL_CONSTANTS.YOU_CANNOT_SEND_YOURSELF"));
                return;
            }
        }
        setLoading(true);
        const payload = {
            Phonecode: encryptAES(values?.phoneCode),
            PhoneNumber: encryptAES(values?.phoneNumber)
        };
        try {
            const response: any = await SendServices.phoneVerification(payload);
            if (response.status === 200) {
                navigation.navigate("TransferAmount", { Details: response?.data, RecipientName: `${values?.phoneCode} ${values?.phoneNumber}`, actionType: "PHONE" });
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
        <ViewComponent style={[commonStyles.pt16]}>
            <Formik
                key={tabKey || 'phone'}
                initialValues={{ phoneCode: "", phoneNumber: "" }}
                validationSchema={phoneValidationSchema(phoneNumberMaxLength)}
                onSubmit={handleVerifyPhone}
                innerRef={formikRef}
            >
                {(formik) => {
                    const { handleSubmit, values, setFieldValue } = formik;
                    const prevPhoneCodeRef = useRef<string>();

                    useEffect(() => {
                        const prevCode = prevPhoneCodeRef.current;
                        const selectedCode: any = phoneCodesLIst.find(
                            (item: any) => item?.mobileCode === values?.phoneCode
                        );
                        if (selectedCode?.length) {
                            setPhoneNumberMaxLength(selectedCode.length);
                        }
                        if (prevCode && prevCode !== values?.phoneCode) {
                            setFieldValue('phoneNumber', '');
                        }
                        if (values.phoneCode || values.phoneNumber) {
                            dispatch(setSendPhoneCodeAddress(values?.phoneCode));
                            dispatch(setSendPhoneAddress(values?.phoneNumber));
                            onError?.(""); // Clear error when user types
                        } else {
                            dispatch(setSendPhoneAddress(""));
                            dispatch(setSendPhoneCodeAddress(""));
                        }
                        prevPhoneCodeRef.current = values?.phoneCode;
                    }, [values.phoneCode, setFieldValue, values.phoneNumber, dispatch]);


                    return (
                        <ViewComponent>
                            <PhoneInputWithPicker
                                phoneFieldName="phoneNumber"
                                label="GLOBAL_CONSTANTS.PHONE_NUMBER"
                                codeFieldName="phoneCode"
                                placeholder="GLOBAL_CONSTANTS.ENTER_PHONE_NUMBER"
                                modalTitle="GLOBAL_CONSTANTS.SELECT_COUNTRY_CODE"
                                searchPlaceholder="Search Country Code"
                                customBind={["name", " (", "mobileCode", ")"]}
                                data={phoneCodesLIst || []}
                                showCountryImages={true}
                                disabled={!values.phoneCode || loading}
                                maxLength={phoneNumberMaxLength}
                                isCodeDisable={loading}
                            />
                            <ViewComponent style={[commonStyles.sectionGap]} />
                            <ButtonComponent
                                title="GLOBAL_CONSTANTS.CONTINUE"
                                onPress={handleSubmit}
                                loading={loading}
                                disable={
                                    loading ||
                                    !formik.values.phoneNumber ||
                                    !formik.values.phoneCode ||
                                    !!formik.errors.phoneNumber ||
                                    !!formik.errors.phoneCode
                                }
                            />
                        </ViewComponent>
                    );
                }}
            </Formik>
        </ViewComponent>
    );
};
export default PhoneTab;