import ViewComponent from "../../../newComponents/view/view";
import { s } from "../../../constants/theme/scale";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import ParagraphComponent from "../../../newComponents/textComponets/paragraphText/paragraph";
import { useMemo } from "react";
import { getTabsConfigation } from "../../../../configuration";



export const PasswordCriteriaDisplay = ({ password, NEW_COLOR, commonStyles, t, passwordsMatch }: { password: string | undefined, NEW_COLOR: any, commonStyles: any, t: (key: string) => string, passwordsMatch?: boolean }) => {
  const Configuration: any = useMemo(
    () => getTabsConfigation("PASSWORD_LEVEL"),
    []
  );
  const criteria = Configuration.criteria[Configuration.passwordLevel];

  const criteriaList = [
    { id: 'length', label: t('GLOBAL_CONSTANTS.PASSWORD_CRITERIA_LENGTH').replace('8', criteria.minLength.toString()), test: (p: string) => p.length >= criteria.minLength },
    { id: 'uppercase', label: t('GLOBAL_CONSTANTS.PASSWORD_CRITERIA_UPPERCASE'), test: (p: string) => /[A-Z]/.test(p) },
    { id: 'lowercase', label: t('GLOBAL_CONSTANTS.PASSWORD_CRITERIA_LOWERCASE'), test: (p: string) => /[a-z]/.test(p) },
    { id: 'number', label: t('GLOBAL_CONSTANTS.PASSWORD_CRITERIA_NUMBER'), test: (p: string) => /[0-9]/.test(p) },
    { id: 'special', label: t('GLOBAL_CONSTANTS.PASSWORD_CRITERIA_SPECIAL'), test: (p: string) => /[!@#$%^&*_-]/.test(p) },
    {
      id: 'noRepeat', label: `Avoid ${criteria.maxRecurringChars || 3} or more recurring Characters`, test: (p: string) => {
        const maxRecurring = criteria.maxRecurringChars || 3;
        const pattern = new RegExp(`(.)\\1{${maxRecurring - 1},}`);
        return !pattern.test(p);
      }
    },
  ];

  const subCriteriaToCount = ['lowercase', 'uppercase', 'number', 'special'];
  const countMetSubCriteria = password ? criteriaList
    .filter(c => subCriteriaToCount.includes(c.id) && c.test(password))
    .length : 0;
  const colorDefault = (NEW_COLOR.TEXT_COLOR_PRIMARY_DEFAULT ?? (NEW_COLOR.TEXT_NORMAL) ?? commonStyles.textWhite?.color) ?? commonStyles.textWhite;
  return (
    <ViewComponent style={[commonStyles.mt10, commonStyles.mb5, commonStyles.gap2]}>
      <ViewComponent style={[commonStyles.mt16]}>
        {/* <ParagraphComponent text={t('GLOBAL_CONSTANTS.PASSWORD_CRITERIA_HEADER')} style={[commonStyles.fs16, commonStyles.fw500, commonStyles.mb5, { color: colorDefault }]} /> */}

      </ViewComponent>
      {/* <ViewComponent
        key="threeOfFour"
        style={[
          commonStyles.dflex,
          commonStyles.alignCenter,
          commonStyles.ml10,
          commonStyles.gap8,
          { marginTop: s(4), marginLeft: s(20) }
        ]}
      >
        <MaterialIcons name="check-circle-outline" size={s(18)} color={meetsThreeOfFour ? NEW_COLOR.TEXT_GREEN : NEW_COLOR.TEXT_WHITE} />
        <TextMultiLangauge
          text={t('GLOBAL_CONSTANTS.PASSWORD_CRITERIA_THREE_OF_FOUR')}
          style={[commonStyles.fs14, { color: meetsThreeOfFour ? '#13a688' : colorDefault }]}
        />
      </ViewComponent> */}
      {criteriaList.map((criterion) => {
        const isPotentiallyMet = password && password.length > 0;
        const isMet = isPotentiallyMet && criterion?.test(password);
        const showAsRed = passwordsMatch === false || !isMet;
        const displayColor = passwordsMatch === false ? NEW_COLOR.TEXT_RED : (isMet ? NEW_COLOR.BADGE_APPROVED_TEXT : NEW_COLOR.TEXT_RED);
        const displayTextStyle = passwordsMatch === false ? commonStyles.textRed : (isMet ? commonStyles.textGreen : commonStyles.textRed);
        return (
          <ViewComponent
            key={criterion.id}
            style={[
              commonStyles.dflex,
              commonStyles.alignCenter,
              commonStyles.mb5,
            ]}
          >
            <ViewComponent style={{ marginRight: 5 }}>
              <MaterialIcons name="check-circle-outline" size={s(16)} color={displayColor} />
            </ViewComponent>

            <ParagraphComponent
              text={criterion.label}
              style={[commonStyles.fs12, commonStyles.fw400, displayTextStyle]}
            />
          </ViewComponent>
        );
      })}

    </ViewComponent>
  );
};