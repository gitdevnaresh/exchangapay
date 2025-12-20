import React, { useEffect, useRef, useState } from "react";
import { ScrollView, View, Switch, TouchableOpacity } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import Container from "../../components/Container";
import InputDefault from "../../components/DefaultFiat";
import DefaultButton from "../../components/DefaultButton";
import ErrorComponent from "../../components/Error";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import LabelComponent from "../../components/Paragraph/label";
import { commonStyles } from "../../components/CommonStyles";
import { s } from "../../constants/theme/scale";
import AntDesign from "react-native-vector-icons/AntDesign";
import CardsModuleService from "../../services/card";
import { isErrorDispaly, trimValues } from "../../utils/helpers";
import { personalInfoLoader } from "./skeleton_views";
import Loadding from "../../components/skeleton";
import { SafeAreaView } from "react-native-safe-area-context";

type RootStackParamList = {
    AddEditAddress: { id?: string };
};

interface AddressFormValues {
    addressLine1: string;
    addressLine2: string;
    state: string;
    city: string;
    pincode: string;
    isDefault: boolean;
}

const validationSchema = Yup.object().shape({
    addressLine1: Yup.string()
        .required("Address Line 1 is required")
        .matches(/^[A-Za-z0-9 ]+$/, "Only alphabets and numbers are allowed"),
    addressLine2: Yup.string().matches(/^[A-Za-z0-9 ]*$/, "Only alphabets and numbers are allowed"),
    state: Yup.string()
        .required("State is required")
        .matches(/^[A-Za-z0-9 ]+$/, "Only alphabets and numbers are allowed"),
    city: Yup.string()
        .required("City is required")
        .matches(/^[A-Za-z0-9 ]+$/, "Only alphabets and numbers are allowed"),
    pincode: Yup.string()
        .required("Pincode is required")
        .matches(/^[A-Za-z0-9]+$/, "Only alphanumeric characters allowed")
        .min(4, "Minimum 4 characters")
        .max(10, "Maximum 10 characters"),
});

