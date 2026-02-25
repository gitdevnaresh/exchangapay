import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { CommonActions, useIsFocused, useNavigation } from '@react-navigation/native';
import { dateFormates, formatDates, isErrorDispaly } from '../../../../utils/helpers';
import { getThemedCommonStyles, statusColor } from '../../../../components/CommonStyles';
import { s } from '../../../../constants/styels/scale';
import Container from '../../../../components/container/container';
import ProfileService from '../../../../apiServices/profile';
import { useSelector } from 'react-redux';
import ViewComponent from '../../../../components/view/view';
import CommonTouchableOpacity from '../../../../components/touchableComponents/touchableOpacity';
import FilePreview from '../../../../components/fileUpload/filePreview';
import TextMultiLangauge from '../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import useMemberLogin from '../../../../hooks/userInfoHook';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import ButtonComponent from '../../../../components/buttons/button';
import NoDataComponent from '../../../../components/noData/noData';
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import PageHeader from '../../../../components/pageHeader/pageHeader';
import DashboardLoader from '../../../../components/loader';
import { showAppToast } from '../../../../components/toasterMessages/ShowMessage';
import { EditImage } from '../../../../assets/svg';
import { useHardwareBackHandler } from '../../../../hooks/backHandleHook';
import SafeAreaViewComponent from '../../../../components/safeArea/safeArea';
import ParagraphComponent from '../../../../components/textComponets/paragraphText/paragraph';

