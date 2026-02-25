import React, { useEffect, useMemo } from "react";
import ViewComponent from "../../../../components/view/view";
import { CurrencyText } from "../../../../components/textComponets/currencyText/currencyText";
import AutoSlideCarousel from "../../../commonScreens/autoSliderCarousal/contentCarousel";
import { DashboardGraph } from "../../../../assets/svg";
import { s } from "../../../../constants/styels/scale";
import ImageUri from "../../../../components/imageComponents/image";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import ProfileService from "../../../../apiServices/profile";
import { setScreenPermissions } from "../../../../redux/actions/actions";
import { CRYPTO_CONSTANTS } from "../../payments/constants";
import { isDecimalSmall } from '../../../../../configuration';
interface CommonStyles {
    fs24: object; // Replace 'object' with a more specific style type if available
    fs28: object;
    dflex: object;
    alignCenter: object;
    justifyContent: object;
    gap6: object;
    fw400: object;
    textlinkgrey: object;
    textLeft: object;
    fs14: object;
    flex1: object;
    fw500: object;
    fw700: object;
    textWhite: object;
    fs26: object;
    fs22: object;
    mt4: object;
    alignStart: object;
    gap10: object;
    textGreen: object;
    fs12: object;
    sectionGap: object;
    gap4?: object; // Added gap4
    fs18?: object;
    // Add other style properties used in this component
}

interface UserInfo {
    currency?: string; // Changed to optional to match usage
    // Add other relevant userInfo properties
}

interface NewColor {
    // Define the structure of NEW_COLOR, e.g. TEXT_GREEN: string;
    [key: string]: string;
}
interface BalanceCarouselProps {
    allBalanceInfo: number | string;
    fiatAmount: number | string;
    currencyCode: string;
    userInfo: UserInfo;
    cryptoAmount: number | string;
}

