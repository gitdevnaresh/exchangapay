import React, { useState } from 'react';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import Container from '../../../../newComponents/container/container';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import ViewComponent from '../../../../newComponents/view/view';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ButtonComponent from '../../../../newComponents/buttons/button';
import Checkbox from '../../../../newComponents/checkBoxes/basic/checkBox';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSelector, useDispatch } from 'react-redux';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import SafeAreaViewComponent from '../../../../newComponents/safeArea/safeArea';
import { useHardwareBackHandler } from '../../../../hooks/HardwareBackHandler';
import ProfileService from '../../../../services/profile';
import { showAppToast } from '../../../../newComponents/ToasterMessages/ShowMessage';
import { isErrorDispaly } from '../../../../utils/helpers';
import Keychain from "react-native-keychain";
import { s } from '../../../../newComponents/theme/scale';
import AuthVerification from '../../../commonScreens/authentication';
import { isLogin, loginAction, setUserInfo } from "../../../../redux/actions/actions";
import { AntDesign } from '@expo/vector-icons';
import { useLngTranslation } from '../../../../hooks/useLngTranslation';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';


const DeleteAccount = () => {
    const navigation = useNavigation<any>();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [selected, setSelected] = useState(false);
    const [showError, setShowError] = useState(false);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch<any>();
    const { decryptAES } = useEncryptDecrypt()
    const userInfo = useSelector((state: any) => state.userReducer.userDetails)
    const decryptPhoneNumber = decryptAES(userInfo?.phoneNumber)
    const decryptemail = decryptAES(userInfo?.email)
    const [authOpen, setAuthOpen] = useState(false);
    const {t}=useLngTranslation();
    const [error, setError] = useState<string>("");
    const handleBackPress = () => {
        navigation.goBack();
    };
    useHardwareBackHandler(() => {
        handleBackPress();
        return true;
    });
    const maskContactInfo = (email: string, phone: string) => {
        // Mask phone: show first 2 and last 2 digits
        const maskedPhone = phone?.replace(/^(\d{3})\d+(\d{0})$/, (_, first, last) => {
            return `${first}****${last}`;
        });

        // Mask email: show first 3 chars of local part, rest masked until @
        const [localPart, domain] = email?.split('@');
        const maskedLocal =
            localPart?.length > 3
                ? `${localPart?.substring(0, 3)}****`
                : `${localPart}****`;
        const maskedEmail = `${maskedLocal}@${domain}`;

        return `${maskedPhone}/${maskedEmail}`;
    };
const handleLgout = async () => {
    dispatch(setUserInfo(""));
    dispatch(isLogin(false));
    dispatch(loginAction(null));
    await Keychain.resetGenericPassword({ service: 'authTokens' });
    setTimeout(() => {
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{ name: "SplaceScreen" }],
        })
      );
    }, 800);
  };
    const handleConfirm = async () => {
        setError("");   
        if (!selected) {
            setShowError(true);
            return;
        }
        setShowError(false);
        setLoading(true);
        try {
            const response = await ProfileService.deleteAccount({});
            if (response.status === 200) {
                showAppToast(t("GLOBAL_CONSTANTS.ACCOUNT_DELETED_SUCCESSFULLY"), 'success');
             handleLgout();
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (value: boolean) => {
        setError("");
        setSelected(value);
        if (value) {
            setShowError(false);
        }
    };
 const handleAuthClose = () => {
    setError("");
    setAuthOpen(false);
    setLoading(false);
  }
   const handleAuthSucess = (verifications: any) => {
    setAuthOpen(false);
    handleConfirm();
  }
  const verifyAuth = () => {
    setError(""); 
    setAuthOpen(true);
    setLoading(true);
  }

    const conditions = [
        "GLOBAL_CONSTANTS.ALL_LINKED_CARDS_WILL_BE_CANCELED",
        "GLOBAL_CONSTANTS.YOU_WILL_NOT_BE_RETRIVE_THIS_ACCOUNT_AFTER_DELETION",
        "GLOBAL_CONSTANTS.ALL_TRANSACTION_RECORDS_WILL_BE_DELETED",
        "GLOBAL_CONSTANTS.ANY_ASSETS_NOT_WITHDRAWN_WILL_BE_CONSIDERED_VOLUNTARY_ABANDONMENT",
        "GLOBAL_CONSTANTS.NO_REFUNDS_WILL_BE_ISSUED_AFTER_ACCOUNT_DELETION",
        "GLOBAL_CONSTANTS.INCLUDE_INFO_ABOUT_FALLBACK_PERIOD",
        "GLOBAL_CONSTANTS.ACCOUNT_WITH_AN_OUTSTANDING_BALANCE_CANNOT_BE_DELETED",
        "GLOBAL_CONSTANTS.YOUR_ACCOUNT_WILL_NOT_BE_ABLE_TO_REGISTER_AGAIN_AFTER_DELETION"
    ];
    let userDetail="";
    if(decryptemail&&decryptPhoneNumber){
     userDetail = maskContactInfo(decryptemail, decryptPhoneNumber)
    }

    return (
        <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container>
                <PageHeader title="GLOBAL_CONSTANTS.DELETE_ACCOUNT" onBackPress={handleBackPress} />
                {error&&<ErrorComponent message={error} screen={true}/>}
                <KeyboardAwareScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <ViewComponent style={[commonStyles.flex1]}>
                        {/* Warning Message */}
                        <ViewComponent style={[commonStyles.dflex,commonStyles.alignStart, commonStyles.mb16, commonStyles.gap12]}>
                            <ViewComponent
                                style={[commonStyles.alignStart,commonStyles.mt10,
                                {
                                    width: s(4),
                                    height: s(4),
                                    borderRadius: s(2),
                                    backgroundColor: NEW_COLOR.TEXT_GREY
                                }
                                ]}
                            />
                            <TextMultiLanguage
                                text={"GLOBAL_CONSTANTS.YOU_WONT_BE_ABLE_TO_RETRIEVE_THIS_ACCOUNT_AFTER_DELETION"}
                                style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey, commonStyles.flex1]} />
                        </ViewComponent>

                        {/* Account Info */}
                        <ViewComponent style={[commonStyles.mb16,commonStyles.ml16]}>
                            <TextMultiLanguage text={userDetail || ""}
                                style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite]} />

                        </ViewComponent>

                        {/* Conditions List */}
                        <ViewComponent style={[commonStyles.mb32]}>
                            {conditions.map((condition, index) => (
                                <ViewComponent
                                    key={index} style={[commonStyles.dflex, commonStyles.gap12, commonStyles.alignStart, commonStyles.mb12]} >
                                    <ViewComponent style={[commonStyles.mt10,
                                    { width: s(4), height: s(4), borderRadius: s(100 / 2), backgroundColor: NEW_COLOR.TEXT_GREY }]} />
                                    <ViewComponent style={[commonStyles.flex1]}>
                                        <TextMultiLanguage
                                            text={condition} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]} />
                                    </ViewComponent>
                                </ViewComponent>
                            ))}
                        </ViewComponent>

                        {/* Checkboxes */}
                        <ViewComponent style={[commonStyles.mb32]}>
                            {/* Abandon Assets Checkbox */}
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                                <Checkbox
                                    value={selected}
                                    onChange={handleCheckboxChange}
                                    size={s(16)}
                                    uncheckedBorderColor={showError && !selected ? NEW_COLOR.TEXT_RED : NEW_COLOR.BORDER_COLOR}
                                    backgroundColor={NEW_COLOR.BG_YELLOW}
                                    style={[commonStyles.mr12]}
                                />
                                <TextMultiLanguage
                                    text={"GLOBAL_CONSTANTS.NO_RESULTS_WILL_BE_ISSUED_AFTER_ACCOUNT_DELETION"}
                                    style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey, commonStyles.flex1]} />
                            </ViewComponent>
                            {showError && !selected && (
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.mt8]}>
                                    <AntDesign
                                        name="closecircleo"
                                        size={s(14)}
                                        color={NEW_COLOR.TEXT_RED}
                                    />
                                    <TextMultiLanguage
                                        text={"GLOBAL_CONSTANTS.CHECK_BOX"}
                                        style={[commonStyles.textRed, commonStyles.fs14, commonStyles.fw400]}
                                    />
                                </ViewComponent>
                            )}
                        </ViewComponent>
                    </ViewComponent>
                </KeyboardAwareScrollView>

                {/* Confirm Button */}


                <ViewComponent style={[commonStyles.sectionGap]} />
                <ButtonComponent
                    title="GLOBAL_CONSTANTS.CONFIRM"
                    onPress={verifyAuth}
                    loading={loading}
                    disable={loading || !selected}
                />
                <ViewComponent style={[commonStyles.sectionGap]} />
                 {authOpen && <AuthVerification onClose={handleAuthClose} onSuccess={handleAuthSucess} feature={'Delete account'} requiredVerifys={2}/>}
            </Container>
        </SafeAreaViewComponent>
    );
};

export default DeleteAccount; 