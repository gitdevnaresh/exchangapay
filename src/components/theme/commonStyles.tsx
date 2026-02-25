import { Platform, StyleSheet } from "react-native";
import { ms, s } from "./scale";
import { NEW_COLOR, WINDOW_WIDTH } from "./variables";

export const commonStyles = StyleSheet.create({
    navItem:{
        paddingRight:s(14),paddingLeft:s(14),
        paddingTop:s(10),paddingBottom:s(10)
    },
    blackBg:{
        backgroundColor:NEW_COLOR.TEXT_ALWAYS_BLACK
    },
    logoutDesign:{
        paddingRight:s(14),paddingLeft:s(14),
        paddingTop:s(10),paddingBottom:s(10), backgroundColor: NEW_COLOR.LOGOUT_BG,
        borderRadius: 5,
    },
    listboard: {
        padding: s(14), backgroundColor: NEW_COLOR.TRANSPARENT,
        borderTopWidth: 1, borderBottomWidth: 1, borderColor: NEW_COLOR.SEARCH_BORDER,
        borderLeftWidth: 0, borderRightWidth: 0
    },
    dbRefCode:{
        shadowColor: '#000', // Shadow color
        shadowOffset: { width: 0, height: 3 }, // Shadow offset (0px horizontal, 3px vertical)
        shadowOpacity: 0.12, // Shadow opacity (0.12)
        shadowRadius: 8, // Shadow blur radius (8px)
        elevation: 5,backgroundColor: NEW_COLOR.TEXT_WHITE,paddingRight:8,paddingLeft:8,
        paddingTop:6,paddingBottom:6,
        borderRadius: 5,
    },
    dbAdvertisement:{
        borderRadius: 8, // Equivalent to border-radius: 8px
    backgroundColor: NEW_COLOR.TEXT_WHITE, // Equivalent to background: #FFF
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 0 }, // Shadow offset
    shadowOpacity: 0.25, // Equivalent to rgba(0, 0, 0, 0.25)
    shadowRadius: 4, // Equivalent to box-shadow: 0px 0px 4px 0px
    elevation: 4, // Android shadow (optional, for better shadow on Android)
    minHeight:s(146),marginHorizontal:1
    },
    inactiveDot:{
        height:s(10),width:s(10),borderRadius:s(100)/2,
        backgroundColor:NEW_COLOR.DOT_INACTIVE
    },
    activeDot:{
        height:s(10),width:s(10),borderRadius:s(100)/2,
        backgroundColor:NEW_COLOR.PRiMARY_COLOR
    },
    dotBorder:{
        padding:s(2),borderWidth:1,borderColor:NEW_COLOR.PRiMARY_COLOR,
        borderRadius:s(100)/2,
    },
    kycBadge: {
        paddingLeft: s(11), paddingRight: s(11), paddingTop: s(3), paddingBottom: s(3),
        borderRadius: 12,
    },
    backArrow: {
        padding: s(16)
    },
    errorBorder: {
        borderColor: NEW_COLOR.TEXT_RED
    },
    px10: {
        paddingLeft: s(10), paddingRight: s(10)
    },
    textStrike: {
        textDecorationLine: 'line-through',
        textDecorationStyle: 'solid'
    },
    formItemSpace: {
        marginBottom: s(24)
    },
    sectionGap: {
        marginBottom: s(30)
    },
    titleSectionGap: {
        marginBottom: s(14)
    },
    listChildGap: {
        marginBottom: s(6)
    },
    listGap: {
        marginBottom: s(6)
    },
    overlayBg: {
        backgroundColor: NEW_COLOR.OVERLAY_BG
    },
    borderStyleDashed: {
        borderStyle: "dashed"
    },
    opacity08: {
        opacity: 0.8
    },
    flexCol: {
        flexDirection: "column"
    },
    activeItemBg: {
        backgroundColor: NEW_COLOR.ACTIVE_ITEM,
    },
    bordered: {
        borderWidth: 1, borderColor: NEW_COLOR.SECTION_BORDER,
    },
    kpiStyle: {
        backgroundColor: NEW_COLOR.SECTION_BG, flex: 1,
        borderRadius: 5, borderTopWidth: 1, borderTopColor: NEW_COLOR.KPI_BORDER,
    },
    sectionBordered: {
        backgroundColor: NEW_COLOR.TRANSPARENT, padding: s(16),
        borderRadius: 5, borderWidth: 1, borderColor: NEW_COLOR.SECTION_BORDER,
    },
    listStyle: {
        padding: s(14), backgroundColor: NEW_COLOR.TRANSPARENT,
        borderTopWidth: 1, borderBottomWidth: 1, borderColor: NEW_COLOR.LIST_BORDER,
        borderLeftWidth: 0, borderRightWidth: 0
    },
    uploadStyle: {
        backgroundColor: NEW_COLOR.SECTION_BG, paddingVertical: s(34),
        paddingHorizontal: s(16), borderWidth: 1,
        borderRadius: 5, borderStyle: "dashed", borderColor: NEW_COLOR.BORDER_COLOR2
    },
    mailGifImage: {
        width: s(180),
        height: s(180), marginLeft: "auto",
        marginRight: "auto",
    },
    halfWidth: {
        width: WINDOW_WIDTH / 2
    },
    badgeStyle: {
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 8,
    },
    rounded10: {
        borderRadius: 10
    },
    roundedFull: {
        borderRadius: s(100)/2
    },
    rounded16: {
        borderRadius: 16
    },
    rounded5: {
        borderRadius: 5
    },
    rounded0: {
        borderRadius: 0
    },
    rounded2: {
        borderRadius: 2
    },
    rounded30: {
        borderRadius: 30
    },
    searchContainer: {
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        flexDirection: 'row',
        paddingHorizontal: ms(12),
        height: s(44),gap:10,
        borderRadius: 8,
        backgroundColor: NEW_COLOR.SEARCH_BG,
        borderWidth: 1,
        borderColor: NEW_COLOR.SEARCH_BORDER
    },
    sectionBorder: {
        borderWidth: 1,
        borderColor: NEW_COLOR.SECTION_BORDER,
        borderRadius: 5,
    },
    borderTransparent: {
        borderWidth: 1,
        borderColor: NEW_COLOR.TRANSPARENT,
    },
    sectionStyle: {
        backgroundColor: NEW_COLOR.TRANSPARENT,
        padding: s(16), borderRadius: 5,
        borderWidth: 1,
        borderColor: NEW_COLOR.BORDER_GREY,
    },
    sectionBg: {
        backgroundColor: NEW_COLOR.TRANSPARENT,
    },
    pageTitle: {
        fontSize: ms(24),
        color: NEW_COLOR.TEXT_BLACK,
        // fontFamily: "Blinker-SemiBold"
        fontWeight:"700"
    },
    sectionTitle: {
        fontSize: ms(20),
        color: NEW_COLOR.TEXT_BLACK,
        // fontFamily: "Blinker-SemiBold"
        fontWeight:"600"
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: NEW_COLOR.BORDER_GREY
    },
    borderRight: {
        borderRightWidth: 1,
        borderRightColor: NEW_COLOR.BORDER_GREY
    },
    borderLeft: {
        borderLeftWidth: 1,
        borderLeftColor: NEW_COLOR.BORDER_GREY
    },
    hLine: {
        height: 1, width: "100%", backgroundColor: NEW_COLOR.DIVIDER_COLOR
    },
    vLine: {
        height: "100%", width: 1, backgroundColor: NEW_COLOR.DIVIDER_COLOR
    },
    relative: {
        position: "relative"
    },
    fs28: {
        fontSize: ms(28),
    },
    fs26: {
        fontSize: ms(26),
    },
    fs24: {
        fontSize: ms(24)
    },
    fs22: {
        fontSize: ms(22)
    },
    fs20: {
        fontSize: ms(20)
    },
    fs18: {
        fontSize: ms(18)
    },
    fs16: {
        fontSize: ms(16)
    },
    fs14: {
        fontSize: ms(14)
    },
    fs12: {
        fontSize: ms(12)
    },
    fs10: {
        fontSize: ms(10)
    },
    fs8: {
        fontSize: ms(8)
    },
    fs6: {
        fontSize: ms(6)
    },
    fs30: {
        fontSize: ms(30)
    },
    fs32: {
        fontSize: ms(32)
    },
    fs34: {
        fontSize: ms(34)
    },
    fs36: {
        fontSize: ms(36)
    },
    fs40: {
        fontSize: ms(40)
    },
    inputStyle: {
        borderWidth: 1.5,
        borderColor: NEW_COLOR.INPUT_BORDER,
        borderRadius: 8,
        fontSize: ms(16), color: NEW_COLOR.TEXT_BLACK,
        textAlignVertical: 'center', height: s(44),
        paddingHorizontal: 14, fontWeight: "500",
    },
    inputLabel: {
        marginBottom:s(5)
    },
    bgWhite: {
        backgroundColor: NEW_COLOR.BACKGROUND_WHITE
    },
    sheetHeaderbg: {
        backgroundColor: NEW_COLOR.SHEET_HEADER_BG
    },
    sheetbg: {
        backgroundColor: NEW_COLOR.SHEET_BG
    },
    textBlue: {
        color: NEW_COLOR.TEXT_BLUE
    },
    textprimary: {
        color: NEW_COLOR.TEXT_PRIMARY
    },
    textBrown: {
        color: NEW_COLOR.TEXT_BROWN
    },
    textRed: {
        color: NEW_COLOR.TEXT_RED
    },
    textPurple: {
        color: NEW_COLOR.TEXT_PURPLE
    },
    textGrey: {
        color: NEW_COLOR.TEXT_GREY
    },
    textsecondary: {
        color: NEW_COLOR.TEXT_SECONDARY
    },
    textPending: {
        color: NEW_COLOR.TEXT_ORANGE
    },
    textBlack: {
        color: NEW_COLOR.TEXT_BLACK
    },
    textWhite: {
        color: NEW_COLOR.TEXT_WHITE
    },
    textGreen: {
        color: NEW_COLOR.TEXT_GREEN
    },
    textPink: {
        color: NEW_COLOR.TEXT_PINK
    },
    textAlwaysBlack: {
        color: NEW_COLOR.TEXT_ALWAYS_BLACK
    },
    textAlwaysWhite: {
        color: NEW_COLOR.TEXT_ALWAYS_WHITE
    },
    textOrange: {
        color: NEW_COLOR.TEXT_ORANGE
    },
    textError: {
        color: NEW_COLOR.TEXT_RED
    },
    TITLE_GREY: {
        color: NEW_COLOR.TITLE_GREY
    },
    dflex: {
        flexDirection: "row",
    },
    alignCenter: {
        alignItems: "center",
    },
    alignStart: {
        alignItems: "flex-start",
    },
    alignEnd: {
        alignItems: "flex-end",
    },
    justifyContent: {
        justifyContent: "space-between",
    },
    justify: {
        justifyContent: "space-between",
    },
    justifyAround: {
        justifyContent: "space-around",
    },
    justifyCenter: {
        justifyContent: "center"
    },
    justifyend: {
        justifyContent: "flex-end"
    },
    flexWrap: {
        flexWrap: "wrap"
    },
    textRight: {
        textAlign: "right"
    },
    fw900: {
        // fontFamily: "Blinker-Black",
        fontWeight:"900"
    },
    fw800: {
        // fontFamily: "Blinker-ExtraBold"
         fontWeight:"800"
    },
    fw700: {
        // fontFamily: "Blinker-Bold"
         fontWeight:"700"
    },
    fw600: {
        // fontFamily: "Blinker-SemiBold"
         fontWeight:"600"
    },
    fw500: {
        // fontFamily: "Blinker-SemiBold"
         fontWeight:"500"
    },
    fw400: {
        // fontFamily: "Blinker-Regular"
         fontWeight:"400"
    },
    fw300: {
        // fontFamily: "Blinker-Light"
         fontWeight:"300"
    },
    fw200: {
        // fontFamily: "Blinker-ExtraLight"
         fontWeight:"200"
    },
    fw100: {
        // fontFamily: "Blinker-Thin"
         fontWeight:"100"
    },
    textCenter: {
        textAlign: "center",
    },
    container: {
        padding: 16,
        paddingTop: Platform.OS === 'android' ? 44 : 0,
        flex: 1,
        backgroundColor: NEW_COLOR.BACKGROUND_WHITE,
        // backgroundColor: NEW_COLOR.SCREENBG,
    },
    pagePt50: {
        paddingTop: Platform.OS === 'android' ? 14 : 0,
        backgroundColor: NEW_COLOR.SCREENBG,
        paddingRight: 16, paddingLeft: 16
    },
    containerBgTransparent: {
        padding: 16,
        paddingTop: Platform.OS === 'android' ? 44 : 0,
        flex: 1,
        backgroundColor: NEW_COLOR.TRANSPARENT,
    },
    screenBg: {
        backgroundColor: NEW_COLOR.BACKGROUND_WHITE,
        // backgroundColor: NEW_COLOR.SCREENBG,
    },
    modalpt: {
        paddingTop: Platform.OS === 'android' ? 12 : 0,
    },
    nativeModalpt: {
        paddingTop: Platform.OS === 'android' ? 36 : 0,
    },
    blueBg: {
        // backgroundColor: NEW_COLOR.SCREENBG_WHITE,
        backgroundColor: NEW_COLOR.BG_BLUE,
    },
    textlink:{
        color:NEW_COLOR.TEXT_LINK
    },
    subtext:{
        color:NEW_COLOR.SUB_TEXT
    },
    flex1: {
        flex: 1
    },
    gap8: {
        gap: s(8)
    },
    gap24: {
        gap: s(24),
    },
    gap40: {
        gap: ms(40),
    },
    gap22: {
        gap: s(22),
    },
    gap10: {
        gap: s(10)
    },
    gap4: {
        gap: s(4)
    },
    gap2: {
        gap: s(2)
    },
    gap6: {
        gap: s(6)
    },
    gap12: {
        gap: s(12)
    },
    gap16: {
        gap: s(16)
    },
    gap17: {
        gap: s(17)
    },
    gap14: {
        gap: s(14)
    },
    mb36: {
        marginBottom: s(36),
    },
    mb4: {
        marginBottom: s(4),
    },
    mb5: {
        marginBottom: s(5),
    },
    mb6: {
        marginBottom: s(6),
    },
    mb2: {
        marginBottom: s(2),
    },
    mb8: {
        marginBottom: s(8),
    },
    mt8: {
        marginTop: ms(8)
    },
    mb10: {
        marginBottom: s(10),
    },
    mb12: {
        marginBottom: s(12),
    },
    pb16: {
        paddingBottom: s(16),
    },
    pb14: {
        paddingBottom: s(14),
    },
    pt16: {
        paddingTop: s(16),
    },
    pt24: {
        paddingTop: s(24),
    },
    pt20: {
        paddingTop: s(20),
    },
    mr8: {
        marginRight: s(8)
    },
    ml8: {
        marginLeft: s(8)
    },
    ml22: {
        marginLeft: s(22)
    },
    mb0: {
        marginBottom: 0,
    },
    mb16: {
        marginBottom: s(16),
    },
    mt4: {
        marginTop: s(4),
    },
    mt5: {
        marginTop: s(5),
    },
    mt16: {
        marginTop: s(16),
    },
    my14: {
        marginVertical: s(14),
    },
    mxAuto: {
        marginLeft: "auto",
        marginRight: "auto"
    },
    myAuto: {
        marginTop: "auto",
        marginBottom: "auto"
    },
    mb43: {
        marginBottom: 40,
    },
    mt40: {
        marginTop: 40,
    },
    mb40: {
        marginBottom: 43,
    },
    mb30: {
        marginBottom: 30
    },
    mb24: {
        marginBottom: s(24)
    },
    mt24: {
        marginTop: s(24)
    },
    mt30: {
        marginTop: s(30)
    },
    mb26: {
        marginBottom: s(26)
    },
    mb28: {
        marginBottom: s(28)
    },
    mb32: {
        marginBottom: s(32)
    },
    mb20: {
        marginBottom: s(20),
    },
    mb14: {
        marginBottom: s(14),
    },
    p24: {
        padding: s(24),
    },
    px24: {
        paddingLeft: s(24), paddingRight: s(24)
    },
    px16: {
        paddingLeft: s(16), paddingRight: s(16)
    },
    py24: {
        paddingTop: s(24), paddingBottom: s(24),
    },
    py14: {
        paddingTop: s(14), paddingBottom: s(14),
    },
    py12: {
        paddingTop: s(12), paddingBottom: s(12),
    },
     py8: {
        paddingTop: s(8), paddingBottom: s(8),
    },
    pt0: {
        paddingTop: 0,
    },
    p16: {
        padding: s(16)
    },
    p10: {
        padding: s(10)
    },
    p14: {
        padding: s(14)
    },
    pl16: {
        paddingLeft: s(16)
    },
    p0: {
        padding: 0
    },
    pr0: {
        paddingRight: 0
    },
    
    pb0: {
        paddingBottom: 0
    },
    p22: {
        padding: s(22)
    },
    p8: {
        padding: s(8)
    },
    mt10: {
        marginTop: s(10),
    },
    mt6: {
        marginTop: s(6),
    },
    verifyBtn: {
        borderWidth: 1, borderColor: NEW_COLOR.VERIFY_BTN_BORDER,
        borderBottomRightRadius: 5, borderTopLeftRadius: 0,
        borderTopRightRadius: 5, borderBottomLeftRadius: 0, height: "100%",
        width: 100, backgroundColor: NEW_COLOR.VERIFY_BTN_BG
    },
});

export const statusColor = {
    "submitted": NEW_COLOR.SUBMIT_TEXTCOLOR,
    "pending": NEW_COLOR.TEXT_ORANGE,
    "approved": NEW_COLOR.TEXT_GREEN,
    "success": NEW_COLOR.TEXT_GREEN,
    "rejected": NEW_COLOR.TEXT_RED,
    "not paid": NEW_COLOR.NOT_PAID,
    "paid": NEW_COLOR.PAID,
    "cancelled": NEW_COLOR.CANCELLED,
    "suspended": NEW_COLOR.TEXT_PURPLE,
    "partially paid": NEW_COLOR.PARTIALLYPAID_COLOR,
    "draft" : NEW_COLOR.TEXT_ORANGE,
}
