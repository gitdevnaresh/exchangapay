import React, { useCallback, useEffect, useState } from 'react';
import { Share, Alert } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getAllEnvData } from '../../../../../../Environment';
import useEncryptDecrypt from '../../../../../hooks/encDecHook';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import { isErrorDispaly } from '../../../../../utils/helpers';
import { bankService } from '../../../../../apiServices/common/transfer';
import { BANK_CONST } from '../../constants';
import { logEvent } from '../../../../../hooks/loggingHook';
import { useDispatch } from 'react-redux';
import ViewComponent from '../../../../../components/view/view';
import SafeAreaViewComponent from '../../../../../components/safeArea/safeArea';
import DashboardLoader from '../../../../../components/loader';
import ScrollViewComponent from '../../../../../components/scrollView/scrollView';
import Container from '../../../../../components/container/container';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import ModalPicker from '../../../../../components/pickerComponents/ModalPicker';
import TextMultiLanguage from '../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import SubmittedState from './submittedState';
import CopyCard from '../../../../../components/copyIcon/CopyCard';
import { formatNumberWithCommasToFixed } from '../../../../../utils/fillNumberLength';
import FlatListComponent from '../../../../../components/flatList/flatList';
import SecurityIcon from '../../../../../components/svgIcons/mainmenuicons/securityicon';
import { s } from '../../../../../components/theme/scale';
import ButtonComponent from '../../../../../components/buttons/button';
import { useLngTranslation } from '../../../../../hooks/languagesHook/useLngTranslation';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import { Logger } from '../../../../../utils/Logger';
const LocalBank = React.memo((props: any) => {
    const isFocused = useIsFocused();
    const [transferDetails, setTransferDetails] = useState<any>({});
    const [isLoading] = useState<boolean>(false);
    const [errormsg, setErrormsg] = useState(null);
    const [shareButtonLoader, setShareButtonLoader] = useState(false)
    const [bankData, setBankData] = useState<any[]>([])
    const [bankDetailsLoader, setBankDetailsLoader] = useState(true)
    const [selectedBankData, setSelectedBankData] = useState<any>({ selectBankId: "", selectBankName: "" });
    const [fiatVaultNote, setFiatVaultNote] = useState<string>('');
    const [refresh, setRefresh] = useState<boolean>(false);
    const navigation = useNavigation<any>();
    const { t } = useLngTranslation();
    const { oAuthConfig } = getAllEnvData();
    const AppUrl = oAuthConfig?.sumsubWebUrl
    const { decryptAES } = useEncryptDecrypt();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    useEffect(() => {
        const fetchData = async () => {
            try {
                await getBankInfo();
                await getFiatVaultNote();
            } catch (error) {
                Logger.error('useEffect fetchData failed', { error });
            }
        };
        fetchData();
    }, [isFocused, props?.currency]);
    const onPullRefresh = async () => {
        try {
            setRefresh(true);
            await getBankInfo();
            await getFiatVaultNote();
        } catch (error) {
            Logger.error('onPullRefresh failed', { error });
        } finally {
            setRefresh(false);
        }
    };

    const getFiatVaultNote = async () => {
        try {
            const response = await bankService.getFiatVaultsList();
            if (response?.ok && (response?.data as any)?.assets) {
                const fiatAsset = (response.data as any).assets.find((asset: any) => asset.code === props?.currency);
                if (fiatAsset?.remarks) {
                    setFiatVaultNote(fiatAsset.remarks);
                }
            }
        } catch (error) {
            Logger.error('getFiatVaultNote failed', { error, currency: props?.currency });
            setErrormsg(isErrorDispaly(error));
        }
    };
    const getBankInfo = async () => {
        try {
            setBankDetailsLoader(true);
            setErrormsg(null)
            let response: any
            if (props?.screenName === "WalletsAllCoinsList") {
                response = await bankService.getWalletsBanks(props?.currency);
                if (response?.ok) {
                    const banksList = response?.data?.bankList || []
                    setSelectedBankData(response?.data[0])
                    setTransferDetails(response?.data[0])
                    if (banksList.length > 0) {
                        setBankData(banksList)
                        setBankDetailsLoader(false);
                    }
                    setErrormsg(null)
                    setBankDetailsLoader(false);
                } else {
                    setErrormsg(isErrorDispaly(response));
                    setBankDetailsLoader(false);
                }
            } else {
                response = await bankService.getBanks(props?.currency);
                if (response?.ok) {
                    const banksList = response?.data?.bankList || []
                    setSelectedBankData(response?.data?.bankList[0])
                    setTransferDetails(response?.data?.bankList[0])
                    if (banksList.length > 0) {
                        setBankData(banksList)
                        setBankDetailsLoader(false);
                    }
                    setErrormsg(null)
                    setBankDetailsLoader(false);
                } else {
                    setErrormsg(isErrorDispaly(response));
                    setBankDetailsLoader(false);
                }
            }
        }
        catch (error: any) {
            Logger.error('getBankInfo failed', { error, currency: props?.currency, screenName: props?.screenName });
            setErrormsg(isErrorDispaly(error))
            setBankDetailsLoader(false);
        }
    }
    const isSubmittedState = transferDetails?.accountStatus?.toLowerCase() === 'submitted' || transferDetails?.accountStatus?.toLowerCase() === 'rejected';



    const copyToClipboard = async (text: any) => {
        try {
            Clipboard.setString(text);
        } catch (error: any) {
            Logger.error('copyToClipboard failed', { error });
            Alert.alert(BANK_CONST.FAILED_TO_COPY_TEXT_TO_CLIPBOARD, error);
        }
    };
    const handleShare = async () => {
        try {
            setShareButtonLoader(true)
            logEvent("Button Pressed", { action: "Bank Desposit share button", currentScreen: "Bank Desposit" })
            const appLinks = AppUrl;
            const accountNumber = decryptAES(transferDetails?.accountNumber || transferDetails?.accountOrIbanNumber || "");
            const accountHolderName = transferDetails?.accountHolderName || transferDetails?.accountName || "";
            const bankName = transferDetails?.bankName || transferDetails?.name || "";

            setShareButtonLoader(false)
            await Share.share({
                message: `${t("GLOBAL_CONSTANTS.HELLOW")}\n${t("GLOBAL_CONSTANTS.IWOULD_LIKE_TO_SHARE")} ${props?.currency || ""} ${t("GLOBAL_CONSTANTS.BANK_DETAILS_FOR_RECEIVING_FUNDS")}
                \n${t("GLOBAL_CONSTANTS.SHARE_IBAN_ACCOUNT_NUMBER")} ${accountNumber}\n${t("GLOBAL_CONSTANTS.SWIFT_CODE")} : ${transferDetails?.swiftOrBicCode || transferDetails?.swiftCode || transferDetails?.swiftRouteBICNumber || ""}\n${t("GLOBAL_CONSTANTS.ACCOUNT_HOLDER_NAME")} : ${accountHolderName}\n${t("GLOBAL_CONSTANTS.BANKS_NAME")} : ${bankName}\n${t("GLOBAL_CONSTANTS.CURRENCY")} : ${props?.currency || ""}
                \n${t("GLOBAL_CONSTANTS.PLEASE_MAKE_SURE_YOU_ARE_USING_THE_CORRECT_PROTOCAL")}
                \n${appLinks}\n${t("GLOBAL_CONSTANTS.THANK_YOU")}`
            })
        }
        catch (error: any) {
            Logger.error('handleShare failed', { error });
            Alert.alert(error.message);
            setShareButtonLoader(false)
        }
    }

    const handleBankData = (item: any) => {
        setSelectedBankData(item)
        setTransferDetails(item)
    };
    const handleErorr = useCallback(() => {
        setErrormsg(null)
    }, [])
    const handleGotoHome = useCallback(() => {
        try {
            if (props?.screenName == 'WalletsAllCoinsList') {
                navigation.reset({
                    index: 0,
                    routes: [{
                        name: 'Dashboard',
                        params: {
                            initialTab: "GLOBAL_CONSTANTS.WALLETS",
                            animation: "slide_from_left"
                        }
                    }]
                });
            } else {
                navigation.navigate('Dashboard', {
                    initialTab: "GLOBAL_CONSTANTS.BANK", animation: 'slide_from_left'
                });
            }
            logEvent("Button Pressed", { action: "Bank Desposit button", currentScreen: "Bank Desposit", nextScreen: "Bank dashboard" })
        } catch (error) {
            Logger.error('handleGotoHome failed', { error, screenName: props?.screenName });
        }
    }, [navigation]);

    const dispatch = useDispatch();
    const handleReapply = useCallback(() => {
        try {
            dispatch({ type: 'SET_IS_REAPPLY', payload: true });
            if (props?.screenName == 'WalletsAllCoinsList') {
                navigation.navigate('WalletsBankCreation', { selectedVault: '', screenName: "WalletsAllCoinsList", screenType: 'Deposit' });
            } else {
                navigation.navigate('createAccountForm');
            }
        } catch (error) {
            Logger.error('handleReapply failed', { error, screenName: props?.screenName });
        }
    }, [navigation, dispatch]);

    if (isSubmittedState) {
        return (
            <SubmittedState
                onRefresh={transferDetails?.accountStatus?.toLowerCase() === 'rejected' ? handleReapply : getBankInfo}
                loading={bankDetailsLoader}
                accountStatus={transferDetails?.accountStatus}
                remarks={transferDetails?.remarks}
                refresh={refresh}
                onPullRefresh={onPullRefresh}
            />
        );
    }

    if (bankDetailsLoader) {
        return (
            <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
                <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                    <DashboardLoader />
                </SafeAreaViewComponent>
            </ViewComponent>
        );
    }
    return (
        <ViewComponent style={[commonStyles.flex1]}>
            <ScrollViewComponent style={[commonStyles.flex1]} refreshing={refresh || false}
                onRefresh={onPullRefresh}>
                <Container style={[commonStyles.container, commonStyles.flex1]}>
                    <ViewComponent style={[commonStyles.flex1]}>
                        {errormsg && <ErrorComponent message={errormsg} onClose={handleErorr} />}
                        {!isLoading && (
                            <>
                                {bankData?.length > 1 && <ViewComponent>
                                    <ModalPicker
                                        customBind={["name"]}
                                        data={bankData}
                                        value={selectedBankData?.name}
                                        placeholder="Select Option"
                                        onChange={(item) => handleBankData(item)}
                                        modalTitle={"GLOBAL_CONSTANTS.SELECT_BANK"}
                                    />
                                    <ViewComponent style={[commonStyles.sectionGap]} />
                                </ViewComponent>}
                                <ViewComponent style={[commonStyles.sectionGap]}>
                                    {/* Account Holder Name */}
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8, commonStyles.listbannerbg]}>
                                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.ACCOUNT_HOLDER_NAME"} style={[commonStyles.listsecondarytext]} />
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.alignCenter]}>
                                            <ParagraphComponent text={transferDetails?.accountHolderName || transferDetails?.accountName || '--'} style={[commonStyles.listprimarytext]} />
                                        </ViewComponent>
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.listitemGap]} />

                                    {/* Account Number */}
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8, commonStyles.listbannerbg]}>
                                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.ACCOUNT_NUMBER"} style={[commonStyles.listsecondarytext]} />
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.alignCenter]}>
                                            <ParagraphComponent text={decryptAES(transferDetails?.accountNumber || transferDetails?.accountOrIbanNumber) || '--'} style={[commonStyles.listprimarytext]} />
                                            <CopyCard onPress={() => copyToClipboard(decryptAES(transferDetails?.accountNumber || transferDetails?.accountOrIbanNumber))} />
                                        </ViewComponent>
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.listitemGap]} />

                                    {/* Bank Name */}
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap, commonStyles.gap8, commonStyles.listbannerbg, commonStyles.listitemGap]}>
                                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.BANKNAME"} style={[commonStyles.listsecondarytext]} />
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.alignCenter]}>
                                            <ParagraphComponent text={transferDetails?.bankName || transferDetails?.name || ''} style={[commonStyles.listprimarytext]} />
                                        </ViewComponent>
                                    </ViewComponent>

                                    {/* Swift/BIC Code */}
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap, commonStyles.gap8, commonStyles.listbannerbg, commonStyles.listitemGap]}>
                                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.SWIFT_CODE"} style={[commonStyles.listsecondarytext]} />
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                                            <ParagraphComponent text={transferDetails?.swiftCode || transferDetails?.swiftRouteBICNumber || transferDetails?.swiftOrBicCode || ''} style={[commonStyles.listprimarytext]} />
                                            <CopyCard onPress={() => copyToClipboard(transferDetails?.swiftCode || transferDetails?.swiftRouteBICNumber || transferDetails?.swiftOrBicCode)} />
                                        </ViewComponent>
                                    </ViewComponent>

                                    {/* Routing Code */}
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.listbannerbg, commonStyles.gap8, commonStyles.flexWrap, commonStyles.listitemGap]}>
                                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.ROUTING_CODE"} style={[commonStyles.listsecondarytext]} />
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.alignCenter]}>
                                            <ParagraphComponent text={transferDetails?.routingCode || transferDetails?.routingNumber || '--'} style={[commonStyles.listprimarytext]} />
                                            <CopyCard onPress={() => copyToClipboard(transferDetails?.routingCode || transferDetails?.routingNumber)} />
                                        </ViewComponent>
                                    </ViewComponent>

                                    {/* Routing Type */}
                                    {transferDetails?.routingType && <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap, commonStyles.gap8, commonStyles.listbannerbg, commonStyles.listbannerbg]}>
                                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.ROUTING_TYPE"} style={[commonStyles.listsecondarytext]} />
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.alignCenter]}>
                                            <ParagraphComponent text={transferDetails?.routingType || '--'} style={[commonStyles.listprimarytext]} />
                                            <CopyCard onPress={() => copyToClipboard(transferDetails?.routingType)} />
                                        </ViewComponent>
                                    </ViewComponent>}

                                    {/* Available Balance */}
                                    {transferDetails?.balance && <ViewComponent style={[commonStyles.dflex, commonStyles.gap8, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.listbannerbg, commonStyles.listitemGap]}>
                                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.AVAILABLE_BAL"} style={[commonStyles.listsecondarytext]} />
                                        <ParagraphComponent text={`${formatNumberWithCommasToFixed(transferDetails?.balance) || '--'}`}
                                            style={[commonStyles.listprimarytext]} />
                                    </ViewComponent>
                                    }
                                    {transferDetails?.address && <ViewComponent style={[commonStyles.dflex, commonStyles.gap8, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.listbannerbg, commonStyles.listitemGap]}>
                                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.ADDRESS"} style={[commonStyles.listsecondarytext]} />
                                        <ParagraphComponent numberOfLines={3} text={transferDetails?.address || '--'}
                                            style={[commonStyles.listprimarytext]} />
                                    </ViewComponent>}
                                    {transferDetails?.postalCode && <ViewComponent style={[commonStyles.dflex, commonStyles.gap8, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.listbannerbg]}>
                                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.POSTAL_CODE"} style={[commonStyles.listsecondarytext]} />
                                        <ParagraphComponent numberOfLines={3} text={transferDetails?.postalCode || '--'}
                                            style={[commonStyles.listprimarytext]} />
                                    </ViewComponent>}
                                    {/* Account Address Details */}
                                    <ViewComponent style={[commonStyles.sectionGap]} />
                                    {transferDetails?.banksDetails && (
                                        <>
                                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.ACCOUNT_ADDRESS_DETAILS"} style={[commonStyles.sectionTitle]} />
                                            <ViewComponent style={[commonStyles.listitemGap]} />
                                            <FlatListComponent
                                                data={Object.entries(transferDetails.banksDetails || {})}
                                                keyExtractor={([key]) => key}
                                                renderItem={({ item: [key, value], index }) => {
                                                    const isLastItem =
                                                        index === Object.entries(transferDetails.banksDetails || {}).length - 1;
                                                    return (
                                                        <>
                                                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.listbannerbg, commonStyles.flexWrap, commonStyles.gap8]}>
                                                                <ParagraphComponent text={key} style={[commonStyles.listsecondarytext]} />
                                                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                                                                    <ParagraphComponent text={String(value) || ''} style={[commonStyles.listprimarytext]} />
                                                                </ViewComponent>
                                                            </ViewComponent>
                                                            {!isLastItem && (
                                                                <ViewComponent style={[commonStyles.listitemGap]} />
                                                            )}
                                                        </>
                                                    );
                                                }}
                                                scrollEnabled={false}
                                            />

                                            {/* Remarks */}
                                            <ViewComponent style={[commonStyles.sectionGap]}>
                                                <ViewComponent>
                                                    {transferDetails?.remarks && (
                                                        <ViewComponent
                                                            style={[commonStyles.mt16
                                                            ]}>

                                                            <ViewComponent style={[commonStyles.bgnote, commonStyles.listitemGap]}>
                                                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.gap8]}>
                                                                    <ViewComponent>
                                                                        <MaterialIcons name="info-outline" size={s(18)} color={NEW_COLOR.NOTE_ICON} />
                                                                    </ViewComponent>
                                                                    <ViewComponent style={[commonStyles.flex1]}>
                                                                        <ParagraphComponent text={transferDetails?.remarks || ''} style={[commonStyles.bgNoteText]} />
                                                                    </ViewComponent>
                                                                </ViewComponent>
                                                            </ViewComponent>
                                                        </ViewComponent>
                                                    )}
                                                </ViewComponent>
                                                {/* Remarks - from fiat vault or bank details */}
                                                <ViewComponent >
                                                    {(() => {
                                                        const remarksToDisplay = fiatVaultNote;
                                                        return remarksToDisplay && (
                                                            <>
                                                                <ViewComponent style={[commonStyles.bgnote]}>
                                                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.gap8]}>
                                                                        <ViewComponent>
                                                                            <MaterialIcons name="info-outline" size={s(18)} color={NEW_COLOR.NOTE_ICON} />
                                                                        </ViewComponent>
                                                                        <ViewComponent style={[commonStyles.flex1]}>
                                                                            <ParagraphComponent text={remarksToDisplay || ''} style={[commonStyles.bgNoteText]} />
                                                                        </ViewComponent>
                                                                    </ViewComponent>
                                                                </ViewComponent>
                                                            </>
                                                        );
                                                    })()}
                                                </ViewComponent>
                                            </ViewComponent>
                                            <ViewComponent>
                                                <ParagraphComponent text={"Bank Details"} style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} />

                                            </ViewComponent>
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter, commonStyles.listbannerbg]}>
                                                <SecurityIcon width={s(22)} height={s(22)} />
                                                <ViewComponent style={[commonStyles.flex1]}>
                                                    <ParagraphComponent text={"GLOBAL_CONSTANTS.YOUR_MONEY_IS_HELD_AND_PROTECTED_BY_LICENSED_BANK"} style={[commonStyles.accountbankdetails]} />
                                                </ViewComponent>
                                            </ViewComponent>
                                        </>
                                    )}
                                </ViewComponent>
                                {/* <ViewComponent >
                                <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                                    <MaterialCommunityIcons name="lightbulb-on-outline" size={26} color={NEW_COLOR.TEXT_WHITE} />
                                    <ViewComponent style={[commonStyles.flex1]}>
                                        <ParagraphComponent text={"GLOBAL_CONSTANTS.YOUR_MONEY_IS_HELD_AND_PROTECTED_BY_LICENSED_BANK"} style={[commonStyles.sectionsubtitlepara]} />
                                    </ViewComponent>
                                </ViewComponent>
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.listitemGap]} /> */}

                                {/* <ViewComponent >
                                <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                                    <Feather name="flag" size={s(24)} color={NEW_COLOR.TEXT_WHITE} />
                                    <ViewComponent style={[commonStyles.flex1]}>
                                        <ParagraphComponent text={"GLOBAL_CONSTANTS.ONLY_FAST_NETWORK_TRANSFERS_SUPPORTED"} style={[commonStyles.sectionsubtitlepara]} />
                                    </ViewComponent>
                                </ViewComponent>
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.listitemGap]} />

                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                <MaterialCommunityIcons name="bank-outline" size={s(26)} color={NEW_COLOR.TEXT_WHITE} />
                                <ViewComponent style={[commonStyles.flex1]}>
                                    <ParagraphComponent text={"GLOBAL_CONSTANTS.IN_APP_BANK_TOP_SUPPORTED_FOR"} style={[commonStyles.sectionsubtitlepara]} />
                                    {bankData?.length > 1 ? (
                                        <FlatListComponent
                                            data={bankData}
                                            keyExtractor={(item, index) => index.toString()}
                                            renderItem={({ item, index }) => (
                                                <ParagraphComponent 
                                                    text={`${(item as any).bankName || (item as any).name}${index < bankData.length - 1 ? ', ' : '.'}`} 
                                                    style={[commonStyles.sectionsubtitlepara]} 
                                                />
                                            )}
                                            scrollEnabled={false}
                                            horizontal={true}
                                        />
                                    ) : (
                                        <ParagraphComponent text={`${transferDetails?.bankName || ''}.`} style={[commonStyles.sectionsubtitlepara]} />
                                    )}
                                </ViewComponent>
                            </ViewComponent> */}
                            </>
                        )}
                    </ViewComponent>

                    <ViewComponent>
                        <ButtonComponent title={"GLOBAL_CONSTANTS.SHARE"} icon={<Feather name="share" size={s(20)} color={NEW_COLOR.PRIMARYBUTTON_SHAREICON} />} loading={shareButtonLoader} onPress={handleShare} disable={false} />
                        <ViewComponent style={[commonStyles.buttongap]} />
                        <ButtonComponent
                            title={"GLOBAL_CONSTANTS.BACK_TO_WALLETS"}
                            customTitleStyle={commonStyles.textWhite}
                            onPress={handleGotoHome}
                            solidBackground={true}
                        />
                        <ViewComponent style={[commonStyles.sectionGap]} />
                    </ViewComponent>
                </Container>
            </ScrollViewComponent>
        </ViewComponent>
    );
});

export default LocalBank;

