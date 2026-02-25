import React from "react";
import CardActionsSheetFreeze from "./freeze";
import CardActionsSheetCardInfo from "./cardInfo";
import CardActionsSheetLimit from "./limit";
import CardActionsSheetTopUp from "./topUp";
import CardActionsSheetSuccess from "./success";
import CardActionsSheetManageCard from "./manageCard";
import CardActionsSheetCardDetails from "./view";
import CardActionsSheetGeneralCardInfo from "./generalCardInfo";
import CadsActionAssignCards from "./assignCards";
import CardActionsSheetActivateCard from "./activateCard";
import ComingSoon from "../../../../commonScreens/commingSoon/comingSoon";


interface CardActionsSheetContentProps {
  isFreeze: boolean;
  isCardInfo: boolean;
  isSetPin: boolean;
  isLimit: boolean;
  isTopUp: boolean;
  isGeneralCardInfoSheet?: boolean;
  CardsInfoData: any;
  cardSuportedPlatForms: any[];
  networkData: any[];
  currencyCode: any[];
  pin: string[];
  selectedCurrency: string;
  selectedNetwork: string;
  buttonLoader: boolean;
  rbSheetErrorMsg: string;
  onFreezePress: () => void;
  onPinPress: () => void;
  onLimitPress: () => void;
  onCardInfoPress: () => void;
  onConfirmFreeze: () => void;
  onSetPinConfirm: () => void;
  onAmountChange: (value: string, setFieldValue: (field: string, value: any) => void) => void;
  handleMinValue: (setFieldValue: (field: string, value: any) => void) => void;
  handleMaxValue: (setFieldValue: (field: string, value: any) => void) => void;
  onCurrencySelect: (value: any) => void;
  onNetworkSelect: (value: any) => void;
  onTopUpSubmit: (values: any) => Promise<void>;
  onWithdrawSubmit: (values: any) => Promise<void>;
  handleRbSheetErrorMsgClose: () => void;
  iconsList: { [key: string]: JSX.Element };
  pinInputRefs: React.MutableRefObject<any[]>;
  handlePinChange: (value: string, index: number) => void;
  topupBalanceInfo: any;
  feeComissionLoading?: boolean;
  feeComissionData: any;
  topupAmount: number | string;
  mangeCard: boolean;
  bindCard?: boolean;
  bindCardPost?: (values: any) => void;
  isSuccess: boolean;
  envelopeNoRequired?: boolean;
  successAmount?: string | number;
  successCurrency?: string;
  successCardName?: string;
  onSuccessDone?: () => void;
  isWithdraw?: boolean;
  isCardDetailsSheet?: boolean;
  cardsDetails?: any;
  decryptAES?: (encryptedText: string | undefined) => string;
  onCloseSheet?: () => void;
  isBindSuccessSheet?: boolean;
  bindSuccessCardName?: string;
  onBindSuccessDone?: () => void;
  navigation?: any;
  isAssignCardSheet?: boolean;
  assignCardEmployees?: any[];
  assignCardLoading?: boolean;
  assignCardError?: string;
  selectedAssignEmployee?: any;
  setSelectedAssignEmployee?: (emp: any) => void;
  onCloseAssignCard?: () => void;
  handleCloseAssignError?: () => void;
  isAsignEmployeeLoading?: boolean;
  bindCardInfo?: any;
  viewIFrame?: string;
  webViewLoading?: boolean;
  webViewSetPinLoading?: boolean;
  setPinIFrame?: string;
  supportedPlatforms?: any[];
  activateCardDetails?: any[];
  isActivateCard?: any[];
  onActivateSuccess?: () => void;
  activateCardDetailsLoading?: boolean;
  fieldsLoading?: boolean;

}

