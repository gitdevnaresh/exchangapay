import React, { useCallback, useEffect, useState } from 'react';
import { TouchableOpacity, FlatList } from 'react-native';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { s } from '../../../constants/theme/scale';
import ImageUri from '../../../newComponents/imageComponents/image';
import ViewComponent from '../../../newComponents/view/view';
import SendServices from '../../../services/send';
import { showAppToast } from '../../../newComponents/ToasterMessages/ShowMessage';
import { isErrorDispaly } from '../../../utils/helpers';
import { useIsFocused } from '@react-navigation/native';
import Loadding from '../../commonScreens/skeltons';
import NoDataComponent from '../../../newComponents/noData/noData';
import useEncryptDecrypt from '../../../hooks/encDecHook';
import { useLngTranslation } from '../../../hooks/useLngTranslation';
import { transactionCard } from '../../Dashboard/skeltons';
import Confirmation from '../../commonScreens/commonConfirmation/confirmation';

interface Receiver {
    receiverId: string;
    receiverName: string;
    fullName?: string;
    imageUrl?: string;
}

interface RecentPayeesProps {
    onPress: (item: Receiver) => void;
    onError?: (error: string) => void;
}

const RecentPayees = ({ onPress, onError }: RecentPayeesProps) => {
    const [payees, setPayees] = useState<Receiver[]>([]);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
    const [deletingPayeeId, setDeletingPayeeId] = useState<any>(null);
    const isFocused = useIsFocused();
    const { decryptAES } = useEncryptDecrypt();
    const transactionCardContent = transactionCard(5);
    const { t } = useLngTranslation();
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);


    useEffect(() => {
        getRecentPayeesList();
    }, [isFocused]);

    const getRecentPayeesList = async () => {
        onError?.("");
        setPayees([]);
        setIsDataLoading(true);
        try {
            const response: any = await SendServices.getRecentPayees();
            if (response?.status === 200) {
                setPayees(response?.data);
            }
            else {
                onError?.(isErrorDispaly(response));
                setPayees([]);
            }

        } catch (error) {
            onError?.(isErrorDispaly(error));
        } finally {
            setIsDataLoading(false);
        }
    };



    const handleRemovePayee = async () => {
         onError?.("");
        setBtnLoading(true);
        try {
            const response: any = await SendServices.removePayee(deletingPayeeId);
            if (response?.status === 200) {
                setIsVisible(false);
                setBtnLoading(false);
                await getRecentPayeesList();
                showAppToast(t("GLOBAL_CONSTANTS.PAYEE_REMOVED_SUCCESSFULLY"), 'success');
            }
            else {
                setBtnLoading(false);
                setIsVisible(false);
                onError?.(isErrorDispaly(response));
            }
        } catch (error) {
            setBtnLoading(false);
            setIsVisible(false);
            onError?.(isErrorDispaly(error));
        } finally {
            setIsVisible(false);
            setBtnLoading(false);
            setDeletingPayeeId(null);
        }
    };


    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
    };

    const handleOpenSheet = (id: any) => {
        setDeletingPayeeId(id)
        setIsVisible(true);
    };


    const renderPayeeItem = ({ item }: any) => {
        return (
            <TouchableOpacity style={[commonStyles.menuitemspace]} onPress={() => { onPress(item) }}>
                <ViewComponent style={[
                    commonStyles.listbg
                ]}>
                    <ImageUri
                        style={{ borderRadius: s(24) }}
                        width={s(48)}
                        height={s(48)}
                        source={
                            item?.imageUrl
                                ? { uri: item?.imageUrl }
                                : require("../../../assets/imageAssets/default.png")
                        }
                    />
                    <ViewComponent style={[commonStyles.flex1]}>
                        <ParagraphComponent
                            text={decryptAES(item?.fullName)}
                            style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite]}
                            numberOfLines={2}
                        />
                        <ParagraphComponent
                            text={decryptAES(item?.customerId)}
                            style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textlinkgrey, { marginTop: s(4) }]}
                        />
                    </ViewComponent>
                    {isEditMode && (
                        <ViewComponent style={[commonStyles.justifyCenter, commonStyles.alignCenter, { width: s(24) }]}>
                            <TouchableOpacity
                                onPress={() => handleOpenSheet(item.receiverId)}
                                disabled={!!deletingPayeeId}
                            >
                                <AntDesign name="close" size={s(24)} color={NEW_COLOR.TEXT_SECONDARY} />
                            </TouchableOpacity>
                        </ViewComponent>
                    )}
                </ViewComponent>
            </TouchableOpacity>
        )
    };
    const renderFooter = () => {
        if (!isDataLoading) return null;
        else {
            return (
                <Loadding contenthtml={transactionCardContent} />
            );
        }
    };
    const handleNoData = useCallback(() => {
        if ((!payees || payees.length === 0) && !isDataLoading) {
            return <NoDataComponent Description={"GLOBAL_CONSTANTS.NO_DATA_FOUND"} />;
        }
        return null;
    }, [payees, isDataLoading]);


    const onClose = () => {
        setDeletingPayeeId(null);
        setIsVisible(false);
    }

    return (
        <ViewComponent>
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mb8]}>
                <TextMultiLanguage text={"GLOBAL_CONSTANTS.RECENT_PAYEES"} style={[commonStyles.sectionTitle]} />
                {payees?.length > 0 && <TouchableOpacity onPress={toggleEditMode}>
                    <Ionicons name="settings-outline" size={s(24)} color={isEditMode ? NEW_COLOR.TEXT_WHITE : NEW_COLOR.TEXT_SECONDARY} />
                </TouchableOpacity>}
            </ViewComponent>
            <FlatList
                data={payees}
                renderItem={renderPayeeItem}
                keyExtractor={(item, index) => `${item?.receiverId || 'payee'}-${index}`}
                ListEmptyComponent={handleNoData}
                ListFooterComponent={renderFooter}
                scrollEnabled={false}
                nestedScrollEnabled={true}
            />
            <Confirmation
                isVisible={isVisible}
                onClose={onClose}
                onConfirm={handleRemovePayee}
                btnLoading={btnLoading}
            />
        </ViewComponent>
    );
};

export default RecentPayees;