import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Dimensions, ActivityIndicator, Linking } from 'react-native';
import RenderHTML from 'react-native-render-html';
import Container from '../../../newComponents/container/container';
import ViewComponent from '../../../newComponents/view/view';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import ButtonComponent from '../../../newComponents/buttons/button';
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import { useLngTranslation } from '../../../hooks/useLngTranslation';
import { useDispatch, useSelector } from 'react-redux';
import ImageBackgroundWrapper from '../../../newComponents/imageComponents/ImageBackground';
import { s } from '../../../constants/theme/scale';
import ScrollViewComponent from '../../../newComponents/scrollView/scrollView';
import Checkbox from '../../../newComponents/checkBoxes/basic/checkBox';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';
import PopupOrSheet from '../../../newComponents/models/PopupOrSheet';
import { cardsService } from '../../../apiServices/cardsApis/cardsApiServices';
import { isErrorDispaly } from '../../../utils/helpers';
import { showAppToast } from '../../../newComponents/ToasterMessages/ShowMessage';
import {  resetKycFormData } from '../../../redux/actions/cardActions';
import { SET_APPLY_CARD_TERMS } from '../../../redux/actionTypes/actionsType';
import useEncryptDecrypt from '../../../hooks/encDecHook';
import SwokipayDashboardLoader from '../../../newComponents/swokipayloader';

interface CheckboxItem {
  title?: string;
  isRequired?: boolean;
  accepted?: boolean;
  documentKey?: string;
}

