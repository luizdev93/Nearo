import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';

const CARD_WIDTH = (Dimensions.get('window').width - spacing.lg * 3) / 2;

export function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.image} />
      <View style={styles.info}>
        <View style={styles.priceLine} />
        <View style={styles.titleLine} />
        <View style={styles.locationLine} />
      </View>
    </Animated.View>
  );
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  image: {
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: colors.backgroundSecondary,
  },
  info: {
    padding: spacing.sm,
    gap: 6,
  },
  priceLine: {
    width: '40%',
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.backgroundSecondary,
  },
  titleLine: {
    width: '80%',
    height: 12,
    borderRadius: 4,
    backgroundColor: colors.backgroundSecondary,
  },
  locationLine: {
    width: '50%',
    height: 10,
    borderRadius: 4,
    backgroundColor: colors.backgroundSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
});
