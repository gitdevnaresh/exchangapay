import React, { useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {  Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../../assets/styles/CommonStyles';
import { useLngTranslation } from '../../../../../hooks/useLngTranslation';
import { isErrorDispaly } from '../../../../../utils/helpers';
import ProfileService from '../../../../../services/profile';
import { showAppToast } from '../../../../../newComponents/ToasterMessages/ShowMessage';
import ViewComponent from '../../../../../newComponents/view/view';
import Container from '../../../../../newComponents/container/container';
import PageHeader from '../../../../../newComponents/pageHeader/pageHeader';
import FileUpload from '../../../../../newComponents/fileUpload/fileUpload';
import ButtonComponent from '../../../../../newComponents/buttons/button';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useHardwareBackHandler } from '../../../../../hooks/HardwareBackHandler';
import FormikTextInput from '../../../../../newComponents/textInputComponents/formik/textInput';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { v4 as uuidv4 } from 'uuid';
import { s } from '../../../../../constants/theme/scale';
import ErrorComponent from '../../../../../newComponents/errorDisplay/errorDisplay';
import { checkAppPermissions } from '../../../../../services/mediaPermissionService';
import PermissionModel from '../../../../commonScreens/permissionPopup';

const messageValidationSchema = Yup.object().shape({
  reply: Yup.string().trim().required(""),
});

const SendReplay = (props: any) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { t } = useLngTranslation();
  const navigation = useNavigation<any>();
  const [isSending, setIsSending] = useState<boolean>(false);
  const [attachment, setAttachment] = useState<{ id: string; fileName: string; fileSize: number; localUri: string; } | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [isPickerActive, setIsPickerActive] = useState<boolean>(false);
  const [permissionModel, setPermissionModel] = useState<boolean>(false);
  const [permissionTitle, setPermissionTitle] = useState<string>('');
  const [permissionMessage, setPermissionMessage] = useState<string>('');
  const { item, customerDetails } = props.route.params;
  const [error, setError] = useState<string>("");

  useHardwareBackHandler(() => {
    setError("");
    handleBackPress();
    return true;
  });

  const handleBackPress = () => {
    navigation.goBack();
  };
  const closePermissionModel = () => {
    setPermissionModel(false);
  };

  const handleFileUpload = async (source?: 'camera' | 'library' | 'documents') => {
    setError("");
    if (isPickerActive) {
      showAppToast('Please wait, file picker is already open.', 'warning');
      return;
    } 
    setUploading(true);
    setIsPickerActive(true);
    Keyboard.dismiss();

    try {
      let pickedAsset: { uri: string; mimeType?: string; fileSize?: number; fileName?: string; } | null = null;

      if (source === 'camera') {
        const res = await checkAppPermissions('camera');
        if (res.showPopup) {
          setPermissionTitle(res.titleKey!);
          setPermissionMessage("GLOBAL_CONSTANTS.CAMERA_ACCESS_REQUIRED_TO_CAPTURE_UPLOAD_PHOTO");
          setPermissionModel(true);
          setUploading(false);
          setIsPickerActive(false);
          return;
        }
        if (!res.allowed) {
          setUploading(false);
          setIsPickerActive(false);
          return;
        }
        const result = await ImagePicker.launchCameraAsync({ quality: 0.5 });
        if (!result.canceled) {
          const asset = result?.assets[0];
          pickedAsset = {
            uri: asset?.uri,
            mimeType: asset?.mimeType || undefined,
            fileSize: asset?.fileSize || undefined,
            fileName: asset?.fileName || undefined,
          };
        }
      } else if (source === 'library' || source === 'documents') {
        try {
          // Add delay and disable cache to prevent iOS crashes
          await new Promise(resolve => setTimeout(resolve, 200));        
          const result = await DocumentPicker.getDocumentAsync({
            copyToCacheDirectory: false, // Disable cache to prevent crashes
            type: [
              'image/*',
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ],
            multiple: false,
          });

          if (!result.canceled && result.assets && result.assets.length > 0) {
            const docAsset = result.assets[0];
            pickedAsset = {
              uri: docAsset.uri,
              mimeType: docAsset.mimeType,
              fileSize: docAsset.size,
              fileName: docAsset.name,
            };
          } else if (!result.canceled && result.type === 'success') {
            const docAsset = result.assets[0];
            pickedAsset = {
              uri: docAsset.uri,
              mimeType: docAsset.mimeType,
              fileSize: docAsset.size,
              fileName: docAsset.name,
            };
          }
        } catch (docError) {
     setTimeout(() => {
            setError('Failed to open file picker. Please try again.');
          }, 200);
          setUploading(false);
          return;
        }
      }

      if (pickedAsset) {
        const { uri, mimeType, fileSize } = pickedAsset;
        let fileName = pickedAsset.fileName ?? uri.split('/').pop();
        
        // Fix double extension issue by sanitizing filename
        if (fileName) {
          const lastDotIndex = fileName.lastIndexOf('.');
          if (lastDotIndex !== -1) {
            const extension = fileName.substring(lastDotIndex + 1).toLowerCase();
            const nameWithoutExt = fileName.substring(0, lastDotIndex);
            // Replace all dots in the name part with underscores to avoid double extension error
            const sanitizedName = nameWithoutExt.replace(/\./g, '_');
            fileName = `${sanitizedName}.${extension}`;
          }
        }
        
        const maxSizeInBytes = 15 * 1024 * 1024; // 15MB
        if (fileSize && fileSize > maxSizeInBytes) {
          setError("File size cannot exceed 15MB.");
          setUploading(false);
          return;
        }

        const allowedMimeTypes = [
          'image/jpeg', 'image/png',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (mimeType && !allowedMimeTypes.includes(mimeType)) {
          setError("Only PDF, Word, Excel, and image files are allowed.");
          setUploading(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", { uri, type: mimeType, name: fileName } as any);

        const uploadRes = await ProfileService.casesReplyUploadFile(formData);

        if (uploadRes.status === 200) {
          const uploadedFile: any = uploadRes.data;

          if (uploadedFile.id) {
            setAttachment({
              id: uploadedFile.id,
              fileName: uploadedFile.fileName,
              fileSize: fileSize ?? 0,
              localUri: uploadedFile.url || uri,
            });
          }
        } else {
          setError(isErrorDispaly(uploadRes));
        }
      }
    } catch (err) {
      setError(isErrorDispaly(err));
    } finally {
      setUploading(false);
      setIsPickerActive(false);
    }
  };

  const deleteAttachment = () => {
    setAttachment(null);
  };

  const handleSendMessage = async (values: any, { resetForm }: any) => {
    setError("");
    setIsSending(true);
    try {
      const payload = {
        caseId: customerDetails?.caseId,
        id: uuidv4(),
        docunetDetailId: item?.id,
        repositories: attachment ? [{
          id: attachment.id,
          fileName: attachment.fileName,
          fileSize: attachment.fileSize,
          state: "submitted",
          uid: `__AUTO__${Date.now()}_0__`
        }] : [],
        reply: values.reply,
        repliedBy: customerDetails?.commonModel?.Name,
        repliedDate: new Date().toISOString(),
        isCustomer: true,
        path: null,
        status: null,
        info: null,
        customerId: customerDetails?.id,
      };

      const response = await ProfileService.sendCaseReply(item?.id, payload);

      if (response.ok) {
        resetForm();
        setAttachment(null);
        showAppToast(t("GLOBAL_CONSTANTS.REPLY_SUCCESS_MESSAGE"), 'success');
        // Navigate back with refresh flag
        navigation.navigate('CaseViewDetails', {
          ...props.route.params,
          refresh: true,
          refreshTimestamp: Date.now(),
          animation: 'slide_from_left',
          screenName: props?.route?.params?.screenName
        });
      } else {
        setError(isErrorDispaly(response));
      }
    } catch (error) {
      setError(isErrorDispaly(error));
    } finally {
      setIsSending(false);
    }
  };
  useHardwareBackHandler(() => {
    handleBackPress();
    return true;
  });
  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container style={[commonStyles.sectionGap, commonStyles.flex1]}>
        <PageHeader title="GLOBAL_CONSTANTS.SEND_MESSAGE" onBackPress={handleBackPress} />
        {error&&<ErrorComponent message={error} screen={true}/>}
        <KeyboardAwareScrollView
          contentContainerStyle={[{ flexGrow: 1 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
        >

          <Formik
            initialValues={{ reply: '' }}
            validationSchema={messageValidationSchema}
            onSubmit={handleSendMessage}
            enableReinitialize
          >
            {({ handleSubmit, setFieldValue, values, isValid }) => (
              <>
                <ViewComponent style={[commonStyles.flex1, commonStyles.sectionGap]}>
                  <FormikTextInput
                    name="reply"
                    label='GLOBAL_CONSTANTS.SEND_MESSAGE'
                    placeholder="GLOBAL_CONSTANTS.TYPE_YOUR_MESSAGE_HERE"
                    autoCapitalize="none"
                    custInput={[commonStyles.inputStyle, commonStyles.textWhite, { textAlignVertical: 'top', height: s(140),padding:s(14) }]}                 
                    numberOfLines={8}
                    multiline={true}
                    isRequired={true}
                    maxLength={256}
                    onChangeText={(text) => {
                      setFieldValue("reply", text);
                    }}
                  />
                  <ViewComponent style={[commonStyles.mb16]} />

                  <FileUpload
                    label={t("GLOBAL_CONSTANTS.ATTACHMENT")}
                    fileLoader={uploading}
                    onSelectImage={handleFileUpload}
                    uploadedImageUri={attachment?.localUri}
                    fileName={attachment?.fileName}
                    deleteImage={deleteAttachment}
                    showImageSourceSelector={true}
                    iconColor={NEW_COLOR.TEXT_WHITE}
                  />

                  <ViewComponent />
                </ViewComponent>

                <ButtonComponent
                  title="GLOBAL_CONSTANTS.CASE_SEND"
                  onPress={handleSubmit}
                  loading={isSending}
                  disable={!values.reply?.trim() || !isValid || isSending}
                />
              </>
            )}
          </Formik>
        </KeyboardAwareScrollView>
      </Container>
      <PermissionModel 
        permissionDeniedContent={permissionMessage} 
        permissionTitle={permissionTitle} 
        closeModel={closePermissionModel} 
        addModelVisible={permissionModel} 
      />
    </ViewComponent>
  );
};

export default SendReplay;