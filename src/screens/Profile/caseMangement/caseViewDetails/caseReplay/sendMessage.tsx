import React, { useEffect, useState } from 'react';
import { Field, Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import { isErrorDispaly } from '../../../../../utils/helpers';
import ProfileService from '../../../../../services/profile';
import { s } from '../../../../../constants/theme/scale';
import ErrorComponent from '../../../../../components/Error';
import { commonStyles } from '../../../../../components/CommonStyles';
import { ActivityIndicator, Alert, BackHandler, Image, Keyboard, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Container } from '../../../../../components';
import PageHeader from '../../../../../components/pageHeader/pageHeader';
import DefaultButton from '../../../../../components/DefaultButton';
import LabelComponent from '../../../../../components/Paragraph/label';
import InputDefault from '../../../../../components/DefaultFiat';
import OverlayPopup from '../../../../cards/SelectPopup';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import ParagraphComponent from '../../../../../components/Paragraph/Paragraph';
import { NEW_COLOR, WINDOW_HEIGHT, WINDOW_WIDTH } from '../../../../../constants/theme/variables';
import Ionicons from "react-native-vector-icons/Ionicons";
import AntDesign from 'react-native-vector-icons/AntDesign';
import { downloadImage } from '../../../../../utils/tools';
import { SvgFromUri } from 'react-native-svg';

const messageValidationSchema = Yup.object().shape({
  reply: Yup.string().trim().required("Is Required"),
});

const SendReplay = (props: any) => {
  const navigation = useNavigation<any>();
  const [isSending, setIsSending] = useState<boolean>(false);
  const [attachment, setAttachment] = useState<{ id: string; fileName: string; fileSize: number; localUri: string; } | null>(null);
  const [filePreview, setFilePreview] = useState<{ uri: string; type: string } | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string>("");
  const [loadingState, setLoadingState] = useState<any>({
    attchmentLoadibng: false,
    isPopupVisible: false,
    loadingType: '',
  });
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => { handleBackPress(); return true; }
    );
    return () => backHandler.remove();
  }, []);

  const handleBackPress = () => {
    navigation.goBack();
  };


  const generateUUIDv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Example usage:
  const { item, customerDetails } = props.route.params;
  const handleSendMessage = async (values: any, { resetForm }: any) => {
    setError("");
    setIsSending(true);
    const id = generateUUIDv4();

    try {
      const payload = {
        caseId: customerDetails?.id,
        id: id,
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
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => { handleBackPress(); return true; }
    );
    return () => backHandler.remove();
  }, []);
  const acceptedExtensions = ['.jpg', '.jpeg', '.png'];
  const verifyFileTypes = (fileList) => {
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
  const verifyFileSize = (fileSize: any) => {
    const maxSizeInBytes = 20 * 1024 * 1024;
    return fileSize <= maxSizeInBytes;
  };

  const requestCameraPermission = async () => {
    try {
      const permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.CAMERA
          : PERMISSIONS.ANDROID.CAMERA;

      const result = await request(permission);

      if (result === RESULTS.GRANTED) {
        return true;
      } else if (result === RESULTS.DENIED) {
        Alert.alert("Permission Denied", "Camera access is needed to take a selfie.");
        return false;
      } else if (result === RESULTS.BLOCKED) {
        Alert.alert(
          "Permission Blocked",
          "Please enable camera access in your device settings."
        );
        return false;
      }
    } catch (err) {
      return false;
    }
  };
  const selectImage = async (isCamera?: boolean) => {
    Keyboard.dismiss();
    setLoadingState((prev) => ({
      ...prev,

      loadingType: isCamera ? 'methodOne' : 'methodTwo', // 👈 track type
    }));

    try {
      setError("");
      setLoadingState((prevState) => ({
        ...prevState,
        attchmentLoadibng: true,
      }));
      let result;
      if (isCamera === true) {
        const hasPermission = await requestCameraPermission();

        if (!hasPermission) {
          return;
        } else {
          result = await launchCamera({ mediaType: "photo", cameraType: "back" });

        };
      } else {
        result = await launchImageLibrary({ mediaType: "photo" });

      };


      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const isValid = verifyFileTypes(result.assets[0].fileName);
        const isValidSize = verifyFileSize(result.assets[0].fileSize);
        if (isValid && isValidSize) {
          let formData = new FormData();
          formData.append("document", {
            uri: result.assets[0].uri,
            type: result.assets[0].type,
            name: result.assets[0].fileName,
          });

          const uploadRes = await ProfileService.casesReplyUploadFile(formData);
          if (uploadRes.status === 200) {
            const uploadedFile: any = uploadRes.data;
            console.log(uploadedFile, "uploadedFile")
            if (uploadedFile.id) {
              setAttachment({
                id: uploadedFile.id,
                fileName: uploadedFile.fileName,
                fileSize: result.assets[0].fileSize ?? 0,
                localUri: uploadedFile.url || "",
              });
            }
            setLoadingState((prev) => ({ ...prev, isPopupVisible: false }));

          } else {

            setError(isErrorDispaly(uploadRes));
            setLoadingState((prev) => ({ ...prev, isPopupVisible: false }));

          }
        } else {
          if (!isValid) {
            setError("Accept only jpg or png formate");
          } else if (!isValidSize) {
            setError("Image size should be less than 20MB");
          }

        }
      }
    } catch (err) {
      setError(isErrorDispaly(err));
    } finally {

      setLoadingState((prevState) => ({
        ...prevState,
        attchmentLoadibng: false,
        isPopupVisible: false,
        loadingType: ''
      }));
    }
  };
  const handleOpenFacePopup = () => {
    setLoadingState((prev) => ({ ...prev, isPopupVisible: !loadingState?.isPopupVisible }))
  };
  const handleClosePreview = () => {
    setFilePreview(null);
  };
  const handlePreview = () => {
    if (attachment) {
      setFilePreview({ uri: attachment.localUri, type: 'image' });
    }
  };

  const handleDownload = async (uri: string) => {


    setIsDownloading(true);
    try {
      await downloadImage(uri);
    } catch (e) {
      setError(isErrorDispaly(e));
    } finally {
      setIsDownloading(false);
    }
  };
  return (
    <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps={"handled"}
      >
        <Container style={[commonStyles.container, { flex: 1 }]}>
          <PageHeader title="Send Message" onBackPress={handleBackPress} />

          {error && (
            <ErrorComponent message={error} onClose={() => setError('')} />
          )}

          <Formik
            initialValues={{ reply: '' }}
            validationSchema={messageValidationSchema}
            onSubmit={handleSendMessage}
            enableReinitialize
          >
            {({ handleSubmit, errors }) => {
              return (
                <View style={[commonStyles.flex1, commonStyles.justifyContent]}>

                  <View>
                    <Field
                      name="reply"
                      label="Send Message"
                      error={errors.reply}
                      placeholder="Type your message here"
                      component={InputDefault}
                      inputContainerStyle={{ height: 120 }}
                      inputHeight={120}
                      multiline
                      textArea
                      numberOfLines={5}
                      Children={
                        <LabelComponent
                          text=" *"
                          style={commonStyles.textError}
                        />
                      }
                    />
                    <View style={{ marginTop: s(100) }} />
                    <View>
                      <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={handleOpenFacePopup}
                        disabled={false}
                      >
                        <View >
                          <LabelComponent text={"Upload Attachment"} />
                          <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center", borderRadius: 10,
                            paddingVertical: 14,
                            paddingHorizontal: 14,
                            borderWidth: 1,
                            borderColor: NEW_COLOR.DASHED_BORDER_STYLE,
                            marginBottom: 6,
                            gap: 9, minHeight: 54, backgroundColor: NEW_COLOR.BG_BLACK,
                            borderStyle: "dashed",
                          }}>
                            <Ionicons
                              name="cloud-upload-outline"
                              size={22}
                              color={NEW_COLOR.TEXT_BLACK}
                            />
                            <ParagraphComponent
                              style={[
                                commonStyles.fs16,
                                commonStyles.textBlack,
                                commonStyles.fw500,
                              ]}
                              text={"Upload attachment"}
                              numberOfLines={1}
                            />


                          </View>


                        </View>
                      </TouchableOpacity>
                      <View style={[commonStyles.mb16]} />

                      <View
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {loadingState?.attchmentLoadibng &&
                          <View
                            style={[
                              commonStyles.dflex,
                              commonStyles.alignCenter,
                              commonStyles.justifyCenter,
                              { minHeight: 150 },
                            ]}
                          >
                            <ActivityIndicator
                              size="large"
                              color="#0000ff"
                            />
                          </View>
                        }
                        {(attachment?.localUri) && !loadingState?.attchmentLoadibng && (
                          <TouchableOpacity style={[styles.passport,]}
                            onPress={handlePreview}
                          >
                            <Image

                              style={{ borderRadius: 16, flex: 1, }}
                              overlayColor="#fff"
                              resizeMode="cover"
                              source={{ uri: attachment.localUri }}
                            />
                          </TouchableOpacity>
                        )}
                        {!(attachment?.localUri) && !loadingState?.attchmentLoadibng && (

                          <View style={[styles.passport]}>

                            <SvgFromUri
                              style={[commonStyles.mxAuto, commonStyles.myAuto, { borderRadius: 16, }]}
                              uri={"https://prdexchangapaystorage.blob.core.windows.net/images/uploadicon.svg"}
                              width={s(120)}
                              height={s(120)}
                            />
                          </View>
                        )}
                      </View>

                      <View style={[commonStyles.mb24]} />
                      <View style={[commonStyles.mb24]} />



                    </View>
                  </View>

                  {/* ✅ FIXED BOTTOM BUTTON */}
                  <View style={{ paddingBottom: 20 }}>
                    <DefaultButton
                      title="Send"
                      onPress={handleSubmit}
                      loading={isSending}
                    />
                  </View>

                </View>
              )
            }}
          </Formik>

        </Container>
      </ScrollView>
      <OverlayPopup
        title={"Upload your attachment"}
        isVisible={loadingState?.isPopupVisible}
        handleClose={handleOpenFacePopup}
        methodOne={() => selectImage(true)}
        methodTwo={() => selectImage()}
        lable1={"Upload From Camera"}
        lable2={"Upload From Gallery"}
        colors={NEW_COLOR}
        windowWidth={WINDOW_WIDTH}
        windowHeight={WINDOW_HEIGHT}
        isLoading={loadingState?.attchmentLoadibng} // optional boolean
        loadingType={loadingState?.loadingType}
      />
      <Modal visible={!!filePreview} onRequestClose={handleClosePreview} animationType="slide" transparent={true}>
        <Container style={[commonStyles.container]}>
          <TouchableWithoutFeedback>
            <View style={[commonStyles.screenBg, commonStyles.flex1]}>
              <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap16, commonStyles.mt30]}>
                <AntDesign name="close" size={22} color={NEW_COLOR.TEXT_ALWAYS_WHITE} onPress={handleClosePreview} />
                <TouchableOpacity onPress={() => handleDownload(filePreview?.uri || '')}>
                  <View style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter, { width: s(36), height: s(36) }, commonStyles.bgCard, commonStyles.rounded24]}>
                    {isDownloading ? (
                      <ActivityIndicator size="small" color={NEW_COLOR.TEXT_ALWAYS_WHITE} />
                    ) : (
                      <AntDesign name="download" size={16} color={NEW_COLOR.TEXT_ALWAYS_WHITE} />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
              <View style={[commonStyles.flex1, commonStyles.screenBg, commonStyles.justifyCenter, commonStyles.alignCenter]}>
                {filePreview?.type === 'image' && (
                  <Image
                    source={{ uri: filePreview.uri }}
                    style={{ width: '90%', height: '90%', resizeMode: 'contain' }}
                  />
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Container>
      </Modal>
    </SafeAreaView>

  );
};

export default SendReplay;

const styles = StyleSheet.create({
  SelectStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: NEW_COLOR.DASHED_BORDER_STYLE,
    marginBottom: 6,
    gap: 9, minHeight: 54, backgroundColor: NEW_COLOR.BG_BLACK,
    borderStyle: "dashed",
  },
  passport: { width: '100%', borderRadius: 16, height: 250, borderWidth: 1, borderColor: NEW_COLOR.BORDER_LIGHT, overflow: "hidden" },

})