// CardStyles.js

import { StyleService, useStyleSheet } from "@ui-kitten/components";
import { NEW_COLOR, WINDOW_HEIGHT, WINDOW_WIDTH } from "../constants/styels/variables"; // NEW_COLOR will be passed
import { ms, s } from "../constants/styels/scale";
import { text } from "../constants/styels/mixins";
import { Platform } from "react-native";

// export const commonStyles = StyleService.create({
//     rowReverse: {
//         flexDirection: "row-reverse"
//     },
//     closeIcon: {
//         position: "absolute", right: s(16),
//         top: s(16)
//     },
//     disabledBg: {
//         backgroundColor: NEW_COLOR.DISABLEDINPUTBG
//     },
//     borderPrimary: {
//         borderWidth: 1, borderRadius: 5, borderColor: NEW_COLOR.PRiMARY_COLOR,
//     },
//     actionCircle: {
//         height: s(42), width: s(42), borderColor: NEW_COLOR.PRiMARY_COLOR,
//         borderWidth: 1, borderRadius: s(42) / 2
//     },
//     submenuPl: {
//         paddingLeft: s(50), paddingRight: s(16), gap: s(14)
//     },
//     removeCartItem: {
//         borderWidth: 1, borderColor: NEW_COLOR.TEXT_RED,
//         paddingHorizontal: s(8), paddingVertical: s(4), borderRadius: s(5)
//     },
//     tabLine: {
//         height: s(4),
//         width: "100%", marginTop: s(8),
//         borderTopLeftRadius: s(5), borderTopRightRadius: s(5),
//     },
//     nextOuter: {
//         borderWidth: s(3),
//         borderColor: NEW_COLOR.PRiMARY_COLOR,
//         borderRadius: s(100) / 2,
//         padding: s(8)
//     },
//     nextInner: {
//         height: s(44),
//         width: s(44), backgroundColor: NEW_COLOR.PRiMARY_COLOR,
//         borderRadius: s(44) / 2
//     },
//     shadowOverlay: {
//         position: "absolute",
//         bottom: -1,
//         left: 0,
//         right: 0,
//         height: "40%",
//     },
//     productItemStyle: {
//         backgroundColor: NEW_COLOR.SECTION_BG_COLOR,
//         borderRadius: s(5), borderWidth: 1, borderColor: NEW_COLOR.TRANSPARENT,
//         width: s(183.4),
//     },
//     languageLetterBg: {
//         backgroundColor: NEW_COLOR.LANGUAGE_LETTERBG, padding: s(8),
//         borderRadius: s(5),
//     },
//     borderSeparate: {
//         borderWidth: 1, borderTopColor: NEW_COLOR.SECTION_BORDER, borderRightColor: NEW_COLOR.SECTION_BORDER, borderBottomColor: NEW_COLOR.SECTION_BORDER, borderLeftColor: NEW_COLOR.SECTION_BORDER,
//     },
//     roundedT5: {
//         borderTopLeftRadius: s(5), borderTopRightRadius: s(5)
//     },
//     roundedB5: {
//         borderBottomLeftRadius: s(5), borderBottomRightRadius: s(5)
//     },
//     rounded16: {
//         borderRadius: s(5)
//     },
//     rounded20: {
//         borderRadius: s(5)
//     },
//     packageBadge: {
//         paddingHorizontal: s(8), paddingVertical: s(4), position: "absolute", top: 0, right: 14
//     },
//     packageCircle: {
//         height: s(20), width: s(20), borderRadius: s(20),
//         borderWidth: s(4), backgroundColor: NEW_COLOR.BACKGROUND_WHITE,
//     },
//     dbRefCode: {
//         shadowColor: '#000', // Shadow color
//         shadowOffset: { width: 0, height: 3 }, // Shadow offset (0px horizontal, 3px vertical)
//         shadowOpacity: 0.12, // Shadow opacity (0.12)
//         shadowRadius: 8, // Shadow blur radius (8px)
//         elevation: 5, backgroundColor: NEW_COLOR.TEXT_BLACK, paddingRight: s(8), paddingLeft: s(8),
//         paddingTop: s(6), paddingBottom: s(6),
//         borderRadius: s(5), borderWidth: 1, borderColor: NEW_COLOR.SECTION_BORDER,
//     },
//     dbAdvertisement: {
//         borderRadius: s(8), // Equivalent to border-radius: 8px
//         backgroundColor: NEW_COLOR.TEXT_BLACK, // Equivalent to background: #FFF
//         shadowColor: '#000', // Shadow color
//         shadowOffset: { width: 0, height: 0 }, // Shadow offset
//         shadowOpacity: 0.25, // Equivalent to rgba(0, 0, 0, 0.25)
//         shadowRadius: 4, // Equivalent to box-shadow: 0px 0px 4px 0px
//         elevation: 4, // Android shadow (optional, for better shadow on Android)
//         minHeight: s(146), marginHorizontal: 1, borderWidth: 1
//     },
//     inactiveDot: {
//         height: s(8), width: s(8), borderRadius: s(8) / 2,
//         backgroundColor: NEW_COLOR.INPUT_BORDER
//     },
//     activeDot: {
//         height: s(8), width: s(8), borderRadius: s(8) / 2,
//         backgroundColor: NEW_COLOR.TEXT_WHITE
//     },
//     dotBorder: {
//         padding: s(2), borderWidth: 1, borderColor: NEW_COLOR.PRiMARY_COLOR,
//         borderRadius: s(100) / 2,
//     },
//     Currencyborder: {
//         padding: s(14), borderWidth: 1, borderColor: NEW_COLOR.TEXT_WHITE,
//         borderRadius: s(5) / 2,
//     },

//     createVaultBtn: {
//         paddingLeft: s(14), paddingRight: s(14), paddingTop: s(6), paddingBottom: s(6),
//     },
//     kycBadge: {
//         paddingLeft: s(11), paddingRight: s(11), paddingTop: s(3), paddingBottom: s(3),
//         borderRadius: 12,
//     },
//     backArrow: {
//         padding: s(16)
//     },
//     // expandTouchArea: {
//     //     paddingLeft: s(10), paddingRight: s(10), paddingTop: s(2), paddingBottom: s(2),
//     //     minWidth: s(18,)
//     // },
//     errorBorder: {
//         borderColor: NEW_COLOR.TEXT_RED
//     },
//     px10: {
//         paddingLeft: s(10), paddingRight: s(10)
//     },
//     textStrike: {
//         textDecorationLine: 'line-through',
//         textDecorationStyle: 'solid'
//     },
//     formItemSpace: {
//         marginBottom: s(24)
//     },
//     sectionGap: {
//         marginBottom: s(30)
//     },
//     titleSectionGap: {
//         marginBottom: s(16)
//     },
//     listChildGap: {
//         marginBottom: s(6)
//     },
//     listGap: {
//         marginBottom: s(18)
//     },
//     overlayBg: {
//         backgroundColor: NEW_COLOR.OVERLAY_BG
//     },
//     borderDashed: {
//         borderStyle: "dashed"
//     },
//     opacity08: {
//         opacity: 0.8
//     },
//     flexCol: {
//         flexDirection: "column"
//     },
//     nameIconStyle: {
//         height: s(35), width: s(35),
//         borderRadius: s(35) / 2,
//         backgroundColor: NEW_COLOR.NAME_CIRCLE_BG,
//         borderWidth: 1, borderColor: NEW_COLOR.BORDER_BROWN
//     },
//     activeNameIconStyle: {
//         height: s(34), width: s(34),
//         borderRadius: s(100) / 2,
//         backgroundColor: NEW_COLOR.PRiMARY_COLOR,
//     },
//     activeItemBg: {
//         backgroundColor: NEW_COLOR.ACTIVE_ITEM,
//     },
//     bordered: {
//         borderWidth: 1, borderColor: NEW_COLOR.SECTION_BORDER,
//     },
//     kpiStyle: {
//         backgroundColor: NEW_COLOR.SECTION_BG, flex: 1,
//         borderRadius: s(5), borderTopWidth: 1, borderTopColor: NEW_COLOR.KPI_BORDER,
//     },
//     sectionBordered: {
//         backgroundColor: NEW_COLOR.TRANSPARENT, padding: s(16),
//         borderRadius: s(5), borderWidth: 1, borderColor: NEW_COLOR.SECTION_BORDER,
//     },
//     accordianInactiveBorder: {
//         borderRadius: s(5), borderWidth: 1, borderColor: NEW_COLOR.TRANSPARENT,
//     },
//     accordianActiveBorder: {
//         borderRadius: s(5), borderWidth: 1, borderColor: NEW_COLOR.SECTION_BORDER,
//     },
//     listBorder: {
//         borderWidth: 1, borderColor: NEW_COLOR.LIST_BORDER,
//         borderRadius: s(5), padding: s(14),
//     },
//     listStyle: {
//         paddingTop: s(10), backgroundColor: NEW_COLOR.TRANSPARENT,
//         paddingBottom: s(10)
//     },
//     accordianListStyle: {
//         padding: s(12), backgroundColor: NEW_COLOR.ACCORDIAN_LIST_BG,
//         borderTopWidth: 1, borderBottomWidth: 1, borderColor: NEW_COLOR.LIST_BORDER,
//         borderRadius: 0,
//     },
//     attachmentStyle: {
//         padding: s(10), backgroundColor: NEW_COLOR.SECTION_BG,
//         borderWidth: 1, borderColor: NEW_COLOR.ATTACHMENT_BORDER,
//         flexDirection: "row", alignItems: "center", gap: 8, borderRadius: s(5),
//         marginTop: s(10)
//     },
//     uploadStyle: {
//         backgroundColor: NEW_COLOR.SECTION_BG, paddingVertical: s(34),
//         paddingHorizontal: s(16), borderWidth: 1,
//         borderRadius: s(5), borderStyle: "dashed", borderColor: NEW_COLOR.BORDER_COLOR2
//     },
//     verifyBtn: {
//         borderWidth: 1, borderColor: NEW_COLOR.TEXT_WHITE,
//         borderBottomRightRadius: s(5), borderTopLeftRadius: 0,
//         borderTopRightRadius: s(5), borderBottomLeftRadius: 0, height: s(48),
//         width: s(120), backgroundColor: NEW_COLOR.VERIFY_BTN_BG
//     },
//     registerTitle: {
//         fontSize: ms(25), fontFamily: "Manrope-Medium", lineHeight: ms(36),
//         color: NEW_COLOR.TEXT_WHITE, textAlign: "center"
//     },
//     radioInactive: {
//         borderWidth: 1,
//         borderRadius: s(100), borderColor: NEW_COLOR.TEXT_LIGHTWHITE,
//         width: s(18), height: s(18)
//     },
//     accountTypeStyle: {
//         backgroundColor: NEW_COLOR.TRANSPARENT,
//         borderWidth: 1, borderColor: NEW_COLOR.BORDER_LIGHT_GREEN,
//         borderRadius: 5, padding: s(16)
//     },
//     h40: {
//         height: s(40)
//     },
//     mailGifImage: {
//         width: s(190),
//         height: s(191), marginLeft: "auto",
//         marginRight: "auto",
//     },
//     halfHeight: {
//         height: WINDOW_HEIGHT
//     },
//     halfWidth: {
//         width: WINDOW_WIDTH / 2
//     },
//     badgeStyle: {
//         paddingHorizontal: s(25),
//         height: s(40),
//         borderRadius: s(12),
//     },
//     rounded12: {
//         borderRadius: s(12)
//     },

