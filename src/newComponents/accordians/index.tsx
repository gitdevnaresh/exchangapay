import React, { useEffect, useRef, useState } from 'react';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import {  TouchableOpacity, LayoutAnimation, TextInput } from 'react-native';
import AntDesign from "react-native-vector-icons/AntDesign";
import { commonVaultsSkeleton } from '../../screens/digitalBank_W2/cards/cardsSkeleton_views';
import { useIsFocused } from '@react-navigation/native';
import { FIAT_CONSTANTS } from '../../screens/digitalBank_W2/bank/withdraw/vaultsConstants';
import { formatCurrency } from '../../utils/helpers';
import { NEW_COLOR } from '../../constants/theme/variables';
import Loadding from '../../screens/commonScreens/skeltons';
import { text } from '../../constants/theme/mixins';
import { ms, s } from '../../constants/theme/scale';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgUri } from 'react-native-svg';
import { useLngTranslation } from '../../hooks/useLngTranslation';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';
import ImageUri from '../imageComponents/image';
import NoDataComponent from '../noData/noData';
import ViewComponent from '../view/view';
import Ionicons from '@expo/vector-icons/Ionicons';
import ButtonComponent from '../buttons/button';
import CustomRBSheet from '../../components/commonDrawer';
import SelectedCoupons from '../../screens/mlm/packages/paymentMethods/SelectedCoupons';
import CustomPicker from '../pickerComponents/basic/customPickerNonFormik';
import { PackagesApiService } from '../../apiServices/packagesApiServices/apiServices';

interface AddVaultProps {
    vaultsList: [],
    coinsList: [],
    valutsPrevList?: [],
    isLoading?: boolean,
    handleNavigate?: (data: any, selectedVault: any) => void,
    setCoinsList?: (data: any) => void,
    setVaultsList?: (data: any) => void,
    handleChangeSearch?: (val: any) => void,
    defaultIndex?: any,
    disable?: boolean,
    onSelectCoin?:any,
    totalAmount?:any,
    showRadioIcon?:boolean;
};

