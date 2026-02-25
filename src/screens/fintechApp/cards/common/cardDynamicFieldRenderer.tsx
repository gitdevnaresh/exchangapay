import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Field } from 'formik';
import * as ImagePicker from 'expo-image-picker';
import ViewComponent from '../../../../components/view/view';
import InputDefault from '../../../../components/textInputComponents/DefaultFiat';
import FileUpload from '../../../../components/fileUpload/fileUpload';
import LabelComponent from '../../../../components/textComponets/lableComponent/lable';
import ProfileService from '../../../../apiServices/profile';
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import Loadding from '../../../../components/skelton/skeltons';
import { t } from 'i18next';
import MonthYearPicker from '../../../../components/datePickers/CustomMonthYearPicker';

interface DynamicField {
  field: string;
  label: string;
  fieldType: string;
  isMandatory: string | boolean;
  maxLength?: number;
}

interface CardDynamicFieldRendererProps {
  fields: DynamicField[];
  values: any;
  errors: any;
  touched: any;
  setFieldValue: (field: string, value: any) => void;
  handleChange: (field: string) => (value: string) => void;
  handleBlur?: (field: string) => void;
  getPlaceholder?: (fieldName: string) => string;
  isLoading?: boolean;
}

const CardDynamicFieldRenderer: React.FC<CardDynamicFieldRendererProps> = ({
  fields,
  values,
  errors,
  touched,
  setFieldValue,
  handleChange,
  handleBlur,
  getPlaceholder,
  isLoading = false
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [fileNames, setFileNames] = useState<{ [key: string]: string }>({});
  const [loadingState, setLoadingState] = useState<{ [key: string]: boolean }>({});
  const defaultGetPlaceholder = (fieldName: string) => {
    const placeholders: { [key: string]: string } = {
      cardnumber: "GLOBAL_CONSTANTS.ENTER_CARD_NUMBER",
      envelopenumber: "GLOBAL_CONSTANTS.ENTER_ENVELOPE_NUMBER",
      expirydate: t("GLOBAL_CONSTANTS.ENTER_EXPIRY_DATE_MM_YY"),
      cvv: "GLOBAL_CONSTANTS.ENTER_CVV",
      cardholdername: "GLOBAL_CONSTANTS.ENTER_CARD_HOLDER_NAME",
      cardexpirydate: "GLOBAL_CONSTANTS.ENTER_CARD_EXPIRY_DATE_MM_YY",
      cardlastfourdigits: t("GLOBAL_CONSTANTS.ENTER_LAST_FOUR_DIGITS"),
      linkcardnumber: "GLOBAL_CONSTANTS.ENTER_LINKING_CARD_NUMBER",
    };
    return placeholders[fieldName.toLowerCase()] || `GLOBAL_CONSTANTS.ENTER ${fieldName}`;
  };

  const verifyFileSize = (fileSize: any) => {
    const maxSizeInBytes = 15 * 1024 * 1024; // 15MB
    return fileSize <= maxSizeInBytes;
  };

  const getFileExtension = (uri: string) => {
    return uri?.split('.')?.pop()?.toLowerCase() ?? 'jpg';
  };

  const verifyFileTypes = (fileName: string) => {
    const acceptedExtensions = ['.jpg', '.jpeg', '.png'];
    const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    return acceptedExtensions.includes(extension);
  };

  const handleImageUpload = async (fieldName: string, pickerOption?: 'camera' | 'library' | 'documents') => {
    setLoadingState((prev) => ({ ...prev, [fieldName]: true }));

    try {
      const permissionResult =
        pickerOption === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Permission Denied", "You need to enable permissions to use this feature.");
        setLoadingState(prev => ({ ...prev, [fieldName]: false }));
        return;
      }

      const result =
        pickerOption === 'camera'
          ? await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            aspect: [4, 3],
            quality: 0.5,
          })
          : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            aspect: [4, 3],
            quality: 0.5,
          });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        const { uri, type, fileSize } = asset;

        if (!verifyFileSize(fileSize)) {
          Alert.alert("Error", "File size exceeds the 15MB limit.");
          setLoadingState((prev) => ({ ...prev, [fieldName]: false }));
          return;
        }

        const localFileName = asset.fileName ?? uri.split('/').pop() ?? `image_${Date.now()}.jpg`;
        const fileExtension = getFileExtension(asset.uri);

        if (!verifyFileTypes(localFileName)) {
          Alert.alert("Error", "Invalid file type. Only JPG, JPEG, and PNG are allowed.");
          setLoadingState((prev) => ({ ...prev, [fieldName]: false }));
          return;
        }

        setFileNames((prevState) => ({
          ...prevState,
          [fieldName]: localFileName,
        }));

        let formDataInstance = new FormData();
        formDataInstance.append('document', {
          uri: asset.uri,
          type: `${type || 'image'}/${fileExtension}`,
          name: localFileName,
        } as any);

        const uploadRes: any = await ProfileService.uploadFile(formDataInstance);

        if (uploadRes.status === 200) {
          const imageUrl = uploadRes.data?.[0] || "";
          setFieldValue(fieldName, imageUrl);
        } else {
          Alert.alert("Error", "Failed to upload the image.");
        }
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while uploading the image.");
    } finally {
      setLoadingState((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const createSkeletonFields = () => {
    return fields.map((field, index) => ({
      field: `skeleton_${field.field}_${index}`,
      label: field.label || `Field ${index + 1}`,
      fieldType: field.fieldType || "text",
      isMandatory: field.isMandatory || false
    }));
  };

  const deleteImages = (fieldName: string) => {
    setFieldValue(fieldName, "");
    setFileNames((prev) => ({ ...prev, [fieldName]: "" }));
  };

  if (isLoading) {
    return <Loadding contenthtml={createSkeletonFields()} />;
  }
  return (
    <>
      {fields?.map((field) => (
        <ViewComponent key={field.field} style={[commonStyles.formItemSpace]}>
          {field.fieldType === "date" ? (

            <MonthYearPicker
              label={field.label}
              value={values[field.field]}
              onDateChange={(date) => setFieldValue(field.field, date)}
              error={touched[field.field] && errors[field.field] ? errors[field.field] : undefined}
              isRequired={field.isMandatory === "true" || field.isMandatory === true}
              placeholder={(getPlaceholder || defaultGetPlaceholder)(field.field)}
              touched={touched[field.field]}
            />
          ) : field.fieldType === "upload" ? (
            <FileUpload
              fileLoader={loadingState[field.field]}
              onSelectImage={(source) => handleImageUpload(field.field, source)}
              uploadedImageUri={values[field.field]}
              fileName={fileNames[field.field]}
              errorMessage={touched[field.field] && errors[field.field]}
              deleteImage={() => deleteImages(field.field)}
              label={field.label}
              isRequired={field.isMandatory === "true" || field.isMandatory === true}
              showImageSourceSelector={true}
            />
          ) : (
            <Field
              touched={touched[field.field]}
              name={field.field}
              label={field.label}
              component={InputDefault}
              value={values[field.field]}
              error={touched[field.field] && errors[field.field] ? errors[field.field] : undefined}
              onChangeText={handleChange(field.field)}
              handleBlur={handleBlur}
              maxLength={field.maxLength}
              keyboardType={field.fieldType === "numeric" ? "numeric" : "default"}
              placeholder={(getPlaceholder || defaultGetPlaceholder)(field.field)}
              requiredMark={
                (field.isMandatory === "true" || field.isMandatory === true) ?
                  <LabelComponent style={[commonStyles.textRed]} text=" *" /> : null
              }
            />
          )}
        </ViewComponent>
      ))}
    </>
  );
};

export default CardDynamicFieldRenderer;