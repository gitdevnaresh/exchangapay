import { BackHandler, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import { NEW_COLOR, WINDOW_HEIGHT, WINDOW_WIDTH } from "../../constants/theme/variables";
import { commonStyles } from "../../components/CommonStyles";
import DefaultButton from "../../components/DefaultButton";
import { Overlay } from "react-native-elements";
import AntDesign from "react-native-vector-icons/AntDesign";
import CryptoServices from "../../services/crypto";
import { s } from "../../constants/theme/scale";
import { useSelector } from "react-redux";
import RadioButton from "../../components/Button/RadioButton";
import { baseCurrencySkelton } from "./skeleton_views";
import Loadding from "../../components/skeleton";
import { isErrorDispaly } from "../../utils/helpers";

const BaseCurrency = (props: any) => {
    const [currencyList, setCurrencylist] = useState<any>([]);
    const customerInfo = useSelector((state: any) => state.UserReducer?.userInfo);
    const [selectedCurrency, setSelectedcurrency] = useState<string>(props.baseCurrency);
    const [selectIndex, setSelectedIndex] = useState<number>(0);
    const [loader, setLoader] = useState<boolean>(false);
    const [isBtnLoader, setIsBtnLoader] = useState<boolean>(false);
    const [error,setErrorMsg]=useState<any>("");
    const loaderskel = baseCurrencySkelton()


    useEffect(() => {
        getCurrencyData();
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                handleClose();
                return true;
            }
        );
        return () => {
            backHandler.remove();
        };
    }, [])

    const getCurrencyData = async () => {
        setLoader(true);
        try{
            const response = await CryptoServices.getCurrencyLookup();
            setCurrencylist(response?.data);
            setLoader(false);
            if (response?.data?.length > 0) {
                const currencyindex = response?.data?.findIndex((obj: any) => obj.coin === props.baseCurrency);
    
                if (currencyindex > -1) {
                    setSelectedIndex(1);
                }
            }
        }catch(error){
            setErrorMsg(isErrorDispaly(error))
        }
       
    };
    const postCurrency = async () => {
        setIsBtnLoader(true);
        try {
            const response = await CryptoServices.putCurrency(selectedCurrency);
            if (response?.ok) {
                props?.updatemodelvisible(true);
                setIsBtnLoader(false);

            }
        } catch (error) {
            setErrorMsg(isErrorDispaly(error))
            setIsBtnLoader(false)
        }

    };

    const handleClose = () => {
        props.updatemodelvisible(false)
    };
    return (<Overlay onBackdropPress={handleClose} backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.40)' }} overlayStyle={[styles.overlayContent, { width: WINDOW_WIDTH - 40, }]} >
        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.justifyContent, commonStyles.mb43]}>
            <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw800, commonStyles.textBlack,]} text="Select Currency" />
            <AntDesign onPress={handleClose} name="close" size={22} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
        </View>
        {loader && <Loadding contenthtml={loaderskel} />}
        {!loader && <>
            <View style={[commonStyles.sectionStyle, commonStyles.mb30]}>
                <RadioButton
                    options={currencyList}
                    selectedOption={selectedCurrency}
                    onSelect={(val: any) => setSelectedcurrency(val)}
                    nameField={"coin"}
                    valueField={"coin"}
                    radioIsSide={false}

                />
            </View>
            <View style={[commonStyles.mb43]} />
            <View style={[commonStyles.mb16]} />
            <View style={[{ position: "absolute", bottom: 32, width: "100%", left: "9%" }]}>
                <DefaultButton
                    title={"Save"}
                    onPress={postCurrency}
                    iconArrowRight={false}
                    loading={isBtnLoader}

                />
            </View>
        </>}
    </Overlay>)
}
export default BaseCurrency;
const styles = StyleSheet.create({
    overlayContent: {
        paddingHorizontal: s(36),
        paddingVertical: s(36),
        // padding:s(36),
        borderRadius: 35, backgroundColor: NEW_COLOR.POP_UP_BG
    }

})