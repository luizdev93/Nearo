import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';

const CARD_WIDTH = (Dimensions.get('window').width - spacing.lg * 3) / 2;

type SkeletonVariant = 'card' | 'list' | 'avatar';

interface LoadingSkeletonProps {
  variant: SkeletonVariant;
}

function usePulse() {
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
  }, [opacity]);
  return opacity;
}

/** Placeholder loading — card (grid), list row, or avatar. */
export function LoadingSkeleton({ variant }: LoadingSkeletonProps) {
  const pulse = usePulse();

  if (variant === 'card') {
    return (
      <Animated.View style={[styles.card, { opacity: pulse }]}>
        <View style={styles.cardImage} />
        <View style={styles.cardInfo}>
          <View style={styles.lineShort} />
          <View style={styles.lineLong} />
          <View style={styles.lineMedium} />
        </View>
      </Animated.View>
    );
  }

  if (variant === 'list') {
    return (
      <Animated.View style={[styles.listRow, { opacity: pulse }]}>
        <View style={styles.listAvatar} />
        <View style={styles.listContent}>
          <View style={[styles.lineLong, styles.listLine]} />
          <View style={[styles.lineMedium, styles.listLine]} />
        </View>
      </Animated.View>
    );
  }

  if (variant === 'avatar') {
    return (
      <Animated.View style={[styles.avatarWrap, { opacity: pulse }]}>
        <View style={styles.avatarCircle} />
      </Animated.View>
    );
  }

  return null;
}

/** Grid of card skeletons (e.g. for feed). */
export function LoadingSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <LoadingSkeleton key={i} variant="card" />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  cardImage: {
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: colors.backgroundSecondary,
  },
  cardInfo: {
    padding: spacing.sm,
    gap: 6,
  },
  lineShort: {
    width: '40%',
    height: 14,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.backgroundSecondary,
  },
  lineLong: {
    width: '80%',
    height: 12,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.backgroundSecondary,
  },
  lineMedium: {
    width: '50%',
    height: 10,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.backgroundSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  listAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundSecondary,
  },
  listContent: {
    flex: 1,
    gap: 6,
  },
  listLine: {
    height: 14,
  },
  avatarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.backgroundSecondary,
  },
});
