import React, { useState, useCallback } from "react";
import { Modal, Keyboard } from "react-native";
import ViewComponent from "../../../../newComponents/view/view";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import { s } from "../../../../newComponents/theme/scale";
import CommonTouchableOpacity from "../../../../newComponents/touchableComponents/touchableOpacity";
import Ionicons from "@expo/vector-icons/Ionicons";
import TextMultiLanguage from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import ButtonComponent from "../../../../newComponents/buttons/button";
import { Formik } from "formik";
import { Camera } from "expo-camera";
import { addNewAddressSchema } from "../../../addPayee/addNewAddress/addNewAddressSchema";
import FormikTextInput from "../../../../newComponents/textInputComponents/formik/textInput";
import { getThemedCommonStyles } from "../../../../assets/styles/CommonStyles";
import QrScanner from "../../../../newComponents/scannerComponent/scanner";
import { checkAppPermissions } from "../../../../services/mediaPermissionService";
import PermissionModel from "../../../commonScreens/permissionPopup";

interface AddNewAddressComponentProps {
  onSubmit: (values: {
    walletAddress: string;
    selectedNetworkCode: string;
  }) => void;
  initialWalletAddress?: string;
  selectedNetworkCode?: string;
}

const AddNewAddressComponent: React.FC<AddNewAddressComponentProps> = ({
  onSubmit,
  initialWalletAddress = "",
  selectedNetworkCode = "",
}) => {
  const [enableScanner, setEnableScanner] = useState(false);
  const [permissionModel, setPermissionModel] = useState(false);
  const [permissionTitle, setPermissionTitle] = useState("");
  const [permissionMessage, setPermissionMessage] = useState("");
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  const initialValues = {
    walletAddress: initialWalletAddress,
    selectedNetworkCode: selectedNetworkCode,
  };

  const handleScan = useCallback(
    async (
      setFieldValue: (
        field: string,
        value: any,
        shouldValidate?: boolean
      ) => void
    ) => {
      try {
        Keyboard.dismiss();
        const res = await checkAppPermissions("camera");
        if (res.showPopup) {
        setPermissionTitle("GLOBAL_CONSTANTS.ALLOW_CAMERA_ACCESS_TO_SCAN_WALLET_QR_CODES");
        setPermissionMessage("GLOBAL_CONSTANTS.CAMERA_ACCESS_DENIED_MESSAGE");
        setPermissionModel(true);
          return;
        }
        if (res.allowed) {
          setEnableScanner(true);
        }
      } catch (error) {
        console.error("Permission check failed:", error);
      }
    },
    []
  );

  const handleCloseScanner = useCallback(() => {
    setEnableScanner(false);
  }, []);

  const closePermissionModel = useCallback(() => {
    setPermissionModel(false);
  }, []);

  const handleCaptureCode = useCallback(
    (
      text: string,
      setFieldValue: (
        field: string,
        value: any,
        shouldValidate?: boolean
      ) => void
    ) => {
      const address = text?.includes(":") ? text.split(":")[1] : text;
      setFieldValue("walletAddress", address, true);
      setEnableScanner(false);
    },
    []
  );

  return (
    <>
      <TextMultiLanguage
        style={[
          commonStyles.fs14,
          commonStyles.fw400,
          commonStyles.TITLE_GREY,
          { marginBottom: s(16) },
        ]}
        text={"GLOBAL_CONSTANTS.SCAN_OR_PASTE_ADDRESS"}
      />
      <Formik
        initialValues={initialValues}
        validationSchema={addNewAddressSchema}
        onSubmit={onSubmit}
        enableReinitialize={true}
      >
        {({ handleSubmit, setFieldValue, values, errors, touched }) => (
          <>
            <ViewComponent>
              <FormikTextInput
                name="walletAddress"
                placeholder={"GLOBAL_CONSTANTS.ENTER_WALLET_ADDRESS"}
                placeholderTextColor={NEW_COLOR.TEXT_GREY}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
                multiline={false}
                numberOfLines={1}
                custInput={[
                  {
                    backgroundColor: NEW_COLOR.BANNER_BG,
                    paddingRight: s(46),
                  },
                  commonStyles.rounded12,
                  commonStyles.py12,
                  commonStyles.pl16,
                  commonStyles.fs16,
                  commonStyles.fw400,
                ]}
              />
              <CommonTouchableOpacity
                onPress={() => handleScan(setFieldValue)}
                style={{ position: "absolute", right: s(16), top: s(14) }}
              >
                <Ionicons
                  name="qr-code-outline"
                  size={s(22)}
                  color={NEW_COLOR.TEXT_GREY}
                />
              </CommonTouchableOpacity>
            </ViewComponent>
            <ViewComponent style={[commonStyles.sectionGap]} />

            <ViewComponent style={{ flex: 1 }} />

            <ButtonComponent
              title={"GLOBAL_CONSTANTS.CONTINUE"}
              onPress={handleSubmit}
              solidBackground={false}
              disable={!values.walletAddress || !!errors.walletAddress}
            />

            {enableScanner && (
              <Modal
                animationType={"slide" as any}
                transparent={true}
                visible={enableScanner}
                onRequestClose={handleCloseScanner}
              >
                  <QrScanner
                    onCaptureCode={(text: string) =>
                      handleCaptureCode(text, setFieldValue)
                    }
                    onClose={handleCloseScanner}
                    showReceiveAndAlbum={true}
                  />
              </Modal>
            )}
          </>
        )}
      </Formik>
      <PermissionModel 
        permissionDeniedContent={permissionMessage} 
        permissionTitle={permissionTitle} 
        closeModel={closePermissionModel} 
        addModelVisible={permissionModel} 
      />
    </>
  );
};

export default AddNewAddressComponent;
