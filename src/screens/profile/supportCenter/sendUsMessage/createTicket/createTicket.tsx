import { useMemo, useState } from "react";
import Container from "../../../../../newComponents/container/container"
import ViewComponent from "../../../../../newComponents/view/view"
import { useThemeColors } from "../../../../../hooks/useThemeColors";
import { getThemedCommonStyles } from "../../../../../assets/styles/CommonStyles";
import { useNavigation } from "@react-navigation/native";
import PageHeader from "../../../../../newComponents/pageHeader/pageHeader";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Field, Formik } from "formik";
import FormikTextInput from "../../../../../newComponents/textInputComponents/formik/textInput";
import FileUpload from "../../../../../newComponents/fileUpload/fileUpload";
import ButtonComponent from "../../../../../newComponents/buttons/button";
import { useTranslation } from "react-i18next";
import CustomPickerModal from "../../../../../newComponents/pickerComponents/formik/customPicker";
import { s } from "../../../../../constants/theme/scale";
import { isErrorDispaly } from "../../../../../utils/helpers";
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Keyboard } from "react-native";
import ProfileService from "../../../../../services/profile";
import { showAppToast } from "../../../../../newComponents/ToasterMessages/ShowMessage";
import { checkAppPermissions } from "../../../../../services/mediaPermissionService";
import PermissionModel from "../../../../commonScreens/permissionPopup";
import SupportService from "../../../../../services/profile/SupportTicket";
import ErrorComponent from "../../../../../newComponents/errorDisplay/errorDisplay";
import { CreateTickets } from "../interfaces";
import ImageUri from "../../../../../newComponents/imageComponents/image";
import { COMMON_SVG_URLS } from "../../../../../assets/blobUrls";
import TextMultiLanguage from "../../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import { useHardwareBackHandler } from "../../../../../hooks/HardwareBackHandler";
import { CreateTicketSchema } from "../validationSchema";
import ParagraphComponent from "../../../../../newComponents/textComponets/paragraphText/paragraph";


