// Add this to your CommonStyles.js file

import React from "react";
import { View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import ParagraphComponent from "../textComponets/paragraphText/paragraph";
import { s } from "../theme/scale";
import { ThemeColors } from "../../constants/theme/variables";
import { CommonStylesType } from "../../screens/profile/profileTypes";
import ViewComponent from "../view/view";

const badgeConfig = (NEW_COLOR: ThemeColors) => ({
    approved: {
        bgColor: NEW_COLOR.BADGE_APPROVED_BG,
        iconColor: NEW_COLOR.BADGE_APPROVED_ICON,
        textColor: NEW_COLOR.BADGE_APPROVED_TEXT,
        iconName: "check-circle-outline" as const,
    },
    pending: {
        bgColor: NEW_COLOR.PENDING_STATUS,
        iconColor: NEW_COLOR.PENDING_STATUS,
        textColor: NEW_COLOR.PENDING_STATUS,
        iconName: "check-circle-outline" as const,
    },
    rejected: {
        bgColor: NEW_COLOR.TEXT_RED,
        iconColor: NEW_COLOR.TEXT_WHITE,
        textColor: NEW_COLOR.TEXT_WHITE,
        iconName: "cancel" as const,
    },
    // Add other states here in the future
});

// CustomerStateBadge displays a badge for the user's KYC/customer state.
// Uses NEW_COLOR and commonStyles from your theme system for consistent styling.
export const CustomerStateBadge = ({
    state,
    NEW_COLOR,
    commonStyles,
}: {
    state?: string;
    NEW_COLOR: ThemeColors;
    commonStyles: CommonStylesType;
}) => {
    // ... (logic to get config)
    const lowerCaseState = state?.toLowerCase() as keyof ReturnType<typeof badgeConfig>;
    const config = badgeConfig(NEW_COLOR);
    const { bgColor, iconColor, textColor, iconName } = config[lowerCaseState] || config.pending;


    return (
        <ViewComponent
            style={[
                commonStyles.dflex,
                commonStyles.alignCenter,
                commonStyles.justifyCenter,
                commonStyles.customerStateBadgeContainer,
            {gap:s(6)}

                // { backgroundColor: bgColor }, // <-- UNCOMMENT THIS LINE
            ]}
        >
            <ViewComponent style={{marginTop: s(3)}}>
                <MaterialIcons name={iconName} size={s(15)} color={iconColor} />

            </ViewComponent>
            <ViewComponent>
                <ParagraphComponent
                    style={[
                        commonStyles.customerStateBadgeText,
                        commonStyles.fw600,
                        { color: textColor },
                    ]}
                    text={state}
                />
            </ViewComponent>


        </ViewComponent>
    );
};