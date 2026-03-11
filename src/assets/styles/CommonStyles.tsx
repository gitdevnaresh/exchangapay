// CardStyles.js

import { StyleService } from "@ui-kitten/components";
import { NEW_COLOR, WINDOW_HEIGHT, WINDOW_WIDTH } from "../../constants/theme/variables"; // NEW_COLOR will be passed
import { ms, s } from "../../constants/theme/scale";
import { text } from "../../constants/theme/mixins";
import { Platform } from "react-native";
import UsdtIcon from './../../assets/vectorAssets/usdt.svg'
import BtcIcon from "../../assets/vectorAssets/btc.svg"
import EthIcon from '../../assets/vectorAssets/eth.svg'



export const statusColor: any = {
    "submitted": NEW_COLOR.SUBMIT_TEXTCOLOR,
    "pending": NEW_COLOR.PENDING_STATUS,
    "approved": NEW_COLOR.TEXT_GREEN,
    "active": NEW_COLOR.TEXT_GREEN,
    "success": NEW_COLOR.TEXT_GREEN,
    "rejected": NEW_COLOR.TEXT_RED,
    "not paid": NEW_COLOR.NOT_PAID,
    "paid": NEW_COLOR.TEXT_GREEN,
    "cancelled": NEW_COLOR.CANCELLED,
    "suspended": NEW_COLOR.TEXT_PURPLE,
    "partially paid": NEW_COLOR.PARTIALLYPAID_COLOR,
    "draft": NEW_COLOR.TEXT_ORANGE,
    "transferred": NEW_COLOR.PARTIALLYPAID_COLOR,
    "delivered": NEW_COLOR.TEXT_GREEN,
    "refunded": NEW_COLOR.CANCELLED,
    "shipped": NEW_COLOR.TEXT_ORANGE,
    "expired": NEW_COLOR.TEXT_RED,
    "partially utilized": NEW_COLOR.PARTIALLYUTILISED_COLOR,
    "utilized": NEW_COLOR.TEXT_GREEN,
    "Processing": NEW_COLOR.TEXT_ORANGE,
    "under review": NEW_COLOR.TEXT_ORANGE,
    "ordered": NEW_COLOR.TEXT_BLUE,
    "shipping": NEW_COLOR.PENDING_STATUS,
    "cancel": NEW_COLOR.CANCELLED,
    "freezed": NEW_COLOR.TEXT_YELLOW,
    "approval in progress": NEW_COLOR.TEXT_ORANGE,
    "reopened": NEW_COLOR.TEXTORANGE,
    "requested": NEW_COLOR.SUBMIT_TEXTCOLOR,
    "completed": NEW_COLOR.TEXT_GREEN,
    "failed": NEW_COLOR.TEXT_RED,
    "open": NEW_COLOR.TEXT_RED,
    "solved": NEW_COLOR.TEXT_GREEN,
    "closed": NEW_COLOR.TEXT_GREEN,
    "new": NEW_COLOR.TEXT_GREEN,







}

export const LightStatusBgColor = {
    "submitted": NEW_COLOR.SUBMIT_TEXTCOLOR,
    "pending": NEW_COLOR.PENDING_STATUS,
    "approved": '#DDFFE5',
    "active": NEW_COLOR.TEXT_GREEN,
    "success": NEW_COLOR.TEXT_GREEN,
    "rejected": NEW_COLOR.TEXT_RED,
    "not paid": NEW_COLOR.NOT_PAID,
    "paid": NEW_COLOR.TEXT_GREEN,
    "cancelled": NEW_COLOR.CANCELLED,
    "suspended": NEW_COLOR.TEXT_PURPLE,
    "partially paid": NEW_COLOR.PARTIALLYPAID_COLOR,
    "draft": NEW_COLOR.TEXT_ORANGE,
    "transferred": NEW_COLOR.PARTIALLYPAID_COLOR,
    "delivered": NEW_COLOR.TEXT_GREEN,
    "refunded": NEW_COLOR.CANCELLED,
    "shipped": NEW_COLOR.TEXT_ORANGE,
    "expired": NEW_COLOR.TEXT_RED,
    "partially utilized": NEW_COLOR.PARTIALLYUTILISED_COLOR,
    "utilized": NEW_COLOR.TEXT_GREEN,
    "Processing": NEW_COLOR.TEXT_ORANGE,
    "under review": NEW_COLOR.TEXT_ORANGE,
    "ordered": NEW_COLOR.TEXT_BLUE,
    "shipping": NEW_COLOR.PENDING_STATUS,
    "cancel": NEW_COLOR.CANCELLED,
    "freezed": NEW_COLOR.TEXT_ACTIVE,

}

export const PackageBorderCOlor = {
    "silver": NEW_COLOR.TEXT_YELLOW,
    "gold": NEW_COLOR.TEXT_GREEN,
    "platinum": NEW_COLOR.BRONZE_BLUE,
    "bronze": NEW_COLOR.BRONZE_BLUE,
}







































