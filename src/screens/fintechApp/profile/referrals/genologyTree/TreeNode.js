import React, { useState } from 'react';
import { StyleSheet, Image, View } from 'react-native';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import { s } from '../../../../../constants/styels/scale';
import ViewComponent from '../../../../../components/view/view';
import CommonTouchableOpacity from '../../../../../components/touchableComponents/touchableOpacity';
import GradientSkeleton from '../../../../../components/skelton/skeleton.component';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';

// Make sure you have a placeholder image in your assets folder
// To create this folder:
// 1. In your project's root, create a folder named `assets`.
// 2. Save a placeholder image (e.g., a simple user icon) as `placeholder.png` inside it.
const placeholderImage = require('../../../../../assets/images/profile/avathar.png')

// --- CONFIGURATION ---
// You can easily change the indentation width here
const INDENTATION_WIDTH = 30;

const TreeNodeSkeleton = ({ level, count, treeStyles }) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  const skeletonStyles = StyleSheet.create({
    image: {
      width: s(50),
      height: s(50),
      borderRadius: s(25),
      marginRight: s(12),
    },
    textLine1: {
      height: s(16),
      width: '70%',
      borderRadius: 4,
      marginBottom: s(8),
    },
    textLine2: {
      height: s(14),
      width: '50%',
      borderRadius: 4,
    },
  });

  // Create an array to map over for rendering multiple skeletons. Show max 3.
  const skeletons = Array.from({ length: Math.min(count, 3) });

  return (
    <>
      {skeletons.map((_, index) => (
        <ViewComponent key={index} style={[commonStyles.dflex, commonStyles.alignCenter, { paddingVertical: s(8) }]}>
          <ViewComponent style={{ width: level * INDENTATION_WIDTH }}>
            {level > 0 && <View style={treeStyles.horizontalLine} />}
          </ViewComponent>
          <ViewComponent style={[commonStyles.flex1, commonStyles.dflex, commonStyles.alignCenter]}>
            <GradientSkeleton style={skeletonStyles.image} />
            <ViewComponent style={commonStyles.flex1}>
              <GradientSkeleton style={skeletonStyles.textLine1} />
              <GradientSkeleton style={skeletonStyles.textLine2} />
            </ViewComponent>
          </ViewComponent>
        </ViewComponent>
      ))}
    </>
  );
};

const TreeNode = ({ node, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isBranch = node.genealogies && node.genealogies.length > 0;

  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  const handlePress = () => {
    if (isBranch) {
      if (!isExpanded) { // When expanding
        setIsLoading(true);
        setIsExpanded(true);
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      } else { // When collapsing
        setIsExpanded(false);
      }
    }
  };

  // Component-specific styles that depend on theme or are too unique for common styles.
  const treeStyles = StyleSheet.create({
    image: {
      width: s(50),
      height: s(50),
      borderRadius: s(25),
      backgroundColor: '#e0e0e0', // A light grey for placeholders
      marginRight: s(12),
    },
    toggleIcon: {
      fontSize: s(20),
      color: NEW_COLOR.TEXT_GREEN, // Using a theme color for the action icon
      fontWeight: 'bold',
      paddingHorizontal: s(15),
    },
    childrenContainer: {
      position: 'relative', // Necessary for the absolute positioning of the vertical line
    },
    // Horizontal line connecting a node to the vertical line
    horizontalLine: {
      position: 'absolute',
      top: '50%', // Center vertically
      right: 0,
      width: INDENTATION_WIDTH / 2, // Half the indentation width
      height: 1,
      backgroundColor: '#c0c0c0',
    },
    // Main vertical line connecting a parent to all its children
    verticalLine: {
      position: 'absolute',
      top: -8, // Start slightly above to connect properly
      bottom: 0,
      width: 1,
      backgroundColor: '#c0c0c0',
    },
  });

  return (
    <ViewComponent>
      {/* Container for a single node's display row */}
      <CommonTouchableOpacity style={[commonStyles.dflex, commonStyles.alignCenter, { paddingVertical: s(8) }]} onPress={handlePress} activeOpacity={0.7}>

        {/* === KEY CHANGE 1: Indentation and Connector Lines === */}
        {/* This view acts as a spacer and holds the lines. Its width increases with depth. */}
        <ViewComponent style={{ width: level * INDENTATION_WIDTH }}>
          {/* Draw a horizontal line connecting to the parent's vertical line */}
          {level > 0 && <ViewComponent style={treeStyles.horizontalLine} />}
        </ViewComponent>

        {/* === KEY CHANGE 2: Node Content === */}
        {/* This view holds the actual content and DOES NOT shrink. It takes the remaining space. */}
        <ViewComponent style={[commonStyles.flex1, commonStyles.dflex, commonStyles.alignCenter]}>
          <Image
            source={node.image ? { uri: node.image } : placeholderImage}
            style={treeStyles.image}
          />
          <ViewComponent style={commonStyles.flex1}>
            <ParagraphComponent text={node.name} style={[commonStyles.fs16, commonStyles.fwBold, commonStyles.textWhite]} numberOfLines={1} ellipsizeMode="tail" />
            <ParagraphComponent text={`Members: ${node.membersCount}`} style={[commonStyles.fs14, commonStyles.textGrey]} />
          </ViewComponent>
        </ViewComponent>

        {/* Toggle Icon */}
        {isBranch && (
          <ParagraphComponent text={isExpanded ? '[-]' : '[+]'} style={treeStyles.toggleIcon} />
        )}
      </CommonTouchableOpacity>

      {/* --- Recursive Rendering of Children --- */}
      {isExpanded && isBranch && (
        <ViewComponent style={treeStyles.childrenContainer}>
          {/* The long vertical line that connects all children in this block */}
          <ViewComponent style={[treeStyles.verticalLine, { left: level * INDENTATION_WIDTH + s(24) }]} />

          {isLoading ? (
            <TreeNodeSkeleton level={level + 1} count={node.genealogies.length} treeStyles={treeStyles} />
          ) : (
            node.genealogies.map((childNode) => (
              <TreeNode key={childNode.id} node={childNode} level={level + 1} />
            ))
          )}
        </ViewComponent>
      )}
    </ViewComponent>
  );
};

export default TreeNode;