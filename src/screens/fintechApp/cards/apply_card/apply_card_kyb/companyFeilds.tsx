import React, { useState } from 'react';
import { Field } from 'formik';
import ViewComponent from '../../../../../components/view/view';
import InputDefault from '../../../../../components/textInputComponents/DefaultFiat';
import LabelComponent from '../../../../../components/textComponets/lableComponent/lable';
import { FORM_FIELD } from './constant';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import ProfileService from '../../../../../apiServices/profile';
import * as DocumentPicker from 'expo-document-picker';
import { FORM_DATA_CONSTANTS } from '../constants';
import { Alert } from 'react-native';
import FileUpload from '../../../../../components/fileUpload/fileUpload';
import * as ImagePicker from 'expo-image-picker';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import CustomPicker from '../../../../../components/customPicker/CustomPicker';
import { CompanyFieldsProps } from './interface';

const CompanyFields: React.FC<CompanyFieldsProps> = ({ touched, errors, handleBlur, values, kybRequriments, handleChange, setFieldValue, setFieldTouched, sectors, types, KybFeildInitialValues }) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  type ImageFieldKey =
    'shareholderRegistry' |
    'certificateofincorporation';

  const [fileNames, setFileNames] = useState({
    shareholderRegistry: "",
    certificateofincorporation: "",
  });
  const [loadingState, setLoadingState] = useState({
    shareholderRegistry: false,
    certificateofincorporation: false,
  });

  const [errorMessages, setErrorMessages] = useState({
    shareholderRegistry: "",
    certificateofincorporation: "",
  });

  const acceptedExtensions = ['.jpg', '.jpeg', '.png'];
  const verifyFileTypes = (fileList: any) => {
    const fileName = fileList;
    if (!hasAcceptedExtension(fileName)) {
      return false;
    }
    return true;
  };
  const hasAcceptedExtension = (fileName: string) => {
    const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    return acceptedExtensions.includes(extension);
  };

  const getFileExtension = (uri: string) => {
    return uri?.split('.')?.pop()?.toLowerCase() ?? 'jpg';
  };

  const deleteImages = (fieldName: ImageFieldKey) => {
    setFieldValue(fieldName, "");
    setFileNames(prev => ({ ...prev, [fieldName]: "" }));
    setErrorMessages(prev => ({ ...prev, [fieldName]: "" }));
  };

  const uploadFileToServer = async (uri: string, type: string, fileName: string, fileExtension: string, item: string, setFeilds: (field: string, value: string) => void) => {
    try {
      const formData = new FormData();
      formData.append('document', {
        uri: uri,
        type: `${type}/${fileExtension}`,
        name: fileName,
      } as any);
      const uploadRes = await ProfileService.uploadFile(formData);
      if (uploadRes.status === 200) {
        const uploadedImage = Array.isArray(uploadRes.data) && uploadRes.data.length > 0 ? uploadRes.data[0] : "";
        setFeilds(item, uploadedImage);
        setErrorMessages(prev => ({ ...prev, [item]: "" }));
      } else {
        setErrorMessages(prev => ({ ...prev, [item]: "Upload failed. Please try again." }));
      }
    } catch (error) {
      setErrorMessages(prev => ({ ...prev, [item]: "Upload failed. Please try again." }));
    }
  };
  const handleImageUpload = async (
    item: string,
    setFeilds: (field: string, value: string) => void,
    pickerOption?: 'camera' | 'library' | 'documents'
  ) => {
    setLoadingState(prev => ({ ...prev, [item]: true }));
    setErrorMessages(prev => ({ ...prev, [item]: "" }));

    try {
      if (pickerOption === 'documents') {
        await new Promise(resolve => setTimeout(resolve, 200));
        const result = await DocumentPicker.getDocumentAsync({
          type: ['image/*', 'application/pdf'],
          copyToCacheDirectory: true,
        });

        if (result.canceled) return;
        const selectedFile = result.assets[0];
        const { uri, mimeType, name, size } = selectedFile;
        const fileName = name || uri.split('/').pop() || `file_${Date.now()}`;
        const fileSizeMB = size ? size / (1024 * 1024) : 0;
        if (fileSizeMB > 15) {
          setErrorMessages(prev => ({ ...prev, [item]: "File size must be less than 15MB" }));
          return;
        }
        const isPdf = mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
        const isImage = mimeType?.startsWith('image/') || verifyFileTypes(fileName);
        if (!isPdf && !isImage) {
          setErrorMessages(prev => ({ ...prev, [item]: "Please select a valid image or PDF file" }));
          return;
        }
        setFileNames(prevState => ({ ...prevState, [item]: fileName }));
        const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'pdf';
        const type = isPdf ? 'application' : 'image';
        await uploadFileToServer(uri, type, fileName, fileExtension, item, setFeilds);
        return;
      }

      const permissionResult = pickerOption === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Permission Denied", FORM_DATA_CONSTANTS.ALRET_MSG);
        return;
      }

      const result = pickerOption === 'camera'
        ? await ImagePicker.launchCameraAsync({ allowsEditing: false, aspect: [1, 1], quality: 0.5 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: false, aspect: [1, 1], quality: 0.5, cameraType: ImagePicker.CameraType.front });

      if (result.canceled) return;

      const selectedImage = result.assets[0];
      const { uri, type } = selectedImage;
      const fileName = selectedImage.fileName || uri.split('/').pop() || `image_${Date.now()}.jpg`;
      const fileExtension = getFileExtension(selectedImage.uri);

      if (!verifyFileTypes(fileName)) {
        setErrorMessages(prev => ({ ...prev, [item]: "Please select a valid image file (JPG, JPEG, PNG)" }));
        return;
      }

      const fileSizeMB = selectedImage.fileSize ? selectedImage.fileSize / (1024 * 1024) : 0;
      if (fileSizeMB > 15) {
        setErrorMessages(prev => ({ ...prev, [item]: "File size must be less than 15MB" }));
        return;
      }

      setFileNames(prevState => ({ ...prevState, [item]: fileName }));

      if (uri && type && fileExtension) {
        await uploadFileToServer(uri, type, fileName, fileExtension, item, setFeilds);
      }
    } catch (err) {
      setErrorMessages(prev => ({ ...prev, [item]: "Upload failed. Please try again." }));
    } finally {
      setLoadingState(prev => ({ ...prev, [item]: false }));
    }
  };

  return (
    <ViewComponent>
      {kybRequriments?.toLowerCase()?.replace(/\s+/g, '')?.split(',')?.includes('companyinforamtion')
        && (
          <ViewComponent>
            <ParagraphComponent text={"GLOBAL_CONSTANTS.COMPANY_INFORMATION"} style={[commonStyles.sectionTitle, commonStyles.mb24]} />
            <Field
              touched={touched?.companyName}
              name={FORM_FIELD.COMPANY_NAME}
              label="GLOBAL_CONSTANTS.COMPANY_NAME"
              error={errors?.companyName}
              handleBlur={handleBlur}
              component={InputDefault}
              placeholder={"GLOBAL_CONSTANTS.ENTER_COMPANY_NAME"}
              maxLength={100}
              value={values?.companyName || ''}
              onChange={handleChange(FORM_FIELD.COMPANY_NAME)}
              editable={touched?.companyName ? true : !KybFeildInitialValues?.companyName}
              requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
            />
            <ViewComponent style={commonStyles.formItemSpace} />

            <Field
              touched={touched?.type}
              name={FORM_FIELD.TYPE}
              label="GLOBAL_CONSTANTS.TYPE"
              error={errors?.type}
              handleBlur={handleBlur}
              component={InputDefault}
              placeholder={"GLOBAL_CONSTANTS.ENTER_COMAPANY_TYPE"}
              maxLength={100}
              value={values?.type || ''}
              onChange={handleChange(FORM_FIELD.TYPE)}
              editable={touched?.type ? true : !KybFeildInitialValues?.type}
              requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
            />
            <ViewComponent style={commonStyles.formItemSpace} />

            <Field
              touched={touched?.description}
              name={FORM_FIELD.DESCRIPTION}
              label="GLOBAL_CONSTANTS.DESCRIPTION"
              error={errors?.description}
              handleBlur={handleBlur}
              component={InputDefault}
              placeholder={"GLOBAL_CONSTANTS.ENTER_COMAPANY_DESCRIPTION"}
              maxLength={256}
              value={values?.description || ''}
              onChange={handleChange(FORM_FIELD.DESCRIPTION)}
              editable={touched?.description ? true : !KybFeildInitialValues?.description}
              requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
            />
            <ViewComponent style={commonStyles.formItemSpace} />
            <Field
              name={FORM_FIELD.INDUSTRY}
              label={"GLOBAL_CONSTANTS.INDUSTRY"}
              error={errors.industry}
              touched={touched.industry}
              handleBlur={handleBlur}
              customContainerStyle={{ height: 80 }}
              data={sectors || []}
              placeholder={"GLOBAL_CONSTANTS.SELECT_INDUSTRY"}
              placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
              component={CustomPicker}
              modalTitle={"GLOBAL_CONSTANTS.SELECT_INDUSTRY"}
              customBind={['name']}
              valueField={'name'}
              disabled={touched?.industry ? false : KybFeildInitialValues?.industry}

              onChange={(value: string) => {
                setFieldValue(FORM_FIELD.INDUSTRY, value);
                setFieldTouched(FORM_FIELD.INDUSTRY, true);
              }}
              requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
            />
            <ViewComponent style={commonStyles.formItemSpace} />
            <Field
              touched={touched?.registrationNumber}
              name={FORM_FIELD.REGISTRATION_NUMBER}
              label="GLOBAL_CONSTANTS.REGISTRATION_NUMBER"
              error={errors?.registrationNumber}
              handleBlur={handleBlur}
              component={InputDefault}
              placeholder={"GLOBAL_CONSTANTS.ENTER_REGISTRATION_NUMBER"}
              maxLength={21}
              value={values?.registrationNumber || ''}
              editable={touched?.registrationNumber ? true : !KybFeildInitialValues?.registrationNumber}
              onChange={handleChange(FORM_FIELD.REGISTRATION_NUMBER)}
              requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
            />
            <ViewComponent style={commonStyles.formItemSpace} />

            <Field
              touched={touched?.taxId}
              name={FORM_FIELD.TAX_ID}
              label="GLOBAL_CONSTANTS.TAX_ID"
              error={errors?.taxId}
              handleBlur={handleBlur}
              component={InputDefault}
              placeholder={"GLOBAL_CONSTANTS.ENTER_TAX_ID"}
              maxLength={100}
              value={values?.taxId || ''}
              editable={touched?.taxId ? true : !KybFeildInitialValues?.taxId}

              onChange={handleChange(FORM_FIELD.TAX_ID)}
              requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
            />
            <ViewComponent style={commonStyles.formItemSpace} />

            <Field
              touched={touched?.website}
              name={FORM_FIELD.WEBSITE}
              label="GLOBAL_CONSTANTS.WEB_SITE"
              error={errors?.website}
              handleBlur={handleBlur}
              component={InputDefault}
              placeholder={"GLOBAL_CONSTANTS.ENTER_WEBSITE_URL"}
              maxLength={100}
              value={values?.website || ''}
              editable={touched?.website ? true : !KybFeildInitialValues?.website}

              onChange={handleChange(FORM_FIELD.WEBSITE)}
              requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
            />
            <ViewComponent style={commonStyles.formItemSpace} />

          </ViewComponent>)}

      {kybRequriments?.toLowerCase()?.replace(/\s+/g, '')?.split(',')?.includes('companydocuments') && (<ViewComponent>
        <ParagraphComponent text={"GLOBAL_CONSTANTS.ID_PROOFS"} style={[commonStyles.sectionTitle, commonStyles.mb24]} />
        <FileUpload
          fileLoader={loadingState.certificateofincorporation}
          onSelectImage={(source: any) => {
            setFieldTouched('certificateofincorporation', true);
            handleImageUpload('certificateofincorporation', setFieldValue, source);
          }}
          uploadedImageUri={values?.certificateofincorporation}
          fileName={fileNames?.certificateofincorporation as string}
          errorMessage={errorMessages?.certificateofincorporation || (touched?.certificateofincorporation ? errors?.certificateofincorporation as string : '')}
          deleteImage={() => deleteImages("certificateofincorporation")}
          label={"GLOBAL_CONSTANTS.CERTIFICATE_OF_INCORPORATION"}
          isRequired={true}
          showImageSourceSelector={true}
          subLabel={"GLOBAL_CONSTANTS.PNG_JPG_JPEG_PDF_FILES_ALLOWED"}
        />
        <ViewComponent style={commonStyles.formItemSpace} />

        <FileUpload
          fileLoader={loadingState.shareholderRegistry}
          onSelectImage={(source: any) => {
            setFieldTouched('shareholderRegistry', true);
            handleImageUpload('shareholderRegistry', setFieldValue, source);
          }}
          uploadedImageUri={values?.shareholderRegistry}
          fileName={fileNames?.shareholderRegistry as string}
          errorMessage={errorMessages?.shareholderRegistry || (touched?.shareholderRegistry ? errors?.shareholderRegistry as string : '')}
          deleteImage={() => deleteImages("shareholderRegistry")}
          label={"GLOBAL_CONSTANTS.SHAREHOLDER_REGISTRY"}
          isRequired={true}
          showImageSourceSelector={true}
          subLabel={"GLOBAL_CONSTANTS.PNG_JPG_JPEG_PDF_FILES_ALLOWED"}
        />

        <ViewComponent style={commonStyles.formItemSpace} />
      </ViewComponent>)}
    </ViewComponent>
  );
};
export default CompanyFields;