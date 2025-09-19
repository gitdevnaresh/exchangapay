import React, { useEffect } from 'react';
import { View, StyleSheet, Image, BackHandler, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from "react-native-vector-icons/AntDesign";
import { NEW_COLOR } from '../constants/theme/variables';
import { commonStyles } from './CommonStyles';
import ParagraphComponent from './Paragraph/Paragraph';
import Container from './Container';


const ComingSoon = (props: any) => {
  useEffect(() => {
  }, [props?.route?.params?.isFlag])

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );
    return () => {
      backHandler.remove();
    };
  }, []);
  const handleBackPress = () => {
    if (props?.route?.params?.isFlag === true) {
      props.navigation.navigate("NewCard");
    } else {
      props.navigation.navigate("DrawerModal");
    }
    return true;
  };

  return (
    <SafeAreaView style={[commonStyles.flex1, { backgroundColor: NEW_COLOR.BG_PURPLE, }]}>

      <Container style={[commonStyles.container]}>

        <View style={[commonStyles.flex1,]} >
          <View style={[commonStyles.dflex, commonStyles.mb36, commonStyles.alignCenter, commonStyles.gap10]}>
            <TouchableOpacity onPress={handleBackPress} activeOpacity={0.8}>
              <AntDesign name="arrowleft" size={22} color={NEW_COLOR.TEXT_ALWAYS_WHITE} style={{ marginTop: 3 }} />
            </TouchableOpacity>
            <ParagraphComponent style={[commonStyles.fs16, commonStyles.textAlwaysWhite, commonStyles.fw800]} text='Back To Home' />
          </View>
          <View style={[styles.content,]}>
            <View style={[commonStyles.sectionStyle, commonStyles.flex1]}>
              <Image style={{ height: 250 }} resizeMode='contain' source={{ uri: "https://devdottstoragespace.blob.core.windows.net/neoimages/comingsoon.png" }} />
              <ParagraphComponent style={[commonStyles.fs32, commonStyles.textAlwaysWhite, commonStyles.fw600, commonStyles.textCenter]} text='Stay Tuned' />
              <View style={[commonStyles.mb8]} />
              <ParagraphComponent style={[commonStyles.fs20, commonStyles.textAlwaysWhite, commonStyles.fw500, commonStyles.textCenter]} text='We Are Coming Soon' />

            </View>
          </View>
        </View>
      </Container>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    paddingTop: 26,
    paddingBottom: 16,
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
  },
});

export default ComingSoon;
