import React from 'react';
import {  Text, StyleSheet, ScrollView, Linking ,useWindowDimensions} from 'react-native';
import RenderHTML from 'react-native-render-html';
import { useNavigation } from '@react-navigation/native';
import { commonStyles } from '../../components/CommonStyles';

const Advertisements = ({ templateContent ,route,}) => {
  const { width } = useWindowDimensions();
  const routing = `"${route}"`;
  const navigation=useNavigation();
  const handleAdvertismentButton = () => {
    navigation.navigate(routing)
};
const customLinkHandler = (href) => {
  if (href === '#handleButton') {
    handleAdvertismentButton();
  } else {
    Linking.openURL(href);
  }
};
  return (
    <ScrollView style={[styles.container,commonStyles.sectionBg,commonStyles.mt24]}>
      <RenderHTML
        contentWidth={width}
        source={{ html: templateContent }}
        tagsStyles={{
          body: {
            color: 'white',
            fontSize: 16,
            padding: 10,
            fontFamily: 'IBM Plex Sans',
          },
          a: {
            color: 'yellow',
            textDecoration: 'none',
          },
        }}
        renderersProps={{
          img: {
            enableExperimentalPercentWidth: true,
          },
        }}
        enableExperimentalMarginCollapsing={true}
        onLinkPress={(event, href) => customLinkHandler(href)}  
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151619',
    paddingTop: 20,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: '500',
    marginBottom: 20,
  },
});

export default Advertisements;