//     rounded5: {
//         borderRadius: s(5)
//     },
//     rounded100: {
//         borderRadius: s(100) / 2
//     },
//     rounded0: {
//         borderRadius: 0
//     },
//     rounded50: {
//         borderRadius: s(40)
//     },
//     rounded2: {
//         borderRadius: 2
//     },
//     rounded30: {
//         borderRadius: s(30)
//     },
//     searchContainer: {
//         justifyContent: 'space-between',
//         // position: 'relative',
//         flexDirection: 'row',
//         paddingHorizontal: ms(16),
//         height: s(48),
//         borderRadius: s(5),
//         backgroundColor: NEW_COLOR.SEARCH_CONTAINER_BG,
//         borderWidth: 1,
//         borderColor: NEW_COLOR.INPUT_BORDER
//     },
//     accordianSearchContainer: {
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         position: 'relative',
//         flexDirection: 'row',
//         paddingHorizontal: ms(16),
//         height: s(44),
//         borderRadius: 0,
//         backgroundColor: NEW_COLOR.TRANSPARENT,
//         borderTopWidth: 1,
//         borderBottomWidth: 1,
//         borderTopColor: NEW_COLOR.SEARCH_BORDER,
//         borderBottomColor: NEW_COLOR.SEARCH_BORDER
//     },
//     searchInput: {
//         ...text(14, 16.8, 400, NEW_COLOR.TEXT_LIGHT, true),
//         position: 'relative',
//         width: "100%",
//         paddingVertical: 1,
//         color: NEW_COLOR.TEXT_WHITE, flex: 1, marginRight: s(20),
//         fontSize: ms(16), fontFamily: "Manrope-SemiBold", lineHeight: ms(22)
//     },
//     vAccordinBg: {
//         backgroundColor: NEW_COLOR.VACCORDIAN_BG
//     },
//     searchBlackBg: {
//         backgroundColor: NEW_COLOR.SEARCH_BLACK_BG
//     },
//     textGrey2: {
//         color: NEW_COLOR.TEXT_GREY2
//     },
//     textGrey8: {
//         color: NEW_COLOR.TEXT_GREY8
//     },
//     textGreyLight: {
//         color: NEW_COLOR.GRAY_LIGHT
//     },
//     textBlue3: {
//         color: NEW_COLOR.TEXT_BLUE3
//     },
//     sectionBorder: {
//         borderWidth: 1,
//         borderColor: NEW_COLOR.SECTION_BORDER,
//         borderRadius: s(5),
//     },
//     dashboardSectionBorder: {
//         borderWidth: 1,
//         borderColor: NEW_COLOR.DB_SECTION_BORDER,
//         borderRadius: s(5),
//     },
//     borderTransparent: {
//         borderWidth: 1,
//         borderColor: NEW_COLOR.TRANSPARENT,
//         borderRadius: s(5),
//     },
//     sectionStyle: {
//         backgroundColor: NEW_COLOR.SECTION_BG_COLOR,
//         padding: s(14), borderRadius: 5,
//         borderWidth: 1,
//         borderColor: NEW_COLOR.SECTION_BORDER,
//     },
//     SectionBorderOnly: {
//         backgroundColor: NEW_COLOR.TRANSPARENT,
//         borderRadius: s(5),
//         borderWidth: 1,
//         borderColor: NEW_COLOR.SECTION_BORDER,
//     },
//     sectionBg: {
//         backgroundColor: NEW_COLOR.TRANSPARENT,
//         borderRadius: s(5),
//         borderWidth: 1,
//         borderColor: NEW_COLOR.TRANSPARENT,
//     },
//     sectionBgColor: {
//         backgroundColor: NEW_COLOR.SECTION_BG_COLOR,
//         borderColor: NEW_COLOR.TRANSPARENT,
//     },
//     bgGray4: {
//         backgroundColor: NEW_COLOR.BG_GRAY4
//     },
//     bgtransparent: {
//         backgroundColor: NEW_COLOR.TRANSPARENT
//     },
//     sectionDarkBg: {
//         backgroundColor: NEW_COLOR.SECTION_DARK_BG
//     },
//     bggreen: {
//         backgroundColor: NEW_COLOR.TEXT_GREEN
//     },
//     pageTitle: {
//         fontSize: ms(18),
//         color: NEW_COLOR.SUB_TITLE_COLOR,
//         fontFamily: "Manrope-Medium"
//     },
//     sectionTitle: {
//         fontSize: ms(22), lineHeight: ms(26),
//         color: NEW_COLOR.TEXT_WHITE,
//         fontFamily: "Manrope-SemiBold"
//     },
//     Amounttitle: {
//         fontSize: ms(26), lineHeight: ms(26),
//         color: NEW_COLOR.TEXT_WHITE,
//         fontFamily: "Manrope-Medium",
//         textAlign: "center"


//     },
//     sectionLink: {
//         fontSize: ms(12),
//         fontFamily: "Manrope-Regular",
//         color: NEW_COLOR.TEXT_link,
//         lineHeight: ms(26),

//     },
//     borderBottom: {
//         borderBottomWidth: 1,
//         borderBottomColor: NEW_COLOR.BORDER_GREY
//     },
//     borderRight: {
//         borderRightWidth: 1,
//         borderRightColor: NEW_COLOR.BORDER_GREY
//     },
//     borderLeft: {
//         borderLeftWidth: 1,
//         borderLeftColor: NEW_COLOR.BORDER_GREY
//     },
//     hLine: {
//         height: 1, width: "100%", backgroundColor: NEW_COLOR.DIVIDER_COLOR
//     },
//     summaryLine: {
//         height: 1, width: "100%", backgroundColor: NEW_COLOR.TRANSPARENT,
//         borderTopWidth: 1, borderColor: NEW_COLOR.TEXT_GREY, borderStyle: "dashed",
//         marginVertical: s(14)
//     },
//     vLine: {
//         height: "100%", width: 1, backgroundColor: NEW_COLOR.DIVIDER_COLOR
//     },
//     vLineDashed: {
//         height: "100%", width: 1, backgroundColor: NEW_COLOR.TRANSPARENT,
//         borderLeftWidth: 1, borderColor: NEW_COLOR.TEXT_GREY, borderStyle: "dashed",
//     },
//     relative: {
//         position: "relative"
//     },
//     fs28: {
//         fontSize: ms(28), lineHeight: ms(34),
//         includeFontPadding: false,
//     },
//     fs26: {
//         fontSize: ms(26), lineHeight: ms(32),
//         includeFontPadding: false,
//     },
//     fs24: {
//         fontSize: ms(24), lineHeight: ms(30),
//         includeFontPadding: false,
//     },
//     fs22: {
//         fontSize: ms(22), lineHeight: ms(28),
//         includeFontPadding: false,
//     },
//     fs20: {
//         fontSize: ms(20), lineHeight: ms(25),
//         includeFontPadding: false,
//     },
//     fs18: {
//         fontSize: ms(18), lineHeight: ms(23),
//         includeFontPadding: false,
//     },
//     fs16: {
//         fontSize: ms(16), lineHeight: ms(21),
//         includeFontPadding: false,
//     },
//     fs14: {
//         fontSize: ms(14), lineHeight: ms(17),
//         includeFontPadding: false,
//     },
//     fs12: {
//         fontSize: ms(12), lineHeight: ms(15),
//         includeFontPadding: false,
//     },
//     fs10: {
//         fontSize: ms(10), lineHeight: ms(13),
//         includeFontPadding: false,
//     },
//     fs8: {
//         fontSize: ms(8), lineHeight: ms(10),
//         includeFontPadding: false,
//     },
//     fs6: {
//         fontSize: ms(6), lineHeight: ms(8),
//         includeFontPadding: false,
//     },
//     fs30: {
//         fontSize: ms(30), lineHeight: ms(36),
//         includeFontPadding: false,

//     },
//     fs32: {
//         fontSize: ms(32), lineHeight: ms(38),
//         includeFontPadding: false,
//     },
//     fs34: {
//         fontSize: ms(34), lineHeight: ms(40),
//         includeFontPadding: false,
//     },
//     fs36: {
//         fontSize: ms(36), lineHeight: ms(42),
//         includeFontPadding: false,
//     },
//     fs40: {
//         fontSize: ms(40), lineHeight: ms(46),
//         includeFontPadding: false,
//     },
//     input: {
//         borderWidth: 1,
//         borderColor: NEW_COLOR.INPUT_BORDER,
//         borderRadius: s(5),
//         fontSize: ms(16), color: NEW_COLOR.TEXT_WHITE,
//         textAlignVertical: 'center', height: s(48),
//         paddingHorizontal: 16, fontFamily: "Manrope-Regular",
//     },
//     textInput: {
//         borderWidth: 1,
//         borderColor: NEW_COLOR.INPUT_BORDER,
//         borderRadius: s(5),
//         paddingHorizontal: s(16),
//         fontSize: ms(16), color: NEW_COLOR.TEXT_WHITE,
//         height: s(48), fontFamily: "Manrope-Regular"

//     },
//     amountInput: {
//         borderBottomWidth: 1,
//         borderBottomColor: NEW_COLOR.INPUT_BORDER,
//         borderRadius: 0,
//         fontSize: ms(28), color: NEW_COLOR.TEXT_WHITE,
//         textAlign: "center",
//         fontFamily: "Manrope-Regular"
//     },
//     inputLabel: {
//         // position: "absolute", left: 14, top: -15, backgroundColor: NEW_COLOR.SCREENBG_BLACK,
//         // zIndex: 1,
//         // padding: s(3),
//         marginBottom: s(8),
//         color: NEW_COLOR.TEXT_WHITE,
//         fontSize: ms(14),
//         fontFamily: "Manrope-Regular"


//     },
//     bgWhite: {
//         backgroundColor: NEW_COLOR.TEXT_BLACK
//     },
//     sheetHeaderbg: {
//         backgroundColor: NEW_COLOR.SHEET_HEADER_BG
//     },
//     sheetbg: {
//         backgroundColor: NEW_COLOR.SHEET_BG
//     },
//     // textBlue: {
//     //     color: NEW_COLOR.TEXT_BLUE
//     // },
//     textprimary: {
//         color: NEW_COLOR.TEXT_PRIMARY
//     },
//     textBrown: {
//         color: NEW_COLOR.TEXT_BROWN
//     },
//     textRed: {
//         color: NEW_COLOR.TEXT_RED
//     },
//     textPurple: {
//         color: NEW_COLOR.TEXT_PURPLE
//     },
//     textGrey: {
//         color: NEW_COLOR.TEXT_GREY
//     },
//     applycardbg: {
//         backgroundColor: NEW_COLOR.BANNER_BG
//     },
//     placeholder: {
//         color: NEW_COLOR.PLACEHOLDER_TEXTCOLOR
//     },
//     textCardLabel: {
//         color: NEW_COLOR.CARD_LABEL
//     },
//     textGrey3: {
//         color: NEW_COLOR.TEXT_GREY3
//     },
//     textGrey4: {
//         color: NEW_COLOR.TEXT_GREY4
//     },
//     textGrey5: {
//         color: NEW_COLOR.TEXT_GREY5
//     },
//     textGrey6: {
//         color: NEW_COLOR.TEXT_GREY6
//     },
//     textGrey7: {
//         color: NEW_COLOR.TEXT_GREY7
//     },
//     textGreyAc: {
//         color: NEW_COLOR.TEXT_GREYAC
//     },
//     textPending: {
//         color: NEW_COLOR.TEXT_ORANGE
//     },
//     textBlack: {
//         color: NEW_COLOR.TEXT_BLACK
//     },
//     textWhite: {
//         color: NEW_COLOR.TEXT_WHITE
//     },
//     dotgrey: {
//         color: NEW_COLOR.TEXT_link
//     },
//     textLightGray: {
//         color: NEW_COLOR.TEXT_LIGHTGRAY
//     },
//     // buttonText: {
//     //     color: NEW_COLOR.TEXT_WHITE
//     // },
//     textKpiLabel: {
//         color: NEW_COLOR.TEXT_KPI_LABEL
//     },
//     textGreen: {
//         color: NEW_COLOR.TEXT_GREEN
//     },
//     textred: {
//         color: NEW_COLOR.RED
//     },
//     textPink: {
//         color: NEW_COLOR.TEXT_PINK
//     },
//     textLightGrey: {
//         color: NEW_COLOR.PLACEHOLDER_COLOR
//     },
//     textlinkgrey: {
//         color: NEW_COLOR.TEXT_link
//     },
//     textLink: {
//         color: NEW_COLOR.TEXT_ALWAYS_BLACK
//     },
//     textAlwaysWhite: {
//         color: NEW_COLOR.TEXT_ALWAYS_WHITE
//     },
//     textAlwaysBlack: {
//         color: NEW_COLOR.TEXT_ALWAYS_BLACK
//     },
//     BgAlwaysBlack: {
//         backgroundColor: NEW_COLOR.TEXT_ALWAYS_BLACK
//     },
//     textLightOrange: {
//         color: NEW_COLOR.TEXT_ORANGE
//     },
//     textOrange: {
//         color: NEW_COLOR.TEXT_ORANGE
//     },
//     textError: {
//         color: NEW_COLOR.TEXT_RED
//     },
//     TITLE_GREY: {
//         color: NEW_COLOR.TITLE_GREY
//     },
//     bgLightblue: {
//         backgroundColor: NEW_COLOR.BG_LIGHTBLUE
//     },
//     textLightwhite: {
//         color: NEW_COLOR.TEXT_LIGHTWHITE
//     },
//     textSecondary: {
//         color: NEW_COLOR.TEXT_SECONDARY
//     },
//     textActive: {
//         color: NEW_COLOR.TEXT_ACTIVE
//     },
//     textlightblack: {
//         color: NEW_COLOR.TEXT_LIGHTBLACK
//     },

