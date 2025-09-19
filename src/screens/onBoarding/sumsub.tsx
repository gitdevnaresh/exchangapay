import React, { useState } from 'react';
import { View, Image, TextInput, Button, Alert } from 'react-native';
import { StyleService, useStyleSheet } from "@ui-kitten/components";
import { Container, Text } from "../../components";

const FillSumsub = () => {
    const styles = useStyleSheet(themedStyles);

  return (
    <Container style={styles.container}>
      <View style={styles.content}>
        <Image
          style={styles.yblogo}
          source={require("../../assets/images/yblogo.png")}
        />
<Text style={{color:'white'}}>Mobile verification</Text>
        
      </View>
      
    </Container>
  );
};

export default FillSumsub;

const themedStyles = StyleService.create({
    yblogo: {
      marginRight: "auto",
      marginLeft: "auto",
    },
    btnset: {
      marginTop: 50,
    },
    container: {
      flex: 1,
      backgroundColor: "#000000",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    button: {
      marginBottom: 24,
      borderRadius: 5,
    },
    content: {
      paddingHorizontal: 24,
      flex: 1,
    },
  });
