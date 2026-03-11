import PopupOrSheet, { PopupOrSheetRef } from "../models/PopupOrSheet";
import { s } from "../theme/scale";
import ViewComponent from "../view/view";
import GalleryIcon from "../../assets/mainmenuicons/galleryicon copy";
import TextMultiLanguage from "../textComponets/multiLanguageText/textMultiLangauge";
import Entypo from '@expo/vector-icons/Entypo';
import { Feather } from "@expo/vector-icons";
import CommonTouchableOpacity from "../touchableComponents/touchableOpacity";
import { getThemedCommonStyles } from "../../assets/styles/CommonStyles";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useLngTranslation } from "../../hooks/useLngTranslation";

const ImageSourcePopup = ({
  imageSourceSheetRef,
  onSelectImage,
}: {    
  imageSourceSheetRef: React.RefObject<PopupOrSheetRef>;
  onSelectImage: (source: 'camera' | 'library') => void;
}) => {
    const NEW_COLOR =useThemeColors();
    const REVERSE_NEW_COLOR = useThemeColors(true);
    const {t}=useLngTranslation();
    const reverseCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return (         
 <PopupOrSheet
          height={s(240)}
          title={t("GLOBAL_CONSTANTS.SELECT_OPTION") || "Select Option"}
          ref={imageSourceSheetRef}
        >
          <ViewComponent>
            <ViewComponent>
              <CommonTouchableOpacity onPress={() => {
                imageSourceSheetRef.current?.close();
                setTimeout(() => {
                  onSelectImage('library');
                }, 300);
              }}
                style={[]} // Add this style to center children horizontally
              >
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { width: '100%', paddingHorizontal: 2, },]}>
                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                    <ViewComponent style={[commonStyles.quicklinks, commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mb5, reverseCommonStyles.bottomsheeticonbg]}>
                      <GalleryIcon width={s(18)} height={s(18)} color={REVERSE_NEW_COLOR.TEXT_WHITE} />
                    </ViewComponent>
                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.CHOOSE_FROM_GALLERY"} style={[commonStyles.fs14, commonStyles.fw500, reverseCommonStyles.textWhite]} />
                  </ViewComponent>
                  <Entypo name="chevron-small-right" size={s(24)} color={REVERSE_NEW_COLOR.TEXT_WHITE} />
                </ViewComponent>
              </CommonTouchableOpacity>
              <ViewComponent style={[commonStyles.listGap]} />
              <CommonTouchableOpacity onPress={() => {
                imageSourceSheetRef.current?.close();
                setTimeout(() => {
                  onSelectImage('camera');
                }, 300);
              }}
              >
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { width: '100%', paddingHorizontal: 2, },]} >
                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                    <ViewComponent style={[commonStyles.mb5, reverseCommonStyles.bottomsheeticonbg]}>
                      <Feather name="camera" size={s(18)} color={REVERSE_NEW_COLOR.TEXT_WHITE} />
                    </ViewComponent>
                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.TAKE_PHOTO"} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.dflex, reverseCommonStyles.textWhite]} />
                  </ViewComponent>
                  <Entypo name="chevron-small-right" size={s(24)} color={REVERSE_NEW_COLOR.TEXT_WHITE} />
                </ViewComponent>
              </CommonTouchableOpacity>
            </ViewComponent>
            <ViewComponent style={[commonStyles.mb16]} />
          </ViewComponent>
        </PopupOrSheet>
    );
};

export default ImageSourcePopup;