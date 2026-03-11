import TextMultiLangauge from "../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ViewComponent from "../../../../../components/view/view";
import { s } from "../../../../../constants/styels/scale";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ParagraphComponent from "../../../../../components/textComponets/paragraphText/paragraph";

export const PasswordCriteriaDisplay = ({ password, NEW_COLOR, commonStyles, t }: { password: string | undefined, NEW_COLOR: any, commonStyles: any, t: (key: string) => string }) => {
  const criteriaList = [
    { id: 'length', label: t('GLOBAL_CONSTANTS.PASSWORD_CRITERIA_LENGTH'), test: (p: string) => p.length >= 8 },
    { id: 'lowercase', label: t('GLOBAL_CONSTANTS.PASSWORD_CRITERIA_LOWERCASE'), test: (p: string) => /[a-z]/.test(p) },
    { id: 'uppercase', label: t('GLOBAL_CONSTANTS.PASSWORD_CRITERIA_UPPERCASE'), test: (p: string) => /[A-Z]/.test(p) },
    { id: 'number', label: t('GLOBAL_CONSTANTS.PASSWORD_CRITERIA_NUMBER'), test: (p: string) => /[0-9]/.test(p) },
    { id: 'special', label: t('GLOBAL_CONSTANTS.PASSWORD_CRITERIA_SPECIAL'), test: (p: string) => /[@$!%*?&#]/.test(p) }, // Ensure this regex matches Auth0's allowed special characters
  ];

  const subCriteriaToCount = ['lowercase', 'uppercase', 'number', 'special'];
  const countMetSubCriteria = password ? criteriaList
    .filter(c => subCriteriaToCount.includes(c.id) && c.test(password))
    .length : 0;
  const meetsThreeOfFour = countMetSubCriteria >= 3;
  const colorDefault = (NEW_COLOR.TEXT_COLOR_PRIMARY_DEFAULT ?? (NEW_COLOR.TEXT_NORMAL) ?? commonStyles.textWhite?.color) ?? commonStyles.textWhite;
  return (
    <ViewComponent style={[commonStyles.mt10, commonStyles.sectionGap, commonStyles.gap2]}>
      <ParagraphComponent text={t('GLOBAL_CONSTANTS.PASSWORD_CRITERIA_HEADER')} style={[commonStyles.fs16, commonStyles.fw500, commonStyles.mb5, { color: colorDefault }]} />
      <ViewComponent
        key="threeOfFour"
        style={[
          commonStyles.dflex,
          commonStyles.alignCenter,
          commonStyles.ml10,
          commonStyles.gap8,

        ]}
      >
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4]}>
          <MaterialIcons name="check-circle-outline" size={s(18)} color={meetsThreeOfFour ? NEW_COLOR.TEXT_GREEN : NEW_COLOR.TEXT_WHITE} />
          <TextMultiLangauge
            text={t('GLOBAL_CONSTANTS.PASSWORD_CRITERIA_THREE_OF_FOUR')}
            style={[commonStyles.fs14, { color: meetsThreeOfFour ? NEW_COLOR.TEXT_GREEN : colorDefault }]}
          />
        </ViewComponent>

      </ViewComponent>
      {criteriaList.map((criterion) => {
        const isPotentiallyMet = password && password.length > 0;
        const isMet = isPotentiallyMet && criterion?.test(password);
        return (
          <ViewComponent
            key={criterion.id}
            style={[
              commonStyles.dflex,
              commonStyles.alignCenter,
              commonStyles.mb5,
              { marginLeft: s(20) }
            ]}
          >
            <ViewComponent style={{ marginRight: 5 }}>
              <MaterialIcons name="check-circle-outline" size={s(16)} color={isMet ? NEW_COLOR.TEXT_GREEN : NEW_COLOR.TEXT_WHITE} />
            </ViewComponent>


            <ParagraphComponent
              text={criterion.label}
              style={[commonStyles.fs12, commonStyles.fw400, isMet ? commonStyles.textGreen : commonStyles.textWhite]}
            />
          </ViewComponent>
        );
      })}

    </ViewComponent>
  );
};


export interface SignupBody {
  email: string;      // encrypted email
  password: string;   // encrypted password
  UserName: string;   // encrypted username
}

// Login request body
export interface LoginBody {
  email: string;      // encrypted email
  password: string;   // encrypted password
}