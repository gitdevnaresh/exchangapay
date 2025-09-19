
import { BackHandler, ScrollView, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import { NEW_COLOR, WINDOW_HEIGHT, WINDOW_WIDTH } from "../../constants/theme/variables";
import { commonStyles } from "../../components/CommonStyles";
import { Overlay } from "react-native-elements";
import AntDesign from "react-native-vector-icons/AntDesign";
import { ms, s } from "../../constants/theme/scale";
import { useSelector } from "react-redux";
import CardsModuleService from "../../services/card";
import { isErrorDispaly } from "../../utils/helpers";
import Loadding from "../../components/skeleton";
import { sellCoinSelect } from "../Crypto/buySkeleton_views";
import NoDataComponent from "../../components/nodata";

const CradDetailsInfo = (props: any) => {
    const [cardData, setCardData] = useState<any>([]);
    const [errorMsg, setErrorMsg] = useState<string>(" ");
    const [cardDataLoader, setCardDataLoader] = useState<boolean>(false);
    const CardListLoader = sellCoinSelect(10)
    useEffect(() => {
        if (props?.productId) {
            getApplyCardDeatilsInfo(props?.productId);
        }
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                handleClose();
                return true;
            }
        );
        return () => backHandler.remove();

    }, [])
    const getApplyCardDeatilsInfo = async (productId: string) => {
        setCardDataLoader(true)
        try {
            const response: any = await CardsModuleService.getApplyCardDeatils(productId);
            if (response?.ok) {
                setCardData(response?.data?.keyValuePairs);
                setCardDataLoader(false)
            } else {
                setCardDataLoader(false)

            }

        } catch (error) {
            setErrorMsg(isErrorDispaly(error));
            setCardDataLoader(false);
        }
    };

    const handleClose = () => {
        props.updatemodelvisible(false)
    }
    return (
        <Overlay onBackdropPress={handleClose} overlayStyle={[styles.overlayContent, { width: WINDOW_WIDTH - 40, height: WINDOW_HEIGHT - 100 }]} >
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.justifyContent, commonStyles.mb43]}>
                    <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw800, commonStyles.textBlack,]} text="Card Info" />
                    <AntDesign onPress={() => props.updatemodelvisible(false)} name="close" size={22} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
                </View>
                {cardDataLoader && <Loadding contenthtml={CardListLoader} />}
                {!cardDataLoader && cardData?.length > 0 && <View style={[styles.darkBg,]}>
                    {cardData?.map((item: any, index: number) => <><View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap16]}>
                        <ParagraphComponent text={item.title} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textLightGrey, { width: ms(160) }]} />
                        <ParagraphComponent text={item?.value} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textBlack, commonStyles.flex1, commonStyles.textRight]} />
                    </View>
                        {(index < cardData.length - 1) && <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.2 }]} />}
                    </>)}
                </View>}
                {!cardDataLoader && cardData?.length <= 0 && <NoDataComponent />}
                <View style={[commonStyles.mb43]} />
            </ScrollView>
        </Overlay>
    )
};
export default CradDetailsInfo;
const styles = StyleSheet.create({
    overlayContent: {
        paddingHorizontal: s(28),
        paddingVertical: s(24),
        borderRadius: 25, backgroundColor: NEW_COLOR.OVERLAY_BG
    }, darkBg: {

        borderRadius: 16,
    },
    p16: {
        padding: 16
    },
})

