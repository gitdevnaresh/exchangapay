import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import { WithDrawServices } from '../../../apiServices/withdrawApis/withdrawServices';
import { isErrorDispaly } from '../../../utils/helpers';
import { showAppToast } from '../../../newComponents/ToasterMessages/ShowMessage';
import ViewComponent from '../../../newComponents/view/view';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import SwokipayDashboardLoader from '../../../newComponents/swokipayloader';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import FlatListComponent from '../../../newComponents/flatList/flatList';
import SafeAreaViewComponent from '../../../newComponents/safeArea/safeArea';
import Entypo from '@expo/vector-icons/Entypo';
import { Button, MenuItem, OverflowMenu } from '@ui-kitten/components';
import PopupOrSheet from '../../../newComponents/models/PopupOrSheet';
import ButtonComponent from '../../../newComponents/buttons/button';
import LiveSearchComponent from '../../../newComponents/searchComponents/liveSearch';
import { s } from '../../../constants/theme/scale';
import { Keyboard, TouchableOpacity } from 'react-native';
import useEncryptDecrypt from '../../../hooks/encDecHook';
import { useSelector } from 'react-redux';
import { Formik } from 'formik';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';
import FormikTextInput from '../../../newComponents/textInputComponents/formik/textInput';
import { Payee } from './interface/interface';
import { NickNameSchema } from './schema/editNickname';


