import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native"; // Importing navigation hook
import CustomOverlay from "../../../components/commonOverlay";
import ViewComponent from "../../../newComponents/view/view";
import ButtonComponent from "../../../newComponents/buttons/button";
import TextMultiLangauge from "../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import { PurchaseDarkimg } from "../../../assets/svg";
import { s } from "../../../constants/theme/scale";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";

interface VerifyPackageProps {
  isOpen: boolean; 
  onOpen?: () => void; 
  onClose?: () => void; 
}

const VerifyPackage: React.FC<VerifyPackageProps> = ({ isOpen, onOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(isOpen); 
  const navigation = useNavigation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  const handleBack = () => {
    setIsVisible(!isVisible);
    if (onClose) {
      onClose();
    }
  };

  const handleIWillDoIt = () => {
    setIsVisible(false); 
    if (onClose) {
      onClose();
      setIsVisible(false); 
    }
  };

  const handlePurchaseNow = () => {
    navigation.navigate("Packages"); 
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  const packageData = (
    <ViewComponent >
      <PurchaseDarkimg height={s(87)} width={s(131)} style={[commonStyles.mxAuto,commonStyles.mb10]} />
            <TextMultiLangauge text={"GLOBAL_CONSTANTS.YOU_DONT_HAVE_AN_ACTIVE_PACKAGE"} style={[commonStyles.fs18,commonStyles.fw600,commonStyles.textWhite,commonStyles.textCenter,commonStyles.mb4]}/>
            <TextMultiLangauge text={"GLOBAL_CONSTANTS.CHOOSE_A_PACKAGE_AND_START_ENJOY"} style={[commonStyles.fs14,commonStyles.fw400,commonStyles.textGrey,commonStyles.textCenter]}/>
            <ViewComponent style={commonStyles.sectionGap} />
        <ViewComponent style={[commonStyles.dflex,commonStyles.alignCenter,commonStyles.gap10]}> 
            <ViewComponent style={commonStyles.flex1}>
            <ButtonComponent
                 title={"GLOBAL_CONSTANTS.I_WILL_DO_IT"}
                 onPress={handleIWillDoIt}
                 multiLanguageAllows={true}
                 transparent={true}
                 
               />
            </ViewComponent>
            <ViewComponent style={commonStyles.flex1}>
               <ButtonComponent
                 title={"GLOBAL_CONSTANTS.PURCHASE_NOW"}
                 onPress={handlePurchaseNow}
                 multiLanguageAllows={true}
               />
               </ViewComponent>
               </ViewComponent>

    </ViewComponent>
  );


  useEffect(() => {
    if (isVisible && onOpen) {
      onOpen();
    }
  }, [isVisible, onOpen]);

  return (
    <CustomOverlay
      title={"Purchase Package"}
      isVisible={isVisible}
      onClose={handleBack}
      onPressCloseIcon={handleBack}
    >
      {packageData}
    </CustomOverlay>
  );
};

export default VerifyPackage;
