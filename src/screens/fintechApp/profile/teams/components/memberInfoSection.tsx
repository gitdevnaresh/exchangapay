import React, { useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import { s } from '../../../../../constants/styels/scale';
import ViewComponent from '../../../../../components/view/view';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import TextMultiLanguage from '../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import useEncryptDecrypt from '../../../../../hooks/encDecHook';
import Clipboard from "@react-native-clipboard/clipboard";
import { REFERRAL_CONST } from '../../referrals/membersConstants';
import CopyCard from '../../../../../components/copyIcon/CopyCard';
import { MemberInfoSectionProps } from '../utils/interfaces';
import { UI } from '../constants';
import ImageUri from '../../../../../components/imageComponents/image';

const MemberInfoSection: React.FC<MemberInfoSectionProps> = ({
  memberDetails,
  memberData,
  showRefId = true
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { decryptAES } = useEncryptDecrypt();

  const safeDecrypt = (value: string | undefined) => {
    if (!value) return '';
    try {
      return decryptAES(value) || '';
    } catch (error) {
      return '';
    }
  };

  const decryptedValues = useMemo(() => {
    const refId = safeDecrypt(memberDetails?.refId || memberData?.refId);
    const email = safeDecrypt(memberDetails?.email || memberData?.email);
    const phoneCode = safeDecrypt(memberDetails?.phoneCode);
    const phoneNo = safeDecrypt(memberDetails?.phoneNo);
    const phoneNumber = phoneCode && phoneNo ? `${phoneCode} ${phoneNo}` : '';

    return { refId, email, phoneNumber };
  }, [memberDetails?.refId, memberData?.refId, memberDetails?.email, memberData?.email, memberDetails?.phoneCode, memberDetails?.phoneNo, decryptAES]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      Clipboard.setString(text);
    } catch (error: any) {
      Alert.alert(REFERRAL_CONST.FAILED_TO_COPY, error);
    }
  }, []);

  return (
    <ViewComponent style={[commonStyles.sectionGap]}>
      <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.sectionGap]}>
        <ViewComponent style={[commonStyles.alignCenter, commonStyles.justifyCenter, { width: s(60), height: s(60) }]}>
          <ImageUri uri={memberDetails?.image ? memberDetails?.image : "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/default_user_image.jpg"} width={s(62)} height={s(62)} style={{ borderRadius: s(62) / 2 }} />
        </ViewComponent>


        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flex1]}>
          <ViewComponent>
            <ParagraphComponent
              style={[commonStyles.sectionTitle, commonStyles.mb6, { width: s(UI.MEMBER_NAME_WIDTH) }]}
              text={memberDetails?.fullName || memberData?.fullName || ''} numberOfLines={1}
            />
            {showRefId && (
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                <TextMultiLanguage
                  style={[commonStyles.availblelabel]}
                  text="GLOBAL_CONSTANTS.REF_ID"
                />
                <ParagraphComponent
                  style={[commonStyles.availbleamount]}
                  text={decryptedValues.refId}
                />
                <CopyCard
                  onPress={() => copyToClipboard(decryptedValues.refId)}
                  copyIconColor={NEW_COLOR.TEXT_PRIMARY}
                />

              </ViewComponent>
            )}
          </ViewComponent>
        </ViewComponent>


      </ViewComponent>

      <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.listitemGap, commonStyles.gap8, commonStyles.flexWrap]}>
        <TextMultiLanguage
          style={[commonStyles.listsecondarytext]}
          text="GLOBAL_CONSTANTS.EMAIL"
        />
        <ParagraphComponent
          style={[commonStyles.listprimarytext]}
          text={decryptedValues.email}
        />
      </ViewComponent>

      <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.listitemGap, commonStyles.gap8, commonStyles.flexWrap]}>
        <TextMultiLanguage
          style={[commonStyles.listsecondarytext]}
          text="GLOBAL_CONSTANTS.PHONE"
        />
        <ParagraphComponent
          style={[commonStyles.listprimarytext]}
          text={decryptedValues.phoneNumber}
        />
      </ViewComponent>

      <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.listitemGap, commonStyles.gap8, commonStyles.flexWrap]}>
        <TextMultiLanguage
          style={[commonStyles.listsecondarytext]}
          text="GLOBAL_CONSTANTS.GENDER"
        />
        <ParagraphComponent
          style={[commonStyles.listprimarytext]}
          text={memberDetails?.gender || ''}
        />
      </ViewComponent>

      <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.listitemGap, commonStyles.gap8, commonStyles.flexWrap]}>
        <TextMultiLanguage
          style={[commonStyles.listsecondarytext]}
          text="GLOBAL_CONSTANTS.COUNTRY"
        />
        <ParagraphComponent
          style={[commonStyles.listprimarytext]}
          text={memberDetails?.country || ''}
        />
      </ViewComponent>

      <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap8, commonStyles.flexWrap]}>
        <TextMultiLanguage
          style={[commonStyles.listsecondarytext]}
          text="GLOBAL_CONSTANTS.REG_DATE"
        />
        <ParagraphComponent
          style={[commonStyles.primarytext]}
          text={memberDetails?.registeredDate ? new Date(memberDetails.registeredDate).toLocaleDateString() : ''}
        />
      </ViewComponent>
    </ViewComponent>
  );
};

export default MemberInfoSection;

