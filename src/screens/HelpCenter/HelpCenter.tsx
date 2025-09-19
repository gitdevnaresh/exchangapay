import { BackHandler, SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import RenderHtml from 'react-native-render-html';
import { NEW_COLOR, WINDOW_WIDTH } from '../../constants/theme/variables';
import AntDesign from "react-native-vector-icons/AntDesign";
import { Container } from '../../components';
import { commonStyles } from '../../components/CommonStyles';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import { s } from '../../constants/theme/scale';
import CardsModuleService from '../../services/card';
import { isErrorDispaly } from '../../utils/helpers';
import { useIsFocused } from '@react-navigation/native';
import ErrorComponent from '../../components/Error';
import { personalInfoLoader } from '../Profile/skeleton_views';
import Loadding from '../../components/skeleton';


const HelpCenter = (props: any) => {
  const [htmlContent, setHtmlContent] = useState<any>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const isFocused = useIsFocused();
  const CardAvailableBalance = personalInfoLoader(7);
  const [isContentLoading, setIsContentLoading] = useState<boolean>(false);

  useEffect(() => {
    getHtmlContent();
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => { handleBackPress(); return true; }
    );
    return () => backHandler.remove();
  }, [isFocused])

  const handleBackPress = () => {
    if (props?.route?.params?.isFlag === true) {
      props.navigation.navigate("NewCard");
    } else {
      props.navigation.navigate("DrawerModal");
    }
    return true;
  };

  const getHtmlContent = async () => {
    setIsContentLoading(true);
    try {
      const response: any = await CardsModuleService.getHelpCenterContent();
      if (response) {
        setHtmlContent(response?.data)
        setIsContentLoading(false)
      } else {
        setIsContentLoading(false)
        setErrorMsg(isErrorDispaly(response))

      }
    } catch (error) {
      setIsContentLoading(false)
      setErrorMsg(isErrorDispaly(error))
    }
  }


  return (
    <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
      <ScrollView>
        <Container style={[commonStyles.container]}>

          <View style={[commonStyles.dflex, commonStyles.mb36, commonStyles.alignCenter, commonStyles.gap16]}>
            <TouchableOpacity onPress={handleBackPress} activeOpacity={0.8}>
              <AntDesign name="arrowleft" size={s(22)} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
            </TouchableOpacity>
            <ParagraphComponent style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800]} text='Help Center' />
          </View>
          {isContentLoading && <Loadding contenthtml={CardAvailableBalance} />}
          {errorMsg && (<>
            <ErrorComponent
              message={errorMsg}
              onClose={() => setErrorMsg("")}
            />
            <View style={commonStyles.mt8} />
          </>
          )}
          <RenderHtml
            contentWidth={WINDOW_WIDTH}
            source={{
              html: htmlContent
            }}
          />
        </Container>
      </ScrollView>
    </SafeAreaView>
  )
}

export default HelpCenter;

