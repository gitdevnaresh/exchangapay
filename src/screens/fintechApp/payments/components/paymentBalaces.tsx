import React, { useMemo } from 'react';
import ViewComponent from "../../../../components/view/view";
import { CurrencyText } from "../../../../components/textComponets/currencyText/currencyText";
import AutoSlideCarousel from "../../../commonScreens/autoSliderCarousal/contentCarousel";
import { DashboardGraph, } from "../../../../assets/svg";
import { s } from "../../../../constants/styels/scale";
import TextMultiLanguage from "../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import { isDecimalSmall } from '../../../../../cofiguration';


interface CommonStyles {
    fs24: object; // Replace 'object' with a more specific style type if available
    fs28: object;
    dflex: object;
    alignCenter: object;
    justifyContent: object;
    gap6: object;
    fw400: object;
    textlinkgrey: object;
    textLeft: object;
    fs14: object;
    flex1: object;
    fw500: object;
    fw700: object;
    textWhite: object;
    fs26: object;
    fs22: object;
    mt4: object;
    alignStart: object;
    gap10: object;
    textGreen: object;
    fs12: object;
    sectionGap: object;
    gap4?: object; // Added gap4
    // Add other style properties used in this component
}

interface UserInfo {
    currency?: string; // Changed to optional to match usage
    // Add other relevant userInfo properties
}

interface NewColor {
    // Define the structure of NEW_COLOR, e.g. TEXT_GREEN: string;
    [key: string]: string;
}
interface BalanceCarouselProps {
    commonStyles: CommonStyles;
    payinBalance: number | string;
    payoutBalance: number | string;
    currencyCode: string;
    userInfo?: UserInfo;
    NEW_COLOR: NewColor;
}

const PaymentsBalanceCarousel: React.FC<BalanceCarouselProps> = ({ commonStyles, payinBalance, payoutBalance, currencyCode, userInfo, NEW_COLOR }) => {

    const handleFontSize = (amount: number | string) => {
        const totalAmount = amount?.toString();
        if (totalAmount?.length > 9) {
            return commonStyles.fs24;
        } else {
            return commonStyles.fs28;
        }
    };
    const carouselSlideContent = (key: string, title: string, balance: number | string, gainText: string, percentageText: string) => (
        <ViewComponent key={key} style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { width: '96%', paddingHorizontal: s(0) }]}>
            <ViewComponent style={[commonStyles.flex1]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter,]}>
                    <TextMultiLanguage text={title} style={[commonStyles.fw400, commonStyles.textlinkgrey, commonStyles.textLeft, commonStyles.fs14]} numberOfLines={1} />
                </ViewComponent>
                <CurrencyText smallDecimal={isDecimalSmall} value={Number(balance) || 0} prifix={currencyCode} symboles={true} style={[handleFontSize(balance || 0), commonStyles.fw700, commonStyles.textWhite, commonStyles.fs28, commonStyles.mt4]} />
            </ViewComponent>
            <DashboardGraph width={s(116)} height={[s(37)]} />
        </ViewComponent>
    );
    const carouselData = useMemo(() => {
        return [
            carouselSlideContent("slide1", "GLOBAL_CONSTANTS.PAYIN", payinBalance, '+$315.20', '0.74%'),
            carouselSlideContent("slide2", "GLOBAL_CONSTANTS.PAYOUT", payoutBalance, '+$215.20', '0.81%'),
        ];
    }, [payinBalance, payoutBalance, currencyCode, commonStyles, NEW_COLOR]); // Added dependencies

    return (
        <ViewComponent style={[commonStyles.sectionGap]}>
            <AutoSlideCarousel
                data={carouselData}
                duration={5000}
                height={s(90)}
            />
        </ViewComponent>
    );
};

export default React.memo(PaymentsBalanceCarousel);
