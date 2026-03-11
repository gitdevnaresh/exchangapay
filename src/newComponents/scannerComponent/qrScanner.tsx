import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  Alert,
} from "react-native";
// import { BarCodeScanner } from "expo-barcode-scanner";
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';

const QRCodeScannerComp: React.FC<{ onCaptureCode: (code: string) => void; onClose: () => void; }> = ({ onCaptureCode, onClose }) => {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [torch, setTorch] = useState<boolean>(false);
  const [scanned, setScanned] = useState<boolean>(false);

  useEffect(() => {
    // requestCameraPermission();
  }, []);

  // const requestCameraPermission = useCallback(async () => {
  //   const { status } = await BarCodeScanner.requestPermissionsAsync();
  //   if (status === "granted") {
  //     setHasCameraPermission(true);
  //   } else if (status === "denied") {
  //     await Linking.openSettings();
  //   }
  // }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (!scanned) {
      setScanned(true);
      onCaptureCode(data);
      onClose();
      Alert.alert(`Scanned type: ${type}\nData: ${data}`);
    }
  };

  if (hasCameraPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasCameraPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
     {/* <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr, BarCodeScanner.Constants.BarCodeType.ean13]}
      />*/}
      <View style={styles.overlay}>
        <Text style={styles.centerText}>Scan address</Text>
        <TouchableOpacity
          style={styles.buttonTouchable}
          onPress={() => setTorch(!torch)}
        >
          <Ionicons name={torch ? "flash" : "flash-off"} size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onClose}
        >
          <Ionicons name="chevron-back" size={35} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    left: 10,
    top: 10,
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
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default QRCodeScannerComp;
