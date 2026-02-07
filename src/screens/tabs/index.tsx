import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { s } from "../../constants/theme/scale";
import { NEW_COLOR } from "../../constants/theme/variables";
import Ionicons from "react-native-vector-icons/Ionicons";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CryptoNew from "../home/home";
import NewCard from "../cards";

const Dashboard = (props: any) => {
  const Tab = createBottomTabNavigator();
  const [state, setState] = useState<any>({
    index: props.route?.params?.tabIndex || 0,
    routes: [
      { key: "first", title: "Home", icon: "home-outline", component: CryptoNew },
      { key: "second", title: "Cards", icon: "card-outline", component: NewCard },
    ],
  });






  useEffect(() => {
    if (props.route.params && props.route.params.tabIndex && props.route.params.tabIndex !== state.index) {
      setState({ ...state, index: props.route.params.tabIndex })
    }
  }, [props.route.params]);









  return (
    <>
      {/* <View>
        <View style={[commonStyles.screenBg, commonStyles.px16]}>
          {state.index === 0 && <>
            <TopNavigation style={{ padding: 0, backgroundColor: "transparent" }}
              accessoryLeft={(): TouchableWebElement =>
                <View>
                  <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4]}>
                    <View>
                      <LogoxWhite width={s(26)} height={s(24)} />
                    </View>
                    <ParagraphComponent text={DASHBOARD_CONSTANTS?.EXCHANGA_PAY} style={[commonStyles.fs22, commonStyles.fw700, commonStyles.textLogo, { marginTop: -4 }]} />
                  </View>
                </View>
              }
              accessoryRight={(): TouchableWebElement =>
                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                  <TouchableOpacity activeOpacity={0.7} onPress={handleNotifications} style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                    <View style={[commonStyles.relative]}>
                      <BellIcon height={s(22)} width={s(22)} />
                      {noiffCount > 0 && <View style={[styles.notifyBg]}>
                        <ParagraphComponent text={noiffCount} style={[commonStyles.fs8, commonStyles.fw500, commonStyles.textAlwaysWhite, { marginBottom: 1 }]} />
                      </View>}
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDrawer} style={[styles.dashedBorder]}>
                    <Image
                      style={styles.profile}
                      resizeMode="cover"
                      source={
                        userInfo?.imageURL
                          ? { uri: userInfo.imageURL }
                          : require("../../assets/images/profile/avathar.png")
                      }

                    />
                  </TouchableOpacity>
                </View>

              }
            /></>}
        </View>
      </View> */}

      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === "home") {
              iconName = focused
                ? "home"
                : "home-outline";
            }
            if (route.name === 'Cards') {
              iconName = focused
                ? 'card'
                : 'card-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: NEW_COLOR.BG_ORANGE,
          tabBarInactiveTintColor: NEW_COLOR.TEXT_LIGHTGREY,
          tabBarActiveBackgroundColor: NEW_COLOR.HOME_MENU_BG,
          tabBarInactiveBackgroundColor: NEW_COLOR.HOME_MENU_BG,
          tabBarLabelStyle: {
            fontSize: s(14)
          },
          tabBarItemStyle: { paddingVertical: 4, borderEndWidth: route.name !== 'Transactions' ? 0.7 : 0, borderEndColor: route.name !== 'Transactions' ? NEW_COLOR.BG_BLACK : "transparent", marginBottom: Platform.OS === "ios" ? 0 : 10, marginTop: 10 },
          tabBarStyle: { borderTopWidth: 0, borderBottomWidth: 0, height: Platform.OS === "ios" ? 90 : 70, backgroundColor: NEW_COLOR.HOME_MENU_BG },

        })}
      >
        <Tab.Screen name={"Home"} component={CryptoNew} />
        <Tab.Screen name={"Cards"} component={NewCard} />
      </Tab.Navigator>


    </>
  );
};
export default Dashboard;

