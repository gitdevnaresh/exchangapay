import React, { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import ParagraphComponent from "../Paragraph/Paragraph";
import AutoSlideCarousel from "./accountCarousel";
import { s } from "../../constants/theme/scale";

interface AlertItem {
    id: string;
    title: string;
    message: string;
    typeId: string;
}

interface AlertsCarouselProps {
    commonStyles: any;
    screenName?: string;
    alerts: AlertItem[];
}

const CaseAlertsCarousel: React.FC<AlertsCarouselProps> = ({
    commonStyles,
    screenName,
    alerts
}) => {
    const navigation = useNavigation<any>();



    const handleViewDetails = (alertId: string) => {
        navigation.navigate("supportCaseView", { id: alertId, screenName });
    };

    // Build React elements for the carousel
    const carouselData = useMemo(
        () =>
            alerts.map((alert) => (
                <View
                    key={alert.id}
                    style={[
                        commonStyles.dflex,
                        commonStyles.alignCenter,
                        commonStyles.justifyContent,
                        commonStyles.gap16,
                        { height: s(50) } // ensure each slide has visible height
                    ]}
                >
                    <Icon name="info-circle" size={s(24)} color="#FFFFFF" />
                    <View style={[commonStyles.flex1]}>
                        <ParagraphComponent
                            text={alert.title}
                            style={[
                                commonStyles.fw700,
                                commonStyles.textAlwaysWhite,
                                commonStyles.fs14
                            ]}
                            numberOfLines={1}
                        />
                        {alert.message && (
                            <ParagraphComponent
                                text={alert.message}
                                style={[
                                    commonStyles.fw400,
                                    commonStyles.textAlwaysWhite,
                                    commonStyles.fs12,
                                    commonStyles.mt4
                                ]}
                                numberOfLines={2}
                            />
                        )}
                    </View>
                    <TouchableOpacity onPress={() => handleViewDetails(alert.typeId)}>
                        <ParagraphComponent
                            text="View details"
                            style={[
                                commonStyles.fw400,
                                commonStyles.fs14,
                                commonStyles.textOrange
                            ]}
                        />
                    </TouchableOpacity>
                </View>
            )),
        [alerts, commonStyles]
    );

    if (!alerts || alerts.length === 0) {
        return null;
    }

    return (
        <View style={[commonStyles.mb10]}>
            <AutoSlideCarousel
                data={carouselData}
                duration={5000}
                height={s(65)}
                width={s(360)}
                contentKey={undefined} // 🔑 tells the carousel to render elements directly
            />
        </View>
    );
};

export default CaseAlertsCarousel;
