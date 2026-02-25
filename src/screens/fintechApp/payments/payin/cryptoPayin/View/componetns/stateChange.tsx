
import { useEffect, useRef, useState } from "react"
import { Field, Formik } from "formik"
import * as Yup from 'yup';
import ButtonComponent from "../../../../../../../components/buttons/button"
import { useThemeColors } from "../../../../../../../hooks/themedHook/useThemeColors"
import { getThemedCommonStyles } from "../../../../../../../components/CommonStyles"
import { s } from "../../../../../../../components/theme/scale";
import LabelComponent from "../../../../../../../components/textComponets/lableComponent/lable";
import PaymentService from "../../../../../../../apiServices/payments";
import { isErrorDispaly } from "../../../../../../../utils/helpers";
import { PAYMENT_LINK_CONSTENTS } from "../../../../constants";
import CustomRBSheet from "../../../../../../../components/models/commonBottomSheet";
import ViewComponent from "../../../../../../../components/view/view";
import CustomPicker from "../../../../../../../components/customPicker/CustomPicker";

interface StateChangeProps {
  modelOpen: boolean;
  data: any;
  isRefresh: () => void;
  closeModel: () => void;
}

const StateChange = ({ modelOpen, data, isRefresh, closeModel }: StateChangeProps) => {
  const refRBSheet = useRef<any>();
  const [state, setState] = useState({ error: "", statusLu: [], btnLoading: false, modleLoading: false })
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [initialValues, setInitialValues] = useState({
    status: data?.status
  })

  const validationSchema = Yup.object().shape({
    status: Yup.string().required(PAYMENT_LINK_CONSTENTS.STATE_CHANGE.IS_REQUIRED)
  })

  useEffect(() => {
    if (modelOpen) {
      refRBSheet?.current?.open();
    }
    getStatusLu();
  }, [])

  const handleCancel = () => {
    refRBSheet?.current?.close();
    closeModel();
  }
  const onSubmit = async (values: any) => {
    let obj = {
      status: values?.status,

    }
    setState((prev) => ({ ...prev, btnLoading: true }));
    try {
      const response: any = await PaymentService?.invoiceStatusUpdate(data?.id, obj);
      if (response.ok) {
        closeModel();
        isRefresh();
        setState((prev) => ({ ...prev, btnLoading: false }));
      } else {
        setState((prev) => ({ ...prev, error: isErrorDispaly(response?.data) }));
        setState((prev) => ({ ...prev, btnLoading: false }));
      }
    } catch (error) {
      setState((prev) => ({ ...prev, error: isErrorDispaly(error) }));;
      setState((prev) => ({ ...prev, btnLoading: false }));
    }

  }
  const getStatusLu = async () => {
    setState((prev) => ({ ...prev, modleLoading: true }));
    try {
      const statesResponse: any = await PaymentService?.stateChange(PAYMENT_LINK_CONSTENTS.STATE_CHANGE.PAYIN, data?.status);
      if (statesResponse?.data) {
        setState((prev) => ({ ...prev, statusLu: statesResponse?.data }));
        setState((prev) => ({ ...prev, modleLoading: false }));
      } else {
        setState((prev) => ({ ...prev, error: isErrorDispaly(statesResponse?.data) }));
        setState((prev) => ({ ...prev, modleLoading: false }));
      }
    } catch (error) {
      setState((prev) => ({ ...prev, error: isErrorDispaly(error) }));
      setState((prev) => ({ ...prev, modleLoading: false }));
    }

  }
  return (
    <CustomRBSheet
      height={"Small"}
      refRBSheet={refRBSheet}
      onClose={closeModel}

    >
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
        enableReinitialize
        validateOnChange={true}
        validateOnBlur={true}
      >
        {(formik) => {
          const {
            touched,
            handleSubmit,
            errors,
            handleBlur,
          } = formik;

          return (
            <ViewComponent >
              <Field
                modalTitle={"GLOBAL_CONSTANTS.STATE_"}
                activeOpacity={0.9}
                label={"GLOBAL_CONSTANTS.CHANGE_STATUS"}
                touched={touched?.status}
                name={PAYMENT_LINK_CONSTENTS.STATE_CHANGE.STATUS}
                error={errors?.status}
                handleBlur={handleBlur}
                data={state?.statusLu}
                placeholder={
                  PAYMENT_LINK_CONSTENTS.STATE_CHANGE.SELECT_STATUS
                }
                placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                component={CustomPicker}
                requiredMark={
                  <LabelComponent
                    text={" *"}
                    style={[commonStyles.textRed]}
                  />
                }
              />
              <ViewComponent style={commonStyles.sectionGap} />
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>

                <ViewComponent style={[commonStyles.flex1]}>
                  <ButtonComponent
                    title={"GLOBAL_CONSTANTS.CANCEL"}
                    onPress={handleCancel}
                    solidBackground={true}
                  />
                </ViewComponent>
                <ViewComponent style={[commonStyles.flex1]}>
                  <ButtonComponent
                    title={"GLOBAL_CONSTANTS.SAVE"}
                    onPress={handleSubmit}
                    disable={false}
                    loading={state.btnLoading}
                  />
                </ViewComponent>

              </ViewComponent>



            </ViewComponent>
          );
        }}
      </Formik>
    </CustomRBSheet>
  );
}
export default StateChange
