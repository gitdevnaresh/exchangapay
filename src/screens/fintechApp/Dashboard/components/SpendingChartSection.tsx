import React from "react";
import ViewComponent from "../../../../components/view/view";
import TextMultiLangauge from "../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import CommonTouchableOpacity from "../../../../components/touchableComponents/touchableOpacity";
import LineChartComponet from "../../../../components/graphs/Linchart";
import NoDataComponent from "../../../../components/noData/noData";
import { DaysLookup } from "../constant";
import { s } from "../../../../constants/styels/scale";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import { homeanalyticsGraph } from "../../../../skeletons/skeleton_views";
import Loadding from "../../../../components/skelton/skeltons";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";
import { LinearGradient } from "expo-linear-gradient";
import { DayLookupItem, GraphDetailItem, SpendingChartSectionProps } from "../interface";
import { getTabsConfigation } from "../../../../../cofiguration";



const SpendingChartSection: React.FC<SpendingChartSectionProps> = ({
    GraphConfiguration,
    graphDetails,
    activeYear,
    handleYears,
    graphDetailsLoading,
    disableInternalFetch
}) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const cardGraphSkelton = homeanalyticsGraph();
    const COMMON_CONFIG = getTabsConfigation('COMMON_CONFIGURATION');

    if (!GraphConfiguration?.GRAPH?.Home) {
        return null;
    }

    const renderButton = (item: DayLookupItem, isActive: boolean) => {
        if (!COMMON_CONFIG?.isLinearGradientApply) {
            return isActive ? (
                <ViewComponent style={[commonStyles.graphactivebuttons]}>
                    <ParagraphComponent
                        style={[commonStyles.graphactivebuttonstext]}
                        text={item.code}
                    />
                </ViewComponent>
            ) : (
                <CommonTouchableOpacity
                    onPress={() => handleYears(item)}
                    style={commonStyles.graphinactivebuttons}
                    activeOpacity={0.9}
                >
                    <ParagraphComponent
                        style={[commonStyles.graphinactivebuttonstext]}
                        text={item.code}
                    />
                </CommonTouchableOpacity>
            );
        }

        return isActive ? (
            <LinearGradient
                colors={[NEW_COLOR.BUTTON_LINEARGRADIANT1, NEW_COLOR.BUTTON_LINEARGRADIANT2, NEW_COLOR.BUTTON_LINEARGRADIANT3]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.4 }}
                style={commonStyles.graphactivebuttons}
            >
                <ViewComponent style={commonStyles.graphactivebuttons}>
                    <ParagraphComponent
                        style={[commonStyles.graphactivebuttonstext]}
                        text={item.code}
                    />
                </ViewComponent>
            </LinearGradient>
        ) : (
            <LinearGradient
                colors={[
                    NEW_COLOR.SECONDARYBUTTON_LINEARGRADIANT1,
                    NEW_COLOR.SECONDARYBUTTON_LINEARGRADIANT2,
                    NEW_COLOR.SECONDARYBUTTON_LINEARGRADIANT3,
                    NEW_COLOR.SECONDARYBUTTON_LINEARGRADIANT4
                ]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.4 }}
                style={commonStyles.graphinactivebuttons}
            >
                <CommonTouchableOpacity
                    onPress={() => handleYears(item)}
                    style={commonStyles.graphinactivebuttons}
                    activeOpacity={0.9}
                >
                    <ParagraphComponent
                        style={[commonStyles.actionsecondarybuttontext]}
                        text={item.code}
                    />
                </CommonTouchableOpacity>
            </LinearGradient>
        );
    };

    return (
        <ViewComponent>
            <ViewComponent
                style={[
                    commonStyles.dflex,
                    commonStyles.alignCenter,
                    commonStyles.justifyContent,
                    commonStyles.titleSectionGap,
                ]}
            >
                <TextMultiLangauge
                    text={"GLOBAL_CONSTANTS.SPENDING"}
                    style={[commonStyles.sectionTitle]}
                />
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                    {DaysLookup?.map((item: DayLookupItem, index: number) => (
                        <React.Fragment key={item.name}>
                            {renderButton(item, activeYear === item.name)}
                            {index !== DaysLookup.length - 1 && <ViewComponent style={{ width: s(8) }} />}
                        </React.Fragment>
                    ))}
                </ViewComponent>
            </ViewComponent>

            <ViewComponent>
                {(() => {
                    if (graphDetailsLoading) {
                        return <Loadding contenthtml={cardGraphSkelton} />;
                    }
                    if (graphDetails?.length > 0) {
                        return (
                            <LineChartComponet
                                data={(graphDetails || []).map((item: GraphDetailItem) => ({
                                    ...item,
                                    color: item.color ?? "#000000",
                                    dataPointsColor: item.dataPointsColor ?? "#11998E",
                                    textColor: item.textColor ?? NEW_COLOR.TEXT_WHITE,
                                }))}
                            />
                        );
                    }
                    return <NoDataComponent />;
                })()}
            </ViewComponent>
        </ViewComponent>
    );
};

export default React.memo(SpendingChartSection);