import { Dimensions } from "react-native";
import { s } from "../../../../constants/styels/scale";
import { AliaPay, AmazonPay, ShopeeImage } from "../../../../assets/svg";
import React from "react";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const ITEM_WIDTH = Math.round(SCREEN_WIDTH * 0.82);
export const HORIZONTAL_ITEM_SPACING = Math.round(SCREEN_WIDTH * 0.03);
export const CAROUSEL_HEIGHT = s(185);

export const SHEET_HEIGHTS: Record<string, number> = {
    "Manage Card": 200,
    "GLOBAL_CONSTANTS.SUPPORTED_PLOTFORMS": 257,
    "Freeze Card": 350,
    "Unfreeze Card": 350,
    "GLOBAL_CONSTANTS.SET_PIN": 300, // Adjusted from 500 to be more reasonable for PIN entry
    "GLOBAL_CONSTANTS.LIMIT": 200,
    "Top-Up": 500,
    "Bind Card": 500,
    "Success": 500,
    "GLOBAL_CONSTANTS.CARD_DETAILS": 300,
};

export const getSheetHeight = (title: string, errorMsg: string): number => {
    const base = SHEET_HEIGHTS[title] || 450; // Default height if title not found
    return errorMsg ? base + s(40) : base; // Add space for error message
};

export const iconsList: { [key: string]: JSX.Element } = {
    amazon: React.createElement(AmazonPay, { height: s(40), width: s(40) }),
    alipay: React.createElement(AliaPay, { height: s(45), width: s(45) }),
    shopee: React.createElement(ShopeeImage, { height: s(45), width: s(45) }),
};