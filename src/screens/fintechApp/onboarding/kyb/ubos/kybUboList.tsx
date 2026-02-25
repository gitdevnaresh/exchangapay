import React, { useCallback, useEffect, useState } from 'react';
import { View, TouchableOpacity, FlatList } from 'react-native';
import { useIsFocused, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { formatDateMonthYear, isErrorDispaly } from '../../../../../utils/helpers';
import { s } from '../../../../../constants/styels/scale';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import { allTransactionList } from '../../../../../skeletons/skeltonViews';
import Loadding from '../../../../../components/skelton/skeltons';
import Container from '../../../../../components/container/container';
import ProfileService from '../../../../../apiServices/profile';
import { KYB_INFO_CONSTANTS } from '../constants';
import NoDataComponent from '../../../../../components/noData/noData';
import { NAVIGATION_CONSTS } from '../../constants';
import ProgressHeader from '../../../../../components/progressCircle/progressHeader';
import useEncryptDecrypt from '../../../../../hooks/encDecHook';
import ButtonComponent from '../../../../../components/buttons/button';
import { UboItem } from '../interface';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import PageHeader from '../../../../../components/pageHeader/pageHeader';
import ViewComponent from '../../../../../components/view/view';
import UploadDeleteIcon from '../../../../../components/svgIcons/mainmenuicons/deleteicon';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';

type KybStackParamList = {
    KybUboList: { newUbosDetails?: UboItem; customerId?: string };
    KybAddUbosDetailsForm: {
        onGoBack: (data: { newUbosDetails: UboItem }) => void;
    };
    KYB_DIRECTORS_DETAILS_LIST: undefined;
    NewProfile: undefined;
};
type KybUboListScreenNavigationProp = NativeStackNavigationProp<KybStackParamList, 'KybUboList'>;
type KybUboListScreenRouteProp = RouteProp<KybStackParamList, 'KybUboList'>;
interface KybUboListProps {
    route: KybUboListScreenRouteProp;
}

const KybUboList = (props: KybUboListProps) => {
    const isFocused = useIsFocused();
    const [errormsg, setErrormsg] = useState<string | null>(null);
    const skeltons = allTransactionList(10);
    const [loadingData, setLoadingData] = useState<any>(false);
    const [listData, setListData] = useState<UboItem[]>([]);
    const [buttonLoader, setButtonLoader] = useState(false);
    const navigation = useNavigation<KybUboListScreenNavigationProp>();
    const { decryptAES } = useEncryptDecrypt();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    useEffect(() => {
        if (isFocused) {
            const newUboDetails = props.route.params?.newUbosDetails;
            if (newUboDetails) {
                setListData(prevItems => {
                    const exists = prevItems.some(item => item.registrationNumber === newUboDetails.registrationNumber);
                    return exists ? prevItems : [...prevItems, newUboDetails];
                });
                navigation.setParams({ newUbosDetails: undefined });
            } else if (listData.length === 0) {
                getPersionalDetails();
            }
        }
    }, [isFocused, props.route.params?.newUbosDetails, navigation, listData.length]); // Added listData.length

    const handleRefresh = useCallback(() => {
        getPersionalDetails();
    }, []);

    const getPersionalDetails = async () => {
        setLoadingData(true);
        setErrormsg(null);
        try {
            const res = await ProfileService.kybUbosList() as { ok: boolean; data?: UboItem[], status?: number, problem?: string };
            if (res?.ok) {
                setListData(res?.data || []);
                setLoadingData(false);
                setErrormsg(null);
            }
            else {
                setErrormsg(isErrorDispaly(res));
                setLoadingData(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setLoadingData(false);
        }
    };
    const handleBack = useCallback(() => {
        if (props?.route?.params?.customerId) {
            navigation?.goBack();
        } else {
            navigation?.navigate('NewProfile');
        }
    }, [navigation, props.route.params?.customerId]);

    const handleSubmit = async () => {
        setButtonLoader(true);
        if (listData.length === 0) {
            setErrormsg(KYB_INFO_CONSTANTS.AT_LEAST_ONE_RECORD);
            setButtonLoader(false);
            return;
        }
        try {
            const response = await ProfileService.postUbosDetails(listData);
            if (response?.ok) {
                navigation.navigate(NAVIGATION_CONSTS.KYB_DIRECTORS_DETAILS_LIST);
                setButtonLoader(false);
                setErrormsg(null);
            } else {
                setButtonLoader(false);
                setErrormsg(isErrorDispaly(response))
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error))
            setButtonLoader(false);
        }
    }

    const noData = () => {
        if (!loadingData && listData.length === 0) {
            return <NoDataComponent />
        }
        return null;
    }
    const handleAddUobs = () => {
        navigation.navigate('KybAddUbosDetailsForm', {
            onGoBack: data => {
                if (data?.newUbosDetails) {
                    setListData(prev => {
                        const exists = prev.some(item => item.registrationNumber === data.newUbosDetails.registrationNumber);
                        return exists ? prev : [...prev, data.newUbosDetails];
                    });
                }
            }
        });
    };
    const handleDelete = (selectedItem: UboItem) => {
        const updatedList = listData.filter(
            (item) => item.registrationNumber !== selectedItem.registrationNumber
        );
        setListData(updatedList);
    };

    const handleError = useCallback(() => {
        setErrormsg(null);
    }, []);

    const addIcon = !loadingData && loadingData?.length !== 0 ? (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAddUobs}

        >
            <MaterialCommunityIcons name="plus-circle-outline" size={24} color={NEW_COLOR.TEXT_PRIMARY} />        </TouchableOpacity>
    ) : null;

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={[commonStyles.container]}>
                <PageHeader
                    title={"GLOBAL_CONSTANTS.KYB_INFORMATION"}
                    onBackPress={handleBack}
                    isrefresh={Boolean(props?.route?.params?.customerId)}
                    onRefresh={handleRefresh}
                    rightActions={addIcon}
                />
                {loadingData ? (
                    <>
                        <View>
                            <ProgressHeader
                                title={"GLOBAL_CONSTANTS.UBO_DETAILS_TITLE"}
                                NextTitle={"GLOBAL_CONSTANTS.DIRECTORS_DETAILS"}
                                progress={3}
                                total={5}
                            />
                        </View>
                        <Loadding contenthtml={skeltons} />
                    </>
                ) : (
                    <FlatList
                        ListHeaderComponent={
                            <>
                                <View>
                                    <ProgressHeader
                                        title={"GLOBAL_CONSTANTS.UBO_DETAILS_TITLE"}
                                        NextTitle={"GLOBAL_CONSTANTS.DIRECTORS_DETAILS"}
                                        progress={3}
                                        total={5}
                                    />
                                </View>
                                {errormsg && <ErrorComponent message={errormsg} onClose={handleError} />}
                            </>
                        }
                        data={listData}
                        renderItem={({ item, index }) => (
                            <View>
                                <View style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.justifyContent, commonStyles.gap10]}>
                                    <View>
                                        <ParagraphComponent text={item?.uboPosition} style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textWhite, commonStyles.mb2]} />
                                        <ParagraphComponent text={item?.firstName} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textlinkgrey]} />
                                    </View>
                                    <View style={[commonStyles.dflex, commonStyles.gap8, commonStyles.alignStart]}>
                                        <View>
                                            <ParagraphComponent text={formatDateMonthYear(item?.dob)} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textlinkgrey, commonStyles.mb2, commonStyles.textRight]} />
                                            <ParagraphComponent text={`${decryptAES(item?.phoneCode) || ''} ${decryptAES(item?.phoneNumber) || ''}`} style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textWhite, commonStyles.textRight]} />
                                        </View>
                                        <TouchableOpacity activeOpacity={0.8} onPress={() => handleDelete(item)} testID={`delete-button-${item.registrationNumber}`}>
                                            <UploadDeleteIcon width={s(18)} height={s(18)} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                {index !== listData.length - 1 && <View style={[commonStyles.listGap]} />}
                            </View>
                        )}
                        keyExtractor={(item) => item.registrationNumber || item.firstName + item.lastName} // Use a more stable key
                        ListFooterComponent={listData.length > 0 ? (
                            <>

                            </>
                        ) : null}
                        ListEmptyComponent={noData}
                        contentContainerStyle={{ flexGrow: 1 }}
                    />
                )}

                {/* Footer Button */}
                <View style={{ marginTop: 'auto' }}>
                    <ButtonComponent
                        title={"GLOBAL_CONSTANTS.NEXT"}
                        onPress={handleSubmit}
                        loading={buttonLoader}
                    />
                </View>
                <View style={commonStyles.sectionGap} />
                <View style={commonStyles.mb12} />


            </Container>
        </ViewComponent>
    );

};

export default KybUboList;

