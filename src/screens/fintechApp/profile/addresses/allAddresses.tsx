import { TouchableOpacity, View, SafeAreaView } from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ms, s } from "../../../../constants/styels/scale";
import { useIsFocused } from "@react-navigation/core";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import ErrorComponent from "../../../../components/errorDisplay/errorDisplay";
import { ProfilePrimaryServices } from "../../../../apiServices/profile/primary";
import { isErrorDispaly } from "../../../../utils/helpers";
import Container from "../../../../components/container/container";
import TextMultiLangauge from "../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import Entypo from '@expo/vector-icons/Entypo';
import ButtonComponent from "../../../../components/buttons/button";
import { ProfileAddressImage } from "../../../../assets/svg";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import DashboardLoader from "../../../../components/loader";
import ViewComponent from "../../../../components/view/view";
import { useHardwareBackHandler } from "../../../../hooks/backHandleHook";
import CustomeditLink from "../../../../components/svgIcons/mainmenuicons/linkedit";
import PageHeader from "../../../../components/pageHeader/pageHeader";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";
import AddIcon from "../../../../components/addCommonIcon/addCommonIcon";
import ScrollViewComponent from "../../../../components/scrollView/scrollView";
import { Address, ErrorApiResponse, SuccessApiResponse } from "./interface";

