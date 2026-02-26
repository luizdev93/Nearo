import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_PADDING = spacing.lg * 2;
const CARD_WIDTH_2COL = (SCREEN_WIDTH - spacing.lg * 3) / 2;
const CARD_WIDTH_1COL = SCREEN_WIDTH - HORIZONTAL_PADDING;

type SkeletonVariant = 'card' | 'list' | 'avatar' | 'horizontalCard';

interface LoadingSkeletonProps {
  variant: SkeletonVariant;
  /** Full width for single column layout */
  fullWidth?: boolean;
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
export function LoadingSkeleton({ variant, fullWidth }: LoadingSkeletonProps) {
  const pulse = usePulse();

  if (variant === 'card') {
    const cardWidth = fullWidth ? CARD_WIDTH_1COL : CARD_WIDTH_2COL;
    const aspectRatio = fullWidth ? 4 / 3 : 1;
    return (
      <Animated.View style={[styles.card, { opacity: pulse, width: cardWidth }]}>
        <View style={[styles.cardImage, { aspectRatio }]} />
        <View style={styles.cardInfo}>
          <View style={styles.lineShort} />
          <View style={styles.lineLong} />
          <View style={styles.lineMedium} />
        </View>
      </Animated.View>
    );
  }

  if (variant === 'horizontalCard') {
    return (
      <Animated.View style={[styles.horizontalCard, { opacity: pulse }]}>
        <View style={styles.horizontalCardImage} />
        <View style={styles.horizontalCardContent}>
          <View style={[styles.lineShort, styles.horizontalLine]} />
          <View style={[styles.lineLong, styles.horizontalLine]} />
          <View style={[styles.lineMedium, styles.horizontalLine]} />
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
export function LoadingSkeletonGrid({ count = 4, fullWidth, horizontal }: { count?: number; fullWidth?: boolean; horizontal?: boolean }) {
  return (
    <View style={[styles.grid, (fullWidth || horizontal) && styles.gridSingle]}>
      {Array.from({ length: count }).map((_, i) => (
        <LoadingSkeleton key={i} variant={horizontal ? 'horizontalCard' : 'card'} fullWidth={fullWidth} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  cardImage: {
    width: '100%',
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
  gridSingle: {
    flexDirection: 'column',
  },
  horizontalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.card,
    backgroundColor: colors.surface,
  },
  horizontalCardImage: {
    width: 96,
    height: 72,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
  },
  horizontalCardContent: {
    flex: 1,
    gap: 6,
  },
  horizontalLine: {
    height: 12,
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
