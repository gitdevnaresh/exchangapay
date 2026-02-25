import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { formatDateMonthYear, isErrorDispaly } from '../../../../../utils/helpers';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import { s } from '../../../../../constants/styels/scale';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import { allTransactionList } from '../../../../../skeletons/skeltonViews';
import Loadding from '../../../../../components/skelton/skeltons';
import Container from '../../../../../components/container/container';
import ProfileService from '../../../../../apiServices/profile';
import { useSelector } from 'react-redux';
import { KYB_INFO_CONSTANTS } from '../constants';
import NoDataComponent from '../../../../../components/noData/noData';
import { NAVIGATION_CONSTS } from '../../constants';
import ProgressHeader from '../../../../../components/progressCircle/progressHeader';
import useEncryptDecrypt from '../../../../../hooks/encDecHook';
import ButtonComponent from '../../../../../components/buttons/button';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import ViewComponent from '../../../../../components/view/view';
import UploadDeleteIcon from '../../../../../components/svgIcons/mainmenuicons/deleteicon';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import PageHeader from '../../../../../components/pageHeader/pageHeader';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';


const KybDirectorDetailsList = (props: any) => {
    const isFocused = useIsFocused();
    const [errormsg, setErrormsg] = useState<string>("");
    const [kybDirectorsList, setKybDirectoresList] = useState<Director[]>([]);
    const skeltons = allTransactionList(10);
    const [loadingData, setLoadingData] = useState(false);
    const userinfo = useSelector((state: any) => state.userReducer?.userDetails);
    type Director = {
        firstName?: string;
        lastName?: string;
        firstname?: string;
        lastname?: string;
        registrationNumber?: string;
        uboPosition?: string;
        dob?: string;
        phoneCode?: string;
        phoneNumber?: string;
        docDetails?: any;
        [key: string]: any;
    };
    const [listData, setListData] = useState<Director[]>([])
    const [buttonLoader, setButtonLoader] = useState(false);
    const { decryptAES } = useEncryptDecrypt();
    const navigation = useNavigation<any>();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    useEffect(() => {
        if (props?.route?.params?.newUbosDetails) {
            setListData((prevItems: any) => {
                const isItemAlreadyInArray = prevItems.some((item: any) => item.registrationNumber === props.route.params.newUbosDetails.registrationNumber);
                if (!isItemAlreadyInArray) {
                    return [...prevItems, props.route.params.newUbosDetails];
                }
                return prevItems;
            });
        } else {
            getPersionalDetails();
        }
    }, [isFocused, props?.route?.params?.newUbosDetails]);
    const handleRefresh = useCallback(() => {
        getPersionalDetails();
    }, [])
    const getPersionalDetails = async () => {
        setLoadingData(true);
        setErrormsg('')
        try {
            const res: any = await ProfileService.kybDirectorsList();
            if (res?.ok) {
                setKybDirectoresList(res?.data);
                // setListData(res?.data)
                setLoadingData(false);
                setErrormsg('');
            }
            else {
                setErrormsg(isErrorDispaly(res));
                setLoadingData(false)
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setLoadingData(false)
        }
    };
    const handleBack = useCallback(() => {
        if (props?.route?.params?.customerId) {
            props?.navigation?.goBack();
        } else {
            props?.navigation?.navigate('NewProfile');
        }
    }, []);
    const handleSubmit = async () => {
        setButtonLoader(true)
        if (listData.length <= 0 && kybDirectorsList.length <= 0) {
            setErrormsg(KYB_INFO_CONSTANTS.AT_LEAST_ONE_DIRECTOR);
            setButtonLoader(false)
            return;
        }
        try {
            const Obj = {
                customerId: userinfo?.id,
                ubosDetails: listData.map((item: any) => ({
                    ...item,
                    docDetails: item?.docDetails || {}
                }))
            }
            const response = await ProfileService.postDirectorsDetails(listData);
            if (response?.ok) {
                props?.navigation.navigate(NAVIGATION_CONSTS.KYB_INFO_PREVIEW);
                setButtonLoader(false);
                setErrormsg("")
            } else {
                setButtonLoader(false);
                setErrormsg(isErrorDispaly(response))
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error))
            setButtonLoader(false);
        }
    }
    const renderFooter = () => {
        if (!loadingData) {
            return null;
        }
        return (
            <Loadding contenthtml={skeltons} />
        )


    }
    const noData = () => {
        if (!loadingData && (listData.length <= 0 && kybDirectorsList.length <= 0)) {
            return <NoDataComponent />
        }
        return null;
    }
    const handleAddDirectors = () => {
        navigation.navigate(NAVIGATION_CONSTS?.ADD_DIRECTORS_DETAILS_FORM, {
            onGoBack: (data: any) => {
                if (data?.newUbosDetails) {
                    setListData((prev: Director[]) => {
                        const exists = prev.some((item: Director) => item.registrationNumber === data.newUbosDetails.registrationNumber);
                        return exists ? prev : [...prev, data.newUbosDetails];
                    });
                }
            }
        });
    };
    const handleDelete = (selected: any) => {
        const updatedList = listData.filter(
            (item) => !(item?.firstName === selected.firstName && item?.lastName === selected.lastName)
        );
        setListData(updatedList);
        setKybDirectoresList(updatedList)
    }
    const handleError = useCallback(() => {
        setErrormsg("")
    }, []);
    const addIcon = !loadingData ? (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAddDirectors}

        >
            <MaterialCommunityIcons name="plus-circle-outline" size={24} color={NEW_COLOR.TEXT_PRIMARY} />        </TouchableOpacity>
    ) : null;

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={[commonStyles.container, { flex: 1 }]}>
                <PageHeader
                    title={"GLOBAL_CONSTANTS.KYB_INFORMATION"}
                    onBackPress={handleBack}
                    isrefresh={Boolean(props?.route?.params?.customerId)}
                    onRefresh={handleRefresh}
                    rightActions={addIcon}
                />

                <View style={{ flex: 1 }}>
                    <View style={{ flex: 1 }}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <ProgressHeader
                                title={"GLOBAL_CONSTANTS.DIRECTORS_DETAILS"}
                                NextTitle={"GLOBAL_CONSTANTS.RIVIEW"}
                                progress={4}
                                total={5}
                            />

                            {loadingData ? (
                                <Loadding contenthtml={skeltons} />
                            ) : (
                                <>
                                    {errormsg && <ErrorComponent message={errormsg} onClose={handleError} />}
                                    <FlatList
                                        data={listData.length !== 0 ? listData : kybDirectorsList}
                                        renderItem={({ item, index }: any) => (
                                            <View key={index}>
                                                <View style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.justifyContent, commonStyles.gap10]}>
                                                    <View>
                                                        <ParagraphComponent
                                                            text={item?.uboPosition}
                                                            style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textWhite, commonStyles.mb2]}
                                                        />
                                                        <ParagraphComponent
                                                            text={item?.firstname || item?.firstName}
                                                            style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textlinkgrey]}
                                                        />
                                                    </View>
                                                    <View style={[commonStyles.dflex, commonStyles.gap8, commonStyles.alignStart]}>
                                                        <View>
                                                            <ParagraphComponent
                                                                text={formatDateMonthYear(item?.dob)}
                                                                style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textlinkgrey, commonStyles.mb2, commonStyles.textRight]}
                                                            />
                                                            <ParagraphComponent
                                                                text={`${decryptAES(item?.phoneCode || '')} ${decryptAES(item?.phoneNumber || '')}`}
                                                                style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textWhite, commonStyles.textRight]}
                                                            />
                                                        </View>
                                                        <TouchableOpacity activeOpacity={0.8} onPress={() => handleDelete(item)}>
                                                            <UploadDeleteIcon width={s(18)} height={s(18)} />

                                                        </TouchableOpacity>
                                                    </View>
                                                </View>

                                                {index !== listData.length - 1 && <View style={commonStyles.listGap} />}
                                            </View>
                                        )}
                                        keyExtractor={(item, index) => index.toString()}
                                        onEndReachedThreshold={0.5}
                                        ListFooterComponent={renderFooter}
                                        ListEmptyComponent={noData}
                                    />
                                    <View style={commonStyles.sectionGap} />
                                    <View style={commonStyles.sectionGap} />
                                </>
                            )}
                        </ScrollView>
                    </View>

                    {/* Sticky Button (outside ScrollView) */}
                    <View style={styles.stickyButtonWrapper}>
                        <ButtonComponent
                            title={"GLOBAL_CONSTANTS.NEXT"}
                            onPress={handleSubmit}
                            loading={buttonLoader}
                        />
                    </View>
                    <View style={commonStyles.sectionGap} />

                </View>
            </Container>
        </ViewComponent>

    );
};
const styles = StyleSheet.create({
    stickyButtonWrapper: {
        paddingVertical: s(12),
    },
});

export default KybDirectorDetailsList;
