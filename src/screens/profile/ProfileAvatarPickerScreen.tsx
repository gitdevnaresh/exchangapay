// Imports React and required hooks
import React, { useEffect, useRef, useState } from 'react';
// Imports core React Native components
import { Image, FlatList, ActivityIndicator } from 'react-native';
// Import useNavigation for screen transitions
import { useNavigation } from '@react-navigation/native';
// Imports Redux hooks for state management
import { useDispatch, useSelector } from 'react-redux';
// Imports Redux Thunk types for async actions
import { ThunkDispatch } from 'redux-thunk';
// Imports Redux Action type
import { Action } from 'redux';
import * as ImagePicker from 'expo-image-picker';
import { RootState } from '../../screens/profile/profileTypes';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useActionLogging } from '../../hooks/loggingHook';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';
import { useLngTranslation } from '../../hooks/useLngTranslation';
import AuthService from '../../services/auth';
import { loginAction } from '../../redux/actions/actions';
import { getFileExtension, isErrorDispaly } from '../../utils/helpers';
import ProfileService from '../../services/profile';
import ViewComponent from '../../newComponents/view/view';
import CommonTouchableOpacity from '../../newComponents/touchableComponents/touchableOpacity';
import ButtonComponent from '../../newComponents/buttons/button';
import { showAppToast } from '../../newComponents/ToasterMessages/ShowMessage';
import CameraIcon from '../../assets/mainmenuicons/cameraicon';
import { s } from '../../constants/theme/scale';
import Container from '../../newComponents/container/container';
import PageHeader from '../../newComponents/pageHeader/pageHeader';
import TextMultiLanguage from '../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { PROFILE_URLS } from '../../assets/blobUrls';
import ErrorComponent from '../../newComponents/errorDisplay/errorDisplay';
import ImageSourcePopup from '../../newComponents/fileUpload/fileUploadPopup';
import { checkAppPermissions } from '../../services/mediaPermissionService';
import PermissionModel from '../commonScreens/permissionPopup';

// Avatar list for the avatar sheet
const PREDEFINED_AVATARS = [
  { id: "1", source: { uri:PROFILE_URLS.avatarImage1} },
  { id: "2", source: { uri:PROFILE_URLS.avatarImage2 } },
  { id: "3", source: { uri: PROFILE_URLS.avatarImage3 } },
  { id: "4", source: { uri: PROFILE_URLS.avatarImage4 } },
  { id: "5", source: { uri: PROFILE_URLS.avatarImage5 } },
  { id: "6", source: { uri:PROFILE_URLS.avatarImage6  } },
  { id: "7", source: { uri:  PROFILE_URLS.avatarImage7 } },
  { id: "8", source: { uri: PROFILE_URLS.avatarImage8 } },
];

// Utility to verify allowed file types
const verifyFileTypes = (fileName: string): boolean => {
  const allowedExtensions = ['jpg', 'jpeg', 'png'];
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ext ? allowedExtensions.includes(ext) : false;
};

