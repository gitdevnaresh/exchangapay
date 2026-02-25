import React, { useMemo } from "react";
import { useNavigation } from '@react-navigation/native';
import { dateFormates } from '../../../../../utils/helpers';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import Container from '../../../../../components/container/container';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import useEncryptDecrypt from '../../../../../hooks/encDecHook';
import PageHeader from '../../../../../components/pageHeader/pageHeader';
import FilePreview from '../../../../../components/fileUpload/filePreview';
import { FormattedDateText } from '../../../../../components/textComponets/dateTimeText/dateTimeText';
import ViewComponent from '../../../../../components/view/view';
import ScrollViewComponent from '../../../../../components/scrollView/scrollView';
import { useLngTranslation } from '../../../../../hooks/languagesHook/useLngTranslation';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';

const KybView = React.memo((props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
    const { decryptAES } = useEncryptDecrypt();
    const navigation = useNavigation<any>();
    const { t } = useLngTranslation();

    const bindata = props?.route?.params?.bindata;
    const pageHeaderTitleKey = props?.route?.params?.pageHeaderTitleKey;

    const handleBackArrowAddressView = async () => {
        navigation.goBack();
    };

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={commonStyles.container}>
                <PageHeader title={pageHeaderTitleKey ? t(pageHeaderTitleKey) : t("GLOBAL_CONSTANTS.VIEW")} onBackPress={handleBackArrowAddressView} />
                <ScrollViewComponent showsVerticalScrollIndicator={false}>
                    <ViewComponent>
                        <ViewComponent style={[commonStyles.sectionGap]}>
                            {/* First Name */}
                            {bindata?.uboPosition && (
                                <>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.POSITION"} />
                                        <ParagraphComponent style={[commonStyles.listprimarytext]} text={bindata.uboPosition} />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.listGap]} />
                                </>
                            )}
                            {bindata?.firstName && (
                                <>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.FIRST_NAME"} />
                                        <ParagraphComponent style={[commonStyles.listprimarytext]} text={bindata.firstName} />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.listGap]} />
                                </>
                            )}
                            {/* Middle Name */}
                            {bindata?.middleName && (
                                <>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.MIDLE_NAME"} />
                                        <ParagraphComponent style={[commonStyles.listprimarytext]} text={bindata.middleName} />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.listGap]} />
                                </>
                            )}
                            {/* Last Name */}
                            {bindata?.lastName && (
                                <>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.LAST_NAME"} />
                                        <ParagraphComponent style={[commonStyles.listprimarytext]} text={bindata.lastName} />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.listGap]} />
                                </>
                            )}
                            {/* Date of Birth */}
                            {bindata?.dob && (
                                <>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.BIRTH_DATE"} />
                                        {bindata?.dob && <FormattedDateText value={bindata?.dob} conversionType='UTC-to-local' dateFormat={dateFormates.date} style={[commonStyles.listprimarytext]} />}
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.listGap]} />
                                </>
                            )}
                            {/* Email */}
                            {bindata?.email && (
                                <>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.E_MAIL"} />
                                        <ParagraphComponent style={[commonStyles.listprimarytext]} text={decryptAES(bindata.email)} />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.listGap]} />
                                </>
                            )}
                            {/* Phone Number */}
                            {bindata?.phoneNumber && (
                                <>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.PHONE_NUMBER"} />
                                        <ParagraphComponent style={[commonStyles.listprimarytext]} text={` ${decryptAES(bindata.phoneCode)} ${decryptAES(bindata.phoneNumber)}`} />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.listGap]} />
                                </>
                            )}
                            {/* Country */}
                            {bindata?.country && (
                                <>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.COUNTRY"} />
                                        <ParagraphComponent style={[commonStyles.listprimarytext]} text={bindata.country} />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.listGap]} />
                                </>
                            )}
                            {/* Shareholder Percentage */}
                            {typeof bindata?.shareHolderPercentage === "number" && (
                                <>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.SHARE_HOLDER_PERCENTAGE"} />
                                        <ParagraphComponent style={[commonStyles.listprimarytext]} text={`${bindata.shareHolderPercentage}%`} />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.listGap]} />
                                </>
                            )}
                            {/* Created Date */}
                            {bindata?.createdDate && (
                                <>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.CREATED_DATE"} />
                                        {bindata?.createdDate && <FormattedDateText value={bindata?.createdDate} conversionType='UTC-to-local' dateFormat={dateFormates.date} style={[commonStyles.listprimarytext]} />}
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.listGap]} />
                                </>
                            )}
                            {/* Document Details */}
                            {bindata?.docDetails && (
                                <>
                                    <ViewComponent style={[commonStyles.titleSectionGap]}>
                                        <ParagraphComponent style={[commonStyles.sectionTitle]} text={"GLOBAL_CONSTANTS.DOCUMENTS"} />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.sectionGap]}>
                                        {/* Document Type */}
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                                            <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.DOCUMENT_TYPE"} />
                                            <ParagraphComponent style={[commonStyles.listprimarytext]} text={bindata?.docDetails?.type || '--'} />
                                        </ViewComponent>
                                        {bindata?.docDetails?.number && (<><ViewComponent style={[commonStyles.listitemGap]} />

                                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                                                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.DOCUMENT_NUMBER"} />
                                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={decryptAES(bindata?.docDetails?.number) || '--'} />
                                            </ViewComponent></>)}
                                        {bindata?.docDetails?.expiryDate && (<> <ViewComponent style={[commonStyles.listitemGap]} />

                                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                                                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.DOCUMENT_EXPIRY_DATE"} />
                                                {bindata?.docDetails?.expiryDate && <FormattedDateText value={bindata?.docDetails?.expiryDate} conversionType='UTC-to-local' dateFormat={dateFormates.date} style={[commonStyles.listprimarytext]} />}
                                            </ViewComponent></>)}
                                        <ViewComponent style={[commonStyles.listitemGap]} />
                                        {bindata.docDetails?.frontImage && (
                                            <ViewComponent style={{ marginVertical: 8 }}>
                                                <FilePreview label={"GLOBAL_CONSTANTS.FROND_SIDE"} uploadedImageUri={bindata.docDetails?.frontImage} labelColor={NEW_COLOR.TEXT_link} />
                                            </ViewComponent>
                                        )}
                                        {/* Back Image */}
                                        {bindata.docDetails?.backImage && (
                                            <ViewComponent style={{ marginVertical: 8 }}>
                                                <FilePreview label={"GLOBAL_CONSTANTS.BACK_SIDE"} uploadedImageUri={bindata.docDetails?.backImage} labelColor={NEW_COLOR.TEXT_link} />
                                            </ViewComponent>
                                        )}
                                    </ViewComponent>
                                </>
                            )}
                        </ViewComponent>
                    </ViewComponent>
                </ScrollViewComponent>
            </Container>
        </ViewComponent>
    );
});

export default KybView;
