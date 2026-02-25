import React from "react";
import ViewComponent from "../../../../components/view/view";
import CommonTouchableOpacity from "../../../../components/touchableComponents/touchableOpacity";
import SmartCardCarousel, { CardItem } from "../../../commonScreens/smartCardCarousal/smartCardCarousel"; // Import CardItem
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";


interface MyCardsState {
    myCards: CardItem[]; // Use CardItem here
    myCradsLoader: boolean;
}

interface ConfigurationType {
    CARDS_SECTION?: boolean;
    // Add other properties of Configuration if known
}

interface CommonStylesType {
    // Define the structure of commonStyles, e.g., sectionGap: object, etc.
    // This is a placeholder, adjust according to your actual commonStyles structure
    [key: string]: string;
}

interface UserCardsSectionProps {
    commonStyles: CommonStylesType;
    Configuration: ConfigurationType;
    myCradsState: MyCardsState;
    handleSeeAll: () => void;
    screenName?: string;
    onSmartCardCarouselError?: (errorMessage: string) => void; // New prop to pass error to parent
}

const UserCardsSection: React.FC<UserCardsSectionProps> = ({ commonStyles, Configuration, myCradsState, handleSeeAll, onSmartCardCarouselError, screenName }) => {

    const handleCarouselError = (errorMessage: string) => {
        onSmartCardCarouselError?.(errorMessage); // Call the parent's error handler
    };
    return (
        <ViewComponent>
            <ViewComponent style={[commonStyles.sectionGap]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.titleSectionGap]}>
                    <ParagraphComponent text={"GLOBAL_CONSTANTS.MY_CARDS"} style={[commonStyles.sectionTitle]} />
                    {(Configuration?.CARDS_SECTION && myCradsState?.myCards?.length !== 0) && (<CommonTouchableOpacity style={[commonStyles.dflex, commonStyles.alignCenter,]} onPress={handleSeeAll}>
                        <ParagraphComponent text={"GLOBAL_CONSTANTS.SEE_ALL"} style={[commonStyles.sectionLink, commonStyles.mt4]} />
                    </CommonTouchableOpacity>)}
                </ViewComponent>

                <SmartCardCarousel routing={"CardsInfo"} onError={handleCarouselError} initialCardsData={myCradsState?.myCards || []} screenName={screenName} />
            </ViewComponent>
        </ViewComponent>
    );
};
export default React.memo(UserCardsSection);