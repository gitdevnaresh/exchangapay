import React from 'react';
import { StyleSheet, View } from 'react-native';
import DefaultButton from "../components/DefaultButton";
import ParagraphComponent from './Paragraph/Paragraph';
import TitleComponent from './Paragraph/TitleComponent';
import ErrorComponent from './Error';
import { ms } from '../constants/theme/scale';
import { NEW_COLOR } from '../constants/theme/variables';


interface ConfirmModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  remark: string;
  amount: string;
  setAmount: (amount: string) => void;
  setRemark: (remark: string) => void;
  btnLoading: boolean;
  btndisabled: boolean;
  erroMsg: string;
  errorAmt: string;
  stateErrorMsg: string;
  setStateErrorMsg: () => void;
}

const LockedModal = ({
  visible = false,
  onCancel,
  onConfirm,
  title,
  remark,
  setRemark,
  amount,
  setAmount,
  btnLoading,
  erroMsg,
  errorAmt,
  stateErrorMsg,
  setStateErrorMsg,
  btndisabled,
}: ConfirmModalProps) => {
  if (!visible) return null;

  return (
    <View style={styles.modalBackground}>
      <View style={styles.modalContainer}>
        {typeof stateErrorMsg === 'string' && (
          <View style={styles.px16}>
            <ErrorComponent message={stateErrorMsg} onClose={() => setStateErrorMsg()} />
          </View>
        )}
        <TitleComponent fontFamily='InriaSans-Bold' text={'Exchanga Pay is locked'} style={styles.modalTitle} />
        <View>
          <ParagraphComponent
            text="Authntication is required to access the Exchanga Pay App"
            style={[styles.mb4, styles.description]}
          />
        </View>

        <View style={styles.buttonContainer}>

          <DefaultButton
            icon="lock"
            loading={btnLoading}
            disable={btnLoading}
            // customStyle={[styles.fillbtn, styles.ml16, btndisabled ? styles.disabledButton : null]}
            // btnColor={styles.textWhite}
            title={"Unlock Now"}
            onPress={onConfirm}
          />

        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  btnRadius: {
    borderRadius: 5,
  },
  description: {
    textAlign: "center",
    fontSize: ms(14), color: NEW_COLOR.TEXT_GREY, paddingHorizontal: 16
  },
  textWhite: {
    color: NEW_COLOR.TEXT_WHITE,
  },
  ml16: {
    marginLeft: 16,
  },
  mb4: {
    marginBottom: 4,
  },
  inputHeight: {},
  btnColor: {
    color: '#000',
  },
  disabledButton: {
    backgroundColor: '#888',
    borderRadius: 5,
    paddingVertical: 4,
    opacity: 0.7,
    color: '#FFF',
  },
  px16: {
    paddingHorizontal: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  cancelBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E1E5EC',
    borderRadius: 5,
  },
  fillbtn: {
    backgroundColor: 'transparent',
    borderRadius: 5,
    paddingVertical: 4,
  },
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: ms(18),
    marginBottom: 16,
    textAlign: 'center',
    color: NEW_COLOR.TEXT_DARK
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default LockedModal;
