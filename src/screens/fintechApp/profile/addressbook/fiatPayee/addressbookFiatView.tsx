import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, RefreshControl } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import AddressbookService from '../../../../../apiServices/profile/general/addressbook';
import { dateFormates, isErrorDispaly } from '../../../../../utils/helpers';
import { getThemedCommonStyles, statusColor } from '../../../../../components/CommonStyles';
import Container from '../../../../../components/container/container';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import DashboardLoader from '../../../../../components/loader';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import SafeAreaViewComponent from '../../../../../components/safeArea/safeArea';
import useEncryptDecrypt from '../../../../../hooks/encDecHook';
import { ms, s } from '../../../../../components/theme/scale';
import FilePreview from '../../../../../components/fileUpload/filePreview';
import PageHeader from '../../../../../components/pageHeader/pageHeader';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { t } from 'i18next';
import ViewComponent from '../../../../../components/view/view';
import TextMultiLanguage from '../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import { FormattedDateText } from '../../../../../components/textComponets/dateTimeText/dateTimeText';
import { useHardwareBackHandler } from '../../../../../hooks/backHandleHook';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import ProfileEditIcon from '../../../../../components/svgIcons/mainmenuicons/editicon';
import { StyleService } from '@ui-kitten/components';
import CustomRBSheet from '../../../../../components/models/commonBottomSheet';
import ActiveIcon from '../../../../../components/svgIcons/mainmenuicons/active';
import ButtonComponent from '../../../../../components/buttons/button';
import { showAppToast } from '../../../../../components/toasterMessages/ShowMessage';
import ScrollViewComponent from '../../../../../components/scrollView/scrollView';
const AddressbookFiatView = React.memo((props: any) => {
    const isFocused = useIsFocused();
    const [errormsg, setErrormsg] = useState<any>(null);
    const [addressbookSumrryObj, setAddressbookSumrryObj] = useState<any>({});
    const [loadingData, setLoadingData] = useState(false);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { decryptAES } = useEncryptDecrypt();
    const styles = screenStyle(NEW_COLOR);
    const navigation = useNavigation<any>();
    const confirmationSheetRef = useRef<any>();
    const [btnDtlLoading, setBtnDtlLoading] = useState(false);
    const [btnDisabled, setBtnDisabled] = useState(false);
    const [refresh, setRefresh] = useState<boolean>(false);

    useEffect(() => {
        getAddressbookSumarryDetails();
    }, [isFocused]);
    useHardwareBackHandler(() => {
        handleBackArrowAddressView();
    })

    const getAddressbookSumarryDetails = useCallback(async () => {
        setLoadingData(true)
        try {
            const res: any = await AddressbookService.getAddressbookFiatPayeeDetailsView(props?.route?.params?.id);
            if (res?.ok) {
                setAddressbookSumrryObj(res?.data);
                setLoadingData(false)
            }
            else {
                setErrormsg(isErrorDispaly(res));
                setLoadingData(false)
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setLoadingData(false)
        }
    }, [props?.route?.params?.id]);

    const handleBackArrowAddressView = useCallback(async () => {
        props?.navigation?.navigate('Addressbook');
    }, [props?.navigation]);

    const handleAddressbookFiatEdit = useCallback(() => {
        setErrormsg(null);
        if (addressbookSumrryObj?.whiteListState?.toLowerCase() === "approved") {
            return setErrormsg(`You can't modified ${addressbookSumrryObj?.whiteListState} payee.`);
        } else if (addressbookSumrryObj?.status?.toLowerCase() === 'inactive') {
            return setErrormsg("You can't modified inactive payee.");
        } else {
            navigation?.navigate("AccountDetails", {
                id: addressbookSumrryObj?.id,
                appName: addressbookSumrryObj.appName,
                walletCode: addressbookSumrryObj?.walletCode || addressbookSumrryObj?.walletcCode,
                accountType: addressbookSumrryObj?.recipientDetails?.["Account"]
            })
        }
    }, [addressbookSumrryObj, navigation]);

    const handleActiveOrInActive = useCallback(() => {
        confirmationSheetRef.current?.open();

    }, []);

    const onUseractiveinactiveSubmit = useCallback(async () => {
        // refRBSheet.current?.close();
        setBtnDtlLoading(true);
        setBtnDisabled(true);
        const statusType = addressbookSumrryObj?.status === "Active" ? "disable" : "enable";
        let obj = {
            id: addressbookSumrryObj?.id,
            tableName: "Common.PayeeAccounts",
            modifiedBy: addressbookSumrryObj?.name,
            info: "A full Description",
            status: addressbookSumrryObj?.status === "Active" ? "Inactive" : "Active",
            type: "Fiat"
        }
        const res: any = await AddressbookService.Useractiveinactive(addressbookSumrryObj?.id, statusType, obj);
        if (res?.ok) {
            showAppToast(
                `${t("GLOBAL_CONSTANTS.PAYEE")} ${addressbookSumrryObj?.status?.toLowerCase() === "active"
                    ? t("GLOBAL_CONSTANTS.INACTIVE")
                    : t("GLOBAL_CONSTANTS.ACTIVE")
                } ${t("GLOBAL_CONSTANTS.SUCCESSFULLY")}`,
                "success"
            ); confirmationSheetRef.current?.close();
            getAddressbookSumarryDetails();
            setBtnDtlLoading(false);
            setBtnDisabled(false);
        }
        else {
            setErrormsg(isErrorDispaly(res));
            setBtnDtlLoading(false);
            setBtnDisabled(false);
        }
    }, [addressbookSumrryObj, getAddressbookSumarryDetails]);
    const isValueLong = (addressbookSumrryObj?.kycDetails?.["Business Registration Number"] || addressbookSumrryObj?.businessRegistrationNo)?.length > 15
    const onRefresh = useCallback(async () => {
        setRefresh(true);
        try {
            await getAddressbookSumarryDetails();
        } finally {
            setRefresh(false);
        }
    }, [getAddressbookSumarryDetails]);
    return (
        <View style={[commonStyles.flex1, commonStyles.screenBg]}>
            {loadingData && <SafeAreaViewComponent> <DashboardLoader /> </SafeAreaViewComponent>}
            {!loadingData && <Container style={commonStyles.container}>
                <PageHeader title={"GLOBAL_CONSTANTS.FIAT_VIEW"} onBackPress={handleBackArrowAddressView} />
                <ScrollViewComponent showsVerticalScrollIndicator={false} refreshing={refresh} onRefresh={onRefresh} >
                    {errormsg && <><ErrorComponent message={errormsg} onClose={() => setErrormsg(null)} /><View style={commonStyles.mb24} /></>}
                    {(addressbookSumrryObj && !loadingData) &&

                        <View>


                            <View style={[commonStyles.titleSectionGap, commonStyles.dflex, commonStyles.justifyContent]}>
                                <ViewComponent>
                                    <ParagraphComponent style={[commonStyles.sectionTitle]} text={"GLOBAL_CONSTANTS.FIAT_RECIPIENT"} />
                                </ViewComponent>
                                <ViewComponent
                                    style={[
                                        commonStyles.dflex,
                                        commonStyles.flexRow,
                                        commonStyles.justifyend, // Align to right side
                                        commonStyles.alignCenter,
                                        { gap: s(15), paddingRight: s(2) }  // Add small spacing between icons
                                    ]}
                                >
                                    {/* --- Edit Button --- */}
                                    {addressbookSumrryObj?.isEditable && (<TouchableOpacity onPress={handleAddressbookFiatEdit}>
                                        <ViewComponent
                                            style={[
                                                commonStyles.dflex,
                                                commonStyles.alignCenter,
                                                commonStyles.justifyCenter,
                                            ]}
                                        >
                                            <ViewComponent
                                                style={[
                                                    styles.edit,
                                                    commonStyles.dflex,
                                                    commonStyles.justifyCenter,
                                                    commonStyles.alignCenter,
                                                ]}
                                            >
                                                <ProfileEditIcon width={s(18)} height={s(18)} />
                                            </ViewComponent>

                                        </ViewComponent>
                                        {/* <ViewComponent>
                                        <ParagraphComponent
                                            text={"Edit"}
                                            style={[
                                                commonStyles.fs14,
                                                commonStyles.fw500,
                                                commonStyles.textWhite,
                                            ]}
                                        />
                                    </ViewComponent> */}
                                    </TouchableOpacity>)}

                                    {/* --- Block Button --- */}
                                    <TouchableOpacity onPress={handleActiveOrInActive}>
                                        <ViewComponent
                                            style={[
                                                commonStyles.dflex,
                                                commonStyles.alignCenter,
                                                commonStyles.justifyCenter,
                                            ]}
                                        >
                                            <ViewComponent
                                                style={[
                                                    styles.edit,
                                                    commonStyles.dflex,
                                                    commonStyles.justifyCenter,
                                                    commonStyles.alignCenter,
                                                ]}
                                            >
                                                <MaterialIcons
                                                    name="block"
                                                    size={s(22)}
                                                    color={NEW_COLOR.TEXT_WHITE}
                                                />
                                            </ViewComponent>

                                        </ViewComponent>
                                    </TouchableOpacity>
                                </ViewComponent>

                            </View>
                            <View style={[commonStyles.sectionGap]}>
                                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap, commonStyles.gap8, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.FAVORITE_NAME"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookSumrryObj?.recipientDetails?.["Favorite Name"] || addressbookSumrryObj?.favouriteName || "--"} />
                                </View>
                                <View style={[commonStyles.listitemGap]} />
                                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap, commonStyles.gap8, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.ACCOUNTT"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={(addressbookSumrryObj?.recipientDetails?.["Account"] || addressbookSumrryObj?.accountType || "--").charAt(0).toUpperCase() + (addressbookSumrryObj?.recipientDetails?.["Account"] || addressbookSumrryObj?.accountType || "--").slice(1).toLowerCase()} />
                                </View>

                                <View style={[commonStyles.listitemGap]} />
                                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap, commonStyles.gap8, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.TRANSFER"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookSumrryObj?.recipientDetails?.["Transfer"] || addressbookSumrryObj?.accountType || "--"} />
                                </View>

                                {addressbookSumrryObj?.recipientDetails?.["Business Name"] && <View style={[commonStyles.listitemGap]} />}

                                {addressbookSumrryObj?.recipientDetails?.["Business Name"] && <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.BUSSINESS_NAME"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookSumrryObj?.recipientDetails?.["Business Name"] || addressbookSumrryObj?.businessName || "--"} />
                                </View>}
                                {(addressbookSumrryObj?.recipientDetails?.["First Name"] || addressbookSumrryObj?.firstName) && <View style={[commonStyles.listitemGap]} />}
                                {(addressbookSumrryObj?.recipientDetails?.["First Name"] || addressbookSumrryObj?.firstName) && <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.FIRST_NAME"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookSumrryObj?.recipientDetails?.["First Name"] || addressbookSumrryObj?.firstName} />
                                </View>}
                                {(addressbookSumrryObj?.recipientDetails?.["Last Name"] || addressbookSumrryObj?.lastName) && <View style={[commonStyles.listitemGap]} />}
                                {(addressbookSumrryObj?.recipientDetails?.["Last Name"] || addressbookSumrryObj?.lastName) && <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.LAST_NAME"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookSumrryObj?.recipientDetails?.["Last Name"] || addressbookSumrryObj?.lastName} />
                                </View>}
                                {addressbookSumrryObj?.middleName && <View style={[commonStyles.listitemGap]} />}
                                {addressbookSumrryObj?.middleName && <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.MIDLE_NAME"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookSumrryObj?.middleName} />
                                </View>}
                                {(addressbookSumrryObj?.recipientDetails?.["Date Of Birth"] || addressbookSumrryObj?.birthDate) && <View style={[commonStyles.listitemGap]} />}
                                {(addressbookSumrryObj?.recipientDetails?.["Date Of Birth"] || addressbookSumrryObj?.birthDate) && <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.BIRTH_DATE"} />
                                    <FormattedDateText value={addressbookSumrryObj?.recipientDetails?.["Date Of Birth"] || addressbookSumrryObj?.birthDate || "--"} dateFormat={dateFormates.date} style={[commonStyles.listprimarytext]} />
                                </View>}
                                {(addressbookSumrryObj?.recipientDetails?.["Email"] || addressbookSumrryObj?.email) && <View style={[commonStyles.listitemGap]} />}
                                {(addressbookSumrryObj?.recipientDetails?.["Email"] || addressbookSumrryObj?.email) && <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.E_MAIL"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={decryptAES(addressbookSumrryObj?.recipientDetails?.["Email"] || addressbookSumrryObj?.email)} />
                                </View>}


                                {(addressbookSumrryObj?.recipientDetails?.["Phone Number"] || addressbookSumrryObj?.phoneNumber) && <View style={[commonStyles.listitemGap]} />}
                                {(addressbookSumrryObj?.recipientDetails?.["Phone Number"] || addressbookSumrryObj?.phoneNumber) && <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.PHONE_NUMBER"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={decryptAES(addressbookSumrryObj?.recipientDetails?.["Phone Code"] || addressbookSumrryObj?.phoneCode) + " " + decryptAES(addressbookSumrryObj?.recipientDetails?.["Phone Number"] || addressbookSumrryObj?.phoneNumber)} />
                                </View>}

                                <View style={[commonStyles.listitemGap]} />
                                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.CURRENCY"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookSumrryObj?.recipientDetails?.["Currency"] || addressbookSumrryObj?.walletCode || addressbookSumrryObj?.walletcCode || addressbookSumrryObj?.currency || "--"} />
                                </View>
                                {(addressbookSumrryObj?.recipientDetails?.["Relation"]) && <View style={[commonStyles.listitemGap]} />}
                                {(addressbookSumrryObj?.recipientDetails?.["Relation"]) && <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.RELATION"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookSumrryObj?.recipientDetails?.["Relation"] || "--"} />
                                </View>}
                                {(addressbookSumrryObj?.recipientDetails?.["Relation Code"]) && <View style={[commonStyles.listitemGap]} />}
                                {(addressbookSumrryObj?.recipientDetails?.["Relation Code"]) && <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.RELATION_CODE"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookSumrryObj?.recipientDetails?.["Relation Code"] || "--"} />
                                </View>}
                            </View>

                            {/* {(addressbookSumrryObj?.addressDetails || addressbookSumrryObj?.line1 || addressbookSumrryObj?.country || addressbookSumrryObj?.state || addressbookSumrryObj?.city || addressbookSumrryObj?.postalCode) && <View style={[commonStyles.titleSectionGap]}>
                                <ParagraphComponent style={[commonStyles.sectionTitle]} text={"GLOBAL_CONSTANTS.ADDRESS_DETAILS"} />
                            </View>} */}
                            {(addressbookSumrryObj?.addressDetails || addressbookSumrryObj?.line1 || addressbookSumrryObj?.country || addressbookSumrryObj?.state || addressbookSumrryObj?.city || addressbookSumrryObj?.postalCode) && <View style={[commonStyles.sectionGap]}>
                                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.STREET"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookSumrryObj?.addressDetails?.["Street"] || addressbookSumrryObj?.line1 || addressbookSumrryObj?.Street || "--"} />
                                </View>
                                <View style={[commonStyles.listitemGap]} />
                                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.COUNTRY"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookSumrryObj?.addressDetails?.["Country"] || addressbookSumrryObj?.country || "--"} />
                                </View>
                                <View style={[commonStyles.listitemGap]} />
                                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.STATE"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookSumrryObj?.addressDetails?.["State"] || addressbookSumrryObj?.state || "--"} />
                                </View>
                                <View style={[commonStyles.listitemGap]} />
                                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.CITY"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookSumrryObj?.addressDetails?.["City"] || addressbookSumrryObj?.city || "--"} />
                                </View>
                                <View style={[commonStyles.listitemGap]} />
                                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.POSTAL_CODE"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookSumrryObj?.addressDetails?.["Postal Code"] || addressbookSumrryObj?.postalCode || "--"} />
                                </View>
                                <View style={[commonStyles.listitemGap]} />
                                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"Status"} />
                                    <ParagraphComponent
                                        style={[
                                            commonStyles.listprimarytext,
                                            {
                                                color:
                                                    addressbookSumrryObj?.status?.toLowerCase() === 'inactive'
                                                        ? NEW_COLOR.TEXT_RED
                                                        : statusColor[addressbookSumrryObj?.status?.toLowerCase()] || NEW_COLOR.TEXT_WHITE,
                                            },
                                        ]}
                                        text={addressbookSumrryObj?.status ? addressbookSumrryObj?.status : '--'}
                                    />
                                </View>


                                <View style={[commonStyles.listitemGap]} />
                                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"WhiteList State"} />
                                    <ParagraphComponent
                                        style={[
                                            commonStyles.listprimarytext,
                                            {
                                                color:
                                                    addressbookSumrryObj?.whiteListState?.toLowerCase() === 'rejected' || addressbookSumrryObj?.status?.toLowerCase() === 'inactive'
                                                        ? NEW_COLOR.TEXT_RED
                                                        : statusColor[addressbookSumrryObj?.whiteListState?.toLowerCase()] || NEW_COLOR.TEXT_WHITE,
                                            },
                                        ]}
                                        text={addressbookSumrryObj?.whiteListState || "--"}
                                    />
                                </View>

                            </View>}

                            {(addressbookSumrryObj?.paymentInfo && !loadingData) &&
                                <View style={[]}>
                                    <ParagraphComponent style={[commonStyles.sectionTitle, commonStyles.listitemGap]} text={"GLOBAL_CONSTANTS.BANK_ACCOUNT"} />
                                </View>}
                            {(addressbookSumrryObj?.paymentInfo && !loadingData) &&
                                <View>
                                    <View>
                                        {addressbookSumrryObj?.paymentInfo &&
                                            Object.entries(addressbookSumrryObj.paymentInfo)?.map(([key, value]) => {
                                                if (!value) return null;
                                                return (
                                                    <View
                                                        key={key}
                                                        style={[
                                                            commonStyles.dflex,
                                                            commonStyles.justifyContent,
                                                            commonStyles.alignCenter,
                                                            commonStyles.gap8,
                                                            commonStyles.flexWrap,
                                                            commonStyles.listitemGap
                                                        ]}
                                                    >
                                                        <ParagraphComponent
                                                            style={[commonStyles.listsecondarytext]}
                                                            text={key}
                                                        />
                                                        <ParagraphComponent
                                                            style={[commonStyles.listprimarytext]}
                                                            text={value}
                                                        />
                                                    </View>
                                                );
                                            })}
                                    </View>

                                    <View>
                                        {addressbookSumrryObj?.paymentInfo?.channelsubject &&
                                            <View style={[commonStyles.listitemGap]} />}
                                        {addressbookSumrryObj?.paymentInfo?.channelsubject &&
                                            <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.SERVICE_PROVIDER"} />
                                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookSumrryObj?.paymentInfo?.channelsubject || "--"} />
                                            </View>}
                                        {(addressbookSumrryObj?.paymentInfo?.["Target Name"] || addressbookSumrryObj?.paymentInfo?.targetName) &&
                                            <View style={[commonStyles.listitemGap]} />}
                                        {(addressbookSumrryObj?.paymentInfo?.["Target Name"] || addressbookSumrryObj?.paymentInfo?.targetName) &&
                                            <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.TARGET_NAME"} />
                                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookSumrryObj?.paymentInfo?.["Target Name"] || addressbookSumrryObj?.paymentInfo?.targetName || "--"} />
                                            </View>}
                                        {(addressbookSumrryObj?.paymentInfo?.["Targetlastname"] || addressbookSumrryObj?.paymentInfo?.targetLastName) &&
                                            <View style={[commonStyles.listitemGap]} />}
                                        {(addressbookSumrryObj?.paymentInfo?.["Targetlastname"] || addressbookSumrryObj?.paymentInfo?.targetLastName) &&
                                            <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.TARGET_LAST_NAME"} />
                                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookSumrryObj?.paymentInfo?.["Targetlastname"] || addressbookSumrryObj?.paymentInfo?.targetLastName} />
                                            </View>}
                                        {(addressbookSumrryObj?.paymentInfo?.["Targetemail"] || addressbookSumrryObj?.paymentInfo?.targetEmail) &&
                                            <View style={[commonStyles.listitemGap]} />}
                                        {(addressbookSumrryObj?.paymentInfo?.["Targetemail"] || addressbookSumrryObj?.paymentInfo?.targetEmail) &&
                                            <View style={[commonStyles.dflex, commonStyles.justifyContent]}>
                                                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.TARGET_EMAIL"} />
                                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookSumrryObj?.paymentInfo?.["Targetemail"] || addressbookSumrryObj?.paymentInfo?.targetEmail} />
                                            </View>}
                                        {(addressbookSumrryObj?.paymentInfo?.["Targetdocument"] || addressbookSumrryObj?.paymentInfo?.targetDocument) &&
                                            <View style={[commonStyles.listitemGap]} />}
                                        {(addressbookSumrryObj?.paymentInfo?.["Targetdocument"] || addressbookSumrryObj?.paymentInfo?.targetDocument) &&
                                            <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.TARGET_DOCUMENT"} />
                                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookSumrryObj?.paymentInfo?.["Targetdocument"] || addressbookSumrryObj?.paymentInfo?.targetDocument} />
                                            </View>}
                                        {(addressbookSumrryObj?.paymentInfo?.["Bank Code"]) &&
                                            <View style={[commonStyles.listitemGap]} />}
                                        {(addressbookSumrryObj?.paymentInfo?.["Bank Code"]) &&
                                            <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.TARGET_BANK_CODE"} />
                                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookSumrryObj?.paymentInfo?.["Targetbankcode"] || addressbookSumrryObj?.paymentInfo?.targetBankCode || (addressbookSumrryObj?.paymentInfo?.["Bank Code"])} />
                                            </View>}
                                        {(addressbookSumrryObj?.paymentInfo?.["Targetbankbranchid"] || addressbookSumrryObj?.paymentInfo?.targetBankBranchId) &&
                                            <View style={[commonStyles.listitemGap]} />}
                                        {(addressbookSumrryObj?.paymentInfo?.["Targetbankbranchid"] || addressbookSumrryObj?.paymentInfo?.targetBankBranchId) &&
                                            <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.TARGET_BANK_BRANCH_ID"} />
                                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookSumrryObj?.paymentInfo?.["Targetbankbranchid"] || addressbookSumrryObj?.paymentInfo?.targetBankBranchId} />
                                            </View>}
                                        {(addressbookSumrryObj?.paymentInfo?.["Target Bank Account ID"] || addressbookSumrryObj?.paymentInfo?.targetBankAccountId) &&
                                            <View style={[commonStyles.listitemGap]} />}
                                        {(addressbookSumrryObj?.paymentInfo?.["Target Bank Account ID"] || addressbookSumrryObj?.paymentInfo?.targetBankAccountId) &&
                                            <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.TARGET_CLABE_NUMBER"} />
                                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookSumrryObj?.paymentInfo?.["Target Bank Account ID"] || addressbookSumrryObj?.paymentInfo?.targetBankAccountId} />
                                            </View>}
                                        {(addressbookSumrryObj?.paymentInfo?.["Targetbankid"] || addressbookSumrryObj?.paymentInfo?.targetBankId) &&
                                            <View style={[commonStyles.listitemGap]} />}
                                        {(addressbookSumrryObj?.paymentInfo?.["Targetbankid"] || addressbookSumrryObj?.paymentInfo?.targetBankId) &&
                                            <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.TARGET_BANK_ID"} />
                                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookSumrryObj?.paymentInfo?.["Targetbankid"] || addressbookSumrryObj?.paymentInfo?.targetBankId} />
                                            </View>}
                                        {(addressbookSumrryObj?.paymentInfo?.["Iban"]) &&
                                            <View style={[commonStyles.listitemGap]} />}
                                        {(addressbookSumrryObj?.paymentInfo?.["Iban"]) &&
                                            <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.IBAN"} />
                                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookSumrryObj?.paymentInfo?.["Iban"] || "--"} />
                                            </View>}

                                        {(addressbookSumrryObj?.paymentInfo?.["Walletaddress"]) &&
                                            <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.WALLET_ADDRESS"} />
                                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookSumrryObj?.paymentInfo?.["Walletaddress"] || "--"} />
                                            </View>}

                                    </View>
                                </View>}

                            {addressbookSumrryObj?.kycDetails && Object.values(addressbookSumrryObj.kycDetails).some((value: any) => value && value?.trim() !== "") && (<View>
                                <ParagraphComponent style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} text={"GLOBAL_CONSTANTS.ADDITIONAL_INFORM"} />
                            </View>)}
                            <View>
                                {(addressbookSumrryObj?.kycDetails?.["Document Type"] || addressbookSumrryObj?.documentType) && <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.DOCUMENT_TYPE"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookSumrryObj?.kycDetails?.["Document Type"] || addressbookSumrryObj?.documentType || "--"} />
                                </View>}
                                {(addressbookSumrryObj?.kycDetails?.["Document Number"] || addressbookSumrryObj?.documentNumber) && <View style={[commonStyles.listitemGap]} />}
                                {(addressbookSumrryObj?.kycDetails?.["Document Number"] || addressbookSumrryObj?.documentNumber) && <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.DACUMENT_NUMBER"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookSumrryObj?.kycDetails?.["Document Number"] || addressbookSumrryObj?.documentNumber} />
                                </View>}
                                {(addressbookSumrryObj?.kycDetails?.["Front Image"]?.url || addressbookSumrryObj?.frontImage?.url) && <View style={[commonStyles.listitemGap]} />}
                                {(addressbookSumrryObj?.kycDetails?.["Front Image"]?.url || addressbookSumrryObj?.frontImage?.url) && <View style={[commonStyles.gap16]}>
                                    <View style={[commonStyles.flex1,]}>
                                        <FilePreview label={"GLOBAL_CONSTANTS.FROND_SIDE"} uploadedImageUri={addressbookSumrryObj?.kycDetails?.["Front Image"]?.url || addressbookSumrryObj?.frontImage?.url} labelColor={NEW_COLOR.TEXT_link} />
                                    </View>
                                </View>}
                                {(addressbookSumrryObj?.kycDetails?.["Back Image"]?.url || addressbookSumrryObj?.backImage?.url) && <View style={[commonStyles.listitemGap]} />}
                                {(addressbookSumrryObj?.kycDetails?.["Back Image"]?.url || addressbookSumrryObj?.backImage?.url) && <View style={[commonStyles.gap16]}>
                                    <View style={[commonStyles.flex1,]}>
                                        <FilePreview label={"GLOBAL_CONSTANTS.BACK_SIDE"} uploadedImageUri={addressbookSumrryObj?.kycDetails?.["Back Image"]?.url || addressbookSumrryObj?.backImage?.url} labelColor={NEW_COLOR.TEXT_link} />

                                    </View>
                                </View>}
                                {(addressbookSumrryObj?.kycDetails?.["Business Type"] || addressbookSumrryObj?.businessType) && <View style={[commonStyles.listitemGap]} />}
                                {(addressbookSumrryObj?.kycDetails?.["Business Type"] || addressbookSumrryObj?.businessType) && <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.BUSINESS_TYPE"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookSumrryObj?.kycDetails?.["Business Type"] || addressbookSumrryObj?.businessType} />
                                </View>}
                                {(addressbookSumrryObj?.kycDetails?.["Business Registration Number"] || addressbookSumrryObj?.businessRegistrationNo) && <View style={[commonStyles.listitemGap]} />}
                                {(addressbookSumrryObj?.kycDetails?.["Business Registration Number"] || addressbookSumrryObj?.businessRegistrationNo) && <View style={[commonStyles.dflex, isValueLong ? { flexDirection: 'column', alignItems: 'flex-start' } : commonStyles.justifyContent]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.BUSINESS_REGISTRATION_NUMBER"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext, isValueLong ? commonStyles.mt6 : null]} text={addressbookSumrryObj?.kycDetails?.["Business Registration Number"] || addressbookSumrryObj?.businessRegistrationNo} />
                                </View>}
                                <View style={[commonStyles.listitemGap]} />


                                {addressbookSumrryObj?.providerDetails?.Banks && <View style={[commonStyles.bgnote, commonStyles.titleSectionGap]}>
                                    <ParagraphComponent style={[commonStyles.primarytext]} text={"GLOBAL_CONSTANTS.BANKS"} />
                                    <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textlinkgrey]} text={addressbookSumrryObj?.providerDetails?.Banks || "--"} />
                                </View>}
                                {addressbookSumrryObj?.providerDetails?.Payments && <View style={[commonStyles.bgnote, commonStyles.titleSectionGap]}>
                                    <ParagraphComponent style={[commonStyles.primarytext]} text={"GLOBAL_CONSTANTS.PAYMENTS"} />
                                    <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textlinkgrey]} text={addressbookSumrryObj?.providerDetails?.Payments || "-kjdjfghaksgf-"} />
                                </View>}

                                {addressbookSumrryObj?.note && (<ViewComponent style={[commonStyles.bgnote, commonStyles.listitemGap]}>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.gap8]}>

                                        <ViewComponent>
                                            <MaterialIcons name="info-outline" size={s(18)} color={NEW_COLOR.NOTE_ICON} />
                                        </ViewComponent>
                                        <ViewComponent style={[commonStyles.flex1]}>
                                            <TextMultiLanguage style={[commonStyles.bgNoteText]} text={`${t("GLOBAL_CONSTANTS.NOTE")}  ${addressbookSumrryObj?.note}` || ""} />
                                        </ViewComponent>
                                    </ViewComponent>
                                </ViewComponent>)}
                                {addressbookSumrryObj?.rejectReason && <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                    <ParagraphComponent style={[commonStyles.listsecondarytext]} text={t("GLOBAL_CONSTANTS.REASON")} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext, commonStyles.textError]} text={addressbookSumrryObj?.rejectReason || ""} />
                                </View>}

                            </View>
                        </View>
                    }
                    <CustomRBSheet title={'GLOBAL_CONSTANTS.CONFIRM_ACTIVE_INACTIVE'} refRBSheet={confirmationSheetRef} height={"Small"} onClose={() => { }} >
                        <ViewComponent style={[commonStyles.sheetbg]}>
                            <ViewComponent>
                                {errormsg && <ErrorComponent message={errormsg} onClose={() => setErrormsg("")} />}
                                <ViewComponent style={[commonStyles.mxAuto]}>
                                    <ActiveIcon width={s(50)} height={s(50)} />
                                </ViewComponent>
                                <ParagraphComponent
                                    text={`${t("GLOBAL_CONSTANTS.DO_YOU_WANT_TO")} ${t(addressbookSumrryObj?.status === "Active" ? "GLOBAL_CONSTANTS.INACTIVE" : "GLOBAL_CONSTANTS.ACTIVE")} ?`}
                                    style={[commonStyles.sectionTitle, commonStyles.textCenter, commonStyles.mt20]}
                                />
                                <ViewComponent style={[commonStyles.sectionGap]} />
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                                    <ViewComponent style={[commonStyles.flex1]}>
                                        <ButtonComponent title={t("GLOBAL_CONSTANTS.NO")} onPress={() => confirmationSheetRef.current?.close()} solidBackground={true} disable={btnDtlLoading} />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.flex1]}>
                                        <ButtonComponent title={t("GLOBAL_CONSTANTS.YES")} onPress={onUseractiveinactiveSubmit} loading={btnDtlLoading} disable={btnDisabled} />
                                    </ViewComponent>

                                </ViewComponent>
                                <ViewComponent style={commonStyles.mb24} />
                            </ViewComponent>
                        </ViewComponent>
                    </CustomRBSheet>
                </ScrollViewComponent>

            </Container>}
        </View>
    );
});

export default AddressbookFiatView;

const screenStyle = (NEW_COLOR: any) => StyleService.create({
    searchIcon: {
        marginTop: 4,
        width: ms(22),
        height: ms(22), position: 'absolute', right: 12
    },
    initialsCircle: {
        width: s(32),
        height: s(32),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.CIRCLE_BG,

    },
    edit: {
        width: s(40),
        height: s(40),
        borderRadius: s(100) / 2,
        backgroundColor: NEW_COLOR.CIRCLE_BG,

    },
});
