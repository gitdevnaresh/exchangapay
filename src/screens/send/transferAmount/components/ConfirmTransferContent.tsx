import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import ViewComponent from '../../../../newComponents/view/view';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { CurrencyText } from '../../../../newComponents/textComponets/currencyText/currencyText';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import ButtonComponent from '../../../../newComponents/buttons/button';
import { Ionicons } from '@expo/vector-icons';
import { s } from '../../../../constants/theme/scale';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import AuthVerification from '../../../commonScreens/authentication';
import useEncryptDecrypt from '../../../../hooks/encDecHook';
import { isErrorDispaly } from '../../../../utils/helpers';
import SendServices from '../../../../services/send';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';

interface ConfirmTransferContentProps {
  amount: string;
  currency: string;
  recipient: any;
  note?: string;
  purposeOfTransfer?: string;
  relationshipWithRecipient?: string;
  feeDetails?: {
    fee: string;
    concurrencyStamp?: string;
  };
  actionType?: string;
  recipientName?: string;
  onClose: () => void;
  isFromRecentPayees?: boolean;
  fullName?: string;
  scanFullName?: string;
}

const ConfirmTransferContent: React.FC<ConfirmTransferContentProps> = ({
  amount,
  currency,
  recipient,
  note,
  purposeOfTransfer,
  relationshipWithRecipient,
  feeDetails,
  actionType,
  recipientName,
  isFromRecentPayees,
  onClose,
  fullName,
  scanFullName
}) => {
  const navigation = useNavigation<any>();
  const { encryptAES, decryptAES } = useEncryptDecrypt();
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const DecryptEmail = decryptAES(userInfo?.email);
  const [loading, setLoading] = useState<boolean>(false);
  const [authOpen, setAuthOpen] = useState(false);
  const NEW_COLOR = useThemeColors();
  const REVERSE_NEW_COLOR = useThemeColors(true);
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const reversCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
  const recepientEmail = decryptAES(recipient?.email);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const firstName = decryptAES(userInfo?.firstName);
  const lastName = decryptAES(userInfo?.lastName);
  const decryptCode = decryptAES(recipient?.phoneCode)
  const decryptPhone = decryptAES(recipient?.phoneNumber);
  const recientName = recipientName ||
    (actionType === "EMAIL" ? decryptAES(recipient.email)
      : actionType === "PHONE" ? `${decryptCode}${decryptPhone}`
        : actionType === "BULLSWIPE_ID" ? recipient?.customerId
          : "")

  const handleConfirmSuccess = async () => {
    setErrorMessage("");
    let payload: any = {
      currency: currency,
      receiverId: recipient.id || recipient,
      amount: amount,
      network: "",
      note: note,
      purposeOfTransfer: purposeOfTransfer,
      relationshipWithRecipient: relationshipWithRecipient,
      type: actionType||"BULLSWIPE_ID"
    };

    // Add type-specific fields based on actionType
    if (actionType === "EMAIL") {
      payload.receiverName = encryptAES(recepientEmail);
    } else if (actionType === "PHONE") {
      payload.receiverName = isFromRecentPayees ? encryptAES(recipient.phone) : encryptAES(`${decryptCode} ${decryptPhone}`);
    } else if (actionType === "BULLSWIPE_ID") {
      payload.receiverName = recipient?.customerId;
    } else {
      payload.receiverName = encryptAES(recientName);
    }
    try {
      const response = await SendServices.sendSave(payload)
      if (response.status === 200) {
        onClose();
        navigation.navigate("SendSuccess", { transactionId: response?.data })
      }
      else {
        setErrorMessage(isErrorDispaly(response));
      }
    }
    catch (error) {
      setErrorMessage(isErrorDispaly(error));
    }
    finally {
      setLoading(false);
    }

  };
  const handlePopupClose = () => {
    onClose();
  }
  const handleAuthClose = () => {
    setAuthOpen(false);
    setLoading(false);
  };
   const handleAuthSuccess = (verifications: any) => {
    setAuthOpen(false);
    handleConfirmSuccess();
  };

  const verifyAuth = () => {
    setErrorMessage("")
    setAuthOpen(true);
    setLoading(true);
  };
  return (
    <ViewComponent style={[commonStyles.flex1]}>
      {errorMessage && <ErrorComponent message={errorMessage} onClose={() => setErrorMessage("")} />}
      {/* Amount */}
      <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter]}>
        <TextMultiLanguage
          text="GLOBAL_CONSTANTS.CONFIRM_PAYMENT"
          style={[commonStyles.fs16, commonStyles.fw700, reversCommonStyles.textWhite, commonStyles.mb16]}
        />
      </ViewComponent>
      <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter]}>

        <ViewComponent style={[]}>
          <ParagraphComponent style={[commonStyles.fs30, commonStyles.fw700, reversCommonStyles.textWhite]} text={"-"} />
        </ViewComponent>
        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter]}>
          <CurrencyText
            value={amount}  
            style={[commonStyles.fs30, commonStyles.fw700, reversCommonStyles.textWhite]}
          // symboles={true}
          />
          <ParagraphComponent
            text={currency}
            style={[commonStyles.fs14, commonStyles.fw700, commonStyles.textGrey,commonStyles.mt12]}
          />
        </ViewComponent>
      </ViewComponent>
      <ViewComponent style={[commonStyles.mb16]}>
        <TextMultiLanguage text={"GLOBAL_CONSTANTS.RECIPIENT"} style={[commonStyles.fs14, commonStyles.fw700, reversCommonStyles.textWhite, commonStyles.mb8]} />
        <ViewComponent style={[commonStyles.sendBg, { backgroundColor: REVERSE_NEW_COLOR.TEXT_GREY4 }]}>
          <Ionicons name="person-outline" size={s(24)} color={REVERSE_NEW_COLOR.TEXT_GREY} />
          <ViewComponent style={[]}>
          <ParagraphComponent text={recientName} style={[commonStyles.fs16, commonStyles.fw400, reversCommonStyles.textWhite]} />
          <ParagraphComponent text={decryptAES(recipient.fullName)||decryptAES(fullName||"")||scanFullName} style={[commonStyles.fs16, commonStyles.fw400, reversCommonStyles.textWhite]} />
          </ViewComponent>
        </ViewComponent>
      </ViewComponent>
      {/* Details Section Title */}
      <TextMultiLanguage
        text="GLOBAL_CONSTANTS.SEND_INFORMATION"
        style={[commonStyles.fs14, commonStyles.fw700, reversCommonStyles.textWhite, commonStyles.mb16]}
      />

      <ViewComponent style={[commonStyles.bordered, reversCommonStyles.borderColor, commonStyles.p10, commonStyles.mb24,commonStyles.p8]}>
        {/* Recipient */}
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mb10]}>
          <TextMultiLanguage text="GLOBAL_CONSTANTS.NAME" style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]} />
          <ParagraphComponent text={(firstName + " " + lastName) || ""} style={[commonStyles.fs14, commonStyles.fw400, reversCommonStyles.textWhite]} numberOfLines={1} />
        </ViewComponent>
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mb10]}>
          <TextMultiLanguage text="GLOBAL_CONSTANTS.E_MAIL" style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]} />
          <ParagraphComponent text={DecryptEmail} style={[commonStyles.fs14, commonStyles.fw400, reversCommonStyles.textWhite]} numberOfLines={1} />
        </ViewComponent>
        {/* Note */}
        {note && (
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mb10]}>
            <TextMultiLanguage text="GLOBAL_CONSTANTS.NOTE_TEXT" style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]} numberOfLines={1} />
            <ParagraphComponent text={note || ""} style={[commonStyles.fs14, commonStyles.fw400, reversCommonStyles.textWhite,{width:"50%"},commonStyles.textRight]} numberOfLines={3}  />
          </ViewComponent>
        )}

        {/* Purpose of Transfer */}
        {purposeOfTransfer && (
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mb10]}>
            <TextMultiLanguage text="GLOBAL_CONSTANTS.PURPOSE_OF_TRANSFER" style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]} numberOfLines={1} />
            <ParagraphComponent text={purposeOfTransfer || ""} style={[commonStyles.fs14, commonStyles.fw400, reversCommonStyles.textWhite]} numberOfLines={1} />
          </ViewComponent>
        )}

        {/* Relationship */}
        {relationshipWithRecipient && (
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mb10]}>
            <TextMultiLanguage text="GLOBAL_CONSTANTS.RELATIONSHIP_WITH_RECIPIENT" style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]} numberOfLines={1} />
            <ParagraphComponent text={relationshipWithRecipient || ""} style={[commonStyles.fs14, commonStyles.fw400, reversCommonStyles.textWhite]} numberOfLines={1} />
          </ViewComponent>
        )}

        {/* Fee */}
        {feeDetails && (
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
            <TextMultiLanguage text="GLOBAL_CONSTANTS.FEE" style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]} numberOfLines={1} />
            <CurrencyText value={feeDetails} currency={currency} style={[commonStyles.fs14, commonStyles.fw400, reversCommonStyles.textWhite]} numberOfLines={1} />
          </ViewComponent>
        )}
      </ViewComponent>

      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.flex1,commonStyles.sectionGap]}>
        <ViewComponent style={[commonStyles.flex1]}>
          <ButtonComponent
            title="GLOBAL_CONSTANTS.CANCEL"
            onPress={handlePopupClose}
            solidBackground={true}
            disable={loading}
          />
        </ViewComponent>
        <ViewComponent style={[commonStyles.flex1]}>
          <ButtonComponent
            title="GLOBAL_CONSTANTS.CONFIRM"
            onPress={verifyAuth}
            customContainerStyle={[reversCommonStyles.bg_yellow, reversCommonStyles.rounded100, { height: s(55) }]}
            customTitleStyle={[reversCommonStyles.fs14, reversCommonStyles.fw700, reversCommonStyles.textAlwaysBlack]}
            loading={loading}
            disable={loading}
          />
        </ViewComponent>
      </ViewComponent>

      {authOpen && (
        <AuthVerification
          onClose={handleAuthClose}
          onSuccess={handleAuthSuccess}
          feature={'Send'}
          requiredVerifys={2}
        />
      )}
    </ViewComponent>
  );
};

export default ConfirmTransferContent;