const GetMyCard: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const REVERSE_NEW_COLOR = useThemeColors(true);
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const reverseCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
  const screenWidth = Dimensions.get("window").width;
  const width = Math.min(600, Math.floor(375));

  const cardId = route.params?.cardId;
  const kycFormData = useSelector((state: any) => state.cardsReducer?.kycFormData);
  const userInfo = useSelector((state: any) => state.userReducer?.userInfo);
  const kycInformation=useSelector((state: any) => state.cardsReducer?.kycApiResponseData);
  const [selectedCardData, setSelectedCardData] = useState<any>(null);
  const [cardCheckboxes, setCardCheckboxes] = useState<{ [key: number]: boolean }>({});
  const [checkboxItems, setCheckboxItems] = useState<CheckboxItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [readDocuments, setReadDocuments] = useState<{ [key: string]: boolean }>({});
  const [currentSheetType, setCurrentSheetType] = useState<'esign' | 'cardterms' | 'privacy' | 'authorized' | null>(null);
  const [documentContent, setDocumentContent] = useState<string>('');
  const [documentLoading, setDocumentLoading] = useState(false);
  const [documentAgreed, setDocumentAgreed] = useState(false);
  const [rbSheetError, setRbSheetError] = useState('');
  const rbSheetRef = useRef<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const {encryptAES}=useEncryptDecrypt();

  const getDocumentTypeName = (sheetType: 'esign' | 'cardterms' | 'privacy' | 'authorized' | null): string => {
    const typeMap = {
      esign: 'E-Sign Consent',
      cardterms: 'Card Terms',
      privacy: 'Privacy Policy',
      authorized: 'Authorized User Agreement'
    };
    return sheetType ? typeMap[sheetType] : 'Document';
  };
  const getCardType = () => {
    const cardTypeDetail = kycInformation?.applyCarddetails?.find(
      (detail: any) => detail?.name === "Card Type"
    );
    return cardTypeDetail?.value?.toUpperCase();
  };
  const cleanHtmlContent = (content: string) => {
    return content.replace(/<label[^>]*>/gi, '').replace(/<\/label>/gi, '');
  };

  const handleExternalLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  const renderLinkPart = (part: string, partIndex: number) => {
    const dataActionMatch = part?.match(/<a[^>]*data-action=['"]([^'"]*)['"'][^>]*>(.*?)<\/a>/i);
    if (dataActionMatch) {
      return (
        <CommonTouchableOpacity key={partIndex} onPress={() => openDocumentSheet(dataActionMatch[1])}>
          <ParagraphComponent text={dataActionMatch[2]} style={[commonStyles.text_yellow, commonStyles.fs14, commonStyles.fw400]} />
        </CommonTouchableOpacity>
      );
    }

    const hrefMatch = part?.match(/<a[^>]*href=['"]([^'"]*)['"'][^>]*>(.*?)<\/a>/i);
    if (hrefMatch) {
      return (
        <CommonTouchableOpacity key={partIndex} onPress={() => handleExternalLink(hrefMatch[1])}>
          <ParagraphComponent text={hrefMatch[2]} style={[commonStyles.text_yellow, commonStyles.fs14, commonStyles.fw400]} />
        </CommonTouchableOpacity>
      );
    }
    return null;
  };

  const renderHtmlContent = (htmlContent: string) => {
    if (htmlContent.includes('<a')) {
      const parts = htmlContent.split(/(<a[^>]*>.*?<\/a>)/g);
      return (
        <ViewComponent style={[commonStyles.flexRow, commonStyles.flexWrap]}>
          {parts?.map((part: string, partIndex: number) => {
            if (part?.includes('<a')) return renderLinkPart(part, partIndex);
            const cleanText = part?.replace(/<[^>]*>/g, '');
            return cleanText ? (
              <ParagraphComponent key={partIndex} text={cleanText} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} />
            ) : null;
          })}
        </ViewComponent>
      );
    }
    return <ParagraphComponent text={htmlContent.replace(/<[^>]*>/g, '')} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} />;
  };

  const renderCheckboxItem = useCallback(
    (item: CheckboxItem, index: number) => {
      const htmlContent = cleanHtmlContent(item?.title || '');
      return (
        <ViewComponent key={index} style={[commonStyles.dflex, commonStyles.gap16, index > 0 && commonStyles.mt16]}>
          <CommonTouchableOpacity onPress={() => handleCheckboxChange(index)}>
            <Checkbox
              value={cardCheckboxes[index] || false}
              onChange={() => handleCheckboxChange(index)}
              size={s(14)}
              uncheckedBorderColor={cardCheckboxes[index] ? NEW_COLOR.TEXT_RED : NEW_COLOR.BORDER_COLOR}
              backgroundColor={NEW_COLOR.BG_GRAY}
              checkedColor={NEW_COLOR.TEXT_WHITE}
            />
          </CommonTouchableOpacity>
          <ViewComponent style={[commonStyles.flex1]}>
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
              <ViewComponent style={[commonStyles.dflex, commonStyles.flexWrap]}>
                {renderHtmlContent(htmlContent)}
              </ViewComponent>
            </ViewComponent>
          </ViewComponent>
        </ViewComponent>
      );
    },
    [cardCheckboxes, commonStyles, NEW_COLOR]
  );

  useEffect(() => {
    fetchCardRequirements();
  }, [cardId]);

  const fetchCardRequirements = async () => {
    try {
      setLoading(true);
      setError('');

      const response: any = await cardsService.applyCardsList();

      if (response?.status === 200 && Array.isArray(response?.data)) {
        const selectedCardData = response.data.find((c: any) => c.id === cardId);

        if (selectedCardData) {
          setSelectedCardData(selectedCardData);
          if (selectedCardData?.noteType === 'Dynamic' && selectedCardData?.note) {
            try {
              const parsed = JSON.parse(selectedCardData.note);

              if (Array.isArray(parsed)) {
                if (parsed.length > 0 && parsed[0].hasOwnProperty('note')) {
                  const allItems = parsed.flatMap((group: any) => group.note || []);
                  setCheckboxItems(allItems);
                } else {
                  setCheckboxItems(parsed);
                }
              } else {
                setCheckboxItems([]);
              }

              const initialCheckboxes: { [key: number]: boolean } = {};
              const itemsToUse = Array.isArray(parsed) ?
                (parsed.length > 0 && parsed[0].hasOwnProperty('note') ?
                  parsed.flatMap((group: any) => group.note || []) :
                  parsed) : [];

              itemsToUse.forEach((item: any, index: number) => {
                initialCheckboxes[index] = item?.accepted || false;
              });
              setCardCheckboxes(initialCheckboxes);
            } catch (parseError) {
              setCheckboxItems([]);
              setError('Failed to parse card requirements');
            }
          } else {
            setCheckboxItems([]);
            setCardCheckboxes({});
          }
        } else {
          setError(`Card with ID ${cardId} not found`);
          setCheckboxItems([]);
        }
      } else {
        setError(isErrorDispaly(response));
        setCheckboxItems([]);
      }
    } catch (err) {
      setError(isErrorDispaly(err));
      setCheckboxItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (index: number) => {
    const newValue = !cardCheckboxes[index];
    setCardCheckboxes(prev => ({
      ...prev,
      [index]: newValue
    }));
    
    // If unchecking, clear the read document state
    if (!newValue) {
      const item = checkboxItems[index];
      const linkMatches = item?.title?.match(/<a[^>]*data-action=['"]([^'"]*)['"][^>]*>/g) || [];
      const requiredActions = linkMatches.map((match: string) => {
        const actionMatch = match.match(/data-action=['"]([^'"]*)['"]/);
        return actionMatch ? actionMatch[1] : null;
      }).filter(Boolean);
      
      if (requiredActions.length > 0) {
        setReadDocuments(prev => {
          const updated = { ...prev };
          requiredActions.forEach((action: string) => {
            delete updated[action];
          });
          return updated;
        });
      }
    }
  };

  useEffect(() => {
    const updatedCheckboxes: { [key: number]: boolean } = {};

    checkboxItems.forEach((item: any, index: number) => {
      if (cardCheckboxes[index]) return;
      const linkMatches = item?.title?.match(/<a[^>]*data-action=['"]([^'"]*)['"][^>]*>/g) || [];
      const requiredActions = linkMatches.map((match: string) => {
        const actionMatch = match.match(/data-action=['"]([^'"]*)['"]/);
        return actionMatch ? actionMatch[1] : null;
      }).filter(Boolean);

      if (requiredActions.length > 0) {
        const allDocumentsRead = requiredActions.every((action: string) => readDocuments[action]);
        if (allDocumentsRead) {
          updatedCheckboxes[index] = true;
        }
      }
    });

    if (Object.keys(updatedCheckboxes).length > 0) {
      setCardCheckboxes(prev => ({
        ...prev,
        ...updatedCheckboxes
      }));
    }
  }, [readDocuments, checkboxItems, cardCheckboxes]);

  const openDocumentSheet = async (action: string) => {
    // Map action to sheet type
    let sheetType: 'esign' | 'cardterms' | 'privacy' | 'authorized' | null = null;
    let apiAction = action;
    
    if (action === 'E_SIGN_CONSENT' || action === 'esign-consent' || action === 'E-SignConsent') {
      sheetType = 'esign';
      apiAction = 'E-SignConsent';
    } else if (action === 'CARD_TERMS' || action === 'card-terms') {
      sheetType = 'cardterms';
      apiAction = 'card-terms';
    } else if (action === 'PRIVACY_POLICY' || action === 'privacy-policy') {
      sheetType = 'privacy';
      apiAction = 'privacy-policy';
    } else if (action === 'AUTHORIZED_USER_AGREEMENT' || action === 'authorized-user-agreement') {
      sheetType = 'authorized';
      apiAction = 'authorized-user-agreement';
    }
    
    setCurrentSheetType(sheetType);
    setDocumentLoading(true);
    // Find the checkbox index for this action and set its current state
    const checkboxIndex = checkboxItems.findIndex((item: any) => 
      item?.title?.includes(action) || item?.title?.includes(apiAction)
    );
    const currentCheckboxState = checkboxIndex !== -1 ? (cardCheckboxes[checkboxIndex] || false) : false;
    setDocumentAgreed(currentCheckboxState);
    setRbSheetError('');

    try {
      const response = await cardsService.getNoteDetails(apiAction);
      if (response?.ok) {
        setDocumentContent((response.data as any)?.templateContent || (response.data as any)?.content || '');
      } else {
        setRbSheetError(isErrorDispaly(response));
      }
    } catch (error) {
      setRbSheetError(isErrorDispaly(error));
    } finally {
      setDocumentLoading(false);
    }

    rbSheetRef.current?.open();
  };

  const handleDocumentRead = () => {
    if (currentSheetType === 'esign') {
      setReadDocuments(prev => ({ ...prev, 'E_SIGN_CONSENT': true, 'esign-consent': true, 'E-SignConsent': true }));
    } else if (currentSheetType === 'cardterms') {
      setReadDocuments(prev => ({ ...prev, 'CARD_TERMS': true, 'card-terms': true }));
    } else if (currentSheetType === 'privacy') {
      setReadDocuments(prev => ({ ...prev, 'PRIVACY_POLICY': true, 'privacy-policy': true }));
    } else if (currentSheetType === 'authorized') {
      setReadDocuments(prev => ({ ...prev, 'AUTHORIZED_USER_AGREEMENT': true, 'authorized-user-agreement': true }));
    }
    rbSheetRef.current?.close();
  };


  const handleSubmit = useCallback(async () => {
    try {
      setSubmitting(true);
      setError('');

      const noteData = checkboxItems.map((item: any, index: number) => ({
        ...item,
        accepted: cardCheckboxes[index] || false
      }));

      // Check if isNavigateFeeStep flag is true
      if (selectedCardData?.isNavigateFeeStep) {
        // Navigate to FeeStep with params like kycRequirements.tsx
        const formData = kycFormData || {};
        const applycardData = {
          KycUpdateModel: {
            firstName: formData.firstName || "",
            lastName: formData.lastName || "",
            addressLine1: formData.addressLine1 || "",
            addressLine2: formData.addressLine2 || "",
            country: formData.country || "",
            city: formData.city || "",
            postalCode: formData.pincode || "",
            dob: formData.dob instanceof Date ? formData.dob.toISOString() : (formData.dob || ""),
            email: formData.email || "",
            mobileCode: formData.phoneCode || "",
            mobile: formData.phoneNumber || "",
            occupation: formData.occupation || "",
            annualSalary: formData.annualSalary || "",
            accountPurpose: formData.accountPurpose || "",
            employmentStatus: formData.employmentStatus || "",
            expectedMonthlyVolume: formData.estimatedMonthlyValue || "",
          }
        };

        const applyCardTermsData = {
          noteType: selectedCardData?.noteType || "",
          note: noteData
        };

        // dispatch(setApplyCardData(applycardData));
        dispatch({ type: SET_APPLY_CARD_TERMS, payload: applyCardTermsData });
        navigation.navigate('FeeStep', {
          cardId: selectedCardData?.id,
          kycUpdateModel: applycardData,
          cardDetails: selectedCardData,
        });
        setSubmitting(false);
        return;
      }

      // If isNavigateFeeStep is false, trigger API call
      const formData = kycFormData || {};

      const payload = {
        programId: cardId,
        promoCode: "",
        noteType: selectedCardData?.noteType || "",
        note: selectedCardData?.noteType?.toLowerCase() === 'dynamic' ? JSON.stringify(noteData) : "",
        kyc: {
          cardId: cardId,
          firstName: encryptAES(formData.firstName) || "",
          lastName: encryptAES(formData.lastName) || "",
          addressLine1: formData.addressLine1 || "",
          addressLine2: formData.addressLine2 || "",
          city: formData.city || "",
          state: formData?.state||"",
          country: formData.country || "",
          town: kycInformation.town||"",
          idType: kycInformation.idType||"",
          idNumber: kycInformation.idNumber||"",
          profilePicFront:kycInformation.profilePicFront ||"",
          profilePicBack:kycInformation.profilePicBack|| "",
          signature:kycInformation.signature|| "",
          docExpiryDate: kycInformation.docExpiryDate||"",
          docIssueDate: encryptAES(new Date(new Date().setDate(new Date().getDate() - 1)).toISOString()) || "",
          dob: formData.dob instanceof Date ? formData.dob.toISOString() : (formData.dob || ""),
          biometric: kycInformation.biometric||"",
          backDocImage: kycInformation.backDocImage||"",
          gender: kycInformation.gender||"",
          kycRequirements: kycInformation.kycRequirements||"",
          email: encryptAES(formData.email)|| "",
          mobileCode: encryptAES(formData.phoneCode) || "",
          mobile: encryptAES(formData.phoneNumber) || "",
          faceImage: kycInformation.faceImage||"",
          handHoldingIDPhoto: kycInformation.handHoldingIdPhoto||"",
          emergencyContactName: "",
          postalCode: encryptAES(formData.pincode) || "",
          cardHandHoldingIDPhoto: "",
          occupation: formData.occupation || "",
          ipAddress: "",
          annualSalary: parseInt(formData.annualSalary) || 0,
          accountPurpose: formData.accountPurpose || "",
          employmentStatus: formData.employmentStatus || "",
          expectedMonthlyVolume: parseInt(formData.estimatedMonthlyValue) || 0,
        },
        billingAddress: {
          cardHolderName: userInfo?.userName,
          addressLine1: formData.addressLine1 || "",
          addressLine2: formData.addressLine2 || "",
          city: formData.city || "",
          state: kycInformation.state||"",
          town: kycInformation.town||"",
          postalCode: encryptAES(formData.pincode) || "",
          country: formData.country || ""
        },
        shippingAddress: {}
      };

      const response: any = await cardsService.saveCustomerCardsWallet(payload);

      if (response?.status === 200) {
        dispatch(resetKycFormData());
        navigation.navigate('Dashboard', { screen: 'GLOBAL_CONSTANTS.CARDS' });
        showAppToast(t("GLOBAL_CONSTANTS.CARD_APPLIED_SUCCESSFULLY"), "success")
      } else {
        setError(isErrorDispaly(response));
      }
    } catch (err) {
      setError(isErrorDispaly(err));
    } finally {
      setSubmitting(false);
    }
  }, [checkboxItems, cardCheckboxes, cardId, selectedCardData, kycFormData, userInfo, dispatch, navigation, t]);
  const getButtonTitle = () => {
    if (checkboxItems.length === 0) return 'GLOBAL_CONSTANTS.CONTINUE';
    if (checkboxItems.length === 1) return 'GLOBAL_CONSTANTS.GET_MY_CARD';
    if (currentStep === checkboxItems.length - 1) return 'GLOBAL_CONSTANTS.GET_MY_CARD';
    return 'GLOBAL_CONSTANTS.GET_MY_CARD';
  };

  const areAllRequiredCheckboxesChecked = () => {
    return checkboxItems.every((item: any, index: number) =>
      !item.isRequired || cardCheckboxes[index]
    );
  };

  const handleBackPress = useCallback(() => {
    navigation.navigate("FinancialInformation", { cardId: cardId,animation: 'slide_from_left'});
  }, [navigation]);

  return (
    <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
      <Container>
        <PageHeader
          title=""
          onBackPress={handleBackPress}
          disable={submitting}
        />

        {loading && <SwokipayDashboardLoader />}
        {!loading && (
          <>
            {error && <ErrorComponent message={error} screen={true} />}
        <ScrollViewComponent>
          <ViewComponent style={[commonStyles.mt12, commonStyles.alignCenter, commonStyles.mb26]}>
            <TextMultiLanguage
              text="GLOBAL_CONSTANTS.YOU_ARE_APPROVED"
              style={[commonStyles.fs24, commonStyles.fw700, commonStyles.textWhite, commonStyles.textCenter]}
            />
          </ViewComponent>

          <ViewComponent style={[]}>
            {selectedCardData && (
              <ImageBackgroundWrapper
                source={{ uri: selectedCardData?.logo }}
                style={[
                  commonStyles.rounded12,
                  { width: screenWidth * 0.90, height: s(220), alignSelf: 'center', overflow: 'hidden', borderRadius: s(8) }
                ]}
                resizeMode="cover"
                imageStyle={[commonStyles.rounded12, { width: '100%', height: '100%', borderRadius: s(8) }]}
              >
                <ViewComponent style={[commonStyles.p10, { position: 'absolute', top: s(15), left: s(35) }]}>
                  <ViewComponent style={[{ borderWidth: 1, borderColor: NEW_COLOR.TEXT_WHITE, borderRadius: s(100), },commonStyles.py3,commonStyles.px8]}>
                    <TextMultiLanguage style={[commonStyles.fs8, commonStyles.fw700, commonStyles.textWhite]} text={getCardType()} />
                  </ViewComponent>
                </ViewComponent>
              </ImageBackgroundWrapper>
            )}
          </ViewComponent>

          <ViewComponent style={[commonStyles.sectionGap]} />

          {checkboxItems.length > 0 && (
            <ViewComponent style={[commonStyles.p16, commonStyles.rounded12]}>
              {checkboxItems.map((item, index) => renderCheckboxItem(item, index))}
            </ViewComponent>
          )}

          <ViewComponent style={[commonStyles.sectionGap]} />
        </ScrollViewComponent>

        <ViewComponent style={[commonStyles.flex1]} />

        <ButtonComponent
          title={getButtonTitle()}
          onPress={handleSubmit}
          loading={submitting}
          disable={submitting || !areAllRequiredCheckboxesChecked()}
        />

        <ViewComponent style={[commonStyles.sectionGap]} />
          </>
        )}
      </Container>

      <PopupOrSheet
        ref={rbSheetRef}
        title={getDocumentTypeName(currentSheetType)}
        height={s(600)}
        showCloseIcon={false}
      >
        <ViewComponent style={[commonStyles.flex1]}>
          {rbSheetError && <ErrorComponent message={rbSheetError} onClose={() => setRbSheetError('')} />}

          {documentLoading ? (
            <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
              <ActivityIndicator size="large" color={NEW_COLOR.BG_YELLOW} />
            </ViewComponent>
          ) : (
            <ScrollViewComponent style={[commonStyles.flex1]}>
              <RenderHTML
                contentWidth={width}
                source={{
                  html: documentContent
                    .replace(/<label[^>]*>[\s\S]*?<\/label>/gi, '')
                    .replace(/<label[^>]*>/gi, '')
                    .replace(/<\/label>/gi, '')
                }}
                tagsStyles={{
                  body: { color: REVERSE_NEW_COLOR.TEXT_WHITE, fontSize: s(14) },
                  p: { color: REVERSE_NEW_COLOR.TEXT_WHITE, fontSize: s(14) },
                  li: { color: REVERSE_NEW_COLOR.TEXT_WHITE, fontSize: s(12) },
                  label: { display: 'none' }
                }}
                ignoredTags={['label']}
                renderersProps={{
                  img: { enableExperimentalPercentWidth: true }
                }}
                enableExperimentalMarginCollapsing
              />
            </ScrollViewComponent>
          )}

          {!documentLoading && (
            <>
              <ViewComponent style={[commonStyles.sectionGap]} />
              <CommonTouchableOpacity onPress={() => setDocumentAgreed(prev => !prev)}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.mb16]}>
                  <Checkbox
                    value={documentAgreed}
                    onChange={() => setDocumentAgreed(prev => !prev)}
                    size={s(14)}
                    uncheckedBorderColor={documentAgreed ? NEW_COLOR.TEXT_RED : NEW_COLOR.BORDER_COLOR}
                    backgroundColor={NEW_COLOR.BG_GRAY}
                    checkedColor={NEW_COLOR.TEXT_WHITE}
                  />
                  <ParagraphComponent
                    text={`${t("GLOBAL_CONSTANTS.I_ACCEPT_THE")} ${getDocumentTypeName(currentSheetType)}`}
                    style={[reverseCommonStyles.textWhite, reverseCommonStyles.fs14, reverseCommonStyles.fw400, reverseCommonStyles.flex1]}
                  />
                </ViewComponent>
              </CommonTouchableOpacity>
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.mb10]}>
                <ViewComponent style={[commonStyles.flex1]}>
                  <ButtonComponent
                    title="GLOBAL_CONSTANTS.CANCEL"
                    onPress={() => rbSheetRef.current?.close()}
                    solidBackground={true}
                  />
                </ViewComponent>
                <ViewComponent style={[commonStyles.flex1]}>
                  <ButtonComponent
                    title="GLOBAL_CONSTANTS.IVE_READ"
                    onPress={handleDocumentRead}
                    disable={!documentAgreed}
                  />
                </ViewComponent>
              </ViewComponent>
            </>
          )}
          <ViewComponent style={[commonStyles.sectionGap]} />
        </ViewComponent>
      </PopupOrSheet>
    </ViewComponent>
  );
};

export default GetMyCard;
