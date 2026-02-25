import React, { useCallback } from "react";
import { useRoute } from '@react-navigation/native';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import Container from '../../../../../components/container/container';
import ViewComponent from '../../../../../components/view/view';
import TextMultiLangauge from '../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import { s } from '../../../../../constants/styels/scale';
import ScrollViewComponent from '../../../../../components/scrollView/scrollView';
import ButtonComponent from '../../../../../components/buttons/button';
import { ProfileGeneralServices } from '../../../../../apiServices/profile/general';
import { UserInfo } from '../interface';
import { useSelector } from 'react-redux';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import { isErrorDispaly } from '../../../../../utils/helpers';
import { showAppToast } from '../../../../../components/toasterMessages/ShowMessage';
import { useLngTranslation } from '../../../../../hooks/languagesHook/useLngTranslation';
import { useHardwareBackHandler } from '../../../../../hooks/backHandleHook';
import PageHeader from '../../../../../components/pageHeader/pageHeader';
// import LineProgressBar from '../../../../../components/progressCircle/lineprogressbar';

const RewardViewDetails: React.FC<any> = ({ navigation }) => {
    const route = useRoute();
    const { questDetails } = route.params as { questDetails: any }; // Type assertion for route.params
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const userInfo = useSelector((state: { userReducer: { userDetails: UserInfo } }) => state.userReducer?.userDetails);
    const [errorMsg, setErrorMsg] = React.useState<string>("");
    const [buttonLoading, setButtonLoading] = React.useState<boolean>(false);
    const { t } = useLngTranslation();
    if (!questDetails) {
        return (
            <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg, commonStyles.justifyCenter, commonStyles.alignCenter]}>
                <TextMultiLangauge text="GLOBAL_CONSTANTS.NO_QUEST_DETAILS_AVAILABLE" style={[commonStyles.textWhite, commonStyles.fs16]} />
            </ViewComponent>
        );
    }
    useHardwareBackHandler(() => {
        handleBack();
        return true;
    });

    const handleContinue = useCallback(() => {
        if (!questDetails?.isActive) {
            if (questDetails?.steps[0]?.triggerEvent?.toLowerCase() === "consume" || questDetails?.steps[0]?.triggerEvent?.toLowerCase() === "topup") {
                navigation.navigate('AllCardsList', { type: 'MyCards' });
            }
            else if (questDetails?.steps[0]?.triggerEvent?.toLowerCase() === "upgrade") {
                navigation.navigate('UpgradeFees');
                return;
            } else if (questDetails?.steps[0]?.triggerEvent?.toLowerCase() == "cardpurchase") {
                navigation.navigate('AllCards');
                return;
            } else if (questDetails?.steps[0]?.triggerEvent?.toLowerCase() == "deposit") {
                navigation.navigate('SelectVaults', { screenName: "Deposit" });
                return;
            } else {
                navigation.navigate('ComingSoon');
            }
        } else {
            postQuestAction();
        }
    }, [navigation, questDetails]);

    const postQuestAction = useCallback(async () => {
        setButtonLoading(true);
        try {
            const response: any = await ProfileGeneralServices.postQuestAction(questDetails.id, userInfo.id);
            if (response.ok) {
                navigation.goBack();
                setButtonLoading(true);
                showAppToast(t("GLOBAL_CONSTANTS.QUEST_STARTED_SUCCESSFULLY"), "success",);
            } else {
                setErrorMsg(isErrorDispaly(response));
                setButtonLoading(true);
            }
        } catch (e) {
            setErrorMsg(isErrorDispaly(e));
            setButtonLoading(true);
        }
    }, [navigation, questDetails.id, t, userInfo.id]);

    const handleBack = useCallback(() => {
        navigation.navigate('RewaordsDashBoard', { animation: 'slide_from_left' });
    }, [navigation]);
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={[commonStyles.container]}>
                <PageHeader title={questDetails.name} onBackPress={handleBack} />
                {errorMsg ? <ErrorComponent message={errorMsg} onClose={() => setErrorMsg("")} /> : null}
                <ScrollViewComponent style={[commonStyles.flex1]}>
                    <ViewComponent style={[commonStyles.flex1]}>
                        {/* <ViewComponent style={[ commonStyles.dflex, commonStyles.justifyend, commonStyles.alignCenter,commonStyles.titleSectionGap]}>
                        <TextMultiLangauge text={questDetails?.steps[0]?.isCompleted ? "GLOBAL_CONSTANTS.COMPLETED" : "GLOBAL_CONSTANTS.IN_PROGRESS"} style={[commonStyles.fs14, commonStyles.fw400,commonStyles.p8,commonStyles.rounded50,{color:statusColor[questDetails?.steps[0]?.isCompleted ? "inprogress" : "completed"]}]} />
                    </ViewComponent> */}
                        <ParagraphComponent text={'Consume & Conquer'} style={[commonStyles.sectionTitle, commonStyles.mb6]} />
                        <ParagraphComponent text={questDetails.description} style={[commonStyles.textlinkgrey, commonStyles.fs12, commonStyles.sectionGap, commonStyles.fw400]} />
                        <TextMultiLangauge text="GLOBAL_CONSTANTS.QUEST_STEPS" style={[commonStyles.sectionTitle, commonStyles.mb6]} />
                        {questDetails?.steps?.map((step: any) => (
                            <ViewComponent key={step.stepId} style={[]}>
                                <ParagraphComponent style={[commonStyles.textlinkgrey, commonStyles.fs12, commonStyles.fw400, commonStyles.flex1, commonStyles.mb6]} text={step.description} />
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mb6]}>
                                    <TextMultiLangauge text="GLOBAL_CONSTANTS.PROGRESS" style={[commonStyles.listsecondarytext]} />
                                    <ParagraphComponent text={`${step.currentCount}/${step.targetCount}`} style={[commonStyles.listprimarytext]} />
                                </ViewComponent>
                                {/* {step?.targetCount && <LineProgressBar progress={step.currentCount} total={step?.targetCount} backgroundColor={NEW_COLOR.TEXT_GREY} />} */}

                                <ViewComponent style={[commonStyles.mt6, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                                    <TextMultiLangauge text="GLOBAL_CONSTANTS.TRIGGER" style={[commonStyles.listsecondarytext]} />
                                    <ParagraphComponent text={step.triggerEvent} style={[commonStyles.listprimarytext]} />
                                </ViewComponent>
                            </ViewComponent>
                        ))}
                        <ViewComponent style={[commonStyles.sectionGap]} />
                        <TextMultiLangauge text="GLOBAL_CONSTANTS.REWARDS" style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} />
                        <ViewComponent style={[]}>
                            {questDetails.rewardCurrencyCode === "USDT" && (
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.listGap]}>
                                    <TextMultiLangauge text="GLOBAL_CONSTANTS.REWARD_AMOUNT" style={[commonStyles.listsecondarytext]} />
                                    <ParagraphComponent text={questDetails.rewardAmount + " USDT"} style={[commonStyles.listprimarytext]} />
                                </ViewComponent>
                            )}
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.listGap]}>
                                <TextMultiLangauge text="GLOBAL_CONSTANTS.TIER_POINTS" style={[commonStyles.listsecondarytext]} />
                                <ParagraphComponent text={questDetails.rewardTierPoints + " TP"} style={[commonStyles.listprimarytext]} />
                            </ViewComponent>
                            {questDetails.rewardCurrencyCode === "MYSTERY_BOX" && questDetails.mysteryBoxRewardName && (
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent,]}>
                                    <TextMultiLangauge text="GLOBAL_CONSTANTS.MYSTERY_BOX" style={[commonStyles.listsecondarytext]} />
                                    <ParagraphComponent text={questDetails.mysteryBoxRewardName} style={[commonStyles.listprimarytext]} />
                                </ViewComponent>
                            )}
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.sectionGap]} />

                        <TextMultiLangauge text="GLOBAL_CONSTANTS.QUEST_INFO" style={[commonStyles.textWhite, commonStyles.fs18, commonStyles.fw600, commonStyles.titleSectionGap]} />
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.listGap]}>
                            <TextMultiLangauge text="GLOBAL_CONSTANTS.CATEGORY" style={[commonStyles.listsecondarytext]} />
                            <ParagraphComponent text="--" style={[commonStyles.listprimarytext]} />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.listGap]}>
                            <TextMultiLangauge text="GLOBAL_CONSTANTS.DIFFICULTY" style={[commonStyles.listsecondarytext]} />
                            <ParagraphComponent text="--" style={[commonStyles.listprimarytext]} />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                            <TextMultiLangauge text="GLOBAL_CONSTANTS.TYPE" style={[commonStyles.listsecondarytext]} />
                            <ParagraphComponent text="--" style={[commonStyles.listprimarytext]} />
                        </ViewComponent>

                    </ViewComponent>
                    <ViewComponent style={[commonStyles.flex1]}>

                    </ViewComponent>
                </ScrollViewComponent>
                {!questDetails?.steps[0]?.isCompleted && <ButtonComponent title={questDetails?.isActive ? "GLOBAL_CONSTANTS.START_QUEST" : "GLOBAL_CONSTANTS.CONTINUE"} onPress={handleContinue} loading={buttonLoading} />}
                <ViewComponent style={[commonStyles.sectionGap]} />

            </Container>
        </ViewComponent>
    );
};

export default RewardViewDetails;