import React, { useMemo } from 'react';
import { TouchableOpacity, FlatList} from 'react-native';
import { getStatusStyle } from './constant';
import Container from '../../../newComponents/container/container';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import { useNavigation } from '@react-navigation/native';
import ViewComponent from '../../../newComponents/view/view';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { s } from '../../../newComponents/theme/scale';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import { ActionLogParams, useActionLogging } from '../../../hooks/loggingHook';
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import NoDataComponent from '../../../newComponents/noData/noData';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import CardApplicationSearchIcon from '../../../assets/mainmenuicons/cardApplicationSearchIcon';
import RoundedPlusIcon from '../../../assets/mainmenuicons/roundedPlus';
import ImageBackgroundWrapper from '../../../newComponents/imageComponents/ImageBackground';
import useEncryptDecrypt from '../../../hooks/encDecHook';
import { useLngTranslation } from '../../../hooks/useLngTranslation';



const MyCardsList = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const navigation = useNavigation<any>();
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
    const myCards = props?.route?.params?.myCards;
    const { logEvent } = useActionLogging();
    const { decryptAES } = useEncryptDecrypt();
    const { t } = useLngTranslation();
    useHardwareBackHandler(() => {
        backArrowButtonHandler();
    });
    const backArrowButtonHandler = () => {
        const actionData: ActionLogParams = {
            screename: 'MyCardsList',
            actionName: 'Navigate Back via Hardware Button',
            actionType: 'HardwareButton',
        };
        logEvent('navigation_action', actionData);
        navigation.goBack();
    }

    const handleCardNavigation = (item: any) => {
        navigation.navigate("MyCards", { initialTab: "GLOBAL_CONSTANTS.CARDS", cardId: item?.id });
    }
    const renderListData = ({ item }: any) => {
        const { icon, color } = getStatusStyle(item.status?.toLowerCase(), 16);
        return (
            <CommonTouchableOpacity onPress={() => handleCardNavigation(item)} style={[commonStyles.p8, commonStyles.rounded12, commonStyles.applycardbg]}>
                <ViewComponent style={[commonStyles.flexRow, commonStyles.justifyContent, { alignItems: 'flex-start', }]}>
                    <ViewComponent style={[commonStyles.flexRow, commonStyles.alignCenter]}>

                        <ViewComponent style={[commonStyles.rounded5, commonStyles.mr12, commonStyles.justifyend, commonStyles.p6]}>

                            <ImageBackgroundWrapper
                                source={{ uri: item?.logo }}
                                resizeMode="cover"
                                imageStyle={[commonStyles.rounded4]}
                                style={[{ height: s(40), width: s(60) }]}
                            >
                               
                            </ImageBackgroundWrapper>
                        </ViewComponent>
                        <ViewComponent>

                            <ViewComponent style={[commonStyles.dflex, commonStyles.ml10]}>
                                <ParagraphComponent style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400, { maxWidth: s(140) }]} numberOfLines={1}
                                    text={`${item?.lable && (item?.lable || decryptAES(item?.lable)) || item?.type}`} />
                                <ParagraphComponent style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]}
                                    text={item?.number ? `**** ${item.number.slice(-4)}` : ''}
                                />
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.flexRow, commonStyles.alignCenter, commonStyles.mt6]}>
                                {icon}
                                <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.ml8, { color: color }]} text={item.status} />
                            </ViewComponent>

                        </ViewComponent>
                    </ViewComponent>
                </ViewComponent>
                <ViewComponent style={[commonStyles.mt4, commonStyles.mb10, { height: 1 }]} />
                <ViewComponent style={[]}>
                    {item?.singleTransactionLimit > 0 && <ViewComponent style={[commonStyles.flexRow, commonStyles.justifyContent, commonStyles.mb8]}>
                        <ParagraphComponent text={t("GLOBAL_CONSTANTS.SINGLE_TRANSACTION_LIMIT")} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]} />
                        <ParagraphComponent text={`${item?.singleTransactionLimit?.toFixed(2) || "0.00"} ${item?.currency}`} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} />
                    </ViewComponent>}
                    {item?.dailyLimit > 0 && <ViewComponent style={[commonStyles.flexRow, commonStyles.justifyContent, commonStyles.mb8]}>
                        <ParagraphComponent text={t("GLOBAL_CONSTANTS.DAILY_LIMIT")} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]} />
                        <ParagraphComponent text={`${item?.dailyLimit?.toFixed(2) || "0.00"} ${item?.currency}`} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} />
                    </ViewComponent>}
                </ViewComponent>
            </CommonTouchableOpacity>
        );
    };

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container>
                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, { marginTop: s(-5) }]}>

                    <PageHeader
                        title={"GLOBAL_CONSTANTS.MY_CARDS"}
                        onBackPress={backArrowButtonHandler}
                    />
                    <ViewComponent style={[commonStyles.flexRow]}>
                        <TouchableOpacity style={{ marginRight: 20 }} onPress={() => {
                            navigation.navigate("CardApplicationList", { myCards: props?.route?.params?.myCards })
                        }}>

                            <CardApplicationSearchIcon color={NEW_COLOR.TEXT_WHITE} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            navigation.navigate("ChooseCard", { screenName: "MyCards" })
                        }}
                        >
                            <RoundedPlusIcon color={NEW_COLOR.TEXT_WHITE} />
                        </TouchableOpacity>
                    </ViewComponent>
                </ViewComponent>


                {myCards?.length > 0 && (<FlatList
                    data={myCards}
                    renderItem={renderListData}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingBottom: s(20) }} // Add some padding at the bottom
                    ItemSeparatorComponent={() => <ViewComponent style={{ height: 16 }} />} // Add space between cards
                />)}

                {myCards?.length == 0 && (<ViewComponent style={{ gap: s(12) }}>
                    <ViewComponent><NoDataComponent Description={"GLOBAL_CONSTANTS.NO_DATA_AVAILABLE"} /></ViewComponent>
                </ViewComponent>)}
            </Container>
        </ViewComponent>
    );
};

export default MyCardsList;