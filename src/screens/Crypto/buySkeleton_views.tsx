import { StyleSheet, View } from "react-native";
import { commonStyles } from "../../components/CommonStyles";
import { Content } from "../../components";

export const ExchangaTransactionsListLoader = (count: number) => {
    let countList =[0];
    if(count){
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View>
        {countList.map((item)=>(
        <View key='item' style={{ ...styles.textSkeleton,width:'100%',height: 45, borderRadius: 6,marginBottom:16 }} />))}
    </View>;
    return html;
};
export const ExchangaTransactionsLoader = () => {
    const html = <View>
    <View style={[commonStyles.dflex,commonStyles.gap24,commonStyles.mb43,commonStyles.justifyContent]}>
    <View style={{...styles.textSkeleton,height:24,width:"50%",borderRadius:5, }} />
    <View style={{...styles.textSkeleton,height:24,width:"20%",borderRadius:5, }} />
    </View>
    <Content
   horizontal
   contentContainerStyle={{}}
 >
     <View style={[commonStyles.dflex,commonStyles.gap16,]}>
     <View style={{...styles.textSkeleton,height:30,width:150,borderRadius:5, }} />
     <View style={{...styles.textSkeleton,height:30,width:150,borderRadius:5, }} />
     <View style={{...styles.textSkeleton,height:30,width:150,borderRadius:5, }} />
     </View>
     </Content>
         <View style={[commonStyles.mb24]} />
     <Content
   horizontal
   contentContainerStyle={{}}
 >
     <View style={[commonStyles.dflex,commonStyles.gap10,]}>
     <View style={{...styles.textSkeleton,height:40,width:150,borderRadius:100, }} />
     <View style={{...styles.textSkeleton,height:40,width:150,borderRadius:100, }} />
     <View style={{...styles.textSkeleton,height:40,width:150,borderRadius:100, }} />
     </View>
     </Content>
     <View style={[commonStyles.mb24]} />
     <View style={{...styles.textSkeleton,height:45,width:"100%",borderRadius:5,marginBottom:16 }} />
     <View style={{...styles.textSkeleton,height:45,width:"100%",borderRadius:5,marginBottom:16 }} />
     <View style={{...styles.textSkeleton,height:45,width:"100%",borderRadius:5,marginBottom:16 }} />
     <View style={{...styles.textSkeleton,height:45,width:"100%",borderRadius:5,marginBottom:16 }} />
     <View style={{...styles.textSkeleton,height:45,width:"100%",borderRadius:5,marginBottom:16 }} />
     <View style={{...styles.textSkeleton,height:45,width:"100%",borderRadius:5,marginBottom:16 }} />
     <View style={{...styles.textSkeleton,height:45,width:"100%",borderRadius:5,marginBottom:16 }} />
     <View style={{...styles.textSkeleton,height:45,width:"100%",borderRadius:5,marginBottom:16 }} />
     <View style={{...styles.textSkeleton,height:45,width:"100%",borderRadius:5,marginBottom:16 }} />
     <View style={{...styles.textSkeleton,height:45,width:"100%",borderRadius:5,marginBottom:16 }} />
     <View style={{...styles.textSkeleton,height:45,width:"100%",borderRadius:5,marginBottom:16 }} />
</View>;

    return html;
};
export const cryptoBackALoader = () => {
    const html = <View>
 <View style={{...styles.textSkeleton,height:30,width:200,marginTop:36,borderRadius:5, }} />
            
    </View>;

    return html;
};
export const cryptoCoinBalance = () => {
    const html = <View>
            <View style={{...styles.textSkeleton,height:17,width:"100%",borderRadius:5,marginTop:10, }} />
            <View style={{...styles.textSkeleton,height:29,width:"100%",borderRadius:5, }} />
            <View style={{...styles.textSkeleton,height:17,width:"100%",borderRadius:5, }} />
    </View>;

    return html;
};
export const cryptoReceiveLoader = () => {
    const html = <View>
 <View style={{...styles.textSkeleton,height:20,width:"100%",borderRadius:5,marginBottom:43, }} />
            <View style={{...styles.textSkeleton,height:20,width:200,borderRadius:100,marginBottom:8, }} />
            <View style={{...styles.textSkeleton,height:60,width:200,borderRadius:100,marginBottom:24, }} />
            <View style={{...styles.textSkeleton,height:60,width:"100%",borderRadius:100,marginBottom:24, }} />
            <View style={{...styles.textSkeleton,height:220,width:220,borderRadius:8,marginRight:"auto",marginLeft:"auto",marginBottom:52, }} />
            <View style={{...styles.textSkeleton,height:20,width:"40%",borderRadius:5, marginRight:"auto",marginLeft:"auto",marginBottom:8,}} />
            <View style={{...styles.textSkeleton,height:24,width:"100%",borderRadius:5,marginBottom:32, }} />
            <View style={{...styles.textSkeleton,height:80,width:"100%",borderRadius:10,marginTop:10,marginBottom:32, }} />
    </View>;

    return html;
};
export const buyPreviewLoader = () => {
    const html = <View>

            <View style={{...styles.textSkeleton,height:140,width:"100%",marginTop:20,borderRadius:10, }} />
            <View style={{...styles.textSkeleton,height:60,width:"100%",marginTop:40,borderRadius:8, }} />
    </View>;

    return html;
};
export const buyExchangeCard = () => {
    const html = <View >
        <View style={{...styles.rectangularSkeleton,height:300,width:"100%",marginTop:40,borderRadius:12, }} />
    </View>;
    return html;
};
export const coinGraph = () => {
    const html = <View >
        <View style={{...styles.rectangularSkeleton,height:300,width:"100%",borderRadius:12, }} />
    </View>;
    return html;
};
export const buyCoinSelect = (count: number) => {
    let countList =[0];
    if(count){
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View>
        {countList.map((item)=>(
        <View key='item' style={{ ...styles.textSkeleton,width:'100%',height: 45, borderRadius: 6,marginBottom:26 }} />))}
    </View>;
    return html;
};
export const sellCoinSelect = (count: number) => {
    let countList =[0];
    if(count){
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View>
        {countList.map((item)=>(
        <View key='item' style={{ ...styles.textSkeleton,width:'100%',height: 56, borderRadius: 100,marginBottom:26 }} />))}
    </View>;
    return html;
};
export const buyonecoincontent = (count: number) => {
    let countList =[0];
    if(count){
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View>
        {countList.map((item)=>(
        <View key='item' style={{ ...styles.textSkeleton,width:'100%',height: 30, borderRadius: 6,marginTop:8}} />))}
    </View>;
    return html;
};
export const Sample = () => {
    // Generate HTML dynamically based on the data
    const html = <View style={styles.container}>
        {/* Skeleton for text */}
        <View style={{ ...styles.textSkeleton }} />

        {/* Skeleton for rectangular box */}
        <View style={styles.rectangularSkeleton} />

        {/* Skeleton for circular shape */}
        <View style={styles.circularSkeleton} />

        {/* Skeleton for image */}
        <View style={styles.imageSkeleton} />

        {/* Skeleton for horizontal line */}
        <View style={styles.horizontalLineSkeleton} />

        {/* Skeleton for vertical line */}
        <View style={styles.verticalLineSkeleton} />
    </View>;

    return html;
};

export const accountTypeSkelton= (count: number) => {
    let countList =[0];
    if(count){
        for (let i = 1; i < count; i++) {
            countList.push(i)
        }
    }
    const html = <View>
        {countList.map((item)=>(
        <View key='item' style={{ ...styles.textSkeleton,width:'100%',height: 160, borderRadius: 16,marginBottom:20 }} />))}
    </View>;
    return html;
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#FFFFFF',
    },
    textSkeleton: {
        height: 16,
        width: '50%',
        marginBottom: 8,
        backgroundColor: '#E1E1E1',
    },
    rectangularSkeleton: {
        height: 80,
        width: '100%',
        marginBottom: 16,
        backgroundColor: '#E1E1E1',
    },
    circularSkeleton: {
        height: 50,
        width: 50,
        borderRadius: 25,
        marginBottom: 16,
        backgroundColor: '#E1E1E1',
    },
    imageSkeleton: {
        height: 200,
        width: '100%',
        marginBottom: 16,
        backgroundColor: '#E1E1E1',
    },
    horizontalLineSkeleton: {
        height: 1,
        width: '100%',
        marginBottom: 16,
        backgroundColor: '#E1E1E1',
    },
    verticalLineSkeleton: {
        height: 80,
        width: 1,
        marginBottom: 16,
        backgroundColor: '#E1E1E1',
    },
});
