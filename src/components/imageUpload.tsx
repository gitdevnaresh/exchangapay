import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import ProfileService from "../services/profile";
import { TouchableOpacity } from "react-native";
import AuthService from "../services/auth";
import { ms, s, screenHeight } from "../constants/theme/scale";
import { setUserInfo } from "../redux/Actions/UserActions";
import { useDispatch, useSelector } from "react-redux";
import { profileImageSkelton } from "../screens/Profile/skeleton_views";
import Loadding from "../components/skeleton";

const ProfileUpload = () => {
  const [profileImage, setProfileImage] = useState(null);
  const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);
  const dispatch = useDispatch();
  const [imgLoader, setImageLoader] = useState(false);
  const profileImgUpldSk = profileImageSkelton();

  useEffect(() => {
    if (userInfo) {
      setProfileImage(userInfo.imageURL);
    }
  }, [userInfo]);

  const updateUserInfo = () => {
    setImageLoader(true);
    AuthService.getMemberInfo()
      .then((userLoginInfo: any) => {
        dispatch(setUserInfo(userLoginInfo.data));
        setImageLoader(false);
      })
      .catch((error) => {
        setImageLoader(false);
      });
  };
  const selectImage = async () => {
    try {
      setImageLoader(true);
      const result = await launchImageLibrary({ mediaType: "photo" });
      if (result.assets) {
        const formData = new FormData();
        formData.append("profileImage", {
          uri: result.assets[0].uri,
          type: result.assets[0].type,
          name: result.assets[0].fileName,
        });
        const uploadRes = await ProfileService.uploadProfile(formData);
        if (uploadRes.status === 200) {
          const avatharRes = await ProfileService.profileAvathar({
            ImageURL: uploadRes.data[0],
            UserId: userInfo.userId,
            info: "{}",
          });
          if (avatharRes.status === 200) {
            setProfileImage(uploadRes.data[0]);
            updateUserInfo();
          }
        }
        setImageLoader(false);
      } else if (result.didCancel) {
        setImageLoader(false);
      } else {
        setImageLoader(false);
      }
    } catch (err) {
      setImageLoader(false);
    }
  };

  return (
    <View>
      {imgLoader ? (
        <Loadding contenthtml={profileImgUpldSk} />
      ) : (
        <TouchableOpacity onPress={selectImage}>
          <View style={styles.wauto}>
            <Image
              resizeMode="cover"
              style={styles.defaultimg}
              source={
                profileImage
                  ? { uri: profileImage }
                  : require("../assets/images/profile/avathar.png")
              }
            />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wauto: { alignSelf: "flex-start" },
  camPosition: { position: "absolute", right: -4, bottom: 5 },
  defaultimg: {
    width: s(100),
    height: s(100),
    borderRadius: 100 / 2,
    overflow: "hidden",
  },
  loading: {
    paddingBottom: screenHeight * 0.15,
    paddingTop: ms(30),
  },
});
export default ProfileUpload;
