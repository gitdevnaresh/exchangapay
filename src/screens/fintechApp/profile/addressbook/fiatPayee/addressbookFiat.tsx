import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleService } from '@ui-kitten/components';
import { TouchableOpacity, FlatList } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AddressbookService from '../../../../../apiServices/profile/general/addressbook';
import { isErrorDispaly } from '../../../../../utils/helpers';
import NoDataComponent from '../../../../../components/noData/noData';
import { getThemedCommonStyles, statusColor } from '../../../../../components/CommonStyles';
import { ms, s } from '../../../../../constants/styels/scale';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import Loadding from '../../../../../components/skelton/skeltons';
import { addressBookFiatCryptoGridSk } from '../../../../../skeletons/payeesSkeltons';
import { useLngTranslation } from '../../../../../hooks/languagesHook/useLngTranslation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import KycVerifyPopup from '../../../../commonScreens/kycVerify';
import { PayeeDetails } from './interface';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import ViewComponent from '../../../../../components/view/view';
import { Entypo } from '@expo/vector-icons';
import CustomRBSheet from '../../../../../components/models/commonBottomSheet';
import ProfileEditIcon from '../../../../../components/svgIcons/mainmenuicons/editicon';
import ButtonComponent from '../../../../../components/buttons/button';
import ActiveIcon from '../../../../../components/svgIcons/mainmenuicons/active';
import DashboardLoader from '../../../../../components/loader';
import ScrollViewComponent from '../../../../../components/scrollView/scrollView';
import SafeAreaViewComponent from '../../../../../components/safeArea/safeArea';
import { showAppToast } from '../../../../../components/toasterMessages/ShowMessage';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import SearchComponent from '../../../../../components/searchComponents/searchComponent';

