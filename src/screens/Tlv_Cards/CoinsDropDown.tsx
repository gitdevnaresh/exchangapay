import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import { NEW_COLOR, WINDOW_HEIGHT, WINDOW_WIDTH } from "../../constants/theme/variables";
import { commonStyles } from "../../components/CommonStyles";
import { Overlay } from "react-native-elements";
import AntDesign from "react-native-vector-icons/AntDesign";
import { s } from "../../constants/theme/scale";
import NoDataComponent from "../../components/nodata";
import { useEffect, useState } from "react";

const CoinsDropdown = (props: any) => {
    const [selected, setIsSelected] = useState(props?.selected);


    return (
        <Overlay backdropStyle={styles.backdropStyle} overlayStyle={[styles.overlayContent, { width: WINDOW_WIDTH - 40,  }]} >
            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.justifyContent, commonStyles.mb24]}>
                <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw800, commonStyles.textBlack,]} text={`Select ${props?.label || ""}`} />
                <AntDesign onPress={() => props?.modelvisible()} name="close" size={22} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
            </View>
            <ScrollView showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
                <View style={[commonStyles.mb12]}>
                    {props?.coinsList?.length > 0 && <View style={[commonStyles.gap10]}>
                        {props?.coinsList?.map((item: any) => {
                            return (
                                <>
                                    <TouchableOpacity style={[styles.optiopStyle, { backgroundColor: selected === (item?.name || item?.walletCode) && NEW_COLOR.OVERLAY_BG || "transparent", }]} activeOpacity={0.8} onPress={() => { 
                                        props?.handleSelect(item[props?.fieldName] || (props?.optional === true && item || item?.name)||item?.walletCode); 
                                        setIsSelected(item[props?.fieldName] || item?.name) }}>
                                        <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw800, commonStyles.textBlack,]} text={item[props?.fieldName] || item?.name || item?.walletCode} />
                                    </TouchableOpacity>

                                </>)
                        })}
                    </View>}
                    {props?.coinsList?.length <= 0 && <NoDataComponent />}
                </View>
            </ScrollView>
        </Overlay>)
}
export default CoinsDropdown;
const styles = StyleSheet.create({
    optiopStyle: {
        padding: 16,
        borderRadius: 16, borderWidth: 1, borderColor: NEW_COLOR.DASHED_BORDER_STYLE
    },
    overlayContent: {
        paddingHorizontal: s(36),
        paddingVertical: s(36),
        borderRadius: 35, backgroundColor: NEW_COLOR.POP_UP_BG
    },
    backdropStyle: {
        backgroundColor: "rgba(0, 0, 0, 0.40)"
    },
})