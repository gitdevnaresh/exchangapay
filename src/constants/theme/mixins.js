import { ms } from './scale';
import { NEW_COLOR } from './variables';

export const text = (
  fontSize = 14,
  lineHeight = 16.8,
  fontWeight = 400,
  color = NEW_COLOR.TEXT_LIGHT,
  hasLineHeight = false,
) => {
  const formatted = {
    fontSize  : ms(fontSize),
    lineHeight: ms(lineHeight),
    fontWeight: `${fontWeight}`,
    color,
  };

  if (hasLineHeight) {
    delete formatted.lineHeight;
  }

  return formatted;
};
