import React, { useEffect, useState, useCallback } from 'react';
import * as Yup from 'yup';
import { useSelector } from "react-redux";
import { StyleService, useStyleSheet, Button } from '@ui-kitten/components';
import { View, SafeAreaView, TouchableOpacity, Image, Text, Modal, ActivityIndicator, Alert } from 'react-native';
import { isErrorDispaly } from '../../../../../utils/helpers';
import Container from '../../../../../components/container/container';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import { Formik } from 'formik';
import { Input } from 'react-native-elements';
import { COLOR } from '../../../../../constants/styels/variables';
import { ms, screenHeight } from '../../../../../constants/styels/scale';
import Icons from '../../../../../assets/icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ButtonComponent from '../../../../../components/buttons/button';
import AddressbookService from '../../../../../apiServices/profile/general/addressbook';

const validationSchema = Yup.object().shape({
    saveWhiteListName: Yup.string().required('Name is required'),
    walletAddress: Yup.string().required('Address field is required'),
    token: Yup.string().required('Network is required'),
});

const AddressbookCryptoEdit = React.memo((props: any) => {
    const styles = useStyleSheet(themedStyles);
    const userinfo = useSelector((state: any) => state.userReducer?.userDetails);
    const [modalVisible, setModalVisible] = useState(false);
    const [coinDataLoading, setCoinDataLoading] = useState(false);
    const [cryptoCoinData, setCryptoCoinData] = useState<any>([]);
    const [selectedWalletName, setSelectedWalletName] = useState("");
    const [errormsg, setErrormsg] = useState(null);
    const [btnDtlLoading, setBtnDtlLoading] = useState(false);
    const [btnDisabled, setBtnDisabled] = useState(false);

    const initialValues = {
        saveWhiteListName: props?.route?.params?.whiteListName,
        walletAddress: props?.route?.params?.address,
        token: props?.route?.params?.coin,
    };
    useEffect(() => {
        getCryptoCoins();
    }, [props.route?.params?.walletCode,
    props?.route?.params?.address,
    props?.route?.params?.coin,
    props?.route?.params?.network,
    props?.route?.params?.status,
    props?.route?.params?.payeeAccountId]);

    const handleSubmit = async (values: any) => {
        setBtnDtlLoading(true);
        setBtnDisabled(true);
        let obj = {
            id: props?.route?.params?.id || "00000000-0000-0000-0000-000000000000",
            saveWhiteListName: values.saveWhiteListName,
            network: selectedWalletName || props?.route?.params?.network,
            token: props?.route?.params?.coin,
            createddate: new Date(),
            modifiedDate: new Date(),
            currencyType: "Crypto",
            walletAddress: values.walletAddress.trim(),
            customerId: userinfo?.id,
        }
        const res: any = await AddressbookService.confirmSummarrySendCrypto(obj);
        if (res?.ok) {
            setBtnDtlLoading(false);
            setBtnDisabled(false);
            setErrormsg(null);
            props.navigation.push("Addressbook");
        }
        else {
            setErrormsg(isErrorDispaly(res));
            setBtnDtlLoading(false);
            setBtnDisabled(false);
        }
    };

    const getCryptoCoins = useCallback(async () => {
        setCoinDataLoading(true);
        const response: any = await AddressbookService.getCoinNetworkDropdown(props.route?.params?.walletCode, userinfo?.id);
        if (response?.ok) {
            setCryptoCoinData(response?.data);
            setCoinDataLoading(false);
            setErrormsg(null);
        } else {
            setErrormsg(isErrorDispaly(response));
            setCoinDataLoading(false);
        }
    }, [props.route?.params?.walletCode, userinfo?.id]);

    const backArrowButtonHandler = useCallback(() => {
        props.navigation.navigate("AddressbookCryptoView", {
            walletCode: props.route?.params?.walletCode,
            coinBalance: props?.route?.params?.coinBalance,
            whiteListName: props?.route?.params?.whiteListName,
            coin: props?.route?.params?.coin,
            address: props?.route?.params?.address,
            network: props?.route?.params?.network,
        });
    }, [props.navigation, props.route?.params]);

    const handleDropdownIconPress = useCallback(() => {
        setModalVisible(true);
    }, []);

    const handleDropDownChange = useCallback((val: any) => {
        setSelectedWalletName(val?.walletCode);
        setModalVisible(prev => !prev);
    }, []);

    const backArrowNetworkHandler = useCallback(() => {
        setModalVisible(prev => !prev);
    }, [])
    return (
        <Container style={styles.container}>

            <SafeAreaView>
                <KeyboardAwareScrollView
                    contentContainerStyle={[{ flexGrow: 1 }]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    enableOnAndroid={true}
                >
                    <View>
                        {errormsg && <ErrorComponent message={errormsg} onClose={() => setErrormsg(null)} />}
                        <View style={[styles.dFlex, styles.mb20, styles.mt26]}>
                            <TouchableOpacity onPress={backArrowButtonHandler} style={[styles.pr16, styles.pr16]}>
                                <Image source={require('../../../../../assets/images/banklocal/left-arrow.png')} />
                            </TouchableOpacity>
                            <Text style={styles.headTitle}>Update Crypto View</Text>
                        </View>
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ handleChange, handleSubmit, values, errors, touched }) => (
                                <View>
                                    <View>
                                        <Text style={[styles.inputLabel]}>Name *</Text>
                                        <Input
                                            inputContainerStyle={styles.borderLineDisable}
                                            onChangeText={handleChange('saveWhiteListName')}
                                            value={values.saveWhiteListName}
                                            errorStyle={{ color: 'red' }}
                                            errorMessage={touched.saveWhiteListName && typeof errors.saveWhiteListName === 'string' ? errors.saveWhiteListName : undefined}
                                            inputStyle={styles.input}
                                        />
                                    </View>
                                    <View>
                                        <Text style={[styles.inputLabel]}>Address *</Text>
                                        <Input
                                            inputContainerStyle={styles.borderLineDisable}
                                            onChangeText={handleChange('walletAddress')}
                                            value={values.walletAddress}
                                            errorStyle={{ color: 'red' }}
                                            errorMessage={touched.walletAddress && typeof errors.walletAddress === 'string' ? errors.walletAddress : undefined}
                                            inputStyle={styles.input}
                                        />
                                    </View>
                                    <View>
                                        <Text style={[styles.inputLabel]}>Token *</Text>
                                        <Input
                                            inputContainerStyle={styles.borderLineDisable}
                                            onChangeText={handleChange('token')}
                                            value={values.token}
                                            errorStyle={{ color: 'red' }}
                                            errorMessage={touched.token && typeof errors.token === 'string' ? errors.token : undefined}

                                            inputStyle={styles.input}
                                        />
                                    </View>

                                    <View>
                                        <Text style={[styles.inputLabel]}>Network *</Text>

                                        <Input
                                            inputContainerStyle={styles.borderLineDisable}
                                            value={selectedWalletName}
                                            inputStyle={styles.input}

                                        />
                                        <TouchableOpacity onPress={handleDropdownIconPress} style={styles.p16}>
                                            <View style={styles.pr24}>
                                                <Image style={styles.downarrow as import('react-native').ImageStyle} source={Icons.chevronDown} />

                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={[styles.my30]}>
                                        <ButtonComponent
                                            title={"Continue"}
                                            customTitleStyle={styles.btnConfirmTitle}
                                            icon={undefined}
                                            style={undefined}
                                            customButtonStyle={undefined}
                                            customContainerStyle={undefined}
                                            disable={btnDisabled}
                                            loading={btnDtlLoading}
                                            colorful={undefined}
                                            onPress={handleSubmit}
                                            transparent={undefined}
                                        />
                                    </View>

                                    <Button style={styles.cancelButton} onPress={() => props?.navigation?.navigate("SendAccountTo")} >{'Cancel'}</Button>
                                </View>
                            )}
                        </Formik>
                        <>
                            {modalVisible && (
                                <Modal
                                    animationType="slide"
                                    transparent={false}
                                    visible={modalVisible}
                                    onRequestClose={() => {
                                        Alert.alert("Modal has been closed.");
                                        setModalVisible(!modalVisible);
                                    }}
                                >
                                    <Container style={[styles.container, styles.flex1, styles.pt20]}>
                                        <SafeAreaView>
                                            <View style={[styles.dFlex, styles.pb20]}>
                                                <TouchableOpacity onPress={backArrowNetworkHandler} style={[styles.pr16, styles.pr16]}>
                                                    <Image source={require('../../../../../assets/images/banklocal/left-arrow.png')} />
                                                </TouchableOpacity>
                                                <Text style={styles.headTitle}>Select the network</Text>
                                            </View>
                                            {coinDataLoading ? (
                                                <ActivityIndicator size='small' style={styles.loading} color={COLOR.WHITE} />
                                            ) : (
                                                <>
                                                    {cryptoCoinData &&
                                                        cryptoCoinData.map((item: any, index: any) => {
                                                            return (
                                                                <>
                                                                    <View>
                                                                        <TouchableOpacity onPress={() => handleDropDownChange(item)}>
                                                                            <View style={[styles.dflex, styles.rowgap, styles.justify, styles.alignCenter]}>
                                                                                <View>
                                                                                    <Text style={styles.money}>{item?.walletCode}</Text>
                                                                                    <Text style={styles.time}>{item?.walletName}</Text>
                                                                                </View>
                                                                            </View>
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                </>
                                                            )
                                                        })}
                                                </>
                                            )}
                                        </SafeAreaView>
                                    </Container>
                                </Modal>
                            )}
                        </>
                    </View>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        </Container>
    );
});

