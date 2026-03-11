import { light } from '@eva-design/eva';
import { Dimensions } from 'react-native';
import { CheckBox } from 'react-native-elements';




export const NEW_THEME_COLOR = {
  'dark': {
    CATEG_COLOR1: "#000000",
    CATEG_COLOR2: "#2C2C2C",
    CATEG_COLOR3: "#313030",
    MENU_HALF_SHADEBG: "#101014",
    MENU_HALF_SHADE_BORDER: "#1E232A",
    // placeholder color start 
    SKELETON_PRYMARY: "#161c2c",
    SKELETON_SECONDARY: "#4b5363",
    SKELETON_TERTIARY: "#161c2c",
    // placeholder color end 
    INACTIVE_HOME_MENU_BG: "#043747",
    SUB_TITLE_COLOR: "#ffffff",
    OVERLAY_BG: "#101014",
    DB_SECTION_BORDER: "#293648",
    PLACEHOLDER_COLOR: "#3F3F46",
    VERIFY_BTN_BORDER: "#33ffcc",
    VERIFY_BTN_BG: "transparent",
    PLACEHOLDER_TEXTCOLOR: "#A6A6A6",
    LIST_BORDER: "#444450",
    TEXT_PRIMARY: '#33ffcc',
    CANCEL_BTN_BORDER: "#33ffcc",
    SECTION_BORDER: "#323236",
    ATTACHMENT_BORDER: "#3F3F46",
    BORDER_GREY: "#1E232A",
    LOGOUT_BTN_BG: "#1E232A",
    SCREENBG_BLACK: "#000000",
    TEXT_BLUE: "#33ffcc", //primary color
    PRiMARY_COLOR: "#33ffcc", //primary color
    BUTTON_BG: "#33ffcc",//primary color
    BG_BLUE: "#ffffff",//primary color
    TEXT_GREY: "#898A8D",
    CAROUSEL_BG: "#8A939A",
    TITLE_GREY: "#B0B4BA",
    TEXT_GREY2: "#E5ECF2",
    TEXT_GREY6: "#9BABB5",
    TEXT_ALWAYS_WHITE: '#ffffff',
    CHECK_BOXSTROKE: '#404751',
    TEXT_ALWAYS_BLACK: '#000000',
    TEXT_BLACK: '#000000',
    TEXT_WHITE: '#F9F7F2',
    GRAPHTEXT_WHITE: '#000000',
    ALPHABET_BG: '#23252A',
    LETTER_OVERLAY_BG: 'rgba(0,0,0,0.8)',
    LETTER_OVERLAY_TEXT: '#fff',
    ALPHABET_HEADER_BG: '#23252A',      // <-- add for section header/sticky header in dark
    ALPHABET_HEADER_TEXT: '#fff',       // <-- add for section header/sticky header in dark
    // Add these for overlay and text
    TEXT_RED: '#FF3C30',
    TEXT_KPI_LABEL: "#9BAAB5",
    DIVIDER_COLOR: "#1B1B20",
    ACCORDIAN_LIST_BG: "transparent",
    SEARCH_BORDER: "#293648",
    // TEXT_GREEN: "#45C18F",
    TEXT_GREEN: "#00C000",
    BG_GREEN: "#1FB042",
    TEXT_PURPLE: "#8F53EA",
    ACTIVE_ITEM: "#16181D",
    TEXT_PINK: '#ED4B9E', // not required using 
    BACKGROUND_WHITE: '#72EAF3',// not required using
    TEXT_BROWN: "#CB5C71",// not required using
    BORDER_BROWN: "#CBD2D2",// not required using
    BTN_BORDER_PURPLR: "#8F53EA", // not required using
    BTN_DARKGREY_BG: "#303030",// not required using
    BORDER_BOTTOM: '#858585',// not required using
    BG_PURPLERDARK: "#3F3356",// not required using
    BACKGROUND_DARK: '#101014', // not required using
    TEXT_SECONDARY: "#636363", // placeholder 
    INPUT_BORDER: "#444450",
    PROGRESS_OUTLINE: "#1E232A",
    NOT_PAID: "#CB1437",
    PARTIALLYPAID_COLOR: "#b88a00",
    PARTIALLYUTILISED_COLOR: "#38cfed",
    NAME_CIRCLE_BROWN_BORDER: "#773E13",
    NAME_CIRCLE_BROWN_BG: "#A56C41",
    SUBMIT_TEXTCOLOR: "#2196F3",
    // new theme changes changed above
    TEXT_GREY3: "rgba(255, 255, 255, 0.80)",
    TEXT_GREY4: "rgba(168, 168, 168, 0.40)",
    TEXT_GREY5: "rgba(255, 255, 255, 0.60)",
    SECTION_BG: "#17191C",
    SECTION_BG2: "#1F2125",
    BORDER_LIGHT_GREEN: "rgba(216, 244, 246, 0.20)",
    BORDER_COLOR2: "rgba(216, 244, 246, 0.29)",
    STEPS_BORDER_INACTIVE: "#3C4147",
    STEPS_INACTIVE_BG: "#293648",
    SECTION_DARK_BG: "#101014",
    TEXT_GREYAC: "#AAAAAC",
    TRANSPARENT: "transparent",
    SEARCH_PLACEHOLDER: "#686868",
    TAB_INACTIVE: "#838383",
    TAB_ACTIVE: "#ffffff",
    KPI_BORDER: "rgba(216, 244, 246, 0.31)",
    VACCORDIAN_BG: "rgba(56, 57, 59, 0.04)",
    SEARCH_BLACK_BG: "#000000",
    TEXT_LIGHT_WHITE: "rgba(255, 255, 255, 0.50)",
    TEXT_GREY7: "rgba(177, 177, 177, 0.76)",
    TEXT_GREY8: "#B0B4BA",
    GRPH_WEEK_BUTTONBG: "rgba(108, 149, 255, 0.19)",
    TEXT_YELLOW: "#FFB800",
    TEXT_ORANGE: "#4682B4",
    CANCELLED: "#F57C00",
    BG_PURPLE: "#8F53EA",
    BRONZE_BLUE: "#2373FF",
    // using above 
    ICON_GREY: "#838383",
    BACK_ARROW: "#ffffff",
    SEARCH_ICON: "#C9C9CB",
    STEPS_INACTIVE_BORDER: "#555",
    STEPS_ACTIVE_BORDER: "#fff",
    GRAY_LIGHT: "#282B34",
    TEXT_BLUE3: "#4172F4",
    ICON_BG_GREEN: "rgba(0, 164, 120, 0.2)",
    SHEET_HEADER_BG: "#1F2025",
    SHEET_BG: "#1F2025",
    // new text color end
    // new bg colors start
    ICON_BG: "#2B2630",
    SWAP_CARD_BG: "#26212B",
    CARD_BG: "#000",
    BORDER: "#222",
    BG_GRAY4: "#1b1b20",
    CRYPTO_STATE_GREEN: '#8FF40E',
    CRYPTO_STATE_RED: '#EB0000',
    LANGUAGE_LETTERBG: "#27323C",
    LIST_SELECTION: "#2b313f",
    TEXT_RATINGGOLD: "#E9BD5C",
    RATING_INACTIVE_PROGRESS: "#1E232A",
    BADGE_APPROVED_BG: "#1E562C",
    BADGE_APPROVED_ICON: "#1AC47D",
    BADGE_APPROVED_TEXT: "#17CF60",
    PRODUCT_ADD_BG: "#1E232A",
    SECTION_BG_COLOR: "#17191C",
    SUMMARY_ABSTRACT_COLOR: "#1E232A",
    SEARCH_CONTAINER_BG: "transparent",
    PAGE_BACKARROW_COLOR: "#E5ECF2",
    PENDING_STATUS: "#E1E31E",
    DISABLEDINPUTBG: "#293648",
    MENUINACTIVE: "#6C6C6C",
    BG_DEPOSIT: "#72EAF3",
    CARDS_BG: "#72EAF3",
    CARD_LABEL: "#929898",
    TEXT_LIGHTWHITE: "#9BAAB5",
    BG_LIGHTBLUE: "#131F20",
    Button_text: "#000000",
    TEXT_ACTIVE: "#72EAF3",
    BORDER_BLACK: "#ffffff",
    SCREENBG_WHITE: "#121212",
    QUICK_LINKS: "#1F232F",
    TEXT_link: "#8A939A",
    WITHDRAW_BG: "#52131F",
    DEPOSIST_BG: "#0C4018",
    APPLYCARD_BG: "#2D2D2F",
    NOTE_BG: "#1B1B20",
    NOTE_ICON: "#FBC02D",
    TAB_GREEN: "#45C18F",
    NAME_CIRCLE_BG: "#1E232A",
    TEXT_LIGHT: "#9BAAB5",
    TEXT_LIGHTGRAY: "#9BAAB5",
    RED: "#FF3C30",
    TEXT_LIGHTBLACK: "#000000",
    Nav_Active: "#33ffcc",
    BG_BLACK: "#000000",
    Profile_Bg: "#17191C",
    TAB_BAR_BG: "#1B1B20",
    TAB_ACTIVE_BG: "#282B34",
    MEMBERSHIP_BG: "#BEA20C",
    RADIO_BG: "#000000",
    PROGRESS_BAR: "#1F232F",
    GRAPH_TEXT: "#8A939A",
    TABACTIVE_TEXT: "#45C18F",
    BANNER_BG: "#1B1B20",
    PAYEE_LIST: "#CEE8F0",
    GRAPH_POINTER: "#282B34",
    GRAPH_BACKGROUND: "#141519",
    MARKET_HELIGHTS_BACKGROUND_COLOR: "#000000",
    HUB_REWARD_GRADIENT_START: "#060606",
    HUB_REWARD_GRADIENT_END: "#242727",
    BG_LINK: "#8A939A",
    INFO_BOX_BG: "#1E1D20",
    LOGIN_TEXT: "#F9F7F2",
    ACTION_ICON: "#000000",
    REFERRALA_BG: "#FFFFFF",
    CIRCLE_BG: "#282834",
    WHITE_TEXT: "#000000",
    LIST_TEXT: "#F2F2F2",
    BG_GRAY: "#1B1B20",
    BG_YELLOW: "#E1E31E",
    TITLE_TEXT: "#F9F7F2",
    INPUTFIELD_BG: "#1B1B20",
    QUICK_LINK_ICON_BG: "#1C1C1E",
    GRAY_ICON: "##CDCDD5",
    CHECK_BOX_BG: "#898A8D4D",
    BORDER_COLOR: "#444450",
    SUCCESS_CHECK: "#FFFFFF",
    SUCCESS_BOX: "#D9D9D9",
    SECURITY_LEVEL_CARD_BG: "#4a2c26",
    ICON_COLOR: "#FFFFFF",
    RADIO_BORDER: "#AEAEC1",
    BOTTOM_LISTBG: "#000000",
    CARD_PRIVACY_BG: "#1C1B1F", // Main Screen Background --color-background-dark
    CARD_PRIVACY_CARD: "#1A1A1A", // Card Backgrounds --color-surface-dark
    CARD_PRIVACY_ON_SURFACE: "#E6E1E6", // Text Color --color-on-surface-dark
    CARD_PRIVACY_PRIMARY_CONTAINER: "#7D7286", // Selected Radio Button --color-primary-container-dark
    CARD_PRIVACY_OUTLINE: "#4C4851", // Unselected Radio Button Outline --color-outline-dark
    CARD_PRIVACY_WARNING_ICON: "#FFD700", // Warning Icon --color-warning-icon-dark
    CARD_PRIVACY_WARNING_BG: "#4A443E", // warningBg
    CARD_PRIVACY_WARNING_TEXT: "#E6E1E6", // warningText
    CARD_PRIVACY_RADIO_INACTIVE: "#4C4851", // radioInactive
    CARD_PRIVACY_RADIO_ACTIVE: "#7D7286", // radioActive
    REFERRAL_BANNER_BG: "#1E1D20",
    SEARCHBOX_BG: "#F4F7FB",
    ICON_CIRCLE_BG: "#282834",
    BTN_COLOR: "#222938",
    ICONBG: "#8A939A",
    BUTTON1_TEXT: "#000000",
    SHARE_TEXT: "#000000",
    ICON_YELLOW_LOADER: "#E1E31E",
    TAB_ACTIVE_COLOR: "#3D3D48",
    APPLY_CARD_BG: "#151519",
    DRAG_COLOR: "#222",
    CIRCLE_BG_COLOR: "#1B1B20",
    LINEAR_GRADIANT: "#rgba(255, 255, 255, 0.20), rgba(137, 138, 141, 1);",
    CARD_STATE_BORDER: "#FFFFFF",
    SEARCHBOX: "#2A2C33",
    LOGIN_BTN: "#666666",
    CHATUPLOAD_BG: "#475569",
    CHATREPLEY_BG: "#334155",
    CHATLEFT_BG: "#1E2B3B",
    TEXTORANGE: "#FD7200",
    CHAT_BG: "#282B34",
    DRAGABLEICON: "#E2E2E9",
    REWARD_GRADIENT_START: "rgba(0,0,0,0.8)",
    REWARD_GRADIENT_END: "rgba(0,0,0,0)",
    REFER_GRADIANT_MIDDLE: "#444444",
    LIST_SECONDARYTEXT: "#898A8D",
    LIST_PRIMARYTEXT: "#FFFFFF",
    PROFILEBANNER_BG: "#1B1B20",
    DASHBOARD_BANNERBG: "#E2E2E933",
    SHIMMER_LOADERCOLOR: "#rgba(219, 217, 217, 0.19)",
    CRYPTO_TRANSACTION: "#1B1B20",
    SECONDARYBUTTON_BG: "#151519",
    SECONDARYBUTTON_TEXT: "#FFFFFF4D",
    LABEL_COLOR: "#F9F7F2",
    INPUTFIELD_ICONCOLOR: "#898A8D",
    LOGIN_BTNTEXT: "#F9F7F2",
    LINK_PRIMARTTEXT: "#FFFFFF",
    WALLET_BORDER:"#B1B3B6"



  },
  'light': {
    MENU_HALF_SHADEBG: "#F2F6F9", //done
    MENU_HALF_SHADE_BORDER: "#DCDDE1", //done
    // placeholder color start 
    SKELETON_PRYMARY: "#D1D8DE",
    CARD_BG: "#fff",
    BORDER: "#F0F0F0",
    SKELETON_SECONDARY: "#D1D8DE",
    SKELETON_TERTIARY: "#C2C9D0",
    // placeholder color end 
    INACTIVE_HOME_MENU_BG: "#043747",
    SUB_TITLE_COLOR: "#000000", //done
    OVERLAY_BG: "#FFFFFF", //done
    DB_SECTION_BORDER: "#DCDDE1", //done
    PLACEHOLDER_COLOR: "#A6A6A6", //done
    VERIFY_BTN_BORDER: "#000000",
    VERIFY_BTN_BG: "transparent",
    PLACEHOLDER_TEXTCOLOR: "#A6A6A6", //done
    LIST_BORDER: "#ffffff",
    GRAPHTEXT_WHITE: '#000000',
    CAROUSEL_BG: "#CCCCCC",
    TEXT_PRIMARY: '#000000',
    CANCEL_BTN_BORDER: "#000000",
    SECTION_BORDER: "#000000", //done
    TABS_BORDER: "#CFCFCF", //done
    BGTABS_BORDER: "#DDD5BE", //done
    ATTACHMENT_BORDER: "#CFCFCF",
    BORDER_GREY: "#DCDDE1",
    ALPHABET_BG: 'rgba(245,245,245,0.95)',
    LETTER_OVERLAY_BG: 'rgba(245,245,245,0.95)',
    LETTER_OVERLAY_TEXT: '#111',
    ALPHABET_HEADER_BG: '#fff',         // <-- add for section header/sticky header in light
    ALPHABET_HEADER_TEXT: '#B0B0B0',    // <-- add for section header/sticky header in light (matches image)
    LOGOUT_BTN_BG: "#1E232A",
    SCREENBG_WHITE: "#EFF0F4",
    SCREENBG_BLACK: "#ffffff", //done
    TAB_BG: "#EEEADF", //primary color
    PRiMARY_COLOR: "#000000", //primary color
    Currenct_border: "rgba(28, 28, 28, 0.10)",
    BUTTON_BG: "#161A1B",//primary color
    BG_BLUE: "#000000",//primary color
    TEXT_GREY: "#777777", //done
    TEXT_LIGHTGRAY: "#777777",
    NOTE_ICON: "#A38514",
    TITLE_GREY: "#898A8D", //done
    TEXT_GREY2: "#555E67",//done
    TEXT_GREY6: "#555E67",//done
    TEXT_ALWAYS_WHITE: '#ffffff',//done
    CHECK_BOXSTROKE: '#404751',
    TEXT_ALWAYS_BLACK: '#000000',//done
    TEXT_BLACK: '#ffffff',//done
    TEXT_WHITE: '#000000',//done
    BUTTON_TEXT: '#141414',//done
    TEXT_RED: '#D41C33',
    TEXT_KPI_LABEL: "#555E67",//done
    DIVIDER_COLOR: "#F5F5F5", //done
    ACCORDIAN_LIST_BG: "transparent",
    SEARCH_BORDER: "#DCDDE1", //done
    TEXT_GREEN: "#077045",
    TAB_GREEN: "#45C18F",
    BG_GREEN: "#1A9727",
    TEXT_PURPLE: "#8F53EA",
    ACTIVE_ITEM: "#d6f6ff",
    TEXT_PINK: '#ED4B9E', // not required using 
    BACKGROUND_WHITE: '#FFFFFF',// not required using
    TEXT_BROWN: "#CB5C71",// not required using
    BORDER_BROWN: "#000000",// not required using
    BTN_BORDER_PURPLR: "#8F53EA", // not required using
    BTN_DARKGREY_BG: "#303030",// not required using
    BORDER_BOTTOM: '#858585',// not required using
    BG_PURPLERDARK: "#3F3356",// not required using
    BACKGROUND_DARK: '#101014', // not required using
    INPUT_BORDER: "#CFCFCF",
    PROGRESS_OUTLINE: "#CCCCCC",
    NOT_PAID: "#CB1437",
    PARTIALLYPAID_COLOR: "#b88a00",
    PARTIALLYUTILISED_COLOR: "#38cfed",
    NAME_CIRCLE_BROWN_BORDER: "#773E13",
    NAME_CIRCLE_BROWN_BG: "#A56C41",
    SUBMIT_TEXTCOLOR: "#2196F3",
    TEXT_link: "#6C6960",
    // new theme changes changed above
    TEXT_GREY3: "rgba(255, 255, 255, 0.80)",
    TEXT_GREY4: "rgba(168, 168, 168, 0.40)",
    TEXT_GREY5: "rgba(255, 255, 255, 0.60)",
    SECTION_BG: "transparent",
    SECTION_BG2: "#ffffff",
    BORDER_LIGHT_GREEN: "rgba(216, 244, 246, 0.20)",
    BORDER_COLOR2: "rgba(216, 244, 246, 0.29)",
    BORDER_COLOR3: "rgba(0, 0, 0, 0.26) 0%, rgba(0, 0, 0, 0.26) 100%)",
    STEPS_BORDER_INACTIVE: "#3C4147",
    STEPS_INACTIVE_BG: "#293648",
    DEFAULTADDRESSBG: "#F4F7FA",
    SECTION_DARK_BG: "#101014",
    TEXT_GREYAC: "#AAAAAC",
    TRANSPARENT: "transparent",
    SEARCH_PLACEHOLDER: "#A6A6A6",
    TAB_INACTIVE: "#838383",
    TAB_ACTIVE: "#ffffff",
    KPI_BORDER: "rgba(216, 244, 246, 0.31)",
    VACCORDIAN_BG: "rgba(56, 57, 59, 0.04)",
    SEARCH_BLACK_BG: "#000000",
    TEXT_LIGHT_WHITE: "rgba(255, 255, 255, 0.50)",
    TEXT_GREY7: "rgba(177, 177, 177, 0.76)",
    TEXT_GREY8: "#B0B4BA",
    GRPH_WEEK_BUTTONBG: "rgba(108, 149, 255, 0.19)",
    TEXT_YELLOW: "#FFB800",
    TEXT_ORANGE: "#4682B4",
    CANCELLED: "#F57C00",
    INFO_BOX_BG: "#e9e0d7",
    BG_PURPLE: "#8F53EA",
    BRONZE_BLUE: "#2373FF",
    ICON_YELLOW_LOADER: "#E1E31E",
    // using above 
    ICON_GREY: "#838383",
    BACK_ARROW: "#ffffff",
    SEARCH_ICON: "#C9C9CB",
    STEPS_INACTIVE_BORDER: "#555",
    STEPS_ACTIVE_BORDER: "#fff",
    GRAY_LIGHT: "rgba(177, 177, 177, 0.62)",
    TEXT_BLUE3: "#4172F4",
    ICON_BG_GREEN: "rgba(0, 164, 120, 0.2)",
    SHEET_HEADER_BG: "#EFF0F4",//done
    SHEET_BG: "#FFFFFF", //done
    // new text color end
    // new bg colors start
    ICON_BG: "#2B2630",
    SWAP_CARD_BG: "#26212B",
    BG_GRAY4: "#5A595E",
    CRYPTO_STATE_GREEN: '#8FF40E',
    CRYPTO_STATE_RED: '#EB0000',
    LANGUAGE_LETTERBG: "#555E67",
    LIST_SELECTION: "#d6f6ff",
    TEXT_RATINGGOLD: "#E9BD5C",
    RATING_INACTIVE_PROGRESS: "#1E232A",
    BADGE_APPROVED_BG: "#E6FCF5",
    BADGE_APPROVED_ICON: "#1AC47D",
    BADGE_APPROVED_TEXT: "#17CF60",
    PRODUCT_ADD_BG: "#d6f6ff",
    SECTION_BG_COLOR: "transparent",
    SUMMARY_ABSTRACT_COLOR: "#ffffff",
    SEARCH_CONTAINER_BG: "#ffffff",
    PAGE_BACKARROW_COLOR: "#000000",
    PENDING_STATUS: "#E1E31E",
    DISABLEDINPUTBG: "#EBEBEB",
    MENUINACTIVE: "#777777",
    QUICK_LINKS: "#EFF0F4",
    CARDS_BG: "#EEEADF",
    NOTE_BG: "#FFFAE5",
    BG_LIGHTBLUE: "#E6F4FF",
    TEXT_SECONDARY: "#404751",
    TEXT_LIGHTBLACK: "#000000",
    TEXT_ACTIVE: "#8601C4",
    CARD_LABEL: "#6C6960",
    BG_BLACK: "#EFF0F4",
    Profile_Bg: "#ffffff",
    Button_text: "#000000",
    BORDER_BLACK: "#161A1B",
    Nav_Active: "#000000",
    WITHDRAW_BG: "#FFE0E6",
    DEPOSIST_BG: "#DDFFE5",
    APPLYCARD_BG: "#E8E8E8",
    NAME_CIRCLE_BG: "#E0E6EB",
    TEXT_LIGHT: "#777777",
    RED: "#FF3C30",
    TAB_BAR_BG: "#EEEADF",
    TAB_ACTIVE_BG: "#CACACA",
    MEMBERSHIP_BG: "#BEA20C",
    RADIO_BG: "#ffffff",
    PROGRESS_BAR: "#CCCCCC",
    GRAPH_TEXT: "#FF3C30",
    BANNER_BG: "#F7F8FA",
    TABACTIVE_TEXT: "#077045",
    GRAPH_POINTER: "#282B34",
    GRAPH_BACKGROUND: "#ffffff",
    MARKET_HELIGHTS_BACKGROUND_COLOR: "#ffffff",
    HUB_REWARD_GRADIENT_START: "#FFFFFF",
    HUB_REWARD_GRADIENT_END: "#FFFFFF",
    LOGIN_TEXT: "#F9F7F2",
    ACTION_ICON: "#FFFFFF",
    REFERRALA_BG: "#FFFFFF",
    CIRCLE_BG: "#EFF0F4",
    BG_LINK: "#777777",
    LIST_TEXT: "#000000",
    BG_GRAY: "#F7F8FA",
    BG_YELLOW: "#E1E31E",
    TITLE_TEXT: "#000000",
    INPUTFIELD_BG: "#EFF0F4",
    QUICK_LINK_ICON_BG: "#e9e0d7",
    GRAY_ICON: "##CDCDD5",
    CHECK_BOX_BG: "#EFF0F4",
    BORDER_COLOR: "#444450",
    SUCCESS_CHECK: "#000000",
    SUCCESS_BOX: "#D9D9D9",
    SECURITY_LEVEL_CARD_BG: "#f5f2f0",
    ICON_COLOR: "#000000",
    RADIO_BORDER: "#AEAEC1",
    BOTTOM_LISTBG: "#F2F2F2",
    CARD_PRIVACY_BG: "#1C1B1F", // Main Screen Background --color-background-dark
    CARD_PRIVACY_CARD: "#2B2930", // Card Backgrounds --color-surface-dark
    CARD_PRIVACY_ON_SURFACE: "#E6E1E6", // Text Color --color-on-surface-dark
    CARD_PRIVACY_PRIMARY_CONTAINER: "#7D7286", // Selected Radio Button --color-primary-container-dark
    CARD_PRIVACY_OUTLINE: "#4C4851", // Unselected Radio Button Outline --color-outline-dark
    CARD_PRIVACY_WARNING_ICON: "#FFD700", // Warning Icon --color-warning-icon-dark
    CARD_PRIVACY_WARNING_BG: "#2B2930", // warningBg now matches card background
    CARD_PRIVACY_WARNING_TEXT: "#E6E1E6", // warningText
    CARD_PRIVACY_RADIO_INACTIVE: "#4C4851", // radioInactive
    CARD_PRIVACY_RADIO_ACTIVE: "#7D7286", // radioActive
    REFERRAL_BANNER_BG: "#e9e0d7",
    SEARCHBOX_BG: "#2A2C33",
    ICON_CIRCLE_BG: "#EFF0F4",
    BTN_COLOR: "#5A595E",
    ICONBG: "#8A939A",
    BUTTON1_TEXT: "#FFFFFF",
    SHARE_TEXT: "#000000",
    TAB_ACTIVE_COLOR: "#3D3D48",
    APPLY_CARD_BG: "#F7F8FA",
    DRAG_COLOR: "#e9e0d7",
    CIRCLE_BG_COLOR: "F7F8FA",
    LINEAR_GRADIANT: "#rgba(255, 255, 255, 0.20), rgba(137, 138, 141, 1);",
    CARD_STATE_BORDER: "#FFFFFF",
    SEARCHBOX: "#2A2C33",
    LOGIN_BTN: "#666666",
    CHATLEFTBG_BG: "#1E2B3B",
    DRAGABLEICON: "#E2E2E9",
    REWARD_GRADIENT_START: "rgba(0,0,0,0.8)",
    REWARD_GRADIENT_END: "rgba(0,0,0,0)",
    REFER_GRADIANT_MIDDLE: "#444444",
    LIST_SECONDARYTEXT: "#777777",
    LIST_PRIMARYTEXT: "#000000",
    PROFILEBANNER_BG: "#F7F8FA",
    DASHBOARD_BANNERBG: "#F7F8FA",
    SHIMMER_LOADERCOLOR: "#rgba(225, 231, 235, 0.87)",
    CRYPTO_TRANSACTION: "#F7F8FA",
    SECONDARYBUTTON_BG: "rgba(177, 177, 177, 0.62)",
    SECONDARYBUTTON_TEXT: "#FFFFFF4D",
    LABEL_COLOR: "#000000",
    INPUTFIELD_ICONCOLOR: "#6C6960",
    LOGIN_BTNTEXT: "#1E2B3B",
    LINK_PRIMARTTEXT: "#E2E2E9",
    WALLET_BORDER:"#B1B3B6"









  }
};

