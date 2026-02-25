import React, { useCallback, useMemo } from "react";
import Container from "../../../../components/container/container";
import PageHeader from "../../../../components/pageHeader/pageHeader";
import ScrollViewComponent from "../../../../components/scrollView/scrollView";
import ViewComponent from "../../../../components/view/view";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";
import TextMultiLangauge from "../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ButtonComponent from "../../../../components/buttons/button";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
const AddressViewDetails = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    // useMemo: Memoize address data to prevent recalculation on every render
    const data = useMemo(() => props?.route?.params, [props?.route?.params]);

    // useCallback: Memoize handleGoBack to prevent recreation on every render
    const handleGoBack = useCallback(() => {
        props.navigation.goBack()
    }, [props.navigation]);

    // useMemo: Memoize phone number display to prevent recalculation on every render
    const phoneNumberDisplay = useMemo(() => 
        `(${data?.addressDetails?.phoneCode ?? "91"}) ${data?.addressDetails?.phoneNumber ?? "--"}`,
        [data?.addressDetails?.phoneCode, data?.addressDetails?.phoneNumber]
    );
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={[commonStyles.container, commonStyles.flex1]}>
                <PageHeader title={"GLOBAL_CONSTANTS.ADDRESS_VIEW"} onBackPress={handleGoBack} />
                <ScrollViewComponent >
                    <ViewComponent >
                        <ViewComponent>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8, commonStyles.gap8]}>
                                <TextMultiLangauge style={[commonStyles.listsecondarytext]} text="GLOBAL_CONSTANTS.FAVORITE_NAME" />
                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={`${data?.addressDetails?.favoriteName ?? "--"}`} />

                            </ViewComponent>
                            {data?.addressDetails?.email && <ViewComponent>
                                <ViewComponent style={[commonStyles.listitemGap]} />
                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                    <TextMultiLangauge style={[commonStyles.listsecondarytext]} text="GLOBAL_CONSTANTS.EMAIL" />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={`${data?.addressDetails?.email ?? "--"}`} />

                                </ViewComponent>
                            </ViewComponent>}
                            <ViewComponent style={[commonStyles.listitemGap]} />

                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                <TextMultiLangauge style={[commonStyles.listsecondarytext]} text="GLOBAL_CONSTANTS.ADDRESS_TYPE" />
                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} text={data?.addressDetails?.addressType ?? "--"} />
                            </ViewComponent>

                            <ViewComponent style={[commonStyles.listitemGap]} />

                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                <TextMultiLangauge style={[commonStyles.listsecondarytext]} text="GLOBAL_CONSTANTS.ADDRESS_LINE1" />

                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} text={data?.addressDetails?.addressLine1 ?? "--"} />
                            </ViewComponent>
                            {data?.addressDetails?.addressLine2 && <ViewComponent>
                                <ViewComponent style={[commonStyles.listitemGap]} />
                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                    <TextMultiLangauge style={[commonStyles.listsecondarytext]} text="GLOBAL_CONSTANTS.ADDRESS_LINE2" />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={`${data?.addressDetails?.addressLine2 ?? "--"}`} />
                                </ViewComponent>
                            </ViewComponent>}
                            {data?.addressDetails?.town && <ViewComponent>
                                <ViewComponent style={[commonStyles.listitemGap]} />
                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                    <TextMultiLangauge style={[commonStyles.listsecondarytext]} text="GLOBAL_CONSTANTS.TOWN" />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={`${data?.addressDetails?.town ?? "--"}`} />

                                </ViewComponent>
                            </ViewComponent>}
                            <ViewComponent style={[commonStyles.listitemGap]} />
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                <TextMultiLangauge style={[commonStyles.listsecondarytext]} text="GLOBAL_CONSTANTS.CITY" />
                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={`${data?.addressDetails?.city ?? "--"}`} />
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.listitemGap]} />
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                <TextMultiLangauge style={[commonStyles.listsecondarytext]} text="GLOBAL_CONSTANTS.STATE" />

                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={`${data?.addressDetails?.state ?? "--"}`} />
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.listitemGap]} />
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                <TextMultiLangauge style={[commonStyles.listsecondarytext]} text="GLOBAL_CONSTANTS.POSTAL_CODE" />
                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={`${data?.addressDetails?.postalCode ?? "--"}`} />

                            </ViewComponent>
                            <ViewComponent style={[commonStyles.listitemGap]} />
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                <TextMultiLangauge style={[commonStyles.listsecondarytext]} text="GLOBAL_CONSTANTS.COUNTRY" />
                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={`${data?.addressDetails?.country ?? "--"}`} />
                            </ViewComponent>
                            {data?.addressDetails?.phoneNumber && <ViewComponent>
                                <ViewComponent style={[commonStyles.listitemGap]} />

                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                    <TextMultiLangauge style={[commonStyles.listsecondarytext]} text="GLOBAL_CONSTANTS.PHONE_NUMBER" />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={phoneNumberDisplay} />
                                </ViewComponent>
                            </ViewComponent>}
                            <ViewComponent style={[commonStyles.listitemGap]} />
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                <TextMultiLangauge style={[commonStyles.listsecondarytext]} text="GLOBAL_CONSTANTS.IS_DEFAULT" />
                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={`${data?.addressDetails?.isDefault ?? "false"}`} />

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
}; export default AddressViewDetails