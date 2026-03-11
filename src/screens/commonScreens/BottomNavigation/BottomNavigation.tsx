import React from 'react';
import { useNavigation } from '@react-navigation/native';
import ViewComponent from '../../../newComponents/view/view';
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import { Ionicons } from '@expo/vector-icons';
import { s } from '../../../newComponents/theme/scale';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import ReferIcon from '../../../assets/mainmenuicons/referIcon';
import CardIcon from '../../../assets/mainmenuicons/cardIcon';
import HomeIcon from '../../../assets/mainmenuicons/homeIcon';

interface BottomNavigationProps {
  activeTab?: 'home' | 'cards' | 'perks' | 'launchpad';
  onTabPress?: (tabName: string) => void;
  customStyle?: any;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  activeTab , 
  onTabPress,
  customStyle 
}) => {
  const navigation = useNavigation<any>();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  const handleTabPress = (tabName: string) => {
    if (onTabPress) {
      onTabPress(tabName);
    } else {
      switch (tabName) {
        case 'home':
            navigation.navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.HOME" });
          break;
        case 'cards':
            navigation.navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.CARDS" });
          break;
         case 'rewards':
             navigation.navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.TAB_REWARDS" });
          break;
           case 'refer':
             navigation.navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.REFER" });

          break;
        case 'perks':
            navigation.navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.PERKS" });
          break;
        default:
          break;
      }
    }
  };

  const getTabIcon = (tabName: string, isActive: boolean) => {
    const iconColor = isActive ? NEW_COLOR.TEXT_WHITE : NEW_COLOR.ICON_GREY;
    const iconSize = (s(24));

    switch (tabName) {
      case 'home':
        return <HomeIcon color={iconColor} style={[commonStyles.mxAuto]} />;
      case 'perks':
        return <Ionicons name="gift-outline" size={iconSize} color={iconColor} />;
         case 'cards':
        return <CardIcon color={iconColor} style={[commonStyles.mxAuto]} />;
        case 'rewards':
          return <Ionicons name="gift-outline" size={iconSize} color={iconColor} />;
        case 'refer':
          return <ReferIcon color={iconColor} style={[commonStyles.mxAuto]} />; 
      // case 'launchpad':
      //   return <MaterialIcons name="apps" size={iconSize} color={iconColor} />;
       default:
        return null;
    }
  };

  const tabs = [
    { name: 'home', label: 'Home' },
    { name: 'rewards', label: 'Rewards' },
    { name: 'refer', label: 'Refer' },
    { name: 'cards', label: 'Cards' }
  ];

  return (
    <ViewComponent 
      style={[
        {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: NEW_COLOR.SCREENBG_BLACK,
          borderTopWidth: 1,
          borderTopColor: NEW_COLOR.MENU_HALF_SHADE_BORDER,
          height: s(60) + 10,
          paddingBottom: s(10),
          paddingTop: s(5),
        },
        customStyle
      ]}
    >
      <ViewComponent style={[commonStyles.dflex, commonStyles.justifyAround, commonStyles.alignCenter, { height: '100%' }]}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name;
          return (
            <CommonTouchableOpacity 
              key={tab.name}
              onPress={() => handleTabPress(tab.name)}
              activeOpacity={0.8}
            >
              <ViewComponent style={[commonStyles.alignCenter]}>
                {getTabIcon(tab.name, isActive)}
                <ParagraphComponent 
                  text={tab.label} 
                  style={[
                    commonStyles.fs14,
                    commonStyles.fw500,
                    commonStyles.textCenter,
                    {
                      color: isActive ? NEW_COLOR.TEXT_WHITE : NEW_COLOR.TEXT_GREY,
                    },
                    commonStyles.mt2
                  ]} 
                />
              </ViewComponent>
            </CommonTouchableOpacity>
          );
        })}
      </ViewComponent>
    </ViewComponent>
  );
};

export default BottomNavigation; 