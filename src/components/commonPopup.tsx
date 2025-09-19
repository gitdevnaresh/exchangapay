import React from "react";
import { View, StyleSheet } from "react-native";
import { Overlay } from "react-native-elements";
import { commonStyles } from "./CommonStyles";
import ParagraphComponent from "./Paragraph/Paragraph";
import DefaultButton from "./DefaultButton";
import AntDesign from "react-native-vector-icons/AntDesign";
import { NEW_COLOR } from "../constants/theme/variables";
import { s } from "../constants/theme/scale";

interface CommonPopupProps {
    isVisible: boolean;
    handleClose?: () => void;
    cancelButtonName?: string;
    onCancelPress?: () => void;
    isCancelRequired?: boolean;
    isBackdropPressAllowed?: boolean;
    title?: string;
    content: React.ReactNode;
    buttonName?: string;
    onButtonPress?: () => void;
    overlayStyle?: object;
    titleStyle?: object;
    isCloseIconRequired?: boolean;
    closeIconColor?: string;
    backdropStyle?: object;

}

const CommonPopup: React.FC<CommonPopupProps> = ({
    isVisible,
    handleClose,
    title,
    content,
    buttonName,
    cancelButtonName = "Cancel",
    onCancelPress,
    isCancelRequired = false,
    onButtonPress,
    overlayStyle = {},
    titleStyle = {},
    backdropStyle = {},
    isCloseIconRequired = false,
    isBackdropPressAllowed,
    closeIconColor = NEW_COLOR.TEXT_BLACK,
}) => {
    return (
        <Overlay
            onBackdropPress={isBackdropPressAllowed ? handleClose : undefined}
            overlayStyle={[styles.overlayContent, styles.Overlaycontainer]}
            isVisible={isVisible}
            backdropStyle={backdropStyle}
        >
            <View
                style={[
                    styles.headerContainer,
                    isCloseIconRequired ? styles.spaceBetween : styles.centerAlign
                ]}
            >
                <ParagraphComponent
                    style={[styles.titleStyle, titleStyle]}
                    text={title}
                />

                {isCloseIconRequired && (
                    <AntDesign
                        onPress={handleClose}
                        name="close"
                        size={22}
                        color={closeIconColor}
                    />
                )}
            </View>
            <View style={[commonStyles.mb30]}>
                {content}
            </View>
            <View style={[commonStyles.mb16]}>
                {buttonName && <DefaultButton
                    title={buttonName}
                    onPress={onButtonPress}
                    style={[styles.primaryButton]}
                />}
            </View>


            <View>
                {isCancelRequired && (
                    <View>

                        <DefaultButton
                            title={cancelButtonName}
                            style={undefined}
                            backgroundColors={undefined}
                            colorful={undefined}
                            loading={undefined}
                            disable={undefined}
                            onPress={onCancelPress}
                            transparent={true}
                            iconArrowRight={false}
                            closeIcon={true}
                            customButtonStyle={{
                                backgroundColor: '#38424B',
                            }}

                        />
                    </View>
                )}

            </View>

        </Overlay>
    );
};

export default CommonPopup;

const styles = StyleSheet.create({
    Overlaycontainer: {
        marginHorizontal: s(10)
    },
    overlayContent: {
        borderRadius: 35, backgroundColor: NEW_COLOR.POP_UP_BG, padding: s(36) // Default background color
    },
    titleStyle: {
        color: NEW_COLOR.TEXT_ALWAYS_WHITE,
        fontSize: s(20),
        fontWeight: "700",
    },
    primaryButton: {
        backgroundColor: NEW_COLOR.BG_ORANGE,
        paddingVertical: s(12),
        paddingHorizontal: s(24),
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: s(24),
    },

    spaceBetween: {
        justifyContent: 'space-between',
    },

    centerAlign: {
        justifyContent: 'center',
    },
});