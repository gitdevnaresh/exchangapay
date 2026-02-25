
import React from "react"
import { FeePhysicalCardApplyProps } from "../constants"
import ViewComponent from "../../../../../components/view/view"
import CardDynamicFieldRenderer from "../../common/cardDynamicFieldRenderer"

const FeePhysicalCardApply: React.FC<FeePhysicalCardApplyProps> = ({ handleBlur, values, setFieldValue, handleChange, touched, errors, dynamicFields = [] }) => {
    return (

        <ViewComponent>
            <CardDynamicFieldRenderer
                fields={dynamicFields}
                values={values}
                errors={errors}
                touched={touched}
                setFieldValue={setFieldValue}
                handleChange={handleChange}
                handleBlur={handleBlur}
            />
        </ViewComponent>
    )
}
export default FeePhysicalCardApply;