type ApiResponse<T> = SuccessApiResponse<T> | ErrorApiResponse;
const AllPersonalInfo = (props: any) => {
    const [personalInfoLoading, setPersonalInfoLoading] = useState(false);
    const [personalInfoAddress, setPersonalInfoAddress] = useState<Address[]>([]);
    const [errormsg, setErrormsg] = useState<string>('');
    const [refresh, setRefresh] = useState<boolean>(false);
    const isFocus = useIsFocused()
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    useEffect(() => {
        getPersonlCustomerDetailsInfo();
    }, [props?.route?.params?.cardId, isFocus]);

    // useCallback: Memoize handleGoBack to prevent recreation on every render
    const handleGoBack = useCallback(() => {
        if (props?.route?.params?.cardId) {
            props.navigation.push("ApplyExchangaCard", {
                cardId: props?.route?.params?.cardId,
                logo: props?.route?.params?.logo
            })
        } else if (props?.route?.params?.returnScreen) {
            props.navigation.push(props?.route?.params?.returnScreen, props?.route?.params?.returnParams)
        } else {
            props.navigation.goBack()
        }
    }, [props?.route?.params?.cardId, props?.route?.params?.logo, props?.route?.params?.returnScreen, props?.route?.params?.returnParams, props.navigation]);

    useHardwareBackHandler(handleGoBack);
    const getPersonlCustomerDetailsInfo = async () => {
        const pageSize = 10;
        const pageNo = 1;
        try {
            setPersonalInfoLoading(true);
            const response = (await ProfilePrimaryServices.cardsAddressGet(pageNo, pageSize)) as ApiResponse<Address[]>;
            if (response?.ok) {
                setPersonalInfoAddress(response?.data?.data || []);
                setErrormsg('');
                setPersonalInfoLoading(false);
            } else {
                setErrormsg(isErrorDispaly(response));
                setPersonalInfoLoading(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setPersonalInfoLoading(false);
        }
    };

    // useCallback: Memoize handleRedirectToAddPersolForm to prevent recreation on every render
    const handleRedirectToAddPersolForm = useCallback((val?: Address) => {
        props.navigation.push("addProfileAddress", {
            ...props.route.params,
            value: val,
            cardId: props?.route?.params?.cardId,
            logo: props?.route?.params?.logo,
            addressDetails: val,
            screenName: "ProfileAddresses",

        });
    }, [props.navigation, props.route.params]);

    // useCallback: Memoize handleView to prevent recreation on every render
    const handleView = useCallback((item: Address) => {
        props.navigation.navigate("AddressViewDetails", { addressDetails: item })
    }, [props.navigation]);
    const handleError = useCallback(() => {
        setErrormsg('');
    }, []);

    // useCallback: Memoize onRefresh to prevent recreation on every render
    const onRefresh = useCallback(async () => {
        setRefresh(true);
        try {
            await getPersonlCustomerDetailsInfo();
        } finally {
            setRefresh(false);
        }
    }, []);

    // useMemo: Memoize addIcon component to prevent recreation on every render
    const addIcon = useMemo(() => (
        <ViewComponent style={[commonStyles.actioniconbg]} >
            <AddIcon onPress={() => handleRedirectToAddPersolForm()} />
        </ViewComponent>
    ), [commonStyles.actioniconbg, handleRedirectToAddPersolForm]);

    // useCallback: Memoize renderAddressItem to prevent recreation on every render
    const renderAddressItem = useCallback((item: Address, index: number) => {
        const truncatedFavoriteName = item.favoriteName?.length > 20
            ? `${item.favoriteName.slice(0, 4)}...${item.favoriteName.slice(-8)}`
            : item.favoriteName ?? '--';

        const truncatedCountry = item.country.length > 10
            ? `${item.country.slice(0, 8)}...${item.country.slice(-8)}`
            : item.country;

        const addressText = [
            item.addressLine1,
            item.addressLine2,
            item.town,
            item.city,
            item.state,
            truncatedCountry
        ].filter(Boolean).join(', ') || '--';

        return (
            <TouchableOpacity key={item?.id} style={[commonStyles.relative]} onPress={() => handleView(item)}>
                {item.isDefault && <View style={[commonStyles.rounded5, { backgroundColor: item.isDefault ? NEW_COLOR.BANNER_BG : NEW_COLOR.TRANSPARENT }]}>
                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4, commonStyles.p8]}>
                        <Entypo name="location-pin" size={s(18)} color={NEW_COLOR.TEXT_link} />
                        <TextMultiLangauge style={[commonStyles.fs14, commonStyles.textlinkgrey, commonStyles.fw500]} text={"GLOBAL_CONSTANTS.DEFAULT"} />
                    </View>
                    <View style={[commonStyles.hLine]} />
                </View>}
                <View style={[commonStyles.dflex, commonStyles.rounded5, commonStyles.gap16, commonStyles.alignStart, { backgroundColor: item.isDefault ? NEW_COLOR.BANNER_BG : NEW_COLOR.TRANSPARENT, padding: item.isDefault ? ms(10) : 0, }]}>
                    <View style={[commonStyles.roundediconbg, item.isDefault ? { backgroundColor: item.isDefault ? NEW_COLOR.INPUTROUNDED_ICON : NEW_COLOR.TRANSPARENT } : null]}>
                        <ParagraphComponent style={[commonStyles.twolettertext]} text={item.favoriteName?.slice(0, 1)?.toUpperCase()} />
                    </View>
                    <View style={[commonStyles.flex1]}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent]}>
                            <View style={[commonStyles.dflex, commonStyles.gap8, commonStyles.mb2]}>
                                <ParagraphComponent style={[commonStyles.twolettertext, commonStyles.textCenter,]} text={truncatedFavoriteName} />
                                <TouchableOpacity activeOpacity={0.6} onPress={() => handleRedirectToAddPersolForm(item)} >
                                    <CustomeditLink height={s(18)} width={s(18)} style={[commonStyles.mt6]} />
                                </TouchableOpacity>
                            </View>
                        </ViewComponent>
                        {item?.addressType && <ParagraphComponent text={item?.addressType} style={[commonStyles.twolettertext]} />}
                        <View>
                            <ParagraphComponent text={addressText} style={[commonStyles.addressespara]} />
                        </View>
                    </View>
                </View>
                {index !== personalInfoAddress.length - 1 && <View style={[commonStyles.listitemGap]} />}
            </TouchableOpacity>
        );
    }, [commonStyles, NEW_COLOR, handleView, handleRedirectToAddPersolForm, personalInfoAddress.length]);




    return (
        <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
            {personalInfoLoading && (<DashboardLoader />)}
            {!personalInfoLoading && (
                <Container style={[commonStyles.container]}>
                    <PageHeader title={"GLOBAL_CONSTANTS.ADDRESSES"} onBackPress={handleGoBack} rightActions={addIcon} />

                    <ScrollViewComponent showsVerticalScrollIndicator={false} refreshing={refresh} onRefresh={onRefresh} >
                        {errormsg !== "" && <ErrorComponent message={errormsg} onClose={handleError} />}
                        <View>
                            <View>
                                {personalInfoAddress?.map((item: Address, index: number) => renderAddressItem(item, index))}
                            </View>
                        </View>

                        {!personalInfoLoading && (!personalInfoAddress || personalInfoAddress?.length === 0) && (<View style={[commonStyles.justifyCenter, commonStyles.mt5, commonStyles.mb28]}>
                            <ProfileAddressImage height={s(200)} width={s(200)} style={[commonStyles.mxAuto, commonStyles.sectionGap, commonStyles.mt20]} />
                            <View>
                                <ButtonComponent multiLanguageAllows={true} title={"GLOBAL_CONSTANTS.ADD_ADDRESS"} onPress={() => handleRedirectToAddPersolForm()} />
                            </View>
                        </View>
                        )}
                        <View style={[commonStyles.mb43]} />
                        <View style={[commonStyles.mb43]} />
                    </ScrollViewComponent >
                </Container >)}
        </SafeAreaView>
    );
};
export default AllPersonalInfo;