const CardActionsSheetContent: React.FC<CardActionsSheetContentProps> = (props) => {
  const handleDone = () => {
    props.onSuccessDone && props.onSuccessDone();
  };

  if (props.isFreeze)
    return (
      <CardActionsSheetFreeze
        CardsInfoData={props.CardsInfoData}
        buttonLoader={props.buttonLoader}
        onConfirmFreeze={props.onConfirmFreeze}
        onClose={props.onCloseSheet}
      />
    );
  if (props.isCardInfo)
    return (
      <CardActionsSheetCardInfo
        cardSuportedPlatForms={props.supportedPlatforms}
        iconsList={props.iconsList}
        onClose={props.onCloseSheet || (() => { })}
      />
    );
  if (props.isSetPin)
    return (
      <ComingSoon pageHeader={false} />
    );
  if (props.isLimit)
    return (
      <CardActionsSheetLimit
        topupBalanceInfo={props.topupBalanceInfo}
        onClose={props.onCloseSheet || (() => { })}
      />
    );
  if (props.isTopUp)
    return (
      <CardActionsSheetTopUp
        topupAmount={props.topupAmount}
        selectedNetwork={props.selectedNetwork}
        currencyCode={props.currencyCode}
        networkData={props.networkData}
        topupBalanceInfo={props.topupBalanceInfo}
        feeComissionData={props.feeComissionData}
        buttonLoader={props.buttonLoader}
        feeComissionLoading={props.feeComissionLoading}
        onAmountChange={props.onAmountChange}
        handleMinValue={props.handleMinValue}
        handleMaxValue={props.handleMaxValue}
        onCurrencySelect={props.onCurrencySelect}
        onNetworkSelect={props.onNetworkSelect}
        onTopUpSubmit={props.onTopUpSubmit}
        selectedCurrency={props.selectedCurrency}
        ErrorMsgClose={props.handleRbSheetErrorMsgClose}
        onClose={props.onCloseSheet}
        CardsInfoData={props.CardsInfoData}
      />
    );

  if (props.isActivateCard)
    return (
      <CardActionsSheetActivateCard
        CardsInfoData={props.CardsInfoData}
        activateCardDetails={props.activateCardDetails}
        onClose={props.onCloseSheet}
        onSuccess={props.onActivateSuccess}
        isLoading={props.activateCardDetailsLoading}
        fieldsLoading={props?.fieldsLoading}
      />
    );

  if (props.mangeCard)
    return (
      <CardActionsSheetManageCard
        onFreezePress={props.onFreezePress}
        onPinPress={props.onPinPress}
        onLimitPress={props.onLimitPress}
        onCardInfoPress={props.onCardInfoPress}
        cardState={props?.CardsInfoData?.state}
      />
    );
  // if (props.bindCard)
  //   return (
  //     <CardActionsSheetBindCard
  //       bindCardPost={props.bindCardPost}
  //       buttonLoader={props.buttonLoader}
  //       CardsInfoData={props.CardsInfoData}
  //       bindCardInfo={props?.bindCardInfo}
  //       envelopeNoRequired={props.envelopeNoRequired}
  //     />
  //   );
  if (props.isSuccess)
    return (
      <CardActionsSheetSuccess
        navigation={props.navigation}
        amount={props.successAmount}
        currency={
          props.successCurrency && props.successCurrency.trim() !== ""
            ? props.successCurrency
            : props.currencyCode && props.currencyCode.length > 0 ? props.currencyCode[0]?.currencyCode : undefined
        }
        cardName={props.successCardName}
        onDone={handleDone}
        isWithdraw={props.isWithdraw}
      />
    );
  if (props.isCardDetailsSheet)
    return (
      <CardActionsSheetCardDetails
        cardHolderName={props.CardsInfoData?.name}
        CardsInfoData={props.CardsInfoData}
        cardsDetails={props.cardsDetails}
        decryptAES={props.decryptAES!}
        onClose={props.onCloseSheet || (() => { })}
        viewIFrame={props?.viewIFrame}
        webViewLoading={props?.webViewLoading}
      />
    );
  // if (props.isBindSuccessSheet)
  //   return (
  //     <BindCardSuccess
  //       cardName={props.bindSuccessCardName}
  //       onDone={props.onBindSuccessDone || (() => { })}
  //     />
  //   );
  if (props.isAssignCardSheet)
    return (
      <CadsActionAssignCards
        onClose={props.onCloseAssignCard || (() => { })}
        loading={props.assignCardLoading || false}
        employees={props.assignCardEmployees || []}
        selectedEmployee={props.selectedAssignEmployee || null}
        setSelectedEmployee={props.setSelectedAssignEmployee || (() => { })}
        error={props.assignCardError || ''}
        onErrorClose={props.handleCloseAssignError || (() => { })}
        isSaveLoading={props?.isAsignEmployeeLoading}

      />
    );

  if (props.isGeneralCardInfoSheet)
    return (
      <CardActionsSheetGeneralCardInfo
        CardsInfoData={props.CardsInfoData}
        onClose={props.onCloseSheet || (() => { })}
      />
    );

  return null;
};

export default React.memo(CardActionsSheetContent);