//     quicklinks: {
//         backgroundColor: NEW_COLOR.QUICK_LINKS
//     },
//     navabaractive: {
//         backgroundColor: NEW_COLOR.Nav_Active
//     },
//     bgBlack: {
//         backgroundColor: NEW_COLOR.BG_BLACK
//     },
//     bggreen: {
//         backgroundColor: NEW_COLOR.TEXT_GREEN
//     },
//     bgwithdraw: {
//         backgroundColor: NEW_COLOR.WITHDRAW_BG
//     },
//     bgdeposist: {
//         backgroundColor: NEW_COLOR.DEPOSIST_BG
//     },
//     profilebg: {
//         backgroundColor: NEW_COLOR.Profile_Bg
//     },
//     cardsbg: {
//         backgroundColor: NEW_COLOR.CARDS_BG
//     },
//     notebg: {
//         backgroundColor: NEW_COLOR.NOTE_BG
//     },
//     noteleftborder: {
//         borderLeftWidth: 1,
//         borderRadius: 5,
//         borderLeftColor: NEW_COLOR.NOTE_ICON,
//     },
//     ActiveCarousel: {
//         width: s(20),
//         height: s(5),
//         borderRadius: s(100) / 2,
//         backgroundColor: NEW_COLOR.TEXT_WHITE,
//     },
//     InActiveCarousel: {
//         width: s(10),
//         height: s(10),
//         borderRadius: s(100) / 2,
//         backgroundColor: NEW_COLOR.CAROUSEL_BG,
//     },
//     dflex: {
//         flexDirection: "row",
//     },
//     alignCenter: {
//         alignItems: "center",
//     },
//     alignStart: {
//         alignItems: "flex-start",
//     },
//     alignEnd: {
//         alignItems: "flex-end",
//     },
//     justifyContent: {
//         justifyContent: "space-between",
//     },
//     justify: {
//         justifyContent: "space-between",
//     },
//     justifyAround: {
//         justifyContent: "space-around",
//     },
//     justifyCenter: {
//         justifyContent: "center"
//     },
//     justifyend: {
//         justifyContent: "flex-end"
//     },
//     justifystart: {
//         justifyContent: "flex-start"
//     },
//     flexWrap: {
//         flexWrap: "wrap"
//     },
//     textRight: {
//         textAlign: "right"
//     },
//     textLeft: {
//         textAlign: "left"
//     },
//     fw900: {
//         fontFamily: "Manrope"
//     },
//     fw800: {
//         fontFamily: "Manrope-ExtraBold"
//     },
//     fw700: {
//         fontFamily: "Manrope-Bold"
//     },
//     fw600: {
//         fontFamily: "Manrope-SemiBold"
//     },
//     fw500: {
//         fontFamily: "Manrope-Medium"
//     },
//     fw400: {
//         fontFamily: "Manrope-Regular"
//     },
//     fw300: {
//         fontFamily: "Manrope-Light"
//     },
//     fw200: {
//         fontFamily: "Manrope-ExtraLight"
//     },
//     fw100: {
//         fontFamily: "Manrope-Thin"
//     },
//     textCenter: {
//         textAlign: "center",
//     },
//     container: {
//         padding: 24,
//         // paddingTop: Platform.OS === 'android' ? 32 : 0,
//         flex: 1,
//         // backgroundColor: NEW_COLOR.SCREENBG_WHITE,
//         backgroundColor: NEW_COLOR.SCREENBG_BLACK,
//     },
//     pagePt50: {
//         paddingTop: Platform.OS === 'android' ? 14 : 0,
//         backgroundColor: NEW_COLOR.SCREENBG_BLACK,
//         paddingRight: s(16), paddingLeft: s(16)
//     },
//     containerBgTransparent: {
//         padding: s(16),
//         paddingTop: Platform.OS === 'android' ? 50 : 0,
//         flex: 1,
//         backgroundColor: NEW_COLOR.TRANSPARENT,
//     },
//     screenBg: {
//         // backgroundColor: NEW_COLOR.SCREENBG_WHITE,
//         backgroundColor: NEW_COLOR.SCREENBG_BLACK,
//     },
//     modalpt: {
//         paddingTop: Platform.OS === 'android' ? 12 : 0,
//     },
//     nativeModalpt: {
//         paddingTop: Platform.OS === 'android' ? 36 : 0,
//     },
//     blueBg: {
//         // backgroundColor: NEW_COLOR.SCREENBG_WHITE,
//         backgroundColor: NEW_COLOR.BG_BLUE,
//     },
//     BgPrimary: {
//         backgroundColor: NEW_COLOR.PRiMARY_COLOR,
//     },
//     flex1: {
//         flex: 1
//     },
//     flex2: {
//         flex: 2
//     },
//     mx14: {
//         marginTop: s(14), marginBottom: s(14),
//     },
//     mx7: {
//         marginTop: s(7), marginBottom: s(7),
//     },
//     mx6: {
//         marginTop: s(6), marginBottom: s(6),
//     },
//     mx4: {
//         marginTop: s(4), marginBottom: s(4),
//     },
//     my16: {
//         marginRight: s(16), marginLeft: s(16),
//     },
//     py5: {
//         paddingLeft: s(5), paddingRight: s(5),
//     },
//     py8: {
//         paddingTop: s(8), paddingBottom: s(8),
//     },
//     py20: {
//         paddingTop: s(20), paddingBottom: s(20),
//     },
//     px6: {
//         paddingLeft: s(6), paddingRight: s(6),
//     },
//     px4: {
//         paddingLeft: s(4), paddingRight: s(4),
//     },
//     gap8: {
//         gap: s(8)
//     },
//     gap24: {
//         gap: s(24),
//     },
//     gap30: {
//         gap: s(34),
//     },

//     gap40: {
//         gap: ms(40),
//     },
//     gap22: {
//         gap: s(22),
//     },
//     gap20: {
//         gap: s(20),
//     },
//     gap10: {
//         gap: s(10)
//     },
//     gap4: {
//         gap: s(4)
//     },
//     gap5: {
//         gap: s(5)
//     },
//     gap100: {
//         gap: s(100)
//     },
//     gap2: {
//         gap: s(2)
//     },
//     gap6: {
//         gap: s(6)
//     },
//     gap12: {
//         gap: s(12)
//     },
//     gap16: {
//         gap: s(16)
//     },
//     gap17: {
//         gap: s(17)
//     },
//     gap14: {
//         gap: s(14)
//     },

//     mb36: {
//         marginBottom: s(36),
//     },
//     mb4: {
//         marginBottom: s(4),
//     },
//     mb5: {
//         marginBottom: s(5),
//     },
//     mb18: {
//         marginBottom: s(18),
//     },
//     mb6: {
//         marginBottom: s(6),
//     },
//     mb2: {
//         marginBottom: s(2),
//     },
//     mb8: {
//         marginBottom: s(8),
//     },
//     mt8: {
//         marginTop: ms(8)
//     },
//     mb10: {
//         marginBottom: s(10),
//     },
//     mb12: {
//         marginBottom: s(12),
//     },
//     pb24: {
//         paddingBottom: s(24),
//     },
//     pb14: {
//         paddingBottom: s(14),
//     },
//     pb10: {
//         paddingBottom: s(10),
//     },
//     pt16: {
//         paddingTop: s(16),
//     },
//     pt10: {
//         paddingTop: s(10),
//     },
//     pt24: {
//         paddingTop: s(24),
//     },
//     pt20: {
//         paddingTop: s(20),
//     },
//     mr8: {
//         marginRight: s(8)
//     },
//     mr10: {
//         marginRight: s(10)
//     },
//     mr12: {
//         marginRight: s(12)
//     },
//     ml8: {
//         marginLeft: s(8)
//     },
//     ml22: {
//         marginLeft: s(22)
//     },
//     ml30: {
//         marginLeft: s(30)
//     },
//     mb0: {
//         marginBottom: 0,
//     },
//     mbs: {
//         marginBottom: s(-25),
//     },
//     mb16: {
//         marginBottom: s(16),
//     },
//     mt4: {
//         marginTop: s(4),
//     },

//     mt5: {
//         marginTop: s(5),
//     },
//     mt16: {
//         marginTop: s(16),
//     },
//     my14: {
//         marginVertical: s(14),
//     },
//     my10: {
//         marginVertical: s(14),
//     },
//     mt19: {
//         marginTop: s(19),
//     },
//     mxAuto: {
//         marginLeft: "auto",
//         marginRight: "auto"
//     },
//     myAuto: {
//         marginTop: "auto",
//         marginBottom: "auto"
//     },
//     mb43: {
//         marginBottom: s(40),
//     },
//     mb70: {
//         marginBottom: s(70),
//     },

//     mt40: {
//         marginTop: s(40),
//     },
//     mt50: {
//         marginTop: s(50)
//     },
//     mt70: {
//         marginTop: s(70)
//     },
//     mb40: {
//         marginBottom: s(43),
//     },
//     mb30: {
//         marginBottom: s(30)
//     },
//     mb24: {
//         marginBottom: s(24)
//     },
//     mt24: {
//         marginTop: s(24)
//     },
//     mt30: {
//         marginTop: s(30)
//     },
//     mb26: {
//         marginBottom: s(26)
//     },
//     mb28: {
//         marginBottom: s(28)
//     },
//     mb32: {
//         marginBottom: s(32)
//     },
//     mb20: {
//         marginBottom: s(20),
//     },
//     mb14: {
//         marginBottom: s(14),
//     },
//     p24: {
//         padding: s(24),
//     },
//     px24: {
//         paddingLeft: s(24), paddingRight: s(24)
//     },
//     px16: {
//         paddingLeft: s(16), paddingRight: s(16)
//     },
//     py24: {
//         paddingTop: s(24), paddingLeft: s(24),
//     },
//     py14: {
//         paddingTop: s(14), paddingBottom: s(14),
//     },
//     py12: {
//         paddingTop: s(12), paddingBottom: s(12),
//     },
//     pt0: {
//         paddingTop: 0,
//     },
//     dashedBorder: {
//         borderBottomWidth: 1,
//         borderStyle: 'dashed', height: 1, width: "100%",
//         borderColor: "rgba(68, 75, 79, 0.69)",
//     },
//     dashedBorderSection: {
//         borderWidth: 1,
//         borderStyle: 'dashed',
//         borderColor: NEW_COLOR.SECTION_BORDER,
//     },
//     qrcodedotted: {
//         borderWidth: 1,
//         borderStyle: 'dashed',
//         borderColor: NEW_COLOR.TEXT_WHITE,
//         borderrarius: s(5)
//     },
//     p16: {
//         padding: s(16)
//     },
//     p10: {
//         padding: s(10)
//     },
//     p14: {
//         padding: s(14)
//     },
//     p12: {
//         padding: s(12)
//     },
//     pl16: {
//         paddingLeft: s(16)
//     },
//     p0: {
//         padding: 0
//     },
//     pr0: {
//         paddingRight: 0
//     },
//     pb0: {
//         paddingBottom: 0
//     },
//     pt8: {
//         paddingTop: s(8)
//     },
//     p22: {
//         padding: s(22)
//     },
//     p8: {
//         padding: s(8)
//     },
//     p6: {
//         padding: s(6)
//     },
//     DashedBrown: {
//         borderColor: NEW_COLOR.BORDER_BROWN
//     },
//     DashedGreen: {
//         borderColor: "#1AAF87"
//     },
//     cancelBtn: {
//         backgroundColor: "transparent",
//     },
//     cancelBtnTitle: {
//         color: NEW_COLOR.BTN_BORDER_PURPLR,
//     },
//     btnBorder: {
//         borderColor: NEW_COLOR.BTN_BORDER_PURPLR,
//         borderWidth: 1, borderRadius: 100,
//     },
//     shareBorder: {
//         borderColor: NEW_COLOR.BORDER_BLACK,
//         borderWidth: 1, borderRadius: 5,
//     },
//     dashedLine: {
//         backgroundColor: NEW_COLOR.BG_PURPLERDARK,
//         borderStyle: "dashed",
//         borderWidth: 1, borderColor: NEW_COLOR.BORDER_BOTTOM,
//         height: 1, width: "100%"
//     },
//     mt10: {
//         marginTop: s(10),
//     },
//     mt12: {
//         marginTop: s(12),
//     },
//     headrbottomspace: {
//         marginTop: s(26),
//     },
//     mt6: {
//         marginTop: s(6),
//     },
//     menuitems: {
//         padding: s(14),
//     },
//     cardsboxes: {
//         height: s(95)
//     },
//     fixedBadge: {
//         position: "absolute", right: 0, top: 0, paddingRight: s(6), paddingLeft: s(6),
//         paddingTop: s(4), paddingBottom: s(4), borderBottomLeftRadius: s(4), borderBottomRightRadius: s(4)
//     },
// });

export const useCommonStyles = () => {
    return useStyleSheet(commonStyles);
};

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
    "suspended": NEW_COLOR.TEXT_RED,
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
    "freeze pending": NEW_COLOR.TEXT_YELLOW,
    "unfreeze pending": NEW_COLOR.TEXT_YELLOW,
    "inactive": NEW_COLOR.CANCELLED,
    "registered": NEW_COLOR.TEXT_YELLOW,
    "inprogress": NEW_COLOR.PENDING_STATUS,
    "completed": NEW_COLOR.TEXT_GREEN,
    "reopened": NEW_COLOR.TEXT_ORANGE,
    "requested": NEW_COLOR.REQUESTED_COLOR,
    "cardbinding": NEW_COLOR.PENDING_STATUS,
    "reviewing": NEW_COLOR.SUBMIT_TEXTCOLOR,
    'unverified': NEW_COLOR.TEXT_ORANGE,

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

