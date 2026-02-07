import React, { FC } from "react";
import { RootStackParamList } from "../../navigation/navigation-types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { commonStyles } from "../../assets/styles/CommonStyles";
import { SafeAreaView } from "react-native-safe-area-context";
type Home = NativeStackScreenProps<RootStackParamList, "Home">;
const Home: FC<Home> = React.memo((props: any) => {
  return (
    <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>

    </SafeAreaView>
  );
});

export default Home;

