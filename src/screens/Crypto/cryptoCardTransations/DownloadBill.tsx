import React, { useEffect, useState } from "react";
import { StyleService, useStyleSheet } from "@ui-kitten/components";
import { Container, Content, Text } from "../../../components";
import { View, TouchableOpacity, ScrollView, SafeAreaView, NativeModules, BackHandler, Alert, Platform } from "react-native";
import ParagraphComponent from "../../../components/Paragraph/Paragraph";
import { NEW_COLOR } from "../../../constants/theme/variables";
import { ms, s } from "../../../constants/theme/scale";
import AntDesign from "react-native-vector-icons/AntDesign";
import Feather from "react-native-vector-icons/Feather";
import LabelComponent from "../../../components/Paragraph/label";
import DefaultButton from "../../../components/DefaultButton";
import { commonStyles } from "../../../components/CommonStyles";
import CardsModuleService from "../../../services/card";
import { isErrorDispaly } from "../../../utils/helpers";
import moment from "moment";
import "moment-timezone";
import notifee, { EventType } from "@notifee/react-native";
import FileViewer from "react-native-file-viewer";
import RNFetchBlob from "rn-fetch-blob";
import SplashScreen from "react-native-splash-screen";
import ModalPicker from "../../../components/ModalPicker";
import ErrorComponent from "../../../components/Error";
import DatePickers from "react-native-date-picker";
import Share from 'react-native-share';
import { requestAndroidPermission } from "../../../utils/tools";