// ------------------------------ Coin Images start ---------------------------------
export const CoinImages: any = {
    "usdt": "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/usdt.svg",
    "usdc": "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/usdc.svg",
    "eth": "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/eth.svg",
    "btc": "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/btc.svg",
    "usd": "https://rapidzstoragespacetst.blob.core.windows.net/images/usdflag.svg",
    "eur": "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/EUR.svg",
    "gbp": "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/GBP.svg",
    "chf": "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/CHF.svg",
    "idr": "https://devtstarthaone.blob.core.windows.net/arthaimages/indonesia - Icon.svg",
    "myrc": "https://devtstarthaone.blob.core.windows.net/arthaimages/MYRC.svg",
    "xsgd": "https://devtstarthaone.blob.core.windows.net/arthaimages/XSGD.svg",
    "bankusd": "https://rapidzstoragespacetst.blob.core.windows.net/images/usdflag.svg",
    "brl": "https://rapidzstorageprd.blob.core.windows.net/images/brl.svg",
    "sol": "https://fastxestoragespacetst.blob.core.windows.net/images/Solana-icon.svg",
    "aed": "https://fastxestoragespacetst.blob.core.windows.net/images/Aed-ICON.svg",
}
export const TransactionBlobIcons: Record<string, string> = {
    deposit: "https://rapidzstorageprd.blob.core.windows.net/images/notificationdeposist.svg",
    withdraw: "https://rapidzstorageprd.blob.core.windows.net/images/notificationwithdraw.svg",
    buy: "https://rapidzstoragespacetst.blob.core.windows.net/images/notificationbuy.svg",
    sell: "https://rapidzstoragespacetst.blob.core.windows.net/images/notificationsell.svg",
    purchase: "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/deposite-downarrow.svg",
    purchasefiat: "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/deposite-downarrow.svg",
    purchasecrypto: "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/deposite-downarrow.svg",
    exchangewallettransfer: "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/withdraw-uparrow.svg",
    accountdeposit: "https://rapidzstorageprd.blob.core.windows.net/images/notificationdeposist.svg",
    refund: "https://rapidzstorageprd.blob.core.windows.net/images/notificationrefund.svg",
    referralbonus: "https://fastxestoragespacetst.blob.core.windows.net/images/referralbpnusIcon.svg",
    applycard: "https://arthaonestorageprd.blob.core.windows.net/images/ArthaImages/cardapplynotification.svg",
    // add more if needed…
};
export const NotificationBlobIcons: Record<string, string> = {
    buy: "https://rapidzstoragespacetst.blob.core.windows.net/images/notificationbuy.svg",
    sell: "https://rapidzstoragespacetst.blob.core.windows.net/images/notificationsell.svg",
    deposit: "https://rapidzstorageprd.blob.core.windows.net/images/notificationdeposist.svg",
    depositfiat: "https://rapidzstorageprd.blob.core.windows.net/images/notificationdeposist.svg",
    depositcrypto: "https://rapidzstorageprd.blob.core.windows.net/images/notificationdeposist.svg",
    withdraw: "https://rapidzstorageprd.blob.core.windows.net/images/notificationwithdraw.svg",
    withdrawfiat: "https://arthaonestorageprd.blob.core.windows.net/images/ArthaImages/withdrawnotification.svg",
    withdrawcrypto: "https://rapidzstorageprd.blob.core.windows.net/images/notificationwithdraw.svg",
    purchase: "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/deposite-downarrow.svg",
    purchasefiat: "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/deposite-downarrow.svg",
    purchasecrypto: "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/deposite-downarrow.svg",
    exchangewallettransfer: "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/withdraw-uparrow.svg",
    accountdeposit: "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/deposite-downarrow.svg",
    refund: "https://arthaonestorageprd.blob.core.windows.net/images/ArthaImages/refundnotification.svg",
    accountrejected: "https://arthaonestorageprd.blob.core.windows.net/images/ArthaImages/accountcreationnotification.svg",
    accountcreation: "https://rapidzstoragespacetst.blob.core.windows.net/images/notificationaccountcreation.svg",
    payoutfiat: "https://arthaonestorageprd.blob.core.windows.net/images/ArthaImages/deposistnotification.svg",
    payoutcrypto: "https://arthaonestorageprd.blob.core.windows.net/images/ArthaImages/deposistnotification.svg",
    kyc: "https://rapidzstoragespacetst.blob.core.windows.net/images/notificationkyc&kyb.svg",
    kyb: "https://rapidzstoragespacetst.blob.core.windows.net/images/notificationkyc&kyb.svg",
    customer: "https://rapidzstgstorage.blob.core.windows.net/images/customer.svg",
    cases: "https://rapidzstoragespacetst.blob.core.windows.net/images/notificationcases.svg",
    airwallexmeshcardapply: "https://rapidzstorageprd.blob.core.windows.net/images/notificationcardapply.svg",
    payeesubmitted: "https://rapidzstgstorage.blob.core.windows.net/images/notificationpayeesubmitted.svg",
    payeepending: "https://rapidzstgstorage.blob.core.windows.net/images/notificationpayeepending.svg",
    payeeapproved: "https://rapidzstgstorage.blob.core.windows.net/images/notificationpayeeapproved.svg",
    payeerejected: "https://arthaonestorageprd.blob.core.windows.net/images/ArthaImages/payeeapprovednotification.svg",
    business: "https://rapidzstorageprd.blob.core.windows.net/images/notificationcardapply.svg",
    airwallexmeshcardtopup: "https://arthaonestorageprd.blob.core.windows.net/images/ArthaImages/topupnotification.svg",
    airwallexmeshcardrecharge: "https://arthaonestorageprd.blob.core.windows.net/images/ArthaImages/meshcardrechargenotification.svg",
    airwallexmeshcardactivationsuccessful: "https://rapidzstorageprd.blob.core.windows.net/images/notificationactivated.svg",
    payments: "https://arthaonestorageprd.blob.core.windows.net/images/ArthaImages/deposistnotification.svg",
    airwallexmeshcardfreezed: "https://arthaonestorageprd.blob.core.windows.net/images/ArthaImages/cardapplynotification.svg",
    fastxEPhysicalcardapply: "https://rapidzstorageprd.blob.core.windows.net/images/notificationcardapply.svg",
    addressbookapproved: "https://arthaonestorageprd.blob.core.windows.net/images/ArthaImages/payeeapprovednotification.svg",
    addressbookdraft: "https://arthaonestorageprd.blob.core.windows.net/images/ArthaImages/payeeapprovednotification.svg",
    personal: "https://arthaonestorageprd.blob.core.windows.net/images/ArthaImages/persoanalnotification.svg",
    fastxevirtualcardapply: "https://arthaonestorageprd.blob.core.windows.net/images/ArthaImages/cardapplynotification.svg",
    fastxevirtualcardrecharge: "https://arthaonestorageprd.blob.core.windows.net/images/ArthaImages/meshcardrechargenotification.svg",
    smashvirtualcardrecharge: "https://arthaonestorageprd.blob.core.windows.net/images/ArthaImages/meshcardrechargenotification.svg",
    smashvirtualcardtopup: "https://arthaonestorageprd.blob.core.windows.net/images/ArthaImages/topupnotification.svg",
    smashvirtualcardunfreezed: "https://arthaonestorageprd.blob.core.windows.net/images/ArthaImages/notificationfreezeicon.svg",
    smashphysicalcardapply: "https://rapidzstorageprd.blob.core.windows.net/images/notificationcardapply.svg",
    smashvirtualcardapply: "https://rapidzstorageprd.blob.core.windows.net/images/notificationcardapply.svg",
    smashvirtualcardfreezed: "https://arthaonestorageprd.blob.core.windows.net/images/ArthaImages/notificationfreezeicon.svg",
    smashvirtualcardactivationsuccessful: "https://arthaonestorageprd.blob.core.windows.net/images/ArthaImages/meshcardactivatednotification.svg",
    smashphysicalcardactivationsuccessful: "https://arthaonestorageprd.blob.core.windows.net/images/ArthaImages/meshcardactivatednotification.svg",
    addressookapproved: "https://rapidzstgstorage.blob.core.windows.net/images/notificationpayeeapproved.svg",
    addressbooksubmitted: "https://rapidzstgstorage.blob.core.windows.net/images/notificationpayeesubmitted.svg",
    Addressbookdraft: "https://rapidzstorageprd.blob.core.windows.net/images/notificationdraft.svg",
    default: "https://rapidzstorageprd.blob.core.windows.net/images/notificationdraft.svg",
    bankwithdrawfiat: "https://rapidzstorageprd.blob.core.windows.net/images/notificationwithdraw.svg",
    payeedraft: "https://rapidzstorageprd.blob.core.windows.net/images/notificationdraft.svg"
};

// ------------------------------ Coin Images end ---------------------------------



// ------------------------------ App Logo start ---------------------------------

export const LOGO_URIS = {
    light: "https://rapidzstoragespacetst.blob.core.windows.net/images/rapidwhitelogo.svg",
    dark: "https://rapidzstoragespacetst.blob.core.windows.net/images/rapiddarklogo.svg",
};
export const SUCCESS_IMG = {
    light: "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/applysuccessimg.svg",
    dark: "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/applysuccessimg.svg",

};
// ------------------------------ App Logo end ---------------------------------

// ------------------------------ Card  Logo start ---------------------------------
export const CARD_URIS = {
    visadark: "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/card_visa_logo.svg",
    visalight: "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/card_visa_logo.svg",
    rapizdark: "https://rapidzstoragespacetst.blob.core.windows.net/images/cardsrapizlogo.svg",
    rapizlight: "https://rapidzstoragespacetst.blob.core.windows.net/images/cardsrapizlogo.svg",
    visa: "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/card_visa_logo.svg",
    rapiz: "https://rapidzstoragespacetst.blob.core.windows.net/images/cardsrapizlogo.svg"
};
// ------------------------------ Card Logo start ---------------------------------


// ------------------------------ No Data start ---------------------------------
export const NODATA_URIS = {
    light: "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/nodataimage.svg",
    dark: "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/arthapay_nodata.svg",
};

export const cryptoLogos = [
    "https://rapidzstoragespacetst.blob.core.windows.net/images/MYRC.svg",
    "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/usdt.svg",
    "https://devtstarthaone.blob.core.windows.net/arthaimages/XSGD.svg",
    "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/usdc.svg",
];

