import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Camera, useCameraDevices } from "react-native-vision-camera";

interface SelfieCameraProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (photo: { uri: string; name: string; type: string }) => Promise<void>;
}

const SelfieCamera: React.FC<SelfieCameraProps> = ({ visible, onClose, onCapture }) => {
  const camera = useRef<Camera>(null);
  const [capturing, setCapturing] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<"front" | "back">("front");
  const devices = useCameraDevices();
  const device =
    devices.find((item) => item.position === cameraPosition) || devices[0];

  const takeSelfie = async () => {
    if (!camera.current || capturing) return;

    setCapturing(true);
    try {
      // Some Android camera drivers return a black image from the still-photo
      // output even while the preview is correct. A snapshot captures the
      // rendered preview instead, bypassing that faulty still-image pipeline.
      const photo = Platform.OS === "android"
        ? await camera.current.takeSnapshot({ quality: 95 })
        : await camera.current.takePhoto();
      await onCapture({
        uri: photo.path.startsWith("file://") ? photo.path : `file://${photo.path}`,
        name: `selfie-${Date.now()}.jpg`,
        type: "image/jpeg",
      });
    } finally {
      setCapturing(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {device ? (
          <Camera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={visible}
            photo={true}
            photoQualityBalance="speed"
          />
        ) : null}
        <TouchableOpacity style={styles.closeButton} onPress={onClose} disabled={capturing}>
          <Ionicons name="close" size={30} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setCameraPosition((position) => position === "front" ? "back" : "front")}
          disabled={capturing}
        >
          <Ionicons name="camera-reverse-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.captureButton, (!device || capturing) && styles.captureButtonDisabled]}
          onPress={takeSelfie}
          disabled={!device || capturing}
        >
          {capturing ? <ActivityIndicator color="#000000" /> : <View style={styles.captureInner} />}
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  closeButton: {
    position: "absolute", top: 48, left: 24, width: 44, height: 44,
    borderRadius: 22, backgroundColor: "rgba(0, 0, 0, 0.45)", alignItems: "center", justifyContent: "center",
  },
  switchButton: {
    position: "absolute", top: 48, right: 24, width: 44, height: 44,
    borderRadius: 22, backgroundColor: "rgba(0, 0, 0, 0.45)", alignItems: "center", justifyContent: "center",
  },
  captureButton: {
    position: "absolute", bottom: 44, alignSelf: "center", width: 76, height: 76,
    borderRadius: 38, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center",
  },
  captureButtonDisabled: { opacity: 0.55 },
  captureInner: { width: 62, height: 62, borderRadius: 31, borderWidth: 3, borderColor: "#000000" },
});

export default SelfieCamera;
