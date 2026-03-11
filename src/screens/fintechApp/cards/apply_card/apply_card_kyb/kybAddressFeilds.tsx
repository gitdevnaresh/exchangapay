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
import { AddressFieldsProps } from '../interface';
import { useIsFocused } from '@react-navigation/native';
import { useDispatch } from 'react-redux';

const KybAddressFeilds: React.FC<AddressFieldsProps> = ({
    t,
    values,
    touched,
    setFieldValue,
    handleBlur,
    handleAddAddress,
    addresses = [],
    countries = [],
    statesList = [],
    kycDetailsRef,
    type,
    handleAddress,
    handleAddressCountry,
    addressInitialValues,
    prefix = 'personal',
}) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const editAddressref = useRef<any>(null);
    const [editType, setEditType] = useState<string>(type);
    const { validateForm, setTouched, errors } = useFormikContext<any>();
    const ref = useRef<any>(null);
    const [errorMsg, setErrormsg] = useState<string>("")
    const [tempValues, setTempValues] = useState<AddressFormValues | null>(null);
    const isFocused = useIsFocused();
    const dispatch = useDispatch();
    useEffect(() => {
        if (errorMsg) {
            ref?.current?.scrollTo({ y: 0, animated: true });
        }
        dispatch({ type: 'SET_SELECTED_ADDRESSES', payload: addressInitialValues });
    }, [errorMsg, addressInitialValues, isFocused])
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

        // ✅ Clear only address-related errors based on edit type
        setErrormsg("");

        const resetTouchedFields = prefix === 'company' ?
            (editType === "address"
                ? { companyAddressLine1: false }
                : {
                    companyAddressCountry: false,
                    companyState: false,
                    companyTown: false,
                    companyCity: false,
                    companyAddressLine1: false,
                    companyAddressLine2: false,
                    companyPostalCode: false,
                }) :
            (editType === "address"
                ? { addressLine1: false }
                : {
                    addressCountry: false,
                    state: false,
                    town: false,
                    city: false,
                    addressLine1: false,
                    addressLine2: false,
                    postalCode: false,
                });

        setTouched({
            ...touched,
            ...resetTouchedFields
        });

        // ✅ Re-run validation to clear only the relevant fields
        validateForm().then(() => {
            Keyboard.dismiss();
        });
    }, [tempValues, setFieldValue, setTouched, validateForm, editType]);

    const handleOk = async () => {
        Keyboard.dismiss();
        const formErrors = await validateForm();
        const touchedFields = prefix === 'company' ? {
            companyAddress: true,
            companyAddressLine1: true,
            companyAddressLine2: true,
            companyAddressCountry: true,
            companyState: true,
            companyTown: true,
            companyCity: true,
            companyPostalCode: true,
        } : {
            address: true,
            addressLine1: true,
            addressLine2: true,
            addressCountry: true,
            state: true,
            town: true,
            city: true,
            postalCode: true,
        };
        setTouched(touchedFields);
        // ✅ If this screen type is "address", only pick address-related errors
        let addressErrorObj: any = {};
        if (type === "address" || type === "fulladdress") {
            const addressFields = prefix === 'company' ? [
                "companyAddress",
                "companyAddressLine1",
                "companyAddressLine2",
                "companyAddressCountry",
                "companyState",
                "companyTown",
                "companyCity",
                "companyPostalCode",
            ] : [
                "address",
                "addressLine1",
                "addressLine2",
                "addressCountry",
                "state",
                "town",
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

        // ✅ Decide which error object to check (filtered or full)
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
            <View style={[commonStyles.formItemSpace]}>
                {/* HEADER */}
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.mb10]}>
                    <LabelComponent style={[commonStyles.inputLabel]} text={t(prefix === 'company' ? "Company Address" : "Personal Address")}> <LabelComponent text={"*"} style={commonStyles.textError} /></LabelComponent>
                    <ViewComponent style={[commonStyles.actioniconbg, { marginTop: s(-8) }]}>
                        <MaterialIcons name="add" size={s(22)} color={NEW_COLOR.DARK_TEXT_WHITE} onPress={handleAddAddress} />
                    </ViewComponent>
                </ViewComponent>

                {/* ADDRESS SELECTION */}
                <Field
                    activeOpacity={0.9}
                    touched={touched[prefix === 'company' ? 'companyAddress' : 'address']}
                    name={prefix === 'company' ? 'companyAddress' : FORM_DATA_CONSTANTS.ADDRESS}
                    modalTitle={"GLOBAL_CONSTANTS.ADDRESS"}
                    data={addresses}
                    onChange={(value: any) => handleAddress(value)}
                    error={errors?.[prefix === 'company' ? 'companyAddress' : 'address']}
                    value={values?.[prefix === 'company' ? 'companyAddress' : 'address']}
                    handleBlur={handleBlur}
                    customContainerStyle={{}}
                    placeholder={"GLOBAL_CONSTANTS.SELECT_ADDRESS"}
                    component={CustomPicker}
                    innerRef={kycDetailsRef?.current?.address}
                    isOnlycountry={true}
                />

                {/* SELECTED ADDRESS PREVIEW */}
                {values?.[prefix === 'company' ? 'companyAddress' : 'address'] && (<ViewComponent>
                    <View style={commonStyles.mt8} />
                    <TouchableOpacity style={[commonStyles.relative, commonStyles.bgnote]} disabled>
                        <View
                            style={[
                                commonStyles.dflex,
                                commonStyles.gap16,
                                commonStyles.alignStart,
                                commonStyles.notebg,
                                commonStyles.rounded5,
                                commonStyles.p8,
                                commonStyles.mt4
                            ]}
                        >
                            <View style={[commonStyles.flex1]}>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent]}>
                                    <View style={[commonStyles.dflex, commonStyles.gap8, commonStyles.mb2]}>
                                        <ParagraphComponent
                                            style={[commonStyles.twolettertext, commonStyles.textCenter]}
                                            text={
                                                values?.[prefix === 'company' ? 'companyAddress' : 'address']?.length > 40
                                                    ? `${values?.[prefix === 'company' ? 'companyAddress' : 'address']?.slice(0, 8)}...${values?.[prefix === 'company' ? 'companyAddress' : 'address']?.slice(-8)}`
                                                    : values?.[prefix === 'company' ? 'companyAddress' : 'address'] ?? "--"
                                            }
                                        />

                                        <TouchableOpacity activeOpacity={0.6} onPress={() => handleOpenEditSheet(type)} >
                                            <CustomeditLink height={s(18)} width={s(18)} style={[commonStyles.mt6]} />
                                        </TouchableOpacity>

                                    </View>
                                </ViewComponent>

                                <View>
                                    <ParagraphComponent
                                        text={
                                            type === "address"
                                                ? [values?.[prefix === 'company' ? 'companyAddressLine1' : 'addressLine1']]?.filter(Boolean)?.join(", ") || "--"
                                                : [
                                                    values?.[prefix === 'company' ? 'companyAddressLine1' : 'addressLine1'],
                                                    values?.[prefix === 'company' ? 'companyAddressLine2' : 'addressLine2'],
                                                    values?.[prefix === 'company' ? 'companyTown' : 'town'],
                                                    values?.[prefix === 'company' ? 'companyCity' : 'city'],
                                                    values?.[prefix === 'company' ? 'companyState' : 'state'],
                                                    values?.[prefix === 'company' ? 'companyAddressCountry' : 'addressCountry']?.length > 10
                                                        ? `${values?.[prefix === 'company' ? 'companyAddressCountry' : 'addressCountry']?.slice(0, 8)}...${values?.[prefix === 'company' ? 'companyAddressCountry' : 'addressCountry']?.slice(-8)}`
                                                        : values?.[prefix === 'company' ? 'companyAddressCountry' : 'addressCountry'],
                                                    values?.[prefix === 'company' ? 'companyPostalCode' : 'postalCode']
                                                ]
                                                    ?.filter(Boolean)
                                                    ?.join(", ") || "--"
                                        }
                                        style={[commonStyles.secondparatext]}
                                    />
                                </View>
                            </View>
                        </View>
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

                                <>
                                    <Field
                                        label={"GLOBAL_CONSTANTS.COUNTRY"}
                                        touched={touched[prefix === 'company' ? 'companyAddressCountry' : 'country']}
                                        name={prefix === 'company' ? 'companyAddressCountry' : FORM_DATA_CONSTANTS.ADDRESS_COUNTRY}
                                        value={values?.[prefix === 'company' ? 'companyAddressCountry' : 'country']}
                                        error={errors?.[prefix === 'company' ? 'companyAddressCountry' : 'country']}
                                        onChange={(e: any) => {
                                            const fieldName = prefix === 'company' ? 'companyAddressCountry' : FORM_DATA_CONSTANTS.ADDRESS_COUNTRY;
                                            setFieldValue(fieldName, e);
                                            handleAddressCountry(e, setFieldValue);
                                        }}
                                        component={CustomPicker}
                                        data={countries}
                                        placeholder={"GLOBAL_CONSTANTS.SELECT_COUNTRY"}
                                        innerRef={kycDetailsRef?.current?.country}
                                        maxLength={50}
                                        requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                    />

                                    <View style={commonStyles.formItemSpace} />
                                    <Field
                                        label={FORM_DATA_LABEL.STATE}
                                        touched={touched[prefix === 'company' ? 'companyState' : 'state']}
                                        name={prefix === 'company' ? 'companyState' : FORM_DATA_CONSTANTS.STATE}
                                        value={values?.[prefix === 'company' ? 'companyState' : 'state']}
                                        error={errors?.[prefix === 'company' ? 'companyState' : 'state']}
                                        onChange={(val: any) => {
                                            const fieldName = prefix === 'company' ? 'companyState' : FORM_DATA_CONSTANTS.STATE;
                                            setFieldValue(fieldName, val);
                                        }}
                                        component={CustomPicker}
                                        data={statesList}
                                        placeholder={FORM_DATA_CONSTANTS.SELECT_STATE}
                                        innerRef={kycDetailsRef?.current?.state}
                                        maxLength={50}
                                        requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                    />


                                    <ViewComponent style={commonStyles.formItemSpace} />
                                    <Field
                                        touched={touched[prefix === 'company' ? 'companyCity' : 'city']}
                                        name={prefix === 'company' ? 'companyCity' : FORM_DATA_CONSTANTS.CITY}
                                        label={FORM_DATA_LABEL.CITY}
                                        value={values?.[prefix === 'company' ? 'companyCity' : 'city']}
                                        error={errors?.[prefix === 'company' ? 'companyCity' : 'city']}
                                        handleBlur={handleBlur}
                                        onChange={(val: any) => {
                                            const fieldName = prefix === 'company' ? 'companyCity' : FORM_DATA_CONSTANTS.CITY;
                                            setFieldValue(fieldName, val);
                                        }}
                                        component={InputDefault}
                                        innerRef={kycDetailsRef?.current?.city}
                                        placeholder={FORM_DATA_CONSTANTS.ENTER_CITY}
                                        requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                        maxLength={50}

                                    />

                                    <View style={commonStyles.formItemSpace} />
                                    <Field
                                        touched={touched[prefix === 'company' ? 'companyAddressLine1' : 'addressLine1']}
                                        name={prefix === 'company' ? 'companyAddressLine1' : FORM_DATA_CONSTANTS.ADDRESS_LINE1}
                                        label={FORM_DATA_LABEL.ADDRESS_LINE1}
                                        value={values?.[prefix === 'company' ? 'companyAddressLine1' : 'addressLine1']}
                                        error={errors?.[prefix === 'company' ? 'companyAddressLine1' : 'addressLine1']}
                                        handleBlur={handleBlur}
                                        onChange={(val: any) => {
                                            const fieldName = prefix === 'company' ? 'companyAddressLine1' : FORM_DATA_CONSTANTS.ADDRESS_LINE1;
                                            setFieldValue(fieldName, val);
                                        }}
                                        component={InputDefault}
                                        innerRef={kycDetailsRef?.current?.addressLine1}
                                        placeholder={FORM_DATA_PLACEHOLDER.ENTER_ADDRESS_LINE_1}
                                        requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                        maxLength={100}

                                    />

                                    <View style={commonStyles.formItemSpace} />
                                    <Field
                                        touched={touched[prefix === 'company' ? 'companyAddressLine2' : 'addressLine2']}
                                        name={prefix === 'company' ? 'companyAddressLine2' : FORM_DATA_CONSTANTS.ADDRESS_LINE2}
                                        label={FORM_DATA_LABEL.ADDRESS_LINE2}
                                        value={values?.[prefix === 'company' ? 'companyAddressLine2' : 'addressLine2']}
                                        error={errors?.[prefix === 'company' ? 'companyAddressLine2' : 'addressLine2']}
                                        handleBlur={handleBlur}
                                        onChange={(val: any) => {
                                            const fieldName = prefix === 'company' ? 'companyAddressLine2' : FORM_DATA_CONSTANTS.ADDRESS_LINE2;
                                            setFieldValue(fieldName, val);
                                        }}
                                        component={InputDefault}
                                        placeholder={FORM_DATA_PLACEHOLDER.ENTER_ADDRESS_LINE_2}
                                        innerRef={kycDetailsRef?.current?.addressLine2}
                                        maxLength={100}

                                    />

                                    <View style={commonStyles.formItemSpace} />
                                    <Field
                                        touched={touched[prefix === 'company' ? 'companyPostalCode' : 'postalCode']}
                                        name={prefix === 'company' ? 'companyPostalCode' : FORM_DATA_CONSTANTS.POSTAL_CODE}
                                        label={FORM_DATA_LABEL.POSTAL_CODE}
                                        value={values?.[prefix === 'company' ? 'companyPostalCode' : 'postalCode']}
                                        error={errors?.[prefix === 'company' ? 'companyPostalCode' : 'postalCode']}
                                        handleBlur={handleBlur}
                                        onChange={(val: any) => {
                                            const fieldName = prefix === 'company' ? 'companyPostalCode' : FORM_DATA_CONSTANTS.POSTAL_CODE;
                                            setFieldValue(fieldName, val);
                                        }}
                                        keyboardType="numeric"
                                        component={InputDefault}
                                        innerRef={kycDetailsRef?.current?.postalCode}
                                        placeholder={FORM_DATA_PLACEHOLDER.ENTER_POSTAL_CODE}
                                        requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                        maxLength={8}

                                    />
                                </>
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
                                                title={"GLOBAL_CONSTANTS.OK"}
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
export default KybAddressFeilds;