const AddressbookFiat = React.memo(() => {
    const refRBSheet = useRef<any>();
    const isFocused = useIsFocused();
    const [addressBookDetails, setAddressbookDetails] = useState<any>([]);
    const [addbookPreList, setAddbookFiatPreList] = useState<any>([]);
    const [fiatPreList, setFiatPreList] = useState<any>([]);
    const [errormsg, setErrormsg] = useState<string>("");
    const [editerrormsg, setEditerrormsg] = useState<string>("");
    const [addFiatLoading, setAddFiatLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [addressbookSumrryObj, setAddressbookSumrryObj] = useState<any>(null);
    const [btnDtlLoading, setBtnDtlLoading] = useState(false);
    const [btnDisabled, setBtnDisabled] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState<string>("");
    const [selectedItem, setSelectedItem] = useState<PayeeDetails>();
    const addressBookFiatSk = addressBookFiatCryptoGridSk(6);
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const [pageNo, setPageNo] = useState(1);
    const [kycModelVisible, setKycModelVisible] = useState<boolean>(false)
    const [refresh, setRefresh] = useState<boolean>(false);
    const { t } = useLngTranslation();
    const navigation = useNavigation<any>();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const styles = screenStyle(NEW_COLOR);
    const confirmationSheetRef = useRef<any>();

    useEffect(() => {
        setPageNo(1);
        getAddressbookGridDetails(pageNo);
    }, [isFocused]);

    const handleIconClick = useCallback((val: any) => {
        setSelectedItemId(val?.id);
        setSelectedItem(val);
        refRBSheet?.current?.open();
        setErrormsg("");
        getAddressbookSumarryDetails(val?.id);
    }, []);

    const getAddressbookSumarryDetails = useCallback(async (id: any) => {
        try {
            const res: any = await AddressbookService.getAddressbookFiatPayeeDetails(id);
            if (res?.ok) {
                setAddressbookSumrryObj(res?.data);
            }
            else {
                setErrormsg(isErrorDispaly(res));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }
    }, []);
    const handleAddressbookFiatEdit = () => {
        setEditerrormsg("");
        if (addressbookSumrryObj?.whiteListState?.toLowerCase() === "approved") {
            return setEditerrormsg(`You can't modified ${addressbookSumrryObj?.whiteListState} payee.`);
        } else if (addressbookSumrryObj?.status?.toLowerCase() === 'inactive') {
            return setEditerrormsg("You can't modified inactive payee.");
        } else {
            navigation?.navigate("AccountDetails", {
                id: selectedItemId,
                appName: addressbookSumrryObj.appName,
                walletCode: addressbookSumrryObj?.walletCode || addressbookSumrryObj?.walletcCode,
                accountType: addressbookSumrryObj?.accountType,
            })
            refRBSheet?.current?.close()
        }
    };
    const onUseractiveinactiveSubmit = async () => {
        refRBSheet.current?.close();
        setBtnDtlLoading(true);
        setBtnDisabled(true);
        const statusType = selectedItem?.status === "Active" ? "disable" : "enable";
        let obj = {
            id: selectedItemId,
            tableName: "Common.PayeeAccounts",
            modifiedBy: userInfo?.name,
            info: "A full Description",
            status: selectedItem?.status === "Active" ? "Inactive" : "Active",
            type: "Fiat"
        }
        const res: any = await AddressbookService.Useractiveinactive(selectedItemId, statusType, obj);
        if (res?.ok) {

            confirmationSheetRef.current?.close();
            showAppToast(`${t("GLOBAL_CONSTANTS.SELECTED_RECORD_HAS_BEEN")} ${selectedItem?.status?.toLocaleLowerCase() === "active" ? t("GLOBAL_CONSTANTS.INACTIVE") : t("GLOBAL_CONSTANTS.ACTIVE")}`, 'success');
            refRBSheet.current?.close();
            setAddressbookDetails([]);
            getAddressbookGridDetails(pageNo);
            setBtnDtlLoading(false);
            setBtnDisabled(false);
        }
        else {
            setErrormsg(isErrorDispaly(res));
            setBtnDtlLoading(false);
            setBtnDisabled(false);
        }
    };
    const getAddressbookGridDetails = useCallback(async (pageNumber: number) => {
        const pageSize = 10;
        setAddFiatLoading(true);
        setErrormsg("");
        try {
            let response: any = await AddressbookService?.getAddressbookFiatgrid(pageNumber || pageNo, pageSize, "null");
            const isMore = response?.data?.length === pageSize;
            if ((pageNumber || pageNo) === 1) {
                setAddressbookDetails(response?.data?.data);
                setAddbookFiatPreList(response?.data?.data);
                setFiatPreList(response?.data?.data);
                setErrormsg("");
            }
            else {
                setAddressbookDetails([...addressBookDetails, ...response?.data]);
                setAddbookFiatPreList([...addbookPreList, ...response?.data]);
                setFiatPreList([...fiatPreList, ...response?.data]);
                setErrormsg(isErrorDispaly(response));
            }
            setIsLoadingMore(isMore);
            setAddFiatLoading(false);
            setErrormsg("");
        }
        catch (error) {
            setAddFiatLoading(false);
            setErrormsg(isErrorDispaly(error));
        }
    }, [pageNo, addressBookDetails, addbookPreList, fiatPreList]);
    const handleAddressbookFiatViewChange = useCallback((val: any) => {
        navigation.navigate('AddressbookFiatView', {
            id: val?.id,
            appName: val?.appName,
            status: val?.status,
            accountType: addressbookSumrryObj?.accountType,

        });
    }, [navigation, addressbookSumrryObj?.accountType]);

    const loadMoreData = useCallback(() => {
        if (!addFiatLoading && isLoadingMore === true) {
            setPageNo(prv => prv + 1)
            getAddressbookGridDetails(pageNo + 1);
        }

    }, [addFiatLoading, isLoadingMore, pageNo, getAddressbookGridDetails]);
    const renderFooter = useCallback(() => {
        if (!addFiatLoading) {
            return null;
        }
        return (
            <Loadding contenthtml={addressBookFiatSk} />
        )
    }, [addFiatLoading, addressBookFiatSk]);
    const noData = useCallback(() => {
        if ((!addFiatLoading && addressBookDetails) && addressBookDetails.length <= 0) {
            return <NoDataComponent />
        }
        return null;
    }, [addFiatLoading, addressBookDetails]);
    const handleSearchResult = useCallback((result: any[]) => {
        setAddressbookDetails(result);
    }, []);

    const handleCloseActionError = () => {
        refRBSheet.current?.close();
        setEditerrormsg('');
    }

    const closekycModel = () => {
        setKycModelVisible(!kycModelVisible);
    };
    const handleOpenDisable = () => {
        if (addressbookSumrryObj?.whiteListState?.toLowerCase() === "submitted") {
            return setEditerrormsg(`You can't modified submitted payee.`);
        } else {
            refRBSheet.current?.close();
            setTimeout(() => {
                confirmationSheetRef.current?.open();

            }, 300)
        }

    }

    const onRefresh = useCallback(async () => {
        setRefresh(true);
        try {
            setPageNo(1);
            await getAddressbookGridDetails(1);
        } finally {
            setRefresh(false);
        }
    }, [getAddressbookGridDetails]);

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {pageNo === 1 && addFiatLoading ? (
                <SafeAreaViewComponent>
                    <DashboardLoader />
                </SafeAreaViewComponent>) : (
                <ScrollViewComponent refreshing={refresh} onRefresh={onRefresh}>
                    <>
                        {errormsg !== "" && <ErrorComponent message={errormsg} onClose={() => setErrormsg("")} />}
                        <ViewComponent style={[commonStyles.sectionGap]} />
                        <SearchComponent
                            data={fiatPreList || []}
                            customBind="favoriteName"
                            onSearchResult={handleSearchResult}
                            placeholder="GLOBAL_CONSTANTS.SEARCH_PAYEE"
                        />

                        <ViewComponent>
                            <FlatList
                                data={addressBookDetails}
                                renderItem={({ item, index }: any) => {
                                    const stateColor = item?.status?.toLowerCase() === 'inactive' ? NEW_COLOR.TEXT_RED : statusColor[item?.state?.toLowerCase()] || NEW_COLOR.TEXT_WHITE;
                                    return (
                                        <ViewComponent >
                                            <TouchableOpacity
                                                activeOpacity={0.9}
                                                onPress={() => handleAddressbookFiatViewChange(item)}
                                                style={[commonStyles.cardsbannerbg]}
                                            >
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                                    <ViewComponent style={[commonStyles.inputroundediconbg]}>
                                                        <ParagraphComponent
                                                            text={item?.favoriteName?.substring(0, 2).toUpperCase()}
                                                            style={[commonStyles.twolettertext]}
                                                        />
                                                    </ViewComponent>

                                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap20]}>
                                                        <ViewComponent style={[]}>
                                                            <ParagraphComponent text={item?.favoriteName} style={[commonStyles.primarytext, { width: s(200) }]} numberOfLines={1} />
                                                            <ParagraphComponent text={`${item?.currency}`} style={[commonStyles.secondarytext]} numberOfLines={1} />

                                                        </ViewComponent>
                                                        <ParagraphComponent text={item?.state} style={[commonStyles.colorstatus, { color: stateColor }]} numberOfLines={1} />



                                                    </ViewComponent>
                                                    {/* <Feather name='more-vertical' onPress={() => handleIconClick(item)} color={NEW_COLOR.TEXT_WHITE} size={ms(18)} /> */}
                                                </ViewComponent>





                                            </TouchableOpacity>
                                            {index !== addressBookDetails.length - 1 && <ViewComponent style={[commonStyles.transactionsListGap]} />}
                                        </ViewComponent>
                                    )
                                }}
                                keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
                                onEndReached={loadMoreData}
                                keyboardShouldPersistTaps="handled"
                                onEndReachedThreshold={0.5}
                                ListFooterComponent={renderFooter}
                                ListEmptyComponent={noData}
                                contentContainerStyle={{ paddingBottom: s(60) }}
                                scrollEnabled={false}
                                nestedScrollEnabled={true}
                            />
                        </ViewComponent>
                    </>
                    <CustomRBSheet height={"Small"} refRBSheet={refRBSheet} modeltitle={false} >
                        {editerrormsg != "" && <ErrorComponent message={editerrormsg} onClose={handleCloseActionError} />}
                        {selectedItem?.isEditable && (
                            <>
                                <TouchableOpacity onPress={handleAddressbookFiatEdit} >
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { width: '100%', paddingHorizontal: 2, }]} >
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                                            <ViewComponent style={[styles.edit, commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mb5]}>
                                                <ProfileEditIcon width={s(18)} height={s(18)} />
                                            </ViewComponent>
                                            <ParagraphComponent text={"GLOBAL_CONSTANTS.EDIT"} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite,]} />
                                        </ViewComponent>
                                        <Entypo name="chevron-small-right" size={24} color={NEW_COLOR.TEXT_WHITE} />
                                    </ViewComponent>
                                </TouchableOpacity>
                                <ViewComponent style={[commonStyles.listGap]} />
                            </>
                        )}
                        <TouchableOpacity onPress={handleOpenDisable}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { width: '100%', paddingHorizontal: 2, }]}>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                                    <ViewComponent style={[styles.edit, commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mb5]}>
                                        <MaterialIcons name="block" size={s(24)} style={[]} color={NEW_COLOR.TEXT_WHITE} />
                                    </ViewComponent>
                                    <ParagraphComponent text={t(selectedItem?.status === "Active" ? "GLOBAL_CONSTANTS.INACTIVE" : "GLOBAL_CONSTANTS.ACTIVE")} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} />
                                </ViewComponent>
                                <Entypo name="chevron-small-right" size={s(24)} color={NEW_COLOR.TEXT_WHITE} />
                            </ViewComponent>
                        </TouchableOpacity>
                    </CustomRBSheet>
                    <CustomRBSheet title={'GLOBAL_CONSTANTS.CONFIRM_ACTIVE_INACTIVE'} refRBSheet={confirmationSheetRef} height={"Small"} onClose={() => { }} >
                        <ViewComponent style={[commonStyles.sheetbg]}>
                            <ViewComponent>
                                {errormsg && <ErrorComponent message={errormsg} onClose={() => setErrormsg("")} />}
                                <ViewComponent style={[commonStyles.mxAuto]}>
                                    <ActiveIcon width={s(50)} height={s(50)} />
                                </ViewComponent>
                                <ParagraphComponent
                                    text={`${t("GLOBAL_CONSTANTS.DO_YOU_WANT_TO")} ${t(selectedItem?.status === "Active" ? "GLOBAL_CONSTANTS.INACTIVE" : "GLOBAL_CONSTANTS.ACTIVE")} ?`}
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
            )}
            {kycModelVisible && <KycVerifyPopup closeModel={closekycModel} />}
        </ViewComponent>
    );
});

export default AddressbookFiat;

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

