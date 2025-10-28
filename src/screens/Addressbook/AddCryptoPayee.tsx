import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  Modal,
  Platform,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Field, Formik } from "formik";
import AntDesign from "react-native-vector-icons/AntDesign";
import { s } from "../../constants/theme/scale";
import { commonStyles } from "../../components/CommonStyles";
import Container from "../../components/Container";
import DefaultButton from "../../components/DefaultButton";
import InputDefault from "../../components/DefaultFiat";
import CustomPickerAcc from "../../components/CustomPicker";
import ErrorComponent from "../../components/Error";
import Loadding from "../../components/skeleton";
import { formatDateTimeAPI, isErrorDispaly } from "../../utils/helpers";
import QRCodeScanner from "../../components/qrScanner";
import { personalInfoLoader } from "../Profile/skeleton_views";
import { NEW_COLOR } from "../../constants/theme/variables";
import LabelComponent from "../../components/Paragraph/label";
import CryptoServices from "../../services/crypto";
import SendCryptoServices from "../../services/sendcrypto";
import AddressbookService from "../../services/addressbook";
import { useSelector } from "react-redux";
import useEncryptDecrypt from "../../hooks/useEncryption_Decryption";
import CustomPopupPicker from "../../components/CustomePopupPicker";
import { FormValues, validationSchema } from "./constants";
import { PERMISSIONS, request, RESULTS } from "react-native-permissions";

