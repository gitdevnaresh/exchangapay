import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Container from "../../../../components/container/container";
import PageHeader from "../../../../components/pageHeader/pageHeader";
import ScrollViewComponent from "../../../../components/scrollView/scrollView";
import ViewComponent from "../../../../components/view/view";
import { getThemedCommonStyles, statusColor } from "../../../../components/CommonStyles";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";
import TextMultiLangauge from "../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ButtonComponent from "../../../../components/buttons/button";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import { CurrencyText } from "../../../../components/textComponets/currencyText/currencyText";
const MemberTransactionViewDetails = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    const data = useMemo(() => props?.route?.params?.transactionData, [props?.route?.params?.transactionData]);

    const handleGoBack = useCallback(() => {
        props.navigation.goBack()
    }, [props.navigation]);
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={[commonStyles.container, commonStyles.flex1]}>
                <PageHeader title={"GLOBAL_CONSTANTS.VIEW"} onBackPress={handleGoBack} />
                <ScrollViewComponent >
                    <ViewComponent >
                        <ViewComponent>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8, commonStyles.gap8]}>
                                <TextMultiLangauge style={[commonStyles.listsecondarytext]} text="GLOBAL_CONSTANTS.TRANSACTION_ID" />
                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={`${data?.transactionId ?? "--"}`} />

                            </ViewComponent>
                            {data?.transactionAmount && <ViewComponent>
                                <ViewComponent style={[commonStyles.listitemGap]} />
                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                    <TextMultiLangauge style={[commonStyles.listsecondarytext]} text="GLOBAL_CONSTANTS.TRANSACTION_AMOUNT" />
                                    <CurrencyText value={Number(data?.transactionAmount)} coinName="BTC" style={[commonStyles.idrprimarytext, commonStyles.textRight]} />
                                </ViewComponent>
                            </ViewComponent>}
                            <ViewComponent style={[commonStyles.listitemGap]} />
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                <TextMultiLangauge style={[commonStyles.listsecondarytext]} text="GLOBAL_CONSTANTS.ACTION" />
                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} text={data?.action ?? "--"} />
                            </ViewComponent>

                            <ViewComponent style={[commonStyles.listitemGap]} />

                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                <TextMultiLangauge style={[commonStyles.listsecondarytext]} text="GLOBAL_CONSTANTS.WALLET" />

                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} text={data?.wallet ?? "--"} />
                            </ViewComponent>
                            {data?.network && <ViewComponent>
                                <ViewComponent style={[commonStyles.listitemGap]} />
                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                    <TextMultiLangauge style={[commonStyles.listsecondarytext]} text="GLOBAL_CONSTANTS.NETWORK" />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={`${data?.network ?? "--"}`} />
                                </ViewComponent>
                            </ViewComponent>}
                            {data?.referralAmount && <ViewComponent>
                                <ViewComponent style={[commonStyles.listitemGap]} />
                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                    <TextMultiLangauge style={[commonStyles.listsecondarytext]} text="GLOBAL_CONSTANTS.REFERRAL_AMOUNT" />
                                    <CurrencyText value={Number(data?.referralAmount)} coinName="BTC" style={[commonStyles.idrprimarytext, commonStyles.textRight]} />
                                </ViewComponent>
                            </ViewComponent>}
                            <ViewComponent style={[commonStyles.listitemGap]} />
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                <TextMultiLangauge style={[commonStyles.listsecondarytext]} text="GLOBAL_CONSTANTS.STATUS" />
                                <ParagraphComponent style={[commonStyles.listprimarytext, commonStyles.textRight, { color: statusColor[data?.status !== null && data?.status?.toLowerCase()] ?? NEW_COLOR.TEXT_GREEN }]} text={data?.status} />
                            </ViewComponent>


                        </ViewComponent>
                    </ViewComponent>
                </ScrollViewComponent >
                <ButtonComponent
                    title={"GLOBAL_CONSTANTS.GO_BACK"}
                    multiLanguageAllows={true}
                    onPress={handleGoBack}
                />
                <ViewComponent style={[commonStyles.sectionGap]} />
            </Container >
        </ViewComponent>
    )
}; export default MemberTransactionViewDetails