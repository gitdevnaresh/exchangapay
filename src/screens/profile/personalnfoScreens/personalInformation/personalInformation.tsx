import { useEffect, useMemo, useState } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { getThemedCommonStyles } from "../../../../assets/styles/CommonStyles";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import Container from "../../../../newComponents/container/container";
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import ViewComponent from "../../../../newComponents/view/view";
import ProfileService from "../../../../services/profile";
import { dateFormates, isErrorDispaly, maskToLastFourDigits } from "../../../../utils/helpers";
import useEncryptDecrypt from "../../../../hooks/encDecHook";
import TextMultiLanguage from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import { FormattedDateText } from "../../../../newComponents/textComponets/dateTimeText/dateTimeText";
import SwokipayDashboardLoader from "../../../../newComponents/swokipayloader";
import NoDataComponent from "../../../../newComponents/noData/noData";
import { PersonalInfoData } from "./interface";
import { useHardwareBackHandler } from "../../../../hooks/HardwareBackHandler";
import ErrorComponent from "../../../../newComponents/errorDisplay/errorDisplay";



const PersonalInformation = () => {
    const NEW_COLOR = useMemo(() => useThemeColors(), []);
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
    const navigation = useNavigation<any>();
    const [personalInfo, setPersonalInfo] = useState<PersonalInfoData | null>(null);
    const [loading, setLoading] = useState(true);
    const { decryptAES } = useEncryptDecrypt();
    const isFocused=useIsFocused();
    const [error, setError] = useState<string>("");

    useEffect(() => {
        setError("");
        fetchPersonalInfo();
    }, [isFocused]);

    const fetchPersonalInfo = async () => {
        try {
            setLoading(true);
            const response = await ProfileService.getPersonalInformation();
            if (response?.status === 200) {
                setPersonalInfo(response?.data as PersonalInfoData);
            } else {
                setPersonalInfo(null)
                setError(isErrorDispaly(response))
            }
        } catch (err) {
            setError(isErrorDispaly(err))
        } finally {
            setLoading(false);
        }
    };
useHardwareBackHandler(()=>{
      handleback();
    })
    const handleback = () => {
        navigation.goBack();
    };

    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            <Container>
                <PageHeader
                    title="GLOBAL_CONSTANTS.PERSIONAL_INFORMATION"
                    onBackPress={handleback}  
                />
                {error &&<ErrorComponent message={error} screen={true}/>}
                {loading && <SwokipayDashboardLoader />}            
                {!loading && !personalInfo && (
                    <ViewComponent style={[commonStyles.myAuto]}>
                   <NoDataComponent/>
                   </ViewComponent>
                )}
                
                {!loading && personalInfo && (
                    <ViewComponent>
                         <ViewComponent style={[commonStyles.personalInformation]}>
                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.COUNTRY_REGION"} style={[commonStyles.fs14,commonStyles.textGrey,commonStyles.fw400]} />
                            <ParagraphComponent text={personalInfo?.country} style={[commonStyles.primaryText]} />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.transactionsGap]} />
                        <ViewComponent style={[commonStyles.personalInformation]}>
                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.FIRST_NAME_S"} style={[commonStyles.fs14,commonStyles.textGrey,commonStyles.fw400]} />
                            <ParagraphComponent text={decryptAES(personalInfo?.firstName || '')} style={[commonStyles.primaryText]} />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.transactionsGap]} />
                        <ViewComponent style={[commonStyles.personalInformation]}>
                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.LAST_NAME_S"} style={[commonStyles.fs14,commonStyles.textGrey,commonStyles.fw400]} />
                            <ParagraphComponent text={decryptAES(personalInfo?.lastName || '')} style={[commonStyles.primaryText]} />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.transactionsGap]} />
                        <ViewComponent style={[commonStyles.personalInformation]}>
                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.DATE_OF_BIRTH"} style={[commonStyles.fs14,commonStyles.textGrey,commonStyles.fw400]} />
                            <FormattedDateText value={personalInfo?.dob || ''} dateFormat={dateFormates?.date}  style={[commonStyles.primaryText]}/>
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.transactionsGap]} />
                        <ViewComponent style={[commonStyles.personalInformation]}>
                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.DOCUMENT_TYPE"} style={[commonStyles.fs14,commonStyles.textGrey,commonStyles.fw400]} />
                            <ParagraphComponent text={personalInfo?.documentType} style={[commonStyles.primaryText]} />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.transactionsGap]} />
                        <ViewComponent style={[commonStyles.personalInformation]}>
                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.DOCUMENT_NUMBER"} style={[commonStyles.fs14,commonStyles.textGrey,commonStyles.fw400]} />
                            <ParagraphComponent text={maskToLastFourDigits(decryptAES(personalInfo?.documentNumber || ''))} style={[commonStyles.primaryText]} />
                        </ViewComponent>
                    </ViewComponent>
                )}
            </Container>
        </ViewComponent>
    );
};

export default PersonalInformation;
