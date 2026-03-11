# BottomNavigation Component

A reusable bottom navigation component that can be used across different detail screens in the MLM Mobile UI app.

## Features

- Consistent styling with the app's theme
- Support for 4 tabs: Home, Cards, Perks, and Launchpad
- Customizable active tab highlighting
- Optional custom navigation handlers
- Responsive design with proper scaling

## Usage

### Basic Usage

```tsx
import BottomNavigation from '../../../newComponents/BottomNavigation';

// In your component
<BottomNavigation activeTab="home" />
```

### With Custom Navigation Handler

```tsx
import BottomNavigation from '../../../newComponents/BottomNavigation';

const MyScreen = () => {
  const handleTabPress = (tabName: string) => {
    // Custom navigation logic
    switch (tabName) {
      case 'home':
        navigation.navigate('CustomHome');
        break;
      case 'cards':
        navigation.navigate('CustomCards');
        break;
      // ... other cases
    }
  };

  return (
    <View>
      {/* Your screen content */}
      <BottomNavigation 
        activeTab="cards" 
        onTabPress={handleTabPress}
      />
    </View>
  );
};
```

### With Custom Styling

```tsx
import BottomNavigation from '../../../newComponents/BottomNavigation';

<BottomNavigation 
  activeTab="perks" 
  customStyle={{
    height: s(80),
    paddingBottom: s(20)
  }}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `activeTab` | `'home' \| 'cards' \| 'perks' \| 'launchpad'` | `'home'` | The currently active tab |
| `onTabPress` | `(tabName: string) => void` | `undefined` | Custom handler for tab press events |
| `customStyle` | `any` | `undefined` | Additional styles to apply to the container |

## Default Navigation Behavior

If no `onTabPress` handler is provided, the component will use these default navigation routes:

- **Home**: `navigation.navigate('Dashboard')`
- **Cards**: `navigation.navigate('ComingSoon')`
- **Perks**: `navigation.navigate('ComingSoon')`
- **Launchpad**: `navigation.navigate('ComingSoon')`

## Styling

The component automatically uses the app's theme colors and common styles. It includes:

- Proper positioning (absolute, bottom)
- Theme-based background and border colors
- Responsive height using the scale function
- Consistent icon and text styling

## Icons Used

- **Home**: MaterialIcons "home"
- **Cards**: MaterialIcons "credit-card"
- **Perks**: Ionicons "gift-outline"
- **Launchpad**: MaterialIcons "apps" 