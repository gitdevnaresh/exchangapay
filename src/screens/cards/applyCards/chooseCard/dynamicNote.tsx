import React, { useEffect, useRef, useState, useCallback } from "react";
import { ActivityIndicator, Linking } from "react-native";
import RenderHTML from "react-native-render-html";
import CommonTouchableOpacity from "../../../../newComponents/touchableComponents/touchableOpacity";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import TextMultiLanguage from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import ScrollViewComponent from "../../../../newComponents/scrollView/scrollView";
import ViewComponent from "../../../../newComponents/view/view";
import ButtonComponent from "../../../../newComponents/buttons/button";
import ErrorComponent from "../../../../newComponents/errorDisplay/errorDisplay";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import { getThemedCommonStyles } from "../../../../assets/styles/CommonStyles";
import PopupOrSheet from "../../../../newComponents/models/PopupOrSheet";
import { s } from "../../../../constants/theme/scale";
import Checkbox from "../../../../newComponents/checkBoxes/basic/checkBox";
import { t } from "i18next";
import { applyCardTerms } from "../../../../redux/actions/actions";
import { useDispatch } from "react-redux";
import { cardsService } from "../../../../apiServices/cardsApis/cardsApiServices";
import { isErrorDispaly } from "../../../../utils/helpers";
import FlatListComponent from "../../../../newComponents/flatList/flatList";

interface DynamicNotesProps {
  info: {};
  onSubmit: (result: boolean[]) => void;
  onClose: () => void;
}

type NoteItem = {
  displayType?: string;
  isRequired?: boolean;
  title?: string;
  fullHtml?: { [action: string]: string };
};