export const getThemedCommonStyles = (NEW_COLOR: any) => StyleService.create({

    rowReverse: {
        flexDirection: "row-reverse"
    },
    closeIcon: {
        position: "absolute", right: s(16),
        top: s(16)
    },
    disabledBg: {
        backgroundColor: NEW_COLOR.DISABLEDINPUTBG
    },
    borderPrimary: {
        borderWidth: 1, borderRadius: 5, borderColor: NEW_COLOR.PRiMARY_COLOR,
    },
    actionCircle: {
        height: s(42), width: s(42), borderColor: NEW_COLOR.PRiMARY_COLOR,
        borderWidth: 1, borderRadius: s(42) / 2
    },
    submenuPl: {
        paddingLeft: s(50), paddingRight: s(16), gap: s(14)
    },
    removeCartItem: {
        borderWidth: 1, borderColor: NEW_COLOR.TEXT_RED,
        paddingHorizontal: s(8), paddingVertical: s(4), borderRadius: s(5)
    },
    tabLine: {
        height: s(4),
        width: "100%", marginTop: s(8),
        borderTopLeftRadius: s(5), borderTopRightRadius: s(5),
    },
    nextOuter: {
        borderWidth: s(3),
        borderColor: NEW_COLOR.PRiMARY_COLOR,
        borderRadius: s(100) / 2,
        padding: s(8)
    },
    nextInner: {
        height: s(44),
        width: s(44), backgroundColor: NEW_COLOR.PRiMARY_COLOR,
        borderRadius: s(44) / 2
    },
    shadowOverlay: {
        position: "absolute",
        bottom: -1,
        left: 0,
        right: 0,
        height: "40%",
    },
    productItemStyle: {
        backgroundColor: NEW_COLOR.SECTION_BG_COLOR,
        borderRadius: s(5), borderWidth: 1, borderColor: NEW_COLOR.TRANSPARENT,
        width: s(183.4),
    },
    languageLetterBg: {
        backgroundColor: NEW_COLOR.LANGUAGE_LETTERBG, padding: s(8),
        borderRadius: s(5),
    },
    borderSeparate: {
        borderWidth: 1, borderTopColor: NEW_COLOR.SECTION_BORDER, borderRightColor: NEW_COLOR.SECTION_BORDER, borderBottomColor: NEW_COLOR.SECTION_BORDER, borderLeftColor: NEW_COLOR.SECTION_BORDER,
    },
    roundedT5: {
        borderTopLeftRadius: s(5), borderTopRightRadius: s(5)
    },
    roundedB5: {
        borderBottomLeftRadius: s(5), borderBottomRightRadius: s(5)
    },
    iconbg: {
        width: s(40),
        height: s(40),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.CIRCLE_BG,
        flexDirection: "row",
        alignItems: "center",
    },
    communityiconbg: {
        width: s(36),
        height: s(36),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.CIRCLE_BG,
        flexDirection: "row",
        alignItems: "center",
    },
    ratingCircle: {
        width: s(44),
        height: s(44),
        borderRadius: s(22),
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    shareIconBg: {
        width: s(48),
        height: s(48),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.CIRCLE_BG_COLOR,
        flexDirection: "row",
        alignItems: "center",
    },
    modalIconbg: {
        width: s(40),
        height: s(40),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.ICONBG,
        flexDirection: "row",
        alignItems: "center",
    },
    iconcirclebg: {
        width: s(40),
        height: s(40),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.ICON_CIRCLE_BG,
        flexDirection: "row",
        alignItems: "center",
    },
    referralsbg: {
        backgroundColor: NEW_COLOR.REFERRALA_BG
    },
    cardquicklinks: {
        width: s(118),
        height: s(44),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.QUICK_LINKS,

    }, error_Border: {
        borderWidth: 1,
        borderColor: NEW_COLOR.TEXT_RED,
        borderRadius: s(5)
    }, success_Border: {
        borderWidth: 1,
        borderColor: NEW_COLOR.BG_GREEN,
        borderRadius: s(5)
    },
    alphabetLetterActive: {
        backgroundColor: NEW_COLOR.ACTIVE_ITEM, // or NEW_COLOR.BG_GRAY
        borderRadius: s(8),
        paddingHorizontal: s(6),
        paddingVertical: s(2),
    },
    alphabetLetter: {
        marginVertical: 2,
        fontWeight: '400',
    },

    rounded16: {
        borderRadius: s(5)
    },
    rounded20: {
        borderRadius: s(20)
    },
    packageBadge: {
        paddingHorizontal: s(8), paddingVertical: s(4), position: "absolute", top: 0, right: 14
    },
    packageCircle: {
        height: s(20), width: s(20), borderRadius: s(20),
        borderWidth: s(4), backgroundColor: NEW_COLOR.BACKGROUND_WHITE,
    },
    dbRefCode: {
        shadowColor: '#000', // Shadow color
        shadowOffset: { width: 0, height: 3 }, // Shadow offset (0px horizontal, 3px vertical)
        shadowOpacity: 0.12, // Shadow opacity (0.12)
        shadowRadius: 8, // Shadow blur radius (8px)
        elevation: 5, backgroundColor: NEW_COLOR.TEXT_BLACK, paddingRight: s(8), paddingLeft: s(8),
        paddingTop: s(6), paddingBottom: s(6),
        borderRadius: s(5), borderWidth: 1, borderColor: NEW_COLOR.SECTION_BORDER,
    },
    dbAdvertisement: {
        borderRadius: s(8), // Equivalent to border-radius: 8px
        backgroundColor: NEW_COLOR.TEXT_BLACK, // Equivalent to background: #FFF
        shadowColor: '#000', // Shadow color
        shadowOffset: { width: 0, height: 0 }, // Shadow offset
        shadowOpacity: 0.25, // Equivalent to rgba(0, 0, 0, 0.25)
        shadowRadius: 4, // Equivalent to box-shadow: 0px 0px 4px 0px
        elevation: 4, // Android shadow (optional, for better shadow on Android)
        minHeight: s(146), marginHorizontal: 1, borderWidth: 1
    },
    inactiveDot: {
        height: s(8), width: s(8), borderRadius: s(8) / 2,
        backgroundColor: NEW_COLOR.INPUT_BORDER
    },
    activeDot: {
        height: s(6), width: s(6), borderRadius: s(6) / 2,
        backgroundColor: NEW_COLOR.TEXT_link
    },
    dotBorder: {
        padding: s(2), borderWidth: 1, borderColor: NEW_COLOR.PRiMARY_COLOR,
        borderRadius: s(100) / 2,
    },
    Currencyborder: {
        padding: s(14), borderWidth: 1, borderColor: NEW_COLOR.TEXT_WHITE,
        borderRadius: s(5) / 2,
    },

    createVaultBtn: {
        paddingLeft: s(14), paddingRight: s(14), paddingTop: s(6), paddingBottom: s(6),
    },
    kycBadge: {
        paddingLeft: s(11), paddingRight: s(11), paddingTop: s(3), paddingBottom: s(3),
        borderRadius: 12,
    },
    backArrow: {
        padding: s(16)
    },
    // expandTouchArea: {
    //     paddingLeft: s(10), paddingRight: s(10), paddingTop: s(2), paddingBottom: s(2),
    //     minWidth: s(18,)
    // },
    errorBorder: {
        borderColor: NEW_COLOR.TEXT_RED
    },
    textgraph: {
        color: NEW_COLOR.GRAPH_TEXT

    },
    logintext: {
        color: NEW_COLOR.LOGIN_TEXT

    },
    px10: {
        paddingLeft: s(10), paddingRight: s(10)
    },
    textStrike: {
        textDecorationLine: 'line-through',
        textDecorationStyle: 'solid'
    },
    textCapitalize: {
        textTransform: 'capitalize'
    },
    buttonText: {
        color: NEW_COLOR.Button_text
    },
    overflowHidden: {
        overflow: 'hidden'
    },
    bgGrayLight: {
        backgroundColor: NEW_COLOR.GRAY_LIGHT
    },
    rewardsbg: {
        backgroundColor: NEW_COLOR.APPLY_CARD_BG
    },

    formItemSpace: {
        marginBottom: s(16)
    },
    ActiveCarousel: {
        width: s(18),
        height: s(5),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.TEXT_WHITE,
    },
    InActiveCarousel: {
        width: s(6),
        height: s(6),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.CAROUSEL_BG,
    },
    sectionGap: {
        marginBottom: s(32)
    },
    mb48: {
        marginBottom: s(48)
    },
    mb72: {
        marginBottom: s(72)
    },
    titleSectionGap: {
        marginBottom: s(16)
    },
    listChildGap: {
        marginBottom: s(6)
    },
    listGap: {
        marginBottom: s(24)
    },
    transactionsGap: {
        marginBottom: s(6)
    },
    profileMenulistGap: {
        marginBottom: s(6)
    },
    rbsheetList: {
        marginBottom: s(20)
    },
    overlayBg: {
        backgroundColor: NEW_COLOR.OVERLAY_BG
    },
    borderDashed: {
        borderStyle: "dashed"
    },
    opacity08: {
        opacity: 0.8
    },
    flexCol: {
        flexDirection: "column"
    },
    nameIconStyle: {
        height: s(35), width: s(35),
        borderRadius: s(35) / 2,
        backgroundColor: NEW_COLOR.PAYEE_LIST,
    },
    activeNameIconStyle: {
        height: s(34), width: s(34),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.PRiMARY_COLOR,
    },
    activeItemBg: {
        backgroundColor: NEW_COLOR.ACTIVE_ITEM,
    },
    bordered: {
        borderWidth: 1, borderColor: NEW_COLOR.SECTION_BORDER,
    },
    kpiStyle: {
        backgroundColor: NEW_COLOR.SECTION_BG, flex: 1,
        borderRadius: s(5), borderTopWidth: 1, borderTopColor: NEW_COLOR.KPI_BORDER,
    },
    sectionBordered: {
        backgroundColor: NEW_COLOR.TRANSPARENT, padding: s(16),
        borderRadius: s(5), borderWidth: 1, borderColor: NEW_COLOR.SECTION_BORDER,
    },
    accordianInactiveBorder: {
        borderRadius: s(5), borderWidth: 1, borderColor: NEW_COLOR.TRANSPARENT,
    },
    accordianActiveBorder: {
        borderRadius: s(5), borderWidth: 1, borderColor: NEW_COLOR.SECTION_BORDER,
    },
    listBorder: {
        borderWidth: 1, borderColor: NEW_COLOR.LIST_BORDER,
        borderRadius: s(5), padding: s(14),
    },
    listStyle: {
        paddingTop: s(10), backgroundColor: NEW_COLOR.TRANSPARENT,
        paddingBottom: s(10)
    },
    accordianListStyle: {
        padding: s(12), backgroundColor: NEW_COLOR.ACCORDIAN_LIST_BG,
        borderTopWidth: 1, borderBottomWidth: 1, borderColor: NEW_COLOR.LIST_BORDER,
        borderRadius: 0,
    },
    attachmentStyle: {
        padding: s(10),
        borderWidth: 1, borderColor: NEW_COLOR.ATTACHMENT_BORDER,
        flexDirection: "row", alignItems: "center", gap: 8, borderRadius: s(5),
        marginTop: s(10)
    },
    uploadStyle: {
        paddingVertical: s(34),
        paddingHorizontal: s(16), borderWidth: 1,
        borderRadius: s(5), borderStyle: "dashed", borderColor: NEW_COLOR.BORDER_COLOR2
    },
    verifyBtn: {
        borderWidth: 1, borderColor: NEW_COLOR.TEXT_WHITE,
        borderBottomRightRadius: s(5), borderTopLeftRadius: 0,
        borderTopRightRadius: s(5), borderBottomLeftRadius: 0, height: s(48),
        width: s(80), backgroundColor: NEW_COLOR.VERIFY_BTN_BG
    },
    verify: {
        borderColor: NEW_COLOR.TEXT_WHITE,
        borderBottomRightRadius: s(5), borderTopLeftRadius: 0,
        borderTopRightRadius: s(5), borderBottomLeftRadius: 0, height: s(48),
        width: s(75), backgroundColor: NEW_COLOR.VERIFY_BTN_BG
    },

    radioDot: {
        width: s(24),
        justifyContent: 'center',
        alignItems: 'center',
        height: s(24), borderRadius: s(100), backgroundColor: NEW_COLOR.BG_YELLOW,
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: NEW_COLOR.BOTTOM_LISTBG,
        borderRadius: s(12),
        padding: s(16),
        marginBottom: s(12),
        gap: s(12)
    },
    radioInactive: {
        borderWidth: 1,
        borderRadius: s(100), borderColor: NEW_COLOR.RADIO_BORDER,
        width: s(24), height: s(24)
    },
    radioOuter: {
        height: s(24),
        width: s(24),
        borderRadius: s(12),
        borderWidth: s(2),
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: NEW_COLOR.INPUT_BORDER,
    },
    radioActive: {
        borderColor: NEW_COLOR.TEXT_WHITE,
    },
    radioBg: {
        backgroundColor: NEW_COLOR.INPUTFIELD_BG, // or your preferred color
    },
    cardBg: {
        backgroundColor: NEW_COLOR.CARD_BG, // or your preferred card background color
    },
    cardPrivacyRedDot: {
        width: 12, height: 12, borderRadius: 6, backgroundColor: NEW_COLOR.TEXT_WHITE,
    },
    cardPrivacyRadioInactive: {
        borderWidth: 1,
        borderRadius: s(100), borderColor: NEW_COLOR.TEXT_link,
        width: s(18), height: s(18)
    },
    textYellow: {
        color: NEW_COLOR.TEXT_YELLOW,
    },
    bannerBg: {
        backgroundColor: NEW_COLOR.BANNER_BG,
    },
    infoBoxBg: {
        backgroundColor: NEW_COLOR.INFO_BOX_BG, // or NEW_COLOR.INFO_BOX_BG if you add it
    },
    registerTitle: {
        fontSize: ms(25), fontFamily: "Manrope-Medium", lineHeight: ms(36),
        color: NEW_COLOR.TEXT_WHITE, textAlign: "center"
    },
    radioInactive: {
        borderWidth: 1,
        borderRadius: s(100), borderColor: NEW_COLOR.TEXT_link,
        width: s(18), height: s(18)
    },
    accountTypeStyle: {
        backgroundColor: NEW_COLOR.TRANSPARENT,
        borderWidth: 1, borderColor: NEW_COLOR.BORDER_LIGHT_GREEN,
        borderRadius: 5, padding: s(16)
    },
    h56: {
        height: s(56)
    },
    h40: {
        height: s(40)
    },
    mailGifImage: {
        width: s(190),
        height: s(191), marginLeft: "auto",
        marginRight: "auto",
    },
    halfHeight: {
        height: WINDOW_HEIGHT
    },
    halfWidth: {
        width: WINDOW_WIDTH / 2
    },
    badgeStyle: {
        paddingHorizontal: s(25),
        height: s(40),
        borderRadius: s(12),
    },
    cardBadge: {
        paddingHorizontal: s(10),
        height: s(17),
        borderRadius: s(10),
        paddingttop: s(2),
        paddingbottom: s(2)
    },

    rounded10: {
        borderRadius: s(10)
    },
    rounded12: {
        borderRadius: s(12)
    },
    rounded11: {
        borderRadius: s(12)
    },
    rounded5: {
        borderRadius: s(5)
    },
    rounded4: {
        borderRadius: s(4)
    },
    // Add to getThemedCommonStyles in CommonStyles.tsx
    currencyListItem: {
        position: 'relative',
        borderRadius: s(8),
        // Optionally add border or background if needed
    },
    currencyLogo: {
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.TEXT_GREEN || NEW_COLOR.TEXT_GREEN, // Use a theme variable
    },
    currencyLogoSelected: {
        // Optional: add a border or effect for selected
    },
    mt2: {
        marginTop: 2,
    },
    alphabetHeader: {
        backgroundColor: NEW_COLOR.ALPHABET_HEADER_BG,
        paddingVertical: s(8),
        paddingHorizontal: s(16),
    },
    alphabetHeaderText: {
        color: NEW_COLOR.ALPHABET_HEADER_TEXT,
        fontSize: s(16),
        fontWeight: '600',
        marginBottom: s(8)
    },
    fs16: {
        fontSize: s(16),
    },
    rounded100: {
        borderRadius: s(100) / 2
    },
    rounded0: {
        borderRadius: 0
    },
    rounded8: {
        borderRadius: s(8)
    },
    rounded7: {
        borderRadius: s(7)
    },
    rounded50: {
        borderRadius: s(40)
    },
    rounded2: {
        borderRadius: 2
    },
    rounded30: {
        borderRadius: s(30)
    },
    rounded25: {
        borderRadius: s(25)
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: ms(16),
        height: s(48),
        borderRadius: s(10),
        backgroundColor: NEW_COLOR.SEARCHBOX_BG,
        alignItems: "center",
        gap: s(10)
    },
    accordianSearchContainer: {
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        flexDirection: 'row',
        paddingHorizontal: ms(16),
        height: s(44),
        borderRadius: 0,
        backgroundColor: NEW_COLOR.TRANSPARENT,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderTopColor: NEW_COLOR.SEARCH_BORDER,
        borderBottomColor: NEW_COLOR.SEARCH_BORDER
    },
    transactionsCard: {
        backgroundColor: NEW_COLOR.BG_GRAY,
        padding: s(8),
        borderRadius: s(12),
    },
    detailsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: NEW_COLOR.BG_GRAY,
        padding: s(8),
        borderRadius: s(12),
    },
    personalInformation: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: NEW_COLOR.APPLY_CARD_BG,
        padding: s(8),
        borderRadius: s(12),
    },
    searchInput: {
        ...text(14, 16.8, 400, NEW_COLOR.TEXT_LIGHT, true),
        position: 'relative',
        width: "100%",
        paddingVertical: 1,
        color: NEW_COLOR.TEXT_WHITE, flex: 1, marginRight: s(20),
        fontSize: ms(16), fontFamily: "Manrope-SemiBold", lineHeight: ms(22)
    },
    vAccordinBg: {
        backgroundColor: NEW_COLOR.VACCORDIAN_BG
    },
    searchBlackBg: {
        backgroundColor: NEW_COLOR.SEARCH_BLACK_BG
    },
    textGrey2: {
        color: NEW_COLOR.TEXT_GREY2
    },
    textGrey8: {
        color: NEW_COLOR.TEXT_GREY8
    },
    textGreyLight: {
        color: NEW_COLOR.GRAY_LIGHT
    },
    textBlue3: {
        color: NEW_COLOR.TEXT_BLUE3
    },
    graphtext: {
        color: NEW_COLOR.GRAPH_TEXT
    },

    getStartedText: {
        color: NEW_COLOR.TITLE_TEXT
    },
    btn_Gray: {
        backgroundColor: NEW_COLOR.BG_GRAY,
    },
    bg_yellow: {
        backgroundColor: NEW_COLOR.BG_YELLOW
    }, text_yellow: {
        color: NEW_COLOR.BG_YELLOW
    },
    check_Bg: {
        backgroundColor: NEW_COLOR.CHECK_BOX_BG
    },
    line: {
        height: 1, width: s(99), backgroundColor: NEW_COLOR.BORDER_COLOR
    },
    border_color: { borderColor: NEW_COLOR.BORDER_COLOR },


    sectionBorder: {
        borderWidth: 1,
        borderColor: NEW_COLOR.WALLET_BORDER,
        borderRadius: s(50),
    },
    dashboardSectionBorder: {
        borderWidth: 1,
        borderColor: NEW_COLOR.DB_SECTION_BORDER,
        borderRadius: s(5),
    },
    borderTransparent: {
        borderWidth: 1,
        borderColor: NEW_COLOR.TRANSPARENT,
        borderRadius: s(5),
    },
    sectionStyle: {
        backgroundColor: NEW_COLOR.SECTION_BG_COLOR,
        padding: s(14), borderRadius: 5,
        borderWidth: 1,
        borderColor: NEW_COLOR.SECTION_BORDER,
    },
    SectionBorderOnly: {
        backgroundColor: NEW_COLOR.TRANSPARENT,
        borderRadius: s(5),
        borderWidth: 1,
        borderColor: NEW_COLOR.SECTION_BORDER,
    },
    sectionBg: {
        backgroundColor: NEW_COLOR.TRANSPARENT,
        borderRadius: s(5),
        borderWidth: 1,
        borderColor: NEW_COLOR.TRANSPARENT,
    },
    sectionBgColor: {
        backgroundColor: NEW_COLOR.SECTION_BG_COLOR,
        borderColor: NEW_COLOR.TRANSPARENT,
    },
    bgGray4: {
        backgroundColor: NEW_COLOR.BG_GRAY4
    },
    bgBtn: {
        backgroundColor: NEW_COLOR.BTN_COLOR
    },
    bgtransparent: {
        backgroundColor: NEW_COLOR.TRANSPARENT
    },
    sectionDarkBg: {
        backgroundColor: NEW_COLOR.SECTION_DARK_BG
    },
    pageTitle: {
        fontSize: ms(18),
        color: NEW_COLOR.SUB_TITLE_COLOR,
        fontFamily: "Manrope-Medium"
    },
    sectionTitle: {
        fontSize: ms(20), lineHeight: ms(100),
        color: NEW_COLOR.TEXT_WHITE,
        fontFamily: "Manrope-SemiBold"
    },
    Amounttitle: {
        fontSize: ms(26), lineHeight: ms(26),
        color: NEW_COLOR.TEXT_WHITE,
        fontFamily: "Manrope-Medium",
        textAlign: "center"
    },
    applycardbg: {
        backgroundColor: NEW_COLOR.BANNER_BG
    },
    sectionLink: {
        fontSize: ms(14),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_link,
        lineHeight: ms(26),

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
    summaryLine: {
        height: 1, width: "100%", backgroundColor: NEW_COLOR.TRANSPARENT,
        borderTopWidth: 1, borderColor: NEW_COLOR.TEXT_GREY, borderStyle: "dashed",
        marginVertical: s(14)
    },
    vLine: {
        height: "100%", width: 1, backgroundColor: NEW_COLOR.DIVIDER_COLOR
    },
    vLineDashed: {
        height: "100%", width: 1, backgroundColor: NEW_COLOR.TRANSPARENT,
        borderLeftWidth: 1, borderColor: NEW_COLOR.TEXT_GREY, borderStyle: "dashed",
    },
    relative: {
        position: "relative"
    },
    fs28: {
        fontSize: ms(28), lineHeight: ms(34),
        includeFontPadding: false,
    },
    fs26: {
        fontSize: ms(26), lineHeight: ms(32),
        includeFontPadding: false,
    },
    fs24: {
        fontSize: ms(24), lineHeight: ms(30),
        includeFontPadding: false,
    },
    fs22: {
        fontSize: ms(22), lineHeight: ms(28),
        includeFontPadding: false,
    },
    fs20: {
        fontSize: ms(20), lineHeight: ms(25),
        includeFontPadding: false,
    },
    fs18: {
        fontSize: ms(18), lineHeight: ms(23),
        includeFontPadding: false,
    },
    fs16: {
        fontSize: ms(16), lineHeight: ms(21),
        includeFontPadding: false,
    },
    fs14: {
        fontSize: ms(14), lineHeight: ms(17),
        includeFontPadding: false,
    },
    fs14_24: {
        fontSize: ms(14), lineHeight: ms(24),
        includeFontPadding: false,
    },
    fs12: {
        fontSize: ms(12), lineHeight: ms(15),
        includeFontPadding: false,
    },
    fs10: {
        fontSize: ms(10), lineHeight: ms(13),
        includeFontPadding: false,
    },
    fs8: {
        fontSize: ms(8), lineHeight: ms(10),
        includeFontPadding: false,
    },
    fs6: {
        fontSize: ms(6), lineHeight: ms(8),
        includeFontPadding: false,
    },
    fs30: {
        fontSize: ms(30), lineHeight: ms(36),
        includeFontPadding: false,

    },
    fs32: {
        fontSize: ms(32), lineHeight: ms(38),
        includeFontPadding: false,
    },
    fs34: {
        fontSize: ms(34), lineHeight: ms(40),
        includeFontPadding: false,
    },
    fs36: {
        fontSize: ms(36), lineHeight: ms(42),
        includeFontPadding: false,
    },
    fs40: {
        fontSize: ms(40), lineHeight: ms(46),
        includeFontPadding: false,
    },
    fs60: {
        fontSize: ms(60), lineHeight: ms(60),
        includeFontPadding: false
    },
    fs64: {
        fontSize: ms(64), lineHeight: ms(72),
        includeFontPadding: false
    },
    input: {
        borderWidth: 1,
        borderColor: NEW_COLOR.INPUT_BORDER,
        borderRadius: s(5),
        fontSize: ms(14), color: NEW_COLOR.TEXT_WHITE,
        textAlignVertical: 'center', height: s(48),
        paddingHorizontal: s(12), fontFamily: "Manrope-Regular",
    },
    withdrawPayeeInput: {
        borderWidth: 1,
        borderColor: NEW_COLOR.INPUT_BORDER,
        borderRadius: s(5),
        fontSize: ms(14), color: NEW_COLOR.TEXT_WHITE,
        textAlignVertical: 'center', height: s(59),
        paddingHorizontal: 16, fontFamily: "Manrope-Regular",
    },
    textInput: {
        backgroundColor: NEW_COLOR.INPUTFIELD_BG,
        // borderColor: NEW_COLOR.INPUT_BORDER,
        borderRadius: s(12),
        paddingHorizontal: s(16),
        fontSize: s(16), color: NEW_COLOR.TEXT_WHITE,
        height: s(48),
        fontFamily: "Manrope-Regular"

    },
    amountInputContainer: {
        backgroundColor: NEW_COLOR.INPUTFIELD_BG,
        borderRadius: s(12),
        paddingHorizontal:s(8),
        padding:s(8),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    disableTextInput: {
        // backgroundColor: NEW_COLOR.INPUTFIELD_BG,
        borderRadius: s(12),
        paddingHorizontal: s(16),
        fontSize: s(16), color: NEW_COLOR.TEXT_WHITE,
        height: s(48),
        fontFamily: "Manrope-Regular",
        opacity: 0.5
    },
    amountInput: {
        borderBottomWidth: 1,
        borderBottomColor: NEW_COLOR.INPUT_BORDER,
        borderRadius: 0,
        fontSize: ms(28), color: NEW_COLOR.TEXT_WHITE,
        textAlign: "center",
        fontFamily: "Manrope-Regular"
    },
    inputLabel: {
        // position: "absolute", left: 14, top: -15, backgroundColor: NEW_COLOR.SCREENBG_BLACK,
        // zIndex: 1,
        // padding: s(3),
        marginBottom: s(10),
        // color: NEW_COLOR.TEXT_WHITE,
        color: NEW_COLOR.TEXT_WHITE,
        fontSize: ms(12),
        fontFamily: "Manrope-Regular"

    },
    borderColor: {
        borderWidth: 1,
        borderColor: NEW_COLOR.INPUT_BORDER,
        borderRadius: s(12),
    },
    amountInputLabel: {
        marginBottom: s(10),
        color: NEW_COLOR.TEXT_WHITE,
        fontSize: ms(16),
        fontFamily: "Manrope-Medium"

    },
    payeeLabel: {
        marginTop: s(24),
        color: NEW_COLOR.TEXT_WHITE,
        fontSize: ms(16),
        fontFamily: "Manrope-Medium"

    },
    //listStylees in swokipay
    list: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: s(8),
        borderWidth: 1,
        borderColor: NEW_COLOR.INPUT_BORDER,
        borderRadius: s(12),
    },
    list_p14: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: s(14),
        borderWidth: 1,
        borderColor: NEW_COLOR.INPUT_BORDER,
        borderRadius: s(12),
    },
    preferredPayment: {
        padding: s(12),
        borderWidth: 1,
        borderColor: NEW_COLOR.INPUT_BORDER,
        borderRadius: s(12),
    },
    appLock: {
        paddingLeft: s(8), paddingRight: s(8),
        paddingTop: s(14), paddingBottom: s(14),
        borderWidth: 1,
        borderColor: NEW_COLOR.INPUT_BORDER,
        borderRadius: s(12),
    },
    appLockoutside: {
        padding: s(8),
        borderWidth: 1,
        borderColor: NEW_COLOR.INPUT_BORDER,
        borderRadius: s(12),
    },
    appLock_14: {
        padding: s(14),
        borderWidth: 1,
        borderColor: NEW_COLOR.INPUT_BORDER,
        borderRadius: s(12),
    },
    list_text: {
        color: NEW_COLOR.LIST_TEXT,
    },
    bgWhite: {
        backgroundColor: NEW_COLOR.TEXT_WHITE
    },
    bgAlwaysWhite: {
        backgroundColor: NEW_COLOR.TEXT_ALWAYS_WHITE
    },
    sheetHeaderbg: {
        backgroundColor: NEW_COLOR.SHEET_HEADER_BG
    },
    sheetbg: {
        backgroundColor: NEW_COLOR.SHEET_BG
    },
    // textBlue: {
    //     color: NEW_COLOR.TEXT_BLUE
    // },
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
    bannerbg: {
        backgroundColor: NEW_COLOR.BANNER_BG
    },
    placeholder: {
        color: NEW_COLOR.PLACEHOLDER_TEXTCOLOR
    },
    textCardLabel: {
        color: NEW_COLOR.CARD_LABEL
    },
    textGrey3: {
        color: NEW_COLOR.TEXT_GREY3
    },
    textGrey4: {
        color: NEW_COLOR.TEXT_GREY4
    },
    textGrey5: {
        color: NEW_COLOR.TEXT_GREY5
    },
    textGrey6: {
        color: NEW_COLOR.TEXT_GREY6
    },
    textGrey7: {
        color: NEW_COLOR.TEXT_GREY7
    },
    textGreyAc: {
        color: NEW_COLOR.TEXT_GREYAC
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
    sharetext: {
        color: NEW_COLOR.SHARE_TEXT
    },
    dotgrey: {
        color: NEW_COLOR.TEXT_link
    },
    textLightGray: {
        color: NEW_COLOR.TEXT_LIGHTGRAY
    },
    // buttonText: {
    //     color: NEW_COLOR.TEXT_WHITE
    // },
    textKpiLabel: {
        color: NEW_COLOR.TEXT_KPI_LABEL
    },
    textGreen: {
        color: NEW_COLOR.BADGE_APPROVED_TEXT
    },
    textred: {
        color: NEW_COLOR.RED
    },
    textPink: {
        color: NEW_COLOR.TEXT_PINK
    },
    textLightGrey: {
        color: NEW_COLOR.PLACEHOLDER_COLOR
    },
    textlinkgrey: {
        color: NEW_COLOR.TEXT_link
    },
    textLink: {
        color: NEW_COLOR.TEXT_ALWAYS_BLACK
    },
    textAlwaysWhite: {
        color: NEW_COLOR.TEXT_ALWAYS_WHITE
    },
    textAlwaysBlack: {
        color: NEW_COLOR.TEXT_ALWAYS_BLACK
    },
    BgAlwaysBlack: {
        backgroundColor: NEW_COLOR.TEXT_ALWAYS_BLACK
    },
    textLightOrange: {
        color: NEW_COLOR.TEXT_ORANGE
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
    bgLightblue: {
        backgroundColor: NEW_COLOR.BG_LIGHTBLUE
    },
    textLightwhite: {
        color: NEW_COLOR.TEXT_LIGHTWHITE
    },
    textSecondary: {
        color: NEW_COLOR.TEXT_SECONDARY
    },
    textActive: {
        color: NEW_COLOR.TEXT_ACTIVE
    },
    textlightblack: {
        color: NEW_COLOR.TEXT_LIGHTBLACK
    },
    membershipbg: {
        backgroundColor: NEW_COLOR.MEMBERSHIP_BG,
    },

    quicklinks: {
        backgroundColor: NEW_COLOR.QUICK_LINKS
    },
    bglink: {
        backgroundColor: NEW_COLOR.BG_LINK
    },
    navabaractive: {
        backgroundColor: NEW_COLOR.Nav_Active
    },
    bgBlack: {
        backgroundColor: NEW_COLOR.BG_BLACK
    },
    bgwithdraw: {
        backgroundColor: NEW_COLOR.WITHDRAW_BG
    },
    bgdeposist: {
        backgroundColor: NEW_COLOR.DEPOSIST_BG
    },
    profilebg: {
        backgroundColor: NEW_COLOR.Profile_Bg
    },
    cardsbg: {
        backgroundColor: NEW_COLOR.CARDS_BG
    },
    notebg: {
        backgroundColor: NEW_COLOR.NOTE_BG
    },
    graphpointer: {
        backgroundColor: NEW_COLOR.GRAPH_POINTER
    },
    noteleftborder: {
        borderLeftWidth: 1,
        borderRadius: 5,
        borderLeftColor: NEW_COLOR.NOTE_ICON,
    },

    dflex: {
        flexDirection: "row",
    },
    flexRow: {
        flexDirection: "row"
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
    justifystart: {
        justifyContent: "flex-start"
    },
    flexWrap: {
        flexWrap: "wrap"
    },
    textRight: {
        textAlign: "right"
    },
    textLeft: {
        textAlign: "left"
    },
    fw900: {
        fontFamily: "Manrope"
    },
    fw800: {
        fontFamily: "Manrope-ExtraBold"
    },
    fw700: {
        fontFamily: "Manrope-Bold"
    },
    fw600: {
        fontFamily: "Manrope-SemiBold"
    },
    fw500: {
        fontFamily: "Manrope-Medium"
    },
    fw400: {
        fontFamily: "Manrope-Regular"
    },
    fw300: {
        fontFamily: "Manrope-Light"
    },
    fw200: {
        fontFamily: "Manrope-ExtraLight"
    },

    textCenter: {
        textAlign: "center",
    },
    container: {
        padding: s(24),
        paddingTop: Platform.OS === 'android' ? s(28) : s(30),
        flex: 1,
        backgroundColor: NEW_COLOR.SCREENBG_BLACK,
    },
    pagePt50: {
        paddingTop: Platform.OS === 'android' ? 14 : 0,
        backgroundColor: NEW_COLOR.SCREENBG_BLACK,
        paddingRight: s(16), paddingLeft: s(16)
    },
    containerBgTransparent: {
        padding: s(16),
        paddingTop: Platform.OS === 'android' ? 50 : 0,
        flex: 1,
        backgroundColor: NEW_COLOR.TRANSPARENT,
    },
    screenBg: {
        // backgroundColor: NEW_COLOR.SCREENBG_WHITE,
        backgroundColor: NEW_COLOR.SCREENBG_BLACK,
    },
    modalpt: {
        paddingTop: Platform.OS === 'android' ? 12 : 0,
    },
    nativeModalpt: {
        paddingTop: Platform.OS === 'android' ? 36 : 0,
    },
    p18: { padding: s(18) },
    radio24: { width: 24, height: 24, borderRadius: 12, borderWidth: 2 },
    blueBg: {
        // backgroundColor: NEW_COLOR.SCREENBG_WHITE,
        backgroundColor: NEW_COLOR.BG_BLUE,
    },
    BgPrimary: {
        backgroundColor: NEW_COLOR.PRiMARY_COLOR,
    },
    flex1: {
        flex: 1
    },
    flexGrow1: {
        flexGrow: 1
    },
    flex2: {
        flex: 2
    },
    mx14: {
        marginTop: s(14), marginBottom: s(14),
    },

    ml_mr10: {
        marginRight: s(10), marginLeft: s(10),
    },
    mx7: {
        marginTop: s(7), marginBottom: s(7),
    },
    mx6: {
        marginTop: s(6), marginBottom: s(6),
    },
    mx4: {
        marginTop: s(4), marginBottom: s(4),
    },
    my16: {
        marginRight: s(16), marginLeft: s(16),
    },
    my20: {
        marginRight: s(20), marginLeft: s(20),
    },
    py2: {
        paddingTop: s(2), paddingBottom: s(2),
    },
    py3: {
        paddingTop: s(3), paddingBottom: s(3),
    },
    py5: {
        paddingTop: s(5), paddingBottom: s(5),
    },
    py8: {
        paddingTop: s(8), paddingBottom: s(8),
    },
    py16: {
        paddingTop: s(16), paddingBottom: s(16),
    },
    py20: {
        paddingTop: s(20), paddingBottom: s(20),
    },
    py6: {
        paddingTop: s(6), paddingBottom: s(6),
    },
    px6: {
        paddingLeft: s(6), paddingRight: s(6),
    },
    px4: {
        paddingLeft: s(4), paddingRight: s(4),
    },
    px2: {
        paddingLeft: s(2), paddingRight: s(2),
    },
    px1: {
        paddingLeft: s(1), paddingRight: s(1),
    },
    px8: {
        paddingLeft: s(8), paddingRight: s(8),
    },
    gap8: {
        gap: s(8)
    },
    gap24: {
        gap: s(24),
    },
    gap30: {
        gap: s(34),
    },

    gap40: {
        gap: ms(40),
    },
    gap50: {
        gap: ms(50),
    },
    gap68: {
        gap: ms(68),
    },
    gap22: {
        gap: s(22),
    },
    gap20: {
        gap: s(20),
    },
    gap10: {
        gap: s(10)
    },
    gap4: {
        gap: s(4)
    },
    gap5: {
        gap: s(5)
    },
    gap100: {
        gap: s(100)
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
    ml10: {
        marginLeft: s(10)
    },
    ml160: {
        marginLeft: s(160)
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
    mb18: {
        marginBottom: s(18),
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
    mt3: {
        marginTop: ms(3)
    },
    mt2: {
        marginTop: ms(2)
    },

    mb10: {
        marginBottom: s(10),
    },
    mb12: {
        marginBottom: s(12),
    },
    pb40: {
        paddingBottom: s(40),
    },
    pb24: {
        paddingBottom: s(24),
    },
    pb14: {
        paddingBottom: s(14),
    },
    pb10: {
        paddingBottom: s(10),
    },
    pb20: {
        paddingBottom: s(20),
    },
    pb6: {
        paddingBottom: s(6),
    },
    pb7: {
        paddingBottom: s(7),
    },
    pt16: {
        paddingTop: s(16),
    },
    pt10: {
        paddingTop: s(10),
    },
    pt24: {
        paddingTop: s(24),
    },
    pt4: {
        paddingTop: s(4),
    },
    pt6: {
        paddingTop: s(6),
    },
    pt7: {
        paddingTop: s(7),
    },
    pt20: {
        paddingTop: s(20),
    },
    pr50: {
        paddingRight: s(50)
    },
    mr8: {
        marginRight: s(8)
    },
    mr10: {
        marginRight: s(10)
    },
    mr12: {
        marginRight: s(12)
    },
    ml8: {
        marginLeft: s(8)
    },
    ml4: {
        marginLeft: s(4)
    },
    ml16: {
        marginLeft: s(16)
    },
    ml22: {
        marginLeft: s(22)
    },
    ml30: {
        marginLeft: s(30)
    },
    ml44: {
        marginLeft: s(44)
    },
    mb0: {
        marginBottom: 0,
    },
    mbs: {
        marginBottom: s(-25),
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
    my10: {
        marginVertical: s(24),
    },
    mt19: {
        marginTop: s(19),
    },
    mr16: {
        marginRight: s(16)
    },
    mr46: {
        marginRight: s(46)
    },
    mr5: {
        marginRight: s(5)
    },
    mr4: {
        marginRight: s(4)
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
        marginBottom: s(40),
    },
    mb70: {
        marginBottom: s(70),
    },
    mb87: {
        marginBottom: s(87),
    },
    mb89: {
        marginBottom: s(89),
    },
    mt40: {
        marginTop: s(40),
    },
    mt44: {
        marginTop: s(44),
    },
    mt50: {
        marginTop: s(50)
    },
    mt60: {
        marginTop: s(60)
    },
    mt70: {
        marginTop: s(70)
    },
    mt90: {
        marginTop: s(100)
    },
    mt130: {
        marginTop: s(130)
    },
    mb40: {
        marginBottom: s(43),
    },
    mb30: {
        marginBottom: s(30)
    },
    mb24: {
        marginBottom: s(24)
    },
    mt24: {
        marginTop: s(24)
    },
    mt20: {
        marginTop: s(20)
    },
    mt30: {
        marginTop: s(30)
    },
    mt32: {
        marginTop: s(32)
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
    px26: {
        paddingLeft: s(26), paddingRight: s(26)
    },
    px16: {
        paddingLeft: s(16), paddingRight: s(16)
    },
    px18: {
        paddingLeft: s(18), paddingRight: s(18)
    },
    py24: {
        paddingTop: s(24), paddingLeft: s(24),
    },
    py14: {
        paddingTop: s(14), paddingBottom: s(14),
    },
    py12: {
        paddingTop: s(12), paddingBottom: s(12),
    },
    py10: {
        paddingTop: s(10), paddingBottom: s(10),
    },
    pt0: {
        paddingTop: 0,
    },
    pt44: {
        paddingTop: s(44),
    },
    pt38: {
        paddingTop: s(38),
    },
    pt34: {
        paddingTop: s(34),
    },
    pt32: {
        paddingTop: s(32),
    },
    pt64: {
        paddingTop: s(64),
    },
    dashedBorder: {
        borderBottomWidth: 1,
        borderStyle: 'dashed', height: 1, width: "100%",
        borderColor: "rgba(68, 75, 79, 0.69)",
    },
    dashedBorderSection: {
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: NEW_COLOR.SECTION_BORDER,
    },
    qrcodedotted: {
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: NEW_COLOR.TEXT_WHITE,
        borderrarius: s(5)
    },
    networkDropdown: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: s(109),
        height: s(37),
        borderRadius: s(100) / 2,
        borderWidth: 1,
        borderColor: NEW_COLOR.INPUT_BORDER,
        paddingHorizontal: s(16),
        backgroundColor: "transparent",
    },
    accordionCardStyle: {
        borderRadius: s(12),
        borderWidth: 1,
        borderColor: NEW_COLOR.SECTION_BORDER,
        padding: s(14),
        flexDirection: 'column',
    },
    dashboardbannerbg: {
        backgroundColor: NEW_COLOR.DASHBOARD_BANNERBG
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
    p12: {
        padding: s(12)
    },
    pl16: {
        paddingLeft: s(16)
    },
    pl5: {
        paddingLeft: s(5)
    },
    pl4: {
        paddingLeft: s(4)
    },
    // pl40: {
    //     paddingLeft: s(58)
    // },
    p0: {
        padding: 0
    },
    pr0: {
        paddingRight: 0
    },
    pb0: {
        paddingBottom: 0
    },
    pt8: {
        paddingTop: s(8)
    },
    p22: {
        padding: s(22)
    },
    p20: {
        padding: s(20)
    },
    p8: {
        padding: s(8)
    },
    p4: {
        padding: s(4)
    },
    p6: {
        padding: s(6)
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
    shareBorder: {
        borderColor: NEW_COLOR.BORDER_BLACK,
        borderWidth: 1, borderRadius: 5,
    },
    dashedLine: {
        backgroundColor: NEW_COLOR.BG_PURPLERDARK,
        borderStyle: "dashed",
        borderWidth: 1, borderColor: NEW_COLOR.BORDER_BOTTOM,
        height: 1, width: "100%"
    },
    mt10: {
        marginTop: s(10),
    },
    mt12: {
        marginTop: s(12),
    },
    headrbottomspace: {
        marginTop: s(26),
    },
    mt6: {
        marginTop: s(6),
    },
    menuitems: {
        padding: s(14),
    },
    cardsboxes: {
        height: s(95)
    },
    fixedBadge: {
        position: "absolute", right: 0, top: 0, paddingRight: s(6), paddingLeft: s(6),
        paddingTop: s(4), paddingBottom: s(4), borderBottomLeftRadius: s(4), borderBottomRightRadius: s(4)
    },
    marketHelightsBackgroundColor: {
        backgroundColor: NEW_COLOR.MARKET_HELIGHTS_BACKGROUND_COLOR,
    },
    successYellowBg: {
        position: "absolute",
        width: s(100),
        height: s(100),
        borderRadius: s(50) / 2,
        backgroundColor: NEW_COLOR.BG_YELLOW,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,

    },
    successOverlayBox: {
        left: 20,
        top: 30,
        width: s(120),
        height: s(120),
        borderRadius: s(50) / 2,
        backgroundColor: NEW_COLOR.SUCCESS_BOX,
        alignItems: "center",
        justifyContent: "center",
        opacity: 0.6,
        zIndex: 2,
    },

    list_background: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: s(8),
        backgroundColor: NEW_COLOR.BANNER_BG,
        borderRadius: s(12),
    },
    bg_Gray: {
        color: NEW_COLOR.BG_GRAY
    },

    profileAvatarContainer: {
        position: 'relative',
        width: s(36), // or your avatar size
        height: s(36),
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileAvatar: {
        width: s(36),
        height: s(36),
        borderRadius: s(28),
    },
    greenDot: {
        position: 'absolute',
        bottom: s(1),
        right: s(1),
        width: s(8),
        height: s(8),
        borderRadius: 7,
        backgroundColor: statusColor['approved'], // or your green color
        borderWidth: s(2),
        borderColor: statusColor['approved'], // match your background
    },
    orangeDot: {
        position: 'absolute',
        bottom: s(1),
        right: s(1),
        width: s(8),
        height: s(8),
        borderRadius: s(7),
        backgroundColor: statusColor['pending'], // or your green color
        borderWidth: s(2),
        borderColor: statusColor['pending'], // match your background
    },
    profileLoading: {
        paddingBottom: WINDOW_HEIGHT * 0.15,
        paddingTop: ms(30),
    },
    avatarSheetItemContainer: {
        width: s(60),
        height: s(70),
        padding: 0,
        borderRadius: s(50),
        borderWidth: 2,
        borderColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    avatarSheetItemImage: {
        width: s(60),
        height: s(60),
        borderRadius: s(30),
    },
    avatarSheetItemSelected: {
        borderColor: NEW_COLOR.TEXT_GREEN,
    },
    profileWauto: {
        alignSelf: 'flex-start',
    },
    profileInfoContainer: {
        flex: 1,
    },
    profileUserName: {
        marginBottom: s(5),
    },
    profileDetailsContainer: {
        flexWrap: "wrap",
        alignItems: "center"
    },
    profileUidLabel: {
        marginLeft: s(8),
        color: "#B0B0B0"
    },
    profileUidValue: {
        marginRight: s(4),
        color: "#B0B0B0"
    },
    referralBanner: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: NEW_COLOR.REFERRAL_BANNER_BG,
    },
    referralBannerTitle: {
        color: "#222"
    },
    referralBannerSubtitle: {
        color: "#7c7368",
        marginTop: 2
    },
    letterOverlayBox: {
        backgroundColor: NEW_COLOR.LETTER_OVERLAY_BG, // Use theme variable
        borderRadius: 12,
        width: 64,
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
    letterOverlayText: {
        color: NEW_COLOR.LETTER_OVERLAY_TEXT, // Use theme variable
        fontSize: 32,
        fontWeight: 'bold',
    },
    currencyCheckMark: {
        marginRight: s(12),
        position: 'absolute',
        right: s(28),
        top: '50%',
        width: s(28),
        height: s(28),
        borderRadius: s(14),
        backgroundColor: NEW_COLOR.TEXT_WHITE, // theme-based
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ translateY: s(-14) }],
        elevation: s(2),
        shadowColor: '#000',
        shadowOpacity: s(0.1),
        shadowRadius: s(2),
        shadowOffset: { width: s(0), height: s(1) },
    },
    // Apply Cards

    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        backgroundColor: NEW_COLOR.TAB_BAR_BG,
        borderRadius: 30,
        marginHorizontal: 20,
        position: 'relative',
        overflow: 'hidden',
        alignSelf: 'center',
        borderWidth: 2,
        borderColor: NEW_COLOR.BORDER_COLOR
    },
    toggleIndicator: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        backgroundColor: NEW_COLOR.TAB_ACTIVE_COLOR,
        borderRadius: 30,
        zIndex: 0,
        left: 0,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 30,
        zIndex: 2,
        // Add horizontal padding here if needed
    },
    applycard_bg: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: NEW_COLOR.APPLY_CARD_BG,
        padding: s(14),
        borderRadius: s(12),
        marginBottom: s(10)

    },
    address_bg: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: NEW_COLOR.APPLY_CARD_BG,
        padding: s(14),
        borderRadius: s(12),
        marginBottom: s(10)

    },
    transaction_bg: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: NEW_COLOR.BANNER_BG,
        padding: s(14),
        borderRadius: s(12),
        marginBottom: s(8)

    },
    inputStyle: {
        backgroundColor: NEW_COLOR.BANNER_BG,
        borderRadius: s(10),
        fontSize: ms(16),
        includeFontPadding: false,
        fontWeight: '400',
    },
    referralBannerButton: {
        marginTop: 10,
        backgroundColor: NEW_COLOR.TEXT_ALWAYS_WHITE,
        borderRadius: 5,
        paddingHorizontal: 14,
        paddingVertical: 4,
        alignSelf: "flex-start",
    },
    referralBannerImageContainer: {
        width: s(56),
        height: s(56),
        borderRadius: s(28),
        backgroundColor: "#F3ECE3",
    },
    referralBannerImage: {
        width: s(60),
        height: s(60),
        resizeMode: "contain",
    },
    logoutButton: {
        backgroundColor: NEW_COLOR.QUICK_LINKS,
    },
    avatarSheetHeaderFooter: {
        width: s(10),
    },
    avatarSheetSeparator: {
        width: s(15),
    },
    profileMenuSectionTitle: {
        fontSize: ms(14),
        color: NEW_COLOR.TEXT_WHITE, // This should ideally be a theme color
        fontFamily: "Manrope-SemiBold",// fw600
    },
    profileMenuItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: NEW_COLOR.SECTION_BORDER,
        borderRadius: s(12),
        padding: s(8),
    },
    menuitemspace: {
        marginBottom: s(6)
    },
    profileMenuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(16)
    },
    profileMenuIconContainer: {
        width: s(36),
        height: s(36),
        borderRadius: s(16),
        justifyContent: 'center',
        alignItems: 'center'
    },
    profileMenuItemText: {
        fontSize: ms(14),
        fontFamily: "Manrope-Regular", // fw400
        color: NEW_COLOR.TEXT_WHITE,
        // marginBottom: s(4)
    },
    profileMenuItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(8),

    },
    profileMenuSecurityLevel: {
        color: NEW_COLOR.TEXT_YELLOW,
        fontSize: ms(12),
        fontFamily: "Manrope-Regular"
    },
    profileMenuVersionText: {
        fontFamily: "Manrope-Regular", // fw400
        color: NEW_COLOR.TEXT_WHITE,
        fontSize: ms(14)
    },
    customerStateBadgeContainer: {
        paddingHorizontal: s(8),
        paddingVertical: s(2),
        marginBottom: s(3),
        alignSelf: 'flex-start',
        minHeight: s(20),
        borderRadius: s(6),
    },
    customerStateBadgeText: {
        fontSize: s(14),
        fontFamily: "Manrope-Regular", // fw400
    },
    profileUploadImage: {
        width: s(70),
        height: s(70),
        borderRadius: s(70) / 2,
        overflow: "hidden",
    },
    profileUploadImageContainer: {
        position: 'relative',
        width: s(70),
        height: s(70),
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileUploadEditIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        borderRadius: s(24) / 2,
        padding: s(4),
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: s(24),
        height: s(24),
        backgroundColor: NEW_COLOR.TEXT_WHITE,
        borderColor: NEW_COLOR.TEXT_WHITE,
    },
    profileUploadCameraIconContainer: {
        backgroundColor: NEW_COLOR.TEXT_WHITE,
        borderRadius: s(24) / 2,
        width: s(40),
        height: s(40),
        justifyContent: 'center',
        alignItems: 'center'
    },
    quick_Link_Icon_Bg: {
        backgroundColor: NEW_COLOR.QUICK_LINK_ICON_BG,
    },
    payment_drag_bg_color: {
        backgroundColor: NEW_COLOR.DRAG_COLOR,
    },
    securityLevelCardBadge: {
        backgroundColor: NEW_COLOR.SECURITY_LEVEL_CARD_BG,
    },

    alphabetSection: {
        position: 'absolute',
        right: 0,
        alignItems: 'center',
        zIndex: 10,
        ...(NEW_COLOR.IS_DARK
            ? {}
            : {
                shadowColor: '#000',
                shadowOpacity: 0.06,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
            }),
    },
    manropeRegular16: {
        fontFamily: 'Manrope-Regular',
        fontWeight: '400',
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: -0.16, // -1% of 16px
    },

    custInput: {
        backgroundColor: NEW_COLOR.BANNER_BG,
        paddingRight: s(46),
        borderRadius: 16,
        paddingVertical: s(12),
        paddingLeft: s(16),
        fontSize: ms(16),
        lineHeight: ms(21),
        includeFontPadding: false,
        fontWeight: '400',
    },


    frozenCardContainer: {
        opacity: 0.6,
        backgroundColor: 'rgba(0, 0, 0, 0.49)',
    },
    frozenCardImage: {
        filter: 'blur(0px)',
    },
    frozenBadgeContainer: {
        position: 'absolute',
        top: '40%',
        left: '40%',
        transform: [{ translateX: -40 }, { translateY: -6 }],
        zIndex: 2,
    },
    frozenBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Center the content horizontally
        borderWidth: 1,
        borderColor: NEW_COLOR.CARD_STATE_BORDER,// A subtle white border
        paddingHorizontal: s(16), // Increased padding
        paddingVertical: s(10),   // Increased padding
        borderRadius: s(16),      // This is good for the rounded shape
        gap: s(8),                // Increased gap for more space
    },
    frozenText: {
        fontSize: s(14),
        fontWeight: '600',
        color: '#FFFFFF',
    },
    bottomsheeticonbg: {
        width: s(40),
        height: s(40),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.QUICK_LINKS,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    inputerrormessage: {
        fontSize: ms(14),
        fontFamily: "Manrope-medium",
        color: NEW_COLOR.TEXT_RED,
        margintop: s(4)

    },
    chatuploadbg: {
        backgroundColor: NEW_COLOR.CHATUPLOAD_BG
    },
    chatreplybg: {
        backgroundColor: NEW_COLOR.CHATREPLEY_BG
    },
    primaryText: {
        fontSize: s(14),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_WHITE,
    },
    secondaryText: {
        fontSize: s(12),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_GREY,
    },
    profilebannerbg: {
        backgroundColor: NEW_COLOR.PROFILEBANNER_BG,
        padding: s(8),
        borderRadius: s(12)
    },
    cardsbannerBg: {
        backgroundColor: NEW_COLOR.APPLY_CARD_BG,
        padding: s(8),
        borderRadius: s(12)
    },
    listbg: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: NEW_COLOR.APPLY_CARD_BG,
        padding: s(8),
        borderRadius: s(8),
        gap: s(8),
        flexWrap: "wrap"
    },
    billinglistbg: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        backgroundColor: NEW_COLOR.APPLY_CARD_BG,
        padding: s(8),
        borderRadius: s(8),
        gap: s(8),
        flexWrap: "wrap"
    },
    cardslistbg: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: NEW_COLOR.APPLY_CARD_BG,
        padding: s(8),
        borderRadius: s(8),
        gap: s(16),
        flexWrap: "wrap"
    },
    logintitletext: {
        fontSize: s(24),
        fontFamily: "Manrope-Bold",
        color: NEW_COLOR.TEXT_WHITE
    },
    profilelistbg: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: NEW_COLOR.BG_GRAY,
        padding: s(8),
        borderRadius: s(8),
        gap: s(8),
        flexWrap: "wrap"
    },
    walletlistbg: {
        backgroundColor: NEW_COLOR.APPLY_CARD_BG,
        padding: s(8),
        borderRadius: s(8),
    },
    availblelabel: {
        color: NEW_COLOR.TEXT_link,
        fontSize: s(12),
        fontFamily: "Manrope-Regular",
    },
    availbleamount: {
        color: NEW_COLOR.TEXT_WHITE,
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
    },
    amountTobePaidtext: {
        fontSize: s(30),
        fontFamily: "Manrope-Bold",
        textAlign: "center",
        color: NEW_COLOR.TEXT_WHITE
    },
    transactionamounttextlabel: {
        fontSize: s(14),
        color: NEW_COLOR.TEXT_link,
        fontFamily: "Manrope-Regular",
        textAlign: "center",
        marginTop: s(4)
    },
    transactionamounttext: {
        fontSize: s(30),
        fontFamily: "Manrope-Medium",
        textAlign: "center",
        color: NEW_COLOR.TEXT_WHITE
    },
    bgNoteText: {
        fontSize: s(14),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_WHITE
    },
    listsecondarytext: {
        fontSize: s(14),
        fontFamily: 'Manrope-Regular',
        color: NEW_COLOR.LIST_SECONDARYTEXT
    },
    listprimarytext: {
        fontSize: s(14),
        fontFamily: 'Manrope-Regular',
        color: NEW_COLOR.LIST_PRIMARYTEXT
    },
    secondarybuttonbg: {
        backgroundColor: NEW_COLOR.SECONDARYBUTTON_BG
    },
    secondarybuttontext: {
        color: NEW_COLOR.SECONDARYBUTTON_TEXT,
        fontSize: ms(16), fontFamily: "Manrope-Bold",
    },
    primarybuttonbg: {
        backgroundColor: NEW_COLOR.SECONDARYBUTTON_BG
    },
    primarybuttontext: {
        color: NEW_COLOR.SECONDARYBUTTON_TEXT,
        fontSize: ms(16), fontFamily: "Manrope-Bold",
    },
    splaceheading: {
        fontSize: s(36),
        fontFamily: "Manrope-Medium",
    },
    helpborder: {
        borderRadius: s(12),
        borderWidth: 1,
        borderColor: NEW_COLOR.BORDER_COLOR,
        padding: s(8),
        flexDirection: 'column',
    },
    statusdot: {
        width: s(6),
        height: s(6),
        backgroundColor: NEW_COLOR.TEXT_GREEN,
        borderRadius: s(100) / 2
    },
    forgottext: {
        fontSize: s(12),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.BG_YELLOW,

    },
    sendBg: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: NEW_COLOR.APPLY_CARD_BG,
        paddingLeft: s(16),
        paddingRight: s(16),
        paddingTop: s(12),
        paddingBottom: s(12),
        borderRadius: s(12),
        gap: s(8),
        flexWrap: "wrap"
    },
    notetext: {
        fontSize: s(14),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_GREY,
    },
    devicesbg: {
        backgroundColor: NEW_COLOR.APPLY_CARD_BG,
        padding: s(8),
        borderRadius: s(12)
    },
    devicesprimarytext: {
        fontSize: s(14),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_WHITE,
    },
    devicessecondarytext: {
        fontSize: s(12),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_GREY,
    },
    phonecodetextinpu: {
        fontSize: s(14),
        marginRight: s(16),
        color: NEW_COLOR.TEXT_WHITE,
        fontFamily: "Manrope-Regular",
    },
    cardml27: {
        marginLeft: s(32)
    },
    cardbadge: {
        position: 'absolute', top: s(20), left: s(46)
    },
    cardvirtualbadge: {
        borderWidth: 1, borderColor: NEW_COLOR.TEXT_WHITE, borderRadius: s(100), paddingVertical: s(3), paddingHorizontal: s(8)
    }

});