export default AddressbookCryptoEdit;

const themedStyles = StyleService.create({
    px8: { paddingVertical: 8 },
    pr16: { paddingRight: 16 },
    pr24: {
        paddingRight: 24,
    },
    p16: {
        padding: 16,
    },
    mt26: {
        marginTop: 26
    },
    inputLabel: {
        color: "#B1B1B1", fontSize: 16, fontWeight: "400", lineHeight: 19, marginLeft: 12, marginBottom: 4
    },
    downarrow: {
        position: "absolute",
        right: 16,
        top: -88,
        width: 24,
        height: 24,
    } as React.CSSProperties as any,
    container: {
        flex: 1, backgroundColor: "#000", padding: 16
    },
    dFlex: {
        flexDirection: "row", alignItems: 'center',
    },
    mb20: {
        marginBottom: 20
    },
    pb20: {
        paddingBottom: 20,
    },
    pt20: {
        paddingTop: 20,
    },
    justify: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    money: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "500",
    },
    time: {
        fontSize: 14, marginTop: 0,
        fontWeight: "500",
        color: "#838383"
    },
    headTitle: {
        fontSize: 24, fontWeight: "700", color: "#AAAAAC",
    },
    justifyContent: {
        justifyContent: "space-between"
    },
    dflex: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    rowgap: {
        marginBottom: 40,
    },
    flex1: {
        flex: 1
    },
    loading: {
        paddingBottom: screenHeight * 0.15,
        paddingTop: ms(30),
    },
    row: {
        flexDirection: "row"
    },
    cAccount: {
        justifyContent: "center", alignItems: "center",
    },
    textRecipient: {
        fontSize: 18, fontWeight: "500", Color: "#B1B1B1"
    },
    alignCenter: {
        alignItems: "center",
    },
    input: {
        borderColor: "#353131",
        backgroundColor: "#000",
        borderRadius: 5,
        marginBottom: 4,
        zIndex: 100,
        color: "#fff",
        fontSize: 16,
        paddingVertical: 13,
        paddingHorizontal: 26,
        borderWidth: 2,
    },
    borderLineDisable: {
        borderWidth: 0,
        borderColor: "transparent"
    },
    inputSpace: {
        marginTop: 15,
    },
    continueButton: {
        backgroundColor: "#4172F4", borderRadius: 5, height: 50, fontSize: 18, fontWeight: "500", color: "#000", marginTop: 40, marginBottom: 10,
    },
    cancelButton: {
        borderRadius: 5, height: 50, fontSize: 18, fontWeight: "500", color: "#0F85EE", marginTop: 10, marginBottom: 50,
        borderColor: "#0F85EE", backgroundColor: "#000", textColor: "#0F85EE",
    },
    my30: {
        marginVertical: 30
    },
    btnConfirmTitle: {
        fontWeight: "700",
        fontSize: 18,
        color: "#000000",
    },
})
