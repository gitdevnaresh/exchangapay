import React from "react";
import Loadding from "../skeleton";
import { View, FlatList } from "react-native";
import NoDataComponent from "../nodata";
import { commonStyles } from "../CommonStyles";
import ParagraphComponent from "../Paragraph/Paragraph";
// import { kpisSkelton } from "../../screens/Profile/skeleton_views";

interface KpiItem {
    id?: string | number; // Make 'id' optional to reflect potential undefined values
    name: string;
    value: number | string;
    isCount?: boolean;
}

interface CommonListProps {
    data: KpiItem[];
    loading?: boolean;
    error?: string | null;
    clearError?: React.Dispatch<React.SetStateAction<string>>;
}

const ListItemSeparator = () => {
    return <View style={[commonStyles.mb14]} />;
};

const KpiComponent = ({
    data,
    loading,
    clearError,
}: CommonListProps) => {
    // const transactionCard = kpisSkelton(1);

    const renderItem = ({ item, index }: { item: KpiItem, index: number }) => {
        const isTotal = item.name.toLowerCase() === 'total';
        return (
            <View key={item.id?.toString() ?? index.toString()} style={[commonStyles.bgCard, isTotal ? commonStyles.fw200 : commonStyles.flex1, commonStyles.p12, commonStyles.pl16, commonStyles.rounded16]}>
                <View>
                    <ParagraphComponent
                        style={[commonStyles.textAlwaysWhite, commonStyles.fs14, commonStyles.fw500, commonStyles.mb5]}
                        text={(item?.name) || ""}
                    />
                    {item?.isCount && <ParagraphComponent style={[commonStyles.textAlwaysWhite, commonStyles.fs14, commonStyles.fw500]} text={item?.value ?? 0} />}
                    {/* {!item?.isCount && <CurrencyText style={[commonStyles.textWhite, commonStyles.fs22, commonStyles.fw600]} prifix={userInfo?.currency} value={parseFloat(String(item?.value ?? 0)) || 0} />} */}
                </View>
            </View>
        );
    }

    const renderContent = () => {
        // if (loading) {
        //     return <Loadding contenthtml={transactionCard} />;
        // }
        if (data.length > 0) {
            const totalItem = data.find(item => item.name.toLowerCase() === 'total');
            const otherItems = data.filter(item => item.name.toLowerCase() !== 'total');

            return (
                <View>
                    {/* Total item - full width */}
                    {totalItem && (
                        <View style={[commonStyles.mb14]}>
                            {renderItem({ item: totalItem, index: 0 })}
                        </View>
                    )}

                    {/* Other items - 2 columns */}
                    {otherItems.length > 0 && (
                        <FlatList
                            data={otherItems}
                            keyExtractor={(item: KpiItem, index: number) => item.id?.toString() ?? index.toString()}
                            renderItem={renderItem}
                            ItemSeparatorComponent={ListItemSeparator}
                            columnWrapperStyle={{ columnGap: 14 }}
                            numColumns={2}
                            NoData={<NoDataComponent />}
                        />
                    )}
                </View>
            );
        }
        return <NoDataComponent />;
    };
    return (
        <View>
            {renderContent()}
        </View>
    );
};

export default KpiComponent;