const AddEditAddress: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<RootStackParamList, "AddEditAddress">>();
    const { id } = route.params || {};
    const [initialValues, setInitialValues] = useState<AddressFormValues>({
        addressLine1: "",
        addressLine2: "",
        state: "",
        city: "",
        pincode: "",
        isDefault: false,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [fetching, setFetching] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const ref = useRef<any>(null);
    const title = id ? "Edit Address" : "Add Address";

    useEffect(() => {
        if (id) {
            const fetchAddress = async () => {
                try {
                    setFetching(true);
                    const response: any = await CardsModuleService.getPersonalCustomerViewDetails(id);
                    if (response?.ok && response.data) {
                        const data = response.data;
                        setInitialValues({
                            addressLine1: data.addressLine1 || "",
                            addressLine2: data.addressLine2 || "",
                            state: data.state || "",
                            city: data.city || "",
                            pincode: data.pincode || "",
                            isDefault: data.isDefault || false,
                        });
                        setErrorMsg("");
                    } else {
                        setErrorMsg(isErrorDispaly(response) || "Failed to fetch address details");
                    }
                } catch (err) {
                    setErrorMsg(isErrorDispaly(err) || "An error occurred while fetching address details.");
                } finally {
                    setFetching(false);
                }
            };
            fetchAddress();
        }
    }, [id]);

    const handleSubmitForm = async (values: AddressFormValues) => {
        setLoading(true);
        const trimmedValues = trimValues(values);
        try {
            if (id) {
                const updatePayload = { id, ...trimmedValues };
                const res: any = await CardsModuleService.updatePersonalInformation(updatePayload);
                if (res?.ok || res.status === 200) {
                    navigation.goBack();
                } else {
                    setErrorMsg(isErrorDispaly(res));
                    ref.current?.scrollTo({ y: 0, animated: true });
                }
            } else {
                const addPayload = { ...trimmedValues };
                const res: any = await CardsModuleService.addPersonalInformation(addPayload);
                if (res?.ok || res.status === 200) {
                    navigation.goBack();
                } else {
                    setErrorMsg(isErrorDispaly(res));
                    ref.current?.scrollTo({ y: 0, animated: true });
                }
            }
        } catch (err) {
            setErrorMsg(isErrorDispaly(err));
            ref.current?.scrollTo({ y: 0, animated: true });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseError = () => setErrorMsg("");
    return (
        <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
            <ScrollView keyboardShouldPersistTaps="handled" ref={ref}>
                <Container style={commonStyles.container}>
                    <View style={[commonStyles.dflex, commonStyles.alignCenter, { marginBottom: s(16) }]}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: s(8) }}>
                            <AntDesign name="arrowleft" size={s(24)} color={commonStyles.white || "#FFF"} />
                        </TouchableOpacity>
                        <ParagraphComponent text={title} style={[commonStyles.fs18, commonStyles.fw700, { marginLeft: s(12), color: commonStyles.white || "#FFF" }]} />
                    </View>
                    {errorMsg ? <ErrorComponent message={errorMsg} onClose={handleCloseError} /> : null}
                    {fetching ? (
                        <Loadding contenthtml={personalInfoLoader(10)} />
                    ) : (
                        <Formik
                            initialValues={initialValues}
                            onSubmit={handleSubmitForm}
                            validationSchema={validationSchema}
                            enableReinitialize
                            validateOnChange={false}
                            validateOnBlur={false}
                        >
                            {({ handleSubmit, handleBlur, errors, touched, setFieldValue }) => (
                                <View style={{ marginBottom: s(20) }}>
                                    <Field

                                        name="addressLine1"
                                        component={InputDefault}
                                        label="Address Line 1"
                                        placeholder="Enter Address Line 1"
                                        error={touched.addressLine1 && errors.addressLine1 ? errors.addressLine1 : ""}
                                        handleBlur={handleBlur}
                                        Children={<LabelComponent text=" *" style={{ color: "red" }} />}
                                    />
                                    <View style={{ marginBottom: s(16) }} />
                                    <Field
                                        name="addressLine2"
                                        component={InputDefault}
                                        label="Address Line 2"
                                        placeholder="Enter Address Line 2"
                                        error={touched.addressLine2 && errors.addressLine2 ? errors.addressLine2 : ""}
                                        handleBlur={handleBlur}
                                        Children={<LabelComponent text=" *" style={{ color: "red" }} />}
                                    />
                                    <View style={{ marginBottom: s(16) }} />
                                    <Field
                                        name="state"
                                        component={InputDefault}
                                        label="State"
                                        placeholder="Enter State"
                                        error={touched.state && errors.state ? errors.state : ""}
                                        handleBlur={handleBlur}
                                        Children={<LabelComponent text=" *" style={{ color: "red" }} />}
                                    />
                                    <View style={{ marginBottom: s(16) }} />
                                    <Field
                                        name="city"
                                        component={InputDefault}
                                        label="City"
                                        placeholder="Enter City"
                                        error={touched.city && errors.city ? errors.city : ""}
                                        handleBlur={handleBlur}
                                        Children={<LabelComponent text=" *" style={{ color: "red" }} />}
                                    />
                                    <View style={{ marginBottom: s(16) }} />
                                    <Field
                                        name="pincode"
                                        component={InputDefault}
                                        label="Pincode"
                                        placeholder="Enter Pincode"
                                        error={touched.pincode && errors.pincode ? errors.pincode : ""}
                                        handleBlur={handleBlur}
                                        Children={<LabelComponent text=" *" style={{ color: "red" }} />}
                                    />
                                    <View style={{ marginBottom: s(16) }} />
                                    <View style={[commonStyles.dflex, commonStyles.alignCenter, { marginBottom: s(16) }]}>
                                        <ParagraphComponent text="Set as Default" style={[commonStyles.fs16, commonStyles.textBlack]} />
                                        <Switch
                                            value={initialValues.isDefault}
                                            onValueChange={(value) => setFieldValue("isDefault", value)}
                                        />
                                    </View>
                                    <DefaultButton title="Save" onPress={handleSubmit} loading={loading} disable={loading} />
                                </View>
                            )}
                        </Formik>
                    )}
                </Container>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AddEditAddress;