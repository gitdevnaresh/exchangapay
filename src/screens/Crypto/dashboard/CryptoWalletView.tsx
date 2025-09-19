import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, ScrollView, TouchableOpacity, BackHandler, ImageBackground } from 'react-native';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import { Container } from '../../../components';
import { NEW_COLOR, WINDOW_WIDTH } from '../../../constants/theme/variables';
import AntDesign from "react-native-vector-icons/AntDesign";
import ParagraphComponent from '../../../components/Paragraph/Paragraph';
import { commonStyles } from '../../../components/CommonStyles';
import CryptoServices from '../../../services/crypto';
import { formatCurrency, isErrorDispaly } from '../../../utils/helpers';
import { useSelector } from 'react-redux';
import ErrorComponent from '../../../components/Error';
import { sellCoinSelect } from '../buySkeleton_views';
import Loadding from '../../../components/skeleton';
import { IconRefresh, SendReceive, Wallet } from '../../../assets/svg';
import { s } from '../../../constants/theme/scale';
import AccountDeactivatePopup from '../../Currencypop/actDeactivatePopup';

const CryptoWalletView = React.memo((props: any) => {
  const styles = useStyleSheet(themedStyles);
  const [receiveCoinsDataLoading, setReceiveCoinsDataLoading] = useState(false);
  const [receiveCoinsData, setReceiveCoinsData] = useState<any>([]);
  const [errormsg, setErrormsg] = useState(null);
  const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);
  const sellCoinSelectLoader = sellCoinSelect(10);
  const [isPressed, setIsPressd] = useState<boolean>(false);
  useEffect(() => {
    getCryptoReceiveData()
  }, [])
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => { handleGoBack(); return true; }
    );
    return () => backHandler.remove();
  }, []);
  const handleGoBack = () => {
    props.navigation.goBack();
  };
  const getCryptoReceiveData = async () => {
    setReceiveCoinsDataLoading(true);
    const response: any = await CryptoServices.getCryptoWallets();
    if (response?.status === 200) {
      setReceiveCoinsData(response?.data);
      setReceiveCoinsDataLoading(false);
      setErrormsg(null);
    }
    else {
      setErrormsg(isErrorDispaly(response));
      setReceiveCoinsDataLoading(false);
    }
  };
  const handleCryptoReceive = () => {
    props.navigation.navigate("CryptoReceive", {
      cryptoCoin: props?.route?.params?.walletCode,
      network: props?.route?.params?.network,
    })

  };

  const handleBuyCryptoCoinSlct = () => {
    if (userInfo.accountStatus === "Inactive") {
      setIsPressd(true);
    }
    else {
      props.navigation.push("SendCryptoDetails", {
        walletCode: props?.route?.params?.walletCode,
        network: props?.route?.params?.network,
      })
    }
  };
  const handleCardRecords = () => {
    props.navigation.push("CryptoCardsTransaction", {
      cardId: props?.route?.params?.id,
      screenName: "Wallets"
    });
  };

  const handleCloseMFAPopUp = () => {
    setIsPressd(false)
  }
  return (
    <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
      <ScrollView >

        <Container style={[commonStyles.container,]}>
          <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.justifyContent]}>
            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
              <TouchableOpacity style={[]} onPress={handleGoBack} >
                <View>
                  <AntDesign name="arrowleft" size={22} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
                </View>
              </TouchableOpacity>
              <ParagraphComponent text={props?.route?.params?.walletCode || " "} style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800]} />
            </View>
            <TouchableOpacity activeOpacity={0.6}>
              <IconRefresh height={s(24)} width={s(24)} />
            </TouchableOpacity>
          </View>
          {errormsg && <ErrorComponent message={errormsg} onClose={() => setErrormsg(null)} />}
          <View style={[commonStyles.mb43]} />
          {receiveCoinsDataLoading && <Loadding contenthtml={sellCoinSelectLoader} />}
          <View style={[commonStyles.sectionStyle, commonStyles.mb24, { marginHorizontal: s(20) }]}>
            <ParagraphComponent text={"Total Amounts"} style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textBlack, commonStyles.textCenter]} />
            <ParagraphComponent text={`${formatCurrency(props?.route?.params?.avilable, 2)} ${props?.route?.params?.walletCode}`} style={[commonStyles.fs24, commonStyles.fw600, commonStyles.textBlack, commonStyles.textCenter]} />
          </View>
          <View style={[styles.menuBlock]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCryptoReceive}
            >
              <ImageBackground style={{ minWidth: (WINDOW_WIDTH * 26) / 100, height: (WINDOW_WIDTH * 24) / 100 }} resizeMode="contain" source={require("../../../assets/images/cards/card-bg.png")}>
                <View style={styles.actionsList}>
                  <View style={{ alignItems: 'center' }}>
                    <SendReceive
                      style={{ transform: [{ rotate: "180deg" }], margin: 'auto' }}
                      width={s(24)} height={s(24)}
                    />
                    <ParagraphComponent
                      style={[
                        commonStyles.textGrey,
                        commonStyles.fs12,
                        commonStyles.textCenter,
                        commonStyles.mt8,
                        commonStyles.fw500
                      ]}
                      text="Deposit"
                    />
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => { handleBuyCryptoCoinSlct() }
              }
            >
              <ImageBackground style={{ minWidth: (WINDOW_WIDTH * 26) / 100, minHeight: (WINDOW_WIDTH * 24) / 100 }} resizeMode="contain" source={require("../../../assets/images/cards/card-bg.png")}>
                <View style={styles.actionsList}>
                  <View style={{ alignItems: 'center' }}>
                    <SendReceive width={s(24)} height={s(24)} />

                    <ParagraphComponent
                      style={[
                        commonStyles.textGrey,
                        commonStyles.fs12,
                        commonStyles.textCenter,
                        commonStyles.mt8,
                        commonStyles.fw500
                      ]}
                      text="Withdraw"
                    />
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCardRecords}
            >
              <ImageBackground style={{ minWidth: (WINDOW_WIDTH * 26) / 100, minHeight: (WINDOW_WIDTH * 24) / 100 }} resizeMode="contain" source={require("../../../assets/images/cards/card-bg.png")}>
                <View style={styles.actionsList}>
                  <View style={{ alignItems: 'center' }}>
                    <Wallet width={s(24)} height={s(24)} />
                    <ParagraphComponent
                      style={[
                        commonStyles.textGrey,
                        commonStyles.fs12,
                        commonStyles.textCenter,
                        commonStyles.mt8,
                        commonStyles.fw500
                      ]}
                      text="Transactions"
                    />
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          </View>
        </Container>
      </ScrollView>
      {/* {(!isMFACompleted && isPressed) && <MFAPopup isVisible={!isMFACompleted && isPressed} handleClose={handleCloseMFAPopUp} />} */}
      {((userInfo?.accountStatus === "Inactive") && isPressed) && <AccountDeactivatePopup isVisible={((userInfo?.accountStatus === "Inactive") && isPressed)} handleClose={handleCloseMFAPopUp} />}

    </SafeAreaView>

  )
});

export default CryptoWalletView;

const themedStyles = StyleService.create({
  actionsList: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    textAlign: 'center'
  },
  menuBlock: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20, gap: 10, marginBottom: 8
  },
  borderCircle: { borderRadius: 100, padding: 8, backgroundColor: '#382645' },
  rowStyle: {
    borderRadius: 16,
    padding: 12,
    backgroundColor: NEW_COLOR.MENU_CARD_BG
  },
  label: {
    color: NEW_COLOR.TEXT_LABEL
  }, alignText: {
    textAlign: "center"
  }
});