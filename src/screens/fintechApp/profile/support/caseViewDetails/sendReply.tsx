import React, { useCallback, useState } from "react";
import { Alert, Keyboard, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import { v4 as uuidv4 } from 'uuid';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import ViewComponent from "../../../../../components/view/view";
import Container from "../../../../../components/container/container";
import PageHeader from "../../../../../components/pageHeader/pageHeader";
import { isErrorDispaly } from "../../../../../utils/helpers";
import ButtonComponent from "../../../../../components/buttons/button";
import InputDefault from "../../../../../components/textInputComponents/DefaultFiat";
import FileUpload from "../../../../../components/fileUpload/fileUpload";
import ErrorComponent from "../../../../../components/errorDisplay/errorDisplay";
import { showAppToast } from "../../../../../components/toasterMessages/ShowMessage";
import { useLngTranslation } from "../../../../../hooks/languagesHook/useLngTranslation";
import ParagraphComponent from "../../../../../components/textComponets/paragraphText/paragraph";
import ScrollViewComponent from "../../../../../components/scrollView/scrollView";
import { s } from "../../../../../components/theme/scale";
import KeyboardAvoidingWrapper from "../../../../../components/keyboard/keyBoardAvoidingView";
import PermissionModel from "../../../../commonScreens/permissionPopup";
import { checkAppPermissions } from "../../../../../services/mediaPermissionService";
import { ProfilePrimaryServices } from "../../../../../apiServices/profile/primary";

const HTML_REGEX = /<[^>]*>?/g;

const messageValidationSchema = Yup.object().shape({
  reply: Yup.string().trim().required("GLOBAL_CONSTANTS.IS_REQUIRED")
    .test('no-html', "GLOBAL_CONSTANTS.INVALID_CONTENT", value => {
      if (!value) return true;
      return !HTML_REGEX.test(value);
    }),
});

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILE_SIZE = 15 * 1024 * 1024;

interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  localUri: string;
}

