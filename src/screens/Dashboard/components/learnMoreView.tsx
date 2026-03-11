import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useIsFocused } from '@react-navigation/native';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import { cardsService } from '../../../apiServices/cardsApis/cardsApiServices';
import { showAppToast } from '../../../newComponents/ToasterMessages/ShowMessage';
import ViewComponent from '../../../newComponents/view/view';
import Container from '../../../newComponents/container/container';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import { t } from 'i18next';
import SwokipayDashboardLoader from '../../../newComponents/swokipayloader';
import NoDataComponent from '../../../newComponents/noData/noData';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import { useThemeColors } from '../../../hooks/useThemeColors';
import RenderHTML from 'react-native-render-html';
import { isErrorDispaly } from '../../../utils/helpers';
import { s } from '../../../newComponents/theme/scale';

const LearnMoreView = (props: any) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [htmlContent, setHtmlContent] = useState<any>({});
    const isFocused = useIsFocused();
    const { width } = useWindowDimensions();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    useHardwareBackHandler(() => {
        handleBack();
        return true;
    });
    const handleBack = () => {
        props.navigation.goBack();
    }

    useEffect(() => {
        if (isFocused) {
            getdetails();
        }
    }, [isFocused]);
    const getdetails = async () => {
        setIsLoading(true)
        try {
            const response = await cardsService.getLearDetails(props?.route?.params?.id);
            if (response?.ok) {
                setHtmlContent(response?.data);
                setIsLoading(false)
            } else {
                setIsLoading(false)
                showAppToast(isErrorDispaly(response), 'error');
            }
        } catch (error: any) {
            setIsLoading(false)
            showAppToast(isErrorDispaly(error), 'error');
        }
    };



    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={[commonStyles.flex1]}>
                <PageHeader title={t("GLOBAL_CONSTANTS.LEARN_MORE")} onBackPress={handleBack} />

                <ViewComponent style={[commonStyles.flex1]}>
                    {isLoading && (
                        <SwokipayDashboardLoader />
                    )}
                    {!isLoading && htmlContent && (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <RenderHTML
                                contentWidth={width}
                                source={{ html: htmlContent }}
                                tagsStyles={{
                                    body: { color: NEW_COLOR.TEXT_WHITE, fontFamily: "Manrope-Regular" },
                                    p: { color: NEW_COLOR.TEXT_WHITE, fontSize: s(14), lineHeight: s(22), fontFamily: "Manrope-Regular" },
                                    h1: { color: NEW_COLOR.TEXT_WHITE, fontFamily: "Manrope-Regular" },
                                    h2: { color: NEW_COLOR.TEXT_WHITE, fontFamily: "Manrope-Regular" },
                                    h3: { color: NEW_COLOR.TEXT_WHITE, fontFamily: "Manrope-Regular" },
                                    a: { color: NEW_COLOR.PRIMARY, textDecorationLine: 'none' },
                                    img: { maxWidth: '100%' }
                                }}
                            />
                        </ScrollView>
                    )}
                    {!isLoading && !htmlContent && (
                        <NoDataComponent />
                    )}
                </ViewComponent>
            </Container>
        </ViewComponent>
    )
}

export default LearnMoreView

const styles = StyleSheet.create({})