import React from 'react';
import { View } from 'react-native';
import ViewComponent from '../view/view';

interface Route {
    key: string;
    [key: string]: any;
}

interface NavigationState<T extends Route> {
    index: number;
    routes: T[];
}

interface SceneRendererProps<T extends Route> {
    route: T;
}

interface TabBarProps<T extends Route> {
    navigationState: NavigationState<T>;
}

interface CustomTabViewProps<T extends Route> {
    navigationState: NavigationState<T>;
    renderScene: (props: SceneRendererProps<T>) => React.ReactNode;
    renderTabBar: (props: TabBarProps<T>) => React.ReactNode;
    onIndexChange: (index: number) => void;
    lazy?: boolean;
    lazyPreloadDistance?: number; // Note: This prop is ignored in this simplified implementation
    style?: any;
    initialLayout?: { width: number }; // Note: This prop is ignored in this simplified implementation
}

const CustomTabView = <T extends Route>({
    navigationState,
    renderScene,
    renderTabBar,
    lazy,
    style,
}: CustomTabViewProps<T>) => {
    const { index: activeIndex, routes } = navigationState;
    const [loadedIndexes, setLoadedIndexes] = React.useState<number[]>([activeIndex]);

    React.useEffect(() => {
        if (lazy && !loadedIndexes.includes(activeIndex)) {
            setLoadedIndexes(prev => [...prev, activeIndex]);
        }
    }, [activeIndex, lazy, loadedIndexes]);

    return (
        <ViewComponent style={[{ flex: 1 }, style]}>
            {renderTabBar({ navigationState })}
            <View style={{ flex: 1 }}>
                {routes.map((route, i) => {
                    const isFocused = i === activeIndex;

                    if (lazy && !loadedIndexes.includes(i)) {
                        return <View key={route.key} />;
                    }

                    return (
                        <View key={route.key} style={[{ flex: 1 }, { display: isFocused ? 'flex' : 'none' }]}>
                            {renderScene({ route })}
                        </View>
                    );
                })}
            </View>
        </ViewComponent>
    );
};

export const SceneMap = (scenes: { [key: string]: React.ComponentType<any> }) => {
  return ({ route }: { route: { key: string } }) => {
    const SceneComponent = scenes[route.key];
    return SceneComponent ? <SceneComponent /> : null;
  };
};

export default CustomTabView;

