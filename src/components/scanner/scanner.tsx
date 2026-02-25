import React, { useState } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialIcons, Feather } from "@expo/vector-icons";

type QrScannerProps = {
  onCaptureCode: (code: string) => void;
  onClose: () => void;
};

const QrScanner: React.FC<QrScannerProps> = ({ onCaptureCode, onClose }) => {
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionMessage}>
          We need your permission to access the camera
        </Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }
 const toggleTorch = () => {
    setTorchOn(!torchOn);
  };
  const handleScan = ({ data, type }: any) => {
    if (!scanned) {
      setScanned(true);
      onCaptureCode(data); 
      // Alert.alert("Scanned Data", `${data}`);
      onClose();
      setTimeout(() => setScanned(false), 3000);
    }
  };

  const toggleCameraFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing} 
        enableTorch={torchOn} 
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "ean13", "ean8", "upc_a", "code39", "code128"],
        }}
        
        onBarcodeScanned={handleScan}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={onClose}>
            <MaterialIcons name="close" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={toggleTorch}>
            <Feather name={torchOn ? "zap" : "zap-off"} size={30} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

 export default QrScanner;
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "black" },
    permissionContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
    },
    permissionMessage: { textAlign: "center", marginBottom: 20, color: "white", fontSize: 16 },
    camera: { flex: 1 },
    buttonContainer: {
        position: "absolute",
        top: 50, // Adjust for status bar or notch as needed
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-between", // This will place icons on opposite ends
        paddingHorizontal: 20, // Add some padding from the screen edges
    },
    button: {
        backgroundColor: "balck",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8
    },
    buttonText: {
        color: "White",
        fontSize: 16,
    },
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    scanArea: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: "white",
        borderRadius: 10
    },
    iconButton: { // Style for the individual icon buttons
        padding: 10,
        backgroundColor: "rgba(0,0,0,0.4)",
        borderRadius: 30,
    }
    // torchIcon and closeIcon styles are removed as their layout is handled by buttonContainer
});
