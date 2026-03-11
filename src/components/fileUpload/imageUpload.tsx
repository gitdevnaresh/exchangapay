import React, { useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import ProfileService from '../../apiServices/profile';
import AuthService from '../../apiServices/onBoarding/auth';
import { ms, screenHeight, s } from '../../constants/styels/scale';
import { useDispatch, useSelector } from 'react-redux';
import { getThemedCommonStyles } from '../CommonStyles';
import * as ImagePicker from 'expo-image-picker';
import Loadding from '../skelton/skeltons';
import { loginAction } from '../../redux/actions/actions';
import CustomRBSheet from '../models/commonBottomSheet';
import { getFileExtension } from '../../screens/fintechApp/onboarding/constants';
import { profileImageSkelton } from '../../skeletons/skeleton_views';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import GalleryIcon from '../svgIcons/mainmenuicons/galleryicon';
import Feather from 'react-native-vector-icons/Feather';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';
import ViewComponent from '../view/view';
import TextMultiLanguage from '../textComponets/multiLanguageText/textMultiLangauge';
import PermissionModel from '../../screens/commonScreens/permissionPopup';
import { checkAppPermissions } from '../../services/mediaPermissionService';


const ProfileUpload = ({ onError }: any) => {
  const [profileImage, setProfileImage] = useState(null);
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const dispatch = useDispatch();
  const [imgLoader, setImageLoader] = useState(false);
  const profileImgUpldSk = profileImageSkelton();
  const imageSelectionSheetRef = useRef<any>(null);
  const [imageSelectionModalVisible, setImageSelectionModalVisible] = useState<boolean>(false);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [permissionModel, setPermissionModel] = useState<boolean>(false);
  const [permissionTitle, setPermissionTitle] = useState<string>('');
  const [permissionMessage, setPermissionMessage] = useState<string>('');

  useEffect(() => {
    if (userInfo) {
      setProfileImage(userInfo.image);
    }
  }, [userInfo]);
  useEffect(() => {
    if (imageSelectionModalVisible) {
      const frameId = requestAnimationFrame(() => {
        imageSelectionSheetRef.current?.open();
      });
      return () => cancelAnimationFrame(frameId);
    }
  }, [imageSelectionModalVisible]);

  const updateUserInfo = async () => {
    setImageLoader(true);
    AuthService.getMemberInfo().then((userLoginInfo: any) => {
      dispatch(loginAction(userLoginInfo.data));
    }).catch((error) => {
      setImageLoader(false);
    })
  }
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

  const selectImage = async () => {
    setImageSelectionModalVisible(true); // This will trigger the useEffect to open the sheet
  };

  const handleImageOption = async (option: 'camera' | 'library') => {
    // imageSelectionSheetRef.current?.close();
    await pickAndUploadImage(option);
  };

  const closePermissionModel = () => {
    setPermissionModel(false);
  }

  const pickAndUploadImage = async (pickerOption: 'camera' | 'library') => {
    try {
      const res: any = await checkAppPermissions(pickerOption); // or "library"
      if (res.showPopup) {
        setPermissionTitle(res.titleKey);
        setPermissionMessage(res.messageKey);
        setTimeout(() => {
          setPermissionModel(true);
        }, 300);
        return;
      }
      if (!res.allowed) return;

      const result =
        pickerOption === 'camera'
          ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 })
          : await ImagePicker.launchImageLibraryAsync({ mediaTypes: "Images", allowsEditing: true, aspect: [1, 1], quality: 0.5 });

      if (!result.canceled) {
        const selectedImage = result.assets[0];
        const { uri } = selectedImage;
        const fileName = selectedImage.fileName || uri.split('/').pop() || `image_${Date.now()}.jpg`;
        const fileExtension = getFileExtension(selectedImage.uri);

        const isValidFileType = verifyFileTypes(fileName);
        if (!isValidFileType) {
          onError("Accepts only jpg ,png and jpeg format");
          return;
        }
        if (uri) {
          setImageLoader(true);
          const formData = new FormData();
          formData.append("document", {
            uri: uri,
            type: `image/${fileExtension}`, // Corrected MIME type
            name: fileName,
          });
          const uploadRes = await ProfileService.uploadProfile(formData);
          if (uploadRes.status === 200) {
            const uploadedImage = uploadRes.data && uploadRes.data.length > 0 ? uploadRes.data[0] : "";
            setProfileImage(uploadedImage);
            await updateUserInfo(); // ensure updateUserInfo completes
            onError('')
          } else {
            const errorDetail = uploadRes?.data?.message || "Something went wrong, please try again!";
            onError(errorDetail);
          }
        }
      }
    } catch (err) {
      onError("An error occurred during image selection or upload.");
      setImageLoader(false);
    } finally {
      setImageLoader(false);
      imageSelectionSheetRef.current?.close();
    }
  };
  return (
    <View>
      {imgLoader &&
        <Loadding contenthtml={profileImgUpldSk} />
      }
      {!imgLoader &&
        <View style={styles.wauto}>
          <TouchableOpacity onPress={selectImage}>
            <Image style={styles.defaultimg} source={profileImage ? { uri: profileImage } : require("../../assets/images/banklocal/default.png")} />
            <ParagraphComponent text={"GLOBAL_CONSTANTS.UPLOAD"} style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textBlue3, commonStyles.textCenter, commonStyles.mt5, commonStyles.mb5]} />
          </TouchableOpacity>
        </View>}
      <CustomRBSheet
        refRBSheet={imageSelectionSheetRef}
        height={'Small'}
        title={"GLOBAL_CONSTANTS.SELECT_OPTION"}
        onClose={() => setImageSelectionModalVisible(false)} // Called when sheet closes for any reason (mask, drag, programmatic)
      >
        <View>
          <TouchableOpacity onPress={() => handleImageOption('library')} style={[commonStyles.listGap]}>
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { width: '100%', paddingHorizontal: 2, },]}>
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                <ViewComponent style={[commonStyles.quicklinks, commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mb5, commonStyles.bottomsheeticonbg]}>
                  <GalleryIcon width={s(18)} height={s(18)} />
                </ViewComponent>
                <TextMultiLanguage text={"GLOBAL_CONSTANTS.CHOOSE_FROM_GALLERY"} style={[commonStyles.bottomsheeticonprimarytext]} />
              </ViewComponent>
              <SimpleLineIcons name="arrow-right" size={s(16)} color={NEW_COLOR.TEXT_WHITE} />
            </ViewComponent>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleImageOption('camera')}>
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { width: '100%', paddingHorizontal: 2, },]}>
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                <ViewComponent style={[commonStyles.quicklinks, commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mb5, commonStyles.bottomsheeticonbg]}>
                  <Feather name="camera" size={s(18)} color={NEW_COLOR.TEXT_WHITE} />
                </ViewComponent>
                <ParagraphComponent text={"GLOBAL_CONSTANTS.TAKE_PHOTO"} style={[commonStyles.bottomsheeticonprimarytext]} />
              </ViewComponent>
              <SimpleLineIcons name="arrow-right" size={s(16)} color={NEW_COLOR.TEXT_WHITE} />
            </ViewComponent>
          </TouchableOpacity>
        </View>
      </CustomRBSheet>
      <PermissionModel permissionDeniedContent={permissionMessage} closeModel={closePermissionModel} addModelVisible={permissionModel} title={permissionTitle} />
    </View>
  );
};

const styles = StyleSheet.create({
  wauto: { alignSelf: 'flex-start', },
  defaultimg: {
    width: s(70), height: s(70), borderRadius: 64 / 2, overflow: "hidden"
  },
  loading: {
    paddingBottom: screenHeight * 0.15,
    paddingTop: ms(30),
  },

})
export default ProfileUpload;

