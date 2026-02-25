import React, { useCallback, useState } from "react";
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import { s } from "../../../../../constants/styels/scale";
import ViewComponent from "../../../../../components/view/view";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import ParagraphComponent from "../../../../../components/textComponets/paragraphText/paragraph";
import CustomRBSheet from "../../../../../components/models/commonDrawer";
import ButtonComponent from "../../../../../components/buttons/button";
import AmountInput from "../../../../../components/amountInput/amountInput";
import { useLngTranslation } from "../../../../../hooks/languagesHook/useLngTranslation";
import { CurrencyText } from "../../../../../components/textComponets/currencyText/currencyText";

interface AddToWalletModalProps {
    refRBSheet: any;
    selectCurrency: any;
    amountToAdd: string;
    setAmountToAdd: (amount: string) => void;
    topupBalanceInfo: any;
    addWalletErrors: any;
    onContinue: () => void;
    onClose: () => void;
    setAddWalletErrors: any;
}

const AddToWalletModal: React.FC<AddToWalletModalProps> = ({
    refRBSheet,
    selectCurrency,
    amountToAdd,
    setAmountToAdd,
    topupBalanceInfo,
    addWalletErrors,
    onContinue,
    onClose,
    setAddWalletErrors
}) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { t } = useLngTranslation();
    const [convertValue, setConvertValue] = useState<any>(0);

    const handleAmountInputChange = useCallback((text: any) => {
        if (text) {
            setAddWalletErrors('');
            setConvertValue(text * (selectCurrency?.currencyCode === 'USDT' ? 1 : topupBalanceInfo?.xpToUsdtRate ?? '0'));
        } else {
            setAddWalletErrors('Is required');
        }
        setAmountToAdd(text.toString());
    }, [selectCurrency?.currencyCode, setAddWalletErrors, setAmountToAdd, topupBalanceInfo?.xpToUsdtRate]);

    const handleMinPress = useCallback(() => {
        setConvertValue((selectCurrency?.currencyCode === 'USDT' ? 1 : topupBalanceInfo?.xpToUsdtRate ?? '0') * (selectCurrency?.currencyCode === 'USDT' ? topupBalanceInfo?.minUsdt.toString() : topupBalanceInfo?.minXp.toString() ?? '0'));
        setAmountToAdd(selectCurrency?.currencyCode === 'USDT' ? topupBalanceInfo?.minUsdt.toString() : topupBalanceInfo?.minXp.toString() ?? '0');
        setAddWalletErrors('');
    }, [selectCurrency?.currencyCode, setAddWalletErrors, setAmountToAdd, topupBalanceInfo?.minUsdt, topupBalanceInfo?.minXp, topupBalanceInfo?.xpToUsdtRate]);

    const handleMaxPress = useCallback(() => {
        setAmountToAdd(selectCurrency?.balance.toString());
        setConvertValue((selectCurrency?.currencyCode === 'USDT' ? 1 : topupBalanceInfo?.xpToUsdtRate ?? '0') * selectCurrency?.balance);
        setAddWalletErrors('');
    }, [selectCurrency?.balance, selectCurrency?.currencyCode, setAddWalletErrors, setAmountToAdd, topupBalanceInfo?.xpToUsdtRate]);

    return (
        <CustomRBSheet
            refRBSheet={refRBSheet}
            height={"Medium"}
            closeOnPressMask={true}
            onClose={() => { }}
            customStyles={{ container: { borderTopLeftRadius: s(30), borderTopRightRadius: s(30), backgroundColor: NEW_COLOR.BACKGROUND_MODAL } }}
        >
            <ViewComponent style={[]}>
                <ParagraphComponent
                    text={`${t('GLOBAL_CONSTANTS.CONVERT')} ${selectCurrency?.currencyCode}`}
                    style={[commonStyles.pageTitle, commonStyles.textCenter, commonStyles.mb30]}
                />
                <ViewComponent style={[commonStyles.sectionGap]}>
                    <ViewComponent style={{ poition: "relative" }}>
                        {selectCurrency?.currencyCode == 'XP' && (
                            <ParagraphComponent
                                text={`${t('GLOBAL_CONSTANTS.EXCHANGE_RATE')}: 1 XP = ${topupBalanceInfo?.xpToUsdtRate} USDT`}
                                style={[commonStyles.fs12, commonStyles.textlinkgrey, commonStyles.fw500, commonStyles.textRight, { position: "absolute", right: 0, top: -s(4) }]}
                            />
                        )}
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.mt10]}>
                        <AmountInput
                            placeholder="GLOBAL_CONSTANTS.ENTER_AMOUNT"
                            maxLength={16}
                            onChangeText={handleAmountInputChange}
                            value={amountToAdd}
                            onMinPress={handleMinPress}
                            onMaxPress={handleMaxPress}
                            label="GLOBAL_CONSTANTS.AMOUNT"
                            minLimit={selectCurrency?.currencyCode === 'USDT' ? topupBalanceInfo?.minUsdt : topupBalanceInfo?.minXp ?? 0}
                            maxLimit={selectCurrency?.balance ?? 0}
                            topupBalanceInfo={topupBalanceInfo}
                            maxDecimals={8}
                            showError=""
                        />
                        {addWalletErrors ? (
                            <ParagraphComponent text={addWalletErrors} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textRed, commonStyles.mt4]} />
                        ) : null}
                        {(!addWalletErrors && convertValue) &&
                            <ViewComponent style={[commonStyles.mt16]}>
                                <CurrencyText value={convertValue} prifix={t("GLOBAL_CONSTANTS.CONVERT_VALUE")} currency={'USDT'} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite, commonStyles.mt4]} /></ViewComponent>}
                    </ViewComponent>
                </ViewComponent>

                <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.mt40]}>
                    <ViewComponent style={[commonStyles.flex1]}>
                        <ButtonComponent title={"GLOBAL_CONSTANTS.CONTINUE"} onPress={onContinue} />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.flex1]}>
                        <ButtonComponent title={"GLOBAL_CONSTANTS.CLOSE"} onPress={onClose} solidBackground={true} />
                    </ViewComponent>
                </ViewComponent>
            </ViewComponent>
        </CustomRBSheet>
    );
};

export default AddToWalletModal;
