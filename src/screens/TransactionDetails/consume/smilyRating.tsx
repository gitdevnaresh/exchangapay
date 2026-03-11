// ConsumptionSimliyRating.js

import React, { useState ,useEffect} from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ConsumptionSimliyRating = ({ rating: initialRating, onRate }:any) => {
  const [rating, setRating] = useState(initialRating);

  useEffect(() => {
    setRating(initialRating); // Update state if parent sends a new rating
  }, [initialRating]);

  const handleRating = (rate:any) => {
    setRating(rate);
    onRate(rate);
  };

  const renderSmiley = (value:any) => {
    let iconName =
      value <= 2 ? 'sad-outline' :
      value <= 4 ? 'happy-outline' : 'happy';

    return (
      <TouchableOpacity key={value} onPress={() => handleRating(value)}>
        <Ionicons
          name={iconName}
          size={40}
          color={rating >= value ? '#E1E31E' : '#FFFFFF'}
          style={styles.icon}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>How's your experience so far?</Text>
      </View>
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map(renderSmiley)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  icon: {
    marginHorizontal: 5,
  }
});

export default ConsumptionSimliyRating;