interface PayeeListComponentProps {
    onPayeeSelect?: (payee?: Payee) => void;
    onPayeePress?: (payee: Payee) => void;
    fetchService?: () => Promise<any>;
    coinCode?: string;
    network?: any;
    refreshTrigger: any;
    selectable?: boolean;
    onMenuAction?: (action: string, payee: Payee) => void;
    ErrorMessage?: (error: string) => void;
}
const PayeeListComponent: React.FC<PayeeListComponentProps> = ({
    onPayeeSelect,
    fetchService,
    coinCode,
    network,
    refreshTrigger,
    selectable = false,
    onMenuAction,
    onPayeePress,
    ErrorMessage
}) => {
    const isFocused = useIsFocused();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const REVERSE_NEW_COLOR = useThemeColors(true);
    const reverseCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
    const [loading, setLoading] = useState(true);
    const [payees, setPayees] = useState<Payee[]>([]);
    const [filteredPayees, setFilteredPayees] = useState<Payee[]>([]);
    const [visibleMenuId, setVisibleMenuId] = useState<string | null>(null);
    const resendEmailRef = useRef<any>(null);
    const deletePayeeRef = useRef<any>(null);
    const editNicknameRef = useRef<any>(null);
    const [btnLoading, setBtnLoading] = useState(false);
    const [selectedPayee, setSelectedPayee] = useState<Payee | null>(null);
    const { encryptAES, decryptAES } = useEncryptDecrypt();
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const [ipAddress, setIpAddress] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isFocused) {
            fetchPayees();
        }
    }, [isFocused, refreshTrigger]);

    const fetchPayees = async () => {
        ErrorMessage?.("");
        setError(null);
        setLoading(true);
        try {
            const service = fetchService || (() => WithDrawServices.WhiteListAddressList("", coinCode || "", network?.code || "", 1, 40));
            const response: any = await service();
            if (response.status === 200) {
                const payeeData = response?.data?.data || [];
                setPayees(payeeData);
                setFilteredPayees(payeeData);
            } else {
                setPayees([]);
                setFilteredPayees([]);
                ErrorMessage?.(isErrorDispaly(response));
            }
        } catch (error) {
            setPayees([]);
            setFilteredPayees([]);
            ErrorMessage?.(isErrorDispaly(error));
        } finally {
            setLoading(false);
        }
    };
    const deletePayee = async () => {
        setError(null);
        setBtnLoading(true);
        const Payload = {
            id: selectedPayee?.id,
            favoriteName: "",
            ModifiedBy: encryptAES(userInfo?.name)
        }
        try {
            const response: any = await WithDrawServices.DeleteAddress(Payload)
            if (response.status === 200) {
                showAppToast("WhiteList Address Deleted Successfully", "success")
                setBtnLoading(false);
                deletePayeeRef.current?.close();
                fetchPayees();
            }
            else {
                setError(isErrorDispaly(response));
                setBtnLoading(false);
            }
        }
        catch (error) {
            setError(isErrorDispaly(error));
            setBtnLoading(false);
        }
    }
    const UpdatePayeeName = async (values: any) => {
        setError(null);
        setBtnLoading(true);
        const Payload = {
            id: selectedPayee?.id,
            favouriteName: encryptAES(values?.nickName),
            ModifiedBy: encryptAES(userInfo?.name)
        }
        try {
            const response: any = await WithDrawServices.EditWalletAddressNickname(Payload)
            if (response.status === 200) {
                showAppToast("WhiteList Address Nickname Updated Successfully", "success")
                setBtnLoading(false);
                editNicknameRef.current?.close();
                fetchPayees();
            }
            else {
                setError(isErrorDispaly(response));
                setBtnLoading(false);
            }
        }
        catch (error) {
            setError(isErrorDispaly(error));
            setBtnLoading(false);
        }
    }
    const ResendEmail = async () => {
        setError(null);
        setBtnLoading(true);
        const Payload = {
            ipAddress: ipAddress,
            location: location,
        }
        try {
            const response: any = await WithDrawServices.ResendWhiteListEmail(selectedPayee?.id, Payload)
            if (response.status === 200) {
                showAppToast("Whitelist Address Verification Email Sent Successfully", "success")
                setBtnLoading(false);
                resendEmailRef.current?.close();
            }
            else {
                setError(isErrorDispaly(response));
                setBtnLoading(false);
            }
        }
        catch (error) {
            setError(isErrorDispaly(error));
            setBtnLoading(false);
        }
    }
    const onMenuToggle = (Payee: any) => {
        Keyboard.dismiss();
        setVisibleMenuId(visibleMenuId === Payee?.id ? null : Payee?.id);
        setSelectedPayee(Payee);
    };
    const onMenuSelect = (index: number, payee: Payee) => {
        setVisibleMenuId(null);
        setError(null);
        const menuActions = [
            'resend_verification_email',
            'edit_nickname',
            'delete_payee'
        ];
        // Adjust index for approved payees (they don't have resend email option)
        let actionIndex = index;
        if (payee.state === "Approved") {
            actionIndex = index + 1; // Skip resend email action
        }
        const action = menuActions[actionIndex];

        if (onMenuAction) {
            onMenuAction(action, payee);
        } else {
            // Default handling
            switch (action) {
                case 'resend_verification_email':
                    resendEmailRef.current?.open();
                    getIpAndLocation();
                    setVisibleMenuId(null);
                    break;
                case 'edit_nickname':
                    editNicknameRef.current?.open();
                    setVisibleMenuId(null);
                    break;
                case 'delete_payee':
                    deletePayeeRef.current?.open();
                    setVisibleMenuId(null);
                    break;
            }
        }
    };
    const getIpAndLocation = async () => {
        try {
            const response = await fetch('https://ipinfo.io/json');
            const data = await response.json();
            if (data.ip) setIpAddress(data.ip);
            if (data.city && data.country) {
                setLocation(`${data.city}, ${data.country}`);
            }
        } catch (fallbackError) {
            setError(isErrorDispaly(fallbackError));
            setIpAddress("Unknown");
            setLocation("Unknown");
        }
    };
    const renderMenuIcon = () => (
        <Entypo name="dots-three-horizontal" size={s(20)} color={NEW_COLOR.TEXT_WHITE} />
    );
    const handlePayeeSelect = (item?: Payee) => {
        onPayeeSelect?.(item);
    };

    const handleResendSubmit = () => {
        ResendEmail();
    };

    const handleResendCancel = () => {
        resendEmailRef.current?.close();
    };

    const handleDeleteSubmit = () => {
        deletePayee();
    };

    const handleDeleteCancel = () => {
        deletePayeeRef.current?.close();
    };

    const handleEditSubmit = (values: any) => {
        UpdatePayeeName(values);
    };

    const handleEditCancel = () => {
        editNicknameRef.current?.close();
    };

    const handleSearchResult = useCallback((result: Payee[]) => {
        setFilteredPayees(result);
    }, []);

    // Create decrypted data for search
    const decryptedPayees = useMemo(() => {
        return payees?.map(payee => ({
            ...payee,
            decryptedFavoriteName: (() => {
                try {
                    return decryptAES(payee.favoriteName) || payee.favoriteName;
                } catch (error) {
                    return payee.favoriteName;
                }
            })(),
            searchableText: (() => {
                try {
                    const favoriteName = decryptAES(payee.favoriteName) || payee.favoriteName;
                    return `${favoriteName} ${payee.walletAddress}`.toLowerCase();
                } catch (error) {
                    return `${payee.favoriteName} ${payee.walletAddress}`.toLowerCase();
                }
            })()
        }));
    }, [payees, decryptAES]);

    const handlePress = (item: Payee) => {
        if (onPayeePress && item.state === "Approved") {
            onPayeePress(item);
        } else if (selectable) {
            handlePayeeSelect(item);
        }
    };

    const handlePressForNonApproved = (item: Payee) => {
        if (selectable) {
            handlePayeeSelect(item);
        }
    };
    const readyPayees = filteredPayees?.filter(p => p.state === "Approved");
    const verifyPayees = filteredPayees?.filter(p => p.state !== "Approved");

    const renderPayeeItem = useCallback(({ item, index }: { item: Payee; index: number }) => {
        const isApproved = item.state === "Approved";
        const isLastItem = index === payees.length - 1;

        return (
            <TouchableOpacity
                style={[
                    commonStyles.menuitemspace,
                    commonStyles.list_background,
                    // !isApproved && { opacity: 0.6 },
                ]}
                onPress={isApproved ? () => handlePress(item) : (selectable ? () => handlePressForNonApproved(item) : () => {})}
                disabled={!isApproved && !selectable}
            >
                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                    <ViewComponent style={[commonStyles.mb5, commonStyles.flex1]}>
                        <ParagraphComponent
                            text={(() => {
                                try {
                                    return decryptAES(item?.favoriteName) || item?.favoriteName || '';
                                } catch (error) {
                                    return item?.favoriteName || '';
                                }
                            })()}
                            style={[commonStyles.fw400, commonStyles.fs14, commonStyles.textWhite]}
                        />
                        <ParagraphComponent
                            text={item.walletAddress}
                            style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textGrey]}
                        />
                    </ViewComponent>
                    <OverflowMenu
                        anchor={() => (
                            <Button
                                appearance='ghost'
                                accessoryLeft={renderMenuIcon}  //3 dots hiding for dev
                                onPress={() => onMenuToggle(item)}
                            />
                        )}
                        visible={visibleMenuId === item.id}
                        onBackdropPress={() => setVisibleMenuId(null)}
                        onSelect={(index) => onMenuSelect(index.row, item)}
                        style={{ minWidth: 200, maxWidth: 250 }}
                    >
                        {item.state !== "Approved" && <MenuItem title='Resend Verification Email' />}
                        <MenuItem title='Edit Nickname' />
                        <MenuItem title='Delete' />
                    </OverflowMenu>
                </ViewComponent>
            </TouchableOpacity>
        );
    }, [selectable, handlePayeeSelect, visibleMenuId, onMenuToggle, onMenuSelect, NEW_COLOR, renderMenuIcon]);

    if (loading) {
        return <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mt130]}
        ><SwokipayDashboardLoader /></SafeAreaViewComponent>
    }

    return (
        <ViewComponent style={[commonStyles.flex1]}>
            <LiveSearchComponent
                data={decryptedPayees}
                customBind="searchableText"
                onSearchResult={handleSearchResult}
                placeholder="GLOBAL_CONSTANTS.SEARCH"
                style={[{ backgroundColor: NEW_COLOR.SEARCHBOX, borderRadius: s(8) }]}
                placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                inputColor={[commonStyles.textWhite]}
                isSearchIconShow={true}
            />
            <ViewComponent style={[commonStyles.flex1]}>
                <ViewComponent style={[]}>
                    <TextMultiLanguage
                        text={"GLOBAL_CONSTANTS.READY_TO_USE"}
                        style={[commonStyles.fs14, commonStyles.fw700, commonStyles.textWhite, commonStyles.titleSectionGap]}
                    />
                    <FlatListComponent
                        data={readyPayees}
                        renderItem={renderPayeeItem}
                        keyExtractor={item => item.id}
                        keyboardShouldPersistTaps="handled"
                        scrollEnabled={false}
                        nestedScrollEnabled={true}
                    />
                </ViewComponent>

                <ViewComponent style={[commonStyles.sectionGap]}>
                    <TextMultiLanguage
                        text={"GLOBAL_CONSTANTS.REQUIRED_EMAIL_VERIFICATION"}
                        style={[commonStyles.fs14, commonStyles.fw700, commonStyles.textWhite, commonStyles.mb16,commonStyles.mt16]}
                    />
                    <FlatListComponent
                        data={verifyPayees}
                        renderItem={renderPayeeItem}
                        keyExtractor={item => item.id}
                        keyboardShouldPersistTaps="handled"
                        scrollEnabled={false}
                        nestedScrollEnabled={true}
                    />
                </ViewComponent>
            </ViewComponent>
             <ViewComponent style={[commonStyles.sectionGap]}/>
            {/* ressend email */}
            <PopupOrSheet ref={resendEmailRef} height={s(300)}
                closeOnPressMask={!btnLoading}
                draggable={!btnLoading}
                title={"GLOBAL_CONSTANTS.RESEND_WHITELIST_EAMIL"}
            >
                {error && <ErrorComponent message={error} onClose={() => setError(null)} />}
                <TextMultiLanguage text={"GLOBAL_CONSTANTS.WHITELIST_EMAIL_SENT_MESSAGE"} style={[commonStyles.fs14, commonStyles.fw400, reverseCommonStyles.textWhite, commonStyles.sectionGap, commonStyles.textCenter]} />
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.flex1]}>
                    <ViewComponent style={[commonStyles.flex1]}>
                        <ButtonComponent
                            title={"GLOBAL_CONSTANTS.CANCEL"}
                            onPress={handleResendCancel}
                            solidBackground={true}
                            disable={btnLoading}
                        />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.flex1]}>
                        <ButtonComponent
                            title={"GLOBAL_CONSTANTS.CONFIRM"}
                            onPress={handleResendSubmit}
                            customContainerStyle={[reverseCommonStyles.bg_yellow, reverseCommonStyles.rounded100, { height: s(55) }]}
                            customTitleStyle={[reverseCommonStyles.fs14, reverseCommonStyles.fw700, reverseCommonStyles.textAlwaysBlack]}
                            loading={btnLoading}
                            disable={btnLoading}
                        />
                    </ViewComponent>
                </ViewComponent>
            </PopupOrSheet>

            {/* Delete Payee Popup */}
            <PopupOrSheet ref={deletePayeeRef} height={s(300)}
                closeOnPressMask={!btnLoading}
                draggable={!btnLoading}
                title={"GLOBAL_CONSTANTS.DELETE_ADDRESS"}>
                {error && <ErrorComponent message={error} onClose={() => setError(null)} />}
                <TextMultiLanguage text={"GLOBAL_CONSTANTS.DELETE_ADDRESS_MESSAGE"} style={[commonStyles.fs14, commonStyles.fw400, reverseCommonStyles.textWhite, commonStyles.textCenter]} />
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.flex1]}>
                    <ViewComponent style={[commonStyles.flex1]}>
                        <ButtonComponent
                            title={"GLOBAL_CONSTANTS.CANCEL"}
                            onPress={handleDeleteCancel}
                            solidBackground={true}
                            disable={btnLoading}
                        />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.flex1]}>
                        <ButtonComponent
                            title={"GLOBAL_CONSTANTS.CONFIRM"}
                            onPress={handleDeleteSubmit}
                            customContainerStyle={[reverseCommonStyles.bg_yellow, reverseCommonStyles.rounded100]}
                            customTitleStyle={[reverseCommonStyles.fs14, reverseCommonStyles.fw700, reverseCommonStyles.textAlwaysBlack]}
                            loading={btnLoading}
                            disable={btnLoading}
                        />
                    </ViewComponent>
                </ViewComponent>
            </PopupOrSheet>

            {/* Edit Nickname Popup */}
            <PopupOrSheet ref={editNicknameRef} height={s(300)}
                title={"GLOBAL_CONSTANTS.EDIT_ADDRESS_NICKNAME"}
                closeOnPressMask={!btnLoading}
                draggable={!btnLoading} >
                <Formik
                    initialValues={{
                        nickName: selectedPayee?.favoriteName ? `${decryptAES(selectedPayee?.favoriteName)}` : ""
                    }}
                    validationSchema={NickNameSchema}
                    onSubmit={handleEditSubmit}
                    enableReinitialize
                >
                    {({ handleSubmit, values }) => (
                        <KeyboardAwareScrollView
                            contentContainerStyle={[{ flexGrow: 1 }]}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={false}
                            enableOnAndroid={true}
                        >
                            {error && <ErrorComponent message={error} onClose={() => setError(null)} />}
                            <ViewComponent style={reverseCommonStyles.mb16}>
                                <FormikTextInput
                                    isModel={true}
                                    name="nickName"
                                    isRequired
                                    placeholder={"GLOBAL_CONSTANTS.ENTER_NICKNAME"}
                                    maxLength={30}
                                    editable={!btnLoading}
                                />
                            </ViewComponent>
                            <ViewComponent style={[reverseCommonStyles.sectionGap]} />
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                <ViewComponent style={[commonStyles.flex1]}>
                                    <ButtonComponent
                                        title={"GLOBAL_CONSTANTS.CANCEL"}
                                        onPress={handleEditCancel}
                                        solidBackground={true}
                                        disable={btnLoading}
                                    />
                                </ViewComponent>
                                <ViewComponent style={[commonStyles.flex1]}>
                                    <ButtonComponent
                                        title={"GLOBAL_CONSTANTS.CONFIRM"}
                                        onPress={handleSubmit}
                                        loading={btnLoading}
                                        disable={btnLoading|| !values.nickName}
                                    />
                                </ViewComponent>
                            </ViewComponent>
                        </KeyboardAwareScrollView>
                    )}
                </Formik>

            </PopupOrSheet>
        </ViewComponent>
    );
};

export default PayeeListComponent;