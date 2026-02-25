import { Dimensions } from 'react-native';

export const NEW_THEME_COLOR = {
  'dark': {

  },
  'light': {
    DOT_INACTIVE: "#DCDDE1",
    SCREENBG: "#F2F6F9",
    TEXT_LINK: "#0059CC",
    SUB_TEXT:"#666E87",
    TEXT_ALWAYS_WHITE: '#E5ECF2',
    TEXT_ALWAYS_BLACK: '#000000',
    TEXT_BLACK: '#0A0D11',
    TEXT_WHITE: '#ffffff',
    TITLE_GREY: "#555E67",
    TEXT_BLUE: "#00C9FF", //primary color
    PRiMARY_COLOR: "#0A0D11", //primary color
    BUTTON_BG: "#0A0D11",//primary color
    BG_BLUE: "#00C9FF",//primary color
    TEXT_PRIMARY: '#0A0D11',
    LIST_BORDER: "#1E232A",
    CANCEL_BTN_BORDER: "#0A0D11",
    SECTION_BORDER: "#DCDDE1",
    BORDER_GREY: "#1E232A",
    TEXT_GREY: "#555E67",
    TEXT_RED: '#FC0965',
    DIVIDER_COLOR: "#E5ECF2",
    SEARCH_BORDER: "#E5ECF2",
    SEARCH_BG: "#ffffff",
    TEXT_GREEN: "#0C9A00",
    TEXT_PURPLE: "#8F53EA",
    ACTIVE_ITEM: "#16181D",
    TEXT_PINK: '#ED4B9E',
    BACKGROUND_WHITE: '#FFFFFF',
    BTN_BORDER_PURPLR: "#8F53EA",
    BG_PURPLERDARK: "#3F3356",
    BACKGROUND_DARK: '#101014',
    SECTION_BG: "#1F2125",
    BORDER_LIGHT_GREEN: "rgba(216, 244, 246, 0.20)",
    PLACEHOLDER_COLOR: "#808080",
    INPUT_BORDER: "#E5ECF2",
    TRANSPARENT: "transparent",
    SEARCH_PLACEHOLDER: "#686868",
    GRPH_WEEK_BUTTONBG: "rgba(108, 149, 255, 0.19)",
    NOT_PAID: "#5592d1",
    TEXT_YELLOW: "#C2C433",
    TEXT_ORANGE: "#FD7200",
    CANCELLED: "#FF3C30",
    BG_PURPLE: "#8F53EA",
    ICON_GREY: "#838383",
    BACK_ARROW: "#ffffff",
    SEARCH_ICON: "#0A0D11",
    SHEET_HEADER_BG: "#101014",
    SHEET_BG: "#101014",
    OVERLAY_BG: "rgba(0,0,0, 0.8)",
    VERIFY_BTN_BORDER: "#00C9FF",
    VERIFY_BTN_BG: "transparent",
    TEXT_SECONDARY: "#404751",
    PARTIALLYPAID_COLOR: "#F2C94C",
    PAID: "#1b9c3b",
    SUBMIT_TEXTCOLOR:"#ffbf00"

  }
};
export const NEW_COLOR = NEW_THEME_COLOR['light'];


export const {
  width: WINDOW_WIDTH,
  height: WINDOW_HEIGHT,
} = Dimensions.get('window');

export default {
  NEW_COLOR,
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
};
