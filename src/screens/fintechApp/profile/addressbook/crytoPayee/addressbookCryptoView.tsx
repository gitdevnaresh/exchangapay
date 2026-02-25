
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, ScrollView, Alert, Clipboard, Share, TouchableOpacity, RefreshControl } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { isErrorDispaly } from '../../../../../utils/helpers';
import AddressbookService from '../../../../../apiServices/profile/general/addressbook';
import { getThemedCommonStyles, statusColor } from '../../../../../components/CommonStyles';
import Container from '../../../../../components/container/container';
import { ms, s } from '../../../../../constants/styels/scale';
import CopyCard from '../../../../../components/copyIcon/CopyCard';
import QRCode from 'react-native-qrcode-svg'
import { useLngTranslation } from '../../../../../hooks/languagesHook/useLngTranslation';
import ButtonComponent from '../../../../../components/buttons/button';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import DashboardLoader from '../../../../../components/loader';
import ViewComponent from '../../../../../components/view/view';
import Feather from '@expo/vector-icons/Feather';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import PageHeader from '../../../../../components/pageHeader/pageHeader';
import { useHardwareBackHandler } from '../../../../../hooks/backHandleHook';
import TextMultiLanguage from '../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import { MaterialIcons } from '@expo/vector-icons';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import ProfileEditIcon from '../../../../../components/svgIcons/mainmenuicons/editicon';
import { StyleService } from '@ui-kitten/components';
import { ADD_BOOK_CONST } from '../constants';
import { showAppToast } from '../../../../../components/toasterMessages/ShowMessage';
import CustomRBSheet from '../../../../../components/models/commonBottomSheet';
import ActiveIcon from '../../../../../components/svgIcons/mainmenuicons/active';
import useEncryptDecrypt from '../../../../../hooks/encDecHook';
import { getAllEnvData } from '../../../../../../Environment';
import ScrollViewComponent from '../../../../../components/scrollView/scrollView';

