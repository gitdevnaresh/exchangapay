import * as React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import PdfStatement from './PdfStatement';
import ExcelStatement from './ExcelStatement';
import { Image, TouchableOpacity, Text } from 'react-native';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import Images from '../../assets/images';

const FirstRoute = () => (
    <PdfStatement />
);

const SecondRoute = () => (
    <ExcelStatement />
);

const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
});

const PdfExcelComponent = (props: any) => {
    const styles = useStyleSheet(themedStyles);
    const layout = useWindowDimensions();
    const [index, setIndex] = React.useState(0);

    const [routes] = React.useState([
        { key: 'first', title: 'PDF' },
        { key: 'second', title: 'Excel' },
    ]);

    const backArrowButtonHandler = () => {
        props.navigation.navigate("Bank");
    };

    return (
        <>
            <View style={styles.container}>
                <View style={[styles.row, styles.alignItems]}>
                    <TouchableOpacity onPress={backArrowButtonHandler}>
                        <Image style={{width:16,height:16}} source={Images?.close} />
                    </TouchableOpacity>
                    <Text style={[styles.pageTitle]}>SGD Statement</Text>
                </View>
            </View>
            <TabView
                style={{ backgroundColor: "#000" }}
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                renderTabBar={props => <TabBar {...props} style={{ backgroundColor: '#000000', borderRadius: 20, }} />}
            />
        </>
    );
}
export default PdfExcelComponent;

const themedStyles = StyleService.create({
    pageTitle: {
        fontSize: 24,
        fontWeight: "700",
        lineHeight: 29,
        color: "#AAAAAC",
        marginLeft: 15,
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
        marginVertical: 20,
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
    buttonStyle: {
        paddingVertical: 12,
        paddingHorizontal: 18,
        backgroundColor: "rgb(17,30,47)",
        width: 135,
        borderRadius: 8,
        marginVertical: 12,
        marginRight: 12,
    },
    container: {
        padding: 16,
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
    topButtons: {
        flexDirection: "row",
    },
    row: {
        flexDirection: "row",
        alignItems: "center"
    },
    alignItems: {
        alignItems: 'center', marginTop: 22,
    },
});
