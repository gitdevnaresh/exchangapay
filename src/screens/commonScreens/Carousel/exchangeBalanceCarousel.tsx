import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import ViewComponent from "../../../components/view/view";
import AutoSlideCarousel from "../autoSliderCarousal/contentCarousel";
import { s } from "../../../components/theme/scale";
import { CurrencyText } from "../../../components/textComponets/currencyText/currencyText";
import TextMultiLanguage from "../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ImageUri from "../../../components/imageComponents/image";
import FlatListComponent from "../../../components/flatList/flatList";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";
import { CoinImages, getThemedCommonStyles, WalletsfiatLogos, cryptoLogos } from "../../../components/CommonStyles";
import { RootState } from "../../fintechApp/Exchange/constants/constants";
import { BalanceCarouselProps } from "../../fintechApp/Exchange/interfaces/exchangeInterfaces";
import { getTabsConfigation, isDecimalSmall } from '../../../../configuration';



const ExchangeBalanceCarousel: React.FC<BalanceCarouselProps> = ({
    cryptoBalance,
    fiatBalance,
    apiData = [],
    assets,

}) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
    const userInfo = useSelector((state: RootState) => state.userReducer?.userDetails);
    const currency: Record<string, string> | undefined = getTabsConfigation('CURRENCY');

    // Get API data items for checking names
    const cryptoItem = apiData?.find((item) => item?.name === 'Crypto Balance');
    const fiatItem = apiData?.find((item) => item?.name === 'Fiat Balance');

    const handleFontSize = (amount: number | string) => {
        const totalAmount = amount?.toString();
        if (totalAmount?.length > 9) {
            return commonStyles.fs24;
        } else {
            return commonStyles.fs28;
        }
    };

    const carouselSlideContent = (key: string, title: string, balance: number | string) => (
        <ViewComponent key={key} style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
            <ViewComponent>
                <TextMultiLanguage text={title} style={[commonStyles.Amounttextlabel]} />
                <CurrencyText
                    value={Number(balance) || 0}
                    symboles={true}
                    style={[handleFontSize(balance || 0), commonStyles.Amounttext]}
                    smallDecimal={isDecimalSmall}
                    prifix={currency[userInfo?.currency]}
                />
            </ViewComponent>

            {fiatItem?.name?.toLowerCase() === 'fiat balance' && title === "GLOBAL_CONSTANTS.FIAT_BALANCE" && (
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mt16]}>
                    <FlatListComponent
                        data={assets?.fiat?.length ? assets.fiat : WalletsfiatLogos}
                        horizontal
                        renderItem={({ item, index: idx }) => (
                            <ImageUri
                                style={{
                                    marginLeft: idx === 0 ? 0 : -s(7),
                                    zIndex: (assets?.fiat?.length || WalletsfiatLogos.length) + idx,
                                }}
                                height={s(30)}
                                width={s(30)}
                                uri={typeof item === 'string' ? item : CoinImages[item?.code?.toLowerCase()] || item?.image || ''}
                            />
                        )}
                        keyExtractor={(item, index) => typeof item === 'string' ? `fiat-${index}` : `${item.code}-${index}`}
                        showsHorizontalScrollIndicator={false}
                    />
                </ViewComponent>
            )}

            {cryptoItem?.name?.toLowerCase() === 'crypto balance' && title === "GLOBAL_CONSTANTS.CRYPTO_BALANCE" && (
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mt16]}>
                    <FlatListComponent
                        data={assets?.crypto?.length ? assets.crypto : cryptoLogos}
                        horizontal
                        renderItem={({ item, index: idx }) => (
                            <ImageUri
                                style={{
                                    marginLeft: idx === 0 ? 0 : -s(7),
                                    zIndex: (assets?.crypto?.length || cryptoLogos.length) + idx,
                                }}
                                height={s(30)}
                                width={s(30)}
                                uri={typeof item === 'string' ? item : CoinImages[item?.code?.toLowerCase()] || item?.image || ''}
                            />
                        )}
                        keyExtractor={(item, index) => typeof item === 'string' ? `crypto-${index}` : `${item.code}-${index}`}
                        showsHorizontalScrollIndicator={false}
                    />
                </ViewComponent>
            )}
        </ViewComponent>
    );

    const carouselData = useMemo(() => {
        return [
            carouselSlideContent("slide1", "GLOBAL_CONSTANTS.CRYPTO_BALANCE", cryptoBalance),
            carouselSlideContent("slide2", "GLOBAL_CONSTANTS.FIAT_BALANCE", fiatBalance),
        ];
    }, [cryptoBalance, fiatBalance, commonStyles, cryptoItem, fiatItem, assets]);

    return (
        <ViewComponent>
            <AutoSlideCarousel
                data={carouselData}
                duration={5000}
                height={s(90)}
            />
        </ViewComponent>
    );
};

export default React.memo(ExchangeBalanceCarousel);
