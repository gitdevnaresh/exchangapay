import * as React from 'react';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import { Container } from '../../components';
import { View, Text, Button, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';

const FirstRoute = () => (
  <View style={{ flex: 1, backgroundColor: '#673ab7' }} />
);

const SecondRoute = () => (
  <View style={{ flex: 1, backgroundColor: '#673ab7' }} />
);

const renderScene = SceneMap({
  first: FirstRoute,
  second: SecondRoute,
});

const SgdStatement = React.memo(() => {
  const styles = useStyleSheet(themedStyles);
  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'first', title: 'PDF' },
    { key: 'second', title: 'Excel' },
  ]);


  return (
    <Container style={styles.container}>
      <ScrollView>

        <View>
          <Text style={[styles.mainTitle, styles.mx15]}>SGD Statement</Text>
        </View>

        <TabView
        style={{ backgroundColor: "#000" }}
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
                  />
        <View style={[styles.dFlex, styles.justifyContent, styles.mx15]}><Text style={[styles.regularText, styles.textWhite]}>For domestic transfers only</Text><Pressable><Text style={[styles.regularText, styles.textBlue]}>Share</Text></Pressable></View>
        <View style={[styles.card, styles.dFlex, styles.justifyContent]}>
          <View style={styles.textCenter}><Text style={[styles.regularText, styles.textWhite, styles.textCenter, styles.mx15]}>Starting on</Text><Text style={[styles.regularText, styles.textSecondary, styles.textCenter, styles.mb12]}>January 2023</Text><Text style={[styles.regularText, styles.textWhite, styles.viewDate, styles.textCenter]}>February 2023</Text></View>
          <View style={styles.textCenter}><Text style={[styles.regularText, styles.textWhite, styles.textCenter, styles.mx15]}>Ending on</Text><Text style={[styles.regularText, styles.textSecondary, styles.textCenter, styles.mb12]}>January 2023</Text><Text style={[styles.regularText, styles.textWhite, styles.viewDate, styles.textCenter]}>February 2023</Text></View>
        </View>
        <Text style={[styles.regularText, styles.textSecondary, styles.textCenter, styles.mx15,]}>If you need a copy of this after your account is closed, you will need to download it while your account is still open</Text>
        <Button
          title="Generate"
          color="#0F85EE"
        />
      </ScrollView>
    </Container>
  );
});

export default SgdStatement;

const themedStyles = StyleService.create({
  textCenter: {
    textAlign: 'center',
  },
  viewDate: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: "#5A595E",
    borderRadius: 10,
  },
  mb12: {
    marginBottom: 12,
  },
  mx15: {
    marginVertical: 15,
  },
  ml3: {
    marginLeft: 15,
  },
  ml2: {
    marginLeft: 8,
  },
  textLeft: {
    textAlign: "left",
  },
  list: {
    marginBottom: 20,
  },
  listItem: {
    marginVertical: 8,
  },
  card: {
    backgroundColor: "#1A171D",
    padding: 16,
    marginVertical: 10,
    borderRadius: 15,
  },
  regularText: {
    fontSize: 16,
    fontWeight: "500",
  },
  textWhite: {
    color: "#fff",
  },
  textSecondary: {
    color: "#B1B1B1",
  },
  textBlue: {
    color: "#0F85EE",
  },
  dFlex: {
    flexDirection: "row",
    alignItems: 'center',
  },
  justifyContent: {
    flexDirection: "row",
    justifyContent: 'space-between',
  },
  textSmall: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 16,
    color: "#0F85EE",
    textAlign: 'center',
  },

  container: {
    backgroundColor: "#000",
  },
  mainTitle: {
    fontSize: 34,
    fontWeight: "600",
    color: "#fff",
    lineHeight: 41,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#fff",
  },
});
