
import React from "react";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import ViewComponent from "../../../../newComponents/view/view";
import { Text } from "react-native";
import PopupOrSheet from "../../../../newComponents/models/PopupOrSheet";
import ButtonComponent from "../../../../newComponents/buttons/button";
import { s } from "../../../../newComponents/theme/scale";
import { commonStyles } from "../../../../newComponents/theme/commonStyles";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import { getThemedCommonStyles } from "../../../../assets/styles/CommonStyles";
import TextMultiLanguage from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";

interface WalletsProps {
    addAppleWalletInfoRef?: any;
    addGooglePayInfoRef?: any;
}

const Wallets = ({ addAppleWalletInfoRef, addGooglePayInfoRef }: WalletsProps) => {
    const REVERSE_NEW_COLOR = useThemeColors(true);
    const reversCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
    return (
        <ViewComponent>
            <ViewComponent>
                <PopupOrSheet
                    ref={addAppleWalletInfoRef} // Using a new ref for clarity
                    height={s(490)} // Increased height to fit the new content
                    showCloseIcon={false}
                    showCloseIconAndTittle={false}
                >
                    {/* Main container for padding and layout */}
                    <ViewComponent style={[reversCommonStyles.flex1, { justifyContent: 'space-between' }]}>

                        {/* All the text content goes here */}
                        <ViewComponent>
                            <TextMultiLanguage
                                text={"GLOBAL_CONSTANTS.HOW_TO_ADD_YOUR_BULLSWIPE_CARD"} // "How to add your SwokiPay Card to Apple Wallet"
                                style={[reversCommonStyles.fs16, reversCommonStyles.fw700, reversCommonStyles.textWhite, reversCommonStyles.textCenter]}
                            />
                            <ParagraphComponent
                                text={"to Apple Wallet"} // "How to add your SwokiPay Card to Apple Wallet"
                                style={[reversCommonStyles.fs16, reversCommonStyles.fw700, reversCommonStyles.textWhite, reversCommonStyles.textCenter, reversCommonStyles.mb16,]}
                            />

                            <ParagraphComponent
                                text={"Currently, only manual addition of the BullSwipe"} // "Currently, only manual addition of the SwokiPay card to your wallet is supported."
                                style={[reversCommonStyles.fs14, reversCommonStyles.fw400, reversCommonStyles.textWhite, reversCommonStyles.textCenter]}
                            />
                            <ParagraphComponent
                                text={"card to your wallet is supported."} // "Currently, only manual addition of the SwokiPay card to your wallet is supported."
                                style={[reversCommonStyles.fs14, reversCommonStyles.fw400, reversCommonStyles.textWhite, reversCommonStyles.textCenter, reversCommonStyles.mb24]}
                            />

                            {/* Instructions */}
                            <ViewComponent>
                                <ViewComponent style={[reversCommonStyles.dflex, reversCommonStyles.alignStart, reversCommonStyles.gap4, reversCommonStyles.mb16]}>
                                    <Text style={[reversCommonStyles.fs16, reversCommonStyles.fw700]}>Step 1: </Text>

                                    <Text style={[reversCommonStyles.fs14, reversCommonStyles.mt3, reversCommonStyles.textWhite, reversCommonStyles.flex1]}>
                                        Open the Wallet app and tap the "+" icon in the upper right corner.
                                    </Text>
                                </ViewComponent>

                                <Text style={[reversCommonStyles.fs14, reversCommonStyles.textWhite, reversCommonStyles.mb16]}>
                                    <Text style={[reversCommonStyles.fs16, reversCommonStyles.fw700, reversCommonStyles.alignStart]}>Step 2: </Text>
                                    Tap <Text style={[commonStyles.fw700]}>"Debit or Credit Card".</Text>
                                </Text>

                                <ViewComponent style={[reversCommonStyles.dflex, reversCommonStyles.alignStart, reversCommonStyles.gap4, reversCommonStyles.mb16]}>
                                    <Text style={[reversCommonStyles.fs16, reversCommonStyles.fw700]}>Step 3: </Text>
                                    <Text style={[reversCommonStyles.fs14, reversCommonStyles.textWhite, reversCommonStyles.mt3, reversCommonStyles.flex1]}>
                                        Select <Text style={[commonStyles.fw700]}>"Enter Card Details Manually".</Text> {'\n'} Verify and complete your BullSwipe card details.
                                    </Text>
                                </ViewComponent>

                                <Text style={[reversCommonStyles.fs14, reversCommonStyles.textWhite, reversCommonStyles.alignCenter, reversCommonStyles.mb16]}>
                                    <Text style={[reversCommonStyles.fw700, reversCommonStyles.fs16]}>Step 4: </Text>
                                    Set your BullSwipe card as the default card.
                                </Text>

                                <ParagraphComponent
                                    text={"You're now ready to use Apple Pay."} // "You're now ready to use Apple Pay."
                                    style={[reversCommonStyles.fs14, reversCommonStyles.textCenter, reversCommonStyles.textWhite]}
                                />
                            </ViewComponent>
                        </ViewComponent>

                        {/* The Button at the bottom */}
                        <ViewComponent style={[reversCommonStyles.alignCenter, reversCommonStyles.mb16]}>
                            <ButtonComponent
                                title={"Got it"} // Changed title to "Got it"
                                onPress={() => addAppleWalletInfoRef.current?.close()} // Action to close the sheet
                                customContainerStyle={[reversCommonStyles.bg_yellow, reversCommonStyles.rounded100, { width: s(225), height: s(50) }]}
                                customTitleStyle={[reversCommonStyles.fs14, reversCommonStyles.fw700, reversCommonStyles.textAlwaysBlack]}
                                solidBackground={false} // Assuming this is correct from your original code
                                capitalizeTitle={false}
                            // Removed loading prop as it's not needed here
                            />
                        </ViewComponent>

                    </ViewComponent>
                </PopupOrSheet>

            </ViewComponent>


            <ViewComponent>
                <PopupOrSheet
                    ref={addGooglePayInfoRef} // Using a new ref for clarity
                    height={s(520)} // Increased height to fit the new content
                    showCloseIcon={false}
                    showCloseIconAndTittle={false}
                >
                    {/* Main container for padding and layout */}
                    <ViewComponent style={[reversCommonStyles.flex1, { justifyContent: 'space-between' }]}>

                        {/* All the text content goes here */}
                        <ViewComponent>
                            <ParagraphComponent
                                text={"How to add your BullSwipe Card "} // "How to add your SwokiPay Card to Apple Wallet"
                                style={[reversCommonStyles.fs16, reversCommonStyles.fw700, reversCommonStyles.textWhite, reversCommonStyles.textCenter]}
                            />
                            <ParagraphComponent
                                text={"to Google Pay"} // "How to add your SwokiPay Card to Apple Wallet"
                                style={[reversCommonStyles.fs16, reversCommonStyles.fw700, reversCommonStyles.textWhite, reversCommonStyles.textCenter, reversCommonStyles.mb16,]}
                            />

                            <ParagraphComponent
                                text={"Currently, only manual addition of the BullSwipe"} // "Currently, only manual addition of the SwokiPay card to your wallet is supported."
                                style={[reversCommonStyles.fs14, reversCommonStyles.fw400, reversCommonStyles.textWhite, reversCommonStyles.textCenter]}
                            />
                            <ParagraphComponent
                                text={"card to your wallet is supported."} // "Currently, only manual addition of the SwokiPay card to your wallet is supported."
                                style={[reversCommonStyles.fs14, reversCommonStyles.fw400, reversCommonStyles.textWhite, reversCommonStyles.textCenter, reversCommonStyles.mb24]}
                            />

                            {/* Instructions */}
                            <ViewComponent>
                                <ViewComponent style={[reversCommonStyles.dflex, reversCommonStyles.alignStart, reversCommonStyles.gap4, reversCommonStyles.mb16]}>
                                    <Text style={[reversCommonStyles.fs16, reversCommonStyles.fw700, reversCommonStyles.alignStart]}>Step 1: </Text>

                                    <Text style={[reversCommonStyles.fs14, reversCommonStyles.textWhite, reversCommonStyles.mt3, reversCommonStyles.flex1]}>
                                        Open the Google Pay app and tap the <Text style={[commonStyles.fw700]}>"Add a card"</Text> icon in the upper right corner.
                                    </Text>
                                </ViewComponent>

                                <ViewComponent style={[reversCommonStyles.dflex, reversCommonStyles.alignStart, reversCommonStyles.gap4, reversCommonStyles.mb16]} >

                                    <Text style={[reversCommonStyles.fs16, reversCommonStyles.fw700, reversCommonStyles.alignStart]}>Step 2: </Text>

                                    <Text style={[reversCommonStyles.fs14, reversCommonStyles.textWhite, reversCommonStyles.flex1]}>
                                        Choose <Text style={[commonStyles.fw700]}>"Payment Card".</Text> then select <Text style={[commonStyles.fw700]}>"Add card manually"</Text>
                                    </Text>
                                </ViewComponent>
                                <ViewComponent style={[reversCommonStyles.dflex, reversCommonStyles.alignStart, reversCommonStyles.gap4, reversCommonStyles.mb16]} >
                                    <Text style={[reversCommonStyles.fs16, reversCommonStyles.fw700]}>Step 3: </Text>

                                    <Text style={[reversCommonStyles.fs14, reversCommonStyles.textWhite, reversCommonStyles.flex1]}>
                                        Select <Text style={[commonStyles.fw700]}>"Enter your BullSwipe card details manually".</Text>  and complete the verfication process.
                                    </Text>
                                </ViewComponent>
                                <ViewComponent style={[reversCommonStyles.dflex, reversCommonStyles.alignStart, reversCommonStyles.gap4, reversCommonStyles.mb16]} >
                                    <Text style={[reversCommonStyles.fw700, reversCommonStyles.fs16]}>Step 4: </Text>
                                    <Text style={[reversCommonStyles.fs14, reversCommonStyles.textWhite, reversCommonStyles.mt3, reversCommonStyles.flex1]}>
                                        Set your BullSwipe card as the default payment method.
                                    </Text>
                                </ViewComponent>

                                <ParagraphComponent
                                    text={"You're now ready to use Google Pay."} // "You're now ready to use Apple Pay."
                                    style={[reversCommonStyles.fs14, reversCommonStyles.textCenter, reversCommonStyles.textWhite, reversCommonStyles.mb10]}
                                />
                            </ViewComponent>
                        </ViewComponent>

                        {/* The Button at the bottom */}
                        <ViewComponent style={[reversCommonStyles.alignCenter, reversCommonStyles.mb20]}>
                            <ButtonComponent
                                title={"Got it"} // Changed title to "Got it"
                                onPress={() => addGooglePayInfoRef.current?.close()} // Action to close the sheet
                                customContainerStyle={[reversCommonStyles.bg_yellow, reversCommonStyles.rounded100, { width: s(225), height: s(50) }]}
                                customTitleStyle={[reversCommonStyles.fs14, reversCommonStyles.fw700, reversCommonStyles.textAlwaysBlack]}
                                solidBackground={false} // Assuming this is correct from your original code
                                capitalizeTitle={false}
                            // Removed loading prop as it's not needed here
                            />
                        </ViewComponent>

                    </ViewComponent>
                </PopupOrSheet>

            </ViewComponent>

        </ViewComponent>
    )
}
export default Wallets;