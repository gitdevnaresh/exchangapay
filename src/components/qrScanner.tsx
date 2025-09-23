import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Linking,
  TouchableOpacity,
} from "react-native";

import IonIcon from "react-native-vector-icons/Ionicons";
import { useIsFocused } from "@react-navigation/native";
import QRCodeScanner from "react-native-qrcode-scanner";
import { RNCamera } from "react-native-camera";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";
import { commonStyles } from "./CommonStyles";
import ParagraphComponent from "./Paragraph/Paragraph";
import { NEW_COLOR } from "../constants/theme/variables";
import AntDesign from "react-native-vector-icons/AntDesign";
interface QRCodeScannerProps {
  onCaptureCode: (data: string) => void;
  onClose: () => void;
}

const QRCodeScannerComp: React.FC<QRCodeScannerProps> = ({
  onCaptureCode,
  onClose,
}) => {
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const isFocused = useIsFocused();
  //   const isForeground = useIsForeground()
  // const isActive = isFocused;
  const [torch, setTorch] = useState(false);
  useEffect(() => {
    requestCameraPermission();
  }, []);
  useEffect(() => {
    const checkPermission = async () => {
      if (Platform.OS === "android") {
        const result = await request(PERMISSIONS.ANDROID.CAMERA);
        if (result === RESULTS.GRANTED) {
          setHasPermission(true);
        }
      } else if (Platform.OS === "ios") {
        const result = await request(PERMISSIONS.IOS.CAMERA);
        if (result === RESULTS.GRANTED) {
          setHasPermission(true);
        }
      }
    };

    checkPermission();
  }, []);

  const requestCameraPermission = useCallback(async () => {
    // const permission = await Camera.requestCameraPermission();
    // if (permission === "denied") await Linking.openSettings();
    // setHasCameraPermission(permission === "granted");
  }, []);

  return (
    <View style={styles.container}>
      <QRCodeScanner
        showMarker={true}
        onRead={(e) => {
          onCaptureCode(e.data);
          onClose();
        }}
        flashMode={
          torch
            ? RNCamera.Constants.FlashMode.torch
            : RNCamera.Constants.FlashMode.off
        }
        topContent={
          <ParagraphComponent
            text={"Scan address"}
            style={[
              commonStyles.fs16,
              commonStyles.fw700,
              commonStyles.textBlack,
              commonStyles.flex1,
            ]}
          />
        }
        bottomContent={
          <TouchableOpacity
            style={styles.buttonTouchable}
            onPress={() => {
              setTorch(!torch);
            }}
          >
            <IonIcon
              name={torch ? "flash" : "flash-off"}
              color={NEW_COLOR.TEXT_BLACK}
              size={24}
            />
          </TouchableOpacity>
        }
      />
      {/* {device != null && (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          codeScanner={codeScanner}
          torch={torch ? "on" : "off"}
          enableZoomGesture={false}
        />
      )} */}
      <TouchableOpacity
        onPress={() => {
          setTorch(!torch);
        }}
      >
        <View style={styles.rightButtonRow}>
          <IonIcon
            name={torch ? "flash" : "flash-off"}
            color={NEW_COLOR.TEXT_BLACK}
            size={24}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          if (onClose) {
            onClose();
          }
        }}
      >
        <AntDesign name="arrowleft" size={22} color={NEW_COLOR.TEXT_BLACK} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEW_COLOR.SCREENBG_WHITE,
    ...StyleSheet.absoluteFillObject,
    paddingTop: 30,
  },
  button: {
    marginBottom: 10,
    width: 10,
    height: 10,
    borderRadius: 100 / 2,
    backgroundColor: "rgba(140, 140, 140, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  rightcloseButtonRow: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  rightButtonRow: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  backButton: {
    position: "absolute",
    left: 18,
    top: 36,
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: "#777",
  },
  textBold: {
    fontWeight: "500",
    color: "#000",
  },
  buttonText: {
    fontSize: 21,
    color: "rgb(0,122,255)",
  },
  buttonTouchable: {
    padding: 16,
  },
});

export default QRCodeScannerComp;
