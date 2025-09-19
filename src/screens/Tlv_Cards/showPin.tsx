import { StyleService, useStyleSheet } from "@ui-kitten/components";
import React, { useEffect, useRef, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { commonStyles } from "../../components/CommonStyles";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import AntDesign from "react-native-vector-icons/AntDesign";
import { NEW_COLOR, WINDOW_WIDTH } from "../../constants/theme/variables";
import { SvgUri } from "react-native-svg";
import QRCode from "react-native-qrcode-svg";
import { s } from "../../constants/theme/scale";
import WebView from "react-native-webview";


const CardPin = React.memo((props: any) => {
    const styles = useStyleSheet(themedStyles);
    const refRBSheet = useRef();
    const [getPin, setGetPin] = useState(props?.showPinDetails)

    useEffect(() => {
        refRBSheet?.current?.open();
    }, []);

    return (
        <RBSheet
            height={350}
            ref={refRBSheet}
            closeOnDragDown={false}
            closeOnPressMask={false}
            customStyles={{
                wrapper: { backgroundColor: "transparent" },
                draggableIcon: { backgroundColor: "#5D5A5D" },
                container: { backgroundColor: "#282729", borderTopLeftRadius: 15, borderTopRightRadius: 15 }
            }}
            onClose={() => props.close()}
        >
            <View style={[styles.bluebg]}>
                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.px16, commonStyles.ptb24]}>
                    <ParagraphComponent text={"Card Pin"} style={[commonStyles.fs18, commonStyles.fw500, commonStyles.textBlack]} />
                    <TouchableOpacity onPress={() => { refRBSheet.current.close() }}>
                        <AntDesign name="close" size={24} color={NEW_COLOR.TEXT_BLACK} />
                    </TouchableOpacity>
                </View>
                <View style={[styles.greybg, commonStyles.p16]}>

                    <SvgUri width={WINDOW_WIDTH / 2} style={[commonStyles.mxAuto, commonStyles.mb10]} uri={"https://swokistoragespace.blob.core.windows.net/images/card_holding.svg"} />
                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, commonStyles.justifyContent]}>
                        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                            <SvgUri width={36} height={36} uri={"https://swokistoragespace.blob.core.windows.net/images/card_orange.svg"} />
                            <ParagraphComponent text={"Card Number"} style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textGrey]} />
                        </View>
                        <ParagraphComponent text={getPin?.cardNumber} style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textBlack]} />
                    </View>
                    <View style={[commonStyles.hLineSolid, commonStyles.mx10]} />
                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, commonStyles.justifyContent]}>
                        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                            <SvgUri width={36} height={36} uri={"https://swokistoragespace.blob.core.windows.net/images/pinshow.svg"} />
                            <ParagraphComponent text={"Pin Number"} style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textGrey]} />
                        </View>
                        <ParagraphComponent text={getPin?.pin} style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textBlack]} />
                    </View>





                </View>
            </View>
        </RBSheet>
    )
});
export const ChiperCardPin = React.memo((props: any) => {
    const styles = useStyleSheet(themedStyles);
    const refRBSheet = useRef();
    const [getPin, setGetPin] = useState(props?.showPinDetails)


    useEffect(() => {
        refRBSheet?.current?.open();
    }, []);

    return (
        <RBSheet
            height={780}
            ref={refRBSheet}
            closeOnDragDown={false}
            closeOnPressMask={false}
            customStyles={{
                wrapper: { backgroundColor: "transparent" },
                draggableIcon: { backgroundColor: "#5D5A5D" },
                container: { backgroundColor: "#282729", borderTopLeftRadius: 15, borderTopRightRadius: 15 }
            }}
            onClose={() => props.close()}
        >
            <View style={[styles.bluebg]}>
                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.px16, commonStyles.ptb24]}>
                    <ParagraphComponent text={"Card Pin"} style={[commonStyles.fs18, commonStyles.fw500, commonStyles.textBlack]} />
                    <TouchableOpacity onPress={() => { refRBSheet.current.close() }}>
                        <AntDesign name="close" size={24} color={NEW_COLOR.TEXT_BLACK} />
                    </TouchableOpacity>
                </View>
                <View style={[styles.greybg, commonStyles.p16]}>


                    <View style={[commonStyles.alignCenter, commonStyles.justifyContent]}>
                        <View style={{ width: '100%', height: "65%", marginTop: 8 }}>
                            <WebView
                                originWhitelist={['*']}
                                source={{ html: getPin?.description }}
                                style={{ backgroundColor: 'transparent' }}
                                scrollEnabled={false}
                                showsVerticalScrollIndicator={false}
                                showsHorizontalScrollIndicator={false}
                            />

                        </View>
                        <View style={[styles.bgWhite, commonStyles.justifyCenter, commonStyles.dflex]}>

                            <QRCode
                                color={NEW_COLOR.TEXT_WHITE}
                                backgroundColor="#fff"
                                value={getPin?.token || 'No Pin'}
                                size={s(175)}
                            />
                        </View>

                    </View>
                </View>
            </View>
        </RBSheet>
    )
});
export default CardPin;

const themedStyles = StyleService.create({
    btnConfirmTitle: {
        fontWeight: "500",
        fontSize: 18, color: "#000000"
    },
    pinView: {
        fontSize: 36, letterSpacing: 30, color: '#FFFFFF'
    },
    mt26: {
        marginTop: 26
    },
    cardmenu: {
        width: 28, height: 28, marginLeft: "auto", marginRight: "auto"
    },
    mx36: {
        marginVertical: 36,
    },
    mr20: {
        marginRight: 20,
    },
    justifyCenter: {
        justifyContent: "center",
    },
    buyLabelText: {
        borderRadius: 5,
        paddingHorizontal: 12,
        fontSize: 16,
        textAlign: "left",
        color: "#B1B1B1",
        backgroundColor: "transparent",
        height: 72,
        borderColor: "#353131",
        borderWidth: 1,
    },
    alignCenter: {
        alignItems: "center",
    },
    sheetTitle: {
        fontSize: 24, fontWeight: "600",
    },
    greybg: {
        backgroundColor: "rgba(31,31,34, 1)",
        flex: 1,
        borderTopRightRadius: 0,
        borderTopLeftRadius: 0,
    },
    bluebg: {
        flex: 1,
        backgroundColor: NEW_COLOR.OVERLAY_BG,
    },
    mpt0: {
        paddingTop: 0,
        marginTop: 0,
    },
    px20: {
        paddingVertical: 16,
    },
    row: {
        flexDirection: "row"
    },
    dflex: {
        flexDirection: "row",
        alignItems: 'center',
    }, bgWhite: {
        backgroundColor: NEW_COLOR.BACKGROUND_WHITE, padding: 4,
    },

});