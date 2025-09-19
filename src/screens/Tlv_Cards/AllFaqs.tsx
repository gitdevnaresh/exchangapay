
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, SafeAreaView, ScrollView, LayoutAnimation } from 'react-native';
import { Container } from '../../components';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import AntDesign from "react-native-vector-icons/AntDesign";
import { NEW_COLOR } from '../../constants/theme/variables';
import { commonStyles } from "../../components/CommonStyles";
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import "moment-timezone";
import CardsModuleService from '../../services/card';
import { isErrorDispaly } from '../../utils/helpers';
import { CardFAQsLoader } from './CardsSkeleton';
import Loadding from '../../components/skeleton';
import { ChevronRight } from '../../assets/svg';
import { s } from '../../constants/theme/scale';

const AllFaqs = (props: any) => {
    const styles = useStyleSheet(themedStyles);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [errormsg, setErrormsg] = useState("");
    const [AccordionData, setAccordionData] = useState<any>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const ApplyCardSkeleton = CardFAQsLoader();
    const toggleItem = (index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(index === expanded ? null : index);
    }
    useEffect(() => {
        getFAQsInfo()
    }, []);
    const getFAQsInfo = async () => {
        try {
            setLoading(true);
            const response: any = await CardsModuleService.getApplyCardFAQs();
            if (response.status === 200) {
                setAccordionData(response.data?.faQs || []);
                setErrormsg('');
                setLoading(false);
            } else {
                setErrormsg(isErrorDispaly(response));
                setLoading(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
            <ScrollView >
                <Container style={[commonStyles.container]} >

                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap20, commonStyles.justifyContent]}>
                        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                            <TouchableOpacity style={[]} onPress={() => props.navigation.goBack()}>
                                <View>
                                    <AntDesign name="arrowleft" size={s(22)} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
                                </View>
                            </TouchableOpacity>
                            <ParagraphComponent text="All FAQs" style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw800]} />
                        </View>
                    </View>
                    <View style={[commonStyles.mb36]} />
                    {loading && (
                        <Loadding contenthtml={ApplyCardSkeleton} />
                    )}
                    <View style={[commonStyles.sectionStyle, commonStyles.p16,]}>
                        {AccordionData?.map((item: any, index: number) => {
                            return <View key={index}>
                                <TouchableOpacity onPress={() => toggleItem(index)} activeOpacity={0.8}>
                                    <View style={[commonStyles.dflex, commonStyles.gap8, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap16,]}>
                                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.textBlack, commonStyles.fw600, commonStyles.flex1]} text={item.question} />
                                        <ChevronRight style={{ transform: [{ rotate: expanded === index ? '90deg' : '0deg' }], }} />
                                    </View>
                                </TouchableOpacity>
                                {expanded === index &&
                                    <ParagraphComponent style={[commonStyles.fs12, commonStyles.textGrey, commonStyles.fw500, commonStyles.flex1, { marginTop: 6, marginBottom: 8 }]}
                                        text={item.answer} />
                                }
                                {AccordionData?.length !== index + 1 && <View style={[styles.btmBorder]} />}
                            </View>
                        })}

                    </View>
                    <View style={[commonStyles.mb24]} />
                </Container>
            </ScrollView>
        </SafeAreaView>

    );
};
export default AllFaqs;
const themedStyles = StyleService.create({
    btmBorder: {
        borderBottomWidth: 1,
        borderBottomColor: NEW_COLOR.DASHED_BORDER_STYLE,
        height: 1, flex: 1,
        marginVertical: 14,
        borderStyle: "dashed"
    },
});