const KycProfilePreview = React.memo((props: any) => {
    const isFocused = useIsFocused();
    const [persionalDetails, setPersionalDetails] = useState<any>({});
    const [kycDocuments, setKycDocuments] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState<boolean>(false);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const userinfo = useSelector((state: any) => state.userReducer?.userDetails);
    const navigation = useNavigation<any>();
    const { decryptAES } = useEncryptDecrypt();
    const { getMemDetails } = useMemberLogin();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    useEffect(() => {
        getPersionalDetails();
    }, [isFocused]);
    const handleRefresh = () => {
        getMemDetails(true)
        getPersionalDetails();
        getMemDetails(true);
    }
    useHardwareBackHandler(() => {
        handleBack();
    })
    const getPersionalDetails = async () => {
        setLoadingData(true);
        try {
            const res: any = await ProfileService.kybkycInfoDetails();
            if (res?.ok) {
                setPersionalDetails(res?.data?.customerKycDetails);
                setKycDocuments(res?.data?.kycDocInfo || []);
                setLoadingData(false)
            }
            else {
                showAppToast(isErrorDispaly(res), 'error'); // Or 'info' if appropriate
                setLoadingData(false)
            }
        } catch (error) {
            showAppToast(isErrorDispaly(error), 'error');
            setLoadingData(false)
        }
    };
    const handleBack = () => {
        if (props?.route?.params?.navigation == "NewProfile") {
            navigation.navigate("NewProfile", { animation: 'slide_from_left' })
        } else {
            navigation.navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.HOME" });
        }
    };
    const handleSubmit = async () => {
        setBtnLoading(true);
        const Obj = {
            "customerId": userinfo?.id, "isKycComplete": true
        }
        try {
            const res = await ProfileService.updateKycStatus(Obj);
            if (res?.ok) {
                setBtnLoading(false);
                if (userinfo?.customerState != "Approved") {
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 1,
                            routes: [{ name: "AccountProgress" }],
                        })
                    );
                    return
                } else if (userinfo?.isInitialSubscriptionRequired && userinfo?.isSubscribed == false) {
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 1,
                            routes: [{ name: "PackageBuy" }],
                        })
                    );
                    return
                } else {
                    getMemDetails(true)
                    navigation.navigate('CompleteKyc');
                }
            } else {
                setBtnLoading(false);
                showAppToast(isErrorDispaly(res), 'error');
            }
        } catch (error) {
            setBtnLoading(false);
            showAppToast(isErrorDispaly(error), 'error');
        }
    }
    const handleEditPersionalInfo = () => {
        navigation.navigate('KycProfile', { animation: 'slide_from_left', customerId: persionalDetails?.id })
    }
    const handleEditIdentificationDocuments = () => {
        navigation.navigate('KycProfileStep2', { animation: 'slide_from_left', customerId: persionalDetails?.id })
    };
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {loadingData && <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}><DashboardLoader /></SafeAreaViewComponent>}
            {!loadingData && <Container style={commonStyles.container}>
                <PageHeader title={"GLOBAL_CONSTANTS.KYC_INFORMATION"} onBackPress={handleBack} isrefresh={true} onRefresh={handleRefresh} />
                <ScrollView showsVerticalScrollIndicator={false}>
                    <ViewComponent style={[commonStyles.rounded50, commonStyles.dflex, commonStyles.justifyend, commonStyles.alignCenter]}>
                        <ParagraphComponent text={userinfo?.kycStatus} style={[commonStyles.colorstatus, { color: statusColor[userinfo?.kycStatus?.toLowerCase()] }]} />
                    </ViewComponent>
                    <>
                        {(persionalDetails && !loadingData) &&
                            <ViewComponent>
                                {userinfo?.kycStatus == "Rejected" &&
                                    <ViewComponent style={[commonStyles.titleSectionGap, commonStyles.sectionStyle]}>
                                        <TextMultiLangauge text={"GLOBAL_CONSTANTS.NOTE"} />
                                        <TextMultiLangauge text={"GLOBAL_CONSTANTS.KYC_REJECTED_NOTE"} style={[commonStyles.textGrey]} />
                                    </ViewComponent>
                                }
                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.titleSectionGap, commonStyles.alignCenter]}>
                                    <ParagraphComponent style={[commonStyles.sectionTitle]} text={"GLOBAL_CONSTANTS.BASIC_INFORMATION_TITLE"} />
                                    {userinfo?.metadata?.kycType?.toLocaleLowerCase() !== "sumsub" && <CommonTouchableOpacity activeOpacity={0.8} onPress={handleEditPersionalInfo}>
                                        <ViewComponent style={[]}>
                                            <EditImage width={s(22)} height={s(22)} />
                                        </ViewComponent>
                                    </CommonTouchableOpacity>}

                                </ViewComponent>
                                <ViewComponent style={[commonStyles.sectionGap]}>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap, commonStyles.listbannerbg]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.FIRST_NAME"} />
                                        <ParagraphComponent style={[commonStyles.listprimarytext]} text={persionalDetails?.firstName || "--"} />
                                    </ViewComponent>
                                    {persionalDetails?.lastName && (<>  <ViewComponent style={[commonStyles.listitemGap]} />
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap, commonStyles.listbannerbg]}>
                                            <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.LAST_NAME"} />
                                            <ParagraphComponent style={[commonStyles.listprimarytext]} text={persionalDetails?.lastName || "--"} />
                                        </ViewComponent></>)}
                                    {persionalDetails?.gender && (<><ViewComponent style={[commonStyles.listitemGap]} />
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap, commonStyles.listbannerbg]}>
                                            <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.GENDER"} />
                                            <ParagraphComponent style={[commonStyles.listprimarytext]} text={persionalDetails?.gender || "--"} />
                                        </ViewComponent></>)}
                                    {persionalDetails?.dob && (<> <ViewComponent style={[commonStyles.listitemGap]} />
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap, commonStyles.listbannerbg]}>
                                            <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.DATE_OF_BIRTH"} />
                                            <ParagraphComponent style={[commonStyles.listprimarytext]} text={persionalDetails?.dob && formatDates(persionalDetails?.dob, dateFormates?.date) || '--'} />
                                        </ViewComponent></>)}
                                </ViewComponent>
                                {persionalDetails?.addressDetails?.firstName && <ViewComponent style={[commonStyles.dflex, commonStyles.justify, commonStyles.titleSectionGap]}>
                                    <ParagraphComponent style={[commonStyles.sectionTitle,]} text={"GLOBAL_CONSTANTS.ADDRESS"} />
                                </ViewComponent>}
                                <ViewComponent>
                                    {persionalDetails?.addressDetails?.firstName && <ViewComponent />}
                                    {persionalDetails?.addressDetails?.firstName && <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap, commonStyles.listbannerbg]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.FIRST_NAME"} />
                                        <ParagraphComponent style={[commonStyles.listprimarytext]} text={persionalDetails?.addressDetails?.firstName || "--"} />
                                    </ViewComponent>}
                                    {persionalDetails?.addressDetails?.lastName && <ViewComponent style={[commonStyles.listitemGap]} />}
                                    {persionalDetails?.addressDetails?.lastName && <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap, commonStyles.listbannerbg]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.LAST_NAME"} />
                                        <ParagraphComponent style={[commonStyles.listprimarytext]} text={persionalDetails?.addressDetails?.lastName || "--"} />
                                    </ViewComponent>}
                                    {persionalDetails?.addressDetails?.country && <ViewComponent style={[commonStyles.listitemGap]} />}
                                    {persionalDetails?.addressDetails?.country && <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap, commonStyles.listbannerbg]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.COUNTRY"} />
                                        <ParagraphComponent style={[commonStyles.listprimarytext]} text={persionalDetails?.addressDetails?.country || "--"} />
                                    </ViewComponent>}
                                    {persionalDetails?.addressDetails?.state && <ViewComponent style={[commonStyles.listitemGap]} />}
                                    {persionalDetails?.addressDetails?.state && <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap, commonStyles.listbannerbg]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.STATE"} />
                                        <ParagraphComponent style={[commonStyles.listprimarytext]} text={persionalDetails?.addressDetails?.state || "--"} />
                                    </ViewComponent>}
                                    {persionalDetails?.addressDetails?.town && <ViewComponent style={[commonStyles.listitemGap]} />}
                                    {persionalDetails?.addressDetails?.town && <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap, commonStyles.listbannerbg]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.TOWN"} />
                                        <ParagraphComponent style={[commonStyles.listprimarytext]} text={persionalDetails?.addressDetails?.town || "--"} />
                                    </ViewComponent>}
                                    {persionalDetails?.addressDetails?.city && <ViewComponent style={[commonStyles.listitemGap]} />}
                                    {persionalDetails?.addressDetails?.city && <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap, commonStyles.listbannerbg]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.CITY"} />
                                        <ParagraphComponent style={[commonStyles.listprimarytext]} text={persionalDetails?.addressDetails?.city || "--"} />
                                    </ViewComponent>}
                                    {persionalDetails?.addressDetails?.addressLine1 && <ViewComponent style={[commonStyles.listitemGap]} />}
                                    {persionalDetails?.addressDetails?.addressLine1 && <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap, commonStyles.listbannerbg]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.ADDRESS_LINE1"} />
                                        <ParagraphComponent style={[commonStyles.listprimarytext]} text={persionalDetails?.addressDetails?.addressLine1 || "--"} />
                                    </ViewComponent>}
                                    {persionalDetails?.addressDetails?.addressLine2 && <ViewComponent style={[commonStyles.listitemGap]} />}
                                    {persionalDetails?.addressDetails?.addressLine2 && <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap, commonStyles.listbannerbg]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.ADDRESS_LINE2"} />
                                        <ParagraphComponent style={[commonStyles.listprimarytext]} text={persionalDetails?.addressDetails?.addressLine2 || "--"} />
                                    </ViewComponent>}
                                    {persionalDetails?.addressDetails?.postalCode && <ViewComponent style={[commonStyles.listitemGap]} />}
                                    {persionalDetails?.addressDetails?.postalCode && <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap, commonStyles.listbannerbg]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.POSTAL_CODE"} />
                                        <ParagraphComponent style={[commonStyles.listprimarytext]} text={decryptAES(persionalDetails?.addressDetails?.postalCode || "") || "--"} />
                                    </ViewComponent>}
                                    {persionalDetails?.addressDetails?.phoneNumber && <ViewComponent style={[commonStyles.listitemGap]} />}
                                    {persionalDetails?.addressDetails?.phoneNumber && <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap, commonStyles.listbannerbg]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.PHONE_NUMBER"} />
                                        <ParagraphComponent style={[commonStyles.listprimarytext, commonStyles.flex1, commonStyles.textRight]} text={`${decryptAES(persionalDetails?.addressDetails?.phoneCode || "")} ${decryptAES(persionalDetails?.addressDetails?.phoneNumber || "")}` || "--"} />
                                    </ViewComponent>}
                                    {persionalDetails?.addressDetails?.email && <ViewComponent style={[commonStyles.listitemGap]} />}
                                    {persionalDetails?.addressDetails?.email && <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap, commonStyles.listbannerbg]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.EMAIL"} />
                                        <ParagraphComponent style={[commonStyles.listprimarytext]} text={`${decryptAES(persionalDetails?.addressDetails?.email)}` || "--"} />
                                    </ViewComponent>}
                                </ViewComponent>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.justify, commonStyles.titleSectionGap]}>
                                    <ParagraphComponent style={[commonStyles.sectionTitle,]} text={"GLOBAL_CONSTANTS.IDENTIFICATION_DOCUMNETS"} />
                                    {userinfo?.metadata?.kycType?.toLocaleLowerCase() !== "sumsub" && <CommonTouchableOpacity activeOpacity={0.8} onPress={() => handleEditIdentificationDocuments()}>
                                        <ViewComponent style={[]}>
                                            <EditImage width={s(22)} height={s(22)} />
                                        </ViewComponent>
                                    </CommonTouchableOpacity>}
                                </ViewComponent>
                                {kycDocuments.length > 0 ? (
                                    kycDocuments?.map((doc, index) => (
                                        <ViewComponent key={doc.id || index} style={[commonStyles.sectionGap]}>
                                            {doc?.documentType && <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap, commonStyles.listbannerbg]}>
                                                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.DOCUMENT_TYPE"} />
                                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={decryptAES(doc?.documentType) || "--"} />
                                            </ViewComponent>}

                                            {doc?.number && <ViewComponent style={[commonStyles.listitemGap]} />}
                                            {doc?.number && <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap, commonStyles.listbannerbg]}>
                                                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.DACUMENT_NUMBER"} />
                                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={decryptAES(doc?.number) || "--"} />
                                            </ViewComponent>}

                                            {doc?.expiryDate && <ViewComponent style={[commonStyles.listitemGap]} />}
                                            {doc?.expiryDate && <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap, commonStyles.listbannerbg]}>
                                                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.DOCUMENT_EXPIRY_DATE"} />
                                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={formatDates(doc?.expiryDate, dateFormates?.date) || "--"} />
                                            </ViewComponent>}

                                            {doc?.selfieImage && <ViewComponent style={[commonStyles.listitemGap]} />}
                                            {doc?.selfieImage && <FilePreview label={"GLOBAL_CONSTANTS.FACE_IMAGE"} uploadedImageUri={doc?.selfieImage} />}

                                            {doc?.frontImage && <ViewComponent style={[commonStyles.listitemGap]} />}
                                            {doc?.frontImage && <FilePreview label={"GLOBAL_CONSTANTS.FRONT_ID_PHOTO"} uploadedImageUri={doc?.frontImage} />}

                                            {doc?.backDocImage && <ViewComponent style={[commonStyles.listitemGap]} />}
                                            {doc?.backDocImage && <FilePreview label={"GLOBAL_CONSTANTS.BACK_ID_PHOTO"} uploadedImageUri={doc?.backDocImage} />}

                                            {doc?.handHoldingImage && <ViewComponent style={[commonStyles.listitemGap]} />}
                                            {doc?.handHoldingImage && <FilePreview label={"GLOBAL_CONSTANTS.HAND_HANDLING_ID_PHOTO"} uploadedImageUri={doc?.handHoldingImage} />}

                                            {doc?.singatureImage && <ViewComponent style={[commonStyles.listitemGap]} />}
                                            {doc?.singatureImage && <FilePreview label={"GLOBAL_CONSTANTS.SIGNATURE_PHOTO"} uploadedImageUri={doc?.singatureImage} />}
                                        </ViewComponent>
                                    ))
                                ) : (
                                    <NoDataComponent Description={"GLOBAL_CONSTANTS.NO_DATA_AVAILABLE"} />
                                )}

                            </ViewComponent>}
                        <ViewComponent style={[commonStyles.mt30]} />

                        {(userinfo?.kycStatus != "Submitted" && userinfo?.kycStatus != "Approved") &&
                            <ButtonComponent
                                title={"GLOBAL_CONSTANTS.SUBMIT"}
                                disable={undefined}
                                loading={btnLoading}
                                onPress={handleSubmit}
                            />
                        }
                        <ViewComponent style={commonStyles?.mb32} />
                    </>
                </ScrollView>
            </Container>}
        </ViewComponent>
    );
});
export default KycProfilePreview;