const BalanceCarousel: React.FC<BalanceCarouselProps> = ({ allBalanceInfo, fiatAmount, cryptoAmount, currencyCode, userInfo, }) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const handleFontSize = (amount: number | string) => {
        const totalAmount = amount?.toString();
        if (totalAmount?.length > 9) {
            return commonStyles.fs24;
        } else {
            return commonStyles.fs28;
        }
    };
    const dispatch = useDispatch<any>();
    const isFocused = useIsFocused();
    const subScreens = useSelector((state: any) => state.userReducer?.screenPermissions);
    const menuItems = useSelector((state: any) => state.userReducer?.menuItems);
    const walletsPermissionId = menuItems?.find((item: any) => item?.featureName.toLowerCase() === CRYPTO_CONSTANTS.WALLETS)?.id;

    useEffect(() => {
        if (walletsPermissionId && !subScreens?.Vaults) {
            ProfileService.getScreenPermissions(walletsPermissionId).then((res: any) => {
                if (res?.data) {
                    dispatch(setScreenPermissions({ Vaults: res?.data }));
                }
            }).catch((error: any) => {
            });
        }
    }, [isFocused, walletsPermissionId, subScreens.Vaults]);


    const walletsActionsPermissions = subScreens?.Vaults?.permissions;
    const CryptoWalletsPermission = walletsActionsPermissions?.tabs?.find((tab: any) => tab.name?.replaceAll(' ', '')?.toLowerCase() === CRYPTO_CONSTANTS.CRYPTO_ACTION)?.isEnabled;
    const FiatWalletsPermission = walletsActionsPermissions?.tabs?.find((tab: any) => tab.name?.replaceAll(' ', '')?.toLowerCase() === CRYPTO_CONSTANTS.FIAT_ACTION)?.isEnabled;
    const cryptoLogos = [
        // "https://devtstarthaone.blob.core.windows.net/arthaimages/MYRC.svg",
        "https://rapidzstoragespacetst.blob.core.windows.net/images/MYRC.svg",
        "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/usdt.svg",
        "https://devtstarthaone.blob.core.windows.net/arthaimages/XSGD.svg",
        "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/usdc.svg",
    ];

    const fiatLogos = [
        "https://rapidzstorageprd.blob.core.windows.net/images/brl.svg",
        "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/EUR.svg",
        "https://devtstarthaone.blob.core.windows.net/arthaimages/indonesia - Icon.svg",
        "https://rapidzstoragespacetst.blob.core.windows.net/images/usdflag.svg",

    ]
    const carouselSlideContent = (
        key: string,
        title: string,
        balance: number | string,
        gainText: string,
        percentageText: string,
        type: "total" | "crypto" | "fiat"
    ) => (
        <ViewComponent
            key={key}
            style={[
                commonStyles.dflex,
                commonStyles.alignCenter,
                commonStyles.justifyContent,
                { width: "98%", paddingHorizontal: s(0), paddingVertical: s(0), },
            ]}
        >
            <ViewComponent style={[commonStyles.flex1]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mt12]}>
                    <ParagraphComponent
                        text={title}
                        style={[
                            commonStyles.Amounttextlabel
                        ]}
                        numberOfLines={1}
                    />
                </ViewComponent>
                <CurrencyText
                    smallDecimal={isDecimalSmall}
                    value={Number(balance) || 0}
                    decimalPlaces={2}
                    prifix={currencyCode}
                    symboles={true}
                    style={[
                        handleFontSize(balance || 0),
                        commonStyles.Amounttext,
                        commonStyles.mb10
                    ]}
                />
            </ViewComponent>

            {/* Show different visuals per type */}
            {type === "total" && <DashboardGraph width={s(116)} height={s(37)} />}

            {type === "fiat" && (
                <ViewComponent style={[commonStyles.dflex, { alignItems: "center" }]}>
                    {fiatLogos.map((merchantDetail: string, idx: number) => (
                        <ImageUri
                            style={{
                                marginLeft: idx === 0 ? 0 : -s(7),
                                zIndex: fiatLogos.length + idx,
                            }}
                            height={s(30)}
                            width={s(30)}
                            key={`${merchantDetail}-${idx}`}
                            uri={merchantDetail}
                        />
                    ))}
                </ViewComponent>
            )}

            {type === "crypto" && (
                <ViewComponent style={[commonStyles.dflex, { alignItems: "center" }]}>
                    {cryptoLogos.map((merchantDetail: string, idx: number) => (
                        <ImageUri
                            style={{
                                marginLeft: idx === 0 ? 0 : -s(7),
                                zIndex: cryptoLogos.length + idx,
                            }}
                            height={s(30)}
                            width={s(30)}
                            key={`${merchantDetail}-${idx}`}
                            uri={merchantDetail}
                        />
                    ))}
                </ViewComponent>
            )}
        </ViewComponent>
    );


    const carouselData = useMemo(() => {
        return ([
            carouselSlideContent("slide1", "GLOBAL_CONSTANTS.TOTAL_BALANCE", allBalanceInfo || 0, "+$315.20", "0.74%", "total"),
            CryptoWalletsPermission && carouselSlideContent("slide2", "GLOBAL_CONSTANTS.CRYPTO", cryptoAmount, "+$215.20", "0.81%", "crypto"),
            FiatWalletsPermission && carouselSlideContent("slide3", "GLOBAL_CONSTANTS.FIAT", fiatAmount, "+$215.20", "0.81%", "fiat"),
        ]).filter(Boolean);
    }, [allBalanceInfo, fiatAmount, cryptoAmount, currencyCode, commonStyles, NEW_COLOR, CryptoWalletsPermission, FiatWalletsPermission]);

    return (
        <ViewComponent style={[commonStyles.sectionGap]}>
            <AutoSlideCarousel
                data={carouselData}
                duration={5000}
                height={s(61)}
            />
        </ViewComponent>
    );
};

export default React.memo(BalanceCarousel);