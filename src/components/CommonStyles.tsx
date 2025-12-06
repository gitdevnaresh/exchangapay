// CardStyles.js

import { StyleService, useStyleSheet } from "@ui-kitten/components";
import { NEW_COLOR } from "../constants/theme/variables";
import { ms, s } from "../constants/theme/scale";

export const commonStyles = StyleService.create({
    disabledBg: {
        backgroundColor: NEW_COLOR.DISABLED_INPUTBG
    },
    textLogo: {
        color: NEW_COLOR.LOGO_TEXT
    },
    dashedLine: {
        backgroundColor: NEW_COLOR.BG_PURPLERDARK,
        borderStyle: "dashed",
        borderWidth: 1, borderColor: NEW_COLOR.BORDER_BOTTOM,
        height: 1, width: "100%"
    },
    sectionStyle: {
        backgroundColor: NEW_COLOR.MENU_CARD_BG,
        padding: 16,
        borderRadius: 16,
    },
    listdarkBg: {
        backgroundColor: NEW_COLOR.MENU_CARD_BG,
        borderRadius: 16,
        padding: s(16),
    },
    listsecondarytext: {
        fontFamily: "PlusJakartaSans-Regular",
        color: NEW_COLOR.PARA_GREY,
        fontSize: ms(12),
    },
    listprimarytext: {
        fontFamily: "PlusJakartaSans-Medium",
        color: NEW_COLOR.TEXT_ALWAYS_WHITE,
        fontSize: ms(14),
    },
    rounded20: {
        borderRadius: 20,
    },
    rounded24: {
        borderRadius: 24,
    },
    rounded16: {
        borderRadius: 16,
    },
    rounded8: {
        borderRadius: s(8),
    },
    hLine: {
        height: 1, width: "100%", borderWidth: 1,
        borderColor: NEW_COLOR.SEARCH_BORDER,
        borderStyle: 'dashed', opacity: 0.3
    },
    hLineSolid: {
        height: 0.7, width: "100%", borderWidth: 1,
        borderColor: NEW_COLOR.SEARCH_BORDER,
        opacity: 0.3
    },
    mx10: {
        marginTop: 10,
        marginBottom: 10,
    },
    relative: {
        position: "relative"
    },
    fs28: {
        fontSize: ms(28),
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
    fs32: {
        fontSize: ms(32)
    },
    fs36: {
        fontSize: ms(36)
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
    textGrey2: {
        color: NEW_COLOR.TEXT_GREY2
    },
    textPending: {
        color: NEW_COLOR.TEXT_PENDING
    },
    textBlack: {
        color: NEW_COLOR.TEXT_BLACK
    },
    textBlue: {
        color: NEW_COLOR.TEXT_BLUE
    },
    text_Black: {
        color: NEW_COLOR.TEXT_BLACK_NEW
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
    textOrange: {
        color: NEW_COLOR.TEXT_ORANGE
    },
    textGoodStatus: {
        color: NEW_COLOR.TEXT_GOOD_STATUS
    },
    textLightGrey: {
        color: NEW_COLOR.TEXT_LIGHTGREY
    },
    textLightWhite: {
        color: NEW_COLOR.TEXT_LIGHT_WHITE
    },
    textAlwaysWhite: {
        color: NEW_COLOR.TEXT_ALWAYS_WHITE
    },
    textpara: {
        color: NEW_COLOR.PARA_GREY
    },
    popupbg: {
        color: NEW_COLOR.POP_UP_BG
    },
    textLightOrange: {
        color: NEW_COLOR.TEXT_LIGHTORANGE
    },
    textError: {
        color: NEW_COLOR.TEXT_RED
    },
    bgBlack: {
        backgroundColor: NEW_COLOR.BG_BLACK
    },
    bgCard: {
        backgroundColor: NEW_COLOR.MENU_CARD_BG
    },
    dflex: {
        flexDirection: "row",
    },
    flexColumn: {
        flexDirection: "column"
    },
    alignCenter: {
        alignItems: "center",
    },
    alignStart: {
        alignItems: "flex-start",
    },
    justifyContent: {
        justifyContent: "space-between",
    },
    justify: {
        justifyContent: "space-between",
    },
    justifyCenter: {
        justifyContent: "center"
    },
    justifyEnd: {
        justifyContent: "flex-end"
    },
    flexWrap: {
        flexWrap: "wrap"
    },
    textRight: {
        textAlign: "right"
    },
    fw800: {
        fontFamily: 'PlusJakartaSans-ExtraBold'
    },
    fw700: {
        fontFamily: "PlusJakartaSans-Bold"
    },
    fw600: {
        fontFamily: "PlusJakartaSans-SemiBold"
    },
    fw500: {
        fontFamily: "PlusJakartaSans-Medium"
    },
    fw400: {
        fontFamily: "PlusJakartaSans-Regular",
    },
    fw300: {
        fontFamily: "PlusJakartaSans-Light",
    },
    fw200: {
        fontFamily: "PlusJakartaSans-ExtraLight",
    },
    textCenter: {
        textAlign: "center",
    },
    orangeSection: {
        backgroundColor: NEW_COLOR.BG_ORANGE,
    },
    container: {
        padding: 24,
        paddingTop: 24,
        flex: 1,
        backgroundColor: NEW_COLOR.SCREENBG_WHITE,
        // backgroundColor: "#1A051D",
    },
    screenBg: {
        backgroundColor: NEW_COLOR.SCREENBG_WHITE,
        // backgroundColor: "#1A051D",
    },
    flex1: {
        flex: 1
    },
    px12: {
        paddingLeft: 12, paddingRight: 12,
    },
    px10: {
        paddingLeft: 10, paddingRight: 10,
    },
    gap8: {
        gap: 8
    },
    gap24: {
        gap: 24,
    },
    gap10: {
        gap: 10
    },
    gap4: {
        gap: 4
    },
    gap12: {
        gap: s(12)
    },
    gap20: {
        gap: 20
    },
    gap16: {
        gap: 16
    },
    mb36: {
        marginBottom: 36,
    },
    mb4: {
        marginBottom: 4,
    },
    mb5: {
        marginBottom: s(5)
    },
    mb8: {
        marginBottom: 8,
    },
    mt8: {
        marginTop: ms(8)
    },
    mt4: {
        marginTop: ms(4)
    },
    mb10: {
        marginBottom: 10,
    },

    mt10: {
        marginTop: 10,
    },
    mt30: {
        marginTop: 30,
    },
    mr8: {
        marginRight: 8
    },
    ml20: {
        marginLeft: 18
    },
    mr12: {
        marginRight: 12
    },
    mb14: {
        marginBottom: 14,
    },
    mt14: {
        marginTop: 14,
    },
    mb16: {
        marginBottom: 16,
    },
    mb12: {
        marginBottom: 12,
    },
    mbs16: {
        marginBottom: ms(16),
    },
    mt16: {
        marginTop: 16,
    },
    mt22: {
        marginTop: 22,
    },
    sectiontitle: {
        fontSize: s(16),
        fontFamily: "PlusJakartaSans-Bold",
        color: NEW_COLOR.TEXT_ALWAYS_WHITE

    },
    sectionlink: {
        fontSize: s(14),
        fontFamily: "PlusJakartaSans-Regular",
        color: NEW_COLOR.TEXT_ORANGE,

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
        marginBottom: 43,
    },
    mb30: {
        marginBottom: 30
    },
    mb24: {
        marginBottom: 24
    },
    mb42: {
        marginBottom: s(42)
    },
    mbs24: {
        marginBottom: s(24)
    },
    mb26: {
        marginBottom: 26
    },
    mb28: {
        marginBottom: 28
    },
    mb32: {
        marginBottom: 32
    },
    mb20: {
        marginBottom: 20,
    },
    p24: {
        padding: 24,
    },
    px24: {
        paddingLeft: 24, paddingRight: 24
    },
    px16: {
        paddingLeft: 16, paddingRight: 16
    },
    py24: {
        paddingTop: 24, paddingLeft: 24,
    },
    ptb24: {
        paddingTop: 24, paddingBottom: 24,
    },
    dashedBorder: {
        borderBottomWidth: 1,
        borderStyle: 'dashed',
        marginVertical: 35,
    },
    dashedBStyle: {
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: NEW_COLOR.TEXT_ALWAYS_WHITE
    },
    p16: {
        padding: s(16)
    },
    p12: {
        padding: s(12)
    },
    p8: {
        padding: s(8)
    },
    pt0: {
        paddingTop: 0
    },
    mt60: {
        marginTop: s(50)
    },
    DashedBrown: {
        borderColor: NEW_COLOR.BORDER_BROWN
    },
    DashedGreen: {
        borderColor: "#1AAF87"
    },
    cancelBtn: {
        backgroundColor: "transparent",
    },
    cancelBtnTitle: {
        color: NEW_COLOR.BTN_BORDER_PURPLR,
    },
    btnBorder: {
        borderColor: NEW_COLOR.BTN_BORDER_PURPLR,
        borderWidth: 1, borderRadius: 100,
    },
    toCapitalize: {
        textTransform: 'capitalize'
    },
    activeItemBg: {
        backgroundColor: "#34383E",
    },
    image_Bg: {
        backgroundColor: NEW_COLOR.BG_IMG
    }, sectionGap: {
        marginBottom: s(32)
    }, titleSectionGap: {
        marginBottom: s(16)
    }, textLeft: {
        textAlign: "left"
    }, ActiveCarousel: {
        width: s(18),
        height: s(5),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.TEXT_WHITE,
    }, InActiveCarousel: {
        width: s(6),
        height: s(6),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.BG_GREEN,
    },
    kpibg: {
        backgroundColor: NEW_COLOR.MENU_CARD_BG,
    }, outgoingMessage: {
        backgroundColor: NEW_COLOR.MENU_CARD_BG,
        alignSelf: 'flex-end',
        minWidth: s(200)
    },
    incomingMessage: {
        backgroundColor: NEW_COLOR.SECTION_BG,
        alignSelf: 'flex-start', minWidth: s(200)
    },
    chatuserchat: {
        backgroundColor: NEW_COLOR.SECTION_BG,
    }
});

export const useCommonStyles = () => {
    return useStyleSheet(commonStyles);
};

export const statusColor = {
    approved: NEW_COLOR.BG_GREEN,
    completed: NEW_COLOR.BG_GREEN,
    pending: NEW_COLOR.BG_YELLOW,
    submitted: NEW_COLOR.BG_BLUE,
    failed: NEW_COLOR.BG_RED,
    fail: NEW_COLOR.BG_RED,
    rejected: NEW_COLOR.BG_RED,
    finished: NEW_COLOR.BG_GREEN,
    freezed: NEW_COLOR.TEXT_GREY,
    unfreezed: NEW_COLOR.BG_GREEN,
    cancelled: NEW_COLOR.BG_RED,
    requested: NEW_COLOR.BG_YELLOW,
    reopened: NEW_COLOR.BG_ORANGE
}