// Main ProfileUpload component
const ProfileUpload = ({ onError }: any) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const userInfo = useSelector((state: RootState) => state.userReducer?.userDetails);
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, Action>>();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const NEW_COLOR = useThemeColors();
  const { logEvent } = useActionLogging();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { t } = useLngTranslation();
  const REVERSE_NEW_COLOR = useThemeColors(true);
  const reversCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
  const navigation = useNavigation();
  const imageSelectionSheetRef = useRef<any>(null);
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const [permissionModel, setPermissionModel] = useState<boolean>(false);
  const [permissionTitle, setPermissionTitle] = useState<string>('');
  const [permissionMessage, setPermissionMessage] = useState<string>('');

  useEffect(() => {
    setAvatarError("");
    if (userInfo?.imageURL) {
      setProfileImage(userInfo.imageURL);
    }
  }, [userInfo]);

  const updateUserInfo = async () => {
    try {
      const userLoginInfo: any = await AuthService.getMemberInfo();
      dispatch(loginAction(userLoginInfo.data));
    } catch (error) {
      throw isErrorDispaly(error);
    }
  };

  const handleConfirmAvatar = async () => {
    setAvatarError("");
    setBtnLoading(true);
    if (!selectedAvatar) return;

    logEvent('button_press', { screename: 'ProfileUploadComponent', actionName: 'Confirm Avatar', actionObj: { avatarId: selectedAvatar } });

    setIsUploading(true);
    setAvatarError(null);
    if (onError) onError('');

    try {
      const avatarData = PREDEFINED_AVATARS.find(a => a.id === selectedAvatar);
      if (!avatarData) throw new Error("Selected avatar not found.");

      const { uri } = avatarData.source;
      const fileName = uri.split('/').pop() ?? `avatar_${Date.now()}.png`;
      const fileExtension = getFileExtension(uri);
      const formData = new FormData();
      formData.append("document", { uri, type: `image/${fileExtension}`, name: fileName } as any);

      const uploadRes = await ProfileService.uploadProfile(formData);

      if (uploadRes.ok && uploadRes.status === 200) {
        await updateUserInfo();
        showAppToast(t("GLOBAL_CONSTANTS.PROFILE_AVATHAR_UPDATED_SUCCESSFULLY"), "success");
        // FIX: Clear selection state after successful upload
        setBtnLoading(false);
        setSelectedAvatar(null);
      } else {
        setBtnLoading(false);
        throw new Error(isErrorDispaly(uploadRes));
      }
    } catch (err) {
      setBtnLoading(false);
      const errorMessage = isErrorDispaly(err);
      logEvent('error', { screename: 'ProfileUploadComponent', actionName: 'API Exception - handleConfirmAvatar', error: errorMessage });
      setAvatarError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectAvatar = (avatarId: string) => {
    logEvent('button_press', { screename: 'ProfileUploadComponent', actionName: 'Select Avatar', actionObj: { avatarId } });
    setSelectedAvatar(avatarId);
  };


  const handleSelect = (option: 'camera' | 'library') => {
    setAvatarError("");
    imageSelectionSheetRef.current?.close();
    handleImageOption(option);
  };

  const handleImageOption = async (option: 'camera' | 'library') => {
    setAvatarError("");

    try {
const res:any = await checkAppPermissions(option); // or "library"
if (res.showPopup) {
  setPermissionTitle(res.titleKey);
  setPermissionMessage(res.messageKey);
  setTimeout(() => {
    setPermissionModel(true);
  }, 300);
  return;
}
if (!res.allowed) return;
const result = option === 'camera'
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 });
      if (result.canceled || !result.assets || result.assets.length === 0) {
        return; // User canceled or no image selected
      }
      setIsUploading(true);
      setAvatarError(null);
      const selectedImage = result.assets[0];
      const { uri } = selectedImage;
      const fileName = selectedImage.fileName ?? uri.split('/').pop() ?? `image_${Date.now()}.jpg`;
      const fileExtension = getFileExtension(uri);

      if (!verifyFileTypes(fileName)) {
        setAvatarError(t("GLOBAL_CONSTANTS.ACCEPTED_IMAGE_FORMATS"));
      }

      const formData = new FormData();
      formData.append("document", { uri, type: `image/${fileExtension}`, name: fileName } as any);

      const uploadRes = await ProfileService.uploadProfile(formData);
      if (uploadRes.ok && uploadRes.status === 200) {
        await updateUserInfo();
        // FIX: Use the correct toast message for custom image uploads
        showAppToast(t("GLOBAL_CONSTANTS.PROFILE_IMAGE_UPDATED_SUCCESSFULLY"), "success");
      } else {
        setAvatarError(isErrorDispaly(uploadRes));
      }
    } catch (err) {
      const errorMsg = isErrorDispaly(err);
      setAvatarError(errorMsg);
    } finally {
      imageSelectionSheetRef.current?.close?.();
      setIsUploading(false);
    }
  };

  const handleBackPress = () => navigation.goBack();

  const imageSource = profileImage
    ? { uri: profileImage }
    : require("../../assets/imageAssets/default.png");
