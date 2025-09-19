import { StyleSheet } from 'react-native';
import { ms, vs } from '../../constants/theme/scale';
import {  NEW_COLOR} from '../../constants/theme/variables';
import { text } from '../../constants/theme/mixins';

const styles = StyleSheet.create({
  txtMaxAmount: {
    ...text(14, 16, 500, NEW_COLOR.TEXT_WARNING),
  },
  root: {
    flex: 1,
    backgroundColor: NEW_COLOR.BACKGROUND_DARK,
  },
  cardInfo: {
    paddingHorizontal: ms(10),
    paddingTop: ms(20),
    paddingBottom: vs(30),
  },
  btnPreview: {
    // paddingHorizontal: ms(30),
    paddingVertical: ms(30),
  },
  btnPreviewTitle: {
    ...text(14, 19.6, 700, NEW_COLOR.TEXT_PRIMARY),
    textTransform: 'uppercase',
  },
  moneyInput: {
    paddingHorizontal: ms(10),
    marginBottom: vs(24),
  },
  bottomSheetItem: (status) => ({
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ms(18),
    backgroundColor: status ? NEW_COLOR.BACKGROUND_SECONDARY_2 : NEW_COLOR.BACKGROUND_PRIMARY_1,
  }),
  bottomSheetItemIcon: {
    width: ms(48),
    height: ms(48),
    borderRadius: 24,
    marginRight: vs(25),
  },
  bottomSheetItemTitle: {
    ...text(14, 16.8, 400, NEW_COLOR.TEXT_LIGHT),
  },
  bottomSheetItemDescription: {
    ...text(14, 16.8, 400, NEW_COLOR.TEXT_LIGHT),
  },
  lastBottomSheetItem: {
    borderBottomWidth: 0,
  },
  bottomSheetSpace: {
    height: vs(22),
    width: '100%',
  },
  walletSelectLabel: {
    ...text(12, 18, 700, NEW_COLOR.TEXT_LIGHT),
    textTransform: 'uppercase',
    marginBottom: ms(10),
  },
  walletSelectContainer: {
    paddingHorizontal: ms(10),
    marginBottom: ms(16),
  },
  walletSelect: {
    borderColor: NEW_COLOR.BORDER_SECONDARY_1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: ms(40),
    paddingVertical: ms(40),
  },
  walletSelectPlaceholder: {
    ...text(14, 19.6, 400, NEW_COLOR.TEXT_SECONDARY),
    width: '100%',
  },
  walletSelected: {
    ...text(14, 19.6, 400, NEW_COLOR.TEXT_LIGHT),
    width: '100%',
  },
  walletSelectIcon: {
    width: 12,
    height: 8,
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{
      translateY: 10,
    }],
  },
  note: {
    ...text(12, 14.8, 400, NEW_COLOR.TEXT_LIGHT),
    marginBottom: ms(12),
    textAlign: 'center',
  },
  warningNote: {
    color: NEW_COLOR.TEXT_WARNING,
  },
  line: {
    height: 0.5,
    backgroundColor: NEW_COLOR.BORDER_PRIMARY,
    marginHorizontal: ms(10),
    marginVertical: ms(10),
  },
  emptyListText: {
    ...text(14, 16.8, 400, NEW_COLOR.TEXT_LIGHT),
    textAlign: 'center',
    paddingVertical: ms(18),
  },
});

export default styles;