// export const useThemedCommonStyles = () => {
//     const NEW_COLOR = useThemeColors();
//     return useStyleSheet(getThemedCommonStyles(NEW_COLOR));
// };
export const getStatusColor: any = (NEW_COLOR: any) => ({
    "submitted": NEW_COLOR.SUBMIT_TEXTCOLOR,
    "pending": NEW_COLOR.PENDING_STATUS,
    "approved": NEW_COLOR.TEXT_GREEN,
    "active": NEW_COLOR.TEXT_GREEN,
    "success": NEW_COLOR.TEXT_GREEN,
    "rejected": NEW_COLOR.TEXT_RED,
    "not paid": NEW_COLOR.NOT_PAID,
    "paid": NEW_COLOR.TEXT_GREEN,
    "cancelled": NEW_COLOR.CANCELLED,
    "suspended": NEW_COLOR.TEXT_PURPLE,
    "partially paid": NEW_COLOR.PARTIALLYPAID_COLOR,
    "draft": NEW_COLOR.TEXT_ORANGE,
    "transferred": NEW_COLOR.PARTIALLYPAID_COLOR,
    "delivered": NEW_COLOR.TEXT_GREEN,
    "refunded": NEW_COLOR.CANCELLED,
    "shipped": NEW_COLOR.TEXT_ORANGE,
    "expired": NEW_COLOR.TEXT_RED,
    "partially utilized": NEW_COLOR.PARTIALLYUTILISED_COLOR,
    "utilized": NEW_COLOR.TEXT_GREEN,
    "Processing": NEW_COLOR.TEXT_ORANGE,
    "under review": NEW_COLOR.TEXT_ORANGE,
    "ordered": NEW_COLOR.TEXT_BLUE,
    "shipping": NEW_COLOR.PENDING_STATUS,
    "cancel": NEW_COLOR.CANCELLED,
    "freezed": NEW_COLOR.NOTE_ICON,
    "approval in progress": NEW_COLOR.TEXT_ORANGE,
    "requested": NEW_COLOR.SUBMIT_TEXTCOLOR,
    "reopened": NEW_COLOR.TEXT_ORANGE,
    "open": NEW_COLOR.TEXT_RED,
    "solved": NEW_COLOR.TEXT_GREEN,
    "closed": NEW_COLOR.TEXT_GREEN,
});