const AddEditPayeeScreen = (props: any) => {
  const navigation = useNavigation<any>();
  const formikRef = useRef<any>(null);
  const [errormsg, setErrormsg] = useState<string>("");
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const skeletonLoader = personalInfoLoader(10);
  const [enableScanner, setEnableScanner] = useState<boolean>(false);
  const [coinsList, setCoinsList] = useState<any[]>([]);
  const { encryptAES, decryptAES } = useEncryptDecrypt();
  const isFocused = useIsFocused();
  const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);
  const [initValues, setInitValues] = useState<FormValues>({
    favoriteName: "",
    coin: "",
    network: "",
    walletAddress: "",
  });
  const userName = decryptAES(userInfo?.userName);
  const [networksList, setNetworksList] = useState<any[]>([]);
  const ref = useRef(null);
  const handleGoBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleGoBack();
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    getCryptoWallets();
  }, [isFocused]);

  const getNetworksList = async (coin?: any, isChange?: any) => {
    try {
      const res: any = await CryptoServices.getCommonCryptoNetworks(
        coin || props.route?.params?.cryptoCoin
      );
      if (res.ok) {
        setNetworksList(res?.data);
        if (props?.route?.params?.network && !isChange) {
          setInitValues((prevValues) => ({
            ...prevValues,
            coin: coin,
            network: props?.route?.params?.network || "",
          }));
        } else {
          setInitValues((prevValues) => ({
            ...prevValues,
            coin: coin,
            network: res?.data[0]?.name || "",
          }));
        }
      } else {
        setErrormsg(isErrorDispaly(res));
      }
    } catch (err) {
      setErrormsg(isErrorDispaly(err));
    }
  };
  const getCryptoWallets = async () => {
    setLoadingData(true);
    try {
      const response: any =
        await SendCryptoServices.getWithdrawCryptoCoinList();
      if (response?.status === 200) {
        let updatedCoinsList = response?.data?.map((data: any) => ({
          ...data,
          name: data.walletCode,
        }));
        getNetworksList(
          props?.route?.params?.walletCode || updatedCoinsList[0]?.name
        );
        setCoinsList(updatedCoinsList);
        if (updatedCoinsList?.length > 0) {
          if (props?.route?.params?.walletCode) {
            setInitValues((prevValues) => ({
              ...prevValues,
              coin: props?.route?.params?.walletCode || "",
            }));
            setLoadingData(false);
            return;
          } else {
            setInitValues((prevValues) => ({
              ...prevValues,
              coin: updatedCoinsList[0]?.name || "",
            }));
          }
          setLoadingData(false);
        }

        setErrormsg("");
      } else {
        setLoadingData(false);
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error: any) {
      setLoadingData(false);
      setErrormsg(isErrorDispaly(error));
    }
  };

  const enableScannerModel = useCallback(async () => {
    if (Platform.OS === "android") {
      const result = await request(PERMISSIONS.ANDROID.CAMERA);
      if (result === RESULTS.GRANTED) {
        setEnableScanner(true);
      }
    } else if (Platform.OS === "ios") {
      const result = await request(PERMISSIONS.IOS.CAMERA);
      if (result === RESULTS.GRANTED) {
        setEnableScanner(true);
      }
    }
  }, []);

  const onSubmit = async (values: FormValues) => {
    setErrormsg("");
    setBtnLoading(true);
    const payload = {
      id: "00000000-0000-0000-0000-000000000000",
      favouriteName: encryptAES(values.favoriteName),
      currency: values.coin,
      network: values.network,
      createddate: formatDateTimeAPI(new Date()),
      userCreated: encryptAES(userName),
      modifiedDate: null,
      modifiedBy: null,
      status: 1,
      adressstate: "",
      currencyType: "Crypto",
      walletAddress: values.walletAddress,
      createdBy: encryptAES(userName),
      AnalyticsId: "",
      proofType: "",
      amount: null,
      appName: "Exchangapay",
    };
    try {
      const res: any = await AddressbookService.savePayee(payload);
      if (res.status === 200) {
        navigation.navigate("emailOtpVerification", {
          payeeId: res.data,
          screenName: props?.route?.params?.screenName || "",
        });
        setErrormsg("");
      } else {
        ref?.current?.scrollTo({ y: 0, animated: true });
        setErrormsg(isErrorDispaly(res));
      }
    } catch (error) {
      ref?.current?.scrollTo({ y: 0, animated: true });
      setErrormsg(isErrorDispaly(error));
    }
    setBtnLoading(false);
  };
  const handleChangeCoin = (value: any, setFieldValue: any) => {
    setFieldValue("coin", value);
    getNetworksList(value, true);
  };
  const handleChangeNetwork = (value: any, setFieldValue: any) => {
    setFieldValue("network", value);
    setFieldValue("walletAddress", "");
    setErrormsg("");
  };

  return (
    <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        ref={ref}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        showsVerticalScrollIndicator={false}
      >
        <Container style={commonStyles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <AntDesign
                name="arrowleft"
                size={s(24)}
                color={NEW_COLOR.TEXT_ALWAYS_WHITE}
              />
            </TouchableOpacity>
            <LabelComponent
              text={"Add Whitelist Address"}
              style={styles.title}
            />
          </View>
          {errormsg ? (
            <ErrorComponent
              message={errormsg}
              onClose={() => setErrormsg("")}
            />
          ) : null}
          {loadingData ? (
            <Loadding contenthtml={skeletonLoader} />
          ) : (
            <Formik
              innerRef={formikRef}
              enableReinitialize
              initialValues={initValues}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
              validateOnBlur={false}
              validateOnChange={false}
            >
              {({
                handleSubmit,
                handleBlur,
                touched,
                errors,
                setFieldValue,
              }) => (
                <View style={styles.form}>
                  <Field
                    name="favoriteName"
                    label="Favorite Name"
                    placeholder="Enter favorite name"
                    component={InputDefault}
                    error={errors.favoriteName}
                    touched={touched.favoriteName}
                    handleBlur={handleBlur}
                    Children={
                      <LabelComponent text="*" style={commonStyles.textError} />
                    }
                  />
                  <View style={styles.spacer} />
                  <Field
                    name="coin"
                    label="Coin"
                    placeholder="Select Coin"
                    component={CustomPickerAcc}
                    onChange={(value: any) =>
                      handleChangeCoin(value, setFieldValue)
                    }
                    error={errors.coin}
                    touched={touched.coin}
                    modalTitle={"Select Coin"}
                    data={coinsList}
                    disable={coinsList?.length <= 1 ? true : false}
                    Children={
                      <LabelComponent text="*" style={commonStyles.textError} />
                    }
                  />
                  <View style={styles.spacer} />
                  <Field
                    name="network"
                    label="Network"
                    placeholder="Select Network"
                    component={CustomPopupPicker}
                    onChange={(value: any) =>
                      handleChangeNetwork(value, setFieldValue)
                    }
                    error={errors.network}
                    touched={touched.network}
                    data={networksList}
                    modalTitle={"Select Network"}
                    Children={
                      <LabelComponent text="*" style={commonStyles.textError} />
                    }
                  />
                  <View style={styles.spacer} />
                  <View style={styles.fieldContainer}>
                    <Field
                      name="walletAddress"
                      label="Wallet Address"
                      placeholder="Enter wallet address"
                      component={InputDefault}
                      onChangeText={(text: any) => {
                        setErrormsg("");
                        setFieldValue("walletAddress", text);
                      }}
                      error={errors.walletAddress}
                      touched={touched.walletAddress}
                      handleBlur={handleBlur}
                      isScanner={true}
                      onScannerPress={enableScannerModel}
                      rightIcon={true}
                      Children={
                        <LabelComponent
                          text="*"
                          style={commonStyles.textError}
                        />
                      }
                    />
                  </View>
                  <View style={styles.spacer} />
                  <DefaultButton
                    title="Continue"
                    onPress={handleSubmit}
                    loading={btnLoading}
                  />
                  <View style={styles.buttonSpacer} />
                  <DefaultButton
                    title="Cancel"
                    transparent
                    onPress={handleGoBack}
                    style={{ flex: 1, marginRight: s(8) }}
                  />
                </View>
              )}
            </Formik>
          )}
        </Container>
      </KeyboardAwareScrollView>
      {enableScanner && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={enableScanner}
          onRequestClose={() => setEnableScanner(false)}
        >
          <Container style={styles.modalContainer}>
            <QRCodeScanner
              onCaptureCode={(data: string) => {
                const scannedAddress = data.includes(":")
                  ? data.split(":")[1]
                  : data;
                formikRef.current.setFieldValue(
                  "walletAddress",
                  scannedAddress
                );
                setEnableScanner(false);
              }}
              onClose={() => setEnableScanner(false)}
            />
          </Container>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default AddEditPayeeScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    marginBottom: s(13),
  },
  backButton: {
    marginRight: s(16),
  },
  title: {
    flex: 1,
    fontSize: s(20),
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  form: {
    marginTop: s(16),
  },
  spacer: {
    marginBottom: s(16),
  },
  buttonSpacer: {
    marginVertical: s(8),
  },
  fieldContainer: {
    marginBottom: s(16),
    position: "relative",
  },
  qrButton: {
    position: "absolute",
    right: s(8),
    top: s(32),
    padding: s(4),
  },
  modalContainer: {
    flex: 1,
    backgroundColor: commonStyles.screenBg.backgroundColor,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: s(10),
    color: commonStyles.textError?.color || "#ff3333",
    marginTop: s(4),
  },
});
