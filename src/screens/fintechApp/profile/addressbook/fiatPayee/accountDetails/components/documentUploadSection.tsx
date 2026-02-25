import React, { useEffect } from 'react';
import { Field } from "formik";
import InputDefault from '../../../../../../../components/textInputComponents/DefaultFiat';
import CustomPicker from '../../../../../../../components/customPicker/CustomPicker';
import FileUpload from '../../../../../../../components/fileUpload/fileUpload';
import ViewComponent from '../../../../../../../components/view/view';
import { ADD_RECIPIENT } from '../../addRecipient/constant';
import LabelComponent from '../../../../../../../components/textComponets/lableComponent/lable';
import ParagraphComponent from '../../../../../../../components/textComponets/paragraphText/paragraph';

interface DocumentUploadSectionProps {
    values: any;
    touched: any;
    errors: any;
    handleBlur: any;
    nameRef: any;
    documentType: any;
    businessType: any;
    uploading: boolean;
    backImgFileLoader: boolean;
    frontImage: any;
    backImage: any;
    uploadError: any;
    uploadedFrontIdFileName: string;
    uploadedBackIdFileName: string;
    NEW_COLOR: any;
    commonStyles: any;
    FrondpickImage: (value: any) => void;
    pickImage: (value: any) => void;
    deleteFrontIdImages: (fileName: string) => void;
    handleBusinessType: (setFieldValue: any) => void;
    setFieldValue: any;
    props: any;
    setErrormsg: (msg: string) => void;
    ref?: any;
}

const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
    values,
    touched,
    errors,
    handleBlur,
    nameRef,
    documentType,
    businessType,
    uploading,
    backImgFileLoader,
    frontImage,
    backImage,
    uploadError,
    uploadedFrontIdFileName,
    uploadedBackIdFileName,
    NEW_COLOR,
    commonStyles,
    FrondpickImage,
    pickImage,
    deleteFrontIdImages,
    handleBusinessType,
    setFieldValue,
    props,
    setErrormsg,
    ref
}) => {
    useEffect(() => {
        setFieldValue('frontId', frontImage?.url || '');
    }, [frontImage?.url]);

    useEffect(() => {
        setFieldValue('backId', backImage?.url || '');
    }, [backImage?.url]);

    const handleFrontImageUpload = (value: any) => {
        FrondpickImage(value);
    };

    const handleBackImageUpload = (value: any) => {
        pickImage(value);
    };

    if (props?.accountType?.toLowerCase() === ADD_RECIPIENT.PERSONAL?.toLowerCase()) {
        return (
            <ViewComponent>
                <ParagraphComponent style={[commonStyles.sectionTitle, commonStyles.mb16, commonStyles.mt20]} text={"GLOBAL_CONSTANTS.ADDITIONAL_INFORM"} />

                <Field
                    modalTitle={"GLOBAL_CONSTANTS.SELECT_DOCUMENT_TYPE"}
                    activeOpacity={0.9}
                    label={"GLOBAL_CONSTANTS.DOCUMENT_TYPE"}
                    touched={touched.documentType}
                    name={ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.DOCUMENT_TYPE}
                    error={errors.documentType}
                    isOnlycountry={true}
                    handleBlur={handleBlur}
                    data={documentType}
                    onChange={() => {
                        setFieldValue('backId', '');
                        setFieldValue('frontId', '');
                    }}
                    placeholder={"GLOBAL_CONSTANTS.SELECT_DOCUMENT_TYPE"}
                    placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                    component={CustomPicker}
                    requiredMark={<LabelComponent text={" *"} style={[commonStyles.textRed]} />}
                />

                <ViewComponent style={[commonStyles.formItemSpace]} />
                <Field
                    touched={touched.documentNumber}
                    name={ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.DOCUMENT_NUMBER}
                    label={"GLOBAL_CONSTANTS.DOCUMENT_NUMBER"}
                    error={errors.documentNumber}
                    handleBlur={handleBlur}
                    placeholder={"GLOBAL_CONSTANTS.ENTER_DOCUMENT_NUMBER"}
                    component={InputDefault}
                    innerRef={nameRef}
                    maxLength={20}
                    requiredMark={<LabelComponent style={[commonStyles.textRed]} text=' *' />}
                />

                <ViewComponent style={[commonStyles.formItemSpace]} />
                <FileUpload
                    isRequired={true}
                    fileLoader={uploading}
                    onSelectImage={handleFrontImageUpload}
                    uploadedImageUri={frontImage?.url}
                    errorMessage={(touched?.frontId && errors?.frontId) || uploadError?.frontId}
                    fileName={uploadedFrontIdFileName}
                    deleteImage={() => {
                        deleteFrontIdImages("frontIdPhoto");
                        setFieldValue('frontId', '');
                    }}
                    label={"GLOBAL_CONSTANTS.FROND_SIDE"}
                    showImageSourceSelector={true}
                />

                <ViewComponent style={[commonStyles.formItemSpace]} />
                <FileUpload
                    isRequired={true}
                    fileLoader={backImgFileLoader}
                    onSelectImage={handleBackImageUpload}
                    uploadedImageUri={backImage?.url}
                    errorMessage={(touched?.backId && errors?.backId) || uploadError?.backId}
                    fileName={uploadedBackIdFileName}
                    deleteImage={() => {
                        deleteFrontIdImages("backIdPhoto");
                        setFieldValue('backId', '');
                    }}
                    label={"GLOBAL_CONSTANTS.BACK_SIDE"}
                    showImageSourceSelector={true}
                />
            </ViewComponent>
        );
    }

    if (props?.accountType?.toLowerCase() !== ADD_RECIPIENT.PERSONAL?.toLowerCase()) {
        return (
            <ViewComponent>
                <ParagraphComponent style={[commonStyles.sectionTitle, commonStyles.mb16, commonStyles.mt20]} text={"GLOBAL_CONSTANTS.ADDITIONAL_INFORM"} />

                <Field
                    modalTitle={"GLOBAL_CONSTANTS.SELECT_BUSINESS_TYPE"}
                    activeOpacity={0.9}
                    label={"GLOBAL_CONSTANTS.BUSINESS_TYPE"}
                    touched={touched.businessType}
                    name={ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.BUSINESS_TYPE}
                    error={errors.businessType}
                    handleBlur={handleBlur}
                    data={businessType}
                    onChange={() => handleBusinessType(setFieldValue)}
                    placeholder={"GLOBAL_CONSTANTS.SELECT_BUSINESS_TYPE"}
                    placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                    component={CustomPicker}
                    requiredMark={<LabelComponent text={" *"} style={[commonStyles.textRed]} />}
                />

                <ViewComponent style={[commonStyles.formItemSpace]} />
                <Field
                    touched={touched.businessRegistrationNo}
                    name={ADD_RECIPIENT.FIAT_PAYEE_FIELD_NAMES.BUSINESS_REGISTRATION_NUMBER}
                    label={"GLOBAL_CONSTANTS.BUSINESS_REGISTRATION_NUMBER"}
                    error={errors.businessRegistrationNo}
                    handleBlur={handleBlur}
                    placeholder={"GLOBAL_CONSTANTS.ENTER_BUSINESS_REGISTRATION_NUMBER"}
                    component={InputDefault}
                    innerRef={nameRef}
                    maxLength={20}
                    requiredMark={<LabelComponent style={[commonStyles.textRed]} text=' *' />}
                />
            </ViewComponent>
        );
    }

    return null;
};

export default DocumentUploadSection;