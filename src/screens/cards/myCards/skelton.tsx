import React from 'react';
import { View } from 'react-native';
import { s } from '../../../newComponents/theme/scale';


const skeletonColor = "#ECF1F7";
const skeletonHighlight = '#333';

export const cardsInfoDetails = () => (
  
  <View style={{ paddingHorizontal: s(12), paddingTop: s(30) }}>
    {/* Card Skeleton */}
    {/* Action Icons Skeleton */}
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: s(24),
        paddingHorizontal: s(8),
      }}
    >
      {[1, 2, 3, 4].map((_, idx) => (
        <View key={idx} style={{ alignItems: 'center' }}>
          <View
            style={{
              width: s(55),
              height: s(55),
              borderRadius: s(27.5),
              backgroundColor: skeletonColor,
              marginBottom: s(8),
            }}
          />
          <View
            style={{
              width: s(40),
              height: s(12),
              borderRadius: s(6),
              backgroundColor: skeletonColor,
            }}
          />
        </View>
      ))}
    </View>

    {/* Wallet Buttons Skeleton */}
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: s(28),
        gap: s(12),
        paddingTop:s(20)
      }}
    >
      {[1, 2].map((_, idx) => (
        <View
          key={idx}
          style={{
            flex: 1,
            height: s(55),
            borderRadius: s(15),
            backgroundColor: skeletonColor,
            marginHorizontal: s(4),
          }}
        />
      ))}
    </View>

    {/* Transactions Section Skeleton */}
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: s(16) }}>
      <View
        style={{
          width: s(110),
          height: s(35),
          borderRadius: s(4),
          backgroundColor: skeletonColor,
        }}
      />
      <View style={{ flex: 1 }} />
      <View
        style={{
          width: s(24),
          height: s(24),
          borderRadius: s(12),
          backgroundColor: skeletonColor,
          marginRight: s(12),
        }}
      />
      <View
        style={{
          width: s(24),
          height: s(24),
          borderRadius: s(12),
          backgroundColor: skeletonColor,
        }}
      />
    </View>

    {/* Transactions Placeholder Skeleton */}
    <View
      style={{
        width: '100%',
        height: s(180),
        borderRadius: s(16),
        backgroundColor: skeletonColor,
        marginBottom: s(16),
      }}
    />
  </View>
);