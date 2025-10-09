import React, { useEffect, useState } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/core";
import { Container } from '../../components';
import { StyleSheet, TouchableOpacity, View, ScrollView, SafeAreaView, FlatList, BackHandler } from "react-native";
import { s } from '../../constants/theme/scale';
import { referralDetailsSkelton } from "./skeleton_views";
import ProfileService from "../../services/profile";
import CopyCard from "../../components/CopyCard";
import { Clipboard } from "react-native";
import Loadding from "../../components/skeleton";
import { useSelector } from "react-redux";
import { formatOnlyDateLocal, isErrorDispaly } from "../../utils/helpers";
import { sellCoinSelect } from "../Crypto/buySkeleton_views";
import { commonStyles } from "../../components/CommonStyles";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import NoDataComponent from "../../components/nodata";
import ErrorComponent from "../../components/Error";
import { NEW_COLOR } from "../../constants/theme/variables";
import AntDesign from "react-native-vector-icons/AntDesign";
import { PROFILE_CONSTANTS } from "./constants";
import useEncryptDecrypt from "../../hooks/useEncryption_Decryption";

interface ReferalInfo {
    referralCode: string,
    referrallink: string,
    referralBusinesslink: string,
    customerId: string
};
interface CustomerInfo {
    customerId: string;
    date: string;
    email: string;
    fullName: string;
    id: string;
    phoneNo: string;
    username: string;
}