export const getLightStatusBgColor: any = (NEW_COLOR: any) => ({
    "submitted": NEW_COLOR.SUBMIT_TEXTCOLOR,
    "pending": NEW_COLOR.PENDING_STATUS,
    "approved": '#1E562C',
    "active": NEW_COLOR.TEXT_GREEN,
    "success": NEW_COLOR.TEXT_GREEN,
    "rejected": NEW_COLOR.TEXT_RED,
    "not paid": NEW_COLOR.NOT_PAID,
    "paid": NEW_COLOR.TEXT_GREEN,
    "cancelled": NEW_COLOR.CANCELLED,
    "suspended": NEW_COLOR.TEXT_PURPLE,
    "partially paid": NEW_COLOR.PARTIALLYPAID_COLOR,
    "draft": NEW_COLOR.TEXT_ORANGE,
    "transferred": NEW_COLOR.PARTIALLYPAID_COLOR,
    "delivered": NEW_COLOR.TEXT_GREEN,
    "refunded": NEW_COLOR.CANCELLED,
    "shipped": NEW_COLOR.TEXT_ORANGE,
    "expired": NEW_COLOR.TEXT_RED,
    "partially utilized": NEW_COLOR.PARTIALLYUTILISED_COLOR,
    "utilized": NEW_COLOR.TEXT_GREEN,
    "Processing": NEW_COLOR.TEXT_ORANGE,
    "under review": NEW_COLOR.TEXT_ORANGE,
    "ordered": NEW_COLOR.TEXT_BLUE,
    "shipping": NEW_COLOR.PENDING_STATUS,
    "cancel": NEW_COLOR.CANCELLED,
    "freezed": NEW_COLOR.TEXT_ACTIVE,
});

export const getPackageBorderColor = (NEW_COLOR: any) => ({
    "silver": NEW_COLOR.TEXT_YELLOW,
    "gold": NEW_COLOR.TEXT_GREEN,
    "platinum": NEW_COLOR.BRONZE_BLUE,
    "bronze": NEW_COLOR.BRONZE_BLUE,
});
export const cryptoIcons: { [key: string]: any } = {
    btc: require('../..//assets/images/BTC-circle.png'),
    usdt: require('../../assets/images/USDT-circle.png'),
    eth: require('../../assets/images/ETH-circle.png'),
    usdc: require('../../assets/images/USDT-circle.png')
}
export const cryptoLIst: { [key: string]: any } = {
    usdt: UsdtIcon,
    btc: BtcIcon,
    eth: EthIcon,
    usdc: UsdtIcon,

}