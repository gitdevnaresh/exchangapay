import React, { useEffect, useState } from 'react';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import 'moment-timezone';
import { Container } from '../../../components';
import { View, SafeAreaView, ScrollView, TouchableOpacity, Animated, BackHandler, Platform } from 'react-native';
import { NEW_COLOR } from '../../../constants/theme/variables';
import ParagraphComponent from '../../../components/Paragraph/Paragraph';
import AntDesign from "react-native-vector-icons/AntDesign";
import { TabView, SceneMap } from "react-native-tab-view";
import EXChangaTransactionHistory from './TransactionHistory';
import EXChangaApplicationRecords from './ApplicationRecords';
import { commonStyles } from '../../../components/CommonStyles';
import { useIsFocused } from '@react-navigation/native';
import { useSelector } from 'react-redux';

const CryptoCardsTransaction = React.memo((props: any) => {
  const styles = useStyleSheet(themedStyles);
  const tabStylescss = useStyleSheet(tabStyles);
  const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);
  const [state, setState] = useState<any>({
    index: 0,
    routes: [
      { key: "first", title: "Transaction History" },
      { key: "second", title: "Application Records" },
    ],
  });
  const [up, setUp] = useState(false)
  const isFocused = useIsFocused();
  useEffect(() => {
    setTimeout(() => {
      setUp(true);
    }, 100);

    return () => {
      _handleIndexChange(0)
      setUp(false)
    }

  }, [isFocused]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleBack();
        return true;
      }
    );
    return () => backHandler.remove();
  }, [])

  const handleGoBack = () => {
    props.navigation.push('Dashboard', { screen: 'Home' });
  };

  const _handleIndexChange = (index: any) => setState({ ...state, index });

  const _frist = () => {
    return <>{state?.index === 0 && <EXChangaTransactionHistory {...props} />}</>
  };
  const _second = () => {
    return <>{state?.index === 1 && <EXChangaApplicationRecords  {...props} />}</>
  };


  const _renderScene = SceneMap({
    first: _frist,
    second: _second,
  });
  const _renderTabBar = (props: any) => {
    const active = props.navigationState.index;
    const inputRange = props.navigationState.routes.map(
      (x: any, i: number) => i
    );

    return (
      <SafeAreaView style={[styles.pb0]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[tabStylescss.tabBar, commonStyles.mb14, commonStyles.px16, commonStyles.bgBlack]}
        >
          {props.navigationState.routes.map((route: any, i: number) => {
            const opacity = props.position.interpolate({
              inputRange,
              outputRange: inputRange.map((inputIndex: any) =>
                inputIndex === i ? 1 : 0.5
              ),
            });
            return (

              <TouchableOpacity activeOpacity={0.5}
                style={[
                  tabStylescss.tabItem,
                  {
                    backgroundColor: "#000",
                  },
                  {
                    borderRadius: 0, borderBottomWidth: 5,
                    borderBottomColor: active === i ? "#F55D52" : "#000", marginRight: 20, paddingRight: route.title === "Application Records" ? 16 : 0,
                  },


                ]}
                onPress={() => setState({ ...state, index: i })}
              >
                <Animated.Text style={{ color: "#fff", fontSize: 14, fontFamily: "PlusJakartaSans-Medium" }}>
                  {route.title}
                </Animated.Text>
              </TouchableOpacity>

            );
          })}
        </ScrollView>
      </SafeAreaView>
    );
  };
  const handleBack = () => {
    if (props.route.params?.cardId) {
      props?.navigation.goBack();
    } else {
      props.navigation.navigate('Dashboard', { screen: 'Cards' })
    }
  };
  const handleDownloadTransactions = () => {
    props.navigation.navigate("EXChangaCardDownloadBill", {
      cardId: props.route.params?.cardId
    }
    );
  }

  return (
    <Container style={commonStyles.container}>
      <SafeAreaView style={[commonStyles.flex1,]}>
        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.mb43, commonStyles.justifyContent, userInfo?.accountStatus === "Inactive" ? { paddingTop: Platform.OS === "ios" ? 12 : 0 } : { paddingTop: Platform.OS === "ios" ? 24 : 0 }]}>
          <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap12]}>
            {props.route.params?.cardId &&
              <TouchableOpacity style={[]} onPress={handleBack}>
                <View>
                  <AntDesign name="arrowleft" size={22} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
                </View>
              </TouchableOpacity>
            }
            <ParagraphComponent text="Exchanga Pay Records" style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800]} />
          </View>
          {!props.route.params?.cardId && <TouchableOpacity onPress={handleDownloadTransactions}>
            <ParagraphComponent text="Download Bill" style={[commonStyles.fs12, commonStyles.textOrange, commonStyles.fw600]} />
          </TouchableOpacity>}
        </View>
        {props.route.params?.cardId &&
          (<EXChangaTransactionHistory {...props} />) ||
          (up && <TabView
            style={styles.tabdesign}
            navigationState={state}
            renderScene={_renderScene}
            renderTabBar={_renderTabBar}
            onIndexChange={_handleIndexChange}

          />)}


      </SafeAreaView>
    </Container>
  );
});

export default CryptoCardsTransaction;

const themedStyles = StyleService.create({

});
const tabStyles = StyleService.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: NEW_COLOR.BG_BLACK,
    borderWidth: 1,
    borderColor: NEW_COLOR.SEARCH_BORDER,
    borderStyle: 'dashed', borderRadius: 8
  },

  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
  },
  tabdesign: {
    backgroundColor: '#000'
  }
});