const EXChangaCardDownloadBill = React.memo((props: any) => {
  const styles = useStyleSheet(themedStyles);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [errormsg, setErrormsg] = useState<any>("");
  const [downloadBillLoading, setDownloadBillLoading] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedCard, setSelecedCard] = useState("");
  const [selectedCardInfo, setSelecedCardInfo] = useState<any>("");
  const [cardList, setCardList] = useState<any>([]);
  const [showList, setShowList] = useState<boolean>(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState<boolean>(false);
  const [fromDate, setFromDate] = useState<any>(new Date());
  const [toDate, setToDate] = useState<any>(new Date());
  const formattedFromDate = moment(fromDate).format("YYYY-MM-DD");
  const formattedToDate = moment(toDate).format("YYYY-MM-DD");
  const [showToDatePicker, setShowToDatePicker] = useState<boolean>(false);

  const data: any = [
    {
      name: "Past Week",
      value: "PastWeek"
    },
    {
      name: "Past Month",
      value: "PastMonth"
    },
    {
      name: "Customize",
    },
  ];
  useEffect(() => {
    return notifee.onForegroundEvent(async ({ type, detail }) => {
      const notificationType = detail.notification?.data?.type;
      if (type === EventType.PRESS) {
        if (Platform.OS === "ios" && notificationType === "Document_IOS") {
          NativeModules.FileManagerModule.getDocumentDirectoryPath(
            async (documentDirectory: string) => {
              try {
                await FileViewer.open(
                  documentDirectory + "/" + detail.notification?.body!
                );
              } finally {
              }
            }
          );
        } else if (
          Platform.OS === "android" &&
          notificationType === "Document_Android"
        ) {
          await NativeModules.FileManagerModule.goToFolder("Downloads");
        }
      }
    });
  }, []);

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  const downloadImage = async(path: any) => {
     if (Platform.OS === 'android') {
        const hasPermission = await requestAndroidPermission();
        if (!hasPermission) {
          Alert.alert('Permission Denied', 'Cannot download image without permission.');
          return;
        }}
    let date = new Date();
    let image_URL = path;
    let ext: any = getExtention(image_URL);
    ext = "." + ext[0];
    if (Platform.OS === 'ios') {
      downloadAndSavePDF(path, `Bill_Transaction_${Math.floor(date.getTime() + date.getSeconds() / 2)}.csv`).then((filePath) => {
        if (filePath) {
          sharePDF(filePath);
        }
      });
    } else {
      const { config, fs } = RNFetchBlob;
      let PictureDir = fs.dirs.DownloadDir;
      let options = {
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path:
            PictureDir +
            "/Bill_Transaction_" +
            Math.floor(date.getTime() + date.getSeconds() / 2) +
            ext,
          description: "csv",
        },
        ios: {
          documentDirectory: 'true',
        },
      };
      config(options)
        .fetch("GET", image_URL)
        .then((_res) => {
          Alert.alert("Transactions Bill Downloaded Successfully.", `File saved to: ${_res.path()}`);

        });
    }

  };

  const downloadAndSavePDF = async (pdfUrl: any, pdfName: string) => {
    try {
      const { dirs } = RNFetchBlob.fs;
      const filePath = `${dirs.DocumentDir}/${pdfName}`;
      const res = await RNFetchBlob.config({
        fileCache: true,
        path: filePath,
      }).fetch('GET', pdfUrl);
      return res.path();

    } catch (error) {
      console.error('Error saving PDF:', error);
      Alert.alert('Error', 'Failed to save the CSV.');
      return null;
    }
  };
  const sharePDF = async (pdfPath: any) => {
    try {
      const options = {
        title: 'Transactions Bill',
        url: `${pdfPath}`,
        type: 'text/csv',
        saveToFiles: true,
      };

      await Share.open(options);

    } catch (error) {
      console.error('Error sharing PDF:', error);
    }
  };

  const getExtention = (filename: any) => {
    return /[.]/.exec(filename) ? /[^.]+$/.exec(filename) : undefined;
  };

  useEffect(() => {
    getListOfCards();
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleGoBack();
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);
  const handleGoBack = () => {
    props.navigation.goBack()
  };
  useEffect(() => {
    const calculateDates = () => {
      const currentDate = new Date();
      let formattedEndDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1
        }/${currentDate.getFullYear()}`;
      let formattedStartDate = "";
      if (data[activeTab]?.name === "Past Week") {
        const lastWeekStartDate = new Date(currentDate);
        lastWeekStartDate.setDate(currentDate.getDate() - 7);
        formattedStartDate = `${lastWeekStartDate.getDate()}/${lastWeekStartDate.getMonth() + 1
          }/${lastWeekStartDate.getFullYear()}`;
      } else if (data[activeTab]?.name === "Past Month") {
        const lastMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1
        );
        const lastDayOfLastMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          0
        );
        formattedStartDate = `${lastMonth.getDate()}/${lastMonth.getMonth() + 1
          }/${lastMonth.getFullYear()}`;
        formattedEndDate = `${lastDayOfLastMonth.getDate()}/${lastDayOfLastMonth.getMonth() + 1
          }/${lastDayOfLastMonth.getFullYear()}`;
      }
      setStartDate(formattedStartDate);
      setEndDate(formattedEndDate);
    };
    calculateDates();
  }, [data, activeTab]);

  const getListOfCards = async () => {
    try {
      const response: any = await CardsModuleService.getCards();
      if (response.data && response.data.length > 0) {
        const cardLu = response.data.map((item: any) => { return { ...item, name: item.cardName } })
        setCardList(cardLu);
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error))
    }
  };


  const fetchAllCustomerCradsCount = async () => {
    const fromDate =
      data[activeTab]?.name === "Customize" ? formattedFromDate : "";
    const toDate = data[activeTab]?.name === "Customize" ? formattedToDate : "";
    if (!selectedCardInfo && !selectedCardInfo?.id) {
      setErrormsg('Please select a card.')
      return
    }
    try {
      setDownloadBillLoading(true);
      const response: any = await CardsModuleService?.getTransactionDownlodBill(
        selectedCardInfo?.id || "",
        data[activeTab]?.value,
        fromDate,
        toDate
      );
      if (response && response.data) {
        downloadImage(response.data);
        setErrormsg("");
      } else {
        setErrormsg("Invalid data received");
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    } finally {
      setDownloadBillLoading(false);
    }
  };
  const formateDate = (date: any) => {
    const formatedDate = moment(date).format("DD/MM/YYYY");
    return formatedDate;
  };
  const handleOpenDatePicker = () => {
    setShowToDatePicker(!showToDatePicker)
  };

  const handleOpenFromDate = () => {
    setShowFromDatePicker(!showFromDatePicker)
  };

  const handleModelPicker = (data: any) => {
    setErrormsg("")
    setSelecedCard(data?.cardName);
    setSelecedCardInfo(data);
  };

  const handleOpenLkp = (item: any) => {
    setShowList(false);
    setSelecedCard(item);
  };

  const handleCloseError = () => {
    setErrormsg("");
  };

  return (
    <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
      <ScrollView>
        <Container style={commonStyles.container}>
          <View style={commonStyles.flex1}>
            <View
              style={[
                commonStyles.dflex,
                commonStyles.alignCenter,
                commonStyles.gap16,
              ]}
            >
              <TouchableOpacity
                onPress={handleGoBack}
                style={[]}
              >
                <View>
                  <AntDesign
                    name="arrowleft"
                    size={s(22)}
                    color={NEW_COLOR.TEXT_BLACK}
                    style={{ marginTop: 3 }}
                  />
                </View>
              </TouchableOpacity>
              <ParagraphComponent
                text="Download Bill"
                style={[
                  commonStyles.fs16,
                  commonStyles.textBlack,
                  commonStyles.fw800,
                ]}
              />
            </View>
            <View style={[commonStyles.mb43]} />
            {errormsg && <ErrorComponent message={errormsg} onClose={handleCloseError} />}
            <View style={[styles.notice]}>
              <Feather
                name="info"
                size={24}
                color={NEW_COLOR.TEXT_GREY}
                style={{ marginTop: 10 }}
              />
              <ParagraphComponent
                style={[
                  commonStyles.fs12,
                  commonStyles.textGrey,
                  commonStyles.fw600,
                  commonStyles.flex1,
                ]}
                text="You can download the billing history file (an Excel file) for the specified time period. The bills are for personal reconciliation purposes only and not for any other use."
              />
            </View>

            <View style={commonStyles.mb24} />
            <LabelComponent text="Card" Children={<LabelComponent text=" *" style={[commonStyles.textRed]} />} />
            <ModalPicker placeholder={'Select Card'}
              onChange={(data) => { handleModelPicker(data) }}
              data={cardList || []}
              value={selectedCard}
              customBind={['cardName']}
              modalTitle={'Select Card'} />
            {showList && (
              <ScrollView style={{ maxHeight: 100 }}>
                {cardList &&
                  cardList?.map((item: any, _index: any) => {
                    return (
                      <TouchableOpacity
                        onPress={() => { handleOpenLkp(item) }}
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                          padding: 5,
                        }}
                        key={_index}
                      >
                        <Text>{item?.cardName}</Text>
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>
            )}

            <View style={[commonStyles.mb24]} />
            <View>
              <Content horizontal contentContainerStyle={{}}>
                <View
                  style={[
                    commonStyles.dflex,
                    commonStyles.alignCenter,
                    commonStyles.justifyContent,
                  ]}
                >
                  {data?.map((item: any, index: any) => (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setActiveTab(index)}
                      key={index}
                    >
                      <View
                        style={[
                          styles.tabstyle,
                          {
                            backgroundColor:
                              activeTab === index
                                ? NEW_COLOR.BG_ORANGE
                                : NEW_COLOR.MENU_CARD_BG,
                          },
                        ]}
                      >
                        <ParagraphComponent
                          text={item.name}
                          style={[
                            commonStyles.textBlack,
                            commonStyles.fs14,
                            commonStyles.fw600,
                            { marginBottom: 2 },
                          ]}
                        />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </Content>
            </View>
            <View style={[commonStyles.mt16]} />
            {data[activeTab]?.name !== "Customize" && (
              <View>
                <View
                  style={[
                    commonStyles.dflex,
                    commonStyles.gap8,
                    commonStyles.alignCenter,
                    commonStyles.justifyContent,
                    commonStyles.gap16,
                  ]}
                >
                  <View
                    style={[
                      commonStyles.dflex,
                      commonStyles.alignCenter,
                      commonStyles.gap16,
                      commonStyles.justifyCenter,
                      commonStyles.flex1,
                      commonStyles.mt16
                    ]}
                  >
                    <View >
                      <ParagraphComponent
                        text={startDate}
                        style={[
                          commonStyles.fs16,
                          commonStyles.fw600,
                          commonStyles.textBlack,
                          commonStyles.textRight,
                        ]}
                        numberOfLines={1}
                      />
                    </View>
                    <ParagraphComponent
                      text={'to'}
                      style={[
                        commonStyles.fs14,
                        commonStyles.fw500,
                        commonStyles.textBlack,
                        commonStyles.textRight,
                      ]}
                      numberOfLines={1}
                    />
                    <View>
                      <ParagraphComponent
                        text={endDate}
                        style={[
                          commonStyles.fs16,
                          commonStyles.fw600,
                          commonStyles.textBlack,
                          commonStyles.textRight,
                        ]}
                        numberOfLines={1}
                      />
                    </View>
                  </View>

                </View>

              </View>
            )}
            {data[activeTab]?.name === "Customize" && (
              <View>
                <View style={[commonStyles.mt16]} />
                <LabelComponent text="From Date" style={[commonStyles.mb10]} />
                <View
                  style={[
                    styles.input,
                    {
                      justifyContent: "space-between",
                      alignItems: "center",
                    },
                  ]}
                >
                  {fromDate !== null && (
                    <Text style={styles.placeholder}>
                      {formateDate(fromDate)}
                    </Text>
                  )}
                  {showFromDatePicker && (
                    <DatePickers
                      modal
                      mode="date"
                      open={showFromDatePicker}
                      date={fromDate}
                      onConfirm={(date) => {
                        setShowFromDatePicker(false)
                        setFromDate(date)
                      }}
                      onCancel={() => {
                        setShowFromDatePicker(false);
                      }}
                      theme="dark"
                      maximumDate={new Date()}
                    />

                  )}
                  <View>
                    <Feather
                      name="calendar"
                      size={22}
                      color="#FFF"
                      onPress={handleOpenFromDate}
                    />
                  </View>
                </View>


                <View style={[commonStyles.mb16]} />

                <View style={[commonStyles.mt16]} />
                <LabelComponent text="To Date" style={[commonStyles.mb10]} />
                <View
                  style={[
                    styles.input,
                    {
                      justifyContent: "space-between",
                      alignItems: "center",
                    },
                  ]}
                >
                  {toDate !== null && (
                    <Text style={styles.placeholder}>
                      {formateDate(toDate)}
                    </Text>
                  )}
                  {showToDatePicker && (
                    <DatePickers
                      modal
                      mode="date"
                      open={showToDatePicker}
                      date={toDate}
                      onConfirm={(date) => {
                        setShowToDatePicker(false)
                        setToDate(date)
                      }}
                      onCancel={() => {
                        setShowFromDatePicker(false);
                      }}
                      theme="dark"
                      maximumDate={new Date()}
                    />

                  )}
                  <View>
                    <Feather
                      name="calendar"
                      size={22}
                      color="#FFF"
                      onPress={handleOpenDatePicker}
                    />
                  </View>
                </View>


                <View style={[commonStyles.mb16]} />
                <View style={[commonStyles.mb26]} />
              </View>
            )}
            <View style={[commonStyles.flex1, commonStyles.mt16]}>
              <View style={[commonStyles.mb24]} />
              <View style={{ marginTop: "auto" }}>
                <DefaultButton
                  title={"Download"}
                  customTitleStyle={styles.btnConfirmTitle}
                  style={[]}
                  customButtonStyle={undefined}
                  customContainerStyle={undefined}
                  backgroundColors={undefined}
                  disable={undefined}
                  loading={downloadBillLoading}
                  colorful={undefined}
                  onPress={fetchAllCustomerCradsCount}
                  transparent={undefined}
                />
              </View>
              <View style={[commonStyles.mb24]} />
            </View>
          </View>
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
});
export default EXChangaCardDownloadBill;

const themedStyles = StyleService.create({
  ml12: {
    marginLeft: 12,
  },
  SelectStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NEW_COLOR.INPUT_BORDER,
    marginBottom: 6,
    gap: 16,
    height: 54,
    paddingHorizontal: 14,
  },
  textLightOrange: {
    color: NEW_COLOR.TEXT_LIGHTORANGE,
  },
  notice: {
    backgroundColor: NEW_COLOR.MENU_CARD_BG,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 24,
  },
  mb8: {
    marginBottom: 8,
  },
  mt16: {
    marginTop: 16,
  },
  mAuto: {
    marginBottom: "auto",
    marginTop: "auto",
    marginRight: "auto",
    marginLeft: "auto",
  },
  mb24: {
    marginBottom: 24,
  },
  tabstyle: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 100,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginRight: 8,
  },
  mb16: {
    marginBottom: 16,
  },
  gap12: {
    gap: 12,
  },
  textGrey: {
    color: NEW_COLOR.TEXT_GREY,
  },
  textRight: {
    textAlign: "right",
  },
  flex1: {
    flex: 1,
  },
  gap16: {
    gap: 16,
  },
  justifyContent: {
    justifyContent: "space-between",
  },
  alignCenter: {
    alignItems: "center",
  },
  textCenter: {
    textAlign: "center",
  },
  justify: {
    justifyContent: "space-between",
  },
  dflex: {
    flexDirection: "row",
  },
  iconCircle: {
    padding: 16,
    borderWidth: 1,
    borderColor: NEW_COLOR.BORDER_LIGHT,
    borderRadius: 100 / 2,
  },
  textGreen: {
    color: NEW_COLOR.TEXT_GREEN,
  },
  textPurple: {
    color: NEW_COLOR.TEXT_PURPLE,
  },
  textLightGrey: {
    color: NEW_COLOR.TEXT_LIGHTGREY,
  },
  fw300: {
    fontWeight: "300",
  },
  fw800: {
    fontWeight: "800",
  },
  fw600: {
    fontWeight: "600",
  },
  fw700: {
    fontWeight: "700",
  },
  fw400: {
    fontWeight: "400",
  },
  fw500: {
    fontWeight: "500",
  },
  gap8: {
    gap: 8,
  },
  textBlack: {
    color: NEW_COLOR.TEXT_BLACK,
  },
  fs14: {
    fontSize: ms(14),
  },
  fs16: {
    fontSize: ms(16),
  },
  fs12: {
    fontSize: ms(12),
  },
  fs10: {
    fontSize: ms(10),
  },
  textWhite: {
    color: NEW_COLOR.TEXT_WHITE,
  },
  mb43: {
    marginBottom: 43,
  },
  container: {
    backgroundColor: NEW_COLOR.BACKGROUND_WHITE,
    padding: 24,
  }, placeholder: {
    fontSize: 13,
    color: "#FFF",
  },

  input: {
    borderRadius: 5,
    borderColor: NEW_COLOR.SEARCH_BORDER,
    backgroundColor: NEW_COLOR.SCREENBG_WHITE,
    borderWidth: 1,
    color: NEW_COLOR.TEXT_WHITE,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",

    paddingLeft: 26,
    paddingRight: 16,
  },
  datePicker: {},
  btnConfirmTitle: {},
});