const handleOpenImageSelectionSheet = () => {
  setAvatarError("");
  imageSelectionSheetRef.current?.open();
};
const closePermissionModel = () => {
  setPermissionModel(false);
}
  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container>
        <PageHeader title={"GLOBAL_CONSTANTS.EDIT_PROFILE_PHOTO"} onBackPress={handleBackPress} />
        {avatarError && <ErrorComponent message={avatarError} screen={true} />}
        <FlatList
          data={PREDEFINED_AVATARS}
          keyExtractor={item => item.id}
          numColumns={4}
          scrollEnabled={!isUploading}
          columnWrapperStyle={{ flexDirection: 'row', gap: 0 }}
          contentContainerStyle={{ gap: 16, paddingBottom: 24, paddingHorizontal: 8 }}
          ListHeaderComponent={
            <ViewComponent>

              <ViewComponent style={[reversCommonStyles.alignCenter, reversCommonStyles.mb16]}>
                <ViewComponent style={[reversCommonStyles.profileUploadImageContainer, { width: s(100), height: s(100) }]}>
                  <CommonTouchableOpacity
                    onPress={handleOpenImageSelectionSheet}
                    disabled={isUploading}
                  >
                    <Image
                      source={imageSource}
                      style={{ width: s(100), height: s(100), borderRadius: s(50) }}
                      resizeMode="cover"
                    />

                    {isUploading && (
                      // FIX: Corrected loader overlay style for perfect centering
                      <ViewComponent
                        style={[
                          commonStyles.alignCenter, // This should handle both align and justify
                          {
                            position: 'absolute',
                            top: 25,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            borderRadius: s(50)
                          }
                        ]}
                      >
                        <ActivityIndicator size="large" color={NEW_COLOR.ICON_YELLOW_LOADER} />
                      </ViewComponent>
                    )}
                    {!isUploading && (
                      <ViewComponent style={reversCommonStyles.profileUploadEditIconContainer}>
                        <CameraIcon width={s(18)} height={s(18)} color={NEW_COLOR.TEXT_GREY} />
                      </ViewComponent>
                    )}
                  </CommonTouchableOpacity>
                </ViewComponent>
              </ViewComponent>
              <ViewComponent style={[commonStyles.sectionGap]} />
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mb8]}>
                <TextMultiLanguage text={"GLOBAL_CONSTANTS.SELECT_AVATAR"} style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite, commonStyles.mr8]} />
                <ViewComponent
                  style={[
                    commonStyles.bgAlwaysWhite, commonStyles.px8, commonStyles.alignCenter,
                    { borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottomRightRadius: 8, borderBottomLeftRadius: 4, minWidth: 38 }
                  ]}
                >
                  <TextMultiLanguage text={"GLOBAL_CONSTANTS.FREE"} style={[commonStyles.fs14, commonStyles.textBlack, commonStyles.fw600]} />
                </ViewComponent>
              </ViewComponent>
              <ViewComponent style={[reversCommonStyles.hLine]} />
            </ViewComponent>
          }
          ListFooterComponent={
            <ViewComponent>
              <ViewComponent style={[reversCommonStyles.sectionGap]} />
              <ButtonComponent
                title={"GLOBAL_CONSTANTS.CONFIRM"}
                onPress={handleConfirmAvatar}
                loading={btnLoading}
                disable={!selectedAvatar || isUploading}
              />
            </ViewComponent>
          }
          renderItem={({ item }) => (
            <CommonTouchableOpacity
              key={item.id}
              onPress={() => handleSelectAvatar(item.id)}
              disabled={isUploading}
              style={[
                reversCommonStyles.avatarSheetItemContainer,
                reversCommonStyles.flex1,
                selectedAvatar === item.id && reversCommonStyles.avatarSheetItemSelected,
              ]}
            >
              <Image source={item.source} style={reversCommonStyles.avatarSheetItemImage} />
            </CommonTouchableOpacity>
          )}
        />
        <ImageSourcePopup
          imageSourceSheetRef={imageSelectionSheetRef}
          onSelectImage={handleSelect} 
        />

      </Container>
        <PermissionModel permissionDeniedContent={permissionMessage} permissionTitle={permissionTitle} closeModel={closePermissionModel} addModelVisible={permissionModel} />
    </ViewComponent>
  );
};

export default ProfileUpload;