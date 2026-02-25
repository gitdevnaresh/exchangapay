import React, { useRef, useState } from "react";
import { ActivityIndicator, ScrollView } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSelector } from "react-redux";
import useEncryptDecrypt from "../../../../hooks/encDecHook";
import RenderHTML from 'react-native-render-html';
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import Container from "../../../../components/container/container";
import PageHeader from "../../../../components/pageHeader/pageHeader";
import ViewComponent from "../../../../components/view/view";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph"
import ButtonComponent from "../../../../components/buttons/button";
import { s } from "../../../../components/theme/scale";
import CardsModuleService from "../../../../apiServices/cards";
import { isErrorDispaly } from "../../../../utils/helpers";
import ErrorComponent from "../../../../components/errorDisplay/errorDisplay";
import { showAppToast } from "../../../../components/toasterMessages/ShowMessage";
import CommonTouchableOpacity from "../../../../components/touchableComponents/touchableOpacity";
import CustomRBSheet from "../../../../components/models/commonDrawer";
import NoDataComponent from "../../../../components/noData/noData";


const GetMyCard: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { cardId, programId, screenName } = route?.params || {};
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const { decryptAES } = useEncryptDecrypt();
    const agreementSheetRef = useRef<any>(null);
    const [state, setState] = useState({
        firstName: "",
        lastName: "",
        email: "",
        termsAccepted: false,
        loading: false,
        errorMsg: "",
        agreementContent: "",
        agreementLoading: false
    });

    const updateState = (newState: Partial<typeof state>) => {
        setState(prev => ({ ...prev, ...newState }));
    };

    const getAgreementData = async () => {
        updateState({ agreementLoading: true });
        try {
            const response: any = await CardsModuleService.getAuthorizedUserAgreement();
            if (response?.ok) {
                updateState({ agreementContent: response.data?.templateContent || "", agreementLoading: false });
                agreementSheetRef.current?.open();
            } else {
                updateState({ errorMsg: isErrorDispaly(response), agreementLoading: false });
            }
        } catch (error) {
            updateState({ errorMsg: isErrorDispaly(error), agreementLoading: false });
        }
    };

    const handleGetMyCard = async () => {
        if (!state.termsAccepted) {
            updateState({ errorMsg: "Please accept the Authorized User Agreement" });
            return;
        }

        updateState({ loading: true, errorMsg: "" });
        try {
            // const response = await CardsModuleService.getMyCardPost({
            //     cardId,
            //     programId,
            //     firstName: state.firstName,
            //     lastName: state.lastName,
            //     email: state.email
            // });
let response: any;
            // if (response) {
                showAppToast("Card request submitted successfully", "success");
                navigation.replace("CardsInfo", { cardId, shouldRefresh: true, screenName });
            // } else {
            //     updateState({ errorMsg: isErrorDispaly(response) });
            // }
        } catch (error) {
            updateState({ errorMsg: isErrorDispaly(error) });
        } finally {
            updateState({ loading: false });
        }
    };
    return (
        <Container style={[commonStyles.container]}>
            <PageHeader title="Create a card" onBackPress={() => navigation.goBack()} />
                <ViewComponent style={[commonStyles.flex1,commonStyles.justifyContent]}>
                 <ViewComponent>

                
                {state.errorMsg && (
                    <ErrorComponent
                        message={state.errorMsg}
                        onClose={() => updateState({ errorMsg: "" })}
                    />
                )}

                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.listitemGap]}>
                    <ParagraphComponent text={"GLOBAL_CONSTANTS.FIRST_NAME"} style={[commonStyles.listsecondarytext]} />
                    <ParagraphComponent text={userInfo?.firstName || "---"} style={[commonStyles.listprimarytext]} />
                </ViewComponent>
                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.listitemGap]}>
                    <ParagraphComponent text={"GLOBAL_CONSTANTS.LAST_NAME"} style={[commonStyles.listsecondarytext]} />
                    <ParagraphComponent text={userInfo?.lastName || "---"} style={[commonStyles.listprimarytext]} />
                </ViewComponent>
                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.listitemGap]}>
                    <ParagraphComponent text={"GLOBAL_CONSTANTS.EMAIL"} style={[commonStyles.listsecondarytext]} />
                    <ParagraphComponent text={decryptAES(userInfo?.email) || "---"} style={[commonStyles.listprimarytext]} />
                </ViewComponent>

                <ViewComponent style={[commonStyles.sectionGap]}>
                    <CommonTouchableOpacity onPress={() => updateState({ termsAccepted: !state.termsAccepted })}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                            <MaterialCommunityIcons
                                name={state.termsAccepted ? 'checkbox-outline' : 'checkbox-blank-outline'}
                                size={s(24)}
                                color={state.termsAccepted ? NEW_COLOR.BUTTON_BG : NEW_COLOR.TEXT_link}
                            />
                            <ParagraphComponent style={[commonStyles.checkboxtextterms, commonStyles.flex1]}>
                                <ParagraphComponent text="I accept the " style={[commonStyles.checkboxtextterms]} />
                                <ParagraphComponent 
                                    text="Authorized User Agreement" 
                                    style={[commonStyles.checkboxtexttermslink]} 
                                    onPress={getAgreementData}
                                />
                            </ParagraphComponent>
                        </ViewComponent>
                    </CommonTouchableOpacity>
                </ViewComponent>
                 </ViewComponent>

                <ViewComponent style={[commonStyles.sectionGap]}>
                    <ButtonComponent
                        title="Get My Card"
                        onPress={handleGetMyCard}
                        loading={state.loading}
                        disabled={!state.termsAccepted}
                    />
                </ViewComponent>
                 </ViewComponent>
            <CustomRBSheet 
                modeltitle={true} 
                refRBSheet={agreementSheetRef} 
                title="Authorized User Agreement" 
                height={s(700)} 
                closeicon={true}
            >
                {state.agreementLoading && <ActivityIndicator size="small" color={NEW_COLOR.TEXT_PRIMARY} />}
                {!state.agreementLoading && state.agreementContent && <RenderHTML 
                    source={{ html: state.agreementContent || "" }}
                    tagsStyles={{
                        p: commonStyles.textWhite,
                        h1: commonStyles.textWhite,
                        h2: commonStyles.textWhite,
                        li: commonStyles.textWhite,
                        span: commonStyles.textWhite,
                        a: { color: NEW_COLOR.TEXT_PRIMARY },
                        div: commonStyles.textWhite
                    }}
                    classesStyles={{
                        "text-paraColor": commonStyles.textWhite,
                        "text-subTextColor": commonStyles.textWhite,
                    }}
                    ignoredDomTags={["font"]}
                    ignoredStyles={["color", "backgroundColor"]}
                />}
                {(!state.agreementLoading && !state.agreementContent) && (
                    <ViewComponent style={[commonStyles.mt44]}>
                        <NoDataComponent Description="No Authorized User Agreement Found" />
                    </ViewComponent>
                )}
                <ViewComponent style={[commonStyles.sectionGap]} />
            </CustomRBSheet>
        </Container>
    );
};

export default GetMyCard;
