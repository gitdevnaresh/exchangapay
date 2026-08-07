import {
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import { NEW_COLOR, WINDOW_HEIGHT, WINDOW_WIDTH } from "../../constants/theme/variables";
import { commonStyles } from "../../components/CommonStyles";
import { Overlay } from "../../components/ui";
import AntDesign from "react-native-vector-icons/AntDesign";
import { s } from "../../constants/theme/scale";
import NoDataComponent from "../../components/nodata";
import { useEffect, useState } from "react";
import { LIST_PERF_PICKER } from "../../constants/listPerformance";

const CoinsDropdown = (props: any) => {
    const [selected, setIsSelected] = useState(props?.selected);


    return (
        <Overlay backdropStyle={styles.backdropStyle} overlayStyle={[styles.overlayContent, { width: WINDOW_WIDTH - 40,  }]} >
            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.justifyContent, commonStyles.mb24]}>
                <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw800, commonStyles.textBlack,]} text={`Select ${props?.label || ""}`} />
                <AntDesign onPress={() => props?.modelvisible()} name="close" size={22} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
            </View>
            <FlatList
                testID="coins-dropdown-list"
                // P-02: this dropdown is reused for coin/network/currency lists,
                // any of which can run to hundreds of rows. It used to .map()
                // inside a ScrollView, mounting the whole list; FlatList mounts
                // only the rows near the viewport. maxHeight bounds the popup so
                // the virtualised list has a viewport to measure against.
                style={{ maxHeight: WINDOW_HEIGHT * 0.6 }}
                contentContainerStyle={[commonStyles.mb12, commonStyles.gap10]}
                data={props?.coinsList || []}
                keyExtractor={(item: any, index: number) =>
                    String(item?.id ?? item?.[props?.fieldName] ?? item?.name ?? item?.walletCode ?? index)
                }
                renderItem={({ item }: { item: any }) => (
                    <TouchableOpacity style={[styles.optiopStyle, { backgroundColor: selected === (item?.name || item?.walletCode) && NEW_COLOR.OVERLAY_BG || "transparent", }]} activeOpacity={0.8} onPress={() => {
                        props?.handleSelect(item[props?.fieldName] || (props?.optional === true && item || item?.name) || item?.walletCode);
                        setIsSelected(item[props?.fieldName] || item?.name)
                    }}>
                        <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw800, commonStyles.textBlack,]} text={item[props?.fieldName] || item?.name || item?.walletCode} />
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<NoDataComponent />}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                {...LIST_PERF_PICKER}
            />
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