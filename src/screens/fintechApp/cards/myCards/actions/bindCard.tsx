import React, { useState } from "react";
import { Field, Formik } from "formik";
import { Alert, View } from "react-native";
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import ViewComponent from "../../../../../components/view/view";
import TextMultiLangauge from "../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ButtonComponent from "../../../../../components/buttons/button";
import LabelComponent from "../../../../../components/textComponets/lableComponent/lable";
import ParagraphComponent from "../../../../../components/textComponets/paragraphText/paragraph";
import InputDefault from "../../../../../components/textInputComponents/DefaultFiat";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import FileUpload from "../../../../../components/fileUpload/fileUpload";
import ProfileService from "../../../../../apiServices/profile";
import * as ImagePicker from 'expo-image-picker';
import { QuickLinkSchema } from "../../schema";
interface CardActionsSheetBindCardProps {
  bindCardPost: (values: any) => void;
  buttonLoader: boolean;
  bindCardInfo: any;
  envelopeNoRequired?: boolean;
  CardsInfoData?: any
}

const CardActionsSheetBindCard: React.FC<CardActionsSheetBindCardProps> = ({
  bindCardPost,
  buttonLoader,
  bindCardInfo
}) => {
  const bindcardValues = {
    cardNumber: "",
    envelopNumber: "",
    handHoldingIDPhoto: "",
  };
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [fileNames, setFileNames] = useState({ handHoldingIDPhoto: "" });
  const [loadingState, setLoadingState] = useState({ handHoldingIDPhoto: false });

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

  const handleImageUpload = async (fieldName: string, setFieldValue: any, pickerOption?: 'camera' | 'library') => {
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
          Alert.alert("Error", "File size exceeds the 2MB limit.");
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

  const deleteImages = (fieldName: string, setFieldValue: any) => {
    setFieldValue(fieldName, "");
    setFileNames((prev) => ({ ...prev, [fieldName]: "" }));
  };
  return (
    <KeyboardAwareScrollView
      contentContainerStyle={[{ flexGrow: 1 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      enableOnAndroid={true}
    >
      <Formik
        initialValues={bindcardValues}
        onSubmit={bindCardPost}
        validationSchema={() => QuickLinkSchema(bindCardInfo)}
        validateOnBlur={false}
        validateOnChange={false}
      >
        {(formik) => {

          const { touched, handleSubmit, errors, setFieldValue, handleChange, handleBlur, values } = formik;
          return (
            <>
              <Field
                touched={touched.cardNumber}
                name="cardNumber"
                label={"GLOBAL_CONSTANTS.LINK_CARD_NUMBER"}
                value={values.cardNumber}
                error={errors.cardNumber}
                handleBlur={handleBlur}
                customContainerStyle={{}}
                onChangeText={(val: any) => {
                  if (val.match(/[0-9/]/)) {
                    handleChange("cardNumber")(val);
                  }
                }}
                placeholder={"GLOBAL_CONSTANTS.ENTER_CARD_NUMBER"}
                keyboardType={"decimal-pad"}
                autoCapitalize="words"
                component={InputDefault}
                maxLength={16}
                requiredMark={<LabelComponent style={[commonStyles.textRed]} text=" *" />}
              />
              {bindCardInfo?.envelopeNoRequired && (
                <>
                  <ViewComponent style={[commonStyles.sectionGap]} />
                  <LabelComponent
                    text={"GLOBAL_CONSTANTS.ENVOLOP_NUMBER"}
                    style={commonStyles.mb8}
                  />
                  <ViewComponent style={[commonStyles.relative]}>
                    <Field
                      activeOpacity={0.9}
                      touched={touched.envelopNumber}
                      name="envelopNumber"
                      label={undefined}
                      error={errors.envelopNumber}
                      handleBlur={handleBlur}
                      onChangeText={handleChange("envelopNumber")}
                      customContainerStyle={{
                        height: 80,
                      }}
                      placeholder={"GLOBAL_CONSTANTS.ENTER_ENVOLOP_NUMBER"}
                      component={InputDefault}
                      requiredMark={<LabelComponent style={[commonStyles.textRed]} text=" *" />}
                    />
                  </ViewComponent>
                </>
              )}
              <ViewComponent />
              <ViewComponent style={[commonStyles.formItemSpace]} />
              <ViewComponent
                style={[
                  commonStyles.dflex,
                  commonStyles.alignCenter,
                  commonStyles.justifyContent,
                ]}
              >
                <TextMultiLangauge
                  style={[
                    commonStyles.listsecondarytext
                  ]}
                  text={"GLOBAL_CONSTANTS.LINKING_CARD_NUMBER"}
                />
                <ParagraphComponent
                  style={[
                    commonStyles.listprimarytext
                  ]}
                  text={bindCardInfo?.name ?? "--"}
                />
              </ViewComponent>
              <ViewComponent style={[commonStyles.sectionGap]} />
              {bindCardInfo?.needPhotoForActiveCard && (
                <ViewComponent>
                  <FileUpload
                    fileLoader={loadingState.handHoldingIDPhoto}
                    onSelectImage={(source) => handleImageUpload("handHoldingIDPhoto", setFieldValue, source)}
                    uploadedImageUri={values?.handHoldingIDPhoto}
                    deleteImage={() => deleteImages("handHoldingIDPhoto", setFieldValue)}
                    fileName={fileNames?.handHoldingIDPhoto}
                    errorMessage={errors.handHoldingIDPhoto}
                    label={"GLOBAL_CONSTANTS.UPLOAD_YOUR_HAND_HOLD_PHOTO_ID_20MB"}
                    isRequired={true}
                    showImageSourceSelector={true}
                  />
                </ViewComponent>
              )}
              <ViewComponent style={[commonStyles.sectionGap]} />

              <ViewComponent style={[commonStyles.sectionBordered, commonStyles.borderDashed]}>
                <ViewComponent
                  style={[
                    commonStyles.dflex,
                    commonStyles.alignCenter,
                    commonStyles.justifyContent,
                    commonStyles.mb4,
                  ]}
                >
                  <TextMultiLangauge
                    style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]}
                    text={"GLOBAL_CONSTANTS.INSTRUCTIONS"}
                  />
                </ViewComponent>
                <TextMultiLangauge
                  style={[
                    commonStyles.fs14,
                    commonStyles.fw600,
                    commonStyles.textGrey2,
                    commonStyles.flex1,
                    commonStyles.titleSectionGap,
                  ]}
                  text={"GLOBAL_CONSTANTS.QUICK_CARD_LINKING"}
                />


                <TextMultiLangauge
                  style={[
                    commonStyles.fs12,
                    commonStyles.fw400,
                    commonStyles.textGrey,
                    commonStyles.flex1,
                    commonStyles.mb10,
                  ]}
                  text={"GLOBAL_CONSTANTS.INSTRRUVTION_POINT_1"}
                />
                <TextMultiLangauge
                  style={[
                    commonStyles.fs12,
                    commonStyles.fw400,
                    commonStyles.textGrey,
                    commonStyles.flex1,
                  ]}
                  text={"GLOBAL_CONSTANTS.INSTRRUVTION_POINT_2"}
                />
              </ViewComponent>
              <ViewComponent style={[commonStyles.mb43]} />
              <ButtonComponent
                title={"GLOBAL_CONSTANTS.SUBMIT"}
                style={undefined}
                loading={buttonLoader}
                disable={undefined}
                onPress={handleSubmit}
              />
              <View style={[commonStyles.mb43]} />
            </>
          );
        }}
      </Formik></KeyboardAwareScrollView>
  );
};

export default CardActionsSheetBindCard;