export type ThemeColors = typeof NEW_THEME_COLOR.dark;
export const NEW_COLOR = NEW_THEME_COLOR['dark'];
export const COLOR = {
  BLACK: '#000',
  BLACK_DARKEN_1: '#0E0E2C',
  BLACK_DARKEN_2: '#243540',

  WHITE: '#FFF',
  WHITE_LIGHTEN_1: '#FAFCFE',
  WHITE_LIGHTEN_2: '#E7ECF3',
  WHITE_DARKEN_1: '#ECF1F4',
  WHITE_DARKEN_2: '#FFFFFFCC',

  GRAY: '#515A64',
  GRAY_DARKEN_1: '#313C46',
  GRAY_DARKEN_2: '#1B2A39',
  GRAY_LIGHTEN_1: '#737B7D',
  GRAY_LIGHTEN_2: '#9797AA',
  GRAY_LIGHTEN_3: '#506479',
  GRAY_LIGHTEN_4: '#8095AB',
  GRAY_LIGHTEN_5: '#EBECEF',
  GRAY_LIGHTEN_6: '#395067',

  BLUE: '#0E4C7D',
  BLUE_LIGHTEN_1: '#2AAECC',
  BLUE_DARKEN_1: '#031547',
  BLUE_DARKEN_2: '#1E526E',
  BLUE_DARKEN_3: '#1B2A39',
  BLUE_DARKEN_4: '#13132B',
  BLUE_DARKEN_5: '#0038FF',

  RED: '#FF3A1A',
  RED_LIGHTEN_1: '#EE4E4E',
  RED_DARKEN_1: '#FF2400',
  RED_DARKEN_2: '#B30F1E',
  RED_DARKEN_3: '#FF3D00',

  GREEN: '#4DB205',
  GREEN_LIGHTEN_1: '#63EE00',

  YELLOW: '#FFDB1A',
  YELLOW_DARKEN_1: '#EBC706',
  YELLOW_DARKEN_2: '#E0BB02',

  PURPLE: '#5623C4',
  PURPLE_LIGHTEN_1: '#5C5C77',
  PURPLE_LIGHTEN_2: '#6856DD',
  PURPLE_DARKEN_1: '#212360',

  PINK: '#ED4B9E',

  ORANGE: '#F39420',
  ORANGE_LIGHTEN_1: '#F7931A',
  ORANGE_LIGHTEN_2: '#DADADA',
  ORANGE_LIGHTEN_3: '#E8F2E1',
  ORANGE_DARKEN_1: '#FF6B00',
};

export const FONT_WEIGHT = {
  THIN: '100',
  EXTRA_LIGHT: '200',
  LIGHT: '300',
  NORMAL: '400',
  MEDIUM: '500',
  SEMI_BOLD: '600',
  BOLD: '700',
  EXTRA_BOLD: '800',
  ULTRA_BOLD: '900',
};

export const {
  width: WINDOW_WIDTH,
  height: WINDOW_HEIGHT,
} = Dimensions.get('window');

export default {
  COLOR,
  NEW_COLOR,
  FONT_WEIGHT,
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
};
