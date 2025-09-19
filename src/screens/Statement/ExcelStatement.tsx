import React, { useEffect } from 'react';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import { Container } from '../../components';
import { COLOR, WINDOW_WIDTH } from '../../constants/theme/variables';
import { View, Text, ScrollView, Button,Image } from 'react-native';
import DefaultButton from '../../components/DefaultButton';

const ExcelStatement = React.memo(() => {
    const styles = useStyleSheet(themedStyles);

    useEffect(() => {

    }, []);


    return (
        <Container style={[styles.container,styles.pt0]}>
        <ScrollView>
            <>
                <View style={[styles.card,styles.dFlex,styles.justifyContent,styles.p26]}>
                    <View style={styles.list}>
                        <View style={[]}>
                            <Text style={[styles.regularText, styles.textSecondary, styles.listItem,styles.textCenter,styles.mb20]}>Starting On</Text>
                            <Text style={[styles.regularText, styles.textGrey,styles.textCenter]}>January 2023</Text>
                          
                            <Text style={[styles.regularText, styles.badge, styles.listItem,styles.textCenter]}>February 2023</Text>
                          
                        </View>
                    </View>
                    <View style={styles.list}>
                        <View style={[]}>
                            <Text style={[styles.regularText, styles.textSecondary, styles.listItem,styles.textCenter,styles.mb20]}>Starting On</Text>
                            <Text style={[styles.regularText, styles.textGrey, styles.textCenter]}>January 2023</Text>
                           
                            <Text style={[styles.regularText, styles.badge, styles.listItem,styles.textCenter]}>February 2023</Text>
                     
                        </View>
                    </View>
                </View>
                <View style={[styles.mb60]}>
                   <Text style={[styles.decText,styles.regularText,styles.textCenter]}>If you need a copy of this after your account is closed, you will need to download it while your account is still open</Text>
                </View>
                <View>
                    <DefaultButton
            title={'Generate'}
            customTitleStyle={styles.btnConfirmTitle}
            icon={undefined}
            style={undefined}
            customButtonStyle={undefined}
            customContainerStyle={undefined}
            backgroundColors={undefined}
            disable={undefined}
            loading={undefined}
            colorful={undefined}
            transparent={undefined} />
        
                </View>
                <View style={[styles.pdfCard,styles.mt30]}>
                    <View style={[styles.dFlex]}><Image source={require('../../assets/images/banklocal/pdf-file.png')} /><Text style={[styles.pdfText]}>5345656...pdf</Text></View>
                
                <View style={[styles.dFlex]}>
                    <Image style={styles.mr20} source={require('../../assets/images/banklocal/pdf-dwn.png')} />
                <Image source={require('../../assets/images/banklocal/show.png')} />
                </View>
                </View>
            </>
        </ScrollView>
    </Container>
    );
});

export default ExcelStatement;

const themedStyles = StyleService.create({
    mt30:{
        marginTop:40,
    },
    mr20:{
        marginRight:20,
    },
    pdfText:{
        fontWeight: "400",
        fontSize: 16,
        lineHeight: 23,
        color:"#B1B1B1",
        marginLeft:8,
    },
    pdfCard:{
        backgroundColor:"#1A171D",
        flexDirection:"row",
        justifyContent:"space-between",
        borderRadius:15,
        alignItems:"center",
        padding:10,
    },
    btnConfirmTitle: {
        textTransform: 'uppercase',
        fontWeight: '700',
        fontSize: 15
      },
    pt0:{
        paddingTop:0,
    },
    mb20:{
        marginBottom:20,
    },
    mb60:{
        marginBottom:60,
    },
    decText:{
        color:"rgba(177, 177, 177, 0.62)",
    },
    textCenter:{
        textAlign:"center",
    },
    badge:{
        color:"rgba(241, 241, 241, 0.78)",
        paddingVertical:10,
        paddingHorizontal:18,
        borderRadius:10,
        backgroundColor:"#5A595E",
    },
    textGrey:{
        color:"rgba(177, 177, 177, 0.45)",
    },
    p26:{
        padding:26,
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
    centeredView: {
        justifyContent: 'center',
    },
    modalView: {
        backgroundColor: COLOR.GRAY_DARKEN_1,
        height: 200,
        width: WINDOW_WIDTH,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        justifyContent: 'space-around',
        flexDirection: 'row',
        paddingTop: 10,
    },
    button: {
        // flex: 1,
        padding: 20,
        height: 50,
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
        flex: 1,
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
});
