import React from "react";
import { SafeAreaView, ScrollView } from 'react-native';
import TreeNode from './TreeNode';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import { s } from '../../../../../constants/styels/scale';
import ViewComponent from '../../../../../components/view/view';

// Import your data
import genealogyData from './genealogydata.json';

const GenealogyTree = () => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  return (
    <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
      <ScrollView contentContainerStyle={{ padding: s(10) }}>

        {/* Start rendering the tree from the root node */}
        <TreeNode node={genealogyData} level={0} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default GenealogyTree;