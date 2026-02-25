import React from "react";
import ViewComponent from '../../../../../../components/view/view';
import ParagraphComponent from '../../../../../../components/textComponets/paragraphText/paragraph';
import TextMultiLanguage from '../../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import SvgFromUrl from '../../../../../../components/svgIcon';
import { formatCurrency } from '../../../../../../utils/helpers';
import { s } from '../../../../../../components/theme/scale';
import { PAYOUT_CONSTANTS } from '../../payOutConstants';
import { useThemeColors } from '../../../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../../../components/CommonStyles';
import { CurrencyText } from '../../../../../../components/textComponets/currencyText/currencyText';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
interface SummaryDetailsSectionProps {
    propsData: any;
}

const SummaryDetailsSection: React.FC<SummaryDetailsSectionProps> = ({ propsData }) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { t } = useTranslation();
    return (
        <>
            {/* Header Section */}
            {/* <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.gap8, commonStyles.alignCenter]}>
                    <SvgFromUrl
                        uri={propsData?.logo}
                        width={s(24)}
                        height={s(24)}
                    />
                    <ViewComponent>
                        <ParagraphComponent
                            style={[commonStyles.listprimarytext]}
                            text={propsData?.coinName || propsData?.walletCode}
                        />
                        {propsData?.paymentType === PAYOUT_CONSTANTS?.CRYPTO && (
                            <ParagraphComponent
                                style={[commonStyles.listsecondarytext]}
                                text={propsData?.networkName || propsData?.network}
                            />
                        )}
                    </ViewComponent>
                </ViewComponent>
                <ViewComponent>
                     {propsData?.paymentType === PAYOUT_CONSTANTS?.CRYPTO ?
                    <ParagraphComponent
                        style={[commonStyles.textWhite, commonStyles.fs24, commonStyles.fw600]}
                        text={formatCurrency(propsData?.balance, 4)}
                    />:
                    <ParagraphComponent
                        style={[commonStyles.textWhite, commonStyles.fs24, commonStyles.fw600]}
                        text={formatCurrency(propsData?.balance, 2)}
                    />}
                </ViewComponent>
            </ViewComponent>

            <ViewComponent style={commonStyles.sectionGap} /> */}

            {/* Transaction Details Section */}
            <ParagraphComponent
                style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]}
                text={"GLOBAL_CONSTANTS.TRANSFER_DETAILS"} multiLanguageAllows
            />

            <ViewComponent style={[commonStyles.sectionGap]}>

                {propsData?.paymentType === PAYOUT_CONSTANTS?.CRYPTO && (
                    <ViewComponent>
                        <ViewComponent style={[commonStyles.listitemGap]} />
                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                            <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.NETWORK"} />
                            <ParagraphComponent style={[commonStyles.listprimarytext]} text={propsData?.network} />
                        </ViewComponent>
                    </ViewComponent>
                )}

                <ViewComponent style={[commonStyles.listitemGap]} />
                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                    <ViewComponent>
                        <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.TOTAL_AMOUNT"} />
                    </ViewComponent>
                    <ViewComponent>
                        {propsData?.paymentType === PAYOUT_CONSTANTS?.CRYPTO ? <CurrencyText
                            style={[commonStyles.listprimarytext]}
                            value={`${propsData?.amount}`} decimalPlaces={4} currency={propsData?.walletCode}
                        /> :
                            <CurrencyText style={[commonStyles.listprimarytext]} value={`${propsData?.amount}`} currency={propsData?.walletCode} />}
                    </ViewComponent>
                </ViewComponent>

                <ViewComponent style={[commonStyles.listitemGap]} />
                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                    <ViewComponent>
                        <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.FEE"} />
                    </ViewComponent>
                    <ViewComponent>
                        {propsData?.paymentType === PAYOUT_CONSTANTS?.CRYPTO ?
                            <CurrencyText style={[commonStyles.listprimarytext]} value={propsData?.fee || 0} currency={propsData?.walletCode} decimalPlaces={4} />
                            :
                            <CurrencyText style={[commonStyles.listprimarytext]} value={propsData?.fee || 0} currency={propsData?.walletCode} decimalPlaces={2} />}
                    </ViewComponent>
                </ViewComponent>

                <ViewComponent style={[commonStyles.listitemGap]} />
                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                    <ViewComponent>
                        <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.RECEIVE_AMOUNT"} />
                    </ViewComponent>
                    <ViewComponent>
                        {(propsData?.paymentType === PAYOUT_CONSTANTS.CRYPTO) ? <CurrencyText
                            style={[commonStyles.listprimarytext]}
                            value={`${propsData?.finalAmount}`} decimalPlaces={2} currency={propsData?.fiatCurrency}
                        /> :
                            <CurrencyText
                                style={[commonStyles.listprimarytext]}
                                value={`${propsData?.finalAmount}`} currency={propsData?.fiatCurrency} decimalPlaces={2}
                            />}
                    </ViewComponent>
                </ViewComponent>
            </ViewComponent>

            {/* Payee Section */}
            {/* {propsData?.paymentType === PAYOUT_CONSTANTS?.CRYPTO && (
                <ParagraphComponent
                    style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]}
                    text={"GLOBAL_CONSTANTS.PAYEE"} multiLanguageAllows
                />
            )} */}

            <ParagraphComponent
                style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]}
                text={"GLOBAL_CONSTANTS.RECIPIENT_DETAILS"} multiLanguageAllows
            />


            <ViewComponent>

                {propsData?.favouriteName && (
                    <>
                        <ViewComponent style={commonStyles.listitemGap} />
                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                            <TextMultiLanguage
                                style={[commonStyles.listsecondarytext]}
                                text={"GLOBAL_CONSTANTS.FAVORITE_NAME"}
                            />
                            <ParagraphComponent
                                style={[commonStyles.listprimarytext]}
                                text={propsData?.favouriteName || ""}
                            />
                        </ViewComponent>
                    </>
                )}

                {propsData?.beneficiaryName && (
                    <>
                        <ViewComponent style={commonStyles.listitemGap} />
                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                            <ParagraphComponent
                                style={[commonStyles.listsecondarytext]}
                                text={"GLOBAL_CONSTANTS.BENEFICIARY_NAME"} multiLanguageAllows
                            />
                            <ParagraphComponent
                                style={[commonStyles.listprimarytext, commonStyles.alignEnd, commonStyles.textRight, commonStyles.flex1]}
                                text={propsData?.beneficiaryName || ""}
                            />
                        </ViewComponent>
                    </>
                )}

                {propsData?.accNoorWalletAddress && (
                    <>
                        <ViewComponent style={commonStyles.listitemGap} />
                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                            <TextMultiLanguage
                                style={[commonStyles.listsecondarytext]}
                                text={"GLOBAL_CONSTANTS.IBAN_ACCOUNT_NUMBER"}
                            />
                            <ParagraphComponent
                                style={[commonStyles.listprimarytext]}
                                text={propsData?.accNoorWalletAddress || ""}
                            />
                        </ViewComponent>
                    </>
                )}
                {propsData?.paymentTypeapi && (

                    <>
                        <ViewComponent style={commonStyles.listitemGap} />
                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                            <TextMultiLanguage
                                style={[commonStyles.listsecondarytext]}
                                text={"GLOBAL_CONSTANTS.PAYMENT_TYPE"}
                            />
                            <ParagraphComponent
                                style={[commonStyles.listprimarytext]}
                                text={propsData?.paymentTypeapi || "--"}
                            />
                        </ViewComponent>
                    </>
                    )}
                      {propsData?.bankName && (
                            <>
                                <ViewComponent style={commonStyles.listitemGap} />
                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                    <TextMultiLanguage
                                        style={[commonStyles.listsecondarytext]}
                                        text={"GLOBAL_CONSTANTS.NAME_OF_THE_BANK"}
                                    />
                                    <ParagraphComponent
                                        style={[commonStyles.listprimarytext]}
                                        text={propsData?.bankName || ""}
                                    />
                                </ViewComponent>
                            </>
                        )}
                    {propsData?.transferType && (
                        <>
                            <ViewComponent style={commonStyles.listitemGap} />
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                <TextMultiLanguage
                                    style={[commonStyles.listsecondarytext]}
                                    text={"GLOBAL_CONSTANTS.TRANSFER_TYPE"}
                                />
                                <ParagraphComponent
                                    style={[commonStyles.listprimarytext]}
                                    text={propsData?.transferType || "--"}
                                />
                            </ViewComponent>
                        </>
                    )}
                </ViewComponent>
            <ViewComponent style={commonStyles.sectionGap} />
            <ViewComponent style={[commonStyles.bgnote, commonStyles.sectionGap]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.gap8]}>
                    <ViewComponent>
                        <MaterialIcons name="info-outline" size={s(18)} color={NEW_COLOR.NOTE_ICON} />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.flex1]}>
                        <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textWhite]} text={t("GLOBAL_CONSTANTS.PAYOUT_SUMMARY_NOTE")} />
                    </ViewComponent>
                </ViewComponent>
            </ViewComponent>

            <ViewComponent style={commonStyles.sectionGap} />
        </>
    );
};

export default SummaryDetailsSection;