import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Field, Formik } from 'formik';
import AntDesign from "react-native-vector-icons/AntDesign";
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import { isErrorDispaly } from '../../../../../utils/helpers';
import InputDefault from '../../../../../components/textInputComponents/DefaultFiat';
import { AddVaultProps, VaultName } from './interface';
import { PAYMENT_LINK_CONSTENTS } from '../../../payments/constants';
import PaymentService from '../../../../../apiServices/payments';
import WalletsService from '../../../../../apiServices/wallets';
import { addVaultSchema } from '../../../payments/schema';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import CustomRBSheet from '../../../../../components/models/commonBottomSheet';
import { ms, s } from '../../../../../components/theme/scale';
import TextMultiLanguage from '../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import ButtonComponent from '../../../../../components/buttons/button';
import ViewComponent from '../../../../../components/view/view';
import LabelComponent from '../../../../../components/textComponets/lableComponent/lable';



const AddVault = (props: AddVaultProps) => {
    const [buttonLoader, setButtonLoader] = useState<boolean>(false)
    const [handleError, setHandleError] = useState<string>('');
    const nameRef = useRef();

    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const rbSheetRef = useRef<any>(null);

    useEffect(() => {
        if (props.addModelVisible) {
            rbSheetRef.current?.open();
        } else {
            // This part is not strictly necessary if the component unmounts,
            // but it's good practice for controlling the sheet's state.
            rbSheetRef.current?.close();
        }
    }, [props.addModelVisible]);

    const handleSave = async (values: VaultName) => {
        setButtonLoader(true)
        if (!values?.merchantName) {
            setButtonLoader(false)
            return setHandleError(PAYMENT_LINK_CONSTENTS.PLEASE_ENTER_MERCHANT_NAME)
        }
        const _objData = {
            id: PAYMENT_LINK_CONSTENTS.GUID_FORMAT,
            name: values?.merchantName,
        }
        try {
            const response = await WalletsService.createMarchent(_objData);
            if (response.ok) {
                setButtonLoader(false)
                setHandleError("")
                props?.saveVault();
            }
            else {
                setButtonLoader(false)
                setHandleError(isErrorDispaly(response))
            }
        }
        catch (error) {
            setHandleError(isErrorDispaly(error))
            setButtonLoader(false)
        }
    }
    const propsCloseModel = () => {
        props?.closeModel()
        setHandleError("")
    }
    const handleErrormsg = () => {
        setHandleError("")
    }
    return (

        <CustomRBSheet
            refRBSheet={rbSheetRef}
            onClose={propsCloseModel}
            height={'Small'}
            modeltitle={true}
            title={"GLOBAL_CONSTANTS.CREATE_NEW_VAULT"}
        >
            <View>

                <Formik
                    initialValues={{ merchantName: '' }}
                    onSubmit={handleSave}
                    validationSchema={addVaultSchema}
                >
                    {({ handleBlur, handleSubmit, errors, touched }) => (
                        <View>


                            {handleError != "" && <ErrorComponent message={handleError} onClose={handleErrormsg} />}
                            <View style={[commonStyles.mb10]} />
                            <Field
                                touched={touched?.merchantName}
                                name={PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_PLACEHOLDER.MERCHANT_NAME}
                                label={"GLOBAL_CONSTANTS.WALLET_NAME"}
                                error={errors?.merchantName}
                                handleBlur={handleBlur}
                                placeholder={"GLOBAL_CONSTANTS.WALLET_NAME_PLACEHOLDER"}
                                component={InputDefault}
                                innerRef={nameRef}
                                requiredMark={<LabelComponent text={" *"} style={[commonStyles.textRed]} />}
                                labelStyle={[commonStyles.sheetbg]}
                            />
                            <View style={[commonStyles.mt16, commonStyles.dflex, commonStyles.gap10, commonStyles.alignCenter]}>
                                <AntDesign name="infocirlceo" size={s(22)} color={NEW_COLOR.TEXT_GREY} />
                                <TextMultiLanguage
                                    style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textGreyAc]}
                                    text={"GLOBAL_CONSTANTS.VAULT_NOTE"}
                                />
                            </View>
                            <ViewComponent style={[commonStyles.sectionGap]} />
                            <ViewComponent style={[commonStyles.mt10]} />

                            <View style={[commonStyles.dflex, commonStyles.gap10]}>

                                <View style={[commonStyles.flex1]}>
                                    <ButtonComponent
                                        title={"GLOBAL_CONSTANTS.CANCEL"}
                                        onPress={propsCloseModel}
                                        solidBackground={true}
                                    />
                                </View>
                                <View style={[commonStyles.flex1]}>
                                    <ButtonComponent
                                        title={"GLOBAL_CONSTANTS.SAVE"}
                                        onPress={handleSubmit}
                                        loading={buttonLoader}
                                    />
                                </View>
                            </View>
                        </View>
                    )}
                </Formik>
            </View>
            <View style={[commonStyles.mb24]} /></CustomRBSheet>
    );
};

export default AddVault;

