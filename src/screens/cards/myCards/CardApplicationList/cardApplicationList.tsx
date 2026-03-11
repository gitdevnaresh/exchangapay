import React from 'react';
import { FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import ViewComponent from '../../../../newComponents/view/view';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { s } from '../../../../newComponents/theme/scale';
import { FormattedDateText } from '../../../../newComponents/textComponets/dateTimeText/dateTimeText';
import Container from '../../../../newComponents/container/container';
import { ActionLogParams, useActionLogging } from '../../../../hooks/loggingHook';
import NoDataComponent from '../../../../newComponents/noData/noData';
import { useHardwareBackHandler } from '../../../../hooks/HardwareBackHandler';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import ImageBackgroundWrapper from '../../../../newComponents/imageComponents/ImageBackground';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import { useLngTranslation } from '../../../../hooks/useLngTranslation';
const CardApplicationList = (props: any) => {
    const navigation = useNavigation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const myCards = props?.route?.params?.myCards;
    const { logEvent } = useActionLogging();
    const { decryptAES } = useEncryptDecrypt();
    const { t } = useLngTranslation();
    useHardwareBackHandler(() => {
        handleBackPress();
    });

    const handleBackPress = () => {
        const actionData: ActionLogParams = {
            screename: 'CardApplicationList',
            actionName: 'Navigate Back via Hardware Button',
            actionType: 'HardwareButton',
        };
        logEvent('navigation_action', actionData);
        navigation.goBack();
    };

    const renderApplicationItem = ({ item }: any) => (
        <ViewComponent style={[commonStyles.flexRow, commonStyles.alignCenter, commonStyles.listbg, commonStyles.mb12,]}>
            <ViewComponent style={[commonStyles.rounded5, commonStyles.justifyContent, commonStyles.alignEnd, commonStyles.p6, commonStyles.mr12]}>
                <ImageBackgroundWrapper
                    source={{ uri: item?.logo }}
                    resizeMode="cover"
                    imageStyle={[commonStyles.rounded4]}
                    style={[{ height: s(40), width: s(60) }]}
                >
                </ImageBackgroundWrapper>           
                 </ViewComponent>

            <ViewComponent style={[commonStyles.flex1]}>
                <ParagraphComponent numberOfLines={1} text={`${item?.lable && (item?.lable || decryptAES(item?.lable)) || item?.type}`} style={[commonStyles.textWhite, commonStyles.fs16, commonStyles.fw600, { maxWidth: s(140) }]} />
                <FormattedDateText
                    value={item?.approvedDate}
                    conversionType="UTC-to-local"
                    style={[commonStyles.textlinkgrey, commonStyles.fs12, commonStyles.fw400, { marginTop: s(4) }]}
                />
            </ViewComponent>

            <ViewComponent style={[commonStyles.alignEnd]}>
                <ParagraphComponent
                    text={item.amount?.toFixed(2) + " " + item.currency}
                    style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.fw400]}
                />
                <ParagraphComponent text={item.number && "****" + " " + item.number?.slice(-4) || ''} style={[commonStyles.textlinkgrey, commonStyles.fs12, { marginTop: s(4) }]} />
            </ViewComponent>
        </ViewComponent>
    );

    const ListFooter = () => (
        <ViewComponent style={[commonStyles.mt130]}>
            <ViewComponent style={[commonStyles.flexRow, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.mt50, commonStyles.gap8]}>
                <AntDesign name="exclamationcircleo" size={s(20)} color={NEW_COLOR.BG_YELLOW} />
                <ParagraphComponent text={t("GLOBAL_CONSTANTS.NO_MORE_RECORDS")} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]} />
            </ViewComponent>
        </ViewComponent>
    );

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container>
                <PageHeader title={"GLOBAL_CONSTANTS.CARD_APPLICATION_LIST"} onBackPress={handleBackPress} />
                {myCards?.length > 0 && (<FlatList
                    data={myCards}
                    renderItem={renderApplicationItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingTop: s(20) }}
                    ListFooterComponent={ListFooter}
                />)}

                {myCards?.length === 0 && (<ViewComponent style={{ gap: s(12) }}>
                    <ViewComponent><NoDataComponent Description={"GLOBAL_CONSTANTS.NO_DATA_AVAILABLE"} /></ViewComponent>
                </ViewComponent>)}
            </Container>
        </ViewComponent>
    );
};

export default CardApplicationList;