const AddressbookCryptoView = React.memo((props: any) => {
    const isFocused = useIsFocused();
    const [errormsg, setErrormsg] = useState<any>(null);
    const [addressbookCryptoView, setAddressbookCryptoView] = useState<any>(null);
    const [loader, setLoader] = useState<boolean>(false);
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const styles = screenStyle(NEW_COLOR);
    const [btnDtlLoading, setBtnDtlLoading] = useState<boolean>(false);
    const [btnDisabled, setBtnDisabled] = useState<boolean>(false);
    const [refresh, setRefresh] = useState<boolean>(false);
    const confirmationSheetRef = useRef<any>(null);
    const { decryptAES } = useEncryptDecrypt();
    const { oAuthConfig } = getAllEnvData();
    const AppUrl = oAuthConfig?.sumsubWebUrl

    useEffect(() => {
        getAddressBookCryptoViewDetails();
    }, [isFocused]);
    useHardwareBackHandler(() => {
        handleBackArrowAddress();
    })
    const handleBackArrowAddress = useCallback(async () => {
        props.navigation.goBack();
    }, [props.navigation]);

    const getAddressBookCryptoViewDetails = useCallback(async () => {
        setLoader(true)
        try {
            const res: any = await AddressbookService?.getAddressbookCryptoViewDetails(props?.route?.params?.id);
            if (res?.ok) {
                setAddressbookCryptoView(res?.data);
                setLoader(false);
            }
            else {
                setErrormsg(isErrorDispaly(res));
                setLoader(false);
            }
        } catch (error: any) {
            if (error?.message === 'SECURE_SESSION_FAILED') {
                setErrormsg('Session expired. Please login again.');
            } else {
                setErrormsg(isErrorDispaly(error));
            }
            setLoader(false);
        }
    }, [props?.route?.params?.id]);
    const copyToClipboard = useCallback(async (text: any) => {
        try {
            await Clipboard.setString(text);
        } catch (error: any) {
        }
    }, []);
    const onShare = async () => {
        try {
            await Share.share({
                message: `${t("GLOBAL_CONSTANTS.HELLOW_I_WOULD_LIKE_TO_SHARE")} ${addressbookCryptoView?.walletDetails?.["Network"]} ${t("GLOBAL_CONSTANTS.ADDRESS_FOR_RECEIVING")}${":"}${addressbookCryptoView?.walletDetails?.["Wallet Address"]}\n${t("GLOBAL_CONSTANTS.PLEASE_MAKE_SURE_YOU_ARE_USING")}\n ${AppUrl} `
            });
        } catch (error: any) {
            Alert.alert(error.message);
        }
    };
    const handleCloseError = useCallback(() => {
        setErrormsg(null);
    }, []);
    const onVerified = () => {
        props?.navigation?.navigate(ADD_BOOK_CONST?.ADD_CONTACT_COMPONENT, {
            id: addressbookCryptoView?.walletDetails?.AnalyticsId || addressbookCryptoView?.walletDetails?.["AnalyticsId"],
            walletCode: addressbookCryptoView?.walletDetails?.Token || addressbookCryptoView?.walletDetails?.["Token"],
            network: addressbookCryptoView?.walletDetails?.Network || addressbookCryptoView?.walletDetails?.["Network"],
            walletAddress: addressbookCryptoView?.walletDetails?.["Wallet Address"],
            screenName: "Addressbook",
            accountType: addressbookCryptoView?.recipientDetailsData?.Transfer,
            isSathoshiTestModel: true,
        })
    }
    const handleAddressbookCryptoEdit = () => {
        if (addressbookCryptoView?.walletDetails?.["WhiteList State"]?.toLowerCase()?.replaceAll(' ', '') !== "submitted") {
            if (addressbookCryptoView?.walletDetails?.["WhiteList State"]?.toLowerCase()?.replaceAll(' ', '') === 'rejected') {
                setErrormsg("You can't modified rejected record.");
            } else if (addressbookCryptoView?.walletDetails?.["WhiteList State"]?.toLowerCase()?.replaceAll(' ', '') === 'pending') {
                setErrormsg("You can't modified pending record.");
            } else if (addressbookCryptoView?.walletDetails?.["Status"]?.toLowerCase()?.replaceAll(' ', '').toLowerCase() === 'inactive') {
                setErrormsg("You can't modified inactive record.");
            }
            else if (addressbookCryptoView?.walletDetails?.["WhiteList State"]?.toLowerCase()?.replaceAll(' ', '') === 'approved') {
                setErrormsg("You can't modified approved record.");
            }
            else if (addressbookCryptoView?.walletDetails?.["WhiteList State"]?.toLowerCase()?.replaceAll(' ', '') === 'unverified' || addressbookCryptoView?.walletDetails?.["WhiteList State"]?.toLowerCase()?.replaceAll(' ', '') === 'submitted') {
                props?.navigation?.navigate(ADD_BOOK_CONST?.ADD_CONTACT_COMPONENT, {
                    id: props?.route?.params?.id,
                    network: addressbookCryptoView?.walletDetails?.["Network"],
                    walletAddress: addressbookCryptoView?.walletDetails?.["Wallet Address"],
                    walletCode: addressbookCryptoView?.walletDetails?.["Token"],
                    accountType: addressbookCryptoView?.recipientDetailsData?.["Account"],
                    screenName: "Addressbook",
                    isSathoshiTestModel: false,
                    analyticsId: addressbookCryptoView?.walletDetails?.["AnalyticsId"],

                })
            }


        }
        else if (addressbookCryptoView?.walletDetails?.["WhiteList State"]?.toLowerCase()?.replaceAll(' ', '') === "submitted" && addressbookCryptoView?.walletDetails?.["Status"]?.toLowerCase()?.replaceAll(' ', '')?.toLowerCase() === "inactive") {
            setErrormsg("You can't modified Incative record");
            return;
        }
        else {
            props?.navigation?.navigate(ADD_BOOK_CONST?.ADD_CONTACT_COMPONENT, {
                id: addressbookCryptoView?.walletDetails?.AnalyticsId,
                walletCode: addressbookCryptoView?.walletDetails?.Token,
                accountType: addressbookCryptoView?.recipientDetailsData?.Account,
                isSathoshiTestModel: false,

            })
        }
    };
    const handleActiveOrInActive = useCallback(() => {
        confirmationSheetRef.current?.open();
    }, []);
    const onUseractiveinactiveSubmit = async () => {
        setErrormsg('')
        setBtnDtlLoading(true);
        setBtnDisabled(true);
        const statusType = addressbookCryptoView?.walletDetails?.["Status"] === "Active" ? "disable" : "enable";
        let obj = {
            id: props?.route?.params?.id,
            tableName: "Common.PayeeAccounts",
            modifiedBy: addressbookCryptoView?.name,
            info: "A full Description",
            status: addressbookCryptoView?.walletDetails?.["Status"] === "Active" ? "Inactive" : "Active",
            type: "Crypto"
        }
        try {
            const res: any = await AddressbookService.Useractiveinactive(props?.route?.params?.id, statusType, obj);
            if (res?.ok) {
                confirmationSheetRef.current?.close();
                getAddressBookCryptoViewDetails();
                setBtnDtlLoading(false);
                setBtnDisabled(false);
                showAppToast(
                    `${t("GLOBAL_CONSTANTS.PAYEE")} ${addressbookCryptoView?.walletDetails?.["Status"]?.toLowerCase()?.replaceAll(' ', '')?.toLowerCase() === "active"
                        ? t("GLOBAL_CONSTANTS.INACTIVE")
                        : t("GLOBAL_CONSTANTS.ACTIVE")
                    } ${t("GLOBAL_CONSTANTS.SUCCESSFULLY")}`,
                    "success"
                );
            }
            else {
                setErrormsg(isErrorDispaly(res));
                setBtnDtlLoading(false);
                setBtnDisabled(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setBtnDtlLoading(false);
            setBtnDisabled(false);
        }
    };
    const onRefresh = useCallback(async () => {
        setRefresh(true);
        try {
            await getAddressBookCryptoViewDetails();
        } finally {
            setRefresh(false);
        }
    }, [getAddressBookCryptoViewDetails]);
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {loader && <DashboardLoader />}
            {!loader && (
                <Container style={commonStyles.container}>
                    <PageHeader title={"GLOBAL_CONSTANTS.CRYPTO_VIEW"} onBackPress={handleBackArrowAddress} />
                    <ScrollViewComponent showsVerticalScrollIndicator={false} refreshing={refresh} onRefresh={onRefresh} >
                        {errormsg && (<ErrorComponent message={errormsg} onClose={handleCloseError} />)}
                        <View>

                            <View style={[commonStyles.titleSectionGap, commonStyles.dflex, commonStyles.justifyContent]}>
                                <ParagraphComponent style={[commonStyles.sectionTitle,]} text={"GLOBAL_CONSTANTS.RECIPIENTS_DETAILS"} />
                                <ViewComponent
                                    style={[
                                        commonStyles.dflex,
                                        commonStyles.flexRow,
                                        commonStyles.justifyend, // Align to right side
                                        commonStyles.alignCenter,
                                        { gap: s(15), paddingRight: s(2) } // Add small spacing between icons
                                    ]}
                                >
                                    {/* --- Edit Button --- */}
                                    {(addressbookCryptoView?.walletDetails?.["Status"]?.toLowerCase()?.replaceAll(' ', '') !== 'inactive' && addressbookCryptoView?.walletDetails?.["WhiteList State"]?.toLowerCase()?.replaceAll(' ', '') === 'unverified') && (<TouchableOpacity onPress={handleAddressbookCryptoEdit}>
                                        <ViewComponent
                                            style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter,]} >
                                            <ViewComponent
                                                style={[styles.edit, commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter]}>
                                                <ProfileEditIcon width={s(18)} height={s(18)} />
                                            </ViewComponent>

                                        </ViewComponent>

                                    </TouchableOpacity>)}

                                    {/* --- Block Button --- */}
                                    <TouchableOpacity onPress={handleActiveOrInActive}>
                                        <ViewComponent
                                            style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter,]}>
                                            <ViewComponent
                                                style={[styles.edit, commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter]} >
                                                <MaterialIcons name="block" size={s(22)} color={NEW_COLOR.TEXT_WHITE} />
                                            </ViewComponent>
                                        </ViewComponent>
                                    </TouchableOpacity>
                                </ViewComponent>
                            </View>

                            {addressbookCryptoView?.recipientDetailsData && <View>
                                {/* {addressbookCryptoView?.recipientDetailsData&&<ParagraphComponent style={[commonStyles.sectionTitle,commonStyles.titleSectionGap]} text={"GLOBAL_CONSTANTS.RECIPIENTS_DETAILS"} />} */}
                                {addressbookCryptoView?.recipientDetailsData && Object.entries(addressbookCryptoView.recipientDetailsData).map(([key, value]: [string, any]) => {
                                    if (!value || key === 'Phone Code') return null;
                                    let displayValue = value;
                                    let displayKey = key;

                                    if (key === 'Email' || key === 'Phone Number' || key === 'Postal Code' || key === "First Name" || key === "Last Name") {
                                        displayValue = decryptAES(value);
                                    }

                                    if (key === 'Phone Number') {
                                        const phoneCode = addressbookCryptoView?.recipientDetailsData?.['Phone Code'];
                                        if (phoneCode) {
                                            displayValue = `${decryptAES(phoneCode)} ${displayValue}`;
                                        }
                                    }

                                    return (
                                        <View key={key} style={[commonStyles.listitemGap]}>
                                            <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={displayKey} />
                                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={key === 'Account' ? (displayValue || "--").charAt(0).toUpperCase() + (displayValue || "--").slice(1).toLowerCase() : displayValue || "--"} />
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>}
                            {/* {addressbookCryptoView?.addressDetailsData && <ParagraphComponent style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} text={"Address Details"} />} */}
                            <View>
                                {addressbookCryptoView?.addressDetailsData && Object.entries(addressbookCryptoView.addressDetailsData).map(([key, value]: [string, any]) => {
                                    if (!value) return null;
                                    let displayValue = value;
                                    if (key === 'Postal Code') {
                                        displayValue = value;
                                    }
                                    return (
                                        <View key={key} style={[commonStyles.listitemGap]}>
                                            <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                                <ParagraphComponent style={[commonStyles.listsecondarytext]} text={key} />
                                                <ParagraphComponent style={[commonStyles.listprimarytext]} text={displayValue || "--"} />
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                            <View >
                                <View style={[commonStyles.titleSectionGap, commonStyles.dflex, commonStyles.justifyContent]}>
                                    <ParagraphComponent style={[commonStyles.sectionTitle,]} text={"GLOBAL_CONSTANTS.WALLET_DETIALS"} />
                                    <ViewComponent
                                        style={[
                                            commonStyles.dflex,
                                            commonStyles.flexRow,
                                            commonStyles.justifyend, // Align to right side
                                            commonStyles.alignCenter,
                                            { gap: s(15), paddingRight: s(2) } // Add small spacing between icons
                                        ]}
                                    >
                                    </ViewComponent>
                                </View>
                                <View>
                                    {addressbookCryptoView?.walletDetails && <View style={[commonStyles.mxAuto]}>
                                        <View style={[commonStyles.titleSectionGap]}>
                                            <ParagraphComponent style={[commonStyles.sectionSubTitleText, commonStyles.textCenter]}
                                                text={`${addressbookCryptoView?.walletDetails?.["Token"] || ''} ${addressbookCryptoView?.walletDetails?.["Currency"] ? `(${addressbookCryptoView?.walletDetails?.["Network"]})` : addressbookCryptoView?.walletDetails?.["Network"]}`}
                                            />
                                        </View>
                                        <View style={[commonStyles.bgAlwaysWhite, commonStyles.p10, commonStyles.mb10]}>
                                            <QRCode value={addressbookCryptoView?.walletDetails?.["Wallet Address"]} size={s(180)} />
                                        </View>
                                        {addressbookCryptoView?.walletDetails?.["WhiteList State"]?.toLowerCase()?.replaceAll(' ', '') === 'unverified' && <TouchableOpacity onPress={onVerified}>
                                            <TextMultiLanguage style={[commonStyles.inputbottomtextlink, commonStyles.mt10, commonStyles.textCenter]} text={"GLOBAL_CONSTANTS.CLICK_HERE_TO_VERIFY"} />
                                        </TouchableOpacity>}
                                    </View>}
                                    <View>
                                        {addressbookCryptoView?.walletDetails && Object.entries(addressbookCryptoView.walletDetails).map(([key, value]: [string, any]) => {
                                            if (!value || key === 'AnalyticsId') return null;
                                            const isStatus = key === 'Status';
                                            const isWhitelistState = key === 'WhiteList State';
                                            const statusValue = addressbookCryptoView?.walletDetails?.["Status"]?.toLowerCase()?.replaceAll(' ', '');
                                            const statusStyle = isStatus ? { color: statusValue === 'inactive' ? NEW_COLOR.TEXT_RED : statusColor[statusValue] || NEW_COLOR.TEXT_WHITE } : {};
                                            const whitelistStateValue = addressbookCryptoView?.walletDetails?.["WhiteList State"]?.toLowerCase()?.replaceAll(' ', '');
                                            const whitelistStateStyle = isWhitelistState ? { color: statusValue === 'inactive' ? NEW_COLOR.TEXT_RED : statusColor[whitelistStateValue] || NEW_COLOR.TEXT_WHITE } : {};
                                            return (
                                                <View key={key} style={[commonStyles.listitemGap]}>
                                                    <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flexWrap]}>
                                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={key} />
                                                        {key.toLowerCase().replaceAll(' ', '') === 'walletaddress' && <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                                                            <CopyCard onPress={() => copyToClipboard(addressbookCryptoView?.walletDetails?.["Wallet Address"])} copyIconColor={NEW_COLOR.TEXT_PRIMARY} />
                                                        </ViewComponent>}
                                                        <ParagraphComponent style={[commonStyles.listprimarytext, statusStyle, whitelistStateStyle]} text={value || "--"} />
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>


                            </View>
                            <View style={[commonStyles.sectionGap]} />
                            {addressbookCryptoView?.rejectReason &&
                                <View style={[commonStyles.bgnote, commonStyles.titleSectionGap]}>
                                    <View style={[]}>
                                        <ParagraphComponent style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.REASON_FOR_REJECTION"} />
                                        <ParagraphComponent style={[commonStyles.listprimarytext]} text={addressbookCryptoView?.rejectReason} />
                                    </View>
                                </View>}
                            {addressbookCryptoView?.note && (<ViewComponent style={[commonStyles.bgnote]}>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.gap8]}>

                                    <ViewComponent>
                                        <MaterialIcons name="info-outline" size={s(18)} color={NEW_COLOR.NOTE_ICON} />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.flex1]}>
                                        <TextMultiLanguage style={[commonStyles.bgNoteText]} text={`${t("GLOBAL_CONSTANTS.NOTE")}  ${addressbookCryptoView?.note}`} />
                                    </ViewComponent>
                                </ViewComponent>
                            </ViewComponent>)}


                            <View style={[commonStyles.sectionGap]} />
                            <ViewComponent>
                                <ButtonComponent title={"GLOBAL_CONSTANTS.SHARE"} icon={<Feather name="share" size={s(18)} color={NEW_COLOR.SHARE_ICON} />} onPress={onShare} disable={false} solidBackground={true} />
                            </ViewComponent>
                            <View style={commonStyles.mb24} />
                        </View>


                        <CustomRBSheet
                            title={'GLOBAL_CONSTANTS.CONFIRM_ACTIVE_INACTIVE'}
                            refRBSheet={confirmationSheetRef}
                            height={"Small"}
                            closeOnPressMask={true}
                            customStyles={{
                                wrapper: { backgroundColor: "rgba(0,0,0,0.7)" },
                                draggableIcon: { backgroundColor: "#5D5A5D" },
                                container: {
                                    backgroundColor: NEW_COLOR.SHEET_BG,
                                    borderTopLeftRadius: 5,
                                    borderTopRightRadius: 5,
                                },
                            }}
                            onClose={() => {
                            }}
                        >
                            <View style={[commonStyles.sheetbg]}>
                                <ScrollView style={[]}>
                                    {errormsg && <ErrorComponent message={errormsg} onClose={() => setErrormsg("")} />}
                                    <ViewComponent style={[commonStyles.mxAuto]}>
                                        <ActiveIcon width={s(50)} height={s(50)} />

                                    </ViewComponent>
                                    <ParagraphComponent
                                        text={`${t("GLOBAL_CONSTANTS.DO_YOU_WANT_TO")} ${t(addressbookCryptoView?.walletDetails?.["Status"]?.toLowerCase()?.replaceAll(' ', '') === "active" ? "GLOBAL_CONSTANTS.INACTIVE" : "GLOBAL_CONSTANTS.ACTIVE")} ?`}
                                        style={[commonStyles.sectionTitle, commonStyles.textCenter, commonStyles.mt20]}
                                    />
                                    <ViewComponent style={[commonStyles.sectionGap]} />
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                                        <ViewComponent style={[commonStyles.flex1]}>
                                            <ButtonComponent
                                                title={t("GLOBAL_CONSTANTS.NO")}
                                                onPress={() => confirmationSheetRef.current?.close()}
                                                solidBackground={true}
                                                disable={btnDtlLoading}
                                            />
                                        </ViewComponent>
                                        <ViewComponent style={[commonStyles.flex1]}>
                                            <ButtonComponent
                                                title={t("GLOBAL_CONSTANTS.YES")}
                                                onPress={onUseractiveinactiveSubmit}
                                                loading={btnDtlLoading}
                                                disable={btnDisabled}
                                            />
                                        </ViewComponent>
                                    </ViewComponent>



                                    <View style={commonStyles.mb24} />
                                </ScrollView>
                            </View>
                        </CustomRBSheet>


                    </ScrollViewComponent>
                </Container>
            )}
        </ViewComponent>
    );
});

export default AddressbookCryptoView;
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
