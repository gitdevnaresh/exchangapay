
import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { ms } from '../../../constants/theme/scale';
import AuthService from '../../../services/auth';
import { loginAction } from '../../../redux/actions/actions';
import ButtonComponent from '../../../newComponents/buttons/button';
import { useThemeColors } from '../../../hooks/useThemeColors';
import PopupOrSheet from '../../../newComponents/models/PopupOrSheet';
import ViewComponent from '../../../newComponents/view/view';
import { s } from '../../../newComponents/theme/scale';
import ImageUri from '../../../newComponents/imageComponents/image';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { COMMON_SVG_URLS } from '../../../assets/blobUrls';



const KycVerifyPopup = (props: any) => {
  const rbSheetRef = useRef<any>(null);
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const NEW_COLOR = useThemeColors(true);
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const getMemDetails = async () => {
    try {
      const userLoginInfo: any = await AuthService.getMemberInfo();
      if (userLoginInfo?.status == 200) {
        dispatch(loginAction(userLoginInfo?.data));
      }
    } catch (error) {

    }
  }
  useEffect(() => {
    if (props?.addModelVisible) {
      if (rbSheetRef.current) {
        rbSheetRef.current.open();
      } else {
        const frameId = requestAnimationFrame(() => {
          if (props?.addModelVisible && rbSheetRef.current) {
            rbSheetRef.current.open();
          }
        });
        return () => cancelAnimationFrame(frameId);
      }
    } else {
      if (rbSheetRef.current) {
        rbSheetRef.current.close();
      }
    }
  }, [props?.addModelVisible]);
  const propsCloseModel = () => {
    getMemDetails();
    props?.closeModel()
  }
  const handleSubmit = () => {
    props?.closeModel();
    navigation.navigate('SelectCountry', {
      pageHeader: false, customHeader: {
        title: "Verify KYC",
        showBackButton: true
      }
    });
  }
  return (
    <PopupOrSheet
      ref={rbSheetRef}
      height={s(280)}
      onClose={propsCloseModel}
      showCloseIconAndTittle={false}
    >
      <ViewComponent>
        <ViewComponent style={[]}>
          <ViewComponent style={[commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mb16]}>
            <ImageUri uri={COMMON_SVG_URLS.alert_Icon} width={s(90)} height={s(70)} />
          </ViewComponent>
          <TextMultiLanguage
            style={[commonStyles.fs16, commonStyles.fw700, commonStyles.textWhite, commonStyles.textCenter, commonStyles.mb16]}
            text={`${"GLOBAL_CONSTANTS.ACCOUNT_VERIFICATION"}`}
          />
          <TextMultiLanguage
            style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite, commonStyles.textCenter]}
            text={"GLOBAL_CONSTANTS.VERIFY_YOUR_IDENTITY_TO_UNLOCK"}
          />
        </ViewComponent>
        <ViewComponent style={[commonStyles.mb16]} />
        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter]}>
          <ButtonComponent
            title={"GLOBAL_CONSTANTS.CONTINUE"}
            onPress={handleSubmit}
            customButtonStyle={{ width: s(170), height: s(50) }}
          />
        </ViewComponent>
      </ViewComponent>
    </PopupOrSheet>
  );
};

export default KycVerifyPopup;
