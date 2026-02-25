import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const [shortDimension, longDimension] = width < height
  ? [width, height]
  : [height, width];

const guidelineBaseWidth = 414;
const guidelineBaseHeight = 896;

export const scale = (size:any) => (shortDimension / guidelineBaseWidth) * size;

export const verticalScale = (size:any) =>
  (longDimension / guidelineBaseHeight) * size;

export const moderateScale = (size:any, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export const moderateVerticalScale = (size:any, factor = 0.5) =>
  size + (verticalScale(size) - size) * factor;

export const s = scale;
export const vs = verticalScale;
export const ms = moderateScale;
export const mvs = moderateVerticalScale;
export const screenHeight = height;
export const screenWidth = width;