const SendReply: React.FC<any> = (props) => {
  const { item, customerDetails, onReplySuccess } = props.route.params;
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const navigation = useNavigation<any>();
  const { t } = useLngTranslation();

  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [sendMessageError, setSendMessageError] = useState<string>('');
  const [permissionModel, setPermissionModel] = useState<boolean>(false);
  const [permissionTitle, setPermissionTitle] = useState<string>('');
  const [permissionMessage, setPermissionMessage] = useState<string>('');

  const handleFileUpload = useCallback(async (source?: 'camera' | 'library' | 'documents') => {
    setUploading(true);
    setSendMessageError('');

    try {
      let pickedAsset: { uri: string; mimeType?: string; fileSize?: number; fileName?: string; } | null = null;

      if (source === 'camera') {
        // Handle camera or library permission (Custom popup only)
        const res: any = await checkAppPermissions('camera'); // or "library"
        if (res.showPopup) {
          setPermissionTitle(res?.titleKey);
          setPermissionMessage("GLOBAL_CONSTANTS.CAMERA_ACCESS_REQUIRED_TO_CAPTURE_UPLOAD_PHOTO");
          setTimeout(() => {
            setPermissionModel(true);
          }, 300);
          return;
        }
        if (!res.allowed) return;

        const result = await ImagePicker.launchCameraAsync({ quality: 0.5 });
        if (!result.canceled) {
          const asset = result.assets[0];
          pickedAsset = { uri: asset.uri, mimeType: asset.mimeType, fileSize: asset.fileSize, fileName: asset.fileName };
        }
      } else if (source === 'library') {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert("Permission Denied", "You need to enable photo library permissions to use this feature.");
          setUploading(false);
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.5, allowsEditing: false, mediaTypes: ImagePicker.MediaTypeOptions.All });
        if (!result.canceled) {
          const asset = result.assets[0];
          pickedAsset = { uri: asset.uri, mimeType: asset.mimeType, fileSize: asset.fileSize, fileName: asset.fileName };
        }
      } else if (source === 'documents') {
        await new Promise(resolve => setTimeout(resolve, 200));
        const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: false, type: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], multiple: false });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const docAsset = result.assets[0];
          pickedAsset = { uri: docAsset.uri, mimeType: docAsset.mimeType, fileSize: docAsset.size, fileName: docAsset.name };
        }
      }

      if (pickedAsset) {
        const { uri, mimeType, fileSize } = pickedAsset;
        const fileName = pickedAsset.fileName ?? uri.split('/').pop();
        if (fileSize && fileSize > MAX_FILE_SIZE) {
          setSendMessageError("File size cannot exceed 15MB.");
          setUploading(false);
          return;
        }
        if (mimeType && !ALLOWED_MIME_TYPES.includes(mimeType)) {
          setSendMessageError("Only PDF, Word, and image files are allowed.");
          setUploading(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", { uri: uri, type: mimeType, name: fileName } as any);

        const uploadRes = await ProfilePrimaryServices.postCasesUploadFiles(formData);
        if (uploadRes.status === 200) {
          const uploadedFile: any = uploadRes.data;
          if (uploadedFile.id) {
            setAttachment({ id: uploadedFile.id, fileName: uploadedFile.fileName, fileSize: fileSize ?? 0, localUri: uri });
          }
        } else {
          setSendMessageError(isErrorDispaly(uploadRes));
        }
      }
    } catch (err) {
      setSendMessageError(isErrorDispaly(err));
    } finally {
      setUploading(false);
    }
  }, []);

  const closePermissionModel = useCallback(() => {
    setPermissionModel(false);
  }, []);

  const deleteAttachment = useCallback(() => setAttachment(null), []);

  const handleSendMessage = useCallback(async (values: { reply: string }, { resetForm }: any) => {
    Keyboard.dismiss();
    setIsSending(true);
    setSendMessageError('');
    try {
      const payload = {
        caseId: customerDetails?.id,
        id: uuidv4(),
        docunetDetailId: item?.id,
        repositories: attachment ? [{ id: attachment.id, fileName: attachment.fileName, fileSize: attachment.fileSize, state: "submitted", uid: `__AUTO__${Date.now()}_0__` }] : [],
        reply: values.reply,
        repliedBy: customerDetails?.commonModel.Name,
        repliedDate: new Date().toISOString(),
        isCustomer: true,
        path: null,
        status: null,
        info: null,
        customerId: customerDetails?.id,
      };
      const response = await ProfilePrimaryServices.sendCaseReply(item?.id, payload);
      if (response.ok) {
        resetForm();
        setAttachment(null);
        showAppToast(t("GLOBAL_CONSTANTS.REPLY_SUCCESS_MESSAGE"), 'success');
        onReplySuccess();
        navigation.goBack();
      } else {
        setSendMessageError(isErrorDispaly(response));
      }
    } catch (error) {
      setSendMessageError(isErrorDispaly(error));
    } finally {
      setIsSending(false);
    }
  }, [attachment, customerDetails, item, navigation, onReplySuccess, t]);

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container style={[commonStyles.container, commonStyles.flex1]}>
        <PageHeader title={"GLOBAL_CONSTANTS.SEND_MESSAGE"} onBackPress={() => navigation.goBack()} />
        <KeyboardAvoidingWrapper
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={s(64)}
        >
          <ScrollViewComponent
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Formik
              initialValues={{ reply: '' }}
              validationSchema={messageValidationSchema}
              onSubmit={handleSendMessage}
              enableReinitialize
            >
              {({ handleSubmit, touched, errors, setFieldValue, handleBlur }) => (
                <ViewComponent style={[commonStyles.flex1]}>
                  <ViewComponent style={[commonStyles.flex1]}>
                    {sendMessageError && <ErrorComponent message={sendMessageError} onClose={() => setSendMessageError('')} />}
                    <Field
                      component={InputDefault}
                      name="reply"
                      label={"GLOBAL_CONSTANTS.SEND_MESSAGE"}
                      placeholder={"GLOBAL_CONSTANTS.TYPE_YOUR_MESSAGE_HERE"}
                      touched={touched.reply}
                      custInput={{ height: s(300) }}
                      error={errors.reply}
                      handleBlur={handleBlur}
                      multiline={true}
                      textAlignVertical="top"
                      numberOfLines={4}
                      requiredMark={<ParagraphComponent text=" *" style={commonStyles.textError} />}
                    />
                    {/* <TextInput
                      placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                      style={[commonStyles.input, commonStyles.pt8, { height: s(120), marginRight: s(4) }]}
                      onChange={() => { setFieldValue }}
                      error={errors.reply}
                      multiline
                      textAlignVertical="top"
                      numberOfLines={6}
                      handleBlur={handleBlur}
                      placeholder="Enter your text here"
                    /> */}
                    <ViewComponent style={[commonStyles.formItemSpace]} />
                    <FileUpload
                      label={"GLOBAL_CONSTANTS.ATTACHMENT"}
                      fileLoader={uploading}
                      onSelectImage={handleFileUpload}
                      uploadedImageUri={attachment?.localUri}
                      fileName={attachment?.fileName}
                      deleteImage={deleteAttachment}
                      showImageSourceSelector={true}
                      subLabel={"GLOBAL_CONSTANTS.PDF_DOC"}
                    />
                  </ViewComponent>
                  <ViewComponent style={[commonStyles.sectionGap]} />
                  <ViewComponent style={[commonStyles.sectionGap]}>
                    <ButtonComponent title={"GLOBAL_CONSTANTS.SEND"} onPress={handleSubmit} loading={isSending} customButtonStyle={[{ backgroundColor: NEW_COLOR.TEXT_RED }]} />
                    <ViewComponent style={[commonStyles.buttongap]} />
                    <ButtonComponent title={"GLOBAL_CONSTANTS.CANCEL"} onPress={() => navigation.goBack()} solidBackground={true} />
                  </ViewComponent>
                </ViewComponent>
              )}
            </Formik>
          </ScrollViewComponent>
        </KeyboardAvoidingWrapper>
        <PermissionModel permissionDeniedContent={permissionMessage} closeModel={closePermissionModel} title={permissionTitle} addModelVisible={permissionModel} />
      </Container>
    </ViewComponent>
  );
};

export default SendReply;