const AccordionComponent = ({ vaultsList, coinsList, isLoading, handleNavigate, handleChangeSearch, valutsPrevList, setCoinsList, defaultIndex, disable,onSelectCoin,totalAmount,showRadioIcon=false }: AddVaultProps) => {
    const styles = useStyleSheet(themedStyles);
    const buyCoinListSkelton = commonVaultsSkeleton(8);
    const isFocused = useIsFocused();
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
    const [selectedVault, setSelectedVault] = useState<any>({});
    const refRBSheet = useRef(null);
    const [eWallets,setEwallets]=useState<any>()
    const [selectedEWallet,setSelectedEWallet]=useState('')
    const [updatedVaultsList, setUpdatedVaultsList] = useState(vaultsList);
const {t} = useLngTranslation();
    useEffect(() => {
        if (vaultsList?.length >= 0) {
            setSelectedVault(vaultsList[0])
        };
        setExpandedIndex(defaultIndex || 0);
        getEwallets()
        setUpdatedVaultsList(vaultsList)
    }, [isFocused, vaultsList]);
    const toggleItem = (index: number, item: any) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedIndex(prevIndex => (prevIndex === index ? null : index));
        setSelectedVault(item);
        const vaultCoins = valutsPrevList?.find(
            (value: any) => value?.merchantName === item?.merchantName
        );
        setCoinsList(vaultCoins?.merchantsDetails)
        setSelectedEWallet('')
        getEwalletBalance('')
    };
    const getEwallets=async()=>{
        try {
            const response=await PackagesApiService.getEwalletAccounts();
            if(response?.ok){
                setEwallets(response?.data)
            }
        } catch (error) {
            
        }
    }
    const getEwalletBalance=async(id:any)=>{
        try {
            const response=await PackagesApiService.getEWalletBalance(id);
            if(response?.ok){    
                const updatedVaults = [...updatedVaultsList];
                const eWalletMerchant = updatedVaults.find((merchant) => merchant.merchantName == "E-Wallet");
                if (eWalletMerchant) {
                  eWalletMerchant.marchantTotalBanlance = response?.data?.balance;
                  setUpdatedVaultsList(updatedVaults)
                }
            }
        } catch (error) {
            
        }
    }
    const SearchBoxComponent = (
        <ViewComponent style={commonStyles.mb6}>
            <ViewComponent style={[commonStyles.accordianSearchContainer, commonStyles.mt6]}>
                <TextInput
                    style={[commonStyles.searchInput, commonStyles.fs16, commonStyles.fw500]}
                    onChangeText={handleChangeSearch}
                    placeholder={t("GLOBAL_CONSTANTS.SEARCH_COIN")}
                    placeholderTextColor={NEW_COLOR.PLACEHOLDER_COLOR}
                />
                <AntDesign name={FIAT_CONSTANTS?.SEARCH1} color={NEW_COLOR.SEARCH_ICON} size={ms(22)} style={styles.searchIcon} />
            </ViewComponent>
        </ViewComponent>
    );
    const gradients = [
        ['rgba(64, 123, 255, 0.26)', 'rgba(237, 243, 255, 0.26)'],
        ['rgba(10, 202, 224, 0.26)', 'rgba(237, 243, 255, 0.26)'],
        ['rgba(229, 156, 133, 0.26)', 'rgba(237, 243, 255, 0.26)'],
        ['rgba(215, 229, 133, 0.26)', 'rgba(237, 243, 255, 0.26)'],
    ];
    const  handleSelectcoupon=()=>{
        refRBSheet.current?.open()
    }
    const handleSelectEwallet=(item:any)=>{
        setSelectedEWallet(item?.name)
        getEwalletBalance(item?.id)
        setCoinsList(item)
    }
    return (
        <ViewComponent >
            {isLoading && (
                <Loadding contenthtml={buyCoinListSkelton} />
            )}
            {(!isLoading && vaultsList) && updatedVaultsList?.map((item, index) => (
                <ViewComponent key={index} style={[index !== vaultsList?.length - 1 && commonStyles.listGap, expandedIndex === index ? commonStyles.accordianActiveBorder : commonStyles.accordianInactiveBorder]}>
                    <TouchableOpacity key={item?.merchantName} onPress={() => toggleItem(index, item)} activeOpacity={0.8} style={[commonStyles.rounded5,commonStyles.vAccordinBg]}>
                        <LinearGradient
                            colors={gradients[index % gradients.length]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ borderTopLeftRadius: 5, borderTopRightRadius: 5, borderBottomLeftRadius: expandedIndex === index ? 0 : 5, borderBottomRightRadius: expandedIndex === index ? 0 : 5 }}
                        >
                            <TouchableOpacity onPress={() => toggleItem(index, item)} activeOpacity={1} style={[commonStyles.p16,]} >
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap16]}>
                                    <ParagraphComponent
                                        style={[commonStyles.fs14, commonStyles.textWhite, commonStyles.fw600,]}
                                        text={item?.merchantName}
                                    />
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>

                                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.textWhite, commonStyles.fw600,]} text={`$ ${formatCurrency(item?.marchantTotalBanlance, 2 || 0)}`} />
                                        {showRadioIcon ? <Ionicons name={expandedIndex === index ? "radio-button-on" :"radio-button-off"} size={24} color={expandedIndex === index ? NEW_COLOR.PRiMARY_COLOR : NEW_COLOR.TEXT_WHITE} />
                                         : 
                                         <SvgUri width={s(22)} style={[{ transform: [{ rotate: expandedIndex === index ? '180deg' : '0deg' }], }]} uri='https://devdottstoragespace.blob.core.windows.net/arthaimages/arthapay-mobile-images/accordian_arrow.svg' />}
                                    </ViewComponent>
                                </ViewComponent>
                            </TouchableOpacity>
                        </LinearGradient>
                    </TouchableOpacity>
                    {expandedIndex === index && (
                        <ViewComponent>
                            {(item?.merchantName !="Coupon Balance" && item?.merchantName !="E-Wallet") &&<ViewComponent>{SearchBoxComponent}</ViewComponent>}
                            {(item?.merchantName !="Coupon Balance" && item?.merchantName !="E-Wallet") &&<ViewComponent>
                                {!isLoading && coinsList?.map((subItem: any, subIndex: number) => {
                                    return (
                                        <ViewComponent>
                                            <TouchableOpacity key={subIndex} disabled={disable} onPress={() => {
                                                if (handleNavigate) {
                                                    handleNavigate(subItem, selectedVault);
                                                }
                                                else if (onSelectCoin) {
                                                    onSelectCoin(); 
                                                }
                                            }}>
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.gap8, commonStyles.alignCenter, commonStyles.accordianListStyle, { borderTopWidth: 1, borderBottomWidth: index === coinsList.length - 1 ? 0 : 1 }]}>
                                                    <ViewComponent>
                                                        <ImageUri uri={subItem?.logo} width={s(24)} height={s(24)} />
                                                    </ViewComponent>
                                                    <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.dflex, commonStyles.justify]}>

                                                        <ParagraphComponent
                                                            text={subItem?.code}
                                                            style={[commonStyles.fs12, commonStyles.fw600, commonStyles.textWhite,]}
                                                        />
                                                        <ParagraphComponent
                                                            style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textWhite,]}
                                                            numberOfLines={1}
                                                            text={formatCurrency(subItem?.balance, 2)}
                                                            children={" " + subItem?.code}
                                                        />
                                                    </ViewComponent>
                                                </ViewComponent>
                                            </TouchableOpacity>
                                            {subIndex !== coinsList?.length - 1 && (<ViewComponent style={[commonStyles.listChildGap,]} />)}
                                        </ViewComponent>
                                    );
                                })}
                                {(!coinsList || coinsList?.length === 0) && !isLoading && (
                                    <ViewComponent >
                                        <NoDataComponent  />
                                    </ViewComponent>
                                )}
                            </ViewComponent>}
                    
                            {item?.merchantName == "Coupon Balance" &&
                                <ViewComponent>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.mt16, commonStyles.mb16]}>
                                        <ViewComponent>
                                        <ImageUri  width={s(176)} height={s(92)} source={require("../../../src/assets/images/couponbox.png")} />
                                        <ViewComponent style={commonStyles.mb10} />
                                        <ButtonComponent
                                            title={"GLOBAL_CONSTANTS.SelectCoupon"}
                                            onPress={handleSelectcoupon}
                                            transparent={true}
                                            multiLanguageAllows={true}
                                        />
                                            </ViewComponent>
                                    </ViewComponent>
                                </ViewComponent>}
                                {item?.merchantName == "E-Wallet" &&
                                <ViewComponent>
                                    <ViewComponent style={[ commonStyles.mt16, commonStyles.mb16]}>
                                        <ViewComponent>
                                            <CustomPicker
                                                label="GLOBAL_CONSTANTS.SELECT_ACCOUNT"
                                                data={eWallets||[]}
                                                value={selectedEWallet}
                                                onChange={handleSelectEwallet}
                                                modalTitle="GLOBAL_CONSTANTS.SELECT_ACCOUNT"
                                                placeholder="GLOBAL_CONSTANTS.SELECT_AN_ACCOUNT"
                                            />
                                            </ViewComponent>
                                    </ViewComponent>
                                </ViewComponent>}

                        </ViewComponent>
                        
                    )}
                </ViewComponent>
            ))}
            {(!vaultsList || vaultsList?.length === 0) && !isLoading && (
                <ViewComponent >
                    <NoDataComponent  />
                </ViewComponent>
            )}
            <CustomRBSheet refRBSheet={refRBSheet}  title={"GLOBAL_CONSTANTS.SelectCoupon"} height={s(350)} >
        <SelectedCoupons refRBSheet={refRBSheet} totalAmount={totalAmount} />
      </CustomRBSheet>
        </ViewComponent>
    )
}

export default AccordionComponent;

const themedStyles = StyleService.create({
    searchInput: {
        ...text(14, 16.8, 400, NEW_COLOR.TEXT_LIGHT, true),
        position: 'relative',
        zIndex: 2,
        width: "100%",
        paddingVertical: 1,
        color: NEW_COLOR.TEXT_WHITE, paddingRight: 50
    },
    searchIcon: {
        marginTop: 4,
        width: ms(22),
        height: ms(22), position: 'absolute', right: 12
    },
    coinStyle: {
        height: 36, width: 36,
        borderRadius: 36 / 2,
        backgroundColor: "#00A478"
    },
    greybg: {
        backgroundColor: NEW_COLOR.SHEET_BG,
        flex: 1,
    },
    sheetHeader: {
        flex: 1,
        backgroundColor: NEW_COLOR.SHEET_HEADER_BG,
        borderTopRightRadius: 24,
        borderTopLeftRadius: 24,
    },

})