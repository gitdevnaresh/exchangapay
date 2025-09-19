import {
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";
import React, { useState } from "react";
import Modal from "react-native-modal";
import { useNavigation} from "@react-navigation/core";
import { Container } from "../../components";
import DefaultButton from "../../components/DefaultButton";
import { commonStyles } from "../../components/CommonStyles";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import { NEW_COLOR } from "../../constants/theme/variables";

const NoInternet = (props: any) => {
  const { show } = props;

  return (
    <>
      <Modal isVisible={show} style={{ flex: 1, margin: 0,backgroundColor:NEW_COLOR.SCREENBG_WHITE }}>
        <Container style={commonStyles.container}>
          <View style={[styles.content]}>
            <View>
              <Image
                style={[styles.imgCenter]}
                source={require("../../assets/images/no-internet.png")}
              />
              <View style={[commonStyles.mb8]} />
              <ParagraphComponent style={[commonStyles.fs24,commonStyles.fw600,commonStyles.textBlack,commonStyles.textCenter]} text={"No Internet"} />
              <View style={[commonStyles.mb8]} />
              <ParagraphComponent style={[commonStyles.fs16,commonStyles.fw500,commonStyles.textGrey,commonStyles.textCenter]} text={"Something wrong with your connection, please check and try again."} />
              <View style={[commonStyles.mb24]} />
              <View style={[]}>
                <DefaultButton
                  title={"Refresh"}
                  customTitleStyle={styles.btnConfirmTitle}
                  icon={undefined}
                  style={undefined}
                  customButtonStyle={undefined}
                  customContainerStyle={undefined}
                  backgroundColors={undefined}
                  colorful={undefined}
                  transparent={undefined}
                  onPress={()=>{if(props.refreshData){props.refreshData()}}}
                />
              </View>
            </View>
          </View>
        </Container>
      </Modal>
    </>
  );
};

export default NoInternet;

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  imgCenter: { marginLeft: "auto", marginRight: "auto" },
  btnConfirmTitle: {
    color:NEW_COLOR.TEXT_ALWAYS_WHITE
  },
});