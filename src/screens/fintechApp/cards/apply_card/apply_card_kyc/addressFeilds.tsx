
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { View, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, ScrollView } from "react-native"
import { Field } from 'formik';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import InputDefault from '../../../../../components/textInputComponents/DefaultFiat'
import CustomPicker from '../../../../../components/customPicker/CustomPicker';
import { AddressFormValues, FORM_DATA_CONSTANTS, FORM_DATA_LABEL, FORM_DATA_PLACEHOLDER } from '../constants';
import { FORM_FIELD } from '../../../onboarding/kyb/constants';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import ViewComponent from '../../../../../components/view/view';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import LabelComponent from '../../../../../components/textComponets/lableComponent/lable';
import { ms, s } from '../../../../../constants/styels/scale';
import CustomeditLink from "../../../../../components/svgIcons/mainmenuicons/linkedit";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomRBSheet from '../../../../../components/models/commonBottomSheet';
import ButtonComponent from '../../../../../components/buttons/button';
import { useFormikContext } from 'formik'
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import { AddressFieldsProps, FormikContextType, RBSheetRef, ScrollViewRef } from '../interface';
import AddIcon from '../../../../../components/addCommonIcon/addCommonIcon';

// Additional interfaces for type safety


const AddressFields: React.FC<AddressFieldsProps> = ({
    t,
    values,
    touched,
    setFieldValue,
    handleBlur,
    handleAddAddress,
    addresses = [],
    countries = [],
    statesList = [],
    townsList = [],
    kycDetailsRef,
    type,
    handleAddress,
    handleAddressCountry,
}) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const editAddressref = useRef<RBSheetRef>(null);
    const [editType, setEditType] = useState<string>(type || "");
    const { validateForm, setTouched, errors } = useFormikContext<FormikContextType>();
    const ref = useRef<ScrollViewRef>(null);
    const [errorMsg, setErrormsg] = useState<string>("")
    const [tempValues, setTempValues] = useState<AddressFormValues | null>(null);

    useEffect(() => {
        if (errorMsg) {
            ref?.current?.scrollTo({ y: 0, animated: true });
        }
    }, [errorMsg]);
    const handleOpenEditSheet = (mode: string) => {
        setEditType(mode);
        setTempValues({ ...values }); // store a snapshot
        editAddressref.current?.open(); // open the bottom sheet
    };
    const handleCancel = useCallback(() => {
        editAddressref.current?.close();

        if (tempValues) {
            Object.keys(tempValues).forEach((key) => {
                setFieldValue(key, tempValues[key]);
            });
        }

        // ? Clear only address-related errors based on edit type
        setErrormsg("");

        setTouched({
            ...touched,
            ...(editType === "address"
                ? { addressLine1: false }
                : {
                    addressCountry: false,
                    state: false,
                    // town: false,
                    city: false,
                    addressLine1: false,
                    addressLine2: false,
                    postalCode: false,
                })
        });

        // ? Re-run validation to clear only the relevant fields
        validateForm().then(() => {
            Keyboard.dismiss();
        });
    }, [tempValues, setFieldValue, setTouched, validateForm, editType]);
    const handleOk = async () => {
        Keyboard.dismiss();
        const formErrors = await validateForm();
        setTouched({
            address: true,
            addressLine1: true,
            addressLine2: true,
            addressCountry: true,
            state: true,
            // town: true,
            city: true,
            postalCode: true,
        });
        // ? If this screen type is "address", only pick address-related errors
        const addressErrorObj: Record<string, string> = {};
        if (type === "address" || type === "fulladdress") {
            const addressFields = [
                "address",
                "addressLine1",
                "addressLine2",
                "addressCountry",
                "state",
                // "town",
                "city",
                "postalCode",
            ];

            // Filter only address-related errors
            Object.keys(formErrors).forEach((key) => {
                if (addressFields.includes(key)) {
                    addressErrorObj[key] = formErrors[key];
                }
            });
        }


        // ? Decide which error object to check (filtered or full)
        const finalErrors = addressErrorObj;

        if (Object.keys(finalErrors).length > 0) {
            setErrormsg(t("GLOBAL_CONSTANTS.PLEASE_CHECK_BELLOW_ALL_FEILD"));
            ref.current?.scrollTo({ y: 0, animated: true });
            return;
        } else {
            editAddressref.current?.close();
            setErrormsg("")
        }
    };

    const handleCloseError = useCallback(() => { setErrormsg("") }, []);
    return (
        <ViewComponent style={[commonStyles.flex1]}>
            <View>

                {/* HEADER */}
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                    <LabelComponent style={[commonStyles.inputLabel]} text={t("GLOBAL_CONSTANTS.ADDRESS")}> <LabelComponent text={"*"} style={commonStyles.textError} /></LabelComponent>
                    <ViewComponent style={[commonStyles.actioniconbg, commonStyles.mb8]}>
                        <AddIcon onPress={handleAddAddress} />
                    </ViewComponent>
                </ViewComponent>

                {/* ADDRESS SELECTION */}
                <Field
                    activeOpacity={0.9}
                    touched={touched.address}
                    name={FORM_DATA_CONSTANTS.ADDRESS}
                    modalTitle={"GLOBAL_CONSTANTS.ADDRESS"}
                    data={addresses}
                    onChange={(value: string) => handleAddress(value)}
                    error={errors?.address}
                    value={values?.address}
                    handleBlur={handleBlur}
                    customContainerStyle={{}}
                    placeholder={"GLOBAL_CONSTANTS.SELECT_ADDRESS"}
                    component={CustomPicker}
                    innerRef={kycDetailsRef?.current?.address}
                    isOnlycountry={true}
                />

                {/* SELECTED ADDRESS PREVIEW */}
                {values?.address && (<ViewComponent>
                    <View style={commonStyles.mt8} />
                    <TouchableOpacity style={[commonStyles.relative, commonStyles.bgnote]} disabled>
                        <ViewComponent
                            style={[
                                commonStyles.dflex,
                                commonStyles.gap16,
                                commonStyles.alignStart,
                                commonStyles.notebg,
                            ]}
                        >
                            <ViewComponent style={[commonStyles.flex1]}>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent]}>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.gap8, commonStyles.mb2]}>
                                        <ParagraphComponent
                                            style={[commonStyles.twolettertext, commonStyles.textCenter]}
                                            text={
                                                values?.address?.length > 40
                                                    ? `${values?.address?.slice(0, 8)}...${values?.address?.slice(-8)}`
                                                    : values?.address ?? "--"
                                            }
                                        />

                                        <TouchableOpacity activeOpacity={0.6} onPress={() => handleOpenEditSheet(type)} >
                                            <CustomeditLink height={s(18)} width={s(18)} style={[commonStyles.mt6]} />
                                        </TouchableOpacity>

                                    </ViewComponent>
                                </ViewComponent>

                                <ViewComponent>
                                    <ParagraphComponent
                                        text={
                                            type === "address"
                                                ? [values?.addressLine1]?.filter(Boolean)?.join(", ") || "--"
                                                : [
                                                    values?.addressLine1,
                                                    values?.addressLine2,
                                                    // values?.town,
                                                    values?.city,
                                                    values?.state,
                                                    values?.addressCountry?.length > 10
                                                        ? `${values?.addressCountry?.slice(0, 8)}...${values?.addressCountry?.slice(-8)}`
                                                        : values?.addressCountry,
                                                    values?.postalCode

                                                ]
                                                    ?.filter(Boolean)
                                                    ?.join(", ") || "--"
                                        }
                                        style={[commonStyles.secondparatext]}
                                    />
                                </ViewComponent>
                            </ViewComponent>
                        </ViewComponent>
                    </TouchableOpacity>
                </ViewComponent>)}
                <CustomRBSheet
                    refRBSheet={editAddressref}
                    title={t("GLOBAL_CONSTANTS.EDIT_ADDRESS")}
                    height={type === "address" ? "Medium" : "Extra Large"}
                    modeltitle={true}
                    closeicon={true}
                    onPressCloseIcon={handleCancel}
                    customStyles={{
                        container: [
                            commonStyles.sheetbg,
                            commonStyles.rounded5,
                            { padding: ms(12), width: '100%' },
                        ],
                        wrapper: { backgroundColor: "rgba(0, 0, 0, 0.49)" },
                    }}
                >
                    <ViewComponent>

                        <KeyboardAvoidingView
                            style={{ flex: 1 }}
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            keyboardVerticalOffset={Platform.OS === "ios" ? s(150) : s(0)}
                        >
                            <ScrollView
                                ref={kycDetailsRef}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                                nestedScrollEnabled
                                contentContainerStyle={{ paddingBottom: s(220), flexGrow: 1 }}
                                maintainVisibleContentPosition={{ minIndexForVisible: 0 }}

                            >


                                {errorMsg && (<ErrorComponent message={errorMsg} onClose={handleCloseError} />)}

                                {editType === "address" ? (
                                    // ? Edit only AddressLine1

                                    <Field
                                        touched={touched.addressLine1}
                                        name={FORM_DATA_CONSTANTS.ADDRESS_LINE1}
                                        label={FORM_DATA_LABEL.ADDRESS_LINE1}
                                        error={errors?.addressLine1}
                                        handleBlur={handleBlur}
                                        customContainerStyle={{}}
                                        placeholder={FORM_DATA_PLACEHOLDER.ENTER_ADDRESS_LINE_1}
                                        component={InputDefault}
                                        innerRef={kycDetailsRef?.current?.addressLine1}
                                        isRequired={true}
                                        requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}

                                    />

                                ) : (
                                    // ? Edit full address details
                                    <>
                                        <Field
                                            label={"GLOBAL_CONSTANTS.COUNTRY"}
                                            touched={touched.addressCountry}
                                            name={FORM_DATA_CONSTANTS.ADDRESS_COUNTRY}
                                            value={values?.addressCountry}
                                            error={errors?.addressCountry}
                                            onChange={(e: string) => handleAddressCountry(e, setFieldValue)}
                                            component={CustomPicker}
                                            data={countries}
                                            placeholder={"GLOBAL_CONSTANTS.SELECT_COUNTRY"}
                                            innerRef={kycDetailsRef?.current?.addressCountry}
                                            requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                        />

                                        <View style={commonStyles.formItemSpace} />
                                        <Field
                                            label={FORM_DATA_LABEL.STATE}
                                            touched={touched.state}
                                            name={FORM_DATA_CONSTANTS.STATE}
                                            value={values?.state}
                                            error={errors?.state}
                                            onChange={(val: string) => setFieldValue(FORM_DATA_CONSTANTS.STATE, val)}
                                            component={CustomPicker}
                                            data={statesList}
                                            placeholder={FORM_DATA_CONSTANTS.SELECT_STATE}
                                            innerRef={kycDetailsRef?.current?.state}
                                            requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                        />

                                        {/* <View style={commonStyles.formItemSpace} />
                                        <Field
                                            label={FORM_DATA_LABEL.TOWN}
                                            touched={touched.town}
                                            name={FORM_DATA_CONSTANTS.TOWN}
                                            value={values?.town}
                                            error={errors?.town}
                                            onChange={(val) => setFieldValue(FORM_DATA_CONSTANTS.TOWN, val)}
                                            component={CustomPicker}
                                            data={townsList}
                                            placeholder={FORM_DATA_CONSTANTS.SELECT_TOWN}
                                            innerRef={kycDetailsRef?.current?.town}
                                            requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                        /> */}

                                        <View style={commonStyles.formItemSpace} />
                                        <Field
                                            touched={touched.city}
                                            name={FORM_DATA_CONSTANTS.CITY}
                                            label={FORM_DATA_LABEL.CITY}
                                            value={values?.city}
                                            error={errors?.city}
                                            handleBlur={handleBlur}
                                            onChange={(val: string) => setFieldValue(FORM_DATA_CONSTANTS.CITY, val)}
                                            component={InputDefault}
                                            innerRef={kycDetailsRef?.current?.city}
                                            placeholder={FORM_DATA_CONSTANTS.ENTER_CITY}

                                            requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                        />

                                        <View style={commonStyles.formItemSpace} />
                                        <Field
                                            touched={touched.addressLine1}
                                            name={FORM_DATA_CONSTANTS.ADDRESS_LINE1}
                                            label={FORM_DATA_LABEL.ADDRESS_LINE1}
                                            value={values?.addressLine1}
                                            error={errors?.addressLine1}
                                            handleBlur={handleBlur}
                                            onChange={(val: string) => setFieldValue(FORM_DATA_CONSTANTS.ADDRESS_LINE1, val)}
                                            component={InputDefault}
                                            innerRef={kycDetailsRef?.current?.addressLine1}
                                            placeholder={FORM_DATA_PLACEHOLDER.ENTER_ADDRESS_LINE_1}

                                            requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                        />

                                        <View style={commonStyles.formItemSpace} />
                                        <Field
                                            touched={touched.addressLine2}
                                            name={FORM_DATA_CONSTANTS.ADDRESS_LINE2}
                                            label={FORM_DATA_LABEL.ADDRESS_LINE2}
                                            value={values?.addressLine2}
                                            error={errors?.addressLine2}
                                            handleBlur={handleBlur}
                                            onChange={(val: string) => setFieldValue(FORM_DATA_CONSTANTS.ADDRESS_LINE2, val)}
                                            component={InputDefault}
                                            placeholder={FORM_DATA_PLACEHOLDER.ENTER_ADDRESS_LINE_2}
                                            innerRef={kycDetailsRef?.current?.addressLine2}
                                        />

                                        <View style={commonStyles.formItemSpace} />
                                        <Field
                                            touched={touched.postalCode}
                                            name={FORM_DATA_CONSTANTS.POSTAL_CODE}
                                            label={FORM_DATA_LABEL.POSTAL_CODE}
                                            value={values?.postalCode}
                                            error={errors?.postalCode}
                                            handleBlur={handleBlur}
                                            onChange={(val: string) => setFieldValue(FORM_DATA_CONSTANTS.POSTAL_CODE, val)}
                                            keyboardType="numeric"
                                            component={InputDefault}
                                            innerRef={kycDetailsRef?.current?.postalCode}
                                            placeholder={FORM_DATA_PLACEHOLDER.ENTER_POSTAL_CODE}
                                            requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                        />
                                    </>
                                )}

                                {editType === "address" && <View style={[commonStyles.mt40]} />}

                                <View style={[commonStyles.mt32]}>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.mb10]}>
                                        <ViewComponent style={[commonStyles.flex1]}>
                                            <ButtonComponent
                                                title={"GLOBAL_CONSTANTS.CANCEL"}
                                                onPress={handleCancel}
                                                solidBackground={true}
                                            />
                                        </ViewComponent>
                                        <ViewComponent style={[commonStyles.flex1]}>
                                            <ButtonComponent
                                                title={"GLOBAL_CONSTANTS.SAVE"}
                                                onPress={handleOk}
                                            />
                                        </ViewComponent>
                                    </ViewComponent>
                                    <View style={[commonStyles.mb32]} />
                                </View>

                            </ScrollView>
                        </KeyboardAvoidingView>



                    </ViewComponent>
                </CustomRBSheet>
            </View>
        </ViewComponent>
    );
};
export default AddressFields;
