import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import React from 'react';
import RenderHtml from 'react-native-render-html';
import { NEW_COLOR, WINDOW_WIDTH } from '../../constants/theme/variables';
import AntDesign from "react-native-vector-icons/AntDesign";
import { Container } from '../../components';
import { commonStyles } from '../../components/CommonStyles';
import ParagraphComponent from '../../components/Paragraph/Paragraph';


const QuickLink = (props:any) => {
    const handleBackPress = () => {
      props.navigation.goBack();
        return true; 
      };

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: "Plus Jakarta Sans", sans-serif;
      margin: 0;
      background: #fff;
    }
    table {
      text-align: center;
      width: 100%;
      color: #000;
      height: 600px;
    }
    img {
      width: 100%;
    }
  </style>
</head>
<body>
  <table>
  <tr>
  <td style="text-align:center;background-color:#2B1D35;border-radius:12px;padding:16px">
    <img width="250" src="https://devdottstoragespace.blob.core.windows.net/neoimages/comingsoon.png" alt="">
    <h1 style="margin-bottom: 6px;color:#fff">Stay Tuned</h1>
    <p style="margin: 0;color:#fff">We Are Coming Soon</p>
  </td>
</tr>
  </table>
</body>
</html>`;

    return (
        <SafeAreaView style={[commonStyles.flex1,commonStyles.screenBg]}>
            <ScrollView>
                <Container style={[commonStyles.container]}>
                    <View style={[commonStyles.dflex, commonStyles.mb36, commonStyles.alignCenter, commonStyles.gap16]}>
                        <TouchableOpacity onPress={() => handleBackPress()} activeOpacity={0.8}>
                            <AntDesign name="arrowleft" size={22} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
                        </TouchableOpacity>
                        <ParagraphComponent style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800]} text='Quick Link' />
                    </View>
                    <RenderHtml
                        contentWidth={WINDOW_WIDTH}
                        source={{
                            html: `${htmlContent}`
                        }}
                    />
                </Container>
            </ScrollView>
        </SafeAreaView>
    )
}

export default QuickLink

const styles = StyleSheet.create({
    container: {

    }
})