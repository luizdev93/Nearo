import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradientPrimary } from '../../theme';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface ChatBubbleProps {
  message: string;
  isMine: boolean;
  timestamp: string;
}

/** Message bubble — gradient for mine, light gray for other; radius 20. */
export function ChatBubble({ message, isMine, timestamp }: ChatBubbleProps) {
  return (
    <View style={[styles.wrapper, isMine && styles.wrapperMine]}>
      {isMine ? (
        <LinearGradient
          colors={[...gradientPrimary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.bubble, styles.bubbleMine]}
        >
          <Text style={styles.textMine}>{message}</Text>
        </LinearGradient>
      ) : (
        <View style={[styles.bubble, styles.bubbleOther]}>
          <Text style={styles.textOther}>{message}</Text>
        </View>
      )}
      <Text style={styles.timestamp}>{timestamp}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    marginVertical: spacing.xs,
    maxWidth: '85%',
  },
  wrapperMine: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  bubble: {
    padding: spacing.md,
    borderRadius: borderRadius.bubble,
    maxWidth: '100%',
  },
  bubbleMine: {
    borderBottomRightRadius: borderRadius.sm,
  },
  bubbleOther: {
    backgroundColor: colors.surfaceSecondary,
    borderBottomLeftRadius: borderRadius.sm,
  },
  textMine: {
    ...typography.body,
    color: colors.textInverse,
  },
  textOther: {
    ...typography.body,
    color: colors.text,
  },
  timestamp: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
});