const CreateTicket = () => {
  const NEW_COLOR = useMemo(() => useThemeColors(), []);
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [error, setError] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [attachment, setAttachment] = useState<any>(null);
  const [isPickerActive, setIsPickerActive] = useState<boolean>(false);
  const [permissionModel, setPermissionModel] = useState<boolean>(false);
  const [permissionMessage, setPermissionMessage] = useState<string>("");
  const initialValues: CreateTickets = {
    subject: '',
    priority: '',
    message: ''
  }

  const PriorityList = [
    { name: "Low", value: "Low" },
    { name: "Normal", value: "Normal" },
    { name: "High", value: "High" },
    { name: "Urgent", value: "Urgent" }
  ]
useHardwareBackHandler(() => {
   backArrowButtonHandler();
    return true;
  })
  


  const backArrowButtonHandler = () => {
    navigation.goBack();
  }
  const handleCreateTicket = async (values: CreateTickets) => {
    setError("");
    setIsSending(true);
    try {
      const body = {
        subject: values.subject,
        description: values.message,
        email: "", // Add user email here
        name: "User", // Add user name here
        priority: values.priority,
        attachments: attachment ? [{
          id: attachment.id,
          fileName: attachment.fileName,
          fileSize: attachment.fileSize,
          url: attachment.localUri
        }] : []
      }
      const response = await SupportService.createTicket(body)
      if (response.ok) {
        showAppToast("Ticket created successfully", "success");
       backArrowButtonHandler();
      } else {
        setError(isErrorDispaly(response))
      }
    }
    catch (e) {
      setError(isErrorDispaly(e))
    }
    finally {
      setIsSending(false);
    }
  }
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
        const res = await checkAppPermissions("camera");
        if (res.showPopup) {
          setPermissionMessage("GLOBAL_CONSTANTS.COMMON_PERMISSION_DENIED_MESSAGE");
          setPermissionModel(true);
          return;
        }
        if (!res.allowed) return;

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
              id: Date.now(),
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

  const closePermissionModel = () => {
    setPermissionModel(false);
  }
  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container>
        <PageHeader title={"GLOBAL_CONSTANTS.CREATE_TICKET"} onBackPress={backArrowButtonHandler} />
        {error && <ErrorComponent message={error} screen={true} />}
        <KeyboardAwareScrollView
          contentContainerStyle={[{ flexGrow: 1 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
        >
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap12, commonStyles.mb16]}>
            <ImageUri uri={COMMON_SVG_URLS.alertIcon} height={s(24)} width={s(24)} />
            <TextMultiLanguage text={"GLOBAL_CONSTANTS.TICKET_CREATED_IT_MAY_TAKE_A_MOMENT_TO_APPEAR"} style={[commonStyles.fs14_24, commonStyles.fw400, commonStyles.textGrey, commonStyles.flex1]} />
          </ViewComponent>
          <Formik
            initialValues={initialValues}
            validationSchema={CreateTicketSchema}
            onSubmit={handleCreateTicket}
            enableReinitialize
          >
            {({ handleSubmit, setFieldValue, values, isValid }) => (
              <>
                <ViewComponent style={[commonStyles.flex1, commonStyles.sectionGap]}>
                  <FormikTextInput
                    name="subject"
                    label='GLOBAL_CONSTANTS.SUBJECT'
                    placeholder="GLOBAL_CONSTANTS.ENTER_SUBJECT"
                    autoCapitalize="none"
                    numberOfLines={8}
                    multiline={false}
                    isRequired={true}
                    maxLength={100}
                    onChangeText={(text) => {
                      setFieldValue("subject", text);
                    }}
                  />
                  <ViewComponent style={[commonStyles.mb16]} />
                  <Field
                    name="priority"
                    component={CustomPickerModal}
                    data={PriorityList || []}
                    label="GLOBAL_CONSTANTS.PRIORITY"
                    placeholder="GLOBAL_CONSTANTS."
                    modalTitle="GLOBAL_CONSTANTS.SELECT_PRIORITY"
                    inputCustomStyle={{ borderRadius: s(10) }}
                    sheetHeight={s(500)}
                    searchPlaceholder="GLOBAL_CONSTANTS.SEARCH_PRIORITY"
                    onChange={() => setError("")}
                    isRequired={true}
                  />
                  <ViewComponent style={[commonStyles.mb16]} />
                  <FormikTextInput
                    name="message"
                    label='GLOBAL_CONSTANTS.MESSAGE'
                    placeholder="GLOBAL_CONSTANTS.ENTER_YOUR_MESSAGE_HEAR"
                    autoCapitalize="none"
                    custInput={[commonStyles.inputStyle, commonStyles.textWhite, { textAlignVertical: 'top', height: s(140), padding: s(14) }]}
                    numberOfLines={8}
                    multiline={true}
                    isRequired={true}
                    maxLength={300}
                    onChangeText={(text) => {
                      setFieldValue("message", text);
                    }}
                  />
                  <ViewComponent style={[commonStyles.mb5]} />
                  <ParagraphComponent style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw500, commonStyles.textRight]}>
                    {Math.min(values.message.length, 300)}/300
                  </ParagraphComponent>
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
                  title="GLOBAL_CONSTANTS.CREATE_TICKET"
                  onPress={handleSubmit}
                  loading={isSending}
                  disable={!values.subject?.trim() || !values.priority?.trim() || !values.message?.trim() || !isValid || isSending}
                />
                <ViewComponent style={[commonStyles.mb16]} />
                <ButtonComponent
                  title="GLOBAL_CONSTANTS.CANCEL"
                  onPress={backArrowButtonHandler}
                  solidBackground={true}
                  disable={isSending}
                />
              </>
            )}
          </Formik>
        </KeyboardAwareScrollView>
      </Container>
      <PermissionModel permissionDeniedContent={permissionMessage} closeModel={closePermissionModel} addModelVisible={permissionModel} />
    </ViewComponent>

  )
}

export default CreateTicket