export const fiatLogos = [
    "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/GBP.svg",
    "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/EUR.svg",
    "https://devtstarthaone.blob.core.windows.net/arthaimages/indonesia - Icon.svg",
    "https://rapidzstoragespacetst.blob.core.windows.net/images/usdflag.svg",
    "https://arthaonestorageprd.blob.core.windows.net/images/BRL.svg",

];
export const WalletsfiatLogos = [
    // "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/EUR.svg",
    "https://devtstarthaone.blob.core.windows.net/arthaimages/indonesia - Icon.svg",
    // "https://rapidzstoragespacetst.blob.core.windows.net/images/usdflag.svg",
    "https://arthaonestorageprd.blob.core.windows.net/images/BRL.svg",

];
export const QRCODESIZE = s(186)
export const BANNERARROW = s(18)






































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
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.QUICK_LINKS,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    BankListGap: {
        marginBottom: s(10)
    },
    actioniconbg: {
        width: s(26),
        height: s(26),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.TEXT_PRIMARY,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: s(6)
    },
    bottomsheetprimarytexttitle: {
        fontSize: s(16),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_WHITE
    },
    bottomsheetsecondarytexttitlepara: {
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_link
    },
    twolettertext: {
        fontSize: s(16),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_WHITE,
        // marginTop: s(3)
    },
    twoActivelettertext: {
        fontSize: s(16),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_WHITE,

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
    primarytext: {
        fontSize: s(14),
        fontFamily: "Manrope-Regular",
        marginBottom: s(4),
        color: NEW_COLOR.TEXT_WHITE,

    },

    secondarytext: {
        fontSize: s(14),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_link
    },
    secondryamountInputLabel: {
        color: NEW_COLOR.TEXT_WHITE,
        fontSize: ms(30),
        fontFamily: "Questrial-Regular",
        textAlign: "right"
    },
    sectiontitlepara: {
        fontSize: s(18),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_link
    },
    sectionsubtitlepara: {
        fontSize: s(14),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_link
    },
    securitysecondarypara: {
        fontSize: s(14),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_link
    },
    idrprimarytext: {
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
        marginBottom: s(6),
        color: NEW_COLOR.TEXT_WHITE,

    },
    idrsecondarytext: {
        fontSize: s(14),
        fontFamily: "Manrope-Regular",
        marginBottom: s(6),
        color: NEW_COLOR.TEXT_link
    },
    colorstatus: {
        fontSize: s(12),
        fontFamily: "Manrope-Regular",
        marginBottom: s(6),
    },
    accordianSecondarytext: {
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_link,
    },
    accordianprimarytext: {
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_WHITE,
    },
    listprimarytext: {
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_WHITE,
        // textAlign: "right",

    },
    listsecondarytext: {
        fontSize: s(14),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_link
    },
    circlebg: {
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.CIRCLE_BG,


    },
    circletext: {
        fontSize: s(16),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_WHITE

    },
    referralsbg: {
        backgroundColor: NEW_COLOR.REFERRALA_BG
    },
    cardquicklinks: {
        width: s(118),
        height: s(44),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.QUICK_LINKS,

    },
    rounded16: {
        borderRadius: s(5)
    },
    rounded20: {
        borderRadius: s(5)
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

    touchedborder: {
        borderColor: NEW_COLOR.BUTTON_BG
    },
    textgraph: {
        color: NEW_COLOR.GRAPH_TEXT

    },
    px10: {
        paddingLeft: s(10), paddingRight: s(10)
    },
    px9: {
        paddingLeft: s(9), paddingRight: s(9)
    },
    textStrike: {
        textDecorationLine: 'line-through',
        textDecorationStyle: 'solid'
    },
    formItemSpace: {
        marginBottom: s(32)
    },
    ActiveCarousel: {
        width: s(20),
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
    buttonBg: {
        backgroundColor: NEW_COLOR.TEXT_PRIMARY,
    },

    lighttextwhite: {
        color: NEW_COLOR.LIGHT_TEXTWHITE
    },

    mb72: {
        marginBottom: s(72)
    },
    listChildGap: {
        marginBottom: s(6)
    },
    listGap: {
        marginBottom: s(24)
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
        backgroundColor: NEW_COLOR.BANNER_BG,
    },
    activeNameIconStyle: {
        height: s(34), width: s(34),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.PRiMARY_COLOR,
    },
    activeItemBg: {
        backgroundColor: NEW_COLOR.TAB_ACTIVE_BG,
        borderRadius: s(5),
        paddingLeft: s(8),
        paddingRight: s(8),
        paddingTop: s(5),
        paddingBottom: s(5)
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
        borderWidth: 1, borderColor: NEW_COLOR.INPUT_BORDER,
        flexDirection: "row", alignItems: "center", gap: 8, borderRadius: s(12),
        marginTop: s(16)
    },
    uploadStyle: {
        paddingVertical: s(34),
        paddingHorizontal: s(16), borderWidth: 1,
        borderRadius: s(5), borderStyle: "dashed", borderColor: NEW_COLOR.INPUT_BORDER
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
        width: s(100), backgroundColor: NEW_COLOR.VERIFY_BTN_BG,
        borderWidth: 1,

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
        borderWidth: 1, borderColor: NEW_COLOR.INPUT_BORDER,
        borderRadius: 5, padding: s(12)
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
    rounded12: {
        borderRadius: s(12)
    },
    rounded11: {
        borderRadius: s(12)
    },
    rounded10: {
        borderRadius: s(10)
    },

    rounded5: {
        borderRadius: s(13)
    },
    rounded6: {
        borderRadius: s(6)
    },
    rounded100: {
        borderRadius: s(100) / 2
    },
    rounded0: {
        borderRadius: 0
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
    searchContainer: {
        // justifyContent: 'space-between',
        // position: 'relative',
        flexDirection: 'row',
        paddingHorizontal: ms(16),
        height: s(48),
        borderRadius: s(100),
        backgroundColor: NEW_COLOR.INPUT_BG,
        alignItems: "center",
        gap: s(16),
        borderWidth: 1,
        borderColor: NEW_COLOR.INPUT_BORDER,


        // commonStyles.dflex,commonStyles.alignCenter,commonStyles.gap16
    },
    accordianSearchContainer: {
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'relative',
        flexDirection: 'row',
        paddingHorizontal: ms(16),
        height: s(44),
        borderRadius: s(50),
        backgroundColor: NEW_COLOR.INPUT_BG,
        gap: s(16),
        borderWidth: 1,
        borderColor: NEW_COLOR.INPUT_BORDER

    },
    searchInput: {
        ...text(14, 16.8, 400, NEW_COLOR.TEXT_LIGHT, true),
        // position: 'relative',
        width: "100%",
        paddingVertical: 1,
        color: NEW_COLOR.TEXT_WHITE, flex: 1, marginRight: s(20),
        fontSize: ms(14), fontFamily: "Manrope-Regular", lineHeight: ms(22)
    },
    searchinputtext: {
        width: "100%",
        color: NEW_COLOR.TEXT_WHITE, flex: 1, marginRight: s(20),
        fontSize: ms(14), fontFamily: "Manrope-Regular", lineHeight: ms(22)
    },
    inputContainer: {
        borderRadius: s(5),
        borderColor: NEW_COLOR.INPUT_BORDER,
        borderWidth: 1,
        backgroundColor: NEW_COLOR.INPUT_BG,
        height: s(48),
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
    refferaltext: {
        color: NEW_COLOR.REFERRAL_TEXT
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
    sectionBorder: {
        borderWidth: 1,
        borderColor: NEW_COLOR.SECTION_BORDER,
        borderRadius: s(5),
    },
    Activeborder: {
        borderWidth: 1,
        borderColor: NEW_COLOR.TEXT_PRIMARY,
        borderRadius: s(5),
        padding: s(16),
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
    bgtransparent: {
        backgroundColor: NEW_COLOR.TRANSPARENT
    },
    sectionDarkBg: {
        backgroundColor: NEW_COLOR.SECTION_DARK_BG
    },
    bottomtitletext: {
        fontSize: ms(18),
        color: NEW_COLOR.SUB_TITLE_COLOR,
        fontFamily: "Manrope-Medium"
    },
    sectionTitle: {
        fontSize: ms(20), lineHeight: ms(100),
        color: NEW_COLOR.TEXT_WHITE,
        fontFamily: "Manrope-Bold"
    },
    securitytitle: {
        fontSize: ms(18), lineHeight: ms(100),
        color: NEW_COLOR.TEXT_WHITE,
        fontFamily: "Manrope-Bold"
    },
    securitysecondTitle: {
        fontSize: ms(16), lineHeight: ms(100),
        color: NEW_COLOR.TEXT_WHITE,
        fontFamily: "Manrope-Bold"
    },
    RefeeralsectionTitle: {
        fontSize: ms(18), lineHeight: ms(100),
        color: NEW_COLOR.TEXT_WHITE,
        fontFamily: "Manrope-Bold"
    },
    secondsectiontitle: {
        fontSize: ms(16),
        color: NEW_COLOR.TEXT_WHITE,
        fontFamily: "Manrope-Bold"
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
        fontFamily: "Manrope-SemiBold",
        color: NEW_COLOR.LINKPRIMARY_COLOR,
        lineHeight: ms(26),

    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: NEW_COLOR.BORDER_GREY
    },
    xppointsbg: {
        backgroundColor: NEW_COLOR.XPPOINTS_BG,
        paddingHorizontal: s(30), paddingVertical: s(8)

    },
    usdtpointsbg: {
        backgroundColor: NEW_COLOR.USDTPOINTS,
        paddingHorizontal: s(30), paddingVertical: s(8)

    },
    surpriseboxbg: {
        backgroundColor: NEW_COLOR.SURPRISEBOX_BG,
        paddingHorizontal: s(20), paddingVertical: s(8)

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
    input: {
        borderWidth: 1,
        borderColor: NEW_COLOR.INPUT_BORDER,
        borderRadius: s(5),
        fontSize: ms(14), color: NEW_COLOR.TEXT_WHITE,
        textAlignVertical: 'center', height: s(48),
        paddingHorizontal: s(16), fontFamily: "Manrope-Regular",
        backgroundColor: NEW_COLOR.INPUT_BG

    },
    withdrawPayeeInput: {
        borderWidth: 1,
        borderColor: NEW_COLOR.INPUT_BORDER,
        borderRadius: s(5),
        fontSize: ms(14), color: NEW_COLOR.TEXT_WHITE,
        textAlignVertical: 'center', height: s(56),
        paddingHorizontal: 16, fontFamily: "Manrope-Regular",
        backgroundColor: NEW_COLOR.INPUT_BG
    },

    amountInput: {
        // borderBottomWidth: 1,
        // borderBottomColor: NEW_COLOR.INPUT_BORDER,
        borderRadius: 0,
        fontSize: ms(55), color: NEW_COLOR.TEXT_WHITE,
        // textAlign: "center",
        fontFamily: "Manrope-Regular"
    },

    successtitletext: {
        color: NEW_COLOR.TEXT_WHITE,
        fontFamily: "Manrope-Medium",
        fontSize: ms(16),
        marginBottom: s(6)

    },
    verificationsbottomtext: {
        fontSize: ms(14),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_link
    },
    Successpara: {
        fontSize: s(18),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_link,
        textAlign: "center",
    },
    buttongap: {
        marginTop: s(16),
    },
    amountInputLabel: {
        marginBottom: s(10),
        color: NEW_COLOR.TEXT_WHITE,
        fontSize: ms(16),
        fontFamily: "Manrope-Medium"

    },
    payeeLabel: {
        marginTop: s(32),
        color: NEW_COLOR.TEXT_WHITE,
        fontSize: ms(16),
        fontFamily: "Manrope-Medium",
        marginBottom: s(8)


    },
    bottomsheeticonprimarytext: {
        color: NEW_COLOR.TEXT_WHITE,
        fontSize: ms(14),
        fontFamily: "Manrope-Medium"

    },
    bgWhite: {
        backgroundColor: NEW_COLOR.TEXT_BLACK
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
    arrowiconprimary: {
        color: NEW_COLOR.LINKPRIMARY_COLOR,
        marginTop: s(4)
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
    Inputbg: {
        backgroundColor: NEW_COLOR.INPUT_BG
    },
    chatuploadbg: {
        backgroundColor: NEW_COLOR.CHATUPLOAD_BG
    },
    chatreplybg: {
        backgroundColor: NEW_COLOR.CHATREPLEY_BG
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
        color: NEW_COLOR.TEXT_GREEN
    },
    whitetext: {
        color: NEW_COLOR.WHITE_TEXT
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
        color: NEW_COLOR.TEXT_RED,
        marginTop: s(8),
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
        backgroundColor: NEW_COLOR.BG_BLACK,
        padding: s(10),
        borderRadius: s(6)
    },
    tabactivebg: {
        backgroundColor: NEW_COLOR.TAB_ACTIVE_BG
    }, chatcolorstatus: {
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
        marginBottom: s(6),
    },
    bgwithdraw: {
        backgroundColor: NEW_COLOR.WITHDRAW_BG,
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"

    },

    roundediconbg: {
        width: s(34),
        height: s(34),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.ROUNDEDICON_BG,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    bottomsheetroundediconbg: {
        width: s(34),
        height: s(34),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.BOTTOMSHEETROUNDEDICON_BG,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    bottomsheetroundedactiveiconbg: {
        width: s(34),
        height: s(34),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.BOTTOMSHEETACTIVEROUNDED_ICON,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    inputdropdowntext: {
        fontSize: s(16),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_WHITE,
    },
    inputbottomtext: {
        fontSize: s(14),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_link,
        marginTop: s(8),
        textAlign: "right",
    },
    transactionsListGap: {
        marginBottom: s(24)
    },
    bgnote: {
        backgroundColor: NEW_COLOR.BANNER_BG,
        padding: s(12),
        borderRadius: s(12)
    },
    bgNoteText: {
        fontSize: s(12),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_WHITE
    },
    copytooltip: {
        backgroundColor: NEW_COLOR.COPY_TOOLTIP
    },
    inputroundediconbg: {
        width: s(34),
        height: s(34),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.INPUTROUNDED_ICON,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    bgdeposist: {
        backgroundColor: NEW_COLOR.DEPOSIST_BG,
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"

    },
    refumdbg: {
        backgroundColor: NEW_COLOR.REFUND_BG,
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"

    },
    profilebg: {
        backgroundColor: NEW_COLOR.Profile_Bg
    },
    profilemenutext: {
        fontSize: s(16),
        fontFamily: "Manrope-SemiBold",
        color: NEW_COLOR.TEXT_WHITE,
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
    fw100: {
        fontFamily: "Rowdies-Light"
    },
    fw200: {
        fontFamily: "Manrope-ExtraLight"
    },

    textCenter: {
        textAlign: "center",
    },
    container: {
        padding: s(24),
        paddingTop: Platform.OS === 'android' ? s(16) : s(18),
        flex: 1,
        backgroundColor: NEW_COLOR.SCREENBG_BLACK,
    },
    pageheadercontainer: {
        paddingTop: Platform.OS === 'android' ? s(26) : s(10),

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
    graphbg: {
        backgroundColor: NEW_COLOR.TAB_GREEN,
        borderRadius: s(5) / 2, paddingVertical: s(1), paddingHorizontal: s(6)
    },
    disablegrabhbg: {
        backgroundColor: NEW_COLOR.QUICK_LINKS,
        borderRadius: s(5) / 2, paddingVertical: s(1), paddingHorizontal: s(6)

    },
    screenBg: {
        // backgroundColor: NEW_COLOR.SCREENBG_WHITE,
        backgroundColor: NEW_COLOR.SCREENBG_BLACK,
    },
    modalpt: {
        paddingTop: Platform.OS === 'android' ? 26 : 0,
    },
    nativeModalpt: {
        paddingTop: Platform.OS === 'android' ? 36 : 0,
    },
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
    flex2: {
        flex: 2
    },
    mx14: {
        marginTop: s(14), marginBottom: s(14),
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
    py5: {
        paddingLeft: s(5), paddingRight: s(5),
    },
    py2: {
        paddingLeft: s(4), paddingRight: s(4),
    },
    py6: {
        paddingLeft: s(6), paddingRight: s(6),
    },
    py8: {
        paddingTop: s(8), paddingBottom: s(8),
    },
    py10: {
        paddingTop: s(10), paddingBottom: s(10),
    },
    py7: {
        paddingTop: s(6), paddingBottom: s(6),
    },
    py20: {
        paddingTop: s(20), paddingBottom: s(20),
    },
    px6: {
        paddingLeft: s(6), paddingRight: s(6),
    },
    px4: {
        paddingLeft: s(4), paddingRight: s(4),
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
    mb10: {
        marginBottom: s(10),
    },
    mb12: {
        marginBottom: s(12),
    },
    mtnagtive4: {
        marginTop: -4,
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
    pt16: {
        paddingTop: s(16),
    },
    pt10: {
        paddingTop: s(10),
    },
    pt12: {
        paddingTop: s(12),
    },
    pt24: {
        paddingTop: s(24),
    },
    pt4: {
        paddingTop: s(2),
    },
    pt20: {
        paddingTop: s(20),
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
    ml2: {
        marginLeft: s(2)
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
    mb0: {
        marginBottom: 0,
    },
    mbs: {
        marginBottom: s(-25),
    },

    mt4: {
        marginTop: s(4),
    },
    mt2: {
        marginTop: s(2),
    },
    mt5: {
        marginTop: s(5),
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
    mt70: {
        marginTop: s(70)
    },
    mt90: {
        marginTop: s(100)
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
    mb26: {
        marginBottom: s(26)
    },
    mb28: {
        marginBottom: s(28)
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
    px14: {
        paddingLeft: s(14), paddingRight: s(14)
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
    // pl40: {
    //     paddingLeft: s(58)
    // },
    p0: {
        padding: 0
    },
    pr0: {
        paddingRight: 0
    },
    pr5: {
        paddingRight: s(5)

    },
    pr16: {
        paddingRight: s(16)

    },
    pr2: {
        paddingRight: s(2)

    },
    pr20: {
        paddingRight: s(20)

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
    p6: {
        padding: s(6)
    },
    p4: {
        padding: s(4)
    },
    p2: {
        padding: s(2)
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
    applycardbannerbg: {
        backgroundColor: NEW_COLOR.APPLYCARD_BANNERBG,
        padding: s(12),
        borderRadius: s(12)

    },
    kpibg: {
        backgroundColor: NEW_COLOR.KPI_BG,
        padding: s(12),
        borderRadius: s(12)
    },
    kpiamounttext: {
        fontSize: s(16),
        fontFamily: "Manrope-SemiBold",
        color: NEW_COLOR.TEXT_WHITE,
        marginTop: s(4)
    },
    inputdropdowntabactivebg: {
        backgroundColor: NEW_COLOR.INPUTDROPDOWNTAB_ACTIVE_BG
    },
    kpiamountlabel: {
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_KPI_LABEL,
    },
    Cardslist: {
        backgroundColor: NEW_COLOR.CARDS_LIST,
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
    skipborder: {
        borderWidth: 1, borderColor: NEW_COLOR.SKIP_border,
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
        // padding: s(14),
    },
    cardsboxes: {
        height: s(95)
    },
    fixedBadge: {
        position: "absolute", right: 0, top: 0, paddingRight: s(6), paddingLeft: s(6),
        paddingTop: s(4), paddingBottom: s(4), borderBottomLeftRadius: s(4), borderBottomRightRadius: s(4)
    },
    bannertext: {
        fontSize: s(12),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_WHITE,
        marginBottom: s(6)

    },
    marketHelightsBackgroundColor: {
        backgroundColor: NEW_COLOR.MARKET_HELIGHTS_BACKGROUND_COLOR,
    },
    tooltipContainer: {
        position: 'absolute',
        alignItems: 'center',
    },
    tooltipBody: {
        backgroundColor: NEW_COLOR.BANNER_BG,
        paddingHorizontal: s(16),
        paddingVertical: s(10),
        borderRadius: s(8),
        width: s(220),
    },
    tooltipArrow: {
        width: 0,
        height: 0,
        borderLeftWidth: s(10),
        borderRightWidth: s(10),
        borderTopWidth: s(10),
        borderStyle: 'solid',
        backgroundColor: NEW_COLOR.TRANSPARENT,
        borderLeftColor: NEW_COLOR.TRANSPARENT,
        borderRightColor: NEW_COLOR.TRANSPARENT,
        borderTopColor: NEW_COLOR.BANNER_BG,
    },
    tabBarContainer: {
        backgroundColor: NEW_COLOR.TAB_BAR_BG,
        borderRadius: s(100) / 2,
        height: s(40),
        borderWidth: 1,
        borderColor: NEW_COLOR.INPUT_BORDER
    },
    availbleamountbuylabel: {
        color: NEW_COLOR.TEXT_WHITE,
        fontSize: s(14),
        fontFamily: "Manrope-Medium",

    },
    buyiconbg: {
        width: s(38),
        height: s(38),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.BUYICON_BG,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: s(40),
    },
    activeTabButton: {
        backgroundColor: NEW_COLOR.PAY_ACTIVE_BG,
        borderRadius: s(100) / 2,
    },
    inactiveTabButton: {
        backgroundColor: 'transparent',
    },
    tabtext: {
        fontSize: s(16),
        fontFamily: "Manrope-Medium",
    },
    disabledContainerStyle: {
        backgroundColor: NEW_COLOR.DIABLE_FIELD_BACK_GROUND,
        borderColor: NEW_COLOR.DIABLE_FIELD_BORDER_COLOR,
    },
    disabledTextStyle: {
        color: NEW_COLOR.DIABLE_FIELD_COLOR,
    },
    chooseaccounttype: {
        color: NEW_COLOR.TEXT_WHITE,
        fontFamily: "Manrope-SemiBold",
        fontSize: ms(16),
        marginBottom: s(6)
    },
    chooseaccounttypepara: {
        color: NEW_COLOR.TEXT_link,
        fontFamily: "Manrope-Regular",
        fontSize: ms(12),
    },
    referralcodebg: {
        position: "relative",
        paddingRight: 0,
        borderRadius: s(5),
        backgroundColor: "transparent",
        borderColor: NEW_COLOR.INPUT_BORDER,
        borderWidth: 1, height: s(48),
    },
    sectionSubTitleText: {
        color: NEW_COLOR.TEXT_WHITE,
        fontFamily: "Manrope-medium",
        fontSize: ms(16),
    },
    referralcodetext: {
        color: NEW_COLOR.TEXT_WHITE,
        fontFamily: "Manrope-medium",
        fontSize: ms(10),
    },
    chatSubTitlepara: {
        color: NEW_COLOR.TEXT_link,
        fontFamily: "Manrope-medium",
        fontSize: ms(12),
    },
    chattitletext: {
        color: NEW_COLOR.TEXT_WHITE,
        fontFamily: "Manrope-medium",
        fontSize: ms(14),
    },
    bottomsheetsectiontitle: {
        color: NEW_COLOR.TEXT_WHITE,
        fontFamily: "Manrope-medium",
        fontSize: ms(18),
    },
    bottomsheetsectionpara: {
        color: NEW_COLOR.TEXT_WHITE,
        fontFamily: "Manrope-medium",
        fontSize: ms(16),
    },
    invoicetable: {
        fontSize: s(14),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_link,
        lineHeight: ms(17)
    },

    payeeitemaddinputtext: {
        fontSize: ms(20),
        fontFamily: "Manrope-SemiBold",
        color: NEW_COLOR.TEXT_WHITE,
    },

    textsecondarypara: {
        fontSize: s(12),
        fontFamily: "Manrope-medium",
        color: NEW_COLOR.TEXT_link,

    },
    Amounttext: {
        fontSize: s(30),
        fontFamily: "Manrope-SemiBold",
        color: NEW_COLOR.TEXT_WHITE,
        marginTop: s(4)
    },
    Amounttextlabel: {
        fontSize: s(14),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_link,
    },
    graphactivebuttons: {
        backgroundColor: NEW_COLOR.LINKPRIMARY_COLOR,
        borderRadius: s(8) / 2,
        width: s(36), height: s(26), justifyContent: "center", alignItems: "center"
    },
    graphactivebuttonstext: {
        color: NEW_COLOR.TEXT_BLACK,
        fontSize: s(14),
        fontFamily: "Manrope-Medium",

    },
    graphinactivebuttons: {
        backgroundColor: NEW_COLOR.BANNER_BG,
        borderRadius: s(8) / 2,
        width: s(38), height: s(26), justifyContent: "center", alignItems: "center",

    },

    graphinactivebuttonstext: {
        fontSize: s(14),
        fontFamily: "Manrope-Regular",

    },



    walletaddresssecondarytext: {
        fontSize: s(16),
        fontFamily: "Manrope-Regular",
        marginBottom: s(4),
        color: NEW_COLOR.TEXT_link
    },
    walletaddressessprimarytext: {
        fontSize: s(16),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_WHITE
    },
    paymentLinkprimarytext: {
        fontSize: s(16),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_PRIMARY
    },
    transactionamounttext: {
        fontSize: s(30),
        fontFamily: "Manrope-Medium",
        textAlign: "center",
        color: NEW_COLOR.TEXT_WHITE

    },
    listbannerbg: {
        padding: s(0),
        borderRadius: s(0),
        backgroundColor: "transparent",
    },
    bottomsheetprimarytext: {
        fontSize: s(16),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_WHITE

    },
    bottomsheetactiveprimaryText: {
        fontSize: s(16),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_WHITE
    },
    amountTobePaidtext: {
        fontSize: s(28),
        fontFamily: "Manrope-Medium",
        textAlign: "center",
        color: NEW_COLOR.TEXT_WHITE

    },
    transactionamounttextlabel: {
        fontSize: s(14),
        color: NEW_COLOR.TEXT_link,
        fontFamily: "Manrope-Medium",
        textAlign: "center",
        marginBottom: s(6)
    },
    paymentlink: {
        fontSize: s(10),
        fontFamily: "Poppins-Medium",
        color: NEW_COLOR.ADD_ICON
    },
    transactionsecondartamounttext: {
        fontSize: s(18),
        fontFamily: "Manrope-Regular",
        textAlign: "center",
        color: NEW_COLOR.TEXT_WHITE,
    },
    topupcurrencytext: {
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
        textAlign: "center",
        color: NEW_COLOR.TEXT_WHITE,
        marginTop: s(5)
    },
    topupcurrencylabeltext: {
        fontSize: s(12),
        fontFamily: "Manrope-Regular",
        textAlign: "center",
        color: NEW_COLOR.TEXT_link,
        // includeFontPadding: false,

    },

    paymentinvoicedatetext: {
        fontSize: s(14),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_link,
    },
    paymentinvoicedate: {
        fontSize: s(14),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_WHITE,
        marginTop: s(6)

    },
    paymentadddressestext: {
        fontSize: s(14),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_WHITE,
        marginTop: s(6)

    },

    listitemGap: {
        marginBottom: s(22)
    },
    paymentinvoicfrom: {
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_WHITE,
        marginBottom: s(6)

    },
    textlinks: {
        fontSize: s(16),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_PRIMARY
    },
    /*notification icon*/
    accountcreatedbg: {
        backgroundColor: NEW_COLOR.ACCOUNTCREATED_BG,
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    kyckyb: {
        backgroundColor: NEW_COLOR.KYC_KYB_ICONBG,
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    buy: {
        backgroundColor: NEW_COLOR.BUY_ICONBG,
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    sell: {
        backgroundColor: NEW_COLOR.SELL_ICONBG,
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    cases: {
        backgroundColor: NEW_COLOR.CASES_ICONBG,
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    Accountrejected: {
        backgroundColor: NEW_COLOR.ACCOUNTREJECTED_ICONBG,
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    freezed: {
        backgroundColor: NEW_COLOR.FREEZE_ICONBG,
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    customer: {
        backgroundColor: NEW_COLOR.CUSTOMER_ICONBG,
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    payeesubmitted: {
        backgroundColor: NEW_COLOR.PAYEE_SUBMITTED,
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    addressdraft: {
        backgroundColor: NEW_COLOR.ADDRESS_BOOKDRAFT,
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    payeeapproved: {
        backgroundColor: NEW_COLOR.PAYEE_APPROVED,
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    payeepending: {
        backgroundColor: NEW_COLOR.PAYEE_PENDING,
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    bussiness: {
        backgroundColor: NEW_COLOR.BUSSINESS,
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    cardtopup: {
        backgroundColor: NEW_COLOR.CARDTOPUP_NOTIFICATIONICON_BG,
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    personal: {
        backgroundColor: NEW_COLOR.CARDTOPUP_NOTIFICATIONICON_BG,
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    paymentbg: {
        backgroundColor: NEW_COLOR.DEPOSIST_BG,
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    cardapply: {
        backgroundColor: NEW_COLOR.CARD_APPLYBG,
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    cardactivated: {
        backgroundColor: NEW_COLOR.CARDACTIVATED_ICONBG,
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    cardfreeze: {
        backgroundColor: NEW_COLOR.FREEZE_ICONBG,
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    cardunfreeze: {
        backgroundColor: NEW_COLOR.UNFREEZE_ICONBG,
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    cardunrecharge: {
        backgroundColor: NEW_COLOR.CARDRECHARGE_ICONBG,
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    /*notification icon end*/
    checkboxtext: {
        fontSize: s(18),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_WHITE,
        marginTop: s(2)
    },
    checkboxcardtext: {
        fontSize: s(16),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_WHITE,
        marginTop: s(1)
    },
    cardsbannerbg: {
        padding: s(0),
        borderRadius: s(0),
        backgroundColor: "transparent"
    },
    casescardsbannerbg: {
        padding: s(12),
        borderRadius: s(12),
        backgroundColor: NEW_COLOR.BANNER_BG
    },
    listDecimalFontSize: {
        fontSize: s(12),
        fontFamily: "Manrope-Medium"
    },
    listFontSize: {
        fontFamily: "Manrope-Medium",
        fontSize: s(16),
        marginBottom: s(6),
        color: NEW_COLOR.TEXT_WHITE,
    },
    pageTitle: {
        fontSize: ms(18),
        color: NEW_COLOR.SUB_TITLE_COLOR,
        fontFamily: "Manrope-Medium"
    },

    solidContainer: {
        borderRadius: s(100) / 2,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: NEW_COLOR.SECONDARY_BUTTONBORDER,
        backgroundColor: "transparent",

    },
    gradientButton: {
        borderRadius: s(100) / 2,
        overflow: 'hidden',
        backgroundColor: NEW_COLOR.BUTTON_BG,
        paddingVertical: ms(2),
    },
    buttonTitle: {
        fontSize: ms(16),
        color: NEW_COLOR.BUTTON_TEXT,
        fontFamily: "Manrope-Medium",
    },
    errormessageBg: {
        backgroundColor: NEW_COLOR.ERROR_BG,
        padding: s(12),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: s(8),
        marginBottom: s(16),
        gap: 10,

    },
    errormessagetext: {
        color: NEW_COLOR.TEXT_RED,
        fontSize: s(16),
        fontFamily: "Manrope-Medium",
    },
    availblelabel: {
        color: NEW_COLOR.TEXT_link,
        fontSize: s(14),
        fontFamily: "Manrope-Medium",

    },
    availbleamount: {
        color: NEW_COLOR.TEXT_WHITE,
        fontSize: s(14),
        fontFamily: "Manrope-Medium",

    },
    chatdate: {
        color: NEW_COLOR.TEXT_WHITE,
        fontSize: s(12),
        fontFamily: "Manrope-Medium",
    },
    chatmaindate: {
        color: NEW_COLOR.TEXT_WHITE,
        fontSize: s(14),
        fontFamily: "Manrope-SemiBold",
    },
    chattime: {
        color: NEW_COLOR.TEXT_WHITE,
        fontSize: s(10),
        fontFamily: "Manrope-Regular",
    },
    addressespara: {
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_link
    },
    secondaryparasecurity: {
        fontSize: s(12),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_link
    },
    secondparatext: {
        fontSize: s(12),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_link,
    },
    secondparatextlink: {
        fontSize: s(12),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_PRIMARY,
    },
    actionbuttontext: {
        fontSize: s(14),
        fontFamily: "Manrope-SemiBold",
    },
    cardname: {
        fontSize: s(12),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_link,

    },
    cardnumber: {
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.CARD_TEXT,

    },
    cardstatus: {
        fontSize: s(12),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.CARD_TEXT,

    },
    Cardcurrencylabel: {
        fontSize: s(10),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.CARD_TEXT,

    },
    cardcurrency: {
        fontSize: s(12),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.CARD_TEXT,

    },
    applycardnamelabel: {
        fontSize: s(10),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.CARD_TEXT,
    },
    withdrawpayeetexttitle: {
        color: NEW_COLOR.TEXT_WHITE,
        fontFamily: "Manrope-Medium",
        fontSize: ms(14),
    },
    withdrawpayeetexttitlepara: {
        color: NEW_COLOR.TEXT_WHITE,
        fontFamily: "Manrope-Medium",
        fontSize: ms(12),
    },
    minmaxLabel: {
        color: NEW_COLOR.BUTTON_BG,
        fontSize: s(12),
        fontFamily: "Manrope-Medium",
    },
    applycardname: {
        fontSize: s(12),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.CARD_TEXT,
    },
    accordianheadingtext: {
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_WHITE,
    },
    accordianparatext: {
        fontSize: s(12),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_link,
    },
    cardlist: {
        color: NEW_COLOR.CARD_TEXT
    },
    cardSmall: {
        height: "100%",
        width: "100%",
    },
    referaltextSkeleton: {
        backgroundColor: NEW_COLOR.SHIMMER_LOADERCOLOR,

    },
    phoneverificationtext: {
        fontSize: s(16),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_WHITE
    },
    accordianbg: {
        backgroundColor: NEW_COLOR.ACCORDIAN_BG
    },
    Pageheadericonbg: {
        width: s(0),
        height: s(0),
        borderRadius: s(100) / 2,
        backgroundColor: "transparent",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    Pageheaderrefreshicon: {
        marginTop: s(6)
    },
    pageheadertitle: {
        fontSize: ms(22),
        color: NEW_COLOR.TEXT_WHITE,
        textAlign: "center",
        fontFamily: "Manrope-Medium",
    },
    pageheader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: s(32)
    },
    transactionamounttextsecondary: {
        fontSize: s(14),
        fontFamily: "Manrope-Regular",
        textAlign: "center",
        color: NEW_COLOR.TEXT_WHITE,
    },
    walletaddresssecondarybottomspace: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: s(10)

    },
    buttonpadding: {
        paddingLeft: s(0), paddingRight: s(0)
    },
    cardslistbg: {
        backgroundColor: NEW_COLOR.SECURITY_BG,
        padding: s(12),
        borderRadius: s(12)
    },
    verificationbg: {
        backgroundColor: NEW_COLOR.VERIFICATION_BG,
        padding: s(12),
        borderRadius: s(12)
    },
    securityiconbg: {
        backgroundColor: NEW_COLOR.SECURIRTY_ICON,
        width: s(32),
        height: s(32),
        borderRadius: s(5),
    },
    verificationsecurityiconbg: {
        backgroundColor: NEW_COLOR.VERIFICATION_ICON,
        width: s(32),
        height: s(32),
        borderRadius: s(5),
    },
    securitybg: {
        backgroundColor: NEW_COLOR.SECURITY_BG,
        borderRadius: s(12),
        padding: s(12)
    },
    phoneverification: {
        backgroundColor: NEW_COLOR.PHONE_VERIFYBG,
        borderRadius: s(12),
        padding: s(12)
    },
    itemslistgap: {
        marginBottom: s(24)

    },
    tabactivetext: {
        color: NEW_COLOR.TAB_ACTIVETEXT
    },
    tabinactivetext: {
        color: NEW_COLOR.TAB_INACTIVETEXT
    },

    cardbannertext: {
        fontSize: s(14),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_WHITE,
        marginBottom: s(6)
    },
    cardbannerimg: {
        padding: s(6)
    },
    cardbannerbg: {
        backgroundColor: NEW_COLOR.APPLYCARD_BANNERBG,
        borderRadius: s(12)
    },
    payeedraftbg: {
        backgroundColor: NEW_COLOR.Payee_Draft,
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"

    },
    transactiondetail: {
        height: s(50),
        width: s(50)
    },
    transactiongenerate: {
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.BUTTON_BG,
        flex: 1
    },
    labelStyle: {
        fontSize: ms(14),
        color: NEW_COLOR.TEXT_WHITE,
        fontFamily: "Manrope-SemiBold",

    },
    assetslistcoin: {
        marginBottom: s(2)

    },
    assetslistcurrency: {
        marginTop: s(2)

    },
    popup: {
        borderRadius: s(24)
    },
    popupspace: {
        padding: s(16)

    },
    cardslistradius: {
        borderRadius: s(5),

    },
    symbolPrifix: {
        fontSize: ms(24),
        color: NEW_COLOR.SYMBOL_TEXT,
        fontFamily: "Manrope-SemiBold"

    },

    casescarouselbg: {
        backgroundColor: "transparent",
        borderRadius: s(0),
        padding: s(0)
    },
    casescarouselspacing: {
        marginHorizontal: s(10)
    },
    casescarouseltitle: {
        fontSize: s(16),
        fontFamily: "Manrope-SemiBold",
        color: NEW_COLOR.TEXT_WHITE,
        marginBottom: s(4)
    },
    casescarouselpara: {
        fontSize: s(14),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_link,
    },
    casescarousellink: {
        fontSize: s(12),
        fontFamily: "Manrope-SemiBold",
        color: NEW_COLOR.TEXT_PRIMARY,
    },
    headerspace: {
        paddingTop: s(34)
    },
    nodatascreentitle: {
        fontSize: s(24),
        fontFamily: "Manrope-SemiBold",
        color: NEW_COLOR.TEXT_WHITE,
        textAlign: "center",
        marginBottom: s(8)

    },
    nodatascreenPara: {
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_link,
        textAlign: "center",
        marginBottom: s(8)
    },
    commonscreensbottom: {
        marginBottom: s(20)
    },
    nodatascreenwhite: {
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_WHITE,
        textAlign: "center",
    },
    contentcarousel: {
        marginBottom: s(10)
    },
    supportedemail: {
        fontSize: s(16),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_PRIMARY,
        textAlign: "center",
        marginTop: s(4)

    },
    supported: {
        fontSize: s(16),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_WHITE,
        textAlign: "center",
        marginTop: s(4)

    },
    quicklinksgap: {
        flexDirection: "row",
        gap: s(10),
        alignItems: "center",
    },
    quicklinksflex: {
        flex: 1
    },
    amountlabel: {
        flexDirection: "row",
        gap: s(6),
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: s(20)
    },
    minmaxbg: {
        backgroundColor: NEW_COLOR.BANNER_BG,
        borderRadius: s(100) / 2,
        padding: s(10)
    },
    coinselector: {
        flexDirection: "column"
    },
    availablecontentcenter: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        marginTop: s(8)
    },
    cardradius: {
        borderRadius: s(12),
    },
    supportplatform: {
        fontSize: s(12),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_WHITE,
        textAlign: "center",
    },
    faqaccordianborder: {
        borderRadius: s(12)
    },
    faqspacing: {
        paddingLeft: s(12), paddingRight: s(12), marginBottom: s(6), marginTop: s(6)
    },
    skip: {
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.SKIP,
        textAlign: "center",
    },
    chooseaccounttitile: {
        fontSize: s(20),
        fontFamily: "Manrope-SemiBold",
        color: NEW_COLOR.TEXT_WHITE,
    },
    chooseaccountlabel: {
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.PLACEHOLDER_TEXTCOLOR,
        marginTop: s(4),
        flex: 1


    },
    accounttypetitle: {
        fontSize: s(16),
        fontFamily: "Manrope-SemiBold",
        color: NEW_COLOR.TEXT_WHITE,
        marginBottom: s(6),

    },
    accounttypepara: {
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_link,
    },

    verifyemailpara: {
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
        textAlign: "center",
        color: NEW_COLOR.TEXT_link,
    },
    verifyemail: {
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
        textAlign: "center",
        marginBottom: s(4),
        color: NEW_COLOR.TEXT_WHITE,
    },
    loginparalink: {
        color: NEW_COLOR.TEXT_PRIMARY,
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
    },

    termstext: {
        fontSize: s(2),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_link,
    },

    termstextlink: {
        fontSize: s(8),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_PRIMARY,
    },
    phonecodeplaceholder: {
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
    },
    registertext: {
        fontSize: s(24),
        fontFamily: "Manrope-Bold",
        color: NEW_COLOR.TEXT_WHITE,
        textAlign: "center",
        marginBottom: s(6)

    },
    registerpara: {
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_link,
        textAlign: "center",
    },
    verificationnumber: {
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_PRIMARY,

    },
    phonepickerinput: {
        flexDirection: 'row',
        gap: s(6),
        justifyContent: 'space-between',
        alignItems: "center",
        width: s(100),
        height: s(48)
    },
    imguploadprimarytext: {
        fontSize: s(16),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_WHITE,
        textAlign: "center",
        marginBottom: s(2)
    },
    imguploadsecondarytext: {
        fontSize: s(14),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_link,
        textAlign: "center",
    },
    dashboardamountlabel: {
        fontSize: s(12),
        fontFamily: "Manrope-SemiBold",
        color: NEW_COLOR.ALWAYS_WHITE,
    },
    dashboardamountlabelweek: {
        fontSize: s(12),
        fontFamily: "Manrope-SemiBold",
        color: NEW_COLOR.WEEK_TEXT,
    },
    contentcenter: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: s(20)
    },
    coinselectamountlabel: {
        fontSize: s(16),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_WHITE,
        marginBottom: s(8),
    },
    titletopSectionGap: {
        marginTop: s(16)
    },
    verificationcodelink: {
        fontSize: ms(14),
        fontFamily: "Manrope-SemiBold",
        color: NEW_COLOR.LINKPRIMARY_COLOR,
    },
    loginpara: {
        color: NEW_COLOR.TEXT_link,
        fontSize: s(14),
        fontFamily: "Manrope-Medium",

    },
    inactiveItemBg: {
        backgroundColor: "transparent",
        borderRadius: s(0),
        padding: s(0)
    },
    accountselectprimarytext: {
        fontSize: s(14),
        fontFamily: "Montserrat-Medium",
        marginBottom: s(4),
        color: NEW_COLOR.TEXT_WHITE,
    },
    accountselectsecondarytext: {
        fontSize: s(14),
        fontFamily: "Montserrat-Regular",
        color: NEW_COLOR.TEXT_link,
    },
    accountbankdetails: {
        fontSize: s(12),
        fontFamily: "Montserrat-Medium",
        color: NEW_COLOR.TEXT_link,
    },
    walletaddressplaceholder: {
        fontSize: s(14),
        fontFamily: "Montserrat-Medium",
        color: NEW_COLOR.PLACEHOLDER_TEXTCOLOR,
        marginTop: s(2)
    },
    referralcodetextlabel: {
        color: NEW_COLOR.TEXT_link,
        fontFamily: "Montserrat-Regular",
        fontSize: ms(12),
        marginTop: s(10)
    },
    referralbutton: {
        backgroundColor: NEW_COLOR.TEXT_PRIMARY,
        padding: s(4),
        borderRadius: s(8),
        width: s(140)
    },
    referralbuttontext: {
        color: NEW_COLOR.TEXT_ALWAYS_WHITE,
        fontSize: s(14),
        fontFamily: "Montserrat-Medium",
        textAlign: "center",
    },
    bottomsheetheadericonbg: {
        width: s(50),
        height: s(50),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.BOTTOMSHEERTHEADER_ICONBG,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    Actionprimarybutton: {
        borderRadius: s(20),
        paddingHorizontal: s(16),
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        height: s(44),
    },
    Actionsecondarybutton: {
        borderRadius: s(20),
        paddingHorizontal: s(16),
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        height: s(44),
        borderWidth: 1,
        borderColor: NEW_COLOR.SECONDARY_BUTTONBORDER,
    },
    actionbuttonprimarylinear1: {
        backgroundColor: NEW_COLOR.BUTTON_LINEARGRADIANT1,
    },
    actionbuttonprimarylinear2: {
        backgroundColor: NEW_COLOR.BUTTON_LINEARGRADIANT2,
    },
    actionbuttonprimarylinear3: {
        backgroundColor: NEW_COLOR.BUTTON_LINEARGRADIANT3,
    },
    actionbuttonsecondarylinear1: {
        backgroundColor: "transparent",
    },
    actionbuttonsecondarylinear2: {
        backgroundColor: "transparent",
    },
    actionbuttonsecondarylinear3: {
        backgroundColor: "transparent",
    },
    actionbuttonsecondarylinear4: {
        backgroundColor: "transparent",
    },
    feestitleprimarytext: {
        fontSize: s(16),
        fontFamily: "Montserrat-Medium",
        color: NEW_COLOR.TEXT_WHITE
    },
    monthYearText: {
        fontSize: s(16), color: NEW_COLOR.TEXT_WHITE,

        fontFamily: "Manrope-Regular",
    },
    showmore: {
        marginTop: s(18)
    },
    showmoretext: {
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_WHITE,
    },
    customuploadimage: {
        height: s(220),
        borderRadius: 5,
        borderWidth: s(1),
        borderColor: NEW_COLOR.INPUT_BORDER,
        overflow: "hidden",
        paddingVertical: s(6),
        paddingHorizontal: s(6),
        width: "100%",
    },
    customuploadpassportImage: {
        width: "100%",
        height: "100%",
    },
    fileuploadprimarytext: {
        color: NEW_COLOR.TEXT_WHITE,
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
        marginBottom: s(5),
        textAlign: "center",

    },
    fileuploadsecondarytext: {
        color: NEW_COLOR.TEXT_link,
        fontSize: s(12),
        fontFamily: "Manrope-Regular",
        textAlign: "center",

    },
    Attachedfiletext: {
        color: NEW_COLOR.TEXT_PRIMARY,
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
    },
    chatpersonletterbg: {
        width: s(30),
        height: s(30),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: s(100)

    },
    chatActivetwolettertext: {
        fontSize: ms(12),
        fontFamily: "Manrope-SemiBold",
        color: NEW_COLOR.TEXT_ALWAYS_WHITE,
    },
 Forgotpasswordtextlink: {
        fontSize: ms(14),
        fontFamily: "Poppins-Medium",
        color: NEW_COLOR.LINKPRIMARY_COLOR,
        lineHeight: ms(26),
    },






    // ---------------------------------------------- NEW COMMON STYLES START-----------------------------------------------------
    sectionGap: {
        marginBottom: s(32)
    },
    mt32: {
        marginTop: s(32)
    },
    mb32: {
        marginBottom: s(32)
    },
    titleSectionGap: {
        marginBottom: s(16)
    },
    mt16: {
        marginTop: s(16),
    },
    mb16: {
        marginBottom: s(16),
    },
    screencontainer: {
        paddingLeft: s(24), paddingRight: s(24)
    },
    checkboxtextterms: {
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_link,

    },
    checkboxtexttermslink: {
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_PRIMARY,
    },
    // -----------------------Onboarding SCREENS START-----------------------------------------------
    splacesectiontitle: {
        fontSize: s(36),
        fontFamily: "Montserrat-SemiBold",
        marginBottom: s(16),
        color: NEW_COLOR.TEXT_WHITE

    },
    splacesectionpara: {
        fontSize: s(16),
        fontFamily: "Montserrat-SemiBold",
        marginBottom: s(16),
        color: NEW_COLOR.TEXT_link

    },
    onboardingsectiontitle: {
        fontSize: s(36),
        fontFamily: "Montserrat-SemiBold",
        marginBottom: s(16),
        color: NEW_COLOR.TEXT_WHITE,
        textAlign: "center",

    },
    onboardingsectionpara: {
        fontSize: s(16),
        fontFamily: "Montserrat-Regular",
        color: NEW_COLOR.TEXT_link,
        textAlign: "center",

    },

    // -----------------------Onboarding SCREENS END-----------------------------------------------

    // -----------------------LOGIN SCREENS START-----------------------------------------------
    spacebetween: {
        flex: 1,
        justifyContent: "space-between",
    },
    haveanaccount: {
        fontSize: s(14),
        fontFamily: "Montserrat-Bold",
        color: NEW_COLOR.TEXT_link,
        textAlign: "center",

    },
    signuplink: {
        fontSize: s(14),
        fontFamily: "Montserrat-Bold",
        color: NEW_COLOR.TEXT_PRIMARY,
        textAlign: "center",

    },
    Signuptextprimary: {
        fontSize: s(22), lineHeight: ms(100),
        color: NEW_COLOR.TEXT_WHITE,
        fontFamily: "Manrope-SemiBold"
    },
    Signuptextsecondary: {
        fontSize: s(14), lineHeight: ms(100),
        color: NEW_COLOR.TEXT_link,
        fontFamily: "Manrope-Bold"
    },
    Forgotpasswordtextlink: {
        fontSize: s(12),
        fontFamily: "Manrope-Bold",
        color: NEW_COLOR.LINKPRIMARY_COLOR,
        marginTop: s(8),
        marginBottom: s(16)

    },
    signupimagetext: {
        fontSize: ms(24),
        color: NEW_COLOR.TEXT_WHITE,
        fontFamily: "Manrope-SemiBold"
    },
    passwordrulestop: {
        marginTop: s(10)
    },
    passwordrulesLeft: {
        marginLeft: s(20),
        marginBottom: s(5),
    },
    passwordrulestext: {
        fontSize: ms(12),
        fontFamily: "Manrope-Regular",
    },

    // -----------------------LOGIN SCREENS END-----------------------------------------------

    // ----------------------------- OnBoarding Screens Start ------------------------------------------------------
    Verifyemailtitle: {
        fontSize: s(24),
        fontFamily: "Manrope-SemiBold",
        color: NEW_COLOR.TEXT_WHITE,
        textAlign: "center",
        marginBottom: s(8)

    },
    // ----------------------------- OnBoarding Screens End ------------------------------------------------------


    // -----------------------INPUT FIELDS START-----------------------------------------------
    inputLabel: {
        // position: "absolute", left: 14, top: -15, backgroundColor: NEW_COLOR.SCREENBG_BLACK,
        // zIndex: 1,
        // padding: s(3),
        marginBottom: s(8),
        color: NEW_COLOR.TEXT_WHITE,
        fontSize: s(14),
        fontFamily: "Manrope-Regular"
    },
    placeholderfontsizes: {
        fontSize: ms(16),
        marginRight: ms(16),
        color: NEW_COLOR.TEXT_WHITE,
        fontFamily: "Manrope-Regular",
        borderRadius: s(5),
    },
    phonecodetextinput: {
        fontSize: ms(16),
        marginRight: ms(16),
        color: NEW_COLOR.TEXT_WHITE,
        fontFamily: "Manrope-Regular",

    },
    textInput: {
        borderWidth: 1,
        borderColor: NEW_COLOR.INPUT_BORDER,
        borderRadius: s(5),
        paddingHorizontal: s(16),
        fontSize: s(16), color: NEW_COLOR.TEXT_WHITE,
        height: s(48),
        fontFamily: "Manrope-Regular",
        backgroundColor: NEW_COLOR.INPUT_BG,
    },
    errorBorder: {
        borderColor: NEW_COLOR.TEXT_RED
    },
    inputbottomtextlink: {
        fontSize: s(12),
        fontFamily: "Manrope-Bold",
        color: NEW_COLOR.LINKPRIMARY_COLOR,
        marginTop: s(8)
    },
    hoverborder: {
        borderColor: NEW_COLOR.LABEL_HOVERCOLOR
    },
    inputrequirederrormessage: {
        fontSize: s(14),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_RED,
        marginTop: s(4)

    },
    inputrequirederrormessageformickTextinput: {
        marginTop: s(6),
        paddingLeft: s(5)

    },
    radioactive: {
        height: s(10),
        width: s(10),
        borderRadius: s(8),
        backgroundColor: NEW_COLOR.BUTTON_BG,
    },
    radioinactive: {
        height: s(18),
        width: s(18),
        borderRadius: s(12),
        borderWidth: s(2),
        alignItems: 'center',
        justifyContent: 'center',
    },
    radiotext: {
        fontSize: s(14), color: NEW_COLOR.TEXT_WHITE,
        fontFamily: "Manrope-Regular",

    },
    // -----------------------INPUT FIELDS END-----------------------------------------------



    // ---------------------------------------------- NEW COMMON STYLES END-----------------------------------------------------
    //Smashapay Start
    cardbannertitle: {
        fontSize: s(20),
        fontFamily: "Manrope-Bold",
        color: NEW_COLOR.BANNER_TEXT_ALWAYS_WHITE,
        marginBottom: s(6)
    },
    bannerlinkprimary: {
        fontSize: ms(14),
        fontFamily: "Manrope-SemiBold",
        color: NEW_COLOR.LINKPRIMARY_COLOR,
        lineHeight: ms(26),
    },
    Accountbg: {
        padding: s(0),
        borderRadius: s(0),
        backgroundColor: "transparent"
    },
    Accountprimarytext: {
        fontSize: s(14),
        fontFamily: "Manrope-Regular",
        marginBottom: s(4),
        color: NEW_COLOR.TEXT_WHITE,
    },
    actionsecondarybuttontext: {
        fontSize: s(14),
        fontFamily: "Manrope-Bold",
        color: NEW_COLOR.ACTION_SECONDARYTEXT,
    },
    bannerButtonBg: {
        backgroundColor: NEW_COLOR.BANNER_BUTTONBG,
        borderRadius: s(10),
        paddingLeft: s(18), paddingRight: s(18),
        paddingTop: s(5), paddingBottom: s(5),
    },
    bannerButtontext: {
        fontSize: s(12),
        fontFamily: "Manrope-SemiBold",
        color: NEW_COLOR.BANNER_BUTTONTEXT
    },
    completekyctitle: {
        fontSize: s(14),
        fontFamily: "Manrope-SemiBold",
        color: NEW_COLOR.BANNER_TEXT_ALWAYS_WHITE,
        marginBottom: s(6)
    },
    bankwithdrawPayeeInput: {
        borderWidth: 1,
        borderColor: NEW_COLOR.INPUT_BORDER,
        borderRadius: s(5),
        fontSize: ms(14), color: NEW_COLOR.TEXT_WHITE,
        textAlignVertical: 'center', height: s(56),
        paddingHorizontal: 16, fontFamily: "Manrope-Regular",
        backgroundColor: NEW_COLOR.INPUT_BG

    },
    Allcardprimarytext: {
        fontSize: s(12),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_link,
    },
    detailsListBg: {
        //  backgroundColor: NEW_COLOR.TRANSPARENT,
        // borderRadius: s(0), padding:s(0)
    },
    supportedPlatformsBg: {
        backgroundColor: NEW_COLOR.TRANSPARENT,
        borderRadius: s(0), padding: s(0)

    },
    settinsbottomsheetroundedactiveiconbg: {
        width: s(34),
        height: s(34),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.BOTTOMSHEETROUNDEDICON_BG,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    bottomsheetactiveiconprimarytext: {
        color: NEW_COLOR.TEXT_WHITE,
        fontSize: ms(14),
        fontFamily: "Manrope-Medium"

    },
    settingsborder: {
        backgroundColor: NEW_COLOR.INPUT_BG,
        borderRadius: s(15),
        borderWidth: s(1),
        borderColor: NEW_COLOR.INPUT_BORDER,
        padding: s(12)
    },
    settingsbottomspace: {
        marginBottom: s(32)
    },
    feesaccordiansectiontitle: {
        color: NEW_COLOR.TEXT_WHITE,
        fontFamily: "Manrope-medium",
        fontSize: ms(16),

    },
    feessectiontitle: {
        color: NEW_COLOR.TEXT_WHITE,
        fontFamily: "Manrope-medium",
        fontSize: ms(16),

    },
    feeslistprimarytext: {
        fontSize: s(14),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.TEXT_WHITE,
        // textAlign: "right",

    },
    feesssecondarylist: {
        fontSize: s(14),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_link
    },
    verifiedtext: {
        fontSize: ms(16),
        fontFamily: "Manrope-Medium",
        color: NEW_COLOR.LINKPRIMARY_COLOR,
        textAlign: "left"
    },
    referalcodeverify: {
        fontSize: s(18),
        fontFamily: "Manrope-Regular",
        color: NEW_COLOR.TEXT_GREEN,
        textAlign: "center",

    }
});
export const SESSIONEXPIRE_URIS = {
    light: 'https://fastxestorageprd.blob.core.windows.net/images/fastxesessionexpire.svg',
    dark: 'https://fastxestorageprd.blob.core.windows.net/images/fastxesessionexpire.svg',
}
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
    "suspended": NEW_COLOR.TEXT_RED,
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
    "failed": NEW_COLOR.TEXT_RED,
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