export default function DynamicNotes({ info, onSubmit, onClose }: DynamicNotesProps) {
  const NEW_COLOR = useThemeColors();
  const REVERSE_NEW_COLOR = useThemeColors(true);
  const commonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
  const width = Math.min(600, Math.floor(375));
  const [dynamicCheckboxes, setDynamicCheckboxes] = useState<{ [k: number]: boolean }>({});
  const [rbSheetError, setRbSheetError] = useState<string>("");
  const dynamicRBSheetRef = useRef<any>(null);
  const [cardInfoData, setCardInfoData] = useState<any>([]);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState<number>(0);
  const [readDocuments, setReadDocuments] = useState<{ [key: string]: boolean }>({});
  const [currentSheetType, setCurrentSheetType] = useState<'esign' | 'cardterms' | 'privacy' | 'authorized' | null>(null);
  const [eSignContent, setESignContent] = useState<string>('');
  const [eSignLoading, setESignLoading] = useState<boolean>(false);
  const [eSignAgreed, setESignAgreed] = useState<boolean>(false);
  const [cardTermsContent, setCardTermsContent] = useState<string>('');
  const [cardTermsLoading, setCardTermsLoading] = useState<boolean>(false);
  const [cardTermsAgreed, setCardTermsAgreed] = useState<boolean>(false);
  const [privacyPolicyContent, setPrivacyPolicyContent] = useState<string>('');
  const [privacyPolicyLoading, setPrivacyPolicyLoading] = useState<boolean>(false);
  const [privacyPolicyAgreed, setPrivacyPolicyAgreed] = useState<boolean>(false);
  const [authorizedUserContent, setAuthorizedUserContent] = useState<string>('');
  const [authorizedUserLoading, setAuthorizedUserLoading] = useState<boolean>(false);
  const [authorizedUserAgreed, setAuthorizedUserAgreed] = useState<boolean>(false);
  const [originalESignState, setOriginalESignState] = useState<boolean>(false);
  const [allNotesCompleted, setAllNotesCompleted] = useState<boolean>(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (info?.noteType === 'Dynamic') {
      try {
        const parsed = info?.note ? JSON.parse(info.note) : [];
        if (parsed.length > 0 && parsed[0].hasOwnProperty('note')) {
          setCardInfoData(parsed);
        } else {
          setCardInfoData([{ title: 'Terms and Conditions', note: parsed }]);
        }
      } catch (error) {
        setCardInfoData([]);
      }
    }
  }, [info?.noteType, info?.note]);



  const getCurrentNoteItems = useCallback(() => {
    return cardInfoData[currentNoteIndex]?.note || [];
  }, [cardInfoData, currentNoteIndex]);

  const areAllRequiredCheckboxesChecked = () => {
    const noteItems = getCurrentNoteItems();
    return noteItems.every((item: any, index: number) =>
      !item.isRequired || dynamicCheckboxes[index]
    );
  };

  const handleSubmit = useCallback(() => {
    const acceptedTermsData = {
      note: cardInfoData.map((noteGroup: any) => ({
        ...noteGroup,
        note: noteGroup.note.map((item: any, index: number) => ({
          ...item,
          accepted: dynamicCheckboxes[index] || false
        }))
      })),
      noteType: info?.noteType
    };
    dispatch(applyCardTerms(acceptedTermsData));
    const resultArray = Object.keys(dynamicCheckboxes).length ? Object.keys(dynamicCheckboxes).map(i => !!dynamicCheckboxes[Number(i)]) : [];
    onSubmit(resultArray);
  }, [cardInfoData, dynamicCheckboxes, info?.noteType, dispatch, onSubmit]);

  const handleNextNote = useCallback(() => {
    if (currentNoteIndex < cardInfoData.length - 1) {
      setCurrentNoteIndex(prev => prev + 1);
      setDynamicCheckboxes({});
      setRbSheetError('');
    } else {
      setAllNotesCompleted(true);
      handleSubmit();
    }
  }, [currentNoteIndex, cardInfoData.length, handleSubmit]);

  useEffect(() => {
    const noteItems = getCurrentNoteItems();
    const updatedCheckboxes: { [key: number]: boolean } = {};

    noteItems.forEach((item: any, index: number) => {
      const linkMatches = item?.title?.match(/<a[^>]*data-action=['"]([^'"]*)['"'][^>]*>/g) || [];
      const requiredActions = linkMatches.map((match: string) => {
        const actionMatch = match.match(/data-action=['"]([^'"]*)['"]/);
        return actionMatch ? actionMatch[1] : null;
      }).filter(Boolean);

      if (requiredActions.length > 0) {
        const allDocumentsRead = requiredActions.every((action: string) => readDocuments[action]);
        updatedCheckboxes[index] = allDocumentsRead;
      }
    });

    setDynamicCheckboxes(prev => ({
      ...prev,
      ...updatedCheckboxes
    }));
  }, [readDocuments, currentNoteIndex, getCurrentNoteItems]);

  const handleDynamicCheckboxChange = (index: number) => {
    setRbSheetError("");
    setDynamicCheckboxes(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const openDynamicSheet = async (type: 'esign' | 'cardterms' | 'privacy' | 'authorized') => {
    setCurrentSheetType(type);
    
    if (type === 'esign') {
      setESignLoading(true);
      const noteItems = getCurrentNoteItems();
      const eSignCheckboxIndex = noteItems.findIndex((item: any) =>
        item.title?.includes('E_SIGN_CONSENT') || item.title?.includes('E-SignConsent')
      );
      const currentState = dynamicCheckboxes[eSignCheckboxIndex] || false;
      setESignAgreed(currentState);
      setOriginalESignState(currentState);

      try {
        const response = await cardsService.getNoteDetails('E-SignConsent');
        if (response?.ok) {
          setESignContent((response.data as any)?.templateContent || (response.data as any)?.content);
        } else {
          setRbSheetError(isErrorDispaly(response));
        }
      } catch (error) {
        setRbSheetError(isErrorDispaly(error));
      } finally {
        setESignLoading(false);
      }
    } else if (type === 'cardterms') {
      setCardTermsLoading(true);
      try {
        const response = await cardsService.getNoteDetails('card-terms');
        if (response?.ok) {
          setCardTermsContent((response.data as any)?.templateContent || 'No content available');
        } else {
          setRbSheetError(isErrorDispaly(response));
        }
      } catch (error) {
        setRbSheetError(isErrorDispaly(error));
      } finally {
        setCardTermsLoading(false);
      }
    } else if (type === 'privacy') {
      setPrivacyPolicyLoading(true);
      try {
        const response = await cardsService.getNoteDetails('privacy-policy');
        if (response?.ok) {
          setPrivacyPolicyContent((response.data as any)?.templateContent || 'No content available');
        } else {
          setRbSheetError(isErrorDispaly(response));
        }
      } catch (error) {
        setRbSheetError(isErrorDispaly(error));
      } finally {
        setPrivacyPolicyLoading(false);
      }
    } else if (type === 'authorized') {
      setAuthorizedUserLoading(true);
      try {
        const response = await cardsService.getNoteDetails('authorized-user-agreement');
        if (response?.ok) {
          setAuthorizedUserContent((response.data as any)?.templateContent || 'No content available');
        } else {
          setRbSheetError(isErrorDispaly(response));
        }
      } catch (error) {
        setRbSheetError(isErrorDispaly(error));
      } finally {
        setAuthorizedUserLoading(false);
      }
    }
    
    dynamicRBSheetRef.current?.open();
  };

  const handleDynamicRead = () => {
    if (currentSheetType === 'esign') {
      setReadDocuments(prev => ({ ...prev, 'E_SIGN_CONSENT': true, 'esign-consent': true }));
    } else if (currentSheetType === 'cardterms') {
      setReadDocuments(prev => ({ ...prev, 'CARD_TERMS': true, 'card-terms': true }));
    } else if (currentSheetType === 'privacy') {
      setReadDocuments(prev => ({ ...prev, 'PRIVACY_POLICY': true, 'privacy-policy': true }));
    } else if (currentSheetType === 'authorized') {
      setReadDocuments(prev => ({ ...prev, 'AUTHORIZED_USER_AGREEMENT': true, 'authorized-user-agreement': true }));
    }
    dynamicRBSheetRef.current?.close();
    setRbSheetError('');
  };

  const handleNavigateTerms = async () => {
    try {
      const url = 'https://bullswipe.com/terms-conditions/';
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error('Cannot open URL:', url);
      }
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  const renderAgreementItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      return (
        <ViewComponent>
          <ViewComponent
            style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}
          >
            <CommonTouchableOpacity onPress={() => handleDynamicCheckboxChange(index)}>
              <Checkbox
                value={dynamicCheckboxes[index]}
                onChange={() => {
                  handleDynamicCheckboxChange(index)
                }}
                size={s(14)}
                uncheckedBorderColor={dynamicCheckboxes[index] ? NEW_COLOR.TEXT_RED : NEW_COLOR.BORDER_COLOR}
                backgroundColor={NEW_COLOR.BG_YELLOW}
              />
            </CommonTouchableOpacity>
            <ViewComponent style={[commonStyles.flex1]}>
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.flexWrap]}>
                  {(() => {
                        const originalContent = item.title;
                        const htmlContent = originalContent
                          .replace(/<label[^>]*>/gi, '')
                          .replace(/<\/label>/gi, '');
                        
                        
                        // Check if title contains HTML links
                        if (htmlContent.includes('<a')) {
                          const parts = htmlContent.split(/(<a[^>]*>.*?<\/a>)/g);
                          return parts?.map((part: string, partIndex: number) => {
                            if (part?.includes('<a')) {
                              // Handle data-action links first
                              const dataActionMatch = part?.match(/<a[^>]*data-action=['"]([^'"]*)['"'][^>]*>(.*?)<\/a>/i);
                              if (dataActionMatch) {
                                const action = dataActionMatch[1];
                                const linkText = dataActionMatch[2];
                                return (
                                  <CommonTouchableOpacity
                                    key={partIndex}
                                    onPress={(e) => {
                                      e.stopPropagation();
                                      if (action === 'E_SIGN_CONSENT' || action === 'esign-consent') {
                                        openDynamicSheet('esign');
                                      } else if (action === 'CARD_TERMS' || action === 'card-terms') {
                                        openDynamicSheet('cardterms');
                                      } else if (action === 'PRIVACY_POLICY' || action === 'privacy-policy') {
                                        openDynamicSheet('privacy');
                                      } else if (action === 'AUTHORIZED_USER_AGREEMENT' || action === 'authorized-user-agreement') {
                                        openDynamicSheet('authorized');
                                      }
                                    }}
                                  >
                                    <ParagraphComponent
                                      text={linkText}
                                      style={[commonStyles.text_yellow, commonStyles.fs14, commonStyles.fw400]}
                                    />
                                  </CommonTouchableOpacity>
                                );
                              }
                              
                              // Handle href links
                              const hrefMatch = part?.match(/<a[^>]*href=['"]([^'"]*)['"'][^>]*>(.*?)<\/a>/i);
                              if (hrefMatch) {
                                const url = hrefMatch[1];
                                const linkText = hrefMatch[2];
                                return (
                                  <CommonTouchableOpacity
                                    key={partIndex}
                                    onPress={async (e) => {
                                      e.stopPropagation();
                                      try {
                                        const supported = await Linking.canOpenURL(url);
                                        if (supported) {
                                          await Linking.openURL(url);
                                        } else {
                                          console.error('Cannot open URL:', url);
                                        }
                                      } catch (error) {
                                        console.error('Failed to open URL:', error);
                                      }
                                    }}
                                  >
                                    <ParagraphComponent
                                      text={linkText}
                                      style={[commonStyles.text_yellow, commonStyles.fs14, commonStyles.fw400]}
                                    />
                                  </CommonTouchableOpacity>
                                );
                              }
                            }
                            const cleanText = part?.replace(/<[^>]*>/g, '');
                            return cleanText ? (
                              <ParagraphComponent
                                key={partIndex}
                                text={cleanText}
                                style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]}
                              />
                            ) : null;
                          });
                        } else {
                          // Handle plain text - remove any remaining HTML tags
                          const cleanText = htmlContent.replace(/<[^>]*>/g, '');
                          return (
                            <ParagraphComponent
                              text={cleanText}
                              style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]}
                            />
                          );
                        }
                      })()
                    }
                </ViewComponent>
              </ViewComponent>
            </ViewComponent>
          </ViewComponent>
        </ViewComponent>
      );
    },
    [dynamicCheckboxes, handleDynamicCheckboxChange, openDynamicSheet, handleNavigateTerms]
  );

  const closeError = () => {
    setRbSheetError('')
  };

  const disablIheveRead = () => {
    if (info?.noteType?.toLowerCase() == "dynamic") {
      return (!areAllRequiredCheckboxesChecked())
    } else {
      return !agreeTerms
    }
  };



  return (
    <ViewComponent style={[commonStyles.flex1]}>
      <ScrollViewComponent style={[commonStyles.flex1]}>
        <TextMultiLanguage
          text={cardInfoData[currentNoteIndex]?.title || 'Terms and Conditions'}
          style={[commonStyles.textWhite, commonStyles.fs16, commonStyles.fw700, commonStyles.mb14]}
        />
        {getCurrentNoteItems().length > 0 && (
          <FlatListComponent
            data={getCurrentNoteItems()}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderAgreementItem}
            ItemSeparatorComponent={() => <ViewComponent style={[commonStyles.mt10]} />}
            scrollEnabled={false}
          />
        )}

        {getCurrentNoteItems().length === 0 && cardInfoData.length === 0 && (
          <ViewComponent>
            <RenderHTML
              contentWidth={width}
              source={{ html: (info.note || "")
                .replace(/<label[^>]*>[\s\S]*?<\/label>/gi, '')
                .replace(/<label>/gi, '')
                .replace(/<\/label>/gi, '') }}
              tagsStyles={{
                body: { color: REVERSE_NEW_COLOR.TEXT_WHITE, fontSize: s(14) },
                li: { color: REVERSE_NEW_COLOR.TEXT_WHITE, fontSize: s(12) },
                label: { display: 'none' }
              }}
              renderersProps={{ img: { enableExperimentalPercentWidth: true } }}
              enableExperimentalMarginCollapsing
            />
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.mb16]}>
              <Checkbox
                value={agreeTerms}
                onChange={(value: any) => {
                  setAgreeTerms(value)
                }}
                uncheckedBorderColor={agreeTerms ? NEW_COLOR.TEXT_RED : NEW_COLOR.BORDER_COLOR}
                backgroundColor={NEW_COLOR.BG_YELLOW}
              />
              <ParagraphComponent style={[commonStyles.fs12, commonStyles.getStartedText, commonStyles.fw400, commonStyles.flex1]}>
                {t('GLOBAL_CONSTANTS.ACCEPTING_THE_TERMS_OF_USE')}
                <TextMultiLanguage
                  text="GLOBAL_CONSTANTS.TERMS_OF_USE"
                  style={[commonStyles.text_yellow, commonStyles.fw400]}
                  onPress={handleNavigateTerms}
                />
              </ParagraphComponent>
            </ViewComponent>
          </ViewComponent>
        )}
        {rbSheetError && (<ErrorComponent message={rbSheetError} />)}
      </ScrollViewComponent>

      <ViewComponent style={[commonStyles.sectionGap]} />
      <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.mb10]}>
        <ViewComponent style={[commonStyles.flex1]}>
          <ButtonComponent
            title={"GLOBAL_CONSTANTS.CANCEL"}
            solidBackground={true}
            onPress={onClose}
          />
        </ViewComponent>
        <ViewComponent style={[commonStyles.flex1]}>
          <ButtonComponent
            title={currentNoteIndex < cardInfoData.length - 1 ? "Next" : "GLOBAL_CONSTANTS.IVE_READ"}
            onPress={currentNoteIndex < cardInfoData.length - 1 ? handleNextNote : handleSubmit}
            disable={!areAllRequiredCheckboxesChecked()}
          />
        </ViewComponent>
      </ViewComponent>
      <ViewComponent style={[commonStyles.sectionGap]} />

      <PopupOrSheet
        ref={dynamicRBSheetRef}
        title={currentSheetType === 'esign' ? 'E-Sign Consent' :
          currentSheetType === 'cardterms' ? 'Card Terms' :
            currentSheetType === 'privacy' ? 'Privacy Policy' :
              currentSheetType === 'authorized' ? 'Authorized User Agreement' : 'Document'}
        height={s(600)}
        showCloseIcon={false}
      >
        <ViewComponent style={[commonStyles.flex1]}>
          {rbSheetError && (<ErrorComponent message={rbSheetError} onClose={closeError} />)}

          {((currentSheetType === 'esign' && eSignLoading) ||
            (currentSheetType === 'cardterms' && cardTermsLoading) ||
            (currentSheetType === 'privacy' && privacyPolicyLoading) ||
            (currentSheetType === 'authorized' && authorizedUserLoading)) && (
              <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                <ActivityIndicator size="large" color={NEW_COLOR.BG_YELLOW} />
              </ViewComponent>
            )}

          {!((currentSheetType === 'esign' && eSignLoading) ||
            (currentSheetType === 'cardterms' && cardTermsLoading) ||
            (currentSheetType === 'privacy' && privacyPolicyLoading) ||
            (currentSheetType === 'authorized' && authorizedUserLoading)) && (
              <ScrollViewComponent style={[commonStyles.flex1]}>
                <RenderHTML
                  contentWidth={width}
                  source={{
                    html: (currentSheetType === 'esign' ? eSignContent :
                      currentSheetType === 'cardterms' ? cardTermsContent :
                        currentSheetType === 'privacy' ? privacyPolicyContent :
                          currentSheetType === 'authorized' ? authorizedUserContent : '')
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

          {!((currentSheetType === 'esign' && eSignLoading) ||
            (currentSheetType === 'cardterms' && cardTermsLoading) ||
            (currentSheetType === 'privacy' && privacyPolicyLoading) ||
            (currentSheetType === 'authorized' && authorizedUserLoading)) && (
              <>
                <ViewComponent style={[commonStyles.sectionGap]} />
                <CommonTouchableOpacity onPress={
                  currentSheetType === 'esign' ? () => setESignAgreed(prev => !prev) :
                    currentSheetType === 'cardterms' ? () => setCardTermsAgreed(prev => !prev) :
                      currentSheetType === 'privacy' ? () => setPrivacyPolicyAgreed(prev => !prev) :
                        () => setAuthorizedUserAgreed(prev => !prev)
                }>
                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.mb16]}>
                    <Checkbox
                      value={currentSheetType === 'esign' ? eSignAgreed :
                        currentSheetType === 'cardterms' ? cardTermsAgreed :
                          currentSheetType === 'privacy' ? privacyPolicyAgreed :
                            currentSheetType === 'authorized' ? authorizedUserAgreed : false}
                      onChange={() => {
                        if (currentSheetType === 'esign') {
                          setESignAgreed(prev => !prev);
                        } else if (currentSheetType === 'cardterms') {
                          setCardTermsAgreed(prev => !prev);
                        } else if (currentSheetType === 'privacy') {
                          setPrivacyPolicyAgreed(prev => !prev);
                        } else {
                          setAuthorizedUserAgreed(prev => !prev);
                        }
                      }}
                      size={s(14)}
                      uncheckedBorderColor={(currentSheetType === 'esign' ? eSignAgreed :
                        currentSheetType === 'cardterms' ? cardTermsAgreed :
                          currentSheetType === 'privacy' ? privacyPolicyAgreed :
                            currentSheetType === 'authorized' ? authorizedUserAgreed : false) ? NEW_COLOR.TEXT_RED : NEW_COLOR.BORDER_COLOR}
                      backgroundColor={NEW_COLOR.BG_YELLOW}
                    />
                    <ParagraphComponent
                      text={`${t("GLOBAL_CONSTANTS.I_ACCEPT_THE")} ${currentSheetType === 'esign' ? 'E-Sign Consent' :
                        currentSheetType === 'cardterms' ? 'Card Terms' :
                          currentSheetType === 'privacy' ? 'Privacy Policy' :
                            currentSheetType === 'authorized' ? 'Authorized User Agreement' : 'Document'}`}
                      style={[commonStyles.textWhite,commonStyles.fs14, commonStyles.fw400, commonStyles.flex1]}
                    />
                  </ViewComponent>
                </CommonTouchableOpacity>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.mb10]}>
                  <ViewComponent style={[commonStyles.flex1]}>
                    <ButtonComponent
                      title="GLOBAL_CONSTANTS.CANCEL"
                      onPress={() => dynamicRBSheetRef.current?.close()}
                      solidBackground={true}
                    />
                  </ViewComponent>
                  <ViewComponent style={[commonStyles.flex1]}>
                    <ButtonComponent
                      title="GLOBAL_CONSTANTS.IVE_READ"
                      onPress={handleDynamicRead}
                      disable={!(currentSheetType === 'esign' ? eSignAgreed :
                        currentSheetType === 'cardterms' ? cardTermsAgreed :
                          currentSheetType === 'privacy' ? privacyPolicyAgreed :
                            currentSheetType === 'authorized' ? authorizedUserAgreed : false)}
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
}