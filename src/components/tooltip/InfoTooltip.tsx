import React, { useRef, useState, useCallback } from 'react';
import { Modal, View, Dimensions, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import CommonTouchableOpacity from '../touchableComponents/touchableOpacity';
import ViewComponent from '../view/view';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import { s } from '../../constants/styels/scale';
import TextMultiLanguage from '../textComponets/multiLanguageText/textMultiLangauge';
import { isErrorDispaly } from '../../utils/helpers';
import { getThemedCommonStyles } from '../CommonStyles';

interface InfoTooltipProps {
    tooltipText?: string;
    linkText?: string;
    linkUrl?: string;
    iconSize?: number;
    tooltipWidth?: number;
    rightOffset?: number;
    arrowXPosition?: number;
    verticalGap?: number;
    onError?: (message: string) => void;
    style?:any;
}

const TOOLTIP_HEIGHT = s(50);
const ARROW_HEIGHT = s(10);
const TOTAL_TOOLTIP_HEIGHT = TOOLTIP_HEIGHT + ARROW_HEIGHT;
const SCREEN_PADDING = s(16);
const VERTICAL_GAP = s(0);

const InfoTooltip: React.FC<InfoTooltipProps> = ({
    tooltipText = "",
    linkText = "",
    linkUrl = "",
    iconSize = s(20),
    tooltipWidth = s(220),
    rightOffset = s(0),
    arrowXPosition,
    verticalGap,
    onError,
    style
}) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [popoverState, setPopoverState] = useState({ visible: false, top: 0, left: 0, width: 0, arrowLeft: 0 });
    const infoIconRef = useRef<View>(null);


    const calculateTooltipPosition = useCallback(() => {
        return new Promise<void>((resolve) => {
            infoIconRef.current?.measureInWindow((iconX, iconY, iconWidth, iconHeight) => {
                const { width: screenWidth } = Dimensions.get('window');

                // Calculate dynamic width based on content length
                const textLength = (tooltipText?.length || 0) + (linkText?.length || 0);
                const dynamicWidth = Math.min(Math.max(textLength * s(6) + s(32), s(120)), screenWidth - (SCREEN_PADDING * 2));

                // Calculate horizontal position (centered on icon)
                const iconCenterX = iconX + (iconWidth / 2);
                let left = iconCenterX - (dynamicWidth / 2) + rightOffset;

                // Ensure tooltip stays within screen bounds horizontally
                const minLeft = SCREEN_PADDING;
                const maxLeft = screenWidth - dynamicWidth - SCREEN_PADDING;
                left = Math.max(minLeft, Math.min(left, maxLeft));

                // Use custom or default vertical gap
                const gap = verticalGap ?? VERTICAL_GAP;
                const top = iconY - TOTAL_TOOLTIP_HEIGHT - gap;
                const finalTop = Math.max(SCREEN_PADDING, top);

                // Calculate arrow position
                let arrowLeft = iconCenterX - left - s(10);
                if (arrowXPosition !== undefined) {
                    arrowLeft = arrowXPosition;
                }
                setPopoverState({ visible: true, top: finalTop, left, width: dynamicWidth, arrowLeft });
                resolve();
            });
        });
    }, [tooltipWidth, rightOffset, arrowXPosition, verticalGap, tooltipText, linkText]);

    const handleInfoIconPress = useCallback(() => {
        calculateTooltipPosition();
    }, [calculateTooltipPosition]);

    const handleLinkPress = useCallback(async () => {
        setPopoverState(prev => ({ ...prev, visible: false }));
        if (linkUrl) {
            try {
                const canOpen = await Linking.canOpenURL(linkUrl);
                if (canOpen) {
                    await Linking.openURL(linkUrl);
                } else {
                    onError?.("GLOBAL_CONSTANTS.UNABLE_TO_OPEN_URL");
                }
            } catch (error) {
                onError?.(isErrorDispaly(error));
            }
        }
    }, [linkUrl, onError]);

    const closeTooltip = useCallback(() => {
        setPopoverState(prev => ({ ...prev, visible: false }));
    }, []);

    return (
        <>
            <View ref={infoIconRef}>
                <CommonTouchableOpacity onPress={handleInfoIconPress}>
                    <MaterialIcons name="info" size={iconSize} color={NEW_COLOR.TEXT_PRIMARY} style={[style?style:commonStyles.mt6]} />
                </CommonTouchableOpacity>
            </View>

            <Modal
                visible={popoverState.visible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeTooltip}
            >
                <CommonTouchableOpacity
                    style={{ flex: 1 }}
                    activeOpacity={1}
                    onPress={closeTooltip}
                >
                    <ViewComponent
                        style={[commonStyles.tooltipContainer, {
                            top: popoverState.top,
                            left: popoverState.left,
                        }]}>
                        <ViewComponent style={[commonStyles.tooltipBody, { width: popoverState.width }]}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.flexWrap]}>
                                <TextMultiLanguage
                                    text={tooltipText}
                                    style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]}
                                />
                                {!!(linkText && linkUrl) && (
                                    <CommonTouchableOpacity onPress={handleLinkPress}>
                                        <TextMultiLanguage
                                            text={linkText}
                                            style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textprimary]}
                                        />
                                    </CommonTouchableOpacity>
                                )}
                            </ViewComponent>
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.tooltipArrow, { left: popoverState.arrowLeft }]} />
                    </ViewComponent>
                </CommonTouchableOpacity>
            </Modal>
        </>
    );
};

export default InfoTooltip;