import { BackHandler, Dimensions, TouchableOpacity, View, SafeAreaView, ScrollView } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useIsFocused } from '@react-navigation/native';
import { ExchangeCardViewLoader } from '../cards/CardsSkeleton_views';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import { commonStyles } from '../../components/CommonStyles';
import CardsModuleService from '../../services/card';
import { isErrorDispaly } from '../../utils/helpers';
import { Container } from '../../components';
import Loadding from '../../components/skeleton';
import { NEW_COLOR } from '../../constants/theme/variables';
import ErrorComponent from '../../components/Error';
import NoDataComponent from '../../components/nodata';
import DefaultButton from '../../components/DefaultButton';
import { s } from '../../constants/theme/scale';
import AntDesign from "react-native-vector-icons/AntDesign";
import QuickLinkStepComponent from '../../components/steps/QuicklinksSteps';

const { width } = Dimensions.get('window');
const isPad = width > 600;
const QuickApplicationInfo = (props: any) => {
    const isFocus = useIsFocused();
    const ref = useRef<any>(null);
    const [CardsDetailsLoading, setCardsDetailsLoading] = useState<boolean>(false);
    const [cardDetails, setcardDetails] = useState<any>([]);
    const [errormsg, setErrormsg] = useState<string>('');
    const ExchangeCardSkeleton = ExchangeCardViewLoader();
    const stepContents = [
        <ParagraphComponent style={[commonStyles.fs12, commonStyles.textBlack, commonStyles.fw600]} text="Application information" />,
        <ParagraphComponent style={[commonStyles.fs12, commonStyles.textBlack, commonStyles.fw600]} text="KYC Information " />,
        <ParagraphComponent style={[commonStyles.fs12, commonStyles.textBlack, commonStyles.fw600,]} text="Status" />,
    ];
    useEffect(() => {
        getCardDeatils();
        ref?.current?.scrollTo({ y: 0, animated: true });
    }, [isFocus]);

    const getCardDeatils = async () => {
        try {
            setCardsDetailsLoading(true);
            const response: any = await CardsModuleService?.getCardsApplicationInfo(props?.route?.params?.cardId);
            setcardDetails(response?.data?.keyValuePairs)
            setCardsDetailsLoading(false);
        } catch (error) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrormsg(isErrorDispaly(error));
            setCardsDetailsLoading(false);
        }
    };

    const handleRedirectToKYC = () => {
        props.navigation.push("QuickKYCInfo", {
            cardId: props?.route?.params?.cardId
        });
    };

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleBack(); return true; }
        );
        return () => backHandler.remove();
    }, []);
    const handleBack = () => {
        props.navigation.goBack()
    };

    const handleCloseError = () => {
        setErrormsg('');
    };

    useEffect(() => {
        if (errormsg) {
            ref?.current?.scrollTo({ y: 0, animated: true });
        }
    }, [errormsg]);

    return (

        <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
            <ScrollView showsVerticalScrollIndicator={false} ref={ref}>
                <Container style={commonStyles.container}>
                    {CardsDetailsLoading && (
                        <View style={[commonStyles.flex1]}>
                            <Loadding contenthtml={ExchangeCardSkeleton} />
                        </View>
                    )}
                    {!CardsDetailsLoading && <>
                        <View>
                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mb32, commonStyles.gap16]}>
                                <TouchableOpacity style={[]} onPress={() => handleBack()}>
                                    <View>
                                        <AntDesign name="arrowleft" size={s(22)} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
                                    </View>
                                </TouchableOpacity>
                                <ParagraphComponent text="Apply For Exchanga Pay Card" style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw700]} />
                            </View>
                            {errormsg && <><ErrorComponent message={errormsg} onClose={handleCloseError} /><View style={commonStyles.mt8} /></>}
                            <View style={commonStyles.mt8} />
                            <View >
                                <QuickLinkStepComponent totalSteps={3} currentStep={1} stepContents={stepContents} />
                                {isPad && <View style={[commonStyles.mb24]} />}
                            </View>


                            <View style={[commonStyles.sectionStyle]}>
                                {cardDetails?.length > 0 && cardDetails.map((item: any, index: any) => (
                                    <View key={index}>

                                        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap16]}>
                                            <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textGrey, commonStyles.flex1]} text={item?.title} />
                                            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.flex1]}>
                                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textBlack, commonStyles.textRight, commonStyles.flex1]} text={`${item?.value || " "}`} />
                                            </View>
                                        </View>
                                        {index !== cardDetails.length - 1 && <View style={[commonStyles.dashedLine, commonStyles.mt10, commonStyles.mb10, { opacity: 0.5, borderWidth: 0.8 }]} />}
                                    </View>
                                ))}
                                {cardDetails?.length < 1 &&
                                    <NoDataComponent />
                                }

                            </View>
                        </View>
                        <View style={[commonStyles.mb43,]} />
                        <DefaultButton
                            title='Next'
                            style={undefined}
                            disable={undefined}
                            loading={undefined}
                            onPress={handleRedirectToKYC}
                        />
                        <View style={[commonStyles.mb24,]} />

                    </>
                    }
                </Container>
            </ScrollView>
        </SafeAreaView>

    )
}

export default QuickApplicationInfo

