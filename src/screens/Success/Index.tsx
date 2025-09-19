import * as React from 'react';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import { Container } from '../../components';
import { View, Text, ScrollView, Button, TouchableOpacity } from 'react-native';
import { Image } from 'react-native';

const Success = React.memo((props: any) => {
    const styles = useStyleSheet(themedStyles);
    
    const backArrowButtonHandler = () => {
        props.navigation.navigate("Dashboard");
    }
    const buyagainButtonHandler = () => {
        props.navigation.navigate("CryptoBuySell");
    }
    return (
        <Container style={styles.container}>
            <TouchableOpacity onPress={backArrowButtonHandler}>
                <View style={[styles.bottomSpace,]}>
                    <Image source={require('../../assets/images/banklocal/left-arrow.png')} />
                </View>
            </TouchableOpacity> 
            <ScrollView>
                <View style={styles.successCard}>
                    <View style={[styles.textCenter, styles.auto, styles.dFlex, styles.justifyContentCenter,]}>
                        <Image
                            source={require('../../assets/images/banklocal/success.png')} />
                    </View>
                    <Text style={[styles.textSuccess]}>
                        Success !
                    </Text>
                    <Text style={styles.declarationText}>Amount send Successfully<Text style={styles.textWhite}>{props.route?.params?.toValue}{' '}{props.route?.params?.toWalletCode}</Text></Text>
                </View>
                <View style={[styles.mt120, styles.button]}><Button title="BUY again" onPress={buyagainButtonHandler} /></View>
                <View style={[styles.buttonCancle, styles.mb25]} ><Button color="#000" title="Back to Home" onPress={backArrowButtonHandler} /></View>
            </ScrollView>

        </Container>
    );
});

export default Success;

const themedStyles = StyleService.create({
    button: {
        backgroundColor: "#0F85EE",
        borderWidth: 2,
        borderRadius: 5,
        borderColor: '#0F85EE',
        borderStyle: 'solid',
        fontSize: 18,
        fontWeight: "500",
    },
    buttonCancle: {
        borderWidth: 2,
        borderRadius: 5,
        borderColor: '#0F85EE',
        borderStyle: 'solid',
        fontSize: 18,
        fontWeight: "500",
    },
    justifyContentCenter: {
        justifyContent: "center",
    },
    dFlex: {
        flexDirection: "row",
        alignItems: 'center',
    },
    mt120: {
        marginTop: 110,
    },
    mb25: {
        marginVertical: 25,
    },
    textWhite: {
        color: "#fff",
    },
    bottomSpace: {
        marginBottom: 20,
    },
    declarationText: {
        fontSize: 22,
        fontWeight: "500",
        lineHeight: 32,
        color: "#B1B1B1",
        textAlign: "center",
    },
    auto: {
        marginVertical: "auto",
        marginHorizontal: "auto",
    },
    textSuccess: {
        fontWeight: "600",
        fontSize: 34,
        lineHeight: 41,
        textAlign: "center",
        color: "#fff",
        marginTop: 30,
    },
    textCenter: {
        textAlign: "center",
    },
    successCard: {
        backgroundColor: "#1A171D",
        borderRadius: 15,
        paddingVertical: 80,
        paddingHorizontal: 50,
        textAlign: "center",
    },
    container: {
        padding: 16,
        flex: 1,
        backgroundColor: "#000",
    }
});