const MyReferrals = (props: any) => {
    const navigation = useNavigation();
    const [reffInfo, setReffInfo] = useState<ReferalInfo>({});
    const [referelDataLoading, setReferelDataLoading] = useState<boolean>(false);
    const referralCards = referralDetailsSkelton();
    const [referralsList, setReferralsList] = useState<CustomerInfo[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isMoreData, setIsMoreData] = useState<boolean>(true);
    const [pageNo, setPageNo] = useState<number>(1);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const CardListLoader = sellCoinSelect(10)
    const isFocused = useIsFocused();
    const {decryptAES}=useEncryptDecrypt();
    useEffect(() => {
        setPageNo(1);
        const backHandler = BackHandler.addEventListener(
            PROFILE_CONSTANTS.HARDWARE_BACKPRESS, () => {
                handleGoBack();
                return true;
            }
        )
        return () => backHandler.remove();
    }, [pageNo, isFocused]);

    useEffect(() => {
        getReferelData();
    }, [])

    const handleGoBack = () => {
        navigation.goBack();
    };


    const getReferelData = async () => {
        setReferelDataLoading(true);
        try {
            const reffRes: any = await ProfileService.getUserReferral();
            if (reffRes.status === 200) {
                setReffInfo(reffRes.data);
                setReferelDataLoading(false);
            }
            else {
                setReferelDataLoading(false);
            }
        } catch (error) {
            setReferelDataLoading(false);
        }

    };

    const copyToClipboard = async () => {
        try {
            await Clipboard.setString(reffInfo?.referralCode);
        } catch (error: any) {
        }
    };



    const getReferrals = async () => {

        if (!isLoading && isMoreData) {
            try {
                setIsLoading(true);
                const response: any = await ProfileService.getAllReferrals("", pageNo, 10);
                if (response && response.data?.data && Array.isArray(response.data?.data)) {
                    if (pageNo === 1) {
                        setReferralsList([...response.data?.data]);

                    } else {
                        setReferralsList([...referralsList, ...response.data?.data]);
                    }
                    setIsMoreData(response.data?.data?.length === 10);
                    setPageNo(pageNo + 1);
                    setErrorMsg('');
                    setIsLoading(false);
                } else {
                    setErrorMsg(isErrorDispaly(response));
                    setIsLoading(false);
                    setIsMoreData(false);
                }
            } catch (error) {
                setErrorMsg(isErrorDispaly(error));
                setIsLoading(false);
                setIsMoreData(false);
            }
        }
    };
    const renderFooter = () => {
        if (!isLoading) return null;
        return (
            <Loadding contenthtml={CardListLoader} />
        );
    };

    const loadMoreData = () => {
        if (!isLoading && isMoreData) {
            getReferrals();
        }
    };

    const renderItem = ({ item, index }: any) => {

        return (<>
            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap12, commonStyles.sectionStyle,]}>
                <View style={[commonStyles.flex1]}>
                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.justifyContent,]}>
                        <ParagraphComponent text={PROFILE_CONSTANTS.CUSTOMER_NAME} style={[commonStyles.fs10, commonStyles.fw500, commonStyles.textGrey, commonStyles.flex1]} />
                        <ParagraphComponent text={PROFILE_CONSTANTS.JOIN_DATE} style={[commonStyles.fs10, commonStyles.fw500, commonStyles.textGrey, commonStyles.flex1, commonStyles.textRight]} />
                    </View>
                    <View style={[commonStyles.dflex, commonStyles.gap16, commonStyles.justifyContent,]}>
                        <ParagraphComponent text={item?.fullName} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textBlack,]} />
                        <ParagraphComponent text={formatOnlyDateLocal(item?.date) || ''} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textBlack, commonStyles.textRight, commonStyles.flex1]} />
                    </View>
                </View>
            </View>
            {index !== referralsList.length - 1 && (
                <View style={[commonStyles.mb10]} />
            )}
        </>
        )
    };

    const handleCloseError = () => {
        setErrorMsg("")
    };


    return (
        <SafeAreaView style={[commonStyles.screenBg, commonStyles.relative, commonStyles.flex1]}>
            <ScrollView >
                <Container style={[commonStyles.container,]}>

                    <View style={[commonStyles.dflex, commonStyles.mb16, commonStyles.alignCenter, commonStyles.gap16]}>
                        <TouchableOpacity style={[styles.px8]} onPress={handleGoBack}><View>
                            <AntDesign name={PROFILE_CONSTANTS.ARROW} size={s(22)} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 4 }} />
                        </View></TouchableOpacity>
                        <ParagraphComponent style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw700]} text={PROFILE_CONSTANTS.MY_REFERRALS} />
                    </View>
                    {errorMsg && <ErrorComponent message={errorMsg} onClose={handleCloseError} />}
                    <View style={[commonStyles.mb16]} />

                    <ParagraphComponent style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw700]} text={PROFILE_CONSTANTS.REFERRAL_CODE} />
                    {referelDataLoading && (
                        <>

                            <Loadding contenthtml={referralCards} />
                        </>
                    ) || (
                            <>
                                <View style={[commonStyles.sectionStyle, commonStyles.mt10, commonStyles.mb16]}>
                                    <View style={[commonStyles.dflex, commonStyles.justify, commonStyles.alignCenter]}>
                                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.textBlack, commonStyles.fw600]} text={reffInfo?.referralCode || '-----'} />
                                        <CopyCard onPress={copyToClipboard} />
                                    </View>
                                </View>
                            </>
                        )}
                    <ParagraphComponent style={[commonStyles.fs16, commonStyles.textBlack, commonStyles.fw700]} text={PROFILE_CONSTANTS.REFERRALS_S} />
                    <View style={[commonStyles.mt10, commonStyles.mb16]}>
                        <View style={[]}>
                            <FlatList
                                data={referralsList}
                                renderItem={renderItem}
                                keyExtractor={(item, index) => index.toString()}
                                onEndReached={() => loadMoreData()}
                                onEndReachedThreshold={0.1}
                                ListFooterComponent={renderFooter}
                                ListEmptyComponent={() => <>{!isLoading && referralsList?.length < 1 && <NoDataComponent />}</>}
                            />
                        </View>
                    </View>

                </Container>
            </ScrollView>
        </SafeAreaView>
    );
};

export default MyReferrals;

const styles = StyleSheet.create({
    px8: { paddingVertical